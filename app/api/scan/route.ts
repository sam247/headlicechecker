import { NextRequest, NextResponse } from "next/server";
import sizeOf from "image-size";

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

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_BASE = process.env.DEEPSEEK_API_BASE ?? "https://api.deepseek.com";
const DETECTION_API_URL = process.env.DETECTION_API_URL;
/** Minimum confidence for detections from DETECTION_API_URL (your YOLO service); reduces noise. */
const DETECTION_API_MIN_CONFIDENCE = 0.35;

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

function parseConfidenceLevel(s: unknown): "high" | "medium" | "low" {
  if (typeof s !== "string") return "medium";
  const v = s.toLowerCase().trim();
  if (v === "high" || v === "medium" || v === "low") return v;
  return "medium";
}

function confidenceLevelFromConfidence(v: number): "high" | "medium" | "low" {
  if (v >= 0.8) return "high";
  if (v >= 0.55) return "medium";
  return "low";
}

const STRUCTURED_PROMPT = `You are a cautious assistant. This image shows hair or scalp (possibly close-up).

Use these criteria to choose exactly ONE label:
- **Nits:** Small oval eggs firmly attached to the hair shaft; often near scalp; yellowish/white.
- **Lice:** Small insects on scalp or hair; may see movement or legs.
- **Dandruff:** White or yellow flakes that are loose or easily dislodge; no fixed attachment to the shaft.
- **Psoriasis:** Silvery or red, scaly patches; thicker scales than dandruff; can be well-defined plaques; may extend to hairline/forehead.
- **Clear:** No nits, lice, or significant flakes/scales; or image not suitable (blurry, not scalp/hair).

Write one short, reassuring sentence for the user. Emphasise this is indicative only and they should see a professional for confirmation. Do not diagnose.

Additionally, list any specific regions where you see lice, nits, dandruff, or psoriasis. For each region give the approximate center and size as fractions of the image (0 to 1). Use "detections": an array of objects with "label" (one of: lice, nits, dandruff, psoriasis), "confidence" (0-1), "x" (center X, 0-1), "y" (center Y, 0-1), "width" (width of region, 0-1), "height" (height of region, 0-1). If you see nothing or the image is unclear, use "detections": [].

Reply with ONLY a JSON object, no other text. Use this exact shape:
{"label":"lice"|"nits"|"dandruff"|"psoriasis"|"clear","explanation":"your sentence","confidence":"high"|"medium"|"low","detections":[{"label":"lice"|"nits"|"dandruff"|"psoriasis","confidence":0.8,"x":0.3,"y":0.4,"width":0.05,"height":0.05},...]}
Set confidence to "high" if the image is clear and the signs match one category well; "medium" if somewhat unclear; "low" if image is blurry or ambiguous.`;

type ImageDimensions = { width: number; height: number };

function deepSeekDetectionsToItems(
  detections: Array<{ label?: unknown; confidence?: number; x?: number; y?: number; width?: number; height?: number }>,
  imageDimensions: ImageDimensions
): DetectionItem[] {
  const { width: imgW, height: imgH } = imageDimensions;
  const out: DetectionItem[] = [];
  detections.forEach((d, i) => {
    const label = normalizeDetectionLabel(d.label);
    if (!label) return;
    const confidence = typeof d.confidence === "number" && d.confidence >= 0 && d.confidence <= 1 ? d.confidence : 0.7;
    const x = typeof d.x === "number" ? d.x : null;
    const y = typeof d.y === "number" ? d.y : null;
    const w = typeof d.width === "number" ? d.width : null;
    const h = typeof d.height === "number" ? d.height : null;
    if (x == null || y == null || w == null || h == null) return;
    out.push({
      id: `det-${i + 1}`,
      label,
      confidence,
      confidenceLevel: confidenceLevelFromConfidence(confidence),
      x: x * imgW,
      y: y * imgH,
      width: Math.max(w * imgW, 4),
      height: Math.max(h * imgH, 4),
    });
  });
  out.sort((a, b) => b.confidence - a.confidence);
  return out;
}

