# Live URL Status

- Checked URL: `https://headlicechecker.com/school-head-lice-toolkit`
- Check time (UTC): `2026-02-23`
- HTTP status observed: `404`

## Interpretation

The toolkit route is not yet available on the currently deployed live build.  
The evidence pack in `docs/launch-review/` was generated from a local production run.

## Next step

After deployment, rerun:

```bash
EVIDENCE_BASE_URL=\"https://headlicechecker.com\" node scripts/generate-toolkit-evidence.mjs
```
