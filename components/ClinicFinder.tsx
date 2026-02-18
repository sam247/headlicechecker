"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MapPin, Phone, ExternalLink, Search, Mail, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { getClinics } from "@/lib/data/content";
import { findOriginFromQuery, sortClinicsByNearest, distanceMiles } from "@/lib/data/geo";
import type { Clinic } from "@/lib/data/types";

const GEOCODE_DEBOUNCE_MS = 450;

interface ClinicFinderProps {
  showHeader?: boolean;
  country?: "US" | "UK" | "ALL";
  onClinicSelect?: (clinicId: string) => void;
  mode?: "page" | "modal";
  hideDirectContact?: boolean;
  hideClinicContactDetails?: boolean;
  onContactClinic?: (clinicId: string) => void;
}

const initialClinics = getClinics("ALL");

const MAP_DELTA = 0.02;

function buildMapSrc(
  clinics: Clinic[],
  origin?: { lat: number; lng: number } | null
): string {
  const lats = clinics.map((c) => c.lat);
  const lngs = clinics.map((c) => c.lng);
  if (origin) {
    lats.push(origin.lat);
    lngs.push(origin.lng);
  }
  if (lats.length === 0) {
    return "https://www.openstreetmap.org/export/embed.html?bbox=-124,25,-66,49&layer=mapnik";
  }

  const minLat = Math.min(...lats) - 1;
  const maxLat = Math.max(...lats) + 1;
  const minLng = Math.min(...lngs) - 1;
  const maxLng = Math.max(...lngs) + 1;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik`;
}

function buildMapSrcForClinic(clinic: Clinic): string {
  const minLng = clinic.lng - MAP_DELTA;
  const maxLng = clinic.lng + MAP_DELTA;
  const minLat = clinic.lat - MAP_DELTA;
  const maxLat = clinic.lat + MAP_DELTA;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik`;
}

