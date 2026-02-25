import { permanentRedirect } from "next/navigation";

export default function LegacyForSchoolsPage() {
  permanentRedirect("/schools");
}
