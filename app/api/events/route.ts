import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const eventNames = ["scan_start", "scan_result", "clinic_contact_submit"] as const;

const schema = z.object({
  event: z.enum(eventNames),
  timestamp: z.string().optional(),
  label: z.string().optional(),
  confidenceLevel: z.enum(["high", "medium", "low"]).optional(),
  clinicId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid event payload" }, { status: 400 });
  }

  const event = {
    ...parsed.data,
    timestamp: parsed.data.timestamp ?? new Date().toISOString(),
  };

  console.info("[analytics_event]", event);
  return NextResponse.json({ ok: true });
}
