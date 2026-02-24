import "server-only";

import { getClinics, getClinicsForLocationPage } from "@/lib/data/content";
import type { Clinic, LocationSeoPage } from "@/lib/data/types";
import { mergeClinicsWithLeadStats } from "@/lib/server/clinic-stats";

export async function getClinicsWithLeadStats(country: "US" | "UK" | "ALL" = "US"): Promise<Clinic[]> {
  const clinics = getClinics(country);
  return mergeClinicsWithLeadStats(clinics);
}

export async function getClinicsForLocationPageWithLeadStats(
  page: LocationSeoPage,
  maxFeatured = 2,
  maxTotal = 6
): Promise<Clinic[]> {
  const clinics = getClinicsForLocationPage(page, maxFeatured, maxTotal);
  return mergeClinicsWithLeadStats(clinics);
}

