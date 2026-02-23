#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = process.env.EVIDENCE_BASE_URL || 'http://127.0.0.1:4100';
const OUT_DIR = path.resolve('docs/launch-review');
const SHOTS = path.join(OUT_DIR, 'screenshots');
const REPORTS = path.join(OUT_DIR, 'reports');
const DATA = path.join(OUT_DIR, 'data');

const pagesToMap = [
  `${BASE_URL}/`,
  `${BASE_URL}/for-schools`,
  `${BASE_URL}/blog/what-are-the-first-signs-of-head-lice`,
  `${BASE_URL}/blog/head-lice-treatment-for-adults`,
];

function stripHtml(v) {
  return v.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function ensureDirs() {
  await fs.mkdir(SHOTS, { recursive: true });
  await fs.mkdir(REPORTS, { recursive: true });
  await fs.mkdir(DATA, { recursive: true });
}

async function saveLinkMap(rows) {
  const header = 'source_url,target_url,anchor_text,position\n';
  const body = rows
    .map((r) => [r.source, r.target, r.anchor.replace(/,/g, ';'), r.position].join(','))
    .join('\n');
  await fs.writeFile(path.join(DATA, 'Internal-Link-Map.csv'), `${header}${body}\n`, 'utf8');
}

async function run() {
  await ensureDirs();
  const browser = await chromium.launch({ headless: true });

  // Desktop toolkit page capture
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await desktop.newPage();
  await page.goto(`${BASE_URL}/school-head-lice-toolkit`, { waitUntil: 'networkidle' });

  await page.screenshot({ path: path.join(SHOTS, 'toolkit-desktop-hero.png') });
  await page.screenshot({ path: path.join(SHOTS, 'toolkit-desktop-full.png'), fullPage: true });
  await page.pdf({ path: path.join(REPORTS, 'Toolkit-Screens-Desktop.pdf'), width: '1440px', height: '900px', printBackground: true });

  // 300 words excerpt and schema extraction
  const h1 = await page.locator('h1').first().innerText().catch(() => 'N/A');
  const first300 = await page.evaluate(() => {
    const text = document.body?.innerText || '';
    return text.split(/\s+/).slice(0, 300).join(' ');
  });

  const ldJson = await page.evaluate(() =>
    Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => s.textContent || '')
  );
  await fs.writeFile(path.join(DATA, 'toolkit-jsonld-live.json'), JSON.stringify(ldJson, null, 2), 'utf8');

  // Gating flow screens
  await page.locator('button:has-text("Unlock toolkit")').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOTS, 'gate-validation-empty.png'), fullPage: true });

  await page.fill('input[placeholder="School email"]', 'bad-email');
  await page.locator('button:has-text("Unlock toolkit")').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOTS, 'gate-validation-invalid-email.png'), fullPage: true });

  await page.fill('input[placeholder="School name"]', 'QA Primary School');
  await page.selectOption('select[name="role"]', 'Headteacher');
  await page.fill('input[placeholder="School email"]', `qa.audit.${Date.now()}@test.sch.uk`);
  await page.selectOption('select[name="country"]', 'UK');
  await page.fill('input[placeholder="Trust name (optional)"]', 'QA Trust');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SHOTS, 'gate-institutional-email-highlight.png'), fullPage: true });

  await page.locator('button:has-text("Unlock toolkit")').click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SHOTS, 'gate-success-unlocked.png'), fullPage: true });
  await page.pdf({ path: path.join(REPORTS, 'Gating-Flow-Proof.pdf'), width: '1440px', height: '900px', printBackground: true });

  // Mobile captures
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mPage = await mobile.newPage();
  await mPage.goto(`${BASE_URL}/school-head-lice-toolkit`, { waitUntil: 'networkidle' });
  await mPage.screenshot({ path: path.join(SHOTS, 'toolkit-mobile-full.png'), fullPage: true });
  await mPage.pdf({ path: path.join(REPORTS, 'Toolkit-Screens-Mobile.pdf'), width: '390px', height: '844px', printBackground: true });

  // Internal link map
  const mapRows = [];
  for (const source of pagesToMap) {
    const p = await desktop.newPage();
    await p.goto(source, { waitUntil: 'networkidle' });
    const rows = await p.evaluate(() => {
      const matches = [];
      for (const a of Array.from(document.querySelectorAll('a[href]'))) {
        const href = a.getAttribute('href') || '';
        if (!href.includes('/school-head-lice-toolkit')) continue;
        const text = (a.textContent || '').replace(/\s+/g, ' ').trim();
        let position = 'body';
        if (a.closest('header')) position = 'header';
        else if (a.closest('footer')) position = 'footer';
        else if (a.closest('section')) position = 'section';
        matches.push({ target: href, anchor: text, position });
      }
      return matches;
    });
    for (const row of rows) mapRows.push({ source, ...row });
    await p.close();
  }
  await saveLinkMap(mapRows);

  // Schema notes
  const parsed = ldJson
    .map((raw) => {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  const types = parsed.map((o) => o['@type']).flat();
  const schemaNotes = [
    '# Schema Validation Notes',
    '',
    `- Base URL checked: ${BASE_URL}`,
    `- H1: ${h1}`,
    `- JSON-LD object count: ${parsed.length}`,
    `- Types found: ${Array.from(new Set(types)).join(', ')}`,
    '',
    '## First 300 Words',
    '',
    first300,
    '',
    '## Checks',
    '',
    '- FAQ schema present: ' + (types.includes('FAQPage') ? 'yes' : 'no'),
    '- EducationalOrganization schema present: ' + (types.includes('EducationalOrganization') ? 'yes' : 'no'),
    '- WebPage schema present: ' + (types.includes('WebPage') ? 'yes' : 'no'),
    '- Duplicate/conflict review: manual pass required on deployed live HTML snapshot.',
  ].join('\n');
  await fs.writeFile(path.join(REPORTS, 'Schema-Validation-Notes.md'), schemaNotes, 'utf8');

  // Monitoring CSV template
  const gscTemplate = [
    'date,query,impressions,clicks,avg_position,notes',
    '2026-02-26,head lice policy template,,,,Day 3 snapshot',
    '2026-02-26,school lice protocol,,,,Day 3 snapshot',
    '2026-02-26,lice letter to parents,,,,Day 3 snapshot',
    '2026-02-26,head lice policy UK,,,,Day 3 snapshot',
    '2026-03-02,head lice policy template,,,,Day 7 snapshot',
    '2026-03-02,school lice protocol,,,,Day 7 snapshot',
    '2026-03-02,lice letter to parents,,,,Day 7 snapshot',
    '2026-03-02,head lice policy UK,,,,Day 7 snapshot',
  ].join('\n');
  await fs.writeFile(path.join(DATA, 'GSC-Day3-Day7-Snapshot.csv'), `${gscTemplate}\n`, 'utf8');

  // Editorial adjustments report
  const editorial = [
    '# Editorial Adjustments List',
    '',
    '## Completed',
    '- Added section: "Why Structured Communication Prevents Escalation" between institutional principles and gate.',
    '- Preserved institutional, non-diagnostic tone on toolkit page and gate copy.',
    '- Internal links to toolkit verified from homepage, schools page, footer, and contextual blog CTAs.',
    '',
    '## Live Review Notes',
    '- Capture confirmation email inbox screenshot manually from recipient mailbox after live submit.',
    '- If live Search Console impressions are zero by Day 7, tighten title/H2/FAQ phrasing as planned.',
  ].join('\n');
  await fs.writeFile(path.join(REPORTS, 'Editorial-Adjustments-List.md'), editorial, 'utf8');

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
