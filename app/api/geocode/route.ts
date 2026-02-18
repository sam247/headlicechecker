import { NextRequest, NextResponse } from "next/server";

const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 200;

export async function GET(request: NextRequest) {
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Geocoding not configured" },
      { status: 503 }
    );
  }

  const q = request.nextUrl.searchParams.get("q");
  const countryParam = request.nextUrl.searchParams.get("country");
  const query = typeof q === "string" ? q.trim() : "";
  if (query.length < MIN_QUERY_LENGTH || query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      { error: "Query must be between 2 and 200 characters" },
      { status: 400 }
    );
  }

  // Mapbox uses ISO 3166-1 alpha-2; bias results to selected country for partial postcodes (e.g. hp1 -> UK)
  const countryCode =
    countryParam === "UK" ? "GB" : countryParam === "US" ? "US" : null;
  const countryQ = countryCode ? `&country=${countryCode}` : "";

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1&types=postcode,place,address${countryQ}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text.slice(0, 200) || "Mapbox request failed" },
        { status: res.status >= 500 ? 503 : 400 }
      );
    }

    const data = (await res.json()) as {
      features?: Array<{ center?: [number, number] }>;
    };
    const feature = data.features?.[0];
    const center = feature?.center;
    if (!center || center.length < 2) {
      return NextResponse.json(
        { error: "No result found" },
        { status: 404 }
      );
    }

    const [lng, lat] = center;
    return NextResponse.json({ lat, lng });
  } catch (err) {
    console.error("[geocode]", err);
    return NextResponse.json(
      { error: "Geocoding failed" },
      { status: 503 }
    );
  }
}
