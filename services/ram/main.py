"""
RAM inference service for NitNot head-lice checker.

- RAM: image → label (lice | nits | dandruff | clear) + confidence.
  If setup_ram.py has been run (checkpoint + recognize-anything installed), uses real RAM.
  Otherwise returns a stub result.
- Optional: DeepSeek API to generate user-facing explanation from image + RAM result.
"""
import os
import base64
import io
from typing import Literal

import httpx
from fastapi import FastAPI, File, HTTPException, UploadFile

Label = Literal["lice", "nits", "dandruff", "clear"]

app = FastAPI(title="NitNot RAM Service")

DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY")
DEEPSEEK_BASE = os.environ.get("DEEPSEEK_API_BASE", "https://api.deepseek.com")
RAM_CHECKPOINT = os.environ.get(
    "RAM_CHECKPOINT",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "pretrained", "ram_swin_large_14m.pth"),
)

# Keywords from RAM tag string → our labels (order matters: more specific first)
TAG_KEYWORDS: list[tuple[Label, list[str]]] = [
    ("nits", ["nit", "nits", "egg", "eggs"]),
    ("lice", ["lice", "louse", "insect", "parasite", "bug", "head lice"]),
    ("dandruff", ["dandruff", "dandruffs", "flake", "flakes", "scalp", "dry skin", "dry scalp"]),
]


def _tags_to_label(tag_string: str) -> tuple[Label, float]:
    """Map RAM tag string to our label and a simple confidence."""
    tag_string_lower = tag_string.lower()
    tags = [t.strip().lower() for t in tag_string_lower.split("|")]
    for label, keywords in TAG_KEYWORDS:
        for kw in keywords:
            if any(kw in t for t in tags) or kw in tag_string_lower:
                return label, 0.85
    return "clear", 0.9


_ram_model = None
_ram_transform = None


def _load_ram():
    global _ram_model, _ram_transform
    if _ram_model is not None:
        return True
    if not os.path.isfile(RAM_CHECKPOINT):
        return False
    try:
        import torch
        from PIL import Image
    from ram.models import ram
    from ram import get_transform
    except ImportError:
        return False
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    _ram_transform = get_transform(image_size=384)
    _ram_model = ram(pretrained=RAM_CHECKPOINT, image_size=384, vit="swin_l")
    _ram_model.eval()
    _ram_model = _ram_model.to(device)
    return True


def run_ram_inference(image_bytes: bytes) -> tuple[Label, float]:
    """Run RAM if available; otherwise stub."""
    if not _load_ram():
        # Stub when RAM not set up
        _ = image_bytes
        return "clear", 0.9

    import torch
    from PIL import Image

    device = next(_ram_model.parameters()).device
    pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image_tensor = _ram_transform(pil).unsqueeze(0).to(device)
    with torch.no_grad():
        tag_en, _tag_zh = _ram_model.generate_tag(image_tensor)
    tag_string = tag_en[0] if isinstance(tag_en, (list, tuple)) else str(tag_en)
    return _tags_to_label(tag_string)


def get_explanation_from_deepseek(image_b64: str, label: Label, confidence: float) -> str | None:
    """Optional: call DeepSeek vision API to generate a short, disclaimer-friendly explanation."""
    if not DEEPSEEK_API_KEY:
        return None
    prompt = (
        f"Our image classifier returned: {label} (confidence {confidence:.0%}). "
        "Write one short, reassuring paragraph for the user. "
        "Emphasise this is indicative only and they should see a professional for confirmation. "
        "Keep it under 3 sentences. Do not diagnose."
    )
    try:
        with httpx.Client(timeout=15.0) as client:
            r = client.post(
                f"{DEEPSEEK_BASE.rstrip('/')}/v1/chat/completions",
                headers={"Authorization": f"Bearer {DEEPSEEK_API_KEY}"},
                json={
                    "model": "deepseek-chat",
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {
                                    "type": "image_url",
                                    "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"},
                                },
                            ],
                        }
                    ],
                    "max_tokens": 200,
                },
            )
            r.raise_for_status()
            out = r.json()
            return out.get("choices", [{}])[0].get("message", {}).get("content")
    except Exception:
        return None


@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image")
    label, confidence = run_ram_inference(image_bytes)
    explanation = None
    if DEEPSEEK_API_KEY:
        b64 = base64.standard_b64encode(image_bytes).decode("ascii")
        explanation = get_explanation_from_deepseek(b64, label, confidence)
    return {
        "label": label,
        "confidence": confidence,
        "explanation": explanation,
    }


@app.get("/health")
def health():
    ram_loaded = _ram_model is not None or (os.path.isfile(RAM_CHECKPOINT) and _load_ram())
    return {"status": "ok", "ram_loaded": ram_loaded}
