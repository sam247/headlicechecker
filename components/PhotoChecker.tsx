"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { AlertTriangle, Camera, CheckCircle2, Loader2, Upload, RefreshCw, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ClinicFinder from "@/components/ClinicFinder";
import ClinicContactForm from "@/components/site/ClinicContactForm";
import { trackEvent } from "@/lib/data/events";
import { getClinics, getSiteCopy } from "@/lib/data/content";
import type { ScanConfidenceLevel, ScanErrorCode, ScanLabel } from "@/lib/data/types";

type ScanResult = {
  label: ScanLabel;
  confidence: number;
  explanation?: string;
  confidenceLevel?: ScanConfidenceLevel;
};

const MIN_SIDE_PX = 640;
const TARGET_LONG_EDGE_PX = 1024;
const SCAN_STEPS = [15, 33, 52, 70, 86, 95];
const defaultClinic = getClinics("US")[0];

type Stage = "upload" | "confirmSize" | "scanning" | "result";

interface PhotoCheckerProps {
  initialFile?: File | null;
  onFileConsumed?: () => void;
}

const copy = getSiteCopy();

function nextStepCopy(label: ScanLabel): { title: string; description: string; showClinicCTA: boolean } {
  if (label === "lice" || label === "nits") {
    return {
      title: "Possible lice activity detected",
      description:
        "This result suggests signs that should be professionally confirmed. Fast treatment can reduce spread in your household.",
      showClinicCTA: true,
    };
  }

  if (label === "dandruff" || label === "psoriasis") {
    return {
      title: label === "psoriasis" ? "Possible scalp irritation pattern" : "Likely dandruff-like pattern",
      description:
        "This can overlap visually with other scalp conditions. If symptoms continue, speak to a GP or dermatologist for medical advice.",
      showClinicCTA: false,
    };
  }

  return {
    title: "No clear signs detected in this image",
    description:
      "This is reassuring, but routine checks are still recommended. Re-scan with a sharper close-up if symptoms persist.",
    showClinicCTA: false,
  };
}

