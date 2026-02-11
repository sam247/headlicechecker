import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "NitNot — Head Lice Photo Checker & Clinic Finder",
  description:
    "Not sure if it's nits? Upload a photo for a quick check and find your nearest professional head lice removal clinic with NitNot.",
  authors: [{ name: "NitNot" }],
  metadataBase: new URL("https://nitnot.com"),
  openGraph: {
    title: "NitNot — Head Lice Photo Checker & Clinic Finder",
    description:
      "Upload a photo, get an instant indication, and find your nearest professional head lice clinic.",
    type: "website",
    images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@NitNot",
    images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
