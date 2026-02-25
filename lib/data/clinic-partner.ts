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
  isVerifiedRegionalPartner: boolean;
}

const VERIFIED_PARTNER_STATUSES = new Set(["verified", "featured", "exclusive", "founding"]);

export function isVerifiedRegionalPartner(clinic: Clinic): boolean {
  if (clinic.partner_status && VERIFIED_PARTNER_STATUSES.has(clinic.partner_status)) return true;
  const partnerFlag = String(clinic.partner ?? "").trim().toLowerCase();
  if (["yes", "y", "true", "1"].includes(partnerFlag)) return true;
  return clinic.founding_partner === true;
}

export function getClinicPartnerPresentation(clinic: Clinic): ClinicPartnerPresentation {
  const badges: ClinicPartnerBadge[] = [];
  const verifiedPartner = isVerifiedRegionalPartner(clinic);

  if (clinic.founding_partner) {
    badges.push({ key: "founding_partner", label: "Founding Partner", variant: "secondary" });
  }
  if (verifiedPartner) {
    badges.push({ key: "verified_regional_partner", label: "Verified Regional Partner", variant: "outline" });
  }

  return {
    badges,
    highlightCard: clinic.partner_status === "featured" || clinic.tier === "featured",
    showRegionalBanner: clinic.partner_status === "exclusive",
    isVerifiedRegionalPartner: verifiedPartner,
  };
}
