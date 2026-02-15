import { Card, CardContent } from "@/components/ui/card";
import { getFaqs, getSiteCopy } from "@/lib/data/content";

const faqs = getFaqs();
const copy = getSiteCopy();

export default function FaqPage() {
  return (
    <section className="section-shell">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="section-title">Frequently asked questions</h1>
        <div className="mt-8 space-y-3">
          {faqs.map((faq) => (
            <Card key={faq.id}>
              <CardContent className="p-5">
                <h2 className="font-semibold">{faq.question}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">{copy.medicalDisclaimer}</p>
      </div>
    </section>
  );
}
