import { NextResponse } from "next/server";

/** Non-sensitive status: which scan provider is configured. For diagnostics. */
export async function GET() {
  const hasRoboflow =
    !!process.env.ROBOFLOW_API_KEY &&
    (!!process.env.ROBOFLOW_MODEL_ID ||
      (!!process.env.ROBOFLOW_WORKSPACE && !!process.env.ROBOFLOW_WORKFLOW_ID));
  const hasDetection = !!process.env.DETECTION_API_URL;
  const hasDeepSeek = !!process.env.DEEPSEEK_API_KEY;
  const configured = hasRoboflow || hasDetection || hasDeepSeek;
  const provider = hasRoboflow ? "roboflow" : hasDetection ? "finetuned" : hasDeepSeek ? "deepseek" : "none";
  return NextResponse.json({ configured, provider });
}
