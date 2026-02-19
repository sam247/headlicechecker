import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Download } from "lucide-react";
import ClinicEnquiryForm from "@/components/site/ClinicEnquiryForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getSiteCopy } from "@/lib/data/content";
import { breadcrumbJsonLd, faqJsonLd, medicalWebPageJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

const copy = getSiteCopy();

export const metadata: Metadata = pageMetadata({
  title: "For Clinic Partners",
  description:
    "A clinic partner hub covering lead operations, curated resources, implementation guides, and structured enquiry onboarding.",
  path: "/for-clinics",
});

const hubNav = [
  { href: "#overview", label: "Overview" },
  { href: "#lead-ops", label: "Lead ops" },
  { href: "#curated-articles", label: "Curated articles" },
  { href: "#guides", label: "Guides" },
  { href: "#downloads", label: "Downloads" },
  { href: "#enquiry", label: "Enquiry" },
];

const leadOps = [
  {
    title: "Lead qualification standards",
    copy: "Use consistent triage criteria so teams can separate high-intent confirmation requests from exploratory enquiries.",
    points: [
      "Prioritize repeat-indicator and persistent-symptom cases",
      "Confirm core context before scheduling follow-up",
      "Keep eligibility and response expectations explicit",
    ],
  },
  {
    title: "Response workflow and SLAs",
    copy: "Structured response windows improve conversion and reduce drop-off. Families benefit when expectations are clear at first contact.",
    points: [
      "Define first-response target windows",
      "Confirm likely next steps in plain language",
      "Escalate unresolved cases through a standard path",
    ],
  },
  {
    title: "Family handoff clarity",
    copy: "The best handoff experience combines concise context capture with actionable scheduling guidance. Avoid generic responses when case context is available.",
    points: [
      "Reference scan and symptom timeline details",
      "State what confirmation will involve",
      "Reduce friction between first contact and booking",
    ],
  },
  {
    title: "Onboarding and readiness checklist",
    copy: "Partner performance is strongest when service area, response ownership, and contact workflow are aligned before listing activation.",
    points: [
      "Confirm service coverage and capacity",
      "Align enquiry routing ownership",
      "Review consent and privacy handling standards",
    ],
  },
];

const curatedArticles = [
  {
    href: "/blog/head-lice-treatment-for-adults",
    title: "Head Lice Treatment for Adults",
    description: "High-intent treatment pathway context families ask about before booking.",
    relevance: "Why this matters for clinics: improves pre-visit expectation setting and reduces repetitive baseline questions.",
  },
  {
    href: "/blog/what-are-the-first-signs-of-head-lice",
    title: "First Signs of Head Lice",
    description: "Symptom-first guidance that shapes early triage quality.",
    relevance: "Why this matters for clinics: helps families provide clearer symptom timelines at first contact.",
  },
  {
    href: "/head-lice-symptoms",
    title: "Head Lice Symptoms Guide",
    description: "Structured symptom interpretation for practical follow-up decisions.",
    relevance: "Why this matters for clinics: supports faster context gathering and clearer confirmation pathways.",
  },
  {
    href: "/how-it-works",
    title: "How the AI Process Works",
    description: "Transparent scan-to-confirmation process explanation.",
    relevance: "Why this matters for clinics: aligns partner teams with the same confirmation gate users see before escalation.",
  },
];

const guides = [
  {
    href: "/methodology",
    title: "Methodology",
    description: "Detection normalization, confidence logic, and evidence rendering approach.",
  },
  {
    href: "/clinical-safety",
    title: "Clinical Safety",
    description: "Risk boundaries and escalation design across the user journey.",
  },
  {
    href: "/editorial-policy",
    title: "Editorial Policy",
    description: "Governance standards for non-diagnostic copy and guidance updates.",
  },
];

const downloads = [
  {
    title: "Intake script template",
    format: "DOCX",
    copy: "A structured script for first-response clinic intake and expectation setting.",
  },
  {
    title: "Follow-up checklist",
    format: "PDF",
    copy: "A practical checklist for consistent post-enquiry communication.",
  },
  {
    title: "Weekly lead review sheet",
    format: "XLSX",
    copy: "A simple tracker for lead quality, response timing, and conversion trends.",
  },
];

const faqs = [
  {
    question: "How does the lead-first model improve enquiry quality?",
    answer:
      "Families arrive after a scan and confirmation step, so routed enquiries are typically more focused than generic cold outreach.",
  },
  {
    question: "Are direct contact details shown before form submit?",
    answer:
      "No. Enquiries are intentionally centralized through structured forms to preserve context and traceability.",
  },
  {
    question: "What should clinics optimize first after onboarding?",
    answer:
      "Response window clarity, service coverage transparency, and consistent handoff language usually create the biggest quality gains.",
  },
  {
    question: "Does this replace clinical diagnosis?",
    answer:
      "No. The platform provides indicative triage only. Clinics remain responsible for professional confirmation and care decisions.",
  },
];

export default function ForClinicsPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "For Clinics", path: "/for-clinics" },
  ]);

  const webpage = medicalWebPageJsonLd({
    name: "Clinic partner operations hub",
    path: "/for-clinics",
    description: "Lead operations guidance, curated resources, and structured clinic onboarding pathways.",
    reviewedAt: "2026-02-19",
  });

  const service = serviceJsonLd({
    name: "Clinic partner lead routing",
    path: "/for-clinics",
    description: "Structured family enquiry routing and partner readiness workflow for head lice clinics.",
  });

  const midpoint = Math.ceil(faqs.length / 2);
  const leftFaqs = faqs.slice(0, midpoint);
  const rightFaqs = faqs.slice(midpoint);

  return (
    <section className="section-shell pb-8 md:pb-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--secondary))_0%,transparent_45%)]" />
        <div className="container relative z-10 mx-auto grid gap-8 px-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Clinics Hub</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">
              A partner operations hub for higher-quality head lice follow-up enquiries
            </h1>
            <p className="mt-4 section-copy max-w-3xl">
              This hub organizes the workflows clinics need most: lead qualification standards, response operations, curated guidance, and structured onboarding. It is designed to help teams convert confirmed intent into clear next-step care pathways.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-full" size="lg">
                <Link href="/find-clinics">View finder experience</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full" size="lg">
                <Link href="#enquiry">Submit partner enquiry</Link>
              </Button>
              <Button asChild variant="ghost" className="rounded-full" size="lg">
                <Link href="/how-it-works">See process flow</Link>
              </Button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Partner outcomes</h2>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• Improve lead quality with confirmation-gated intake.</li>
              <li>• Standardize response windows and handoff language.</li>
              <li>• Scale coverage with operational consistency.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="mt-[72px] flex flex-wrap gap-3 text-sm md:mt-24">
          {hubNav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full border border-border bg-muted/20 px-3 py-1.5 font-medium hover:bg-muted/40">
              {item.label}
            </Link>
          ))}
        </div>

        <section id="overview" className="mt-10">
          <h2 className="text-2xl font-bold md:text-3xl">Overview</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="border-b border-border pb-5">
              <h3 className="font-semibold">Operational clarity</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Partner clinics perform best when operational clarity is built into every stage: intake, response, and confirmation handoff. The platform supports that by routing family enquiries through structured forms after scan-driven decision steps.
              </p>
            </div>
            <div className="border-b border-border pb-5">
              <h3 className="font-semibold">Conversion-quality handoff</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                This reduces context loss and helps teams prioritize care conversations where uncertainty or elevated risk is most likely. The result is better service quality and stronger follow-through intent.
              </p>
            </div>
          </div>
        </section>

        <section id="lead-ops" className="mt-10">
          <h2 className="text-2xl font-bold md:text-3xl">Clinic operations hub</h2>
          <p className="mt-3 section-copy max-w-4xl">
            Use these modules to standardize lead handling and improve conversion quality without overcomplicating frontline workflows.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {leadOps.map((item) => (
              <Card key={item.title}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">{item.copy}</p>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {item.points.map((point) => (
                      <li key={point}>• {point}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="curated-articles" className="mt-10">
          <h2 className="text-2xl font-bold md:text-3xl">Curated articles for clinic teams</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {curatedArticles.map((article) => (
              <Card key={article.href}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold">{article.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{article.description}</p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{article.relevance}</p>
                  <Link href={article.href} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    Open resource
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="guides" className="mt-10">
          <h2 className="text-2xl font-bold md:text-3xl">Method and safety guides</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {guides.map((guide) => (
              <Card key={guide.href}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold">{guide.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{guide.description}</p>
                  <Link href={guide.href} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    Read guide
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="downloads" className="mt-10">
          <h2 className="text-2xl font-bold md:text-3xl">Downloads</h2>
          <p className="mt-3 section-copy">Download assets are planned and will be published in this hub soon.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {downloads.map((item) => (
              <Card key={item.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">{item.format}</p>
                    <span className="rounded-full border border-border bg-muted/30 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      Coming soon
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.copy}</p>
                  <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Download className="h-4 w-4" />
                    Not available yet
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="enquiry" className="mt-10 rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="text-2xl font-bold">Partner enquiry</h2>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            Share your clinic details and operational coverage. Our team will review fit, routing readiness, and onboarding requirements.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild className="rounded-full">
              <Link href="/#start-scan">{copy.primaryCta}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/find-clinics">{copy.secondaryCta}</Link>
            </Button>
          </div>
          <div className="mt-6">
            <ClinicEnquiryForm />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">FAQ</h2>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <Accordion type="single" collapsible className="w-full">
              {leftFaqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`left-${index}`} className="border-border">
                  <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-7 text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Accordion type="single" collapsible className="w-full">
              {rightFaqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`right-${index}`} className="border-border">
                  <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-7 text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <p className="mt-4 text-xs text-muted-foreground">{copy.medicalDisclaimer}</p>
      </div>
    </section>
  );
}
