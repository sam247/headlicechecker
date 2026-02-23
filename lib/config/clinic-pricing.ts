export interface ClinicPricingConfig {
  featuredLabel: string;
  standardLabel: string;
}

const DEFAULT_PRICE_LABEL = "Contact us";

export function getClinicPricingConfig(): ClinicPricingConfig {
  return {
    featuredLabel: process.env.CLINIC_PRICING_FEATURED_LABEL?.trim() || DEFAULT_PRICE_LABEL,
    standardLabel: process.env.CLINIC_PRICING_STANDARD_LABEL?.trim() || DEFAULT_PRICE_LABEL,
  };
}
