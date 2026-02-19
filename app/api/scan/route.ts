import { NextRequest, NextResponse } from "next/server";
import sizeOf from "image-size";

export const maxDuration = 60;

export type ScanResult = {
  label: "lice" | "nits" | "dandruff" | "psoriasis" | "clear";
  confidence: number;
  explanation?: string;
  confidenceLevel?: "high" | "medium" | "low";
  detections?: DetectionItem[];
  imageMeta?: { width: number; height: number };
  summary?: {
    totalDetections: number;
    liceCount: number;
    nitsCount: number;
    strongestLabel?: "lice" | "nits" | "dandruff" | "psoriasis";
  };
};

type DetectionItem = {
  id: string;
  label: "lice" | "nits" | "dandruff" | "psoriasis";
  confidence: number;
  confidenceLevel: "high" | "medium" | "low";
  x: number;
  y: number;
  width: number;
  height: number;
};

type ProviderOutcome =
  | { ok: true; result: ScanResult }
  | { ok: false; reason: "no_config" }
  | { ok: false; reason: "provider_error"; detail?: string };

const DETECTION_API_URL = process.env.DETECTION_API_URL;
/** Minimum confidence for detections from DETECTION_API_URL; lower = more sensitive. */
const DETECTION_API_MIN_CONFIDENCE = 0.05;

// Roboflow fallback (when custom model fails or returns no detections)
const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY;
const ROBOFLOW_WORKSPACE = process.env.ROBOFLOW_WORKSPACE;
const ROBOFLOW_WORKFLOW_ID = process.env.ROBOFLOW_WORKFLOW_ID;
/** Legacy model: project_id/version (e.g. find-head-lice-psoriases-and-dandruffs/1). Used when workflow is not set. */
const ROBOFLOW_MODEL_ID = process.env.ROBOFLOW_MODEL_ID;
const ROBOFLOW_BASE = "https://detect.roboflow.com";
/** Serverless Hosted Workflow API (Rapid / Deploy in app). */
const ROBOFLOW_SERVERLESS_BASE = "https://serverless.roboflow.com";

const VALID_LABELS: ScanResult["label"][] = ["lice", "nits", "dandruff", "psoriasis", "clear"];

const ALLOW_SCAN_STUB = process.env.NODE_ENV !== "production" && process.env.ALLOW_SCAN_STUB === "true";

function normalizeLabel(s: unknown): ScanResult["label"] {
  if (typeof s !== "string") return "clear";
  const lower = s.toLowerCase().trim();
  if (VALID_LABELS.includes(lower as ScanResult["label"])) return lower as ScanResult["label"];
  if (lower === "nit") return "nits";
  if (lower === "head lice" || lower === "lice detected" || lower === "louse") return "lice";
  if (lower === "no lice" || lower === "none") return "clear";
  if (lower === "scalp psoriasis" || lower === "psoriasis") return "psoriasis";
  return "clear";
}

function confidenceLevelFromConfidence(v: number): "high" | "medium" | "low" {
  if (v >= 0.8) return "high";
  if (v >= 0.55) return "medium";
  return "low";
}

type ImageDimensions = { width: number; height: number };

function normalizeDetectionLabel(value: unknown): DetectionItem["label"] | null {
  const normalized = normalizeLabel(value);
  if (normalized === "clear") return null;
  return normalized;
}

