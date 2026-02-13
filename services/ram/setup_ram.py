#!/usr/bin/env python3
"""
One-time setup: download RAM checkpoint and install the recognize-anything package + deps.
Run from services/ram:  python setup_ram.py
"""
import os
import subprocess
import sys

SERVICE_DIR = os.path.dirname(os.path.abspath(__file__))
PRETRAINED_DIR = os.path.join(SERVICE_DIR, "pretrained")
CHECKPOINT_NAME = "ram_swin_large_14m.pth"
CHECKPOINT_PATH = os.path.join(PRETRAINED_DIR, CHECKPOINT_NAME)


def run(cmd: list, cwd: str = None) -> None:
    subprocess.run(cmd, cwd=cwd or SERVICE_DIR, check=True)


def main() -> None:
    os.makedirs(PRETRAINED_DIR, exist_ok=True)

    if os.path.isfile(CHECKPOINT_PATH):
        print(f"Checkpoint already at {CHECKPOINT_PATH}")
    else:
        print("Downloading RAM checkpoint (may take a few minutes)...")
        run([sys.executable, "-m", "pip", "install", "-q", "huggingface_hub"])
        from huggingface_hub import hf_hub_download
        # Checkpoint is in the HF Space (not the model repo)
        hf_hub_download(
            repo_id="xinyu1205/recognize-anything",
            filename=CHECKPOINT_NAME,
            local_dir=PRETRAINED_DIR,
            repo_type="space",
        )
        print("Checkpoint downloaded.")

    print("Installing PyTorch and RAM dependencies...")
    run([sys.executable, "-m", "pip", "install", "-q", "torch", "torchvision", "Pillow"])
    run([sys.executable, "-m", "pip", "install", "-q", "git+https://github.com/xinyu1205/recognize-anything.git"])

    print("Installing NitNot service deps...")
    run([sys.executable, "-m", "pip", "install", "-q", "-r", os.path.join(SERVICE_DIR, "requirements.txt")])

    print("Setup complete. Start the service with:")
    print("  uvicorn main:app --reload --port 8000")
    print("Then set RAM_SERVICE_URL=http://localhost:8000 in your Next.js app.")


if __name__ == "__main__":
    main()
