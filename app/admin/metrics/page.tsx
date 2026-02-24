import { Card, CardContent } from "@/components/ui/card";
import { getClinics } from "@/lib/data/content";
import {
  queryClinicClicksByRegion,
  queryDailyEventCounts,
  queryLeadsPerClinic,
  queryTopRegionsByActivity,
} from "@/lib/server/events-repo";

export const dynamic = "force-dynamic";

function safeNumber(value: number | undefined): string {
  return typeof value === "number" ? String(value) : "0";
}

export default async function AdminMetricsPage() {
  const [scansPerDay, escalationsPerDay, toolkitUnlocksPerDay, clinicClicksByRegion, leadsPerClinic, topRegions] =
    await Promise.all([
      queryDailyEventCounts("scan_started"),
      queryDailyEventCounts("escalation_triggered"),
      queryDailyEventCounts("toolkit_unlock_submitted"),
      queryClinicClicksByRegion(),
      queryLeadsPerClinic(),
      queryTopRegionsByActivity(),
    ]);

  const clinics = getClinics("ALL");
  const clinicNameById = new Map(clinics.map((clinic) => [clinic.id, clinic.name]));

  return (
    <section className="section-shell">
      <div className="container mx-auto px-4">
        <h1 className="section-title text-left">Admin Metrics</h1>
        <p className="section-copy mt-2">Internal analytics snapshot from raw server-side event capture.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold">Scans Per Day</h2>
              <ul className="mt-3 space-y-1 text-sm">
                {scansPerDay.map((row) => (
                  <li key={row.day} className="flex items-center justify-between">
                    <span>{row.day}</span>
                    <span className="font-medium">{safeNumber(row.count)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold">Escalations Per Day</h2>
              <ul className="mt-3 space-y-1 text-sm">
                {escalationsPerDay.map((row) => (
                  <li key={row.day} className="flex items-center justify-between">
                    <span>{row.day}</span>
                    <span className="font-medium">{safeNumber(row.count)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold">Toolkit Unlocks Per Day</h2>
              <ul className="mt-3 space-y-1 text-sm">
                {toolkitUnlocksPerDay.map((row) => (
                  <li key={row.day} className="flex items-center justify-between">
                    <span>{row.day}</span>
                    <span className="font-medium">{safeNumber(row.count)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold">Clinic Clicks Per Region</h2>
              <ul className="mt-3 space-y-1 text-sm">
                {clinicClicksByRegion.map((row) => (
                  <li key={`${row.region}-${row.count}`} className="flex items-center justify-between">
                    <span>{row.region}</span>
                    <span className="font-medium">{safeNumber(row.count)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold">Leads Per Clinic</h2>
              <ul className="mt-3 space-y-1 text-sm">
                {leadsPerClinic.map((row) => (
                  <li key={row.clinic_id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-1">
                    <span>{clinicNameById.get(row.clinic_id) ?? row.clinic_id}</span>
                    <span className="text-muted-foreground">Leads: {safeNumber(row.lead_count)}</span>
                    <span className="text-muted-foreground">Last lead: {row.last_lead_at}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold">Top Regions By Activity</h2>
              <ul className="mt-3 space-y-1 text-sm">
                {topRegions.map((row) => (
                  <li key={`${row.region}-${row.count}`} className="flex items-center justify-between">
                    <span>{row.region}</span>
                    <span className="font-medium">{safeNumber(row.count)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