export default function PhotoChecker({ initialFile, onFileConsumed }: PhotoCheckerProps) {
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanErrorCode, setScanErrorCode] = useState<ScanErrorCode | null>(null);
  const [showClinics, setShowClinics] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [retryCooldown, setRetryCooldown] = useState(0);
  const [selectedClinicId, setSelectedClinicId] = useState<string | undefined>(defaultClinic?.id);
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedClinicName = useMemo(() => {
    if (!selectedClinicId) return undefined;
    return getClinics("ALL").find((c) => c.id === selectedClinicId)?.name;
  }, [selectedClinicId]);

  const reset = useCallback(() => {
    setStage("upload");
    setProgress(0);
    setPreview(null);
    setPendingFile(null);
    setScanResult(null);
    setScanError(null);
    setScanErrorCode(null);
    setShowClinics(false);
    setShowContactForm(false);
    setRetryCooldown(0);
  }, []);

  useEffect(() => {
    if (retryCooldown <= 0) return;
    const t = setTimeout(() => setRetryCooldown((v) => Math.max(0, v - 1)), 1000);
    return () => clearTimeout(t);
  }, [retryCooldown]);

  const resizeToLongEdge = useCallback((file: File, longEdge: number): Promise<Blob> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const scale = w > h ? longEdge / w : longEdge / h;
        if (scale >= 1) {
          resolve(file);
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve(blob ?? file), "image/jpeg", 0.9);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    });
  }, []);

  const runScan = useCallback(
    async (file: File) => {
      setStage("scanning");
      setProgress(8);
      setScanError(null);
      setScanErrorCode(null);
      setScanResult(null);
      setShowClinics(false);
      setShowContactForm(false);
      await trackEvent({ event: "scan_start" });

      let index = 0;
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (index >= SCAN_STEPS.length) return prev;
          const next = SCAN_STEPS[index];
          index += 1;
          return next;
        });
      }, 450);

      try {
        const blob = await resizeToLongEdge(file, TARGET_LONG_EDGE_PX);
        const form = new FormData();
        form.append("image", blob, "image.jpg");

        const res = await fetch("/api/scan", { method: "POST", body: form });
        const data = (await res.json()) as ScanResult & { code?: ScanErrorCode; error?: string; detail?: string };

        if (!res.ok) {
          setScanErrorCode(data?.code ?? "UNKNOWN_ERROR");
          setScanError(data?.detail ? `${data?.error ?? "Scan failed."} (${data.detail})` : data?.error ?? "Scan failed.");
          if (data?.code === "NO_PROVIDER_CONFIGURED" || data?.code === "PROVIDER_ERROR") {
            setRetryCooldown(5);
          }
          return;
        }

        const result = data as ScanResult;
        setScanResult(result);
        const shouldShowClinicFlow = result.label === "lice" || result.label === "nits";
        setShowClinics(shouldShowClinicFlow);
        setShowContactForm(shouldShowClinicFlow);

        await trackEvent({
          event: "scan_result",
          label: result.label,
          confidenceLevel: result.confidenceLevel,
        });
      } catch (error) {
        setScanErrorCode("UNKNOWN_ERROR");
        setScanError(error instanceof Error ? error.message : "Unexpected error.");
      } finally {
        clearInterval(timer);
        setProgress(100);
        setTimeout(() => setStage("result"), 220);
      }
    },
    [resizeToLongEdge]
  );

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const minSide = Math.min(img.naturalWidth, img.naturalHeight);

        const reader = new FileReader();
        reader.onload = (event) => {
          setPreview(event.target?.result as string);
          setPendingFile(file);
          if (minSide < MIN_SIDE_PX) {
            setStage("confirmSize");
            return;
          }
          runScan(file);
        };
        reader.readAsDataURL(file);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        setScanError("Could not read image. Please try another file.");
        setScanErrorCode("BAD_REQUEST");
        setStage("result");
      };

      img.src = url;
    },
    [runScan]
  );

  useEffect(() => {
    if (initialFile) {
      processFile(initialFile);
      onFileConsumed?.();
    }
  }, [initialFile, onFileConsumed, processFile]);

  const resultCopy = scanResult ? nextStepCopy(scanResult.label) : null;

  return (
    <section id="start-scan" className="section-shell bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="section-title">Start a free photo scan</h2>
            <p className="mx-auto mt-3 max-w-2xl section-copy">
              Upload a clear scalp close-up for an indicative result in seconds. Designed for anxious parents on mobile.
            </p>
          </div>

          <div className="mx-auto max-w-2xl">
            {stage === "upload" && (
              <Card className="border-2 border-dashed border-primary/30">
                <CardContent className="p-6 md:p-10">
                  <div
                    className="cursor-pointer text-center"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file) processFile(file);
                    }}
                    onClick={() => fileRef.current?.click()}
                  >
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <Camera className="h-7 w-7 text-primary" />
                    </div>
                    <p className="text-lg font-semibold">Drop a photo or tap to upload</p>
                    <p className="mt-1 text-sm text-muted-foreground">JPG, PNG, HEIC accepted</p>

                    <div className="mx-auto mt-5 max-w-lg rounded-xl bg-secondary/60 p-4 text-left">
                      <p className="text-sm font-semibold">Best photo checklist</p>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <li>Bright lighting and close to scalp</li>
                        <li>Hair parted to show roots</li>
                        <li>At least {MIN_SIDE_PX}px shortest side</li>
                      </ul>
                    </div>

                    <Button className="mt-6 rounded-full">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload photo
                    </Button>

                    <input
                      ref={fileRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) processFile(file);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {stage === "confirmSize" && preview && (
              <Card>
                <CardContent className="p-6 text-center md:p-8">
                  <NextImage
                    src={preview}
                    alt="Uploaded preview"
                    width={112}
                    height={112}
                    unoptimized
                    className="mx-auto mb-4 h-28 w-28 rounded-xl object-cover"
                  />
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
                    <AlertTriangle className="h-5 w-5 text-amber-700" />
                  </div>
                  <p className="text-lg font-semibold">Photo may be too small for strong confidence</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You can continue, but a closer image usually improves reliability.
                  </p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <Button variant="outline" className="rounded-full" onClick={reset}>
                      Choose another photo
                    </Button>
                    <Button
                      className="rounded-full"
                      onClick={() => {
                        if (pendingFile) {
                          runScan(pendingFile);
                          setPendingFile(null);
                        }
                      }}
                    >
                      Continue anyway
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {stage === "scanning" && (
              <Card>
                <CardContent className="p-6 text-center md:p-8">
                  {preview && (
                    <NextImage
                      src={preview}
                      alt="Uploaded preview"
                      width={112}
                      height={112}
                      unoptimized
                      className="mx-auto mb-5 h-28 w-28 rounded-xl object-cover"
                    />
                  )}
                  <Loader2 className="mx-auto h-7 w-7 animate-spin text-primary" />
                  <p className="mt-4 text-lg font-semibold">Analyzing photo</p>
                  <p className="mt-1 text-sm text-muted-foreground">Checking for lice, nits, dandruff, and scalp patterns</p>
                  <Progress value={progress} className="mx-auto mt-5 h-3 w-full max-w-md" />
                </CardContent>
              </Card>
            )}

            {stage === "result" && (
              <Card>
                <CardContent className="p-6 text-center md:p-8">
                  {preview && (
                    <NextImage
                      src={preview}
                      alt="Uploaded preview"
                      width={96}
                      height={96}
                      unoptimized
                      className="mx-auto mb-5 h-24 w-24 rounded-xl object-cover"
                    />
                  )}

                  {scanError ? (
                    <>
                      <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
                      <h3 className="mt-3 text-xl font-semibold">
                        {scanErrorCode === "NO_PROVIDER_CONFIGURED"
                          ? "Scan service setup is in progress"
                          : "We couldn't process this image"}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">{scanError}</p>
                      {(scanErrorCode === "NO_PROVIDER_CONFIGURED" || scanErrorCode === "PROVIDER_ERROR") && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Please retry in a few seconds or request a clinic callback now.
                        </p>
                      )}
                    </>
                  ) : scanResult && resultCopy ? (
                    <>
                      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">{resultCopy.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{scanResult.explanation ?? resultCopy.description}</p>
                      {scanResult.confidenceLevel === "low" && (
                        <p className="mt-3 text-sm text-amber-700">
                          Confidence is low for this image. Re-upload a sharper close-up for a better signal.
                        </p>
                      )}
                    </>
                  ) : null}

                  <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <Button className="rounded-full" onClick={reset}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Scan another photo
                    </Button>
                    {scanErrorCode && (
                      <Button
                        className="rounded-full"
                        variant="outline"
                        disabled={retryCooldown > 0 || !pendingFile}
                        onClick={() => pendingFile && runScan(pendingFile)}
                      >
                        Retry {retryCooldown > 0 ? `in ${retryCooldown}s` : "now"}
                      </Button>
                    )}
                    {(scanResult?.label === "lice" || scanResult?.label === "nits") && (
                      <Button className="rounded-full" variant="outline" onClick={() => setShowClinics(true)}>
                        <MapPin className="mr-2 h-4 w-4" />
                        View clinics
                      </Button>
                    )}
                    {scanErrorCode === "NO_PROVIDER_CONFIGURED" && (
                      <Button asChild className="rounded-full" variant="outline">
                        <Link href="/contact">Request clinic callback</Link>
                      </Button>
                    )}
                  </div>

                  <p className="mt-6 text-xs text-muted-foreground">{copy.medicalDisclaimer}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {stage === "result" && showContactForm && scanResult && (
            <div className="mx-auto mt-8 max-w-2xl">
              <ClinicContactForm
                clinicId={selectedClinicId}
                clinicName={selectedClinicName}
                scanLabel={scanResult.label}
                scanConfidenceLevel={scanResult.confidenceLevel}
              />
            </div>
          )}

          {stage === "result" && showClinics && (
            <ClinicFinder
              showHeader={false}
              country="US"
              onClinicSelect={(clinicId) => {
                setSelectedClinicId(clinicId);
                setShowContactForm(true);
                document.getElementById("start-scan")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
