import ClinicFinder from "@/components/ClinicFinder";
import ClinicContactForm from "@/components/site/ClinicContactForm";

export default function FindClinicsPage() {
  return (
    <div>
      <ClinicFinder country="US" />
      <section className="section-shell pt-0">
        <div className="container mx-auto max-w-3xl px-4">
          <ClinicContactForm />
        </div>
      </section>
    </div>
  );
}
