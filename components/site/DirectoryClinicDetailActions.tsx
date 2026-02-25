"use client";

import Link from "next/link";
import { ExternalLink, Phone } from "lucide-react";
import ClinicContactForm from "@/components/site/ClinicContactForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildTrackedCallHref, buildTrackedOutboundHref } from "@/lib/data/tracked-links";
import { getClinicPartnerPresentation } from "@/lib/data/clinic-partner";
import type { Clinic } from "@/lib/data/types";

interface DirectoryClinicDetailActionsProps {
  clinic: Clinic;
}

export default function DirectoryClinicDetailActions({ clinic }: DirectoryClinicDetailActionsProps) {
  const partner = getClinicPartnerPresentation(clinic);
  const sourcePath = `/directory/${clinic.id}`;
  const callHref = buildTrackedCallHref(clinic, sourcePath, "directory");
  const outboundHref = buildTrackedOutboundHref(clinic, sourcePath, "directory");

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="p-5">
          <h2 className="text-lg font-semibold">Public contact details</h2>
          <p className="mt-2 text-sm text-muted-foreground">Phone and website links are routed through tracked endpoints.</p>

          <div className="mt-4 flex flex-wrap gap-3">
            {callHref ? (
              <Button asChild className="rounded-full">
                <a href={callHref}>
                  <Phone className="mr-1 h-4 w-4" />
                  Call {clinic.phone}
                </a>
              </Button>
            ) : null}
            {outboundHref ? (
              <Button asChild variant="outline" className="rounded-full">
                <a href={outboundHref} target="_blank" rel="nofollow noopener">
                  Visit website
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {partner.isVerifiedRegionalPartner ? (
        <Card>
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold">Verified Regional Partner Enquiry</h2>
            <p className="mt-2 text-sm text-muted-foreground">Submit one form and the clinic receives a routed enquiry.</p>
            <div className="mt-4">
              <ClinicContactForm
                clinicId={clinic.id}
                clinicName={clinic.name}
                clinicCity={clinic.city}
                clinicRegion={clinic.region}
                source="page"
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold">Owner verification</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you the owner? Verify your clinic so your listing can be reviewed for partner verification.
            </p>
            <div className="mt-4">
              <Button asChild variant="outline" className="rounded-full">
                <Link href={`/claim-listing?clinic_id=${encodeURIComponent(clinic.id)}&clinic_name=${encodeURIComponent(clinic.name)}&website=${encodeURIComponent(clinic.bookingUrl ?? "")}`}>
                  Are you the owner? Verify your clinic.
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
