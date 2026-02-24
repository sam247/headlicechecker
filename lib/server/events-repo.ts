import "server-only";

import { sql } from "@vercel/postgres";
import { ensureEventsTable, isPostgresConfigured } from "@/lib/server/db";

export interface EventInsertInput {
  event_type: string;
  user_session_id: string;
  clinic_id?: string | null;
  region?: string | null;
  confidence_tier?: string | null;
  metadata?: Record<string, unknown> | null;
  timestamp: string;
}

export interface DailyMetricPoint {
  day: string;
  count: number;
}

export interface RegionMetricPoint {
  region: string;
  count: number;
}

export interface ClinicLeadPoint {
  clinic_id: string;
  lead_count: number;
  last_lead_at: string;
}

function normalizeMetadata(input: EventInsertInput): Record<string, unknown> {
  const metadata = { ...(input.metadata ?? {}) };
  if (input.confidence_tier && metadata.confidence_tier == null) {
    metadata.confidence_tier = input.confidence_tier;
  }
  return metadata;
}

export async function insertEvent(input: EventInsertInput): Promise<void> {
  if (!isPostgresConfigured()) return;
  await ensureEventsTable();
  await sql`
    insert into events (event_type, session_id, clinic_id, region, metadata, created_at)
    values (
      ${input.event_type},
      ${input.user_session_id},
      ${input.clinic_id ?? null},
      ${input.region ?? null},
      ${JSON.stringify(normalizeMetadata(input))}::jsonb,
      ${input.timestamp}::timestamptz
    )
  `;
}

export async function queryDailyEventCounts(eventType: string): Promise<DailyMetricPoint[]> {
  if (!isPostgresConfigured()) return [];
  await ensureEventsTable();
  const result = await sql<DailyMetricPoint>`
    select
      to_char(date_trunc('day', created_at at time zone 'UTC'), 'YYYY-MM-DD') as day,
      count(*)::int as count
    from events
    where event_type = ${eventType}
    group by 1
    order by 1 desc
    limit 60
  `;
  return result.rows;
}

export async function queryClinicClicksByRegion(): Promise<RegionMetricPoint[]> {
  if (!isPostgresConfigured()) return [];
  await ensureEventsTable();
  const result = await sql<RegionMetricPoint>`
    select
      coalesce(region, 'unknown') as region,
      count(*)::int as count
    from events
    where event_type in ('clinic_contact_clicked', 'clinic_directions_clicked')
    group by 1
    order by 2 desc, 1 asc
    limit 100
  `;
  return result.rows;
}

export async function queryTopRegionsByActivity(): Promise<RegionMetricPoint[]> {
  if (!isPostgresConfigured()) return [];
  await ensureEventsTable();
  const result = await sql<RegionMetricPoint>`
    select
      coalesce(region, 'unknown') as region,
      count(*)::int as count
    from events
    where region is not null and length(trim(region)) > 0
    group by 1
    order by 2 desc, 1 asc
    limit 20
  `;
  return result.rows;
}

export async function queryLeadsPerClinic(): Promise<ClinicLeadPoint[]> {
  if (!isPostgresConfigured()) return [];
  await ensureEventsTable();
  const result = await sql<ClinicLeadPoint>`
    select
      clinic_id,
      count(*)::int as lead_count,
      max(created_at)::text as last_lead_at
    from events
    where event_type in ('clinic_contact_clicked', 'clinic_directions_clicked', 'clinic_message_submitted')
      and clinic_id is not null
      and length(trim(clinic_id)) > 0
    group by clinic_id
    order by lead_count desc, clinic_id asc
    limit 200
  `;
  return result.rows;
}
