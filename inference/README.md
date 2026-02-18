# Scan inference service (YOLO without Roboflow)

This service runs a YOLO model for head-lice scan inference. The Next.js app calls it when `DETECTION_API_URL` is set (e.g. `https://your-inference.example.com`). No Roboflow account required.

## Getting it working on the live site

The **Next.js app** runs on Vercel (or your host). The **inference service** (this repo) must run somewhere else: Vercel is serverless and can’t keep a loaded model or long-lived process. You deploy this service to a host that gives a **public HTTPS URL**, then point the app at it.

**Steps:**

1. **Bundle your trained model in the image**  
   From the repo root, copy your best weights into `inference/`, then bake them into the Docker image:
   ```bash
   cp runs/detect/train2/weights/best.pt inference/best.pt
   cd inference
   ```
   In `Dockerfile`, uncomment and keep:
   ```dockerfile
   COPY best.pt /app/best.pt
   ENV SCAN_MODEL_PATH=/app/best.pt
   ```
   Build: `docker build -t scan-inference .`

2. **Deploy the container**  
   Push the image to a registry and run it on a host that exposes HTTPS. Examples:
   - **Render:** New Web Service → Connect repo or use Docker; set start command to run the container; note the URL (e.g. `https://scan-inference.onrender.com`).
   - **Fly.io:** `fly launch` in the `inference/` directory (add a simple `fly.toml` if needed), then `fly deploy`.
   - **Railway:** New project → Deploy from GitHub; use Dockerfile in `inference/`; add `best.pt` via build or volume.
   - **Modal / RunPod:** Deploy as a serverless or persistent container; use the assigned URL.

3. **Configure the live app**  
   In **Vercel** (or your Next.js host): Project → Settings → Environment Variables. Add:
   - **Name:** `DETECTION_API_URL`  
   - **Value:** your inference URL with no trailing slash, e.g. `https://scan-inference.onrender.com`  
   Redeploy the Next.js app so the new env is picked up.

4. **Check it**  
   On the live site, run a scan. The app will `POST` the image to `DETECTION_API_URL/predict` and show detections. You can also hit `https://your-inference-url/health` to confirm the service is up.

**Summary:** Inference service (with `best.pt`) runs on Render/Fly/Railway/etc.; live site has `DETECTION_API_URL` set to that service’s URL; scans use your YOLO model in production.

## Contract

- **Request:** `POST /predict` with JSON: `{ "image": "<base64>", "width": number, "height": number }` (width/height optional).
- **Response:** `{ "label": "lice"|"nits"|"dandruff"|"psoriasis"|"clear", "confidence": number, "explanation": null, "detections": [ { "label", "confidence", "x", "y", "width", "height" } ], "image_width", "image_height" }`. Coordinates are **pixels, center-based** for overlay circles.

## Run locally

```bash
cd inference
pip install -r requirements.txt
# Optional: set your trained model
export SCAN_MODEL_PATH=path/to/best.pt
python main.py
# or: uvicorn main:app --reload --port 8000
```

Then set `DETECTION_API_URL=http://localhost:8000` in `.env.local` for local testing (Vercel cannot call localhost; use a tunnel or deploy the service).

## Docker

```bash
docker build -t scan-inference .
# With your trained model:
# COPY best.pt into the image or mount: -v /path/to/best.pt:/app/best.pt -e SCAN_MODEL_PATH=/app/best.pt
docker run -p 8000:8000 scan-inference
```

Deploy the image to Fly.io, Railway, RunPod, Modal, or any host that can run Docker and expose HTTPS.

## Training path (use your own labels, no Roboflow)

1. **Label data**  
   Use [Makesense](https://makesense.ai) or [Label Studio](https://labelstudio.com): draw bounding boxes and assign classes (lice, nits, dandruff, psoriasis). Export in **YOLO format** (one `.txt` per image: `class_id x_center y_center width height` normalized 0–1).

2. **Dataset layout**  
   Create a folder with `images/` and `labels/`, and a `data.yaml` for Ultralytics:
   ```yaml
   path: .
   train: images/train
   val: images/val
   names:
     0: lice
     1: nits
     2: dandruff
     3: psoriasis
   ```

3. **Train**  
   ```bash
   yolo detect train data=path/to/data.yaml model=yolov8n.pt epochs=50
   ```
   Run locally (GPU) or on Google Colab / RunPod. Output: `runs/detect/train/weights/best.pt`.

4. **Use in this service**  
   Set `SCAN_MODEL_PATH` to `best.pt` (or copy it into the Docker image and set the env var). Class names in `data.yaml` must match: lice, nits, dandruff, psoriasis so the API returns the expected labels.

## Env

| Variable | Description |
|----------|-------------|
| `SCAN_MODEL_PATH` | Path to YOLO weights (e.g. `best.pt`). Default: `yolov8n.pt` (pretrained; replace with your trained model). |
| `SCAN_MIN_CONFIDENCE` | Minimum confidence (0–1) for a detection to be returned; default `0.4`. Raise to reduce false positives (e.g. `0.5`). |
| `PORT` | Server port (default 8000). |
