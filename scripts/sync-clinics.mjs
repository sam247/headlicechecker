#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1YE-937KWlOp2WB7LhdcPAQ8D5OOtK6X-8AYyn3aeBNU/export?format=csv&gid=0";
const REQUIRED_HEADERS = [
  "Name",
  "Address 1",
  "Address 2",
  "Town",
  "County",
  "Postcode",
  "Country",
  "Telephone",
  "Email",
  "Website",
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const contentDir = path.join(projectRoot, "content");
const ukPath = path.join(contentDir, "clinics.uk.json");
const usPath = path.join(contentDir, "clinics.us.json");
const geocodeCachePath = path.join(contentDir, ".clinic-geocode-cache.json");

const csvUrl = process.env.CLINICS_GSHEET_CSV_URL || DEFAULT_SHEET_CSV_URL;
const strictMode = (process.env.CLINIC_SYNC_STRICT ?? "true").toLowerCase() !== "false";
const geocodeDelayMs = Math.max(0, Number(process.env.CLINIC_GEOCODE_DELAY_MS ?? 1100) || 1100);
const checkOnly = process.argv.includes("--check");

let lastGeocodeAt = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeCountry(input) {
  const v = String(input ?? "").trim().toLowerCase();
  if (["uk", "gb", "united kingdom", "great britain"].includes(v)) return "UK";
  if (["us", "usa", "united states", "united states of america"].includes(v)) return "US";
  return null;
}

function normalizeWebsite(input) {
  const raw = String(input ?? "").trim();
  if (!raw) return undefined;
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withProtocol);
    return url.toString();
  } catch {
    return null;
  }
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += ch;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

async function readCache() {
  try {
    const raw = await readFile(geocodeCachePath, "utf8");
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

async function writeCache(cache) {
  await mkdir(contentDir, { recursive: true });
  await writeFile(geocodeCachePath, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
}

async function geocodeAddress(query) {
  const now = Date.now();
  const waitFor = geocodeDelayMs - (now - lastGeocodeAt);
  if (waitFor > 0) await sleep(waitFor);

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
  let lastError = "Unknown geocoding error";

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "headlicechecker-clinic-sync/1.0 (clinic-sync)",
          Accept: "application/json",
        },
      });
      lastGeocodeAt = Date.now();

      if (!res.ok) {
        lastError = `HTTP ${res.status}`;
      } else {
        const data = await res.json();
        const first = Array.isArray(data) ? data[0] : null;
        const lat = first?.lat != null ? Number(first.lat) : NaN;
        const lng = first?.lon != null ? Number(first.lon) : NaN;
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          return { ok: true, lat, lng };
        }
        lastError = "No coordinates returned";
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }

    if (attempt < 3) {
      await sleep(300 * attempt);
    }
  }

  return { ok: false, error: lastError };
}

function getCell(row, indexByHeader, header) {
  const idx = indexByHeader.get(header);
  if (idx == null) return "";
  return String(row[idx] ?? "").trim();
}

function isRowEmpty(row) {
  return row.every((cell) => String(cell ?? "").trim() === "");
}

function compareClinics(a, b) {
  const byCity = a.city.localeCompare(b.city);
  if (byCity !== 0) return byCity;
  return a.name.localeCompare(b.name);
}

