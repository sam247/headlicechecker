# Clinic Sheet Columns

Use these columns when importing clinics from a sheet/CSV.

## Required baseline columns

- `id`
- `name`
- `country` (`UK` or `US`)
- `region`
- `city`
- `postcode`
- `lat`
- `lng`
- `services` (comma-separated in sheets)
- `active` (`true`/`false`)

## Partner and lead-form columns

- `Partner` (primary): `YES` or `NO`
- `partner_status` (legacy-compatible): `verified`, `featured`, `exclusive`, `founding`, `free`
- `founding_partner` (optional legacy fallback): `true`/`false`
- `tier` (styling/promotion only): `featured` or `standard`
- `featured` (legacy styling fallback): `true`/`false`

## Notes

- To show the **Verified Regional Partner** badge and enable the routed lead-form path, set:
  - `Partner = YES` (recommended), or
  - `partner_status = verified` (legacy-compatible).
- `Partner = NO` maps to non-partner behavior.
- `active` must be `true` for the clinic to appear.
