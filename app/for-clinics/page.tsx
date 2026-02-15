import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ForClinicsPage() {
  return (
    <section className="section-shell">
      <div className="container mx-auto max-w-5xl px-4">
        <h1 className="section-title">For clinic partners</h1>
        <p className="mt-3 section-copy">
          Receive qualified parent inquiries from AI-guided screening outcomes, with simple lead routing to your team.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            "Lead capture with consent",
            "Region-based routing",
            "US-first demand focus",
          ].map((item) => (
            <Card key={item}>
              <CardContent className="p-5 text-sm text-muted-foreground">{item}</CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Join the partner network</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us your region, capacity, and services. We will follow up with onboarding details.
          </p>
          <Button asChild className="mt-4 rounded-full">
            <Link href="/contact">Apply as a clinic partner</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
