"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { LeadSubmissionResult, ScanConfidenceLevel, ScanLabel } from "@/lib/data/types";
import { trackEvent } from "@/lib/data/events";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  postcode: z.string().min(3, "Postcode/ZIP is required"),
  message: z.string().max(500, "Keep message under 500 characters").optional(),
  consent: z.boolean().refine((v) => v, "You must agree before submitting"),
  hp_field: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ClinicContactFormProps {
  clinicId?: string;
  clinicName?: string;
  scanLabel?: ScanLabel;
  scanConfidenceLevel?: ScanConfidenceLevel;
  compact?: boolean;
  source?: "page" | "modal";
  onSuccess?: (referenceId: string) => void | Promise<void>;
  onCancel?: () => void;
}

function mapError(result: LeadSubmissionResult): string {
  if (result.code === "RATE_LIMITED") return "Too many attempts. Please wait a minute and try again.";
  if (result.code === "VALIDATION_ERROR") return "Please check the highlighted fields and try again.";
  if (result.code === "PERMANENT_DELIVERY_ERROR") return "Delivery is temporarily misconfigured. Please call the clinic directly.";
  return "Temporary delivery issue. Please retry in a moment.";
}

export default function ClinicContactForm({
  clinicId,
  clinicName,
  scanLabel,
  scanConfidenceLevel,
  compact = false,
  source = "page",
  onSuccess,
  onCancel,
}: ClinicContactFormProps) {
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<"sent" | "queued" | "failed" | null>(null);

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
      hp_field: "",
    },
  });

  const slaCopy = useMemo(() => "Most families receive a clinic response within 2 business hours.", []);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setReferenceId(null);
    setDeliveryStatus(null);

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

    const data = (await res.json()) as LeadSubmissionResult;
    if (!res.ok || !data.ok) {
      setServerError(mapError(data));
      setDeliveryStatus("failed");
      return;
    }

    setReferenceId(data.referenceId ?? null);
    setDeliveryStatus(data.deliveryStatus ?? "queued");
    await trackEvent({ event: "clinic_contact_submit", clinicId });
    await trackEvent({ event: "clinic_contact_submitted", clinicId, source });
    if (data.referenceId) {
      await onSuccess?.(data.referenceId);
    }
    reset({
      name: "",
      email: "",
      phone: "",
      postcode: "",
      message: "",
      consent: false,
      hp_field: "",
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <h3 className="text-lg font-semibold text-foreground">Request clinic follow-up</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Share your details and a clinic specialist will contact you.
        {clinicName ? ` Selected clinic: ${clinicName}.` : ""}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{slaCopy}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3">
        <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...register("hp_field")} />

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
          <span>I consent to Head Lice Checker sharing my details with the nearest clinic for follow-up.</span>
        </label>
        {errors.consent && <p className="text-xs text-destructive">{errors.consent.message}</p>}

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}

        {referenceId && (
          <p className="text-sm text-green-700">
            Request sent ({deliveryStatus ?? "queued"}). Reference: <strong>{referenceId}</strong>
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full rounded-full">
          {isSubmitting ? "Sending..." : "Send request"}
        </Button>
      </form>

      {onCancel && (
        <div className="mt-3 flex justify-end">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
