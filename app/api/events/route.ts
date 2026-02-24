import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      deprecated: true,
      message: "This endpoint is deprecated. Use POST /api/event.",
    },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      deprecated: true,
      message: "This endpoint is deprecated. Use POST /api/event.",
    },
    { status: 410 }
  );
}

