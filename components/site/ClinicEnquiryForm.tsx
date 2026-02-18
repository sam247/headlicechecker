"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackEvent } from "@/lib/data/events";
import type { LeadSubmissionResult } from "@/lib/data/types";

const schema = z.object({
  contactName: z.string().min(2, "Contact name is required"),
  clinicName: z.string().min(2, "Clinic name is required"),
  phone: z.string().optional(),
  address: z.string().min(3, "Address is required"),
  email: z.string().email("Enter a valid email"),
  website: z.string().optional(),
  consent: z.boolean().refine((value) => value, "You must agree before submitting"),
  hp_field: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function mapError(result: LeadSubmissionResult): string {
  if (result.code === "RATE_LIMITED") return "Too many attempts. Please wait a minute and try again.";
  if (result.code === "VALIDATION_ERROR") return "Please check the highlighted fields and try again.";
  if (result.code === "PERMANENT_DELIVERY_ERROR") return "Enquiry routing is temporarily misconfigured. Please try again later.";
  return "Temporary delivery issue. Please retry shortly.";
}

export default function ClinicEnquiryForm() {
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<"sent" | "queued" | "failed" | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      contactName: "",
      clinicName: "",
      phone: "",
      address: "",
      email: "",
      website: "",
      consent: false,
      hp_field: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setReferenceId(null);
    setDeliveryStatus(null);
    setServerError(null);

    const websitePayload =
      values.website?.trim() && !/^https?:\/\//i.test(values.website.trim())
        ? `https://${values.website.trim()}`
        : values.website?.trim() || undefined;

    const res = await fetch("/api/clinic-enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactName: values.contactName,
        clinicName: values.clinicName,
        phone: values.phone || undefined,
        address: values.address,
        email: values.email,
        website: websitePayload,
        consent: true,
        hp_field: values.hp_field,
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
    await trackEvent({ event: "clinic_apply_submit" });
    await trackEvent({ event: "clinic_apply_submitted", source: "for-clinics" });

    reset({
      contactName: "",
      clinicName: "",
      phone: "",
      address: "",
      email: "",
      website: "",
      consent: false,
      hp_field: "",
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...register("hp_field")} />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Input placeholder="Contact name" {...register("contactName")} />
            {errors.contactName && <p className="mt-1 text-xs text-destructive">{errors.contactName.message}</p>}
          </div>
          <div>
            <Input placeholder="Clinic name" {...register("clinicName")} />
            {errors.clinicName && <p className="mt-1 text-xs text-destructive">{errors.clinicName.message}</p>}
          </div>
          <div>
            <Input placeholder="Phone (optional)" {...register("phone")} />
          </div>
          <div>
            <Input placeholder="Email" type="email" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="md:col-span-2">
            <Input placeholder="Address" {...register("address")} />
            {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address.message}</p>}
          </div>
          <div className="md:col-span-2">
            <Input placeholder="Website (optional)" {...register("website")} />
            {errors.website && <p className="mt-1 text-xs text-destructive">{errors.website.message}</p>}
          </div>
        </div>

        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <input type="checkbox" className="mt-1" {...register("consent")} />
          <span>I consent to Head Lice Checker using these details to contact us about being listed.</span>
        </label>
        {errors.consent && <p className="text-xs text-destructive">{errors.consent.message}</p>}

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}

        {referenceId && (
          <p className="text-sm text-green-700">
            Enquiry sent ({deliveryStatus ?? "queued"}). Reference: <strong>{referenceId}</strong>
          </p>
        )}

        <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send enquiry"}
        </Button>
      </form>
    </div>
  );
}
