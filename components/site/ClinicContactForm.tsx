"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ScanConfidenceLevel, ScanLabel } from "@/lib/data/types";
import { trackEvent } from "@/lib/data/events";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  postcode: z.string().min(3, "Postcode/ZIP is required"),
  message: z.string().max(500, "Keep message under 500 characters").optional(),
  consent: z.boolean().refine((v) => v, "You must agree before submitting"),
});

type FormValues = z.infer<typeof schema>;

interface ClinicContactFormProps {
  clinicId?: string;
  scanLabel?: ScanLabel;
  scanConfidenceLevel?: ScanConfidenceLevel;
  compact?: boolean;
}

export default function ClinicContactForm({
  clinicId,
  scanLabel,
  scanConfidenceLevel,
  compact = false,
}: ClinicContactFormProps) {
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      postcode: "",
      message: "",
      consent: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setReferenceId(null);

    const res = await fetch("/api/contact-clinic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        clinicId,
        scanLabel,
        scanConfidenceLevel,
      }),
    });

    const data = (await res.json()) as { ok?: boolean; referenceId?: string; error?: string };
    if (!res.ok || !data.ok) {
      setServerError(data.error ?? "We couldn't send your request. Please try again.");
      return;
    }

    setReferenceId(data.referenceId ?? null);
    await trackEvent({ event: "clinic_contact_submit", clinicId });
    reset();
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <h3 className="text-lg font-semibold text-foreground">Request clinic follow-up</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Share your details and a clinic specialist will contact you.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3">
        <div className={compact ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 gap-3 md:grid-cols-2"}>
          <div>
            <Input placeholder="Parent/guardian name" {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div>
            <Input placeholder="Email" type="email" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div>
            <Input placeholder="Phone (optional)" {...register("phone")} />
          </div>
          <div>
            <Input placeholder="Postcode or ZIP" {...register("postcode")} />
            {errors.postcode && <p className="mt-1 text-xs text-destructive">{errors.postcode.message}</p>}
          </div>
        </div>

        <div>
          <Textarea placeholder="Anything helpful for the clinic to know?" rows={compact ? 3 : 4} {...register("message")} />
          {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message.message}</p>}
        </div>

        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <input type="checkbox" className="mt-1" {...register("consent")} />
          <span>I consent to NitNot sharing my details with the nearest clinic for follow-up.</span>
        </label>
        {errors.consent && <p className="text-xs text-destructive">{errors.consent.message}</p>}

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}
        {referenceId && (
          <p className="text-sm text-green-700">
            Request sent. Reference: <strong>{referenceId}</strong>
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full rounded-full">
          {isSubmitting ? "Sending..." : "Send request"}
        </Button>
      </form>
    </div>
  );
}
