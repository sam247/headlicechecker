import type { Metadata } from "next";
import SuggestClinicForm from "@/components/site/SuggestClinicForm";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Suggest a Clinic",
  description: "Suggest a UK clinic for manual directory review before publication.",
  path: "/suggest-clinic",
});

export default function SuggestClinicPage() {
  return (
    <section className="section-shell">
      <div className="container mx-auto max-w-3xl px-4">
        <h1 className="section-title text-left">Suggest a clinic</h1>
        <p className="mt-3 section-copy text-left">
          Share clinic details for manual review. Suggestions are checked before any listing is published.
        </p>
        <div className="mt-6">
          <SuggestClinicForm />
        </div>
      </div>
    </section>
  );
}
