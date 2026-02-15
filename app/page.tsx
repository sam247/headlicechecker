import type { Metadata } from "next";
import HomePageClient from "@/components/site/HomePageClient";
import { organizationJsonLd, websiteJsonLd, canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Free Head Lice Checker Online | Quick Check For Nits and Head Lice",
  description:
    "Use NitNot's free head lice checker online for a quick photo-based indication and next-step clinic support.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Free Head Lice Checker Online | Quick Check For Nits and Head Lice",
    description:
      "Quickly check for nits and head lice with a photo, then connect with professional clinics.",
    url: canonical("/"),
    type: "website",
  },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
      <HomePageClient />
    </>
  );
}
