"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/data/events";

function trackPartnerCta(destination: string) {
  void trackEvent({
    event_type: "partner_enquiry_cta_clicked",
    metadata: { source: "find_clinics_page", destination },
  });
}

export default function PartnerEnquiryCtaCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-primary/10 p-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Are you a clinic and want to be listed?</h2>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            We review each application for service fit, response standards, and location coverage before approving listings.
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild className="rounded-full">
          <Link
            href="/for-clinics#enquiry"
            onClick={() => {
              trackPartnerCta("/for-clinics#enquiry");
            }}
          >
            Apply to be listed
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Link
          href="/for-clinics/pricing"
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          onClick={() => {
            trackPartnerCta("/for-clinics/pricing");
          }}
        >
          See featured placement options
        </Link>
      </div>
    </div>
  );
}
