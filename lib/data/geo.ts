import type { Clinic } from "@/lib/data/types";

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function distanceMiles(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(bLat - aLat);
  const dLng = toRadians(bLng - aLng);
  const lat1 = toRadians(aLat);
  const lat2 = toRadians(bLat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * earthRadiusMiles * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function sortClinicsByNearest(clinics: Clinic[], origin?: { lat: number; lng: number }): Clinic[] {
  if (!origin) {
    return clinics.slice().sort((a, b) => a.city.localeCompare(b.city));
  }

  return clinics
    .slice()
    .sort(
      (a, b) =>
        distanceMiles(origin.lat, origin.lng, a.lat, a.lng) -
        distanceMiles(origin.lat, origin.lng, b.lat, b.lng)
    );
}

export function findOriginFromQuery(clinics: Clinic[], query: string): { lat: number; lng: number } | undefined {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return undefined;

  const direct = clinics.find(
    (clinic) =>
      clinic.city.toLowerCase().includes(normalized) ||
      clinic.postcode.toLowerCase().includes(normalized)
  );

  return direct ? { lat: direct.lat, lng: direct.lng } : undefined;
}
