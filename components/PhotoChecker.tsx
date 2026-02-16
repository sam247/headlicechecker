"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { AlertTriangle, Camera, CheckCircle2, Loader2, Upload, RefreshCw, MapPin, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import ClinicFinder from "@/components/ClinicFinder";
import ClinicContactForm from "@/components/site/ClinicContactForm";
import { trackEvent } from "@/lib/data/events";
import { getClinics, getSiteCopy } from "@/lib/data/content";
import type { DetectionItem, ScanConfidenceLevel, ScanErrorCode, ScanLabel } from "@/lib/data/types";

type ScanResult = {
  label: ScanLabel;
  confidence: number;
  explanation?: string;
  confidenceLevel?: ScanConfidenceLevel;
  detections?: DetectionItem[];
  imageMeta?: { width: number; height: number };
  summary?: {
    totalDetections: number;
    liceCount: number;
    nitsCount: number;
    strongestLabel?: Exclude<ScanLabel, "clear">;
  };
};

const MIN_SIDE_PX = 640;
const TARGET_LONG_EDGE_PX = 1024;
const SCAN_STEPS = [15, 33, 52, 70, 86, 95];
const OVERLAY_UI_ENABLED = process.env.NEXT_PUBLIC_SCAN_OVERLAY_UI === "true";
const MODAL_LEAD_FLOW_ENABLED = process.env.NEXT_PUBLIC_MODAL_LEAD_FLOW === "true";

type Stage = "upload" | "confirmSize" | "scanning" | "result";
type DetectionFilter = "all" | Exclude<ScanLabel, "clear">;
type CoordinateMode = "center" | "top_left";

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

