"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ImageIcon,
  Loader2,
  Shield,
  Sparkles,
  CalendarDays,
  BookOpenText,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PhotoChecker from "@/components/PhotoChecker";
import type { FaqItem, HomePageContent, SiteCopy } from "@/lib/data/types";

const HERO_DEMO_INTERVAL_MS = 1750;

interface LatestGuideItem {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  readMinutes: number;
}

interface HomePageClientProps {
  content: HomePageContent;
  faqs: FaqItem[];
  latestGuides: LatestGuideItem[];
  siteCopy: SiteCopy;
}

function readableDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function HomePageClient({ content, faqs, latestGuides, siteCopy }: HomePageClientProps) {
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroDemoPhase, setHeroDemoPhase] = useState<0 | 1 | 2 | 3>(0);
  const [cardHovered, setCardHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (reducedMotion || cardHovered) return;
    const t = setInterval(() => {
      setHeroDemoPhase((p) => ((p + 1) % 4) as 0 | 1 | 2 | 3);
    }, HERO_DEMO_INTERVAL_MS);
    return () => clearInterval(t);
  }, [reducedMotion, cardHovered]);

  const effectiveDemoPhase = reducedMotion ? 0 : heroDemoPhase;

  const startScan = useCallback((file: File) => {
    setHeroFile(file);
    document.getElementById("start-scan")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const consumeHeroFile = useCallback(() => setHeroFile(null), []);

  const reviewedAt = useMemo(() => readableDate(content.reviewedAt), [content.reviewedAt]);

  return (
    <div>
      <section className="relative overflow-hidden section-shell pb-12 md:pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--secondary))_0%,transparent_45%)]" />
        <div className="container relative z-10 mx-auto grid gap-8 px-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-900 ring-1 ring-orange-200">
              <Shield className="h-3.5 w-3.5 text-orange-700" />
              {content.hero.badge}
            </p>
            <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
              {content.hero.title}
              <span className="block text-primary">{content.hero.emphasis}</span>
            </h1>
            <div className="mt-4 max-w-2xl space-y-3">
              {content.hero.paragraphs.map((paragraph) => (
                <p key={paragraph} className="section-copy">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild className="rounded-full" size="lg">
                <Link href="#start-scan">{siteCopy.primaryCta}</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full" size="lg">
                <Link href="/find-clinics">{siteCopy.secondaryCta}</Link>
              </Button>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {content.hero.highlights.map((item) => (
                <div key={item} className="rounded-xl border border-border/80 bg-card px-3 py-2 text-sm">
                  <CheckCircle2 className="mr-2 inline h-4 w-4 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <Card
            className="border-2 border-dashed border-primary/30"
            onMouseEnter={() => setCardHovered(true)}
            onMouseLeave={() => setCardHovered(false)}
          >
            <CardContent className="p-7 text-center">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-xl font-semibold">Drop a photo to begin</h2>
                {!reducedMotion && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Preview
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">This sends the image directly into your free scan.</p>
              <div
                className="mt-5 flex h-[10.5rem] cursor-pointer flex-col items-center justify-center rounded-2xl border border-border bg-muted/40 p-8"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file?.type.startsWith("image/")) {
                    setHeroDemoPhase(0);
                    startScan(file);
                  }
                }}
              >
                {effectiveDemoPhase === 0 && (
                  <>
                    <p className="text-sm font-medium">Drag and drop an image</p>
                    <p className="mt-1 text-xs text-muted-foreground">or use the upload button in scan section</p>
                  </>
                )}
                {effectiveDemoPhase === 1 && (
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg border-2 border-primary/30 bg-muted/60 shadow-sm animate-in fade-in slide-in-from-right-8 duration-[600ms]">
                      <ImageIcon className="h-7 w-7 text-primary" />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">Photo added</p>
                  </div>
                )}
                {effectiveDemoPhase === 2 && (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm font-medium">Scanning...</p>
                  </div>
                )}
                {effectiveDemoPhase === 3 && (
                  <div className="flex flex-col items-center gap-2 animate-in fade-in duration-300">
                    <CheckCircle2 className="h-12 w-12 text-primary" />
                    <p className="text-sm font-medium">Indicative: lice detected</p>
                    <p className="text-xs text-muted-foreground">Scroll down to run your own scan.</p>
                    <Button asChild size="sm" className="mt-1 rounded-full">
                      <Link href="/find-clinics">View Closest Clinics</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardContent className="p-6 md:p-7">
                <h2 className="text-2xl font-bold md:text-3xl">{content.quickDecide.heading}</h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
                  {content.quickDecide.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardContent className="p-6 md:p-7">
                <h3 className="text-lg font-semibold">Practical boundaries that protect decision quality</h3>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <li>• {siteCopy.medicalDisclaimer}</li>
                  <li>• {siteCopy.privacyClaim}</li>
                  <li>• Strong image quality increases confidence and reduces re-check noise.</li>
                  <li>• Escalation support is available through the clinic finder when risk is elevated.</li>
                </ul>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button asChild className="rounded-full" size="sm">
                    <Link href="#start-scan">{siteCopy.primaryCta}</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full" size="sm">
                    <Link href="/how-it-works">How It Works</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="section-shell pt-0 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold md:text-3xl">{content.lookFor.heading}</h2>
          <p className="mt-3 section-copy max-w-4xl">{content.lookFor.intro}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {content.lookFor.items.map((item) => (
              <Card key={item.title}>
                <CardContent className="p-5">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">{item.copy}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold md:text-3xl">{content.monitorVsClinic.heading}</h2>
          <div className="mt-4 max-w-4xl space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
            {content.monitorVsClinic.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">Usually reasonable to monitor at home</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground md:text-base">
                  {content.monitorVsClinic.monitorSignals.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">Move to clinic confirmation promptly</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground md:text-base">
                  {content.monitorVsClinic.escalateSignals.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4 border-primary/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold">4-step decision framework</h3>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground md:text-base">
                {content.monitorVsClinic.framework.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Run your head lice checker scan now</h2>
                <p className="mt-2 text-sm text-muted-foreground md:text-base">
                  Upload a sharp close-up image for an indicative result. This tool supports triage and next-step planning, but does not replace clinical diagnosis.
                </p>
              </div>
              <Button asChild className="rounded-full" size="lg">
                <Link href="#start-scan">{siteCopy.primaryCta}</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{siteCopy.privacyClaim}</p>
          </div>
        </div>
      </section>

      <PhotoChecker initialFile={heroFile} onFileConsumed={consumeHeroFile} />

      <section className="section-shell pt-0 bg-muted/20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold md:text-3xl">{content.scenarios.heading}</h2>
          <p className="mt-3 section-copy max-w-4xl">{content.scenarios.intro}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {content.scenarios.cards.map((card) => (
              <Card key={card.title}>
                <CardContent className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">{card.audience}</p>
                  <h3 className="mt-2 font-semibold">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{card.copy}</p>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {card.points.map((point) => (
                      <li key={point}>• {point}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-bold md:text-3xl">{content.trust.heading}</h2>
                <p className="mt-3 section-copy">{content.trust.intro}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
                <p className="inline-flex items-center gap-2 font-medium text-foreground">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Last reviewed {reviewedAt}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Indicative screening guidance only. Professional confirmation is recommended when risk appears elevated.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {content.trust.links.map((item) => (
                <Card key={item.href}>
                  <CardContent className="p-5">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.copy}</p>
                    <Link href={item.href} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                      {item.label}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold">{content.lowerCta.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground md:text-base">{content.lowerCta.copy}</p>
              </div>
              <Button asChild className="rounded-full" size="lg">
                <Link href="/find-clinics">
                  {siteCopy.secondaryCta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pt-0 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">{content.guides.heading}</h2>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">{content.guides.intro}</p>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/blog">View all guides</Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {latestGuides.map((guide) => (
              <Card key={guide.slug}>
                <CardContent className="p-6">
                  <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <BookOpenText className="h-3.5 w-3.5 text-primary" />
                    Updated {readableDate(guide.updatedAt)}
                  </p>
                  <h3 className="mt-3 text-lg font-semibold leading-snug">
                    <Link href={`/blog/${guide.slug}`} className="hover:text-primary">
                      {guide.title}
                    </Link>
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{guide.description}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Published {readableDate(guide.publishedAt)} • {guide.readMinutes} min read
                  </p>
                  <Link href={`/blog/${guide.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    Read this practical guide
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <Link href="/head-lice-symptoms" className="text-primary hover:underline">
              Head lice symptoms guide
            </Link>
            <Link href="/nits-vs-dandruff" className="text-primary hover:underline">
              Nits vs dandruff comparison
            </Link>
            <Link href="/locations" className="text-primary hover:underline">
              Local clinic location guides
            </Link>
          </div>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">{content.faq.heading}</h2>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">{content.faq.intro}</p>
            </div>
            <Button asChild variant="ghost" className="rounded-full">
              <Link href="/faq">See all</Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {faqs.map((faq) => (
              <Card key={faq.id}>
                <CardContent className="p-5">
                  <h3 className="font-semibold">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
            <Link href="/how-it-works" className="text-primary hover:underline">
              How it works
            </Link>
            <Link href="/methodology" className="text-primary hover:underline inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Methodology
            </Link>
            <Link href="/find-clinics" className="text-primary hover:underline">
              Find clinics
            </Link>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            <Sparkles className="mr-1 inline h-3.5 w-3.5 text-primary" />
            {siteCopy.medicalDisclaimer}
          </p>
        </div>
      </section>
    </div>
  );
}
