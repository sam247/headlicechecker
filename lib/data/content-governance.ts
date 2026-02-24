import { CONTENT_PAGES } from "@/lib/data/content-pages";
import type { ContentPage } from "@/lib/data/types";

const MIN_WORDS = 1500;
const MIN_PARAGRAPH_RATIO = 0.72;

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function wordCount(page: ContentPage): number {
  const paragraphWords = [page.intro, ...page.sections.flatMap((section) => section.paragraphs)]
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const bulletWords = page.sections
    .flatMap((section) => section.bullets ?? [])
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return paragraphWords + bulletWords;
}

function paragraphRatio(page: ContentPage): number {
  const paragraphUnits = page.sections.reduce((acc, section) => acc + section.paragraphs.length, 0) + 1;
  const bulletUnits = page.sections.reduce((acc, section) => acc + (section.bullets?.length ?? 0), 0);
  const total = paragraphUnits + bulletUnits;
  if (total <= 0) return 1;
  return paragraphUnits / total;
}

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(`[content-governance] ${message}`);
  }
}

export function validateContentGovernance(pages: ContentPage[] = CONTENT_PAGES): ContentPage[] {
  const publishedPages = pages.filter((page) => page.isPublished);
  const intentKeys = new Set<string>();
  const headingByPillar = new Map<string, string>();
  const faqByPillar = new Map<string, string>();

  for (const page of publishedPages) {
    assert(page.path.startsWith("/"), `${page.path} must be absolute.`);
    assert(page.primaryKeyword.length > 0, `${page.path} missing primary keyword.`);
    assert(page.secondaryKeywords.length >= 3 && page.secondaryKeywords.length <= 5, `${page.path} must have 3-5 secondary keywords.`);
    assert(page.internalLinks.some((link) => link.type === "hub"), `${page.path} missing hub link.`);
    assert(page.internalLinks.filter((link) => link.type === "sibling").length >= 2, `${page.path} missing sibling links.`);
    assert(page.internalLinks.some((link) => link.type === "conversion"), `${page.path} missing conversion link.`);
    assert(page.internalLinks.some((link) => link.type === "tool"), `${page.path} missing tool link.`);
    assert(page.toolCtaAboveFold, `${page.path} missing above-the-fold tool CTA flag.`);
    if (page.pageType === "cluster") {
      assert(page.escalationModelRequired, `${page.path} cluster page must require standard escalation model.`);
      assert(
        page.escalationModelText ===
          "Detection -> Confidence -> Monitor -> Recheck -> Professional Confirmation -> Urgent Medical Review (if symptoms escalate)",
        `${page.path} uses non-standard escalation wording.`
      );
    } else {
      assert(!page.escalationModelRequired, `${page.path} should not require escalation module by page type.`);
    }
    assert(page.internalAnchors.length >= 3, `${page.path} must include internal anchor sections.`);
    assert(page.faqs.length >= 4, `${page.path} must include at least 4 FAQs.`);
    assert(page.professionalBoundaryDisclaimer.length > 0, `${page.path} missing professional boundary disclaimer.`);

    const labels = page.internalLinks.map((link) => normalize(link.label));
    assert(new Set(labels).size === labels.length, `${page.path} has repeated anchor text labels.`);

    const primaryIntentKey = `${normalize(page.intentType)}::${normalize(page.primaryKeyword)}`;
    assert(!intentKeys.has(primaryIntentKey), `${page.path} duplicates primary intent with another page.`);
    intentKeys.add(primaryIntentKey);

    const hubOrCluster = page.pageType === "hub" || page.pageType === "cluster" || page.pageType === "support";
    if (hubOrCluster) {
      assert(wordCount(page) >= MIN_WORDS, `${page.path} has fewer than ${MIN_WORDS} words.`);
      assert(paragraphRatio(page) >= MIN_PARAGRAPH_RATIO, `${page.path} paragraph ratio is below ${MIN_PARAGRAPH_RATIO}.`);
    }

    for (const section of page.sections) {
      const key = `${page.pillar}::${normalize(section.heading)}`;
      assert(!headingByPillar.has(key), `${page.path} repeats H2 pattern with ${headingByPillar.get(key)}.`);
      headingByPillar.set(key, page.path);
    }

    for (const faq of page.faqs) {
      const key = `${page.pillar}::${normalize(faq.question)}`;
      assert(!faqByPillar.has(key), `${page.path} repeats FAQ question with ${faqByPillar.get(key)}.`);
      faqByPillar.set(key, page.path);
    }

    if (page.pageType === "hub") {
      assert((page.hubChildren?.length ?? 0) >= 4, `${page.path} hub is missing cluster child links.`);
    }
  }

  return pages;
}
