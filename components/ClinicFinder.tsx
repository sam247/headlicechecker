"use client";

import { useMemo, useState } from "react";
import { MapPin, Phone, ExternalLink, Search, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { getClinics } from "@/lib/data/content";
import { findOriginFromQuery, sortClinicsByNearest, distanceMiles } from "@/lib/data/geo";
import type { Clinic } from "@/lib/data/types";

interface ClinicFinderProps {
  showHeader?: boolean;
  country?: "US" | "UK" | "ALL";
}

const initialClinics = getClinics("ALL");

function buildMapSrc(clinics: Clinic[]): string {
  if (clinics.length === 0) {
    return "https://www.openstreetmap.org/export/embed.html?bbox=-124,25,-66,49&layer=mapnik";
  }

  const lats = clinics.map((c) => c.lat);
  const lngs = clinics.map((c) => c.lng);
  const minLat = Math.min(...lats) - 1;
  const maxLat = Math.max(...lats) + 1;
  const minLng = Math.min(...lngs) - 1;
  const maxLng = Math.max(...lngs) + 1;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik`;
}

export default function ClinicFinder({ showHeader = true, country = "US" }: ClinicFinderProps) {
  const [query, setQuery] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<"US" | "UK" | "ALL">(country);
  const isMobile = useIsMobile();

  const clinics = useMemo(() => {
    const source =
      selectedCountry === "ALL"
        ? initialClinics
        : initialClinics.filter((clinic) => clinic.country === selectedCountry);

    const normalized = query.trim().toLowerCase();
    const filtered = normalized
      ? source.filter(
          (clinic) =>
            clinic.city.toLowerCase().includes(normalized) ||
            clinic.postcode.toLowerCase().includes(normalized) ||
            clinic.region.toLowerCase().includes(normalized)
        )
      : source;

    const origin = findOriginFromQuery(source, query);
    return sortClinicsByNearest(filtered, origin);
  }, [query, selectedCountry]);

  const mapSrc = useMemo(() => buildMapSrc(clinics), [clinics]);
  const origin = useMemo(() => findOriginFromQuery(initialClinics, query), [query]);

  return (
    <section id="clinic-finder" className="section-shell">
      <div className="container mx-auto px-4">
        {showHeader && (
          <div className="mb-8 text-center md:mb-10">
            <h2 className="section-title">Find a clinic near you</h2>
            <p className="mx-auto mt-3 max-w-2xl section-copy">
              Search by ZIP/postcode or city. We prioritize US locations and keep UK coverage available.
            </p>
          </div>
        )}

        <div className="mb-6 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter ZIP, postcode, or city"
              className="pl-10"
            />
          </div>

          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value as "US" | "UK" | "ALL")}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            aria-label="Choose country scope"
          >
            <option value="US">US clinics</option>
            <option value="UK">UK clinics</option>
            <option value="ALL">US + UK</option>
          </select>

          <Button variant="outline" className="rounded-full" onClick={() => setQuery("")}>
            Reset search
          </Button>
        </div>

        {isMobile && (
          <div className="mb-5 flex justify-center">
            <div className="inline-flex rounded-full bg-muted p-1">
              <button
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${!showMap ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                onClick={() => setShowMap(false)}
              >
                List
              </button>
              <button
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${showMap ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                onClick={() => setShowMap(true)}
              >
                Map
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {(!isMobile || !showMap) && (
            <div className="space-y-3">
              {clinics.length === 0 && (
                <Card>
                  <CardContent className="p-5 text-sm text-muted-foreground">
                    No clinics matched your search. Try a nearby city or reset filters.
                  </CardContent>
                </Card>
              )}

              {clinics.map((clinic) => {
                const miles = origin ? Math.round(distanceMiles(origin.lat, origin.lng, clinic.lat, clinic.lng)) : null;

                return (
                  <Card key={clinic.id} className="border-border/80">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {clinic.country} · {clinic.region}
                          </p>
                          <h3 className="mt-1 text-lg font-semibold text-foreground">{clinic.name}</h3>
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <p className="flex items-start gap-2">
                              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <span>
                                {clinic.address1}
                                {clinic.address2 ? `, ${clinic.address2}` : ""}, {clinic.city} {clinic.postcode}
                              </span>
                            </p>
                            <p className="flex items-center gap-2">
                              <Phone className="h-4 w-4 shrink-0 text-primary" />
                              <a href={`tel:${clinic.phone}`} className="hover:text-foreground">
                                {clinic.phone}
                              </a>
                            </p>
                            {clinic.email && (
                              <p className="flex items-center gap-2">
                                <Mail className="h-4 w-4 shrink-0 text-primary" />
                                <a href={`mailto:${clinic.email}`} className="hover:text-foreground">
                                  {clinic.email}
                                </a>
                              </p>
                            )}
                            {miles !== null && <p className="text-xs">Approx. {miles} miles from search match</p>}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col gap-2">
                          <Button asChild size="sm" className="rounded-full">
                            <a href={clinic.bookingUrl ?? "/contact"}>
                              Contact
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </Button>
                          <Button asChild size="sm" variant="outline" className="rounded-full">
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                `${clinic.address1}, ${clinic.city} ${clinic.postcode}`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Directions
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {(!isMobile || showMap) && (
            <div className="overflow-hidden rounded-2xl border border-border/80 shadow-sm">
              <iframe
                title="Clinic locations"
                src={mapSrc}
                className="h-[420px] w-full border-0 md:h-[560px]"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
