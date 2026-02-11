# NitNot — Head Lice Photo Checker

Next.js front end for the NitNot head lice photo checker and clinic finder. Users can upload photos for a quick check and find their nearest professional clinic.

This app was rebuilt in Next.js (App Router) from the original Vite + React version in `FRONTENDBUILD/`. The current photo analysis is a mock flow (timer-based); **AI or open-source image detection for real analysis is planned as a separate follow-up**.

## Stack

- **Next.js 14** (App Router)
- **React 18**, TypeScript
- **Tailwind CSS**, shadcn/ui (Radix)
- **TanStack Query**, next-themes

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — run ESLint

## Project structure

- `app/` — layout, page, providers, global CSS
- `components/` — UI and feature components (Header, HeroSection, PhotoChecker, etc.)
- `lib/`, `hooks/` — utilities and hooks
- `public/images/` — static assets (logos, gallery, sample images)

## Future: AI / image detection

To add real analysis, implement an API route (e.g. `app/api/analyze/route.ts`) that accepts the uploaded image and calls an external AI API or an open-source image model, then update the PhotoChecker component to call that endpoint and show actual results.
