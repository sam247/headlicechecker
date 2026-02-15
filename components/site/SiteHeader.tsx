"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSiteCopy } from "@/lib/data/content";

const navItems = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/find-clinics", label: "Find Clinics" },
  { href: "/for-schools", label: "For Schools" },
  { href: "/for-clinics", label: "For Clinics" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
];

const copy = getSiteCopy();

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="NitNot home">
          <Image src="/images/logo_colour.png" alt="NitNot" width={112} height={32} className="h-8 w-auto" />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname === item.href && "text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/find-clinics">{copy.secondaryCta}</Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link href="/#start-scan">{copy.primaryCta}</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="container mx-auto space-y-1 px-4 py-4" aria-label="Mobile primary">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  pathname === item.href && "bg-muted text-foreground"
                )}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/find-clinics" onClick={() => setOpen(false)}>
                  {copy.secondaryCta}
                </Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link href="/#start-scan" onClick={() => setOpen(false)}>
                  {copy.primaryCta}
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
