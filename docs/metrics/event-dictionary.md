# Event Dictionary (Canonical)

## Scan Funnel

- `scan_started`
  - Trigger: scan pipeline starts for an uploaded image
- `image_uploaded`
  - Trigger: user selects or drops an image file
- `scan_processed`
  - Trigger: scan API returns successfully
- `confidence_generated`
  - Trigger: confidence tier computed and displayed
- `escalation_triggered`
  - Trigger: positive result path indicates clinic escalation
- `clinic_finder_opened`
  - Trigger: user opens clinic finder from scan/home context

## Clinic Engagement

- `clinic_card_viewed`
  - Trigger: user opens/selects a clinic card
  - Properties: `clinic_id`, `region`
- `clinic_contact_clicked`
  - Trigger: user clicks clinic contact CTA
  - Properties: `clinic_id`, `region`
- `clinic_directions_clicked`
  - Trigger: user clicks directions CTA
  - Properties: `clinic_id`, `region`
- `clinic_message_submitted`
  - Trigger: clinic contact form is submitted successfully
  - Properties: `clinic_id`, `region`, optional `confidence_tier`
- `call_click`
  - Trigger: user taps/clicks tracked phone link (`/api/call`)
  - Properties: `clinic_id`, `region`, metadata `source_path`, `pillar`
- `website_click`
  - Trigger: user taps/clicks tracked website link (`/api/outbound`)
  - Properties: `clinic_id`, `region`, metadata `source_path`, `pillar`
- `clinic_listing_claim_submitted`
  - Trigger: clinic owner verification form is submitted (`/api/claim-listing`)
- `clinic_suggestion_submitted`
  - Trigger: suggest-a-clinic form is submitted (`/api/suggest-clinic`)

## School Toolkit

- `toolkit_unlock_submitted`
  - Trigger: toolkit unlock form success
  - Metadata: `school_country`, `school_role`, `email_domain`, `trust_flag`
- `toolkit_downloaded`
  - Trigger: toolkit download action
  - Metadata: `school_country`, `school_role`, `email_domain`, `trust_flag`, `asset_name`, `asset_id`, `download_sequence_number`, `is_school_domain`, `domain_type`
- `toolkit_file_viewed`
  - Trigger: toolkit view action
  - Metadata: `school_country`, `school_role`, `email_domain`, `trust_flag`, `asset_name`, `asset_id`, `is_school_domain`, `domain_type`
- `toolkit_download_notify_success`
  - Trigger: server-side notification email for toolkit download sent successfully
  - Metadata: `reference_id`, `asset_id`, `provider`, `delivery_status`
- `toolkit_download_notify_failed`
  - Trigger: server-side notification email for toolkit download failed
  - Metadata: `reference_id`, `asset_id`, `provider?`, `error?`
- `toolkit_download_rate_limited`
  - Trigger: download endpoint soft-abuse guard blocked request
  - Metadata: `limiter_dimension`, `reference_id`, `token_hash`
