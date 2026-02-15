import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "How The Checker Works",
  description: "Learn how NitNot screens scalp photos and guides families toward the right next step.",
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return (
    <section className="section-shell">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="section-title">How NitNot works</h1>
        <p className="mt-3 section-copy">
          A simple three-step screening flow designed for parents who need fast guidance without confusion.
        </p>

        <div className="mt-8 space-y-4">
          {[
            {
              title: "Step 1: Capture a useful photo",
              body: "Part the hair near the scalp, use bright light, and keep the image in focus.",
            },
            {
              title: "Step 2: AI screening",
              body: "Your image is analyzed for visual signs of lice, nits, dandruff-like flakes, and scalp irritation patterns.",
            },
            {
              title: "Step 3: Guidance and referral",
              body: "You get an indicative result plus next-step guidance, including clinic contact for possible lice findings.",
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