type DetectionApiDetection = {
  label?: unknown;
  confidence?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

function mapDetectionApiDetections(
  raw: DetectionApiDetection[],
  imageDimensions: ImageDimensions | null,
  normalized: boolean
): DetectionItem[] {
  if (!imageDimensions) return [];
  const { width: imgW, height: imgH } = imageDimensions;
  const out: DetectionItem[] = [];
  raw.forEach((d, i) => {
    const label = normalizeDetectionLabel(d.label);
    if (!label) return;
    const confidence =
      typeof d.confidence === "number" && d.confidence >= 0 && d.confidence <= 1 ? d.confidence : 0.7;
    if (confidence < DETECTION_API_MIN_CONFIDENCE) return;
    const x = typeof d.x === "number" ? d.x : null;
    const y = typeof d.y === "number" ? d.y : null;
    const w = typeof d.width === "number" ? d.width : null;
    const h = typeof d.height === "number" ? d.height : null;
    if (x == null || y == null || w == null || h == null) return;
    const px = normalized ? x * imgW : x;
    const py = normalized ? y * imgH : y;
    const pw = normalized ? w * imgW : Math.max(w, 4);
    const ph = normalized ? h * imgH : Math.max(h, 4);
    out.push({
      id: `det-${i + 1}`,
      label,
      confidence,
      confidenceLevel: confidenceLevelFromConfidence(confidence),
      x: px,
      y: py,
      width: pw,
      height: ph,
    });
  });
  out.sort((a, b) => b.confidence - a.confidence);
  return out;
}

async function scanWithDetectionApi(
  imageBase64: string,
  imageDimensions?: ImageDimensions | null
): Promise<ProviderOutcome> {
  if (!DETECTION_API_URL) return { ok: false, reason: "no_config" };

  const url = DETECTION_API_URL.replace(/\/$/, "");
  // Log masked URL for debugging (domain only)
  const urlDomain = url.replace(/^https?:\/\//, "").split("/")[0];
  const t0 = Date.now();
  console.info("[scan][detection_api] calling inference", { domain: urlDomain });
  const body: { image: string; base64?: string; width?: number; height?: number } = {
    image: imageBase64,
    base64: imageBase64,
  };
  if (imageDimensions) {
    body.width = imageDimensions.width;
    body.height = imageDimensions.height;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    const res = await fetch(`${url}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const fetchMs = Date.now() - t0;

    if (!res.ok) {
      const text = await res.text();
      console.warn("[scan][detection_api] inference non-OK", { status: res.status, ms: fetchMs, detail: text.slice(0, 200) });
      return { ok: false, reason: "provider_error", detail: text.slice(0, 200) };
    }

    const data = (await res.json()) as {
      label?: unknown;
      confidence?: number;
      explanation?: string;
      detections?: DetectionApiDetection[];
      detections_normalized?: boolean;
      image_width?: number;
      image_height?: number;
    };

    const confidence = typeof data.confidence === "number" ? data.confidence : 0.85;
    const normalized = data.detections_normalized === true;
    const rawDetectionCount = Array.isArray(data.detections) ? data.detections.length : 0;
    let detections: DetectionItem[] = [];
    let imageMeta: { width: number; height: number } | undefined;
    let summary: ScanResult["summary"] | undefined;

    if (Array.isArray(data.detections) && data.detections.length > 0 && imageDimensions) {
      detections = mapDetectionApiDetections(data.detections, imageDimensions, normalized);
      console.info("[scan][detection_api] inference response", {
        label: data.label,
        confidence,
        rawDetectionCount,
        afterMinConfidence: detections.length,
        ms: fetchMs,
      });
      imageMeta =
        typeof data.image_width === "number" && typeof data.image_height === "number"
          ? { width: data.image_width, height: data.image_height }
          : imageDimensions;
      const liceCount = detections.filter((d) => d.label === "lice").length;
      const nitsCount = detections.filter((d) => d.label === "nits").length;
      const strongest = detections[0]?.label;
      summary = {
        totalDetections: detections.length,
        liceCount,
        nitsCount,
        strongestLabel: strongest ?? undefined,
      };
    } else if (imageDimensions) {
      imageMeta = imageDimensions;
    }
    if (rawDetectionCount === 0) {
      console.info("[scan][detection_api] inference returned no detections", { label: data.label, confidence });
    }

    return {
      ok: true,
      result: {
        label: normalizeLabel(data.label),
        confidence,
        explanation: typeof data.explanation === "string" ? data.explanation : undefined,
        confidenceLevel: confidenceLevelFromConfidence(confidence),
        detections: detections.length > 0 ? detections : undefined,
        imageMeta,
        summary,
      },
    };
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      console.error("[scan][detection_api] timeout after 55s", { urlDomain });
      return { ok: false, reason: "provider_error", detail: "Inference service timeout (55s)" };
    }
    console.warn("[scan][detection_api] request failed", { error: String(e), url });
    return { ok: false, reason: "provider_error", detail: String(e) };
  }
}

async function scanWithRoboflow(imageBase64: string): Promise<ProviderOutcome> {
  if (!ROBOFLOW_API_KEY) return { ok: false, reason: "no_config" };
  if (ROBOFLOW_WORKSPACE && ROBOFLOW_WORKFLOW_ID) {
    return scanWithRoboflowWorkflow(imageBase64);
  }
  if (ROBOFLOW_MODEL_ID) {
    return scanWithRoboflowModel(imageBase64);
  }
  return { ok: false, reason: "no_config" };
}

/** Roboflow Workflow (Run in Cloud / Rapid deploy: serverless.roboflow.com/{workspace}/workflows/{workflow_id}). */
async function scanWithRoboflowWorkflow(imageBase64: string): Promise<ProviderOutcome> {
  if (!ROBOFLOW_WORKSPACE || !ROBOFLOW_WORKFLOW_ID) return { ok: false, reason: "no_config" };
  const path = `${ROBOFLOW_SERVERLESS_BASE}/${encodeURIComponent(ROBOFLOW_WORKSPACE)}/workflows/${encodeURIComponent(ROBOFLOW_WORKFLOW_ID)}`;
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: ROBOFLOW_API_KEY,
        inputs: { image: { type: "base64", value: imageBase64 } },
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, reason: "provider_error", detail: text.slice(0, 200) };
    }
    const data = (await res.json()) as Record<string, unknown>;
    return mapRoboflowResult(data);
  } catch (e) {
    return { ok: false, reason: "provider_error", detail: String(e) };
  }
}

/** Roboflow legacy model (project_id/version, e.g. find-head-lice-psoriases-and-dandruffs/1). */
async function scanWithRoboflowModel(imageBase64: string): Promise<ProviderOutcome> {
  if (!ROBOFLOW_MODEL_ID) return { ok: false, reason: "no_config" };
  const [projectId, version] = ROBOFLOW_MODEL_ID.split("/");
  if (!projectId || !version) return { ok: false, reason: "no_config" };
  const url = `${ROBOFLOW_BASE}/${encodeURIComponent(projectId)}/${encodeURIComponent(version)}?api_key=${encodeURIComponent(ROBOFLOW_API_KEY!)}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: imageBase64,
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, reason: "provider_error", detail: text.slice(0, 200) };
    }
    const data = (await res.json()) as Record<string, unknown>;
    return mapRoboflowResult(data);
  } catch (e) {
    return { ok: false, reason: "provider_error", detail: String(e) };
  }
}

function mapRoboflowResult(data: Record<string, unknown>): ProviderOutcome {
  const label = extractRoboflowLabel(data);
  const confidence = extractRoboflowConfidence(data);
  return {
    ok: true,
    result: {
      label,
      confidence: typeof confidence === "number" ? confidence : 0.85,
      confidenceLevel: confidenceLevelFromConfidence(typeof confidence === "number" ? confidence : 0.85),
    },
  };
}

/** Workflow output shape varies; try common classification fields (top-level or under outputs). */
function extractRoboflowLabel(data: Record<string, unknown>): ScanResult["label"] {
  const root = (data?.outputs as Record<string, unknown>) ?? data;
  const top = root?.top ?? root?.predicted_class ?? root?.class;
  if (typeof top === "string") return normalizeLabel(top);
  const preds = root?.predictions as Array<{ class?: string; label?: string }> | undefined;
  const c = preds?.[0]?.class ?? preds?.[0]?.label;
  if (typeof c === "string") return normalizeLabel(c);
  return "clear";
}

function extractRoboflowConfidence(data: Record<string, unknown>): number | undefined {
  const root = (data?.outputs as Record<string, unknown>) ?? data;
  if (typeof root?.confidence === "number") return root.confidence;
  const preds = root?.predictions as Array<{ confidence?: number }> | undefined;
  return preds?.[0]?.confidence;
}

export async function POST(request: NextRequest) {
  let imageBytes: Buffer;

  const contentTypeHeader = request.headers.get("content-type") ?? "";
  if (contentTypeHeader.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("image") ?? formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Missing image in form (field: image or file)", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    imageBytes = Buffer.from(arrayBuffer);
  } else if (contentTypeHeader.includes("application/json")) {
    const body = await request.json();
    const base64 = body?.image ?? body?.base64;

    if (typeof base64 !== "string") {
      return NextResponse.json(
        { error: "Missing image in JSON (field: image or base64)", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    const b64 = base64.replace(/^data:image\/\w+;base64,/, "");
    imageBytes = Buffer.from(b64, "base64");
  } else {
    return NextResponse.json(
      { error: "Send multipart/form-data with image, or JSON with image (base64)", code: "BAD_REQUEST" },
      { status: 400 }
    );
  }

  const dimensions = sizeOf(imageBytes);
  const minSide =
    dimensions?.width != null && dimensions?.height != null
      ? Math.min(dimensions.width, dimensions.height)
      : 0;

  if (minSide > 0 && minSide < 320) {
    return NextResponse.json(
      {
        error: "Image too small. Please use a close-up of at least 640px on the shortest side.",
        code: "IMAGE_TOO_SMALL",
      },
      { status: 400 }
    );
  }

  const imageBase64 = imageBytes.toString("base64");
  const imageDimensions =
    dimensions?.width != null && dimensions?.height != null
      ? { width: dimensions.width, height: dimensions.height }
      : null;

  const roboflowConfigured =
    ROBOFLOW_API_KEY &&
    (ROBOFLOW_MODEL_ID || (ROBOFLOW_WORKSPACE && ROBOFLOW_WORKFLOW_ID));

  console.info("[scan] request", {
    imageWidth: imageDimensions?.width,
    imageHeight: imageDimensions?.height,
    hasDetectionApi: !!DETECTION_API_URL,
    hasRoboflow: roboflowConfigured,
  });

  // 1) Try custom YOLO model first (primary)
  if (DETECTION_API_URL) {
    console.info("[scan] using provider=detection_api", {
      imageWidth: imageDimensions?.width,
      imageHeight: imageDimensions?.height,
    });
    const outcome = await scanWithDetectionApi(imageBase64, imageDimensions);
    if (outcome.ok) {
      // If custom model returns detections, use it
      const hasDetections = outcome.result.detections && outcome.result.detections.length > 0;
      const isClear = outcome.result.label === "clear";
      
      console.info("[scan] detection_api result", {
        label: outcome.result.label,
        confidence: outcome.result.confidence,
        detectionsCount: outcome.result.detections?.length ?? 0,
        summary: outcome.result.summary,
        hasDetections,
        isClear,
      });
      
      // Only fallback to Roboflow if custom model returns "clear" with no detections
      // (meaning it likely missed something, not that it confidently found nothing)
      if (!hasDetections && isClear && roboflowConfigured) {
        console.info("[scan] detection_api returned clear with no detections, falling back to Roboflow");
      } else {
        return NextResponse.json(outcome.result);
      }
    }
    // If custom model errors, fall through to Roboflow fallback
    if (outcome.reason === "provider_error") {
      console.warn("[scan] detection_api error, falling back to Roboflow", { detail: outcome.detail });
    }
  }

  // 2) Fallback to Roboflow if custom model unavailable or returned clear/no detections
  if (roboflowConfigured) {
    console.info("[scan] using provider=roboflow (fallback)");
    const outcome = await scanWithRoboflow(imageBase64);
    if (outcome.ok) {
      console.info("[scan] roboflow result", {
        label: outcome.result.label,
        confidence: outcome.result.confidence,
      });
      return NextResponse.json(outcome.result);
    }
    if (outcome.reason === "provider_error") {
      return NextResponse.json(
        { error: "Scan temporarily unavailable", code: "PROVIDER_ERROR", detail: outcome.detail },
        { status: 503 }
      );
    }
  }

  if (ALLOW_SCAN_STUB) {
    const stub: ScanResult = {
      label: VALID_LABELS[Math.floor(Math.random() * VALID_LABELS.length)],
      confidence: 0.85,
      explanation: "Development stub result. Configure a model provider for real inference.",
      confidenceLevel: "low",
    };
    return NextResponse.json(stub);
  }

  return NextResponse.json(
    {
      error: "Scan is currently unavailable because no model provider is configured.",
      code: "NO_PROVIDER_CONFIGURED",
    },
    { status: 503 }
  );
}
