import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About NitNot",
  description: "Learn how NitNot helps families move from uncertainty to action with calm, practical head lice guidance.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <section className="section-shell">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="section-title">About NitNot</h1>
        <p className="mt-4 section-copy">
          NitNot helps parents move from uncertainty to action quickly. We combine AI-assisted image screening with referral paths to professional clinics.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          We focus on calm communication, privacy-first handling, and clear disclaimers: our screening output is indicative and not a medical diagnosis.
        </p>
      </div>
    </section>
  );
}
