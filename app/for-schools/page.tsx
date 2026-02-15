import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "For Schools and Childcare",
  description: "Practical head lice outbreak workflows and parent communication support for schools and childcare teams.",
  alternates: { canonical: "/for-schools" },
};

export default function ForSchoolsPage() {
  return (
    <section className="section-shell">
      <div className="container mx-auto max-w-5xl px-4">
        <h1 className="section-title">For schools and childcare teams</h1>
        <p className="mt-3 section-copy">
          Keep responses calm and consistent during outbreaks with parent-friendly screening guidance and clinic referral options.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            "Outbreak communication templates",
            "Parent self-check guidance",
            "Referral pathways for confirmation",
          ].map((item) => (
            <Card key={item}>
              <CardContent className="p-5 text-sm text-muted-foreground">{item}</CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Need an outbreak response call?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Our team can provide a practical workflow for communication, screening, and clinic handoff.
          </p>
          <Button asChild className="mt-4 rounded-full">
            <Link href="/contact">Contact school support</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
