import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getClinicPartnerPresentation } from "@/lib/data/clinic-partner";
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
  if (clinics.length === 0) return null;

  return (
    <section className="mt-10 rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Clinics near {city}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Featured clinics appear first, followed by standard listings.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/find-clinics">Open full clinic finder</Link>
        </Button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {clinics.map((clinic) => {
          const partnerPresentation = getClinicPartnerPresentation(clinic);
          const featured = partnerPresentation.highlightCard;
          const review = reviewLabel(clinic);
          return (
            <Card key={clinic.id} className={featured ? "border-primary/50 clinic-card--sponsored" : "border-border/80"}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {clinic.country} · {clinic.region}
                  </p>
                  {featured ? <span className="clinic-badge-sponsored">Featured</span> : null}
                  {partnerPresentation.badges.map((badge) => (
                    <span key={badge.key} className="clinic-badge-standard">
                      {badge.label}
                    </span>
                  ))}
                </div>
                {partnerPresentation.showRegionalBanner ? (
                  <p className="mt-2 rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    Regional Partner
                  </p>
                ) : null}
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
                <div className="mt-4">
                  <Button asChild size="sm" className="rounded-full">
                    <Link href={`/contact?clinicId=${encodeURIComponent(clinic.id)}`}>Contact clinic</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
