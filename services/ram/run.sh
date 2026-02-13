#!/usr/bin/env bash
# Run setup if checkpoint missing, then start the service.
cd "$(dirname "$0")"
if [ ! -f "pretrained/ram_swin_large_14m.pth" ]; then
  echo "First run: setting up RAM (download + install). This may take a few minutes."
  python3 setup_ram.py
fi
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