export default function ClinicFinder({
  showHeader = true,
  country = "ALL",
  onClinicSelect,
  mode = "page",
  hideDirectContact = false,
  hideClinicContactDetails = false,
  onContactClinic,
}: ClinicFinderProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const isModalMode = mode === "modal";

  const [query, setQuery] = useState(isModalMode ? "" : (searchParams.get("q") ?? ""));
  const [showMap, setShowMap] = useState(isModalMode ? false : (searchParams.get("view") ?? "list") === "map");
  const [selectedCountry, setSelectedCountry] = useState<"US" | "UK" | "ALL">(
    isModalMode ? country : ((searchParams.get("country") as "US" | "UK" | "ALL") ?? country)
  );
  const [copiedClinicId, setCopiedClinicId] = useState<string | null>(null);
  const [mapFocusClinicId, setMapFocusClinicId] = useState<string | null>(null);
  const [geocodedOrigin, setGeocodedOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setGeocodedOrigin(null);
      return;
    }
    const t = setTimeout(async () => {
      setIsGeocoding(true);
      try {
        const params = new URLSearchParams({ q: trimmed });
        if (selectedCountry === "UK" || selectedCountry === "US") {
          params.set("country", selectedCountry);
        }
        const res = await fetch(`/api/geocode?${params.toString()}`);
        const data = (await res.json()) as { lat?: number; lng?: number; error?: string };
        if (res.ok && typeof data.lat === "number" && typeof data.lng === "number") {
          setGeocodedOrigin({ lat: data.lat, lng: data.lng });
        } else {
          setGeocodedOrigin(null);
        }
      } catch {
        setGeocodedOrigin(null);
      } finally {
        setIsGeocoding(false);
      }
    }, GEOCODE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query, selectedCountry]);

  useEffect(() => {
    if (isModalMode) return;
    const params = new URLSearchParams(searchParams.toString());
    if (query) params.set("q", query);
    else params.delete("q");

    params.set("view", showMap ? "map" : "list");
    params.set("country", selectedCountry);
    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(`${pathname}?${next}`, { scroll: false });
    }
  }, [isModalMode, query, showMap, selectedCountry, pathname, router, searchParams]);

  useEffect(() => {
    setMapFocusClinicId(null);
  }, [query, selectedCountry]);

  const { clinics, origin } = useMemo(() => {
    const source =
      selectedCountry === "ALL"
        ? initialClinics
        : initialClinics.filter((clinic) => clinic.country === selectedCountry);

    const normalized = query.trim().toLowerCase();
    const textFiltered =
      normalized
        ? source.filter(
            (clinic) =>
              clinic.city.toLowerCase().includes(normalized) ||
              clinic.postcode.toLowerCase().includes(normalized) ||
              clinic.region.toLowerCase().includes(normalized)
          )
        : source;

    const originPoint = geocodedOrigin ?? findOriginFromQuery(source, query);
    const filtered =
      textFiltered.length === 0 && geocodedOrigin ? source : textFiltered;
    const sorted = sortClinicsByNearest(filtered, originPoint);
    return { clinics: sorted, origin: originPoint };
  }, [query, selectedCountry, geocodedOrigin]);

  const mapSrc = useMemo(() => {
    if (mapFocusClinicId) {
      const focused = clinics.find((c) => c.id === mapFocusClinicId);
      if (focused) return buildMapSrcForClinic(focused);
    }
    return buildMapSrc(clinics, origin);
  }, [clinics, mapFocusClinicId, origin]);

  const handleCopy = async (clinic: Clinic) => {
    const parts = [clinic.name];
    if (clinic.phone) parts.push(clinic.phone);
    const address = clinic.address1 ? `${clinic.address1}, ${clinic.city} ${clinic.postcode}` : `${clinic.city} ${clinic.postcode}`;
    parts.push(address);
    const text = parts.join(" | ");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedClinicId(clinic.id);
      setTimeout(() => setCopiedClinicId(null), 1500);
    } catch {
      setCopiedClinicId(null);
    }
  };

  const body = (
    <>
      <div className={isModalMode ? "mb-4 grid gap-3 md:grid-cols-[1fr_auto_auto]" : "mb-6 grid gap-3 md:grid-cols-[1fr_auto_auto]"}>
        <div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter ZIP, postcode, or city"
              className="pl-10"
            />
          </div>
          {isGeocoding && (
            <p className="mt-1 text-xs text-muted-foreground" aria-live="polite">
              Searching…
            </p>
          )}
        </div>

        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value as "US" | "UK" | "ALL")}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="Choose country scope"
        >
          <option value="UK">UK</option>
          <option value="US">US</option>
          <option value="ALL">Global</option>
        </select>

        <Button variant="outline" className="rounded-full" onClick={() => setQuery("")}>
          Reset search
        </Button>
      </div>

      {isMobile && (
        <div className="mb-4 flex justify-center">
          <div className="inline-flex rounded-full bg-muted p-1">
            <button
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                !showMap ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
              onClick={() => setShowMap(false)}
            >
              List
            </button>
            <button
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                showMap ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
              onClick={() => setShowMap(true)}
            >
              Map
            </button>
          </div>
        </div>
      )}

      <div className={isModalMode ? "grid min-h-0 flex-1 gap-4 lg:grid-cols-2" : "grid gap-6 lg:grid-cols-2"}>
        {(!isMobile || !showMap) && (
          <div className={isModalMode ? "min-h-0 space-y-3 overflow-y-auto pr-1" : "space-y-3"}>
            {clinics.length === 0 && (
              <Card>
                <CardContent className="p-5 text-sm text-muted-foreground">
                  No clinics matched your search. Try a nearby city, state, or ZIP prefix.
                </CardContent>
              </Card>
            )}

            {clinics.map((clinic) => {
              const miles = origin ? Math.round(distanceMiles(origin.lat, origin.lng, clinic.lat, clinic.lng)) : null;

              return (
                <Card
                  key={clinic.id}
                  className="cursor-pointer border-border/80 transition-colors hover:border-primary/50"
                  onClick={() => setMapFocusClinicId(clinic.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {clinic.country} · {clinic.region}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-foreground">{clinic.name}</h3>
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          {!(hideClinicContactDetails || hideDirectContact) && (
                            <p className="flex items-start gap-2">
                              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <span>
                                {clinic.address1 ? (
                                  <>
                                    {clinic.address1}
                                    {clinic.address2 ? `, ${clinic.address2}` : ""}, {clinic.city} {clinic.postcode}
                                  </>
                                ) : (
                                  `${clinic.city} ${clinic.postcode}`
                                )}
                              </span>
                            </p>
                          )}
                          {(hideClinicContactDetails || hideDirectContact) && (
                            <p className="flex items-start gap-2">
                              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <span>{clinic.city} {clinic.postcode}</span>
                            </p>
                          )}
                          {!hideDirectContact && !hideClinicContactDetails && clinic.phone && (
                            <p className="flex items-center gap-2">
                              <Phone className="h-4 w-4 shrink-0 text-primary" />
                              <a href={`tel:${clinic.phone}`} className="hover:text-foreground">
                                {clinic.phone}
                              </a>
                            </p>
                          )}
                          {!hideDirectContact && !hideClinicContactDetails && clinic.email && (
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

                      <div
                        className="flex shrink-0 flex-col gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {hideDirectContact ? (
                          <Button
                            size="sm"
                            className="rounded-full"
                            onClick={() => {
                              if (onContactClinic) {
                                onContactClinic(clinic.id);
                                return;
                              }
                              router.push(`/contact?clinicId=${encodeURIComponent(clinic.id)}`);
                            }}
                          >
                            Contact clinic
                          </Button>
                        ) : (
                          <Button asChild size="sm" className="rounded-full">
                            <a href={clinic.bookingUrl ?? "/contact"}>
                              Contact
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </Button>
                        )}

                        <Button asChild size="sm" variant="outline" className="rounded-full">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              hideClinicContactDetails || !clinic.address1
                                ? `${clinic.city} ${clinic.postcode}`
                                : `${clinic.address1}, ${clinic.city} ${clinic.postcode}`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Directions
                          </a>
                        </Button>

                        {!hideDirectContact && !hideClinicContactDetails && (
                          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => handleCopy(clinic)}>
                            {copiedClinicId === clinic.id ? (
                              <>
                                <Check className="mr-1 h-3 w-3" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="mr-1 h-3 w-3" /> Copy details
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {(!isMobile || showMap) && (
          <div className={isModalMode ? "min-h-0 overflow-hidden rounded-2xl border border-border/80 shadow-sm" : "overflow-hidden rounded-2xl border border-border/80 shadow-sm"}>
            <iframe
              title="Clinic locations"
              src={mapSrc}
              className={isModalMode ? "h-full min-h-[320px] w-full border-0" : "h-[420px] w-full border-0 md:h-[560px]"}
              loading="lazy"
            />
          </div>
        )}
      </div>
    </>
  );

  return (
    <section id="clinic-finder" className={isModalMode ? "h-full min-h-0" : "section-shell"}>
      <div className={isModalMode ? "flex h-full min-h-0 flex-col" : "container mx-auto px-4"}>
        {showHeader && (
          <div className="mb-8 text-center md:mb-10">
            <h2 className="section-title">Find a clinic near you</h2>
            <p className="mx-auto mt-3 max-w-2xl section-copy">
              Search by ZIP/postcode or city. We prioritize US locations and keep UK coverage available.
            </p>
          </div>
        )}
        {body}
      </div>
    </section>
  );
}
