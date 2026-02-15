import type { Metadata } from "next";
import ClinicFinder from "@/components/ClinicFinder";
import ClinicContactForm from "@/components/site/ClinicContactForm";
import { getClinics } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Find Head Lice Clinics",
  description: "Search nearby head lice clinics and request a callback with your preferred location.",
  alternates: { canonical: "/find-clinics" },
};

interface FindClinicsPageProps {
  searchParams: { clinicId?: string };
}

export default function FindClinicsPage({ searchParams }: FindClinicsPageProps) {
  const clinics = getClinics("ALL");
  const selectedClinic = clinics.find((c) => c.id === searchParams.clinicId);

  return (
    <div>
      <ClinicFinder country="US" />
      <section className="section-shell pt-0">
        <div className="container mx-auto max-w-3xl px-4">
          <ClinicContactForm clinicId={selectedClinic?.id} clinicName={selectedClinic?.name} />
        </div>
      </section>
    </div>
  );
}
