"""
Head lice scan inference API. Loads a YOLO model and exposes POST /predict
with the contract expected by headlicechecker.com (label, confidence, detections in pixel coords).
"""
import base64
import io
import logging
import os
import time
from contextlib import asynccontextmanager
from typing import Any, Literal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

MODEL_PATH = os.environ.get("SCAN_MODEL_PATH", "yolov8n.pt")
MIN_CONFIDENCE = float(os.environ.get("SCAN_MIN_CONFIDENCE", "0.25"))
# Match training resolution (Ultralytics default 640); smaller = faster but nits can be missed
INFER_IMGSZ = int(os.environ.get("SCAN_INFER_IMGSZ", "640"))

VALID_LABELS = ("lice", "nits", "dandruff", "psoriasis")
LabelType = Literal["lice", "nits", "dandruff", "psoriasis", "clear"]


def normalize_label(raw: Any) -> LabelType:
    if not raw:
        return "clear"
    s = str(raw).lower().strip()
    if s in VALID_LABELS:
        return s  # type: ignore
    if s in ("nit",):
        return "nits"
    if s in ("head lice", "louse", "lice detected"):
        return "lice"
    if s in ("no lice", "none", ""):
        return "clear"
    return "clear"


class PredictRequest(BaseModel):
    image: str = Field(..., description="Base64-encoded image")
    base64: str | None = None
    width: int | None = None
    height: int | None = None


class DetectionOut(BaseModel):
    label: str
    confidence: float
    x: float
    y: float
    width: float
    height: float


class PredictResponse(BaseModel):
    label: LabelType
    confidence: float
    explanation: str | None = None
    detections: list[DetectionOut] = Field(default_factory=list)
    image_width: int | None = None
    image_height: int | None = None


_model = None


def _load_model():
    global _model
    from ultralytics import YOLO

    t0 = time.monotonic()
    _model = YOLO(MODEL_PATH)
    # Warm the model with a tiny dummy image so PyTorch JIT / first-run overhead is paid here
    from PIL import Image as _PILImage
    _model.predict(_PILImage.new("RGB", (64, 64)), imgsz=64, verbose=False)
    logger.info("model loaded and warmed in %.1fs  path=%s", time.monotonic() - t0, MODEL_PATH)


def get_model():
    if _model is None:
        _load_model()
    return _model


@asynccontextmanager
async def lifespan(app: FastAPI):
    _load_model()
    yield


app = FastAPI(title="Scan inference", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    image_b64 = req.base64 or req.image
    raw = base64.b64decode(image_b64.split(",")[-1] if "," in image_b64 else image_b64)
    img = io.BytesIO(raw)
    try:
        from PIL import Image
        pil = Image.open(img).convert("RGB")
        w, h = pil.size
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}")

    model = get_model()
    t0 = time.monotonic()
    results = model.predict(pil, imgsz=INFER_IMGSZ, verbose=False)
    infer_ms = (time.monotonic() - t0) * 1000
    logger.info("inference took %.0fms  imgsz=%d  image=%dx%d", infer_ms, INFER_IMGSZ, w, h)

    detections_out: list[DetectionOut] = []
    top_confidence = 0.0
    top_label: LabelType = "clear"
    raw_box_count = 0
    below_threshold_count = 0

    for r in results:
        if r.boxes is None:
            continue
        for box in r.boxes:
            raw_box_count += 1
            conf = float(box.confidence[0])
            if conf < MIN_CONFIDENCE:
                below_threshold_count += 1
                continue
            cls_id = int(box.cls[0])
            # Model class names: use r.names if available else assume 0=lice, 1=nits, 2=dandruff, 3=psoriasis
            names = getattr(r, "names", {0: "lice", 1: "nits", 2: "dandruff", 3: "psoriasis"})
            label_str = names.get(cls_id, "lice")
            label = normalize_label(label_str)
            if label == "clear":
                continue
            xyxy = box.xyxy[0]
            x1, y1, x2, y2 = float(xyxy[0]), float(xyxy[1]), float(xyxy[2]), float(xyxy[3])
            cx = (x1 + x2) / 2
            cy = (y1 + y2) / 2
            bw = x2 - x1
            bh = y2 - y1
            if conf > top_confidence:
                top_confidence = conf
                top_label = label
            detections_out.append(
                DetectionOut(
                    label=label,
                    confidence=conf,
                    x=cx,
                    y=cy,
                    width=max(bw, 4),
                    height=max(bh, 4),
                )
            )

    # Sort by confidence descending
    detections_out.sort(key=lambda d: d.confidence, reverse=True)

    logger.info(
        "predict result image=%dx%d raw_boxes=%d below_min_conf=%d min_conf=%.2f returned=%d label=%s top_conf=%.3f",
        w, h, raw_box_count, below_threshold_count, MIN_CONFIDENCE, len(detections_out),
        top_label if detections_out else "clear", top_confidence,
    )

    return PredictResponse(
        label=top_label if detections_out else "clear",
        confidence=top_confidence if detections_out else 0.0,
        explanation=None,
        detections=detections_out,
        image_width=w,
        image_height=h,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "8000")))
