import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AreaFocusMap from "@/components/site/AreaFocusMap";
import DirectoryClinicDetailActions from "@/components/site/DirectoryClinicDetailActions";
import { Card, CardContent } from "@/components/ui/card";
import { getClinics } from "@/lib/data/content";
import { getClinicPartnerPresentation } from "@/lib/data/clinic-partner";
import { pageMetadata } from "@/lib/seo";

interface DirectoryClinicPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getClinics("UK").map((clinic) => ({ slug: clinic.id }));
}

export function generateMetadata({ params }: DirectoryClinicPageProps): Metadata {
  const clinic = getClinics("UK").find((entry) => entry.id === params.slug);
  if (!clinic) return {};

  return pageMetadata({
    title: `${clinic.name} | UK Directory`,
    description: `Directory listing for ${clinic.name} in ${clinic.region}. Public phone and website links with tracked outbound routing.`,
    path: `/directory/${clinic.id}`,
  });
}

export default function DirectoryClinicPage({ params }: DirectoryClinicPageProps) {
  const clinic = getClinics("UK").find((entry) => entry.id === params.slug);
  if (!clinic) notFound();

  const partner = getClinicPartnerPresentation(clinic);

  return (
    <section className="section-shell">
      <div className="container mx-auto grid gap-6 px-4 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{clinic.region}</p>
              {partner.isVerifiedRegionalPartner ? <span className="clinic-badge-standard">Verified Regional Partner</span> : null}
            </div>
            <h1 className="mt-2 text-3xl font-bold">{clinic.name}</h1>
            {clinic.description ? <p className="mt-3 text-sm text-muted-foreground">{clinic.description}</p> : null}

            <div className="mt-5 space-y-2 text-sm">
              <p>
                <strong>City:</strong> {clinic.city}
              </p>
              <p>
                <strong>Postcode:</strong> {clinic.postcode}
              </p>
              {clinic.address1 ? (
                <p>
                  <strong>Address:</strong> {clinic.address1}
                  {clinic.address2 ? `, ${clinic.address2}` : ""}
                </p>
              ) : null}
              {clinic.phone ? (
                <p>
                  <strong>Phone:</strong> {clinic.phone}
                </p>
              ) : null}
              {clinic.bookingUrl ? (
                <p>
                  <strong>Website:</strong> {clinic.bookingUrl}
                </p>
              ) : null}
            </div>

            <div className="mt-6">
              <AreaFocusMap
                lat={clinic.lat}
                lng={clinic.lng}
                title={`${clinic.city} clinic area`}
                subtitle="City focus"
                mapDelta={0.04}
                heightClassName="h-[260px]"
              />
            </div>
          </CardContent>
        </Card>

        <DirectoryClinicDetailActions clinic={clinic} />
      </div>
    </section>
  );
}
