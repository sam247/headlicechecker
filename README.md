# NitNot — Head Lice Photo Checker

Next.js front end for the NitNot head lice photo checker and clinic finder. Users upload photos for a quick check and can find their nearest professional clinic.

## Stack

- **Next.js 14** (App Router), React 18, TypeScript
- **Tailwind CSS**, shadcn/ui (Radix)
- **Photo scan API** (`/api/scan`) — Roboflow Workflow, fine-tuned model, DeepSeek vision, or stub

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — run ESLint

## Scan: Roboflow, fine-tuned model, DeepSeek, or stub

**Roboflow (model or workflow):**

- **By project/version:** Set `ROBOFLOW_API_KEY` (your **private** API key) and `ROBOFLOW_MODEL_ID=project-slug/version` (e.g. `find-head-lice-psoriases-and-dandruffs/1`). The app uses Roboflow’s hosted inference and maps the result to `{ label, confidence }`.
- **By workflow:** Set `ROBOFLOW_API_KEY`, `ROBOFLOW_WORKSPACE`, and `ROBOFLOW_WORKFLOW_ID` from Deploy Workflow in the app. Use class names: `lice`, `nits`, `dandruff`, `psoriasis`, `clear`.

**Your own detection API:** Set `DETECTION_API_URL` to the base URL of an API that exposes `POST /predict` with `{ image: base64 }` and returns `{ label, confidence?, explanation? }`. Same labels as above.

**DeepSeek vision:** Set `DEEPSEEK_API_KEY` (from [DeepSeek Platform](https://platform.deepseek.com)). The app uses vision to classify and explain in one call.

If none are set, `/api/scan` returns a random stub.

**Privacy / zero data:** The app does not store or log uploaded images. They exist only in memory for the duration of the request. For Roboflow’s retention policy on inference requests, see [Roboflow docs](https://docs.roboflow.com/) or their privacy policy.

**Diagnostics:** `GET /api/scan/status` returns `{ configured, provider: 'roboflow' | 'finetuned' | 'deepseek' | 'stub' }`.

**Image size:** For consistent detection, the app guides users to use at least 640px on the shortest side. Images are resized client-side to 1024px on the long edge before upload. The API rejects images with either dimension below 320px.

## Deploying to Vercel

You can deploy the Next.js app to Vercel with **no local runs**. Vercel runs the front end and `/api/scan` only.

- **Recommended:** Set Roboflow env vars and/or `DEEPSEEK_API_KEY` in Vercel. Scan tries Roboflow first, then custom detection API, then DeepSeek.
- **Stub:** Leave both unset. Scan results are random placeholders.

## Project structure

- `app/` — layout, pages, `/api/scan` and `/api/scan/status` routes
- `components/` — UI and features (PhotoChecker, ClinicFinder, etc.)
- `lib/`, `hooks/` — utilities and hooks
