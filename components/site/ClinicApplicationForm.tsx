"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trackEvent } from "@/lib/data/events";
import type { LeadSubmissionResult } from "@/lib/data/types";

const schema = z.object({
  clinicName: z.string().min(2, "Clinic name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  website: z.string().optional(),
  country: z.enum(["UK", "US"]),
  city: z.string().min(2, "City is required"),
  region: z.string().min(2, "Region/County/State is required"),
  postcode: z.string().min(2, "Postcode/ZIP is required"),
  address1: z.string().min(3, "Address line 1 is required"),
  address2: z.string().optional(),
  servicesCsv: z.string().min(2, "Enter at least one service"),
  message: z.string().max(1000, "Keep message under 1000 characters").optional(),
  consent: z.boolean().refine((value) => value, "You must agree before submitting"),
  hp_field: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function mapError(result: LeadSubmissionResult): string {
  if (result.code === "RATE_LIMITED") return "Too many attempts. Please wait a minute and try again.";
  if (result.code === "VALIDATION_ERROR") return "Please check the highlighted fields and try again.";
  if (result.code === "PERMANENT_DELIVERY_ERROR") return "Application routing is temporarily misconfigured. Please try again later.";
  return "Temporary delivery issue. Please retry shortly.";
}

export default function ClinicApplicationForm() {
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<"sent" | "queued" | "failed" | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      clinicName: "",
      contactName: "",
      email: "",
      phone: "",
      website: "",
      country: "UK",
      city: "",
      region: "",
      postcode: "",
      address1: "",
      address2: "",
      servicesCsv: "Screening, Removal",
      message: "",
      consent: false,
      hp_field: "",
    },
  });

  const country = watch("country");

  const onSubmit = async (values: FormValues) => {
    setReferenceId(null);
    setDeliveryStatus(null);
    setServerError(null);

    const services = values.servicesCsv
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .slice(0, 8);

    const payload = {
      clinicName: values.clinicName,
      contactName: values.contactName,
      email: values.email,
      phone: values.phone,
      website: values.website,
      country: values.country,
      city: values.city,
      region: values.region,
      postcode: values.postcode,
      address1: values.address1,
      address2: values.address2,
      services,
      message: values.message,
      consent: values.consent,
      hp_field: values.hp_field,
    };

    await trackEvent({ event: "clinic_apply_submit", country: values.country });

    const res = await fetch("/api/clinic-apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as LeadSubmissionResult;
    if (!res.ok || !data.ok) {
      setServerError(mapError(data));
      setDeliveryStatus("failed");
      return;
    }

    setReferenceId(data.referenceId ?? null);
    setDeliveryStatus(data.deliveryStatus ?? "queued");
    await trackEvent({ event: "clinic_apply_submitted", country: values.country, source: "for-clinics" });

    reset({
      clinicName: "",
      contactName: "",
      email: "",
      phone: "",
      website: "",
      country: values.country,
      city: "",
      region: "",
      postcode: "",
      address1: "",
      address2: "",
      servicesCsv: "Screening, Removal",
      message: "",
      consent: false,
      hp_field: "",
    });
  };

  return (
    <div id="clinic-apply" className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <h3 className="text-xl font-semibold">Apply to be a recommended clinic</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Submit your clinic details to be considered for the location finder. Approved clinics are mapped by coverage, response standards, and service fit.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
        <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...register("hp_field")} />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Input placeholder="Clinic name" {...register("clinicName")} />
            {errors.clinicName && <p className="mt-1 text-xs text-destructive">{errors.clinicName.message}</p>}
          </div>
          <div>
            <Input placeholder="Primary contact name" {...register("contactName")} />
            {errors.contactName && <p className="mt-1 text-xs text-destructive">{errors.contactName.message}</p>}
          </div>
          <div>
            <Input placeholder="Work email" type="email" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div>
            <Input placeholder="Phone" {...register("phone")} />
          </div>
          <div>
            <Input placeholder="Website (optional)" {...register("website")} />
            {errors.website && <p className="mt-1 text-xs text-destructive">{errors.website.message}</p>}
          </div>
          <div>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              {...register("country")}
            >
              <option value="UK">United Kingdom</option>
              <option value="US">United States</option>
            </select>
          </div>
          <div>
            <Input placeholder="City" {...register("city")} />
            {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>}
          </div>
          <div>
            <Input placeholder={country === "UK" ? "County/Region" : "State/Region"} {...register("region")} />
            {errors.region && <p className="mt-1 text-xs text-destructive">{errors.region.message}</p>}
          </div>
          <div>
            <Input placeholder={country === "UK" ? "Postcode" : "ZIP"} {...register("postcode")} />
            {errors.postcode && <p className="mt-1 text-xs text-destructive">{errors.postcode.message}</p>}
          </div>
          <div>
            <Input placeholder="Address line 1" {...register("address1")} />
            {errors.address1 && <p className="mt-1 text-xs text-destructive">{errors.address1.message}</p>}
          </div>
          <div>
            <Input placeholder="Address line 2 (optional)" {...register("address2")} />
          </div>
          <div>
            <Input placeholder="Services (comma separated)" {...register("servicesCsv")} />
            {errors.servicesCsv && <p className="mt-1 text-xs text-destructive">{errors.servicesCsv.message}</p>}
          </div>
        </div>

        <div>
          <Textarea
            placeholder="Tell us your coverage area, appointment availability, and why you'd like to join."
            rows={4}
            {...register("message")}
          />
          {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message.message}</p>}
        </div>

        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <input type="checkbox" className="mt-1" {...register("consent")} />
          <span>I consent to Head Lice Checker using these details to review and contact us about clinic onboarding.</span>
        </label>
        {errors.consent && <p className="text-xs text-destructive">{errors.consent.message}</p>}

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}

        {referenceId && (
          <p className="text-sm text-green-700">
            Application sent ({deliveryStatus ?? "queued"}). Reference: <strong>{referenceId}</strong>
          </p>
        )}

        <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit clinic application"}
        </Button>
      </form>
    </div>
  );
}
