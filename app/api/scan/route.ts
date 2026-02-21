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
      let detail = text.slice(0, 500);
      try {
        const errJson = JSON.parse(text) as {
          message?: string;
          inner_error_type?: string;
          inner_error?: string | Record<string, unknown>;
        };
        const parts = [errJson.message, errJson.inner_error_type].filter(Boolean);
        const inner = errJson.inner_error;
        if (inner !== undefined) {
          parts.push(typeof inner === "string" ? inner : JSON.stringify(inner));
        }
        if (parts.length) detail = parts.join(" | ");
      } catch {
        // keep detail as text slice
      }
      console.warn("[scan][roboflow_workflow] non-OK", {
        status: res.status,
        detail,
        fullBody: res.status === 400 ? text.slice(0, 800) : undefined,
      });
      return { ok: false, reason: "provider_error", detail };
    }
    const data = await res.json();
    console.info("[scan][roboflow_workflow] raw response keys", {
      isArray: Array.isArray(data),
      topKeys: Array.isArray(data) ? Object.keys(data[0] ?? {}) : Object.keys(data),
    });
    return mapWorkflowResult(data);
  } catch (e) {
    return { ok: false, reason: "provider_error", detail: String(e) };
  }
}

/** Roboflow legacy model (project_id/version, e.g. find-head-lice-psoriases-and-dandruffs/1). Use this if workflow returns WorkflowSyntaxError. */
async function scanWithRoboflowModel(imageBase64: string): Promise<ProviderOutcome> {
  if (!ROBOFLOW_MODEL_ID) return { ok: false, reason: "no_config" };
  const [projectId, version] = ROBOFLOW_MODEL_ID.split("/");
  if (!projectId || !version) return { ok: false, reason: "no_config" };
  const url = `${ROBOFLOW_BASE}/${encodeURIComponent(projectId)}/${encodeURIComponent(version)}?api_key=${encodeURIComponent(ROBOFLOW_API_KEY!)}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `image=${encodeURIComponent(imageBase64)}`,
    });
    if (!res.ok) {
      const text = await res.text();
      console.warn("[scan][roboflow_legacy] non-OK", {
        status: res.status,
        modelId: `${projectId}/${version}`,
        apiKeyPresent: !!ROBOFLOW_API_KEY,
        apiKeyLength: ROBOFLOW_API_KEY?.length ?? 0,
        detail: text.slice(0, 150),
      });
      return { ok: false, reason: "provider_error", detail: text.slice(0, 200) };
    }
    const data = (await res.json()) as Record<string, unknown>;
    return mapRoboflowResult(data);
  } catch (e) {
    return { ok: false, reason: "provider_error", detail: String(e) };
  }
}

type RoboflowPrediction = {
  class?: string;
  class_name?: string;
  label?: string;
  confidence?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

/** Parse workflow response: array of result objects with output_predictions_v2 and message. */
function mapWorkflowResult(raw: unknown): ProviderOutcome {
  const row = Array.isArray(raw) ? (raw[0] as Record<string, unknown> | undefined) : (raw as Record<string, unknown>);
  if (!row) return { ok: true, result: { label: "clear", confidence: 0.85, confidenceLevel: "low" } };

  // Extract predictions from workflow output
  const predsOutput = row.output_predictions_v2 as Record<string, unknown> | undefined;
  let preds: RoboflowPrediction[] = [];
  if (predsOutput) {
    if (Array.isArray(predsOutput.predictions)) {
      preds = predsOutput.predictions as RoboflowPrediction[];
    } else if (Array.isArray(predsOutput)) {
      preds = predsOutput as unknown as RoboflowPrediction[];
    }
  }

  // message = detection count from property_definition
  const detectionCount = typeof row.message === "number" ? row.message : preds.length;

  console.info("[scan][roboflow_workflow] parsed", {
    detectionCount,
    predsLength: preds.length,
    topPreds: preds.slice(0, 5).map((p) => ({
      cls: p.class ?? p.class_name ?? p.label,
      conf: p.confidence,
    })),
  });

  if (preds.length === 0) {
    return {
      ok: true,
      result: { label: "clear", confidence: 0.85, confidenceLevel: "low" },
    };
  }

  // Use the highest-confidence detection as the label
  const sorted = [...preds].sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
  const best = sorted[0];
  const bestClass = best.class ?? best.class_name ?? best.label ?? "clear";
  const bestConf = best.confidence ?? 0.5;
  const label = normalizeLabel(bestClass);

  return {
    ok: true,
    result: {
      label,
      confidence: bestConf,
      confidenceLevel: confidenceLevelFromConfidence(bestConf),
    },
  };
}

/** Parse legacy detect API response: top-level classification fields or predictions array. */
function mapRoboflowResult(data: Record<string, unknown>): ProviderOutcome {
  const root = (data?.outputs as Record<string, unknown>) ?? data;

  // Try classification fields
  const top = root?.top ?? root?.predicted_class ?? root?.class;
  if (typeof top === "string") {
    const conf = typeof root?.confidence === "number" ? root.confidence : 0.85;
    return {
      ok: true,
      result: {
        label: normalizeLabel(top),
        confidence: conf,
        confidenceLevel: confidenceLevelFromConfidence(conf),
      },
    };
  }

  // Try predictions array
  const preds = root?.predictions as RoboflowPrediction[] | undefined;
  if (Array.isArray(preds) && preds.length > 0) {
    const sorted = [...preds].sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
    const best = sorted[0];
    const cls = best.class ?? best.class_name ?? best.label ?? "clear";
    const conf = best.confidence ?? 0.5;
    return {
      ok: true,
      result: {
        label: normalizeLabel(cls),
        confidence: conf,
        confidenceLevel: confidenceLevelFromConfidence(conf),
      },
    };
  }

  return { ok: true, result: { label: "clear", confidence: 0.85, confidenceLevel: "low" } };
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

  if (roboflowConfigured) {
    console.info("[scan] provider=roboflow", {
      imageWidth: imageDimensions?.width,
      imageHeight: imageDimensions?.height,
    });
    const outcome = await scanWithRoboflow(imageBase64);
    if (outcome.ok) {
      console.info("[scan] result", {
        label: outcome.result.label,
        confidence: outcome.result.confidence,
      });
      return NextResponse.json({
        ...outcome.result,
        imageMeta: imageDimensions ?? undefined,
      });
    }
    if (outcome.reason === "provider_error") {
      console.warn("[scan] provider_error", { detail: outcome.detail });
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
