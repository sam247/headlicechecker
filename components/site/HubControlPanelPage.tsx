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

const SECTION_GROUPS = [
  { title: "How this hub works", range: [0, 2] as const },
  { title: "Operational guidance", range: [2, 5] as const },
  { title: "Risk and escalation context", range: [5, 8] as const },
  { title: "Summary", range: [8, 9] as const },
];

export default function HubControlPanelPage({ page, clusterPages }: HubControlPanelPageProps) {
  const ctas = ctaConfig(page.pillar);
  const intro = shortIntro(page.intro);

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

        <div id="next-steps" className="mt-12 space-y-10 max-w-4xl">
          {SECTION_GROUPS.map((group) => {
            const groupSections = page.sections.slice(group.range[0], group.range[1]);
            if (groupSections.length === 0) return null;
            return (
              <section key={group.title} className="border-t border-border/60 pt-8">
                <h2 className="text-2xl font-semibold">{group.title}</h2>
                <div className="mt-6 space-y-8">
                  {groupSections.map((section) => (
                    <article key={section.heading}>
                      <h3 className="text-lg font-semibold">{section.heading}</h3>
                      <div className="mt-3 space-y-3 text-base leading-8 text-muted-foreground">
                        {section.paragraphs.map((paragraph, index) => (
                          <p key={`${section.heading}-${index}`}>{paragraph}</p>
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
            );
          })}
        </div>

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
