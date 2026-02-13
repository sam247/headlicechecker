import { NextRequest, NextResponse } from "next/server";
import sizeOf from "image-size";

/** Scan result (from DeepSeek, fine-tuned model, or stub). */
export type ScanResult = {
  label: "lice" | "nits" | "dandruff" | "psoriasis" | "clear";
  confidence: number;
  explanation?: string;
  /** Optional: high | medium | low for UI hints */
  confidenceLevel?: "high" | "medium" | "low";
};

/** Result of calling a provider: success, no config, or provider error. */
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
/** Legacy model: project_id/version (e.g. find-head-lice-psoriases-and-dandruffs/1). Used when workflow is not set. */
const ROBOFLOW_MODEL_ID = process.env.ROBOFLOW_MODEL_ID;
const ROBOFLOW_BASE = "https://detect.roboflow.com";
/** Serverless Hosted Workflow API (Rapid / Deploy in app). */
const ROBOFLOW_SERVERLESS_BASE = "https://serverless.roboflow.com";

const VALID_LABELS: ScanResult["label"][] = ["lice", "nits", "dandruff", "psoriasis", "clear"];

function normalizeLabel(s: unknown): ScanResult["label"] {
  if (typeof s !== "string") return "clear";
  const lower = s.toLowerCase().trim();
  if (VALID_LABELS.includes(lower as ScanResult["label"])) return lower as ScanResult["label"];
  if (lower === "nit") return "nits";
  if (lower === "scalp psoriasis" || lower === "psoriasis") return "psoriasis";
  return "clear";
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

/** One API call: classification + disclaimer-friendly explanation. */
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
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
            ],
          },
        ],
      }),
    });
  } catch (e) {
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
    };
    const label = normalizeLabel(parsed.label);
    const confidenceLevel = parseConfidenceLevel(parsed.confidence);
    return {
      ok: true,
      result: {
        label,
        confidence: confidenceLevel === "high" ? 0.9 : confidenceLevel === "medium" ? 0.75 : 0.5,
        explanation: typeof parsed.explanation === "string" ? parsed.explanation : undefined,
        confidenceLevel,
      },
    };
  } catch {
    return { ok: false, reason: "provider_error", detail: "Invalid response from model" };
  }
}

function parseConfidenceLevel(s: unknown): "high" | "medium" | "low" {
  if (typeof s !== "string") return "medium";
  const v = s.toLowerCase().trim();
  if (v === "high" || v === "medium" || v === "low") return v;
  return "medium";
}

/** Call Roboflow: Workflow API if workspace+workflow set, else legacy model (project/version). */
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

/** Images are only held in memory for the request; we never write to disk or store anywhere (zero data retention). */
export async function POST(request: NextRequest) {
  let imageBytes: Buffer;
  let contentType: string = "image/jpeg";

  const contentTypeHeader = request.headers.get("content-type") ?? "";
  if (contentTypeHeader.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("image") ?? formData.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Missing image in form (field: image or file)" },
        { status: 400 }
      );
    }
    const arrayBuffer = await file.arrayBuffer();
    imageBytes = Buffer.from(arrayBuffer);
    contentType = file.type || "image/jpeg";
  } else if (contentTypeHeader.includes("application/json")) {
    const body = await request.json();
    const base64 = body?.image ?? body?.base64;
    if (typeof base64 !== "string") {
      return NextResponse.json(
        { error: "Missing image in JSON (field: image or base64)" },
        { status: 400 }
      );
    }
    const b64 = base64.replace(/^data:image\/\w+;base64,/, "");
    imageBytes = Buffer.from(b64, "base64");
  } else {
    return NextResponse.json(
      { error: "Send multipart/form-data with image, or JSON with image (base64)" },
      { status: 400 }
    );
  }

  const dimensions = sizeOf(imageBytes);
  const minSide = dimensions?.width != null && dimensions?.height != null
    ? Math.min(dimensions.width, dimensions.height)
    : 0;
  if (minSide > 0 && minSide < 320) {
    return NextResponse.json(
      {
        error: "Image too small. Please use a close-up of at least 640px on the shortest side.",
      },
      { status: 400 }
    );
  }

  const imageBase64 = imageBytes.toString("base64");

  // 1) Roboflow (Workflow or legacy model when configured)
  const roboflowConfigured =
    ROBOFLOW_API_KEY &&
    (ROBOFLOW_MODEL_ID || (ROBOFLOW_WORKSPACE && ROBOFLOW_WORKFLOW_ID));
  if (roboflowConfigured) {
    const outcome = await scanWithRoboflow(imageBase64);
    if (outcome.ok) return NextResponse.json(outcome.result);
    if (outcome.reason === "provider_error") {
      return NextResponse.json(
        { error: "Scan temporarily unavailable", code: "PROVIDER_ERROR", detail: outcome.detail },
        { status: 503 }
      );
    }
  }

  // 2) Fine-tuned model (when configured)
  if (DETECTION_API_URL) {
    const outcome = await scanWithDetectionApi(imageBase64, contentType);
    if (outcome.ok) return NextResponse.json(outcome.result);
    if (outcome.reason === "provider_error") {
      return NextResponse.json(
        { error: "Scan temporarily unavailable", code: "PROVIDER_ERROR", detail: outcome.detail },
        { status: 503 }
      );
    }
  }

  // 3) DeepSeek (interim)
  const deepSeekOutcome = await scanWithDeepSeek(imageBase64);
  if (deepSeekOutcome.ok) return NextResponse.json(deepSeekOutcome.result);
  if (deepSeekOutcome.reason === "provider_error") {
    return NextResponse.json(
      {
        error: "Scan temporarily unavailable",
        code: "PROVIDER_ERROR",
        detail: deepSeekOutcome.detail,
      },
      { status: 503 }
    );
  }

  // 4) Stub when no provider configured
  const stub: ScanResult = {
    label: VALID_LABELS[Math.floor(Math.random() * VALID_LABELS.length)],
    confidence: 0.85,
    explanation:
      "Placeholder result. Set DEEPSEEK_API_KEY for vision-based scan (recommended) or DETECTION_API_URL for your fine-tuned model.",
  };
  return NextResponse.json(stub);
}

/** Call fine-tuned detection API; returns ProviderOutcome. */
async function scanWithDetectionApi(
  imageBase64: string,
  contentType: string
): Promise<ProviderOutcome> {
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
    return {
      ok: true,
      result: {
        label: normalizeLabel(data.label),
        confidence: typeof data.confidence === "number" ? data.confidence : 0.85,
        explanation: typeof data.explanation === "string" ? data.explanation : undefined,
      },
    };
  } catch (e) {
    return { ok: false, reason: "provider_error", detail: String(e) };
  }
}
