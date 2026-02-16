import type { Metadata } from "next";
import HomePageClient from "@/components/site/HomePageClient";
import { organizationJsonLd, websiteJsonLd, canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Free Head Lice Checker Online | Quick Check For Nits and Head Lice",
  description:
    "Use Head Lice Checker for a quick photo-based head lice indication and practical clinic next steps.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Free Head Lice Checker Online | Quick Check For Nits and Head Lice",
    description:
      "Quickly check for nits and head lice with a photo, then connect with professional clinics.",
    url: canonical("/"),
    type: "website",
    siteName: "Head Lice Checker",
    images: [{ url: "/logo_new.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Head Lice Checker Online | Quick Check For Nits and Head Lice",
    description:
      "Quickly check for nits and head lice with a photo, then connect with professional clinics.",
    images: ["/logo_new.png"],
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
