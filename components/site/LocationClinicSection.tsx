"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, MapPin, Phone, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getClinicPartnerPresentation } from "@/lib/data/clinic-partner";
import { buildTrackedCallHref, buildTrackedOutboundHref } from "@/lib/data/tracked-links";
import type { Clinic } from "@/lib/data/types";

interface LocationClinicSectionProps {
  city: string;
  clinics: Clinic[];
}

function reviewLabel(clinic: Clinic): string | null {
  if (typeof clinic.reviewStars !== "number") return null;
  const count = typeof clinic.reviewCount === "number" ? ` (${clinic.reviewCount})` : "";
  return `Google Reviews ${clinic.reviewStars.toFixed(1)}${count}`;
}

export default function LocationClinicSection({ city, clinics }: LocationClinicSectionProps) {
  const pathname = usePathname();
  if (clinics.length === 0) return null;

  return (
    <section className="mt-10 rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Clinics near {city}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Verified Regional Partners appear first, followed by local directory listings.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/directory">Open directory</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/suggest-clinic">Suggest a clinic</Link>
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {clinics.map((clinic) => {
          const partnerPresentation = getClinicPartnerPresentation(clinic);
          const featured = partnerPresentation.highlightCard;
          const review = reviewLabel(clinic);
          const callHref = buildTrackedCallHref(clinic, pathname, "directory");
          const outboundHref = buildTrackedOutboundHref(clinic, pathname, "directory");

          return (
            <Card key={clinic.id} className={featured ? "border-primary/50 clinic-card--sponsored" : "border-border/80"}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{clinic.region}</p>
                  {partnerPresentation.isVerifiedRegionalPartner ? <span className="clinic-badge-standard">Verified Regional Partner</span> : null}
                </div>
                <h3 className="mt-1 text-lg font-semibold">{clinic.name}</h3>
                {clinic.description ? <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{clinic.description}</p> : null}
                {review ? (
                  <p className="clinic-stars mt-1">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {review}
                  </p>
                ) : null}
                <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  <span>
                    {clinic.city} {clinic.postcode}
                  </span>
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
                      Website
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild size="sm" className="rounded-full">
                    <Link href={`/directory/${clinic.id}`}>View profile</Link>
                  </Button>
                  {!partnerPresentation.isVerifiedRegionalPartner ? (
                    <Button asChild size="sm" variant="outline" className="rounded-full">
                      <Link href={`/claim-listing?clinic_id=${encodeURIComponent(clinic.id)}&clinic_name=${encodeURIComponent(clinic.name)}&website=${encodeURIComponent(clinic.bookingUrl ?? "")}`}>
                        Are you the owner? Verify your clinic.
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
