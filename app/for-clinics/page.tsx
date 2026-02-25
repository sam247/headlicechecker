import { permanentRedirect } from "next/navigation";

export default function LegacyForClinicsPage() {
  permanentRedirect("/clinics");
}
