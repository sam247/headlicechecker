import type { Clinic } from "@/lib/data/types";

export interface ClinicPartnerBadge {
  key: string;
  label: string;
  variant: "default" | "outline" | "secondary";
}

export interface ClinicPartnerPresentation {
  badges: ClinicPartnerBadge[];
  highlightCard: boolean;
  showRegionalBanner: boolean;
}

export function getClinicPartnerPresentation(clinic: Clinic): ClinicPartnerPresentation {
  const badges: ClinicPartnerBadge[] = [];

  if (clinic.founding_partner) {
    badges.push({ key: "founding_partner", label: "Founding Partner", variant: "secondary" });
  }
  if (clinic.partner_status === "verified") {
    badges.push({ key: "verified_regional_clinic", label: "Verified Regional Clinic", variant: "outline" });
  }

  return {
    badges,
    highlightCard: clinic.partner_status === "featured" || clinic.tier === "featured",
    showRegionalBanner: clinic.partner_status === "exclusive",
  };
}

