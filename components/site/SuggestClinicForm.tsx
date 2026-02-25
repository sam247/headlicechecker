"use client";

import { type FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SuggestResponse = {
  ok: boolean;
  referenceId?: string;
  error?: string;
};

export default function SuggestClinicForm() {
  const [clinicName, setClinicName] = useState("");
  const [website, setWebsite] = useState("");
  const [region, setRegion] = useState("");
  const [submittedByEmail, setSubmittedByEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const canSubmit = useMemo(() => clinicName.trim() && website.trim() && region.trim(), [clinicName, website, region]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setReferenceId(null);

    const response = await fetch("/api/suggest-clinic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clinicName,
        website,
        region,
        submittedByEmail,
        hp_field: "",
      }),
    });

    const data = (await response.json()) as SuggestResponse;
    if (!response.ok || !data.ok) {
      setError(data.error ?? "Unable to submit clinic suggestion right now.");
      setSubmitting(false);
      return;
    }

    setReferenceId(data.referenceId ?? null);
    setSubmitting(false);
    setClinicName("");
    setWebsite("");
    setRegion("");
    setSubmittedByEmail("");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Clinic name</label>
          <Input value={clinicName} onChange={(event) => setClinicName(event.target.value)} placeholder="Clinic name" />
        </div>
        <div>
          <label className="text-sm font-medium">Website</label>
          <Input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://example.com" />
        </div>
        <div>
          <label className="text-sm font-medium">Region</label>
          <Input value={region} onChange={(event) => setRegion(event.target.value)} placeholder="Region" />
        </div>
        <div>
          <label className="text-sm font-medium">Submitted by email (optional)</label>
          <Input
            value={submittedByEmail}
            onChange={(event) => setSubmittedByEmail(event.target.value)}
            placeholder="you@example.com"
            type="email"
          />
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {referenceId ? (
        <p className="text-sm text-foreground">
          Suggestion received. Reference: <strong>{referenceId}</strong>. Our team will review before publishing.
        </p>
      ) : null}

      <Button type="submit" className="rounded-full" disabled={submitting || !canSubmit}>
        {submitting ? "Submitting..." : "Submit clinic suggestion"}
      </Button>
    </form>
  );
}
