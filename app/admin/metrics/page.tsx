import { Card, CardContent } from "@/components/ui/card";
import { getClinics } from "@/lib/data/content";
import {
  queryClinicClicksByRegion,
  queryDailyEventCounts,
  queryEventTotal,
  queryLeadsPerClinic,
  queryToolkitDomainTypeDistribution,
  queryToolkitSchoolDomainBreakdown,
  queryToolkitTopAssets,
  queryToolkitTopEmailDomains,
  queryTopRegionsByActivity,
} from "@/lib/server/events-repo";
import { queryClinicEngagementSummary } from "@/lib/server/clinic-directory-repo";

export const dynamic = "force-dynamic";

function safeNumber(value: number | undefined): string {
  return typeof value === "number" ? String(value) : "0";
}

export default async function AdminMetricsPage() {
  const [
    scansPerDay,
    escalationsPerDay,
    toolkitUnlocksPerDay,
    clinicClicksByRegion,
    leadsPerClinic,
    topRegions,
    toolkitUnlocksTotal,
    toolkitDownloadsTotal,
    notifySuccessTotal,
    notifyFailedTotal,
    domainTypeDistribution,
    schoolDomainBreakdown,
    topEmailDomains,
    topToolkitAssets,
    clinicEngagement,
  ] = await Promise.all([
    queryDailyEventCounts("scan_started"),
    queryDailyEventCounts("escalation_triggered"),
    queryDailyEventCounts("toolkit_unlock_submitted"),
    queryClinicClicksByRegion(),
    queryLeadsPerClinic(),
    queryTopRegionsByActivity(),
    queryEventTotal("toolkit_unlock_submitted"),
    queryEventTotal("toolkit_downloaded"),
    queryEventTotal("toolkit_download_notify_success"),
    queryEventTotal("toolkit_download_notify_failed"),
    queryToolkitDomainTypeDistribution(),
    queryToolkitSchoolDomainBreakdown(),
    queryToolkitTopEmailDomains(10),
    queryToolkitTopAssets(10),
    queryClinicEngagementSummary(),
  ]);

  const clinics = getClinics("ALL");
  const clinicNameById = new Map(clinics.map((clinic) => [clinic.id, clinic.name]));
  const downloadRatePct =
    toolkitUnlocksTotal > 0 ? ((toolkitDownloadsTotal / toolkitUnlocksTotal) * 100).toFixed(1) : "0.0";
  const notifyTotal = notifySuccessTotal + notifyFailedTotal;
  const notifySuccessRatePct = notifyTotal > 0 ? ((notifySuccessTotal / notifyTotal) * 100).toFixed(1) : "0.0";

  return (
    <section className="section-shell">
      <div className="container mx-auto px-4">
        <h1 className="section-title text-left">Admin Metrics</h1>
        <p className="section-copy mt-2">Internal analytics snapshot from raw server-side event capture.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold">Toolkit Conversion Snapshot</h2>
              <ul className="mt-3 space-y-1 text-sm">
                <li className="flex items-center justify-between">
                  <span>Unlocks</span>
                  <span className="font-medium">{safeNumber(toolkitUnlocksTotal)}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Downloads</span>
                  <span className="font-medium">{safeNumber(toolkitDownloadsTotal)}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Download rate %</span>
                  <span className="font-medium">{downloadRatePct}%</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold">Download Notification Reliability</h2>
              <ul className="mt-3 space-y-1 text-sm">
                <li className="flex items-center justify-between">
                  <span>Notify success</span>
                  <span className="font-medium">{safeNumber(notifySuccessTotal)}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Notify failed</span>
                  <span className="font-medium">{safeNumber(notifyFailedTotal)}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Success rate %</span>
                  <span className="font-medium">{notifySuccessRatePct}%</span>
                </li>
              </ul>
            </CardContent>
          </Card>

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
              <h2 className="text-lg font-semibold">Clinic Engagement Summary</h2>
              <p className="mt-2 text-xs text-muted-foreground">
                Sorted by total interactions. Includes month-to-date counts for outreach summaries.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-3">Clinic</th>
                      <th className="py-2 pr-3 text-right">Call clicks</th>
                      <th className="py-2 pr-3 text-right">Website clicks</th>
                      <th className="py-2 pr-3 text-right">Lead forms</th>
                      <th className="py-2 pr-3 text-right">Total engagement</th>
                      <th className="py-2 pr-3 text-right">Month calls</th>
                      <th className="py-2 pr-3 text-right">Month websites</th>
                      <th className="py-2 pr-3 text-right">Month leads</th>
                      <th className="py-2 text-right">Month total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clinicEngagement.map((row) => (
                      <tr key={row.clinic_id} className="border-b border-border/40">
                        <td className="py-2 pr-3">{clinicNameById.get(row.clinic_id) ?? row.clinic_id}</td>
                        <td className="py-2 pr-3 text-right">{safeNumber(row.call_click_count)}</td>
                        <td className="py-2 pr-3 text-right">{safeNumber(row.website_click_count)}</td>
                        <td className="py-2 pr-3 text-right">{safeNumber(row.lead_form_submissions)}</td>
                        <td className="py-2 pr-3 text-right font-semibold">{safeNumber(row.total_engagement)}</td>
                        <td className="py-2 pr-3 text-right">{safeNumber(row.call_click_count_month)}</td>
                        <td className="py-2 pr-3 text-right">{safeNumber(row.website_click_count_month)}</td>
                        <td className="py-2 pr-3 text-right">{safeNumber(row.lead_form_submissions_month)}</td>
                        <td className="py-2 text-right font-semibold">{safeNumber(row.total_engagement_month)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold">Download Domain Types</h2>
              <ul className="mt-3 space-y-1 text-sm">
                {domainTypeDistribution.map((row) => (
                  <li key={`${row.name}-${row.count}`} className="flex items-center justify-between">
                    <span>{row.name}</span>
                    <span className="font-medium">{safeNumber(row.count)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold">School Domain Mix</h2>
              <ul className="mt-3 space-y-1 text-sm">
                {schoolDomainBreakdown.map((row) => (
                  <li key={`${row.name}-${row.count}`} className="flex items-center justify-between">
                    <span>{row.name}</span>
                    <span className="font-medium">{safeNumber(row.count)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold">Top Email Domains</h2>
              <ul className="mt-3 space-y-1 text-sm">
                {topEmailDomains.map((row) => (
                  <li key={`${row.name}-${row.count}`} className="flex items-center justify-between">
                    <span>{row.name}</span>
                    <span className="font-medium">{safeNumber(row.count)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold">Top Toolkit Assets</h2>
              <ul className="mt-3 space-y-1 text-sm">
                {topToolkitAssets.map((row) => (
                  <li key={`${row.name}-${row.count}`} className="flex items-center justify-between">
                    <span>{row.name}</span>
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
