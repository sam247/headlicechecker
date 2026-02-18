# Head Lice Checker — Head Lice Photo Checker

Next.js front end for the Head Lice Checker photo screening tool and clinic finder. Users upload photos for a quick indicative check and can find nearby professional clinics.

## Stack

- **Next.js 14** (App Router), React 18, TypeScript
- **Tailwind CSS**, shadcn/ui (Radix)
- **Photo scan API** (`/api/scan`) — your YOLO inference (DETECTION_API_URL), DeepSeek vision, or stub

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — run ESLint
- `npm run sync:clinics` — pull clinics from Google Sheet, geocode, and write JSON files
- `npm run sync:clinics:check` — validate/mapping check only (no file writes)

## Clinic Applications (Partner Onboarding)

The clinic partner page includes an application form that posts to:

- `POST /api/clinic-apply`

Delivery routing uses the same email provider as clinic contact leads. Configure:

- `LEAD_EMAIL_PROVIDER`
- `LEAD_FROM_EMAIL`
- `LEAD_FALLBACK_TO`
- `CLINIC_APPLY_TO` (optional override for clinic applications)

If `CLINIC_APPLY_TO` is unset, applications fall back to `LEAD_FALLBACK_TO`.

The find-clinics and for-clinics pages also show a **clinic listing enquiry** form (`POST /api/clinic-enquiry`). Enquiries are sent to `CLINIC_ENQUIRY_TO` (e.g. `info@headlicechecker.com`); if unset, they fall back to `LEAD_FALLBACK_TO`.

## Clinic Data Via Google Sheet

Clinics are sourced from a spreadsheet and synced into:

- `content/clinics.uk.json`
- `content/clinics.us.json`

The sync script defaults to this public CSV export URL:

- `https://docs.google.com/spreadsheets/d/1YE-937KWlOp2WB7LhdcPAQ8D5OOtK6X-8AYyn3aeBNU/export?format=csv&gid=0`

You can override with env vars:

- `CLINICS_GSHEET_CSV_URL` — custom CSV URL
- `CLINIC_SYNC_STRICT` — defaults to `true`; if `false`, invalid rows are skipped
- `CLINIC_GEOCODE_DELAY_MS` — defaults to `1100` ms between geocoding calls

### Required Sheet Headers

Use this exact header row:

| Name | Address 1 | Address 2 | Town | County | Postcode | Country | Telephone | Email | Website |

### Mapping Notes

- `Town -> city`
- `County -> region`
- `Website` is normalized to `https://...` if protocol is omitted
- `Country` is normalized to `UK` or `US` (`uk`, `gb`, `united kingdom`, `us`, `usa`, `united states`)
- `lat/lng` are auto-geocoded during sync and cached in `content/.clinic-geocode-cache.json`
- `id` is generated deterministically from country/city/name

### Typical Workflow

1. Update rows in Google Sheet.
2. Run `npm run sync:clinics`.
3. Commit updated `content/clinics.uk.json`, `content/clinics.us.json`, and cache file changes.
4. Deploy.

## Scan: your YOLO API, DeepSeek, or stub

**Your own detection API (recommended):** Set `DETECTION_API_URL` to the base URL of your inference service (see `inference/README.md`). It must expose `POST /predict` with `{ image: base64 }` and return `{ label, confidence?, detections?, image_width?, image_height? }`. Labels: `lice`, `nits`, `dandruff`, `psoriasis`, `clear`.

**DeepSeek vision:** Set `DEEPSEEK_API_KEY` (from [DeepSeek Platform](https://platform.deepseek.com)). The app uses vision to classify and explain in one call.

If neither is set, `/api/scan` returns a random stub (or 503 in production).

**Privacy / zero data:** The app does not store or log uploaded images. They exist only in memory for the duration of the request.

**Diagnostics:** `GET /api/scan/status` returns `{ configured, provider: 'finetuned' | 'deepseek' | 'none' }`.

**Image size:** For consistent detection, the app guides users to use at least 640px on the shortest side. Images are resized client-side to 1024px on the long edge before upload. The API rejects images with either dimension below 320px.

## Deploying to Vercel

You can deploy the Next.js app to Vercel with **no local runs**. Vercel runs the front end and `/api/scan` only.

- **Recommended:** Set `DETECTION_API_URL` (your inference service) and/or `DEEPSEEK_API_KEY` in Vercel. Scan tries your API first, then DeepSeek.
- **Stub:** Leave both unset. Scan results are random placeholders (or 503 in production).

## Project structure

- `app/` — layout, pages, `/api/scan` and `/api/scan/status` routes
- `components/` — UI and features (PhotoChecker, ClinicFinder, etc.)
- `lib/`, `hooks/` — utilities and hooks
