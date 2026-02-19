import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getSiteCopy } from "@/lib/data/content";
import { breadcrumbJsonLd, faqJsonLd, medicalWebPageJsonLd, pageMetadata } from "@/lib/seo";

const copy = getSiteCopy();

export const metadata: Metadata = pageMetadata({
  title: "For Schools and Childcare Teams",
  description:
    "A schools hub for head lice communication playbooks, curated guidance, implementation resources, and practical escalation pathways.",
  path: "/for-schools",
});

const hubNav = [
  { href: "#overview", label: "Overview" },
  { href: "#playbooks", label: "Playbooks" },
  { href: "#curated-articles", label: "Curated articles" },
  { href: "#guides", label: "Guides" },
  { href: "#downloads", label: "Downloads" },
  { href: "#faq", label: "FAQ" },
];

const playbooks = [
  {
    title: "Outbreak communication cadence",
    copy: "Use one parent notice, one follow-up reminder, and one escalation touchpoint. This keeps guidance calm, repeatable, and easier for families to act on.",
    points: [
      "Issue same-day neutral language updates",
      "Schedule one clear reminder window",
      "Standardize escalation wording across staff",
    ],
  },
  {
    title: "Parent notice structure",
    copy: "Notices should explain what to check, how to check, and when to seek confirmation. Avoid stigmatizing language and avoid classroom-specific identifiers.",
    points: [
      "Include practical home check instructions",
      "State non-diagnostic boundaries clearly",
      "Link scan-first and clinic follow-up routes",
    ],
  },
  {
    title: "Escalation criteria and timing",
    copy: "Escalate quickly when symptoms persist, indicators repeat, or multiple household contacts report concerns. A time-bound policy reduces uncertainty.",
    points: [
      "Escalate repeated likely indicators",
      "Escalate persistent symptom windows",
      "Use clinic referral language without delay",
    ],
  },
  {
    title: "Weekly monitoring framework",
    copy: "Review notice outcomes weekly and update template language where confusion appears. Continuous small refinements improve parent response quality over time.",
    points: [
      "Track basic response milestones only",
      "Identify recurring parent uncertainty themes",
      "Tighten copy each cycle for clarity",
    ],
  },
];

const curatedArticles = [
  {
    href: "/blog/what-are-the-first-signs-of-head-lice",
    title: "First Signs of Head Lice",
    description: "Early signal guidance for parents and caregivers.",
    relevance: "Why this matters for schools: better early pattern recognition reduces rumor-led escalation.",
  },
  {
    href: "/head-lice-symptoms",
    title: "Head Lice Symptoms Guide",
    description: "Practical symptom interpretation and what to check first.",
    relevance: "Why this matters for schools: supports consistent parent messaging during active exposure windows.",
  },
  {
    href: "/nits-vs-dandruff",
    title: "Nits vs Dandruff",
    description: "Clear visual comparison guidance to reduce false alarms.",
    relevance: "Why this matters for schools: lowers unnecessary panic and improves communication quality.",
  },
  {
    href: "/how-it-works",
    title: "How the AI Process Works",
    description: "Transparent scan-to-confirmation workflow.",
    relevance: "Why this matters for schools: helps teams explain decision boundaries and escalation order.",
  },
];

const guides = [
  {
    href: "/clinical-safety",
    title: "Clinical Safety",
    description: "Risk boundaries and escalation triggers for non-diagnostic workflows.",
  },
  {
    href: "/editorial-policy",
    title: "Editorial Policy",
    description: "Content standards for consistent, practical guidance language.",
  },
  {
    href: "/methodology",
    title: "Methodology",
    description: "How detections and confidence tiers are produced and governed.",
  },
];

const downloads = [
  {
    title: "Parent notice template",
    format: "DOCX",
    copy: "A standardized non-stigmatizing notice format for outbreak communication.",
  },
  {
    title: "Classroom response checklist",
    format: "PDF",
    copy: "A practical checklist for same-day school response and follow-up timing.",
  },
  {
    title: "Escalation log sheet",
    format: "XLSX",
    copy: "A lightweight log for tracking notices, reminders, and escalation milestones.",
  },
];

