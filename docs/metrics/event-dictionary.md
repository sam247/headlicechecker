# Event Dictionary

## Core Events

- `scan_submission`
  - Trigger: user submits image scan
  - Properties: `source`

- `scan_result`
  - Trigger: successful scan response
  - Properties: `result_label`, `confidence`, `detectionCount`, `topDetectionLabel`, `topDetectionConfidenceLevel`

- `scan_positive_detection_click`
  - Trigger: user clicks clinic CTA after lice/nits result
  - Properties: `label`, `source`

- `find_clinic_click`
  - Trigger: user clicks any find-clinic CTA
  - Properties: `source`, `label`

- `clinic_profile_click`
  - Trigger: user clicks clinic outbound destination/contact action
  - Properties: `clinicId`, `clinicName`, `destination`

- `clinic_contact_submitted`
  - Trigger: contact-clinic form successful submit
  - Properties: `clinicId`, `source`

- `clinic_apply_submitted`
  - Trigger: clinic onboarding/enquiry form successful submit
  - Properties: `country`, `source`

- `school_asset_download`
  - Trigger: school toolkit view/download click
  - Properties: `asset_name`, `format`

## KPI Definitions

- `scans_per_week = count(scan_submission)`
- `positive_detection_rate = count(scan_result where result_label in [lice,nits]) / count(scan_submission)`
- `clinic_ctr = count(find_clinic_click) / count(scan_submission)`
- `enquiries_generated = count(clinic_contact_submitted) + count(clinic_apply_submitted)`
