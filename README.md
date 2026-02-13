# NitNot — Head Lice Photo Checker

Next.js front end for the NitNot head lice photo checker and clinic finder. Users upload photos for a quick check and can find their nearest professional clinic.

## Stack

- **Next.js 14** (App Router), React 18, TypeScript
- **Tailwind CSS**, shadcn/ui (Radix)
- **Photo scan API** (`/api/scan`) — fine-tuned model (when configured), DeepSeek vision, or stub

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — run ESLint

## Scan: fine-tuned model or DeepSeek or stub

**Recommended — your fine-tuned model:**

1. Host your detection API (e.g. Replicate, Hugging Face Inference, or your own server) that accepts POST with an image and returns `{ label, confidence?, explanation? }`.
2. Set `DETECTION_API_URL` to that base URL. The app calls `{DETECTION_API_URL}/predict` with JSON `{ image: base64 }`. Labels: `lice`, `nits`, `dandruff`, `psoriasis`, `clear`.

**Interim — DeepSeek vision:**

1. Get an API key at [DeepSeek Platform](https://platform.deepseek.com).
2. In `.env.local`: `DEEPSEEK_API_KEY=sk-...`
3. Deploy to Vercel and set `DEEPSEEK_API_KEY` in the project env. `/api/scan` will use DeepSeek vision to classify and explain in one call.

If neither is set, `/api/scan` returns a random stub so the app still works.

**Diagnostics:** `GET /api/scan/status` returns `{ configured: boolean, provider: 'finetuned' | 'deepseek' | 'stub' }` (no keys or secrets).

**Image size:** For consistent detection, the app guides users to use at least 640px on the shortest side. Images are resized client-side to 1024px on the long edge before upload. The API rejects images with either dimension below 320px.

## Deploying to Vercel

You can deploy the Next.js app to Vercel with **no local runs**. Vercel runs the front end and `/api/scan` only.

- **Recommended:** Set `DETECTION_API_URL` and/or `DEEPSEEK_API_KEY` in Vercel. Detection uses the fine-tuned endpoint first, then DeepSeek.
- **Stub:** Leave both unset. Scan results are random placeholders.

## Project structure

- `app/` — layout, pages, `/api/scan` and `/api/scan/status` routes
- `components/` — UI and features (PhotoChecker, ClinicFinder, etc.)
- `lib/`, `hooks/` — utilities and hooks
