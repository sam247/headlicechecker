import { NextRequest, NextResponse } from "next/server";

/** Scan result (from DeepSeek, RAM service, or stub). */
export type ScanResult = {
  label: "lice" | "nits" | "dandruff" | "clear";
  confidence: number;
  explanation?: string;
};

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_BASE = process.env.DEEPSEEK_API_BASE ?? "https://api.deepseek.com";
const RAM_SERVICE_URL = process.env.RAM_SERVICE_URL;

const VALID_LABELS: ScanResult["label"][] = ["lice", "nits", "dandruff", "clear"];

function normalizeLabel(s: unknown): ScanResult["label"] {
  if (typeof s !== "string") return "clear";
  const lower = s.toLowerCase().trim();
  if (VALID_LABELS.includes(lower as ScanResult["label"])) return lower as ScanResult["label"];
  if (lower === "nit") return "nits";
  return "clear";
}

/** One API call: classification + disclaimer-friendly explanation. No Python service. */
async function scanWithDeepSeek(imageBase64: string): Promise<ScanResult | null> {
  if (!DEEPSEEK_API_KEY) return null;
  const prompt = `You are a cautious assistant. This image shows hair or scalp (possibly close-up).
Classify it exactly one of: lice, nits, dandruff, clear.
Then write one short, reassuring sentence for the user. Emphasise this is indicative only and they should see a professional for confirmation. Do not diagnose.
Reply with only a JSON object: {"label":"lice"|"nits"|"dandruff"|"clear","explanation":"your sentence"}. No other text.`;

  const res = await fetch(`${DEEPSEEK_API_BASE.replace(/\/$/, "")}/v1/chat/completions`, {
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
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
          ],
        },
      ],
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { label?: unknown; explanation?: string };
    return {
      label: normalizeLabel(parsed.label),
      confidence: 0.85,
      explanation: typeof parsed.explanation === "string" ? parsed.explanation : undefined,
    };
  } catch {
    return null;
  }
}

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

  const imageBase64 = imageBytes.toString("base64");

  // 1) DeepSeek-only: one API key, no Python service
  const deepSeekResult = await scanWithDeepSeek(imageBase64);
  if (deepSeekResult) {
    return NextResponse.json(deepSeekResult);
  }

  // 2) Optional: your RAM service (legacy)
  if (RAM_SERVICE_URL) {
    try {
      const form = new FormData();
      form.append("image", new Blob([imageBytes], { type: contentType }), "image.jpg");
      const res = await fetch(`${RAM_SERVICE_URL.replace(/\/$/, "")}/predict`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const text = await res.text();
        return NextResponse.json(
          { error: "RAM service error", detail: text },
          { status: 502 }
        );
      }
      const data = (await res.json()) as ScanResult;
      return NextResponse.json(data);
    } catch (e) {
      return NextResponse.json(
        { error: "Failed to call RAM service", detail: String(e) },
        { status: 502 }
      );
    }
  }

  // 3) Stub when no provider configured
  const stub: ScanResult = {
    label: VALID_LABELS[Math.floor(Math.random() * VALID_LABELS.length)],
    confidence: 0.85,
    explanation:
      "Placeholder result. Set DEEPSEEK_API_KEY for vision-based scan (recommended) or RAM_SERVICE_URL for the Python RAM service.",
  };
  return NextResponse.json(stub);
}
