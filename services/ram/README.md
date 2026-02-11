# NitNot RAM service

- **RAM**: Image → label (`lice` | `nits` | `dandruff` | `clear`) + confidence. Run and optionally fine-tune [Recognize Anything Model](https://github.com/xinyu1205/recognize-anything) (or RAM++) for these classes.
- **DeepSeek**: Optional. Called **from this service** (not inside RAM) to generate a user-facing explanation from the image + RAM result. Set `DEEPSEEK_API_KEY` to enable.

## Run locally

```bash
cd services/ram
cp .env.example .env   # then add your DEEPSEEK_API_KEY to .env for AI-generated explanations
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Then in the Next.js app root create `.env.local` with:

```env
RAM_SERVICE_URL=http://localhost:8000
```

## Replace stub with real RAM

1. Clone RAM repo, install deps, download weights.
2. In `main.py`, implement `run_ram_inference(image_bytes)` to load the model (once), preprocess the image, run forward, map logits to `Label` and return `(label, confidence)`.
