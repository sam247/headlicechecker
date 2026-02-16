import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: "Head Lice Checker | Free Photo Scan and Clinic Finder",
    template: "%s | Head Lice Checker",
  },
  description:
    "Upload a scalp photo for indicative head lice screening, then connect with nearby clinics for professional follow-up.",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Head Lice Checker | Free Photo Scan and Clinic Finder",
    description: "Fast, private head lice screening with clear next steps and clinic support.",
    type: "website",
    siteName: "Head Lice Checker",
    url: SITE_URL,
    images: [{ url: "/logo_new.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Head Lice Checker | Free Photo Scan and Clinic Finder",
    description: "Fast, private head lice screening with clear next steps and clinic support.",
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
