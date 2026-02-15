import type { Metadata } from "next";
import ClinicContactForm from "@/components/site/ClinicContactForm";
import { getClinics } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Contact NitNot",
  description: "Contact NitNot for clinic support, partnership enquiries, or general questions.",
  alternates: { canonical: "/contact" },
};

interface ContactPageProps {
  searchParams: { clinicId?: string };
}

export default function ContactPage({ searchParams }: ContactPageProps) {
  const clinics = getClinics("ALL");
  const selectedClinic = clinics.find((c) => c.id === searchParams.clinicId);

  return (
    <section className="section-shell">
      <div className="container mx-auto max-w-3xl px-4">
        <h1 className="section-title">Contact NitNot</h1>
        <p className="mt-3 section-copy">For clinic support, partnership inquiries, or general help, use the form below.</p>
        <div className="mt-7">
          <ClinicContactForm compact clinicId={selectedClinic?.id} clinicName={selectedClinic?.name} />
        </div>
      </div>
    </section>
  );
}
