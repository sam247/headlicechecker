"""
Head lice scan inference API. Loads a YOLO model and exposes POST /predict
with the contract expected by headlicechecker.com (label, confidence, detections in pixel coords).
"""
import base64
import io
import os
from typing import Any, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Optional: set to path to your trained best.pt; else uses pretrained for structure
MODEL_PATH = os.environ.get("SCAN_MODEL_PATH", "yolov8n.pt")
# Minimum confidence (0–1) for a box to be returned; reduces false positives
MIN_CONFIDENCE = float(os.environ.get("SCAN_MIN_CONFIDENCE", "0.4"))

# Class names from your trained model must map to these labels (index or name)
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


app = FastAPI(title="Scan inference", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

_model = None


def get_model():
    global _model
    if _model is None:
        from ultralytics import YOLO
        _model = YOLO(MODEL_PATH)
    return _model


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
    results = model.predict(pil, verbose=False)

    detections_out: list[DetectionOut] = []
    top_confidence = 0.0
    top_label: LabelType = "clear"

    for r in results:
        if r.boxes is None:
            continue
        for box in r.boxes:
            conf = float(box.confidence[0])
            if conf < MIN_CONFIDENCE:
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