async function run() {
  console.log(`[sync:clinics] source=${csvUrl}`);
  const response = await fetch(csvUrl);
  if (!response.ok) {
    throw new Error(`Failed to download CSV (${response.status})`);
  }

  const csvRaw = await response.text();
  const rows = parseCsv(csvRaw);
  if (rows.length < 2) {
    throw new Error("CSV contains no data rows");
  }

  const headerRow = rows[0].map((h) => String(h ?? "").trim());
  const missingHeaders = REQUIRED_HEADERS.filter((h) => !headerRow.includes(h));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(", ")}`);
  }

  const indexByHeader = new Map();
  for (const header of REQUIRED_HEADERS) {
    indexByHeader.set(header, headerRow.indexOf(header));
  }

  const cache = await readCache();
  const output = [];
  const seenIds = new Set();
  const errors = [];

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    const rowNum = i + 1;
    if (isRowEmpty(row)) continue;

    const name = getCell(row, indexByHeader, "Name");
    const address1 = getCell(row, indexByHeader, "Address 1");
    const address2 = getCell(row, indexByHeader, "Address 2");
    const town = getCell(row, indexByHeader, "Town");
    const county = getCell(row, indexByHeader, "County");
    const postcode = getCell(row, indexByHeader, "Postcode");
    const countryRaw = getCell(row, indexByHeader, "Country");
    const telephone = getCell(row, indexByHeader, "Telephone");
    const email = getCell(row, indexByHeader, "Email");
    const websiteRaw = getCell(row, indexByHeader, "Website");

    const requiredChecks = [
      ["Name", name],
      ["Address 1", address1],
      ["Town", town],
      ["County", county],
      ["Postcode", postcode],
      ["Country", countryRaw],
      ["Telephone", telephone],
    ];
    const missingFields = requiredChecks.filter(([, value]) => !value).map(([field]) => field);
    if (missingFields.length > 0) {
      const message = `Row ${rowNum}: missing required field(s): ${missingFields.join(", ")}`;
      if (strictMode) {
        errors.push(message);
        continue;
      }
      console.warn(`[sync:clinics] ${message} (skipped)`);
      continue;
    }

    const country = normalizeCountry(countryRaw);
    if (!country) {
      const message = `Row ${rowNum}: unsupported country "${countryRaw}"`;
      if (strictMode) {
        errors.push(message);
        continue;
      }
      console.warn(`[sync:clinics] ${message} (skipped)`);
      continue;
    }

    const bookingUrl = normalizeWebsite(websiteRaw);
    if (bookingUrl === null) {
      const message = `Row ${rowNum}: invalid website URL "${websiteRaw}"`;
      if (strictMode) {
        errors.push(message);
        continue;
      }
      console.warn(`[sync:clinics] ${message} (skipped)`);
      continue;
    }

    const id = slugify(`${country}-${town}-${name}`);
    if (!id) {
      const message = `Row ${rowNum}: could not create clinic id`;
      if (strictMode) {
        errors.push(message);
        continue;
      }
      console.warn(`[sync:clinics] ${message} (skipped)`);
      continue;
    }
    if (seenIds.has(id)) {
      const message = `Row ${rowNum}: duplicate clinic id "${id}"`;
      if (strictMode) {
        errors.push(message);
        continue;
      }
      console.warn(`[sync:clinics] ${message} (skipped)`);
      continue;
    }
    seenIds.add(id);

    const geocodeQuery = [address1, address2, town, county, postcode, country].filter(Boolean).join(", ");
    const cacheKey = geocodeQuery.toLowerCase();
    let coords = cache[cacheKey];

    if (!coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) {
      const geocoded = await geocodeAddress(geocodeQuery);
      if (!geocoded.ok) {
        const message = `Row ${rowNum}: geocode failed for "${geocodeQuery}" (${geocoded.error})`;
        if (strictMode) {
          errors.push(message);
          continue;
        }
        console.warn(`[sync:clinics] ${message} (skipped)`);
        continue;
      }
      coords = { lat: geocoded.lat, lng: geocoded.lng, updatedAt: new Date().toISOString() };
      cache[cacheKey] = coords;
    }

    if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) {
      const message = `Row ${rowNum}: invalid coordinates for "${geocodeQuery}"`;
      if (strictMode) {
        errors.push(message);
        continue;
      }
      console.warn(`[sync:clinics] ${message} (skipped)`);
      continue;
    }

    output.push({
      id,
      name,
      region: county,
      country,
      city: town,
      postcode,
      address1,
      ...(address2 ? { address2 } : {}),
      phone: telephone,
      ...(email ? { email } : {}),
      ...(bookingUrl ? { bookingUrl } : {}),
      lat: coords.lat,
      lng: coords.lng,
      services: ["Screening", "Removal"],
      active: true,
    });
  }

  if (errors.length > 0) {
    const message = `[sync:clinics] failed with ${errors.length} error(s)\n${errors.map((e) => `- ${e}`).join("\n")}`;
    throw new Error(message);
  }

  output.sort(compareClinics);
  const ukClinics = output.filter((clinic) => clinic.country === "UK");
  const usClinics = output.filter((clinic) => clinic.country === "US");

  console.log(`[sync:clinics] parsed=${rows.length - 1} valid=${output.length} uk=${ukClinics.length} us=${usClinics.length}`);

  if (checkOnly) {
    console.log("[sync:clinics] check mode: no files written");
    return;
  }

  await mkdir(contentDir, { recursive: true });
  await writeFile(ukPath, `${JSON.stringify(ukClinics, null, 2)}\n`, "utf8");
  await writeFile(usPath, `${JSON.stringify(usClinics, null, 2)}\n`, "utf8");
  await writeCache(cache);

  console.log("[sync:clinics] wrote content/clinics.uk.json");
  console.log("[sync:clinics] wrote content/clinics.us.json");
  console.log("[sync:clinics] wrote content/.clinic-geocode-cache.json");
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
