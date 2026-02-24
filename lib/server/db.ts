import "server-only";

import { sql } from "@vercel/postgres";

let schemaInitPromise: Promise<void> | null = null;

export function isPostgresConfigured(): boolean {
  return Boolean(process.env.POSTGRES_URL);
}

const EVENTS_SCHEMA_SQL = `
create table if not exists events (
  id bigserial primary key,
  event_type text not null,
  session_id text not null,
  clinic_id text null,
  region text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null
);
create index if not exists events_created_at_idx on events (created_at desc);
create index if not exists events_event_type_idx on events (event_type);
create index if not exists events_clinic_id_idx on events (clinic_id) where clinic_id is not null;
create index if not exists events_region_idx on events (region) where region is not null;
`;

export async function ensureEventsTable(): Promise<void> {
  if (!isPostgresConfigured()) return;
  if (!schemaInitPromise) {
    schemaInitPromise = (async () => {
      await sql.query(EVENTS_SCHEMA_SQL);
    })().catch((error) => {
      schemaInitPromise = null;
      throw error;
    });
  }
  await schemaInitPromise;
}
