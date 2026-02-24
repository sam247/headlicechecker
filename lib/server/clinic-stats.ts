import "server-only";

import type { Clinic } from "@/lib/data/types";
import { queryLeadsPerClinic } from "@/lib/server/events-repo";

type LeadStat = {
  lead_count: number;
  last_lead_at: string | null;
};

function buildLeadMap(rows: Awaited<ReturnType<typeof queryLeadsPerClinic>>): Map<string, LeadStat> {
  const out = new Map<string, LeadStat>();
  for (const row of rows) {
    out.set(row.clinic_id, {
      lead_count: row.lead_count,
      last_lead_at: row.last_lead_at || null,
    });
  }
  return out;
}

export async function mergeClinicsWithLeadStats(clinics: Clinic[]): Promise<Clinic[]> {
  try {
    const rows = await queryLeadsPerClinic();
    const leadMap = buildLeadMap(rows);
    return clinics.map((clinic) => {
      const stat = leadMap.get(clinic.id);
      if (!stat) {
        return {
          ...clinic,
          lead_count: clinic.lead_count ?? 0,
          last_lead_at: clinic.last_lead_at ?? null,
        };
      }
      return {
        ...clinic,
        lead_count: stat.lead_count,
        last_lead_at: stat.last_lead_at,
      };
    });
  } catch {
    return clinics.map((clinic) => ({
      ...clinic,
      lead_count: clinic.lead_count ?? null,
      last_lead_at: clinic.last_lead_at ?? null,
    }));
  }
}

