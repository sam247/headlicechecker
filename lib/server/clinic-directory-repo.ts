import "server-only";

import { sql } from "@vercel/postgres";
import { ensureEventsTable, isPostgresConfigured } from "@/lib/server/db";

let directorySchemaInitPromise: Promise<void> | null = null;

const DIRECTORY_SCHEMA_SQL = `
create table if not exists clinic_claims (
  id bigserial primary key,
  reference_id text not null unique,
  clinic_id text not null,
  clinic_name text not null,
  contact_email text not null,
  website text not null,
  ownership_declaration text not null,
  phone text null,
  status text not null default 'claim_pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null,
  updated_at timestamptz not null
);
create index if not exists clinic_claims_clinic_id_idx on clinic_claims (clinic_id);
create index if not exists clinic_claims_status_idx on clinic_claims (status);
create index if not exists clinic_claims_created_at_idx on clinic_claims (created_at desc);

create table if not exists clinic_suggestions (
  id bigserial primary key,
  reference_id text not null unique,
  clinic_name text not null,
  website text not null,
  region text not null,
  submitted_by_email text null,
  status text not null default 'pending_review',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null,
  updated_at timestamptz not null
);
create index if not exists clinic_suggestions_region_idx on clinic_suggestions (region);
create index if not exists clinic_suggestions_status_idx on clinic_suggestions (status);
create index if not exists clinic_suggestions_created_at_idx on clinic_suggestions (created_at desc);

create table if not exists clinic_listing_states (
  clinic_id text primary key,
  claim_status text not null default 'none',
  updated_at timestamptz not null
);
create index if not exists clinic_listing_states_claim_status_idx on clinic_listing_states (claim_status);
`;

export interface CreateClinicClaimInput {
  referenceId: string;
  clinicId: string;
  clinicName: string;
  contactEmail: string;
  website: string;
  ownershipDeclaration: string;
  phone?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface CreateClinicSuggestionInput {
  referenceId: string;
  clinicName: string;
  website: string;
  region: string;
  submittedByEmail?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface ClinicEngagementRow {
  clinic_id: string;
  call_click_count: number;
  website_click_count: number;
  lead_form_submissions: number;
  total_engagement: number;
  call_click_count_month: number;
  website_click_count_month: number;
  lead_form_submissions_month: number;
  total_engagement_month: number;
}

export async function ensureClinicDirectoryTables(): Promise<void> {
  if (!isPostgresConfigured()) return;
  if (!directorySchemaInitPromise) {
    directorySchemaInitPromise = (async () => {
      await ensureEventsTable();
      await sql.query(DIRECTORY_SCHEMA_SQL);
    })().catch((error) => {
      directorySchemaInitPromise = null;
      throw error;
    });
  }
  await directorySchemaInitPromise;
}

export async function insertClinicClaim(input: CreateClinicClaimInput): Promise<void> {
  if (!isPostgresConfigured()) return;
  await ensureClinicDirectoryTables();
  await sql`
    insert into clinic_claims (
      reference_id,
      clinic_id,
      clinic_name,
      contact_email,
      website,
      ownership_declaration,
      phone,
      status,
      metadata,
      created_at,
      updated_at
    )
    values (
      ${input.referenceId},
      ${input.clinicId},
      ${input.clinicName},
      ${input.contactEmail},
      ${input.website},
      ${input.ownershipDeclaration},
      ${input.phone ?? null},
      'claim_pending',
      ${JSON.stringify(input.metadata ?? {})}::jsonb,
      ${input.createdAt}::timestamptz,
      ${input.createdAt}::timestamptz
    )
  `;

  await sql`
    insert into clinic_listing_states (clinic_id, claim_status, updated_at)
    values (${input.clinicId}, 'claim_pending', ${input.createdAt}::timestamptz)
    on conflict (clinic_id)
    do update set claim_status = 'claim_pending', updated_at = excluded.updated_at
  `;
}

export async function insertClinicSuggestion(input: CreateClinicSuggestionInput): Promise<void> {
  if (!isPostgresConfigured()) return;
  await ensureClinicDirectoryTables();
  await sql`
    insert into clinic_suggestions (
      reference_id,
      clinic_name,
      website,
      region,
      submitted_by_email,
      status,
      metadata,
      created_at,
      updated_at
    )
    values (
      ${input.referenceId},
      ${input.clinicName},
      ${input.website},
      ${input.region},
      ${input.submittedByEmail ?? null},
      'pending_review',
      ${JSON.stringify(input.metadata ?? {})}::jsonb,
      ${input.createdAt}::timestamptz,
      ${input.createdAt}::timestamptz
    )
  `;
}

export async function queryClinicEngagementSummary(): Promise<ClinicEngagementRow[]> {
  if (!isPostgresConfigured()) return [];
  await ensureEventsTable();

  const result = await sql<ClinicEngagementRow>`
    with engagement as (
      select
        clinic_id,
        count(*) filter (where event_type = 'call_click')::int as call_click_count,
        count(*) filter (where event_type = 'website_click')::int as website_click_count,
        count(*) filter (where event_type = 'clinic_message_submitted')::int as lead_form_submissions,
        count(*) filter (
          where event_type in ('call_click', 'website_click', 'clinic_message_submitted')
        )::int as total_engagement,
        count(*) filter (
          where event_type = 'call_click'
            and created_at >= date_trunc('month', now() at time zone 'UTC')
        )::int as call_click_count_month,
        count(*) filter (
          where event_type = 'website_click'
            and created_at >= date_trunc('month', now() at time zone 'UTC')
        )::int as website_click_count_month,
        count(*) filter (
          where event_type = 'clinic_message_submitted'
            and created_at >= date_trunc('month', now() at time zone 'UTC')
        )::int as lead_form_submissions_month,
        count(*) filter (
          where event_type in ('call_click', 'website_click', 'clinic_message_submitted')
            and created_at >= date_trunc('month', now() at time zone 'UTC')
        )::int as total_engagement_month
      from events
      where clinic_id is not null
        and length(trim(clinic_id)) > 0
      group by clinic_id
    )
    select
      clinic_id,
      call_click_count,
      website_click_count,
      lead_form_submissions,
      total_engagement,
      call_click_count_month,
      website_click_count_month,
      lead_form_submissions_month,
      total_engagement_month
    from engagement
    order by total_engagement desc, clinic_id asc
    limit 500
  `;

  return result.rows;
}
