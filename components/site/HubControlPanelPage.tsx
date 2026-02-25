import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StructuredEscalationModel from "@/components/site/StructuredEscalationModel";
import type { ContentPage } from "@/lib/data/types";

interface HubControlPanelPageProps {
  page: ContentPage;
  clusterPages: ContentPage[];
}

function shortIntro(intro: string): string {
  const sentences = intro
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, 3);
  return sentences.join(" ");
}

function hubLabel(pillar: ContentPage["pillar"]): string {
  if (pillar === "ai-detection") return "AI Detection";
  if (pillar === "professional") return "Professional";
  return "Symptoms";
}

function ctaConfig(pillar: ContentPage["pillar"]) {
  if (pillar === "professional") {
    return {
      primary: { href: "/find-clinics", label: "Find Clinics" },
      secondary: { href: "/#start-scan", label: "Start Free Scan" },
    };
  }
  if (pillar === "symptoms") {
    return {
      primary: { href: "/#start-scan", label: "Start Free Scan" },
      secondary: { href: "/professional", label: "Professional Hub" },
    };
  }
  return {
    primary: { href: "/#start-scan", label: "Start Free Scan" },
    secondary: { href: "/find-clinics", label: "Find Clinics" },
  };
}

const FLOW_BY_PILLAR: Record<ContentPage["pillar"], { title: string; detail: string }[]> = {
  "ai-detection": [
    { title: "Start With A Clear Scan", detail: "Use strong lighting and parting before interpreting confidence." },
    { title: "Recheck For Consistency", detail: "Repeat with the same method before acting on mixed results." },
    { title: "Escalate When Needed", detail: "Use clinic confirmation if likely indicators persist." },
  ],
  professional: [
    { title: "Shortlist Local Clinics", detail: "Compare response speed, follow-up policy, and communication quality." },
    { title: "Prepare A Clean Handover", detail: "Bring symptom timing, check notes, and prior attempts." },
    { title: "Confirm And Follow Through", detail: "Use agreed follow-up windows to reduce repeat uncertainty." },
  ],
  symptoms: [
    { title: "Spot The Pattern", detail: "Separate one-off irritation from repeated likely indicators." },
    { title: "Run Structured Rechecks", detail: "Use the same method and track what changes." },
    { title: "Escalate Calmly", detail: "Move to professional confirmation if signs persist." },
  ],
};

function sectionId(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function HubControlPanelPage({ page, clusterPages }: HubControlPanelPageProps) {
  const ctas = ctaConfig(page.pillar);
  const intro = shortIntro(page.intro);
  const flowSteps = FLOW_BY_PILLAR[page.pillar];

  return (
    <section className="section-shell">
      <div className="container mx-auto max-w-5xl px-4">
        <header id="overview" className="max-w-4xl">
          <h1 className="section-title">{page.title}</h1>
          <p className="mt-4 section-copy">{intro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="rounded-full">
              <Link href={ctas.primary.href}>{ctas.primary.label}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href={ctas.secondary.href}>{ctas.secondary.label}</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            This structured model explains how decisions move from detection toward confirmation.
          </p>
        </header>

        <section className="mt-8 rounded-2xl border border-border/80 bg-card p-6">
          <h2 className="text-xl font-semibold">Use this hub in 3 steps</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {flowSteps.map((step, index) => (
              <article key={step.title} className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step {index + 1}</p>
                <h3 className="mt-1 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <StructuredEscalationModel />

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">What this hub covers</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            These guides route specific questions into practical next steps with a calm, non-diagnostic framework.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {clusterPages.map((article) => (
              <Card
                key={article.path}
                className="border-border/80 transition duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm"
              >
                <CardContent className="overflow-hidden p-0">
                  <Link href={article.path} className="relative block aspect-[16/10] w-full bg-muted">
                    <Image
                      src={article.image ?? "/logo_new.png"}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </Link>
                  <div className="p-5">
                    <h3 className="text-base font-semibold leading-snug">
                      <Link href={article.path} className="hover:text-primary">
                        {article.title}
                      </Link>
                    </h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{article.description}</p>
                  <Link href={article.path} className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">
                    Read guide
                  </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Decision Boundaries</h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground md:text-base">
            <p>AI output is a screening signal designed for triage, not a diagnosis.</p>
            <p>Confidence tiers should guide urgency and recheck decisions before escalation.</p>
            <p>Professional confirmation is appropriate when likely indicators persist or confidence remains uncertain.</p>
          </div>
        </section>

        <section id="next-steps" className="mt-12 max-w-4xl">
          <h2 className="text-2xl font-semibold">Hub guidance</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {page.sections.map((section, index) => (
              <Link
                key={`jump-${section.heading}`}
                href={`#${sectionId(section.heading)}`}
                className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                {index + 1}. {section.heading}
              </Link>
            ))}
          </div>

          <div className="mt-6 space-y-5">
            {page.sections.map((section, index) => (
              <article key={section.heading} id={sectionId(section.heading)} className="rounded-2xl border border-border/80 bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Section {index + 1}</p>
                <h3 className="mt-1 text-lg font-semibold">{section.heading}</h3>
                <div className="mt-3 space-y-3 text-base leading-8 text-muted-foreground">
                  {section.paragraphs.map((paragraph, paragraphIndex) => (
                    <p key={`${section.heading}-${paragraphIndex}`}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets?.length ? (
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-8 text-muted-foreground">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Continue within {hubLabel(page.pillar)}</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {clusterPages.map((article) => (
              <Link key={`continue-${article.path}`} href={article.path} className="text-sm font-medium text-primary hover:underline">
                {article.title}
              </Link>
            ))}
            <Link href="/locations" className="text-sm font-medium text-primary hover:underline">
              View clinics by location
            </Link>
          </div>
        </section>

        <div id="faq" className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-2xl font-bold">Frequently asked questions</h2>
          <div className="mt-5 space-y-4">
            {page.faqs.map((faq) => (
              <div key={faq.question} className="rounded-xl border border-border/80 bg-muted/25 p-4">
                <h3 className="text-base font-semibold">{faq.question}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
