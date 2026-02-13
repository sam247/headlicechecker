# NitNot RAM service

- **RAM**: Image → label (`lice` | `nits` | `dandruff` | `clear`) + confidence. Uses [Recognize Anything Model](https://github.com/xinyu1205/recognize-anything) when set up; otherwise returns a stub.
- **DeepSeek**: Optional. Set `DEEPSEEK_API_KEY` in `.env` for AI-generated explanations.

## One-time setup and run

From this directory (`services/ram`):

```bash
python setup_ram.py
```

This downloads the RAM checkpoint (~1.5GB) and installs the `recognize-anything` package and deps. Then start the service:

```bash
uvicorn main:app --reload --port 8000
```

Optional: copy `.env.example` to `.env` and set `DEEPSEEK_API_KEY` for explanations.

In the Next.js app root, set `RAM_SERVICE_URL=http://localhost:8000` (e.g. in `.env.local`).

## Without running setup

If you don’t run `setup_ram.py`, the service still runs: it returns a **stub** result (e.g. "clear") so you can test the app. Run `python setup_ram.py` when you want real RAM inference.
