import ClinicContactForm from "@/components/site/ClinicContactForm";

export default function ContactPage() {
  return (
    <section className="section-shell">
      <div className="container mx-auto max-w-3xl px-4">
        <h1 className="section-title">Contact NitNot</h1>
        <p className="mt-3 section-copy">
          For clinic support, partnership inquiries, or general help, use the form below.
        </p>
        <div className="mt-7">
          <ClinicContactForm compact />
        </div>
      </div>
    </section>
  );
}
