#!/usr/bin/env node
/**
 * Parse internal_all.csv and extract blog topics for replication.
 * Output: JSON array of { slug, title, metaDesc, h1, h2_1, h2_2 }
 */
import { readFileSync } from "fs";
import { resolve } from "path";

const EXCLUDED = new Set([
  "joining-the-hairforce",
  "the-hairforce-in-the-media",
  "hairforce-clinics-featured-on-itv",
  "hairforce-which-collaboration",
  "2020", "2021", "2022", "2023", "2024", "2025",
  "elementor-9793",
  "contact-tracing",
  "life-hacks-for-busy-parents",
  "helping-a-child-with-anxiety",
  "10-ways-of-helping-children-achieve-more",
  "a-hairforce-clinic-appointment",
  "unsung-heroes-of-wwii",
  "im-a-beauty-editor-and-i-have-nits-ive-never-seen-people-step-back-faster-when-i-tell-them-i-have-headlice",
  "evenings-on-bbc-radio-berkshire-with-anoushka-williams",
]);

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === "," && !inQuotes) || (c === "\n" && !inQuotes)) {
      result.push(current.trim());
      current = "";
      if (c === "\n") break;
    } else {
      current += c;
    }
  }
  if (current !== "") result.push(current.trim());
  return result;
}

const csvPath = process.env.CSV_PATH || resolve(process.env.HOME || "", "Desktop", "internal_all.csv");
const raw = readFileSync(csvPath, "utf-8");
const lines = raw.split(/\r?\n/).filter(Boolean);

const header = parseCSVLine(lines[0]);
const col = (name) => header.indexOf(name);
const addrIdx = col("Address") >= 0 ? col("Address") : 0;
const titleIdx = col("Title 1") >= 0 ? col("Title 1") : 6;
const metaIdx = col("Meta Description 1") >= 0 ? col("Meta Description 1") : 9;
const h1Idx = col("H1-1") >= 0 ? col("H1-1") : 14;
const h2_1Idx = col("H2-1") >= 0 ? col("H2-1") : 18;
const h2_2Idx = col("H2-2") >= 0 ? col("H2-2") : 20;

const topics = [];
for (let i = 1; i < lines.length; i++) {
  const row = parseCSVLine(lines[i]);
  const addr = row[addrIdx] || "";
  const m = addr.match(/hairforceclinics\.com\/blog\/([^/]+)\//);
  if (!m) continue;
  const slug = m[1];
  if (slug.includes("page") || slug.includes("category")) continue;
  if (EXCLUDED.has(slug)) continue;
  if (topics.some((t) => t.slug === slug)) continue;

  topics.push({
    slug,
    title: (row[titleIdx] || "").replace(/\s*-\s*Hairforce.*$/i, "").trim(),
    metaDesc: row[metaIdx] || "",
    h1: row[h1Idx] || "",
    h2_1: row[h2_1Idx] || "",
    h2_2: row[h2_2Idx] || "",
  });
}

console.log(JSON.stringify(topics, null, 2));