async function scanWithDeepSeek(
  imageBase64: string,
  imageDimensions?: ImageDimensions | null
): Promise<ProviderOutcome> {
  if (!DEEPSEEK_API_KEY) return { ok: false, reason: "no_config" };

  let res: Response;
  try {
    res = await fetch(`${DEEPSEEK_API_BASE.replace(/\/$/, "")}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: 500,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: STRUCTURED_PROMPT },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            ],
          },
        ],
      }),
    });
  } catch {
    return { ok: false, reason: "provider_error", detail: "Network error" };
  }

  if (!res.ok) {
    const body = await res.text();
    const detail = body.length > 200 ? "API error" : body.slice(0, 200);
    return { ok: false, reason: "provider_error", detail: `${res.status}: ${detail}` };
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) return { ok: false, reason: "provider_error", detail: "Empty response from model" };

  try {
    const parsed = JSON.parse(raw) as {
      label?: unknown;
      explanation?: string;
      confidence?: string;
      detections?: Array<{ label?: unknown; confidence?: number; x?: number; y?: number; width?: number; height?: number }>;
    };
    const confidenceLevel = parseConfidenceLevel(parsed.confidence);
    const confidence = confidenceLevel === "high" ? 0.9 : confidenceLevel === "medium" ? 0.75 : 0.5;

    let detections: DetectionItem[] = [];
    let imageMeta: { width: number; height: number } | undefined;
    let summary: ScanResult["summary"] | undefined;

    if (imageDimensions && Array.isArray(parsed.detections) && parsed.detections.length > 0) {
      detections = deepSeekDetectionsToItems(parsed.detections, imageDimensions);
      imageMeta = imageDimensions;
      const liceCount = detections.filter((d) => d.label === "lice").length;
      const nitsCount = detections.filter((d) => d.label === "nits").length;
      const strongest = detections[0]?.label;
      summary = {
        totalDetections: detections.length,
        liceCount,
        nitsCount,
        strongestLabel: strongest ?? undefined,
      };
    }

    return {
      ok: true,
      result: {
        label: normalizeLabel(parsed.label),
        confidence,
        explanation: typeof parsed.explanation === "string" ? parsed.explanation : undefined,
        confidenceLevel,
        detections: detections.length > 0 ? detections : undefined,
        imageMeta,
        summary,
      },
    };
  } catch {
    return { ok: false, reason: "provider_error", detail: "Invalid response from model" };
  }
}

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
  const body: { image: string; base64?: string; width?: number; height?: number } = {
    image: imageBase64,
    base64: imageBase64,
  };
  if (imageDimensions) {
    body.width = imageDimensions.width;
    body.height = imageDimensions.height;
  }

  try {
    const res = await fetch(`${url}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
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
    let detections: DetectionItem[] = [];
    let imageMeta: { width: number; height: number } | undefined;
    let summary: ScanResult["summary"] | undefined;

    if (Array.isArray(data.detections) && data.detections.length > 0 && imageDimensions) {
      detections = mapDetectionApiDetections(data.detections, imageDimensions, normalized);
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
    return { ok: false, reason: "provider_error", detail: String(e) };
  }
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

  if (DETECTION_API_URL) {
    const outcome = await scanWithDetectionApi(imageBase64, imageDimensions);
    if (outcome.ok) return NextResponse.json(outcome.result);
    if (outcome.reason === "provider_error") {
      return NextResponse.json(
        { error: "Scan temporarily unavailable", code: "PROVIDER_ERROR", detail: outcome.detail },
        { status: 503 }
      );
    }
  }

  const deepSeekOutcome = await scanWithDeepSeek(imageBase64, imageDimensions);
  if (deepSeekOutcome.ok) return NextResponse.json(deepSeekOutcome.result);
  if (deepSeekOutcome.reason === "provider_error") {
    return NextResponse.json(
      { error: "Scan temporarily unavailable", code: "PROVIDER_ERROR", detail: deepSeekOutcome.detail },
      { status: 503 }
    );
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
