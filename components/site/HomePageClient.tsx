"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ImageIcon, Loader2, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PhotoChecker from "@/components/PhotoChecker";
import { getFaqs, getSiteCopy } from "@/lib/data/content";

const faqs = getFaqs().slice(0, 3);
const copy = getSiteCopy();

const HERO_DEMO_INTERVAL_MS = 1250;

export default function HomePageClient() {
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

  return (
    <div>
      <section className="relative overflow-hidden section-shell pb-12 md:pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--secondary))_0%,transparent_45%)]" />
        <div className="container relative z-10 mx-auto grid gap-8 px-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              <Shield className="h-3.5 w-3.5" />
              Calm, private, parent-first guidance
            </p>
            <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
              Check scalp photos quickly.
              <span className="block text-primary">Take clear next steps with confidence.</span>
            </h1>
            <p className="mt-4 max-w-2xl section-copy">
              Upload a close-up photo for an indicative result, then connect with a clinic if you need confirmation or treatment support.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild className="rounded-full" size="lg">
                <Link href="#start-scan">{copy.primaryCta}</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full" size="lg">
                <Link href="/find-clinics">{copy.secondaryCta}</Link>
              </Button>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {["Indicative result in seconds", "Built for mobile parents", "Global clinic pathways"].map((item) => (
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
                className="mt-5 flex min-h-[7.5rem] cursor-pointer flex-col items-center justify-center rounded-2xl border border-border bg-muted/40 p-8"
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
                  <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <ImageIcon className="mx-auto h-12 w-12 text-primary" />
                    <p className="mt-2 text-xs text-muted-foreground">Photo added</p>
                  </div>
                )}
                {effectiveDemoPhase === 2 && (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm font-medium">Scanning…</p>
                  </div>
                )}
                {effectiveDemoPhase === 3 && (
                  <div className="animate-in fade-in duration-300">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
                    <p className="mt-2 text-sm font-medium">Indicative: lice detected</p>
                    <p className="mt-1 text-xs text-muted-foreground">Scroll down to run your own scan.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center">How it works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "1. Upload a clear close-up",
                copy: "Hair parted near the scalp in good light gives stronger confidence.",
              },
              {
                title: "2. AI checks visual signals",
                copy: "The tool screens for lice, nits, dandruff-like flakes, and irritation patterns.",
              },
              {
                title: "3. Take the right next step",
                copy: "If risk is detected, contact a nearby clinic or speak to a medical professional.",
              },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="p-5">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.copy}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold">Accuracy and limitations</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  This system provides an indicative screening result, not a diagnosis. Low-quality images can reduce confidence.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>• Better light and focus improve confidence.</li>
                  <li>• Similar conditions can overlap visually.</li>
                  <li>• Persistent symptoms should be reviewed by a clinician.</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold">Parents say this reduces panic</h2>
                <div className="mt-4 space-y-3">
                  {[
                    "The scan gave us a calmer starting point before calling a clinic.",
                    "Helpful to know whether to escalate right away.",
                    "Fast enough to do during school-night chaos.",
                  ].map((quote) => (
                    <p key={quote} className="rounded-xl bg-secondary/50 p-3 text-sm text-secondary-foreground">
                      “{quote}”
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <PhotoChecker initialFile={heroFile} onFileConsumed={consumeHeroFile} />

      <section className="section-shell">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Need quick expert support?</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Browse nearby clinics and request follow-up in under a minute.
                </p>
              </div>
              <Button asChild className="rounded-full" size="lg">
                <Link href="/find-clinics">
                  Find clinics
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-2xl font-bold">Learn more before you decide</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore symptom guides, methodology details, and location-specific clinic support.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <Link href="/head-lice-symptoms" className="text-primary hover:underline">
                Head lice symptoms
              </Link>
              <Link href="/nits-vs-dandruff" className="text-primary hover:underline">
                Nits vs dandruff
              </Link>
              <Link href="/locations" className="text-primary hover:underline">
                City location guides
              </Link>
              <Link href="/methodology" className="text-primary hover:underline">
                Methodology
              </Link>
              <Link href="/clinical-safety" className="text-primary hover:underline">
                Clinical safety
              </Link>
              <Link href="/editorial-policy" className="text-primary hover:underline">
                Editorial policy
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Quick FAQ</h2>
            <Button asChild variant="ghost" className="rounded-full">
              <Link href="/faq">See all</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {faqs.map((faq) => (
              <Card key={faq.id}>
                <CardContent className="p-5">
                  <p className="font-semibold">{faq.question}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
            <Link href="/how-it-works" className="text-primary hover:underline">How it works</Link>
            <Link href="/faq" className="text-primary hover:underline">FAQ</Link>
            <Link href="/find-clinics" className="text-primary hover:underline">Find clinics</Link>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <Sparkles className="mr-1 inline h-3.5 w-3.5 text-primary" />
            {copy.medicalDisclaimer}
          </p>
        </div>
      </section>
    </div>
  );
}
