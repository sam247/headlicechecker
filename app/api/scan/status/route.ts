import { NextResponse } from "next/server";

/** Non-sensitive status: which scan provider is configured. For diagnostics. */
export async function GET() {
  const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY;
  const ROBOFLOW_WORKSPACE = process.env.ROBOFLOW_WORKSPACE;
  const ROBOFLOW_WORKFLOW_ID = process.env.ROBOFLOW_WORKFLOW_ID;
  const ROBOFLOW_MODEL_ID = process.env.ROBOFLOW_MODEL_ID;
  const configured =
    !!ROBOFLOW_API_KEY &&
    (!!ROBOFLOW_MODEL_ID || (!!ROBOFLOW_WORKSPACE && !!ROBOFLOW_WORKFLOW_ID));
  const provider = configured ? "roboflow" : "none";
  return NextResponse.json({ configured, provider });
}
