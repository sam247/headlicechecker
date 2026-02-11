"""
RAM inference service for NitNot head-lice checker.

- RAM: image → label (lice | nits | dandruff | clear) + confidence.
- Optional: DeepSeek API (vision) to generate user-facing explanation from image + RAM result.
  DeepSeek is called from here, alongside RAM — not "inside" RAM.
"""
import os
import base64
from typing import Literal

import httpx
from fastapi import FastAPI, File, HTTPException, UploadFile

Label = Literal["lice", "nits", "dandruff", "clear"]

app = FastAPI(title="NitNot RAM Service")

DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY")
DEEPSEEK_BASE = os.environ.get("DEEPSEEK_API_BASE", "https://api.deepseek.com")


def run_ram_inference(image_bytes: bytes) -> tuple[Label, float]:
    """
    Run RAM (Recognize Anything Model) on image.
    Replace this with real RAM inference (load model, preprocess, forward).
    """
    # Stub: return deterministic stub based on size for demo
    # TODO: load RAM/RAM++ and run real inference; fine-tune for lice/nits/dandruff/clear
    _ = image_bytes
    return "clear", 0.9


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
    return {"status": "ok"}
