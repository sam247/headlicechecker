import { appendSheetValues } from "@/lib/server/analytics-table";

interface SchoolLeadRowInput {
  timestamp: string;
  schoolName: string;
  role: string;
  email: string;
  country: string;
  trustName?: string;
  toolkitDownloaded: boolean;
  toolkitAssetsUnlocked: string[];
  sourcePage: string;
  referenceId: string;
  eventKey: string;
}

function countryTag(raw: string): string {
  const value = raw.trim();
  return value.length > 0 ? value : "unknown";
}

function regionTag(rawCountry: string): string {
  const country = rawCountry.trim().toUpperCase();
  if (["UK", "GB", "UNITED KINGDOM", "IRELAND"].includes(country)) return "UK & Ireland";
  if (["US", "USA", "UNITED STATES", "CANADA", "CA"].includes(country)) return "North America";
  if (["AU", "AUS", "AUSTRALIA", "NZ", "NEW ZEALAND"].includes(country)) return "Oceania";
  return "Other";
}

export async function appendSchoolLeadRow(input: SchoolLeadRowInput): Promise<void> {
  const sheetId = process.env.SCHOOL_LEADS_SHEET_ID;
  const tab = process.env.SCHOOL_LEADS_SHEET_TAB;
  if (!sheetId || !tab) return;

  const normalizedCountry = countryTag(input.country);
  await appendSheetValues({
    sheetId,
    tab,
    values: [
      [
        input.timestamp,
        input.schoolName,
        input.role,
        input.email,
        normalizedCountry,
        input.trustName ?? "",
        input.toolkitDownloaded ? "true" : "false",
        input.toolkitAssetsUnlocked.join(","),
        regionTag(normalizedCountry),
        normalizedCountry,
        "new",
        "",
        input.sourcePage,
        input.referenceId,
      ],
    ],
    eventKey: `school-lead:${input.eventKey}`,
  });
}
