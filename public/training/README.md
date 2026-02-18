# Head-lice scan training data (YOLO)

- **Images:** `images/train/` (add more `.jpg` here).
- **Labels:** `labels/train/` — one `.txt` per image, same base name; format: `class_id x_center y_center width height` (normalized 0–1). Classes: `0` = lice, `1` = nits.
- **Config:** `data.yaml` (path, train/val, `nc`, `names`).

Install once (if needed), then train from repo root. Use the `yolo` script (pip installs it to a path that may not be on PATH):

```bash
pip3 install ultralytics
# Use the script’s full path so the correct Python/env is used:
"$HOME/Library/Python/3.9/bin/yolo" detect train data=public/training/data.yaml model=yolov8n.pt epochs=50
```

Output: `runs/detect/train/weights/best.pt`. Use that in `inference/` via `SCAN_MODEL_PATH` and set `DETECTION_API_URL` in the app.

**Note:** If you add new images in the top-level `public/training/` folder (as from Makesense export), copy the matching `.jpg` and `.txt` into `images/train/` and `labels/train/` so they are used for training.

### Improving detection

- **More data:** The model was trained on very few images. Add many more (50–200+) with nits and lice on different hair colours and lighting; include “clear” examples too. Retrain and replace `best.pt`.
- **Sensitivity:** If the model returns “clear” but you see nits, it may be outputting low-confidence boxes that get filtered out. Lower thresholds: set `SCAN_MIN_CONFIDENCE=0.2` (or lower) on Render, and/or reduce `DETECTION_API_MIN_CONFIDENCE` in the scan route. Check Render logs for `raw_boxes` vs `returned` to see if boxes are being dropped.
- **Image quality:** Ensure uploads are close-up, well lit, and at least 640px on the shortest side so the model gets usable input.
