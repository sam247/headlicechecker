import { NextResponse } from "next/server";

const DETECTION_API_URL = process.env.DETECTION_API_URL;

export async function GET() {
  if (!DETECTION_API_URL) {
    return NextResponse.json({ warmed: false, reason: "no DETECTION_API_URL" });
  }

  const url = DETECTION_API_URL.replace(/\/$/, "");
  const t0 = Date.now();

  try {
    const res = await fetch(`${url}/health`, { method: "GET" });
    const ms = Date.now() - t0;
    const body = await res.text();
    console.info("[warm-inference] pinged", { status: res.status, ms, body: body.slice(0, 100) });
    return NextResponse.json({ warmed: true, status: res.status, ms });
  } catch (e) {
    const ms = Date.now() - t0;
    console.warn("[warm-inference] failed", { error: String(e), ms });
    return NextResponse.json({ warmed: false, error: String(e), ms }, { status: 502 });
  }
}
