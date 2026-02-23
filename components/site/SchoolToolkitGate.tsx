"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { SchoolToolkitAsset } from "@/lib/data/school-toolkit";
import { trackEvent } from "@/lib/data/events";

const schema = z.object({
  schoolName: z.string().min(2, "School name is required"),
  role: z.string().min(2, "Role is required"),
  email: z.string().email("Enter a valid email"),
  country: z.string().min(2, "Country is required"),
  trustName: z.string().optional(),
  hp_field: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type SchoolToolkitResponse = {
  ok: boolean;
  referenceId?: string;
  deliveryStatus?: "sent" | "queued" | "failed";
  assets?: SchoolToolkitAsset[];
  code?: "VALIDATION_ERROR" | "RATE_LIMITED" | "TRANSIENT_DELIVERY_ERROR" | "PERMANENT_DELIVERY_ERROR";
};

const ROLE_OPTIONS = [
  "Headteacher",
  "Deputy Head / Assistant Head",
  "School Business Manager",
  "School Nurse / Welfare Lead",
  "Safeguarding Lead",
  "Trust / MAT Lead",
  "Admin / Office Manager",
  "Other Staff",
] as const;

const COUNTRY_OPTIONS = ["UK", "US", "Ireland", "Canada", "Australia", "New Zealand", "Other"] as const;

function isInstitutionalEmail(email: string): boolean {
  const lower = email.trim().toLowerCase();
  if (!lower.includes("@")) return false;
  if (/\.(sch\.uk|ac\.uk|edu|school)$/.test(lower)) return true;
  if (/\.k12\.[a-z]{2,}$/i.test(lower)) return true;
  return false;
}

export default function SchoolToolkitGate({ assets }: { assets: SchoolToolkitAsset[] }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [unlockedAssets, setUnlockedAssets] = useState<SchoolToolkitAsset[]>([]);
  const [countryTag, setCountryTag] = useState("unknown");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      schoolName: "",
      role: "",
      email: "",
      country: "UK",
      trustName: "",
      hp_field: "",
    },
  });

  useEffect(() => {
    void trackEvent({ event: "school_toolkit_page_view", source: "school_toolkit_page" });
  }, []);

  const email = watch("email");
  const selectedCountry = watch("country");
  const institutional = useMemo(() => isInstitutionalEmail(email ?? ""), [email]);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    const res = await fetch("/api/school-toolkit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = (await res.json()) as SchoolToolkitResponse;
    if (!res.ok || !data.ok) {
      if (data.code === "RATE_LIMITED") {
        setServerError("Too many attempts. Please wait a minute and try again.");
        return;
      }
      if (data.code === "VALIDATION_ERROR") {
        setServerError("Please check your details and try again.");
        return;
      }
      setServerError("We couldn't unlock the toolkit right now. Please try again shortly.");
      return;
    }

    const unlocked = data.assets?.length ? data.assets : assets;
    setUnlockedAssets(unlocked);
    setReferenceId(data.referenceId ?? null);
    setCountryTag(values.country || "unknown");
    await trackEvent({
      event: "school_toolkit_form_submitted",
      role: values.role,
      country: values.country,
      reference_id: data.referenceId,
    });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold">Access the toolkit</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete this short form to unlock all framework files immediately.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3">
            <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...register("hp_field")} />
            <div>
              <Input placeholder="School name" {...register("schoolName")} />
              {errors.schoolName && <p className="mt-1 text-xs text-destructive">{errors.schoolName.message}</p>}
            </div>
            <div>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue=""
                {...register("role")}
              >
                <option value="" disabled>
                  Select role
                </option>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              {errors.role && <p className="mt-1 text-xs text-destructive">{errors.role.message}</p>}
            </div>
            <div>
              <Input placeholder="School email" type="email" {...register("email")} />
              {institutional ? (
                <p className="mt-1 text-xs text-green-700">Institutional domain detected.</p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">Tip: institutional email helps verify school context faster.</p>
              )}
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register("country")}>
                {COUNTRY_OPTIONS.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              {errors.country && <p className="mt-1 text-xs text-destructive">{errors.country.message}</p>}
            </div>
            <div>
              <Input placeholder="Trust name (optional)" {...register("trustName")} />
            </div>
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
              {isSubmitting ? "Unlocking..." : "Unlock toolkit"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold">Toolkit files</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {unlockedAssets.length > 0
              ? "Your toolkit is unlocked. You can view or download all files now."
              : "Files unlock immediately after form submission."}
          </p>
          {referenceId && (
            <p className="mt-2 text-xs text-muted-foreground">
              Reference: <span className="font-medium">{referenceId}</span>
            </p>
          )}
          <div className="mt-4 space-y-3">
            {(unlockedAssets.length > 0 ? unlockedAssets : assets).map((asset) => {
              const locked = unlockedAssets.length === 0;
              return (
                <div key={asset.id} className="rounded-xl border border-border px-4 py-3">
                  <p className="text-sm font-semibold">{asset.title}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{asset.format}</p>
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <a
                      href={locked ? undefined : asset.href}
                      target="_blank"
                      rel="noreferrer"
                      className={locked ? "pointer-events-none text-muted-foreground" : "inline-flex items-center gap-1 text-primary hover:underline"}
                      onClick={() => {
                        if (locked) return;
                        void trackEvent({
                          event: "school_toolkit_file_downloaded",
                          asset_name: asset.title,
                          format: asset.format,
                          reference_id: referenceId ?? undefined,
                          country: countryTag,
                        });
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                      View
                    </a>
                    <a
                      href={locked ? undefined : asset.href}
                      download={!locked}
                      className={locked ? "pointer-events-none text-muted-foreground" : "inline-flex items-center gap-1 text-primary hover:underline"}
                      onClick={() => {
                        if (locked) return;
                        void trackEvent({
                          event: "school_toolkit_file_downloaded",
                          asset_name: asset.title,
                          format: asset.format,
                          reference_id: referenceId ?? undefined,
                          country: countryTag,
                        });
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
