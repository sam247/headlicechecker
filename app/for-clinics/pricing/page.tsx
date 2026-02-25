import { permanentRedirect } from "next/navigation";

export default function LegacyForClinicsPricingPage() {
  permanentRedirect("/clinics/pricing");
}
