import { NextRequest, NextResponse } from "next/server";

/** Scan result from RAM (and optionally DeepSeek-generated explanation). */
export type ScanResult = {
  label: "lice" | "nits" | "dandruff" | "clear";
  confidence: number;
  /** Optional: user-facing explanation (e.g. from DeepSeek API). */
  explanation?: string;
};

const RAM_SERVICE_URL = process.env.RAM_SERVICE_URL;

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

  if (!RAM_SERVICE_URL) {
    // Stub for local dev: random label, no real inference
    const labels: ScanResult["label"][] = ["lice", "nits", "dandruff", "clear"];
    const stub: ScanResult = {
      label: labels[Math.floor(Math.random() * labels.length)],
      confidence: 0.85,
      explanation:
        "This is a placeholder result. Set RAM_SERVICE_URL to your Python RAM service for real inference. DeepSeek can be used there to generate this explanation from the image and RAM result.",
    };
    return NextResponse.json(stub);
  }

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
