# NitNot — Head Lice Photo Checker

Next.js front end for the NitNot head lice photo checker and clinic finder. Users upload photos for a quick check and can find their nearest professional clinic.

## Stack

- **Next.js 14** (App Router), React 18, TypeScript
- **Tailwind CSS**, shadcn/ui (Radix)
- **Photo scan API** (`/api/scan`) — DeepSeek vision (recommended), optional Python RAM service, or stub

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — run ESLint

## Scan: DeepSeek (recommended) or RAM or stub

**Recommended — DeepSeek only (no Python, no extra services):**

1. Get an API key at [DeepSeek Platform](https://platform.deepseek.com).
2. In `.env.local`: `DEEPSEEK_API_KEY=sk-...`
3. Deploy to Vercel and set `DEEPSEEK_API_KEY` in the project env. `/api/scan` will use DeepSeek vision to classify the image and generate a short, disclaimer-friendly explanation in one call.

**Optional — Python RAM service (legacy, more dependencies):**

**RAM_SERVICE_URL** is the URL of the Python service in `services/ram`. You run that service yourself (locally or on a host).

1. One-time setup: `cd services/ram && python3 setup_ram.py` (downloads checkpoint + deps).
2. Start: `uvicorn main:app --reload --port 8000` or `./services/ram/run.sh`.
3. Set `RAM_SERVICE_URL=http://localhost:8000`. If `DEEPSEEK_API_KEY` is set, the app uses DeepSeek first and does not call RAM.

If neither is set, `/api/scan` returns a random stub so the app still works.

## Deploying to Vercel

You can deploy the Next.js app to Vercel with **no local runs**. Vercel only runs the front end and `/api/scan`; it does not run Python or download the RAM model.

- **Recommended:** Set `DEEPSEEK_API_KEY` in Vercel. Real classification + explanation, no Python service.
- **Stub:** Leave both unset. Scan results are random placeholders.
- **Legacy:** Host the RAM service elsewhere and set `RAM_SERVICE_URL` (skipped if `DEEPSEEK_API_KEY` is set).

**How many times do we download things?**

- **Vercel:** Never. No model or checkpoint is downloaded on Vercel.
- **RAM service:** The checkpoint (~1.5GB) and deps are downloaded when that service is **built or first started** on its host. So: once per new environment (e.g. once per Render service), and again on each **redeploy** only if the host does a full rebuild with no cache. To make it sustainable, use a host that caches the checkpoint (e.g. Docker image with the checkpoint baked in, or a persistent volume) so redeploys don’t re-download.

## Project structure

- `app/` — layout, pages, `/api/scan` route
- `components/` — UI and features (PhotoChecker, ClinicFinder, etc.)
- `services/ram/` — Python FastAPI service; run `python setup_ram.py` once then `uvicorn main:app --port 8000` (or use `run.sh`)
- `lib/`, `hooks/` — utilities and hooks