function confidenceLabel(level?: ScanConfidenceLevel): string {
  if (!level) return "Medium";
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function markerClasses(label: Exclude<ScanLabel, "clear">): { stroke: string; fill: string; badge: string } {
  if (label === "lice") return { stroke: "stroke-[#e45a2a]", fill: "fill-[#e45a2a]/20", badge: "fill-[#e45a2a]" };
  if (label === "nits") return { stroke: "stroke-[#d89a1a]", fill: "fill-[#d89a1a]/20", badge: "fill-[#d89a1a]" };
  if (label === "dandruff") return { stroke: "stroke-[#2779c7]", fill: "fill-[#2779c7]/20", badge: "fill-[#2779c7]" };
  return { stroke: "stroke-[#b13b62]", fill: "fill-[#b13b62]/20", badge: "fill-[#b13b62]" };
}

function nextStepsForLabel(label: ScanLabel): string[] {
  if (label === "lice" || label === "nits") {
    return [
      "Arrange a professional confirmation as soon as possible.",
      "Avoid sharing brushes, hats, and bedding until checked.",
      "Check close household contacts in bright light.",
    ];
  }
  if (label === "dandruff" || label === "psoriasis") {
    return [
      "Monitor symptoms over the next few days.",
      "If irritation persists, speak with a GP or dermatologist.",
      "Re-scan with a clearer close-up if symptoms change.",
    ];
  }
  return [
    "Continue routine scalp checks during the week.",
    "If symptoms persist, re-scan with sharper focus near the roots.",
    "Seek professional advice if itching or irritation continues.",
  ];
}

function inferCoordinateMode(
  detections: DetectionItem[],
  meta?: { width: number; height: number } | null
): CoordinateMode {
  if (!meta || detections.length === 0) return "center";
  const sample = detections.slice(0, 20);
  let likelyTopLeftVotes = 0;

  for (const d of sample) {
    const leftFromCenter = d.x - d.width / 2;
    const topFromCenter = d.y - d.height / 2;
    const rightFromCenter = d.x + d.width / 2;
    const bottomFromCenter = d.y + d.height / 2;

    // If many boxes would go out-of-bounds in center mode, x/y are likely top-left.
    if (
      leftFromCenter < 0 ||
      topFromCenter < 0 ||
      rightFromCenter > meta.width ||
      bottomFromCenter > meta.height
    ) {
      likelyTopLeftVotes += 1;
    }
  }

  return likelyTopLeftVotes / sample.length >= 0.45 ? "top_left" : "center";
}

export default function PhotoChecker({ initialFile, onFileConsumed }: PhotoCheckerProps) {
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanErrorCode, setScanErrorCode] = useState<ScanErrorCode | null>(null);
  const [showClinicsModal, setShowClinicsModal] = useState(false);
  const [contactPanelOpen, setContactPanelOpen] = useState(false);
  const [selectedClinicId, setSelectedClinicId] = useState<string | undefined>(undefined);
  const [retryCooldown, setRetryCooldown] = useState(0);
  const [showMarkers, setShowMarkers] = useState(true);
  const [markerFilter, setMarkerFilter] = useState<DetectionFilter>("all");
  const [previewMeta, setPreviewMeta] = useState<{ width: number; height: number } | null>(null);
  const [scanPreviewMeta, setScanPreviewMeta] = useState<{ width: number; height: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const selectedClinicName = useMemo(() => {
    if (!selectedClinicId) return undefined;
    return getClinics("ALL").find((c) => c.id === selectedClinicId)?.name;
  }, [selectedClinicId]);

  const reset = useCallback(() => {
    setStage("upload");
    setProgress(0);
    setPreview(null);
    setScanPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPreviewMeta(null);
    setScanPreviewMeta(null);
    setPendingFile(null);
    setScanResult(null);
    setScanError(null);
    setScanErrorCode(null);
    setShowClinicsModal(false);
    setContactPanelOpen(false);
    setSelectedClinicId(undefined);
    setRetryCooldown(0);
    setShowMarkers(true);
    setMarkerFilter("all");
  }, []);

  useEffect(() => {
    if (retryCooldown <= 0) return;
    const t = setTimeout(() => setRetryCooldown((v) => Math.max(0, v - 1)), 1000);
    return () => clearTimeout(t);
  }, [retryCooldown]);

  useEffect(() => {
    return () => {
      if (scanPreview) URL.revokeObjectURL(scanPreview);
    };
  }, [scanPreview]);

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
      setShowClinicsModal(false);
      setContactPanelOpen(false);
      setSelectedClinicId(undefined);
      setShowMarkers(true);
      setMarkerFilter("all");
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
        const scanUrl = URL.createObjectURL(blob);
        setScanPreview((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return scanUrl;
        });
        const scanImg = new Image();
        scanImg.onload = () => {
          setScanPreviewMeta({ width: scanImg.naturalWidth, height: scanImg.naturalHeight });
        };
        scanImg.onerror = () => setScanPreviewMeta(null);
        scanImg.src = scanUrl;

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

        await trackEvent({
          event: "scan_result",
          label: result.label,
          confidenceLevel: result.confidenceLevel,
          detectionCount: result.detections?.length,
          topDetectionLabel: result.summary?.strongestLabel,
          topDetectionConfidenceLevel: result.detections?.[0]?.confidenceLevel,
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
          setPreviewMeta({ width: img.naturalWidth, height: img.naturalHeight });
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
        setPreviewMeta(null);
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
  const displayPreview = scanPreview ?? preview;
  const overlayMeta = scanResult?.imageMeta ?? scanPreviewMeta ?? previewMeta;
  const allDetections = useMemo(() => scanResult?.detections ?? [], [scanResult?.detections]);
  const coordinateMode = useMemo(() => inferCoordinateMode(allDetections, overlayMeta), [allDetections, overlayMeta]);
  const markerFilterEnabled = OVERLAY_UI_ENABLED && allDetections.length > 0;
  const filteredDetections = useMemo(
    () => allDetections.filter((d) => markerFilter === "all" || d.label === markerFilter),
    [allDetections, markerFilter]
  );
  const detectionCounts = useMemo(
    () =>
      allDetections.reduce(
        (acc, d) => {
          acc[d.label] += 1;
          return acc;
        },
        { lice: 0, nits: 0, dandruff: 0, psoriasis: 0 }
      ),
    [allDetections]
  );

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
                  {displayPreview && (
                    <NextImage
                      src={displayPreview}
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
                      {displayPreview && (
                        <div className="mx-auto mb-5 w-full max-w-[560px]">
                          <div className="rounded-2xl border border-border/80 bg-muted/40 p-3">
                            <div className="relative mx-auto w-fit overflow-hidden rounded-xl bg-card">
                              <NextImage
                                src={displayPreview}
                                alt="Uploaded scalp preview"
                                width={overlayMeta?.width ?? 1024}
                                height={overlayMeta?.height ?? 1024}
                                unoptimized
                                className="block max-h-[320px] w-auto max-w-full rounded-xl"
                              />
                              {OVERLAY_UI_ENABLED &&
                                showMarkers &&
                                filteredDetections.length > 0 &&
                                overlayMeta?.width &&
                                overlayMeta?.height && (
                                  <svg
                                    aria-hidden="true"
                                    viewBox={`0 0 ${overlayMeta.width} ${overlayMeta.height}`}
                                    className="pointer-events-none absolute inset-0 h-full w-full"
                                    preserveAspectRatio="xMidYMid meet"
                                  >
                                    {filteredDetections.map((det, index) => {
                                      const marker = markerClasses(det.label);
                                      const cx = coordinateMode === "top_left" ? det.x + det.width / 2 : det.x;
                                      const cy = coordinateMode === "top_left" ? det.y + det.height / 2 : det.y;
                                      return (
                                        <g
                                          key={det.id}
                                          className={`scan-ring-reveal ${marker.stroke} ${marker.fill}`}
                                          style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                          <ellipse
                                            cx={cx}
                                            cy={cy}
                                            rx={Math.max(det.width / 2, 8)}
                                            ry={Math.max(det.height / 2, 8)}
                                            strokeWidth={2}
                                          />
                                          <circle cx={cx + det.width / 2} cy={cy - det.height / 2} r={13} className={marker.badge} />
                                          <text
                                            x={cx + det.width / 2}
                                            y={cy - det.height / 2 + 4}
                                            textAnchor="middle"
                                            className="fill-white text-[12px] font-bold"
                                          >
                                            {index + 1}
                                          </text>
                                        </g>
                                      );
                                    })}
                                  </svg>
                                )}
                            </div>

                            {markerFilterEnabled && (
                              <>
                                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="rounded-full"
                                    onClick={async () => {
                                      const next = !showMarkers;
                                      setShowMarkers(next);
                                      await trackEvent({ event: "scan_overlay_toggled", enabled: next });
                                    }}
                                  >
                                    {showMarkers ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                                    {showMarkers ? "Hide markers" : "Show markers"}
                                  </Button>
                                </div>
                                <div className="scan-legend-reveal mt-3 flex flex-wrap items-center justify-center gap-2">
                                  {(
                                    [
                                      { key: "all", label: "All", count: allDetections.length },
                                      { key: "lice", label: "Lice", count: detectionCounts.lice },
                                      { key: "nits", label: "Nits", count: detectionCounts.nits },
                                      { key: "dandruff", label: "Dandruff", count: detectionCounts.dandruff },
                                      { key: "psoriasis", label: "Psoriasis", count: detectionCounts.psoriasis },
                                    ] as const
                                  )
                                    .filter((item) => item.key === "all" || item.count > 0)
                                    .map((item) => (
                                      <button
                                        key={item.key}
                                        type="button"
                                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                          markerFilter === item.key
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                                        }`}
                                        onClick={async () => {
                                          setMarkerFilter(item.key);
                                          await trackEvent({ event: "scan_legend_filter_used", filter: item.key });
                                        }}
                                      >
                                        {item.label} ({item.count})
                                      </button>
                                    ))}
                                </div>
                                <p className="sr-only">
                                  Detected {allDetections.length} likely regions. Current filter: {markerFilter}.
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">{resultCopy.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{scanResult.explanation ?? resultCopy.description}</p>

                      {OVERLAY_UI_ENABLED && scanResult.summary && (
                        <div className="mx-auto mt-4 grid max-w-lg gap-2 sm:grid-cols-2">
                          <div className="rounded-xl border border-border bg-background px-3 py-2 text-left">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What we found</p>
                            <p className="mt-1 text-sm font-semibold">
                              {scanResult.summary.totalDetections} likely indicator
                              {scanResult.summary.totalDetections === 1 ? "" : "s"}
                            </p>
                          </div>
                          <div className="rounded-xl border border-border bg-background px-3 py-2 text-left">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Confidence</p>
                            <p className="mt-1 text-sm font-semibold">{confidenceLabel(scanResult.confidenceLevel)}</p>
                          </div>
                        </div>
                      )}

                      <div className="mx-auto mt-4 max-w-lg rounded-xl border border-border bg-background p-4 text-left">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What to do now</p>
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                          {nextStepsForLabel(scanResult.label).map((tip) => (
                            <li key={tip}>• {tip}</li>
                          ))}
                        </ul>
                      </div>

                      {scanResult.confidenceLevel === "low" && (
                        <div className="mx-auto mt-4 max-w-lg rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-left text-sm text-amber-800">
                          <p className="font-semibold">Low confidence image quality tip</p>
                          <p className="mt-1">
                            Re-upload a sharper close-up in bright light, with hair parted to show the roots clearly.
                          </p>
                        </div>
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
                      <Button
                        className="rounded-full"
                        variant="outline"
                        onClick={async () => {
                          setShowClinicsModal(true);
                          if (MODAL_LEAD_FLOW_ENABLED) {
                            await trackEvent({ event: "clinic_modal_opened", label: scanResult?.label });
                          }
                          await trackEvent({ event: "scan_clinic_cta_clicked", label: scanResult?.label });
                        }}
                      >
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
        </div>
      </div>

      <Dialog
        open={showClinicsModal}
        onOpenChange={(open) => {
          setShowClinicsModal(open);
          if (!open) {
            setContactPanelOpen(false);
            setSelectedClinicId(undefined);
          }
        }}
      >
        <DialogContent className="clinic-modal-shell h-[min(92dvh,900px)] w-[95vw] max-w-6xl overflow-hidden p-0 md:h-[min(85vh,900px)]">
          <DialogHeader className="border-b border-border px-6 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <DialogTitle>Find a clinic near you</DialogTitle>
                <DialogDescription>
                  Search clinics by ZIP/postcode or city. Submit one quick form and we handle routing to the clinic.
                </DialogDescription>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href="/find-clinics?view=list&country=US">Open full page</Link>
              </Button>
            </div>
          </DialogHeader>
          <div className="relative flex-1 min-h-0 px-2 pb-2 pt-0 md:px-4">
            <ClinicFinder
              showHeader={false}
              country="US"
              mode="modal"
              hideDirectContact={MODAL_LEAD_FLOW_ENABLED}
              onContactClinic={async (clinicId) => {
                setSelectedClinicId(clinicId);
                setContactPanelOpen(true);
                await trackEvent({ event: "clinic_contact_panel_opened", clinicId, label: scanResult?.label });
              }}
            />
            {MODAL_LEAD_FLOW_ENABLED && contactPanelOpen && (
              <>
                <button
                  type="button"
                  className="absolute inset-0 z-[60] bg-black/35"
                  onClick={() => setContactPanelOpen(false)}
                  aria-label="Close contact panel"
                />
                <aside className="clinic-contact-panel z-[70] flex h-full w-full max-w-[440px] flex-col border-l border-border bg-background p-4 md:p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Contact clinic</p>
                      {selectedClinicName && <p className="text-xs text-muted-foreground">{selectedClinicName}</p>}
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setContactPanelOpen(false)}>
                      <ArrowLeft className="mr-1 h-4 w-4" />
                      Back
                    </Button>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                    <ClinicContactForm
                      compact
                      clinicId={selectedClinicId}
                      clinicName={selectedClinicName}
                      scanLabel={scanResult?.label}
                      scanConfidenceLevel={scanResult?.confidenceLevel}
                      source="modal"
                      onCancel={() => setContactPanelOpen(false)}
                    />
                  </div>
                </aside>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
