import { permanentRedirect } from "next/navigation";

export default function SuggestClinicLegacyPage() {
  permanentRedirect("/directory?suggest_clinic=1");
}
