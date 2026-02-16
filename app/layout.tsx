import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: "NitNot | Head Lice Checker and Clinic Finder",
    template: "%s | NitNot",
  },
  description:
    "Upload a scalp photo for an indicative AI check, then connect with professional head lice clinics.",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NitNot | Head Lice Checker and Clinic Finder",
    description: "Fast, private head lice screening with clear next steps and clinic support.",
    type: "website",
    images: [{ url: "/logo_new.png" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/logo_new.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
