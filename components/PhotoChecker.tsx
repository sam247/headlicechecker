"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, Camera, Search, AlertTriangle, MapPin, CheckCircle2, Clock, Shield, Users } from "lucide-react";
import ClinicFinder from "@/components/ClinicFinder";

type ScanResult = { label: "lice" | "nits" | "dandruff" | "clear"; confidence: number; explanation?: string };

const SCAN_MESSAGES = [
  "Examining hair strands…",
  "Looking for signs of lice…",
  "Analysing close-up details…",
  "Checking for nits near the scalp…",
  "Compiling results…",
];

type Stage = "upload" | "scanning" | "result";

interface PhotoCheckerProps {
  initialFile?: File | null;
  onFileConsumed?: () => void;
}

const PhotoChecker = ({ initialFile, onFileConsumed }: PhotoCheckerProps) => {
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [showClinics, setShowClinics] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const clinicSectionRef = useRef<HTMLDivElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      runScan(file);
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle file passed from hero
  useEffect(() => {
    if (initialFile) {
      processFile(initialFile);
      onFileConsumed?.();
    }
  }, [initialFile, processFile, onFileConsumed]);

  const runScan = async (file: File) => {
    setStage("scanning");
    setProgress(0);
    setMessageIndex(0);
    setShowClinics(false);
    setScanResult(null);
    setScanError(null);

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) return p;
        return p + Math.random() * 10 + 2;
      });
      setMessageIndex((i) => Math.min(i + 1, SCAN_MESSAGES.length - 1));
    }, 400);

    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch("/api/scan", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? data?.detail ?? "Scan failed");
      const result = data as ScanResult;
      setScanResult(result);
      if (result.label === "lice" || result.label === "nits") setShowClinics(true);
    } catch (e) {
      setScanError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      clearInterval(progressInterval);
      setProgress(100);
      setMessageIndex(SCAN_MESSAGES.length - 1);
      setTimeout(() => setStage("result"), 400);
    }
  };

  useEffect(() => {
    if (stage === "result" && scanResult && (scanResult.label === "lice" || scanResult.label === "nits") && showClinics) {
      const t = setTimeout(() => clinicSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 400);
      return () => clearTimeout(t);
    }
  }, [stage, scanResult, showClinics]);

  const scrollToClinics = () => {
    setShowClinics(true);
    setTimeout(() => clinicSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const reset = () => {
    setStage("upload");
    setProgress(0);
    setPreview(null);
    setMessageIndex(0);
    setShowClinics(false);
    setScanResult(null);
    setScanError(null);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <section id="photo-checker" className="py-20 md:py-28 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Upload a Photo for a Quick Check
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Snap a close-up of the hair or scalp and we&apos;ll give you a quick indication.
            It takes just a few seconds.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          {stage === "upload" && (
            <Card className="border-2 border-dashed border-primary/30 bg-background hover:border-primary/60 transition-colors">
              <CardContent className="p-0">
                <div
                  className="flex flex-col items-center justify-center py-16 px-8 cursor-pointer"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                >
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Camera className="h-9 w-9 text-primary" />
                  </div>
                  <p className="text-lg font-semibold text-foreground mb-2">
                    Drag & drop a photo here
                  </p>
                  <p className="text-muted-foreground text-sm mb-6">
                    or click to browse your files
                  </p>
                  <Button variant="outline" className="rounded-full border-primary/40 text-primary hover:bg-primary/5">
                    <Upload className="mr-2 h-4 w-4" />
                    Choose Photo
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) processFile(file);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {stage === "scanning" && (
            <Card className="bg-background">
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col items-center text-center">
                  {preview && (
                    <div className="w-32 h-32 rounded-2xl overflow-hidden mb-6 shadow-lg">
                      <img src={preview} alt="Uploaded photo" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-lg font-semibold text-foreground mb-1">Checking your photo…</p>
                  <p className="text-muted-foreground text-sm mb-4">
                    {SCAN_MESSAGES[messageIndex]}
                  </p>
                  <Progress value={progress} className="w-full h-3 mb-3 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-secondary" />
                  <p className="text-xs text-muted-foreground">This usually takes a few seconds</p>
                </div>
              </CardContent>
            </Card>
          )}

          {stage === "result" && (
            <Card className="bg-background border-primary/20">
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col items-center text-center">
                  {preview && (
                    <div className="w-24 h-24 rounded-2xl overflow-hidden mb-6 shadow-lg">
                      <img src={preview} alt="Uploaded photo" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {scanError ? (
                    <>
                      <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                        <AlertTriangle className="h-7 w-7 text-destructive" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">Something went wrong</h3>
                      <p className="text-muted-foreground mb-6 max-w-md">{scanError}</p>
                      <Button size="lg" variant="outline" onClick={reset} className="rounded-full border-primary/30 text-primary hover:bg-primary/5">
                        Try again
                      </Button>
                    </>
                  ) : scanResult ? (
                    <>
                      {scanResult.label === "clear" ? (
                        <>
                          <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
                          </div>
                          <h3 className="text-xl font-bold text-foreground mb-2">No signs detected</h3>
                          <p className="text-muted-foreground mb-6 max-w-md">
                            {scanResult.explanation ??
                              "We didn't spot signs of lice or nits in this image. If you're still concerned, a quick professional check can put your mind at ease."}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                            <AlertTriangle className="h-7 w-7 text-primary" />
                          </div>
                          <h3 className="text-xl font-bold text-foreground mb-2">
                            {scanResult.label === "nits"
                              ? "Possible nits (eggs) detected"
                              : scanResult.label === "dandruff"
                                ? "Likely dandruff or similar"
                                : "Potential signs detected"}
                          </h3>
                          <p className="text-muted-foreground mb-4 max-w-md">
                            {scanResult.explanation ??
                              "Based on the image, we recommend a quick professional check to be sure. Our clinics can give you a clear answer and treatment if needed."}
                          </p>
                          <p className="text-sm font-medium text-primary mb-6">
                            Find your nearest clinic below — quick, confidential, and expert.
                          </p>
                        </>
                      )}
                      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        {(scanResult.label === "lice" || scanResult.label === "nits") && (
                          <Button
                            size="lg"
                            onClick={scrollToClinics}
                            className="rounded-full px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                          >
                            <MapPin className="mr-2 h-5 w-5" />
                            Find your nearest clinic
                          </Button>
                        )}
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={reset}
                          className="rounded-full border-primary/30 text-primary hover:bg-primary/5"
                        >
                          Check another photo
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-muted-foreground mb-6">No result yet.</p>
                      <Button size="lg" variant="outline" onClick={reset} className="rounded-full border-primary/30 text-primary hover:bg-primary/5">
                        Check another photo
                      </Button>
                    </>
                  )}
                  <p className="mt-8 text-xs text-muted-foreground max-w-sm">
                    <strong>Disclaimer:</strong> This tool provides an indicative result only and is not a
                    medical diagnosis. Always consult a professional for confirmation.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {showClinics && stage === "result" && (
          <div ref={clinicSectionRef} className="mt-16 scroll-mt-8">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Get peace of mind — visit your nearest head lice clinic
              </h3>
              <p className="text-muted-foreground mb-8">
                A quick in-person check takes minutes. Our clinics are experts at putting families at ease.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <span className="flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  Quick, same-day checks
                </span>
                <span className="flex items-center gap-2 text-foreground">
                  <Shield className="h-4 w-4 text-primary" />
                  Confidential & professional
                </span>
                <span className="flex items-center gap-2 text-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  Expert removal & advice
                </span>
              </div>
            </div>
            <ClinicFinder />
          </div>
        )}
      </div>
    </section>
  );
};

export default PhotoChecker;
