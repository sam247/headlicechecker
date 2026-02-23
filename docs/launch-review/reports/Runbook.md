# Launch Review Runbook

## Generated outputs

- `docs/launch-review/reports/Toolkit-Screens-Desktop.pdf`
- `docs/launch-review/reports/Toolkit-Screens-Mobile.pdf`
- `docs/launch-review/reports/Gating-Flow-Proof.pdf`
- `docs/launch-review/reports/Schema-Validation-Notes.md`
- `docs/launch-review/data/Internal-Link-Map.csv`
- `docs/launch-review/data/GSC-Day3-Day7-Snapshot.csv`
- `docs/launch-review/reports/Editorial-Adjustments-List.md`

## Re-run against local production build

```bash
npm run build
npm run start -- -p 4100
node scripts/generate-toolkit-evidence.mjs
```

## Re-run against live deployment

```bash
EVIDENCE_BASE_URL=\"https://headlicechecker.com\" node scripts/generate-toolkit-evidence.mjs
```

## Notes

- For final pack sign-off, capture the mailbox screenshot for the confirmation email and add it to the strategy packet.
- If live URL returns a non-200 status, deploy first, then rerun with `EVIDENCE_BASE_URL` as above.
