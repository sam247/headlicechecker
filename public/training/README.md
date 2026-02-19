# Head-lice scan training data (YOLO)

- **Images:** `images/train/` (10 images with lice/nits)
- **Labels:** `labels/train/` — one `.txt` per image, same base name; format: `class_id x_center y_center width height` (normalized 0–1). Classes: `0` = lice, `1` = nits.
- **Config:** `data.yaml` (path, train/val, `nc`, `names`).

## Training

Run from repo root:

```bash
"$HOME/Library/Python/3.9/bin/yolo" detect train data=public/training/data.yaml model=yolov8n.pt epochs=100 imgsz=640
```

Output: `runs/detect/train/weights/best.pt`. Copy to `inference/best.pt` and redeploy the inference service.

**Note:** With only 10 images, the model may still have false negatives. Consider:
- Adding more training images (50–200+ recommended)
- Lowering `SCAN_MIN_CONFIDENCE` to 0.15–0.2 if detections are being filtered out
- Using data augmentation during training
