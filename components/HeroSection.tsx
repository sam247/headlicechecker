"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Camera, Star, Users, ShieldCheck } from "lucide-react";
import { useRef } from "react";

interface HeroSectionProps {
  onFileSelect?: (file: File) => void;
}

const HeroSection = ({ onFileSelect }: HeroSectionProps) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    onFileSelect?.(file);
    document.getElementById("photo-checker")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <section className="relative overflow-hidden pt-12 sm:pt-20 md:pt-32 lg:pt-44 pb-12 sm:pb-20 md:pb-32 lg:pb-40">
      {/* Subtle background accents */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-secondary/5 pointer-events-none" />
      <div className="absolute top-10 right-[-10%] w-[400px] h-[400px] rounded-full bg-secondary/8 blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-12 items-center">
          {/* Left: Text content */}
          <div>
            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm">
              <ShieldCheck className="h-4 w-4" />
              Trusted by thousands of UK parents
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-foreground leading-[1.05] mb-4 md:mb-5">
              Not sure if it's{" "}
              <span className="text-primary">nits</span>?{" "}
              <br />
              Use the head lice checker.
            </h1>

            <p className="text-base md:text-lg text-muted-foreground mb-4 leading-relaxed">
              Head lice are completely normal and nothing to worry about. Upload a photo for a quick
              indication, then find your nearest professional clinic.
            </p>

            <p className="text-base md:text-lg text-muted-foreground mb-4 leading-relaxed">
              100% Confidential and{" "}
              <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded font-semibold text-base">Free</span>
            </p>

            {/* Trust stats row */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 md:mt-6">
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">4.9/5</span>
              </div>
              <div className="h-4 w-px bg-border hidden sm:block" />
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-4 w-4 text-primary" />
                <span>15,000+ checked</span>
              </div>
              <div className="h-4 w-px bg-border hidden sm:block" />
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>100% confidential</span>
              </div>
            </div>
          </div>

          {/* Right: Upload card — larger like remove.bg */}
          <div className="flex justify-center">
            <Card
              className="w-full border-2 border-dashed border-border/60 bg-card hover:border-primary/50 transition-all hover:shadow-xl cursor-pointer group rounded-2xl"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <CardContent className="p-8 py-14 flex flex-col items-center text-center">
                <div className="mb-6" />

                <Button
                  size="lg"
                  className="rounded-full px-10 py-7 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:-translate-y-0.5 w-full max-w-[260px]"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Photo
                </Button>

                <p className="text-base text-muted-foreground mt-5 mb-1">
                  or drop a file,
                </p>
                <p className="text-sm text-muted-foreground/60">
                  JPG · PNG · HEIC
                </p>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
