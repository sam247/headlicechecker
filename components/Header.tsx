"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

const Header = () => {
  const { theme, setTheme } = useTheme();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <a href="/" className="flex items-center shrink-0">
          <img src="/images/logo_colour.png" alt="NitNot" className="h-8" />
        </a>

        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <button onClick={() => scrollTo("photo-checker")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Photo Checker
          </button>
          <button onClick={() => scrollTo("clinic-finder")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Find a Clinic
          </button>
          <button onClick={() => scrollTo("contact")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground relative"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="relative flex h-4 w-4 items-center justify-center">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </span>
          </Button>
          <Button
            onClick={() => scrollTo("photo-checker")}
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm"
          >
            Check Now
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
