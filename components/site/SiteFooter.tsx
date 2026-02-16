import Link from "next/link";
import Image from "next/image";
import { getSiteCopy } from "@/lib/data/content";

const copy = getSiteCopy();

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "How It Works", href: "/how-it-works" },
      { label: "Find Clinics", href: "/find-clinics" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Audience",
    links: [
      { label: "For Parents", href: "/" },
      { label: "For Schools", href: "/for-schools" },
      { label: "For Clinics", href: "/for-clinics" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Image
              src="/logo_new.png"
              alt="NitNot"
              width={152}
              height={44}
              className="mb-4 h-9 w-auto"
            />
            <p className="text-sm text-muted-foreground">{copy.tagline}</p>
            <p className="mt-3 text-xs text-muted-foreground">{copy.medicalDisclaimer}</p>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-sm font-semibold text-foreground">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 Head Lice Checker. All rights reserved. Site By{" "}
            <a
              href="https://betterranking.co.uk/#utm_source=footer&utm_medium=partner&utm_campaign=headlicechecker&utm_id=links"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-foreground"
            >
              Better Ranking
            </a>
          </p>
          <p>Global Head Lice Clinic Finder. Indicative AI screening only</p>
        </div>
      </div>
    </footer>
  );
}
