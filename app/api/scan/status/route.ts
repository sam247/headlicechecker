import { NextResponse } from "next/server";

/** Non-sensitive status: which scan provider is configured. For diagnostics. */
export async function GET() {
  const hasDetection = !!process.env.DETECTION_API_URL;
  const hasDeepSeek = !!process.env.DEEPSEEK_API_KEY;
  const configured = hasDetection || hasDeepSeek;
  const provider = hasDetection ? "finetuned" : hasDeepSeek ? "deepseek" : "stub";
  return NextResponse.json({ configured, provider });
}
