# Head Lice Checker — Head Lice Photo Checker

Next.js front end for the Head Lice Checker photo screening tool and clinic finder. Users upload photos for a quick indicative check and can find nearby professional clinics.

## Stack

- **Next.js 14** (App Router), React 18, TypeScript
- **Tailwind CSS**, shadcn/ui (Radix)
- **Vercel Analytics** page analytics (`@vercel/analytics`)
- **Server-side event capture** (`POST /api/event`) backed by Vercel Postgres
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

If email provider credentials are missing, lead routing gracefully returns a queued status to avoid silent lead loss.

## Server-Side Events (Postgres)

Primary event logging route:

- `POST /api/event`

Payload:

```json
{
  "event_type": "string",
  "user_session_id": "string",
  "clinic_id": "string (optional)",
  "region": "string (optional)",
  "confidence_tier": "string (optional)",
  "metadata": {},
  "timestamp": "ISO string"
}
```

Core canonical events:

- Scan funnel: `scan_started`, `image_uploaded`, `scan_processed`, `confidence_generated`, `escalation_triggered`, `clinic_finder_opened`
- Clinic engagement: `clinic_card_viewed`, `clinic_contact_clicked`, `clinic_directions_clicked`, `clinic_message_submitted`
- Toolkit: `toolkit_unlock_submitted`, `toolkit_downloaded`, `toolkit_file_viewed`
- Toolkit reliability/abuse: `toolkit_download_notify_success`, `toolkit_download_notify_failed`, `toolkit_download_rate_limited`

Storage:

- Vercel Postgres table `events` (created automatically by server schema init)
- Env required: `POSTGRES_URL`

Legacy endpoint:

- `POST /api/events` is deprecated and returns `410`.

## School Toolkit Funnel

The school toolkit landing page is:

- `/school-head-lice-toolkit`

Gated submissions post to:

- `POST /api/school-toolkit`
- `GET /api/toolkit/download?asset=<asset_id>&token=<download_token>&mode=<download|view>`

Required fields:

- `schoolName`
- `role`
- `email`
- `country`

Optional fields:

- `trustName`

On success, users receive immediate file access and confirmation email delivery.
Unlock responses now also return a `downloadToken`, used to generate tokenized view/download links routed through `/api/toolkit/download`.

### SchoolLeads Table (Google Sheets)

Configure:

- `SCHOOL_LEADS_SHEET_ID`
- `SCHOOL_LEADS_SHEET_TAB`
- `SCHOOL_TOOLKIT_CONFIRMATION_FROM` (optional; falls back to `LEAD_FROM_EMAIL`)
- `SCHOOL_TOOLKIT_OPS_BCC` (ops copy destination)
- `TOOLKIT_DOWNLOAD_NOTIFY_TO` (download notification recipient, e.g. `info@headlicechecker.com`)
- `TOOLKIT_DOWNLOAD_NOTIFY_FROM` (optional sender override)
- `TOOLKIT_DOWNLOAD_TOKEN_SECRET`
- `TOOLKIT_DOWNLOAD_TOKEN_TTL_MINUTES` (default `1440`)

`SchoolLeads` columns written by the API:

1. `timestamp`
2. `school_name`
3. `role`
4. `email`
5. `country`
6. `trust_name`
7. `toolkit_downloaded`
8. `toolkit_assets_unlocked`
9. `region_tag`
10. `country_tag`
11. `follow_up_status`
12. `follow_up_owner`
13. `source_page`
14. `reference_id`

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

Optional headers for featured placement, partner metadata, and reviews:

| Tier | Featured | Sponsored | Featured Rank | Partner Status | Region Tag | Coverage Radius KM | Founding Partner | Premium Position | Onboarding Date | Lead Count | Last Lead At | Review Stars | Review Count | Description | Google Business URL |

### Mapping Notes

- `Town -> city`
- `County -> region`
- `Website` is normalized to `https://...` if protocol is omitted
- `Country` is normalized to `UK` or `US` (`uk`, `gb`, `united kingdom`, `us`, `usa`, `united states`)
- `lat/lng` are auto-geocoded during sync and cached in `content/.clinic-geocode-cache.json`
- `id` is generated deterministically from country/city/name
- `Featured`/`Sponsored` support priority listing order in finder results
- `Tier` supports explicit placement strategy: `featured` or `standard`
- If `Tier` is blank, sync falls back to `Featured` (`YES` => `featured`, otherwise `standard`)
- `Featured Rank` sorts sponsored clinics to the top (`1` highest)
- `Partner Status` supports: `free | founding | verified | featured | exclusive`
- `Region Tag` remains free-form string (not fixed list)
- `Review Stars` (0-5) and `Review Count` render in finder cards
- `Google Business URL` is stored as `gmbUrl` for manual enrichment

## Admin Metrics

Internal route:

- `/admin/metrics`

Current panels:

- Scans per day
- Escalations per day
- Clinic clicks per region
- Leads per clinic
- Toolkit unlocks per day
- Top regions by activity
- Toolkit conversion snapshot (unlocks, downloads, download rate %)
- Download notification reliability (success, failed, success rate %)
- Domain classification and top toolkit asset/domain insights

## Toolkit Storage Note

Current implementation uses tokenized delivery and server-side transactional logging for gated toolkit actions.  
Because toolkit files still exist under public static paths, direct URL access remains possible until private storage migration (signed URL model).

## Clinic Pricing Labels

`/for-clinics/pricing` reads non-hardcoded tier labels from:

- `CLINIC_PRICING_FEATURED_LABEL`
- `CLINIC_PRICING_STANDARD_LABEL`

If either is unset, the page falls back to `Contact us`.

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

- `app/` — layout, pages, `/api/scan`, `/api/scan/status`, `/api/event`, `/admin/metrics`
- `components/` — UI and features (PhotoChecker, ClinicFinder, etc.)
- `lib/`, `hooks/` — utilities and hooks
