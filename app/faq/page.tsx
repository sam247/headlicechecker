import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getFaqs, getSiteCopy } from "@/lib/data/content";
import { faqJsonLd } from "@/lib/seo";

const faqs = getFaqs();
const copy = getSiteCopy();

export const metadata: Metadata = {
  title: "Head Lice Checker FAQ",
  description: "Answers to common questions about image quality, privacy, accuracy, and next steps.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <section className="section-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />
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

        <div className="mt-6 flex gap-4 text-sm">
          <Link href="/how-it-works" className="text-primary hover:underline">How it works</Link>
          <Link href="/contact" className="text-primary hover:underline">Contact support</Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{copy.medicalDisclaimer}</p>
      </div>
    </section>
  );
}