const faqs = [
  {
    question: "Should schools make diagnostic claims?",
    answer:
      "No. Schools should provide practical guidance and direct families toward professional confirmation when risk remains elevated.",
  },
  {
    question: "What is the recommended action order for families?",
    answer:
      "Scan first with strong image quality, review output and symptoms, then escalate to clinic support if indicators repeat or uncertainty persists.",
  },
  {
    question: "How can schools reduce mixed messaging during outbreaks?",
    answer:
      "Use one shared notice template, one follow-up schedule, and one escalation policy so staff and families receive the same guidance flow.",
  },
  {
    question: "What operational data should schools track?",
    answer:
      "Track only minimal operational milestones like notice dates and follow-up completion. Avoid collecting unnecessary sensitive data.",
  },
];

export default function ForSchoolsPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "For Schools", path: "/for-schools" },
  ]);

  const webpage = medicalWebPageJsonLd({
    name: "Schools and childcare head lice hub",
    path: "/for-schools",
    description: "Playbooks, curated resources, and implementation guidance for school and childcare teams.",
    reviewedAt: "2026-02-19",
  });

  const midpoint = Math.ceil(faqs.length / 2);
  const leftFaqs = faqs.slice(0, midpoint);
  const rightFaqs = faqs.slice(midpoint);

  return (
    <section className="section-shell pb-[72px] md:pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }} />

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--secondary))_0%,transparent_45%)]" />
        <div className="container relative z-10 mx-auto grid gap-8 px-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Schools Hub</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">
              Operational head lice guidance for schools and childcare teams
            </h1>
            <p className="mt-4 section-copy max-w-3xl">
              This hub is designed for real school workflows: calm communications, repeatable parent instructions, and structured clinic escalation when needed. Use it as a centralized reference for staff, notices, and family support pathways.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-full" size="lg">
                <Link href="/#start-scan">{copy.primaryCta}</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full" size="lg">
                <Link href="/find-clinics">{copy.secondaryCta}</Link>
              </Button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <School className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Hub outcomes</h2>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• Align all staff on one outbreak communication rhythm.</li>
              <li>• Give families practical scan-first instructions.</li>
              <li>• Route higher-risk scenarios to clinic support faster.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
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
              <h3 className="font-semibold">School response clarity</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Schools need consistency more than complexity. During exposure periods, uncertainty spreads faster than reliable guidance. This hub concentrates the highest-impact workflows in one place so teams can move from alert to action without rewriting processes each time.
              </p>
            </div>
            <div className="border-b border-border pb-5">
              <h3 className="font-semibold">Workflow guardrails</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                The core model is simple: issue calm communication, give practical home-check instructions, and escalate uncertain or persistent cases quickly to professional confirmation. This reduces avoidable panic while still protecting family decision quality.
              </p>
            </div>
          </div>
        </section>

        <section id="playbooks" className="mt-10">
          <h2 className="text-2xl font-bold md:text-3xl">Operational playbooks</h2>
          <p className="mt-3 section-copy max-w-4xl">
            Use these playbooks to standardize team behavior and reduce improvisation when parents need immediate direction.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {playbooks.map((playbook) => (
              <Card key={playbook.title}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold">{playbook.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">{playbook.copy}</p>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {playbook.points.map((point) => (
                      <li key={point}>• {point}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="curated-articles" className="mt-10">
          <h2 className="text-2xl font-bold md:text-3xl">Curated articles for school teams</h2>
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
          <h2 className="text-2xl font-bold md:text-3xl">Policy and methodology guides</h2>
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
          <p className="mt-3 section-copy">Resource downloads are in production. Preview the planned toolkit below.</p>
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

        <section id="faq" className="mt-10">
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

        <div className="mt-10 rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="text-2xl font-bold">Need rollout support?</h2>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            Use this hub as your operational base, then contact our team for implementation support tailored to your school or childcare workflow.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild className="rounded-full" size="lg">
              <Link href="/#start-scan">{copy.primaryCta}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full" size="lg">
              <Link href="/find-clinics">{copy.secondaryCta}</Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-full" size="lg">
              <Link href="/contact">Contact school support</Link>
            </Button>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">{copy.medicalDisclaimer}</p>
      </div>
    </section>
  );
}
