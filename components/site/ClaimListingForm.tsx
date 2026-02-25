"use client";

import { type FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ClaimResponse = {
  ok: boolean;
  referenceId?: string;
  error?: string;
};

interface ClaimListingFormProps {
  initialClinicName?: string;
  initialClinicId?: string;
  initialWebsite?: string;
}

export default function ClaimListingForm({ initialClinicName, initialClinicId, initialWebsite }: ClaimListingFormProps) {
  const [clinicName, setClinicName] = useState(initialClinicName ?? "");
  const [clinicId, setClinicId] = useState(initialClinicId ?? "");
  const [contactEmail, setContactEmail] = useState("");
  const [website, setWebsite] = useState(initialWebsite ?? "");
  const [ownershipDeclaration, setOwnershipDeclaration] = useState("I confirm I am the owner or authorized representative of this clinic.");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return clinicId.trim() && clinicName.trim() && contactEmail.trim() && website.trim() && ownershipDeclaration.trim();
  }, [clinicId, clinicName, contactEmail, website, ownershipDeclaration]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setReferenceId(null);

    const response = await fetch("/api/claim-listing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clinicId,
        clinicName,
        contactEmail,
        website,
        ownershipDeclaration,
        phone,
        hp_field: "",
      }),
    });

    const data = (await response.json()) as ClaimResponse;
    if (!response.ok || !data.ok) {
      setError(data.error ?? "Unable to submit claim right now.");
      setSubmitting(false);
      return;
    }

    setReferenceId(data.referenceId ?? null);
    setSubmitting(false);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Clinic ID</label>
          <Input value={clinicId} onChange={(event) => setClinicId(event.target.value)} placeholder="e.g. uk-richmond-nitnot-clinic" />
        </div>
        <div>
          <label className="text-sm font-medium">Clinic name</label>
          <Input value={clinicName} onChange={(event) => setClinicName(event.target.value)} placeholder="Clinic name" />
        </div>
        <div>
          <label className="text-sm font-medium">Contact email</label>
          <Input value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} type="email" placeholder="owner@clinic.com" />
        </div>
        <div>
          <label className="text-sm font-medium">Website</label>
          <Input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://example.com" />
        </div>
        <div>
          <label className="text-sm font-medium">Phone (optional)</label>
          <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Proof of ownership</label>
        <Textarea
          value={ownershipDeclaration}
          onChange={(event) => setOwnershipDeclaration(event.target.value)}
          rows={4}
          placeholder="I confirm I am authorized to represent this clinic."
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {referenceId ? (
        <p className="text-sm text-green-700">
          Submission received. Reference: <strong>{referenceId}</strong>. Listing status is now claim pending for manual review.
        </p>
      ) : null}

      <Button type="submit" className="rounded-full" disabled={submitting || !canSubmit}>
        {submitting ? "Submitting..." : "Submit verification request"}
      </Button>
    </form>
  );
}
