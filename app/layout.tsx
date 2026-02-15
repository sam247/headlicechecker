import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "NitNot | AI Head Lice Checker & Clinic Finder",
  description:
    "Upload a scalp photo for an indicative AI check, then connect with professional head lice clinics.",
  metadataBase: new URL("https://nitnot.com"),
  openGraph: {
    title: "NitNot | AI Head Lice Checker & Clinic Finder",
    description:
      "Fast, private head lice screening with clear next steps and clinic support.",
    type: "website",
    images: [{ url: "/images/logo_colour.png" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/logo_colour.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
