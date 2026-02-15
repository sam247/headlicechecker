import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getClinics } from "@/lib/data/content";
import type { ScanConfidenceLevel, ScanLabel } from "@/lib/data/types";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  postcode: z.string().min(3),
  message: z.string().max(500).optional(),
  clinicId: z.string().optional(),
  scanLabel: z.custom<ScanLabel>().optional(),
  scanConfidenceLevel: z.custom<ScanConfidenceLevel>().optional(),
  consent: z.literal(true),
});

function pickDestination(clinicId?: string, postcode?: string): { clinicId?: string; email?: string; region: string } {
  const clinics = getClinics("ALL");
  const byId = clinicId ? clinics.find((c) => c.id === clinicId) : undefined;
  if (byId) {
    return { clinicId: byId.id, email: byId.email, region: byId.country };
  }

  const normalized = postcode?.trim().toUpperCase() ?? "";
  const usHint = /^\d{5}/.test(normalized);
  const region = usHint ? "US" : "UK";
  const fallback = clinics.find((c) => c.country === region);

  return { clinicId: fallback?.id, email: fallback?.email, region };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid request payload",
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
      { status: 400 }
    );
  }

  const payload = parsed.data;
  const destination = pickDestination(payload.clinicId, payload.postcode);
  const referenceId = `lead_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  console.info("[clinic_contact]", {
    referenceId,
    destination,
    lead: {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      postcode: payload.postcode,
      message: payload.message,
      scanLabel: payload.scanLabel,
      scanConfidenceLevel: payload.scanConfidenceLevel,
    },
  });

  return NextResponse.json({ ok: true, referenceId });
}
