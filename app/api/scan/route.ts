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
const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY;
const ROBOFLOW_WORKSPACE = process.env.ROBOFLOW_WORKSPACE;
const ROBOFLOW_WORKFLOW_ID = process.env.ROBOFLOW_WORKFLOW_ID;
const ROBOFLOW_MODEL_ID = process.env.ROBOFLOW_MODEL_ID;
const ROBOFLOW_BASE = "https://detect.roboflow.com";
const ROBOFLOW_SERVERLESS_BASE = "https://serverless.roboflow.com";
const ROBOFLOW_DEBUG = process.env.ROBOFLOW_DEBUG === "true";
const ROBOFLOW_MIN_DETECTION_CONFIDENCE = 0.2;

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

Reply with ONLY a JSON object, no other text. Use this exact shape:
{"label":"lice"|"nits"|"dandruff"|"psoriasis"|"clear","explanation":"your sentence","confidence":"high"|"medium"|"low"}
Set confidence to "high" if the image is clear and the signs match one category well; "medium" if somewhat unclear; "low" if image is blurry or ambiguous.`;

async function scanWithDeepSeek(imageBase64: string): Promise<ProviderOutcome> {
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
        max_tokens: 200,
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
    const parsed = JSON.parse(raw) as { label?: unknown; explanation?: string; confidence?: string };
    const confidenceLevel = parseConfidenceLevel(parsed.confidence);
    return {
      ok: true,
      result: {
        label: normalizeLabel(parsed.label),
        confidence: confidenceLevel === "high" ? 0.9 : confidenceLevel === "medium" ? 0.75 : 0.5,
        explanation: typeof parsed.explanation === "string" ? parsed.explanation : undefined,
        confidenceLevel,
      },
    };
  } catch {
    return { ok: false, reason: "provider_error", detail: "Invalid response from model" };
  }
}

async function scanWithRoboflow(imageBase64: string): Promise<ProviderOutcome> {
  if (!ROBOFLOW_API_KEY) return { ok: false, reason: "no_config" };
  if (ROBOFLOW_WORKSPACE && ROBOFLOW_WORKFLOW_ID) return scanWithRoboflowWorkflow(imageBase64);
  if (ROBOFLOW_MODEL_ID) return scanWithRoboflowModel(imageBase64);
  return { ok: false, reason: "no_config" };
}

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
    debugRoboflowWorkflowShape(data);
    return mapRoboflowResult(data);
  } catch (e) {
    return { ok: false, reason: "provider_error", detail: String(e) };
  }
}

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
  const extracted = extractRoboflowDetectionBundle(data);
  const detections = extracted.detections;
  const topDetection = detections[0];
  const imageMeta = extracted.imageMeta;
  const bestPrediction = extractBestRoboflowPrediction(data);
  const label = topDetection?.label ?? (bestPrediction?.label ? normalizeLabel(bestPrediction.label) : extractRoboflowLabel(data));
  const confidence =
    topDetection?.confidence ??
    (typeof bestPrediction?.confidence === "number" ? bestPrediction.confidence : extractRoboflowConfidence(data));
  const confidenceLevel = confidenceLevelFromConfidence(typeof confidence === "number" ? confidence : 0.85);
  const summary = buildDetectionSummary(detections);

  console.info("[scan][roboflow_summary]", {
    detectionCount: detections.length,
    topLabel: topDetection?.label ?? label,
    topConfidence: confidence,
    detectionSource: extracted.source,
    imageMeta,
  });

  if (ROBOFLOW_DEBUG) {
    console.log("[scan][roboflow_mapped_result]", {
      bestPrediction,
      topDetection,
      mappedLabel: label,
      mappedConfidence: confidence,
      fallbackLabel: extractRoboflowLabel(data),
      fallbackConfidence: extractRoboflowConfidence(data),
      imageMeta,
      detectionSource: extracted.source,
      summary,
    });
  }

  return {
    ok: true,
    result: {
      label,
      confidence: typeof confidence === "number" ? confidence : 0.85,
      confidenceLevel,
      detections,
      imageMeta: imageMeta ?? undefined,
      summary,
    },
  };
}

type RoboflowPrediction = {
  class?: unknown;
  class_name?: unknown;
  label?: unknown;
  confidence?: unknown;
  x?: unknown;
  y?: unknown;
  width?: unknown;
  height?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pushPredictionArray(
  value: unknown,
  out: RoboflowPrediction[][],
  seen: Set<unknown>,
  depth = 0
): void {
  if (depth > 8 || value == null || seen.has(value)) return;
  seen.add(value);

  if (Array.isArray(value)) {
    const objectItems = value.filter((item): item is RoboflowPrediction => isRecord(item));
    if (objectItems.length > 0) out.push(objectItems);
    for (const item of value) {
      pushPredictionArray(item, out, seen, depth + 1);
    }
    return;
  }

  if (!isRecord(value)) return;
  for (const [key, child] of Object.entries(value)) {
    if (key === "predictions" && Array.isArray(child)) {
      const objectItems = child.filter((item): item is RoboflowPrediction => isRecord(item));
      if (objectItems.length > 0) out.push(objectItems);
    }
    pushPredictionArray(child, out, seen, depth + 1);
  }
}

function extractBestRoboflowPrediction(data: Record<string, unknown>): { label?: string; confidence?: number } | null {
  const predictions = collectRoboflowPredictions(data);
  let best: { label?: string; confidence?: number } | null = null;
  for (const p of predictions) {
    const labelCandidate =
      typeof p.class === "string"
        ? p.class
        : typeof p.class_name === "string"
          ? p.class_name
          : typeof p.label === "string"
            ? p.label
            : undefined;
    const conf = typeof p.confidence === "number" ? p.confidence : undefined;
    if (!labelCandidate && conf == null) continue;
    if (!best || (conf ?? -Infinity) > (best.confidence ?? -Infinity)) {
      best = { label: labelCandidate, confidence: conf };
    }
  }
  return best;
}

function normalizeDetectionLabel(value: unknown): DetectionItem["label"] | null {
  const normalized = normalizeLabel(value);
  if (normalized === "clear") return null;
  return normalized;
}

function toFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function collectRoboflowPredictions(data: Record<string, unknown>): RoboflowPrediction[] {
  const roots: unknown[] = [data];
  if ("outputs" in data) roots.push((data as Record<string, unknown>).outputs);
  if ("result" in data) roots.push((data as Record<string, unknown>).result);

  const predictionArrays: RoboflowPrediction[][] = [];
  const seen = new Set<unknown>();
  for (const root of roots) {
    pushPredictionArray(root, predictionArrays, seen);
  }

  const combined: RoboflowPrediction[] = [];
  const fingerprints = new Set<string>();
  for (const arr of predictionArrays) {
    for (const p of arr) {
      const fingerprint = `${String(p.class)}|${String(p.class_name)}|${String(p.label)}|${String(p.confidence)}|${String(p.x)}|${String(p.y)}|${String(p.width)}|${String(p.height)}`;
      if (fingerprints.has(fingerprint)) continue;
      fingerprints.add(fingerprint);
      combined.push(p);
    }
  }
  return combined;
}

function asPredictionArray(value: unknown): RoboflowPrediction[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is RoboflowPrediction => isRecord(item));
}

function imageMetaFromCandidates(candidates: unknown[]): { width: number; height: number } | null {
  for (const candidate of candidates) {
    if (!isRecord(candidate)) continue;
    const width = toFiniteNumber(candidate.width);
    const height = toFiniteNumber(candidate.height);
    if (width != null && height != null && width > 0 && height > 0) {
      return { width, height };
    }
  }
  return null;
}

function detectionsFromPredictions(predictions: RoboflowPrediction[]): DetectionItem[] {
  const detections: DetectionItem[] = [];
  for (const p of predictions) {
    const label = normalizeDetectionLabel(p.class ?? p.class_name ?? p.label);
    const confidence = toFiniteNumber(p.confidence);
    const x = toFiniteNumber(p.x);
    const y = toFiniteNumber(p.y);
    const width = toFiniteNumber(p.width);
    const height = toFiniteNumber(p.height);
    if (!label || confidence == null || x == null || y == null || width == null || height == null) continue;
    if (confidence < ROBOFLOW_MIN_DETECTION_CONFIDENCE) continue;

    detections.push({
      id: `det-${detections.length + 1}`,
      label,
      confidence,
      confidenceLevel: confidenceLevelFromConfidence(confidence),
      x,
      y,
      width,
      height,
    });
  }
  detections.sort((a, b) => b.confidence - a.confidence);
  return detections;
}

function extractFromRoot(
  root: Record<string, unknown>,
  sourcePrefix: string
): { detections: DetectionItem[]; imageMeta: { width: number; height: number } | null; source: string } | null {
  const outputV2 = isRecord(root.output_predictions_v2) ? (root.output_predictions_v2 as Record<string, unknown>) : null;
  const outputV2PredsObj = outputV2 && isRecord(outputV2.predictions) ? (outputV2.predictions as Record<string, unknown>) : null;

  // Primary workflow path: output_predictions_v2.predictions.predictions[]
  if (outputV2PredsObj) {
    const workflowPreds = asPredictionArray(outputV2PredsObj.predictions);
    if (workflowPreds.length > 0) {
      return {
        detections: detectionsFromPredictions(workflowPreds),
        imageMeta: imageMetaFromCandidates([outputV2PredsObj.image, outputV2?.image]),
        source: `${sourcePrefix}.output_predictions_v2.predictions.predictions`,
      };
    }
  }

  // Alternate workflow path: output_predictions_v2.predictions[]
  if (outputV2 && Array.isArray(outputV2.predictions)) {
    const workflowPreds = asPredictionArray(outputV2.predictions);
    if (workflowPreds.length > 0) {
      return {
        detections: detectionsFromPredictions(workflowPreds),
        imageMeta: imageMetaFromCandidates([outputV2.image]),
        source: `${sourcePrefix}.output_predictions_v2.predictions`,
      };
    }
  }

  // Direct model path: predictions[]
  const directPreds = asPredictionArray(root.predictions);
  if (directPreds.length > 0) {
    return {
      detections: detectionsFromPredictions(directPreds),
      imageMeta: imageMetaFromCandidates([root.image]),
      source: `${sourcePrefix}.predictions`,
    };
  }

  // Nested direct path: predictions.predictions[]
  const nestedPredsObj = isRecord(root.predictions) ? (root.predictions as Record<string, unknown>) : null;
  if (nestedPredsObj) {
    const nestedPreds = asPredictionArray(nestedPredsObj.predictions);
    if (nestedPreds.length > 0) {
      return {
        detections: detectionsFromPredictions(nestedPreds),
        imageMeta: imageMetaFromCandidates([nestedPredsObj.image]),
        source: `${sourcePrefix}.predictions.predictions`,
      };
    }
  }

  return null;
}

function extractRoboflowDetectionBundle(data: Record<string, unknown>): {
  detections: DetectionItem[];
  imageMeta: { width: number; height: number } | null;
  source: string;
} {
  const orderedRoots: Array<{ root: Record<string, unknown>; sourcePrefix: string }> = [];
  if (isRecord(data.outputs)) orderedRoots.push({ root: data.outputs as Record<string, unknown>, sourcePrefix: "outputs" });
  orderedRoots.push({ root: data, sourcePrefix: "data" });
  if (isRecord(data.result)) orderedRoots.push({ root: data.result as Record<string, unknown>, sourcePrefix: "result" });

  for (const candidate of orderedRoots) {
    const extracted = extractFromRoot(candidate.root, candidate.sourcePrefix);
    if (!extracted) continue;
    if (extracted.detections.length > 0) return extracted;
  }

  // Fallback for unknown future response shapes.
  return {
    detections: extractRoboflowDetections(data),
    imageMeta: extractRoboflowImageMeta(data),
    source: "generic_recursive",
  };
}

function extractRoboflowDetections(data: Record<string, unknown>): DetectionItem[] {
  return detectionsFromPredictions(collectRoboflowPredictions(data));
}

function extractRoboflowImageMeta(data: Record<string, unknown>): { width: number; height: number } | null {
  const roots: unknown[] = [data];
  if ("outputs" in data) roots.push((data as Record<string, unknown>).outputs);
  if ("result" in data) roots.push((data as Record<string, unknown>).result);

  for (const root of roots) {
    if (!isRecord(root)) continue;
    const imageCandidates: unknown[] = [];
    if (isRecord(root.image)) imageCandidates.push(root.image);
    if (isRecord(root.predictions) && isRecord(root.predictions.image)) imageCandidates.push(root.predictions.image);
    if (isRecord(root.output_predictions_v2)) {
      const v2 = root.output_predictions_v2 as Record<string, unknown>;
      if (isRecord(v2.image)) imageCandidates.push(v2.image);
      if (isRecord(v2.predictions) && isRecord((v2.predictions as Record<string, unknown>).image)) {
        imageCandidates.push((v2.predictions as Record<string, unknown>).image);
      }
    }

    for (const candidate of imageCandidates) {
      if (!isRecord(candidate)) continue;
      const width = toFiniteNumber(candidate.width);
      const height = toFiniteNumber(candidate.height);
      if (width != null && height != null && width > 0 && height > 0) {
        return { width, height };
      }
    }
  }

  return null;
}

function buildDetectionSummary(detections: DetectionItem[]): ScanResult["summary"] | undefined {
  if (detections.length === 0) return undefined;
  const liceCount = detections.filter((d) => d.label === "lice").length;
  const nitsCount = detections.filter((d) => d.label === "nits").length;
  return {
    totalDetections: detections.length,
    liceCount,
    nitsCount,
    strongestLabel: detections[0]?.label,
  };
}

function debugRoboflowWorkflowShape(data: Record<string, unknown>): void {
  if (!ROBOFLOW_DEBUG) return;

  const root = isRecord(data.outputs) ? data.outputs : data;
  const outputV2 = isRecord(root.output_predictions_v2) ? root.output_predictions_v2 : null;
  const predsContainer = outputV2 && isRecord(outputV2.predictions) ? outputV2.predictions : null;
  const nestedPreds = Array.isArray(predsContainer?.predictions) ? (predsContainer?.predictions as unknown[]) : [];
  const directPreds = Array.isArray((root as Record<string, unknown>).predictions)
    ? ((root as Record<string, unknown>).predictions as unknown[])
    : [];

  console.log("[scan][roboflow_raw_response]", JSON.stringify(data, null, 2));
  console.log("[scan][roboflow_shape]", {
    rootKeys: Object.keys(root),
    outputPredictionsV2Keys: outputV2 ? Object.keys(outputV2) : [],
    outputPredictionsV2PredictionsKeys: predsContainer ? Object.keys(predsContainer) : [],
    nestedPredictionsCount: nestedPreds.length,
    directPredictionsCount: directPreds.length,
  });

  for (const [idx, pred] of nestedPreds.entries()) {
    if (!isRecord(pred)) continue;
    console.log("[scan][roboflow_nested_pred]", {
      index: idx,
      class: pred.class,
      class_name: pred.class_name,
      label: pred.label,
      confidence: pred.confidence,
    });
  }

  for (const [idx, pred] of directPreds.entries()) {
    if (!isRecord(pred)) continue;
    console.log("[scan][roboflow_direct_pred]", {
      index: idx,
      class: pred.class,
      class_name: pred.class_name,
      label: pred.label,
      confidence: pred.confidence,
    });
  }
}

function extractRoboflowLabel(data: Record<string, unknown>): ScanResult["label"] {
  const root = (data?.outputs as Record<string, unknown>) ?? data;
  const top = root?.top ?? root?.predicted_class ?? root?.class;
  if (typeof top === "string") return normalizeLabel(top);

  const directPreds = root?.predictions as Array<{ class?: string; label?: string }> | undefined;
  const directClass = directPreds?.[0]?.class ?? directPreds?.[0]?.label;
  if (typeof directClass === "string") return normalizeLabel(directClass);

  // Workflow output often nests detections in output_predictions_v2.predictions.predictions[]
  const workflowPredContainer = (root?.output_predictions_v2 as Record<string, unknown> | undefined)?.predictions as
    | Record<string, unknown>
    | undefined;
  const workflowPreds = workflowPredContainer?.predictions as
    | Array<{ class?: string; class_name?: string; label?: string }>
    | undefined;
  const c = workflowPreds?.[0]?.class ?? workflowPreds?.[0]?.class_name ?? workflowPreds?.[0]?.label;
  if (typeof c === "string") return normalizeLabel(c);

  return "clear";
}

function extractRoboflowConfidence(data: Record<string, unknown>): number | undefined {
  const root = (data?.outputs as Record<string, unknown>) ?? data;
  if (typeof root?.confidence === "number") return root.confidence;
  const directPreds = root?.predictions as Array<{ confidence?: number }> | undefined;
  if (typeof directPreds?.[0]?.confidence === "number") return directPreds[0].confidence;

  const workflowPredContainer = (root?.output_predictions_v2 as Record<string, unknown> | undefined)?.predictions as
    | Record<string, unknown>
    | undefined;
  const workflowPreds = workflowPredContainer?.predictions as Array<{ confidence?: number }> | undefined;
  return workflowPreds?.[0]?.confidence;
}

async function scanWithDetectionApi(imageBase64: string): Promise<ProviderOutcome> {
  if (!DETECTION_API_URL) return { ok: false, reason: "no_config" };

  const url = DETECTION_API_URL.replace(/\/$/, "");
  try {
    const res = await fetch(`${url}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageBase64, base64: imageBase64 }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, reason: "provider_error", detail: text.slice(0, 200) };
    }

    const data = (await res.json()) as { label?: unknown; confidence?: number; explanation?: string };
    const confidence = typeof data.confidence === "number" ? data.confidence : 0.85;
    return {
      ok: true,
      result: {
        label: normalizeLabel(data.label),
        confidence,
        explanation: typeof data.explanation === "string" ? data.explanation : undefined,
        confidenceLevel: confidenceLevelFromConfidence(confidence),
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

  const roboflowConfigured =
    ROBOFLOW_API_KEY && (ROBOFLOW_MODEL_ID || (ROBOFLOW_WORKSPACE && ROBOFLOW_WORKFLOW_ID));

  if (roboflowConfigured) {
    const outcome = await scanWithRoboflow(imageBase64);
    if (outcome.ok) return NextResponse.json(outcome.result);
    if (outcome.reason === "provider_error") {
      console.error("[scan][roboflow_provider_error]", {
        detail: outcome.detail,
        workspace: ROBOFLOW_WORKSPACE,
        workflowId: ROBOFLOW_WORKFLOW_ID,
        hasModelId: !!ROBOFLOW_MODEL_ID,
      });
      return NextResponse.json(
        { error: "Scan temporarily unavailable", code: "PROVIDER_ERROR", detail: outcome.detail },
        { status: 503 }
      );
    }
  }

  if (DETECTION_API_URL) {
    const outcome = await scanWithDetectionApi(imageBase64);
    if (outcome.ok) return NextResponse.json(outcome.result);
    if (outcome.reason === "provider_error") {
      return NextResponse.json(
        { error: "Scan temporarily unavailable", code: "PROVIDER_ERROR", detail: outcome.detail },
        { status: 503 }
      );
    }
  }

  const deepSeekOutcome = await scanWithDeepSeek(imageBase64);
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
