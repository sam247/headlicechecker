"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buildTrackedCallHref, buildTrackedOutboundHref } from "@/lib/data/tracked-links";
import { sortClinicsForDirectory } from "@/lib/data/content";
import { getClinicPartnerPresentation } from "@/lib/data/clinic-partner";
import type { Clinic } from "@/lib/data/types";

interface DirectoryListingsProps {
  clinics: Clinic[];
}

export default function DirectoryListings({ clinics }: DirectoryListingsProps) {
  const [query, setQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");

  const regions = useMemo(
    () => Array.from(new Set(clinics.map((clinic) => clinic.region))).sort((a, b) => a.localeCompare(b)),
    [clinics]
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const regionFiltered =
      regionFilter === "all" ? clinics : clinics.filter((clinic) => clinic.region.toLowerCase() === regionFilter.toLowerCase());

    if (!normalized) return sortClinicsForDirectory(regionFiltered);
    return sortClinicsForDirectory(
      regionFiltered.filter((clinic) => {
        return (
          clinic.name.toLowerCase().includes(normalized) ||
          clinic.region.toLowerCase().includes(normalized) ||
          clinic.city.toLowerCase().includes(normalized)
        );
      })
    );
  }, [clinics, query, regionFilter]);

  return (
    <div>
      <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-[2fr_1fr_auto] md:items-end md:p-5">
        <div>
          <label htmlFor="directory-search" className="text-sm font-medium">
            Search clinics
          </label>
          <Input
            id="directory-search"
            placeholder="Clinic name, town, or region"
            className="mt-2"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="directory-region" className="text-sm font-medium">
            Filter by region
          </label>
          <select
            id="directory-region"
            className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={regionFilter}
            onChange={(event) => setRegionFilter(event.target.value)}
          >
            <option value="all">All regions</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
        <Button type="button" variant="outline" className="rounded-full" onClick={() => { setQuery(""); setRegionFilter("all"); }}>
          Reset
        </Button>
      </div>

      <div className="mt-5 grid gap-4">
        {filtered.map((clinic) => {
          const partner = getClinicPartnerPresentation(clinic);
          const callHref = buildTrackedCallHref(clinic, "/directory", "directory");
          const outboundHref = buildTrackedOutboundHref(clinic, "/directory", "directory");

          return (
            <Card key={clinic.id} className={partner.isVerifiedRegionalPartner ? "border-primary/50" : "border-border/80"}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{clinic.region}</p>
                      {partner.isVerifiedRegionalPartner ? <span className="clinic-badge-standard">Verified Regional Partner</span> : null}
                    </div>
                    <h2 className="mt-1 text-xl font-semibold">{clinic.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {clinic.address1 ? `${clinic.address1}, ` : ""}
                      {clinic.city} {clinic.postcode}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm">
                      {callHref ? (
                        <a href={callHref} className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                          <Phone className="h-4 w-4" />
                          {clinic.phone}
                        </a>
                      ) : null}
                      {outboundHref ? (
                        <a
                          href={outboundHref}
                          target="_blank"
                          rel="nofollow noopener"
                          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                        >
                          Website <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button asChild size="sm" className="rounded-full">
                      <Link href={`/directory/${clinic.id}`}>View profile</Link>
                    </Button>
                    {partner.isVerifiedRegionalPartner ? (
                      <p className="text-xs text-muted-foreground">Lead form available on profile</p>
                    ) : (
                      <Button asChild size="sm" variant="outline" className="rounded-full">
                        <Link href={`/claim-listing?clinic_id=${encodeURIComponent(clinic.id)}&clinic_name=${encodeURIComponent(clinic.name)}&website=${encodeURIComponent(clinic.bookingUrl ?? "")}`}>
                          Are you the owner? Verify your clinic.
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 ? <p className="mt-5 text-sm text-muted-foreground">No clinics match your current search.</p> : null}
    </div>
  );
}
