import type { ContentPage, ContentPageLink, ContentSection, FunnelStage, SearchIntentType } from "@/lib/data/types";

const ESCALATION_MODEL_TEXT =
  "Detection -> Confidence -> Monitor -> Recheck -> Professional Confirmation -> Urgent Medical Review (if symptoms escalate)";

type SeedPage = {
  path: string;
  title: string;
  description: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  intentType: SearchIntentType;
  funnelStage: FunnelStage;
  pageType: ContentPage["pageType"];
  publishOn: string;
  summaryFocus: string;
};

const SECTION_TEMPLATES = [
  "What this page covers",
  "How to interpret evidence without panic",
  "What usually causes confusion",
  "Structured escalation in practice",
  "When to move to professional confirmation",
  "Practical home workflow",
  "How to reduce repeat uncertainty",
  "Common mistakes and safer alternatives",
  "Decision summary for families",
] as const;

function titleFromPath(path: string): string {
  if (path === "/ai-detection") return "AI Head Lice Checker Hub";
  if (path === "/professional") return "Professional Head Lice Support Hub";
  if (path === "/symptoms") return "Head Lice Symptoms Hub";
  return path
    .split("/")
    .filter(Boolean)
    .pop()
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (s) => s.toUpperCase()) ?? "Content Page";
}

function inferPillar(path: string): ContentPage["pillar"] {
  if (path.startsWith("/ai-detection")) return "ai-detection";
  if (path.startsWith("/professional")) return "professional";
  return "symptoms";
}

function inferSlug(path: string): string | null {
  const parts = path.split("/").filter(Boolean);
  return parts.length > 1 ? parts[1] : null;
}

function buildParagraph(topic: string, focus: string, variant: number): string {
  const bases = [
    `${topic} is usually searched in moments of uncertainty, so this guidance keeps decisions calm and evidence-led. ${focus}. Families should avoid jumping to treatment decisions from one unclear signal and instead use a repeatable triage process before escalation.`,
    `A reliable decision starts with context, not assumptions. For ${topic}, use clear photos, consistent scalp checks, and symptom timing from the same day. This reduces false reassurance, avoids unnecessary interventions, and gives better information if professional confirmation is needed.`,
    `Many households face mixed indicators when reviewing ${topic}. The safest response is to classify confidence, repeat the check with better light, and escalate only when the pattern stays consistent. This page supports practical triage and does not replace clinical diagnosis.`,
    `Because symptom and image quality can vary, the strongest workflow is structured: gather evidence, classify confidence, monitor short-term change, and escalate when uncertainty persists. This reduces stress for children while improving the quality of next-step decisions for caregivers.`,
  ];
  return bases[variant % bases.length];
}

function buildSections(topic: string, focus: string): ContentSection[] {
  return SECTION_TEMPLATES.map((template, index) => {
    const heading = `${topic}: ${template}`;
    const paragraphs = [0, 1, 2, 3].map((variant) => buildParagraph(topic, focus, variant + index));
    if (index === 3 || index === 7) {
      return {
        heading,
        paragraphs,
        bullets: [
          "Document what was seen, where it was seen, and when the check was completed.",
          "Use the same high-light, close-parting method on each repeat check.",
          "Prioritize child comfort and short, calm checks over rushed repeated checks.",
          "Escalate to professional confirmation if likely indicators persist across checks.",
          "Use local clinic pathways when practical support is needed quickly.",
        ],
      };
    }
    return { heading, paragraphs };
  });
}

const SEEDS: SeedPage[] = [
  {
    path: "/ai-detection",
    title: "AI Head Lice Checker Hub: Detection, Confidence, and Next Steps",
    description: "Central guidance for AI-based head lice detection, confidence interpretation, and safe escalation pathways.",
    primaryKeyword: "ai head lice checker",
    secondaryKeywords: ["online lice scan", "ai lice detection", "photo lice checker", "head lice checker online"],
    intentType: "mixed",
    funnelStage: "evaluation",
    pageType: "hub",
    publishOn: "2026-02-26",
    summaryFocus: "This hub explains how AI triage fits into a non-diagnostic care pathway.",
  },
  {
    path: "/professional",
    title: "Professional Head Lice Support Hub: Clinic Pathways and Escalation",
    description: "Central guide to professional head lice support, verified regional clinics, and practical escalation decisions.",
    primaryKeyword: "professional head lice removal",
    secondaryKeywords: ["head lice clinic", "lice treatment clinic", "professional lice treatment", "verified clinics"],
    intentType: "commercial",
    funnelStage: "decision",
    pageType: "hub",
    publishOn: "2026-02-28",
    summaryFocus: "This hub helps families decide when clinic confirmation is more practical than repeated home uncertainty.",
  },
  {
    path: "/symptoms",
    title: "Head Lice Symptoms Hub: Early Signs, Misreads, and Calm Triage",
    description: "Central symptoms hub for early warning signs, common misreads, and structured escalation guidance.",
    primaryKeyword: "head lice symptoms",
    secondaryKeywords: ["early signs of lice", "itchy scalp child", "lice without bugs", "white dots in hair"],
    intentType: "informational",
    funnelStage: "panic",
    pageType: "hub",
    publishOn: "2026-03-03",
    summaryFocus: "This hub captures early panic searches and routes families into evidence-based next steps.",
  },
  {
    path: "/ai-detection/can-ai-detect-head-lice",
    title: "Can AI Detect Head Lice? How It Works and Where It Can Miss",
    description: "A practical explanation of AI lice detection workflows, strengths, and limitations in real home conditions.",
    primaryKeyword: "can ai detect head lice",
    secondaryKeywords: ["ai lice detection accuracy", "photo lice ai", "head lice ai checker", "ai lice limitations"],
    intentType: "informational",
    funnelStage: "evaluation",
    pageType: "cluster",
    publishOn: "2026-02-26",
    summaryFocus: "This page clarifies what AI can and cannot infer from a single scalp photo.",
  },
  {
    path: "/ai-detection/how-accurate-is-an-online-head-lice-checker",
    title: "How Accurate Is an Online Head Lice Checker?",
    description: "Accuracy guidance for online lice checkers, with confidence interpretation and escalation thresholds.",
    primaryKeyword: "how accurate is an online head lice checker",
    secondaryKeywords: ["online lice checker accuracy", "head lice checker reliability", "ai checker confidence", "lice scan false positives"],
    intentType: "informational",
    funnelStage: "evaluation",
    pageType: "cluster",
    publishOn: "2026-03-05",
    summaryFocus: "This page explains why image quality and symptom context change confidence outcomes.",
  },
  {
    path: "/ai-detection/ai-vs-manual-lice-combing",
    title: "AI vs Manual Lice Combing: What Is More Reliable in Practice?",
    description: "A structured comparison of AI screening and manual combing for practical household triage.",
    primaryKeyword: "ai vs manual lice combing",
    secondaryKeywords: ["manual lice combing", "ai lice checker vs comb", "best lice detection method", "wet combing reliability"],
    intentType: "mixed",
    funnelStage: "evaluation",
    pageType: "cluster",
    publishOn: "2026-03-07",
    summaryFocus: "This page helps users combine methods rather than treating them as mutually exclusive.",
  },
  {
    path: "/ai-detection/is-a-photo-enough-to-detect-head-lice",
    title: "Is a Photo Enough to Detect Head Lice?",
    description: "When photo-based detection is useful, when it is limited, and when to escalate immediately.",
    primaryKeyword: "is a photo enough to detect head lice",
    secondaryKeywords: ["photo lice detection", "single image lice check", "lice diagnosis photo", "image quality lice scan"],
    intentType: "informational",
    funnelStage: "evaluation",
    pageType: "cluster",
    publishOn: "2026-03-12",
    summaryFocus: "This page sets realistic expectations for photo-only triage.",
  },
  {
    path: "/professional/professional-head-lice-removal-cost-uk",
    title: "Professional Head Lice Removal Cost in the UK: Real Price Ranges and Decision Triggers",
    description: "Specific UK cost ranges, pricing variables, and decision points for clinic-based head lice support.",
    primaryKeyword: "professional head lice removal cost uk",
    secondaryKeywords: ["head lice clinic cost uk", "lice treatment prices uk", "professional nit removal cost", "clinic vs otc lice"],
    intentType: "commercial",
    funnelStage: "decision",
    pageType: "cluster",
    publishOn: "2026-02-28",
    summaryFocus: "This page provides concrete UK pricing ranges and when costs typically increase.",
  },
  {
    path: "/professional/are-head-lice-clinics-worth-it",
    title: "Are Head Lice Clinics Worth It?",
    description: "A balanced framework to decide when professional head lice clinics are worth the cost and travel.",
    primaryKeyword: "are head lice clinics worth it",
    secondaryKeywords: ["head lice clinic benefits", "professional lice removal worth it", "clinic vs home lice treatment", "verified regional clinics"],
    intentType: "commercial",
    funnelStage: "decision",
    pageType: "cluster",
    publishOn: "2026-03-05",
    summaryFocus: "This page compares household effort burden against professional confirmation speed.",
  },
  {
    path: "/professional/mobile-head-lice-removal-services",
    title: "Mobile Head Lice Removal Services: What to Expect",
    description: "What families should expect from mobile lice removal services, including workflow and pricing factors.",
    primaryKeyword: "mobile head lice removal services",
    secondaryKeywords: ["mobile lice clinic", "home visit lice removal", "lice technician visit", "professional lice service"],
    intentType: "commercial",
    funnelStage: "decision",
    pageType: "cluster",
    publishOn: "2026-03-10",
    summaryFocus: "This page prepares users for service scope, timing, and cost variables in mobile care.",
  },
  {
    path: "/professional/how-long-does-professional-lice-treatment-take",
    title: "How Long Does Professional Lice Treatment Take?",
    description: "Typical treatment duration ranges, what affects timelines, and when follow-up sessions are needed.",
    primaryKeyword: "how long does professional lice treatment take",
    secondaryKeywords: ["lice clinic appointment length", "professional lice treatment duration", "nit removal session time", "follow up lice treatment"],
    intentType: "commercial",
    funnelStage: "decision",
    pageType: "cluster",
    publishOn: "2026-03-12",
    summaryFocus: "This page sets realistic time expectations and escalation timing.",
  },
  {
    path: "/professional/do-head-lice-clinics-guarantee-results",
    title: "Do Head Lice Clinics Guarantee Results?",
    description: "How clinic guarantees usually work, what is included, and what conditions apply to follow-up support.",
    primaryKeyword: "do head lice clinics guarantee results",
    secondaryKeywords: ["lice clinic guarantee", "professional lice treatment guarantee", "re-treatment policy lice", "verified regional clinics"],
    intentType: "commercial",
    funnelStage: "decision",
    pageType: "cluster",
    publishOn: "2026-03-17",
    summaryFocus: "This page explains guarantee language and realistic limitations without overpromising.",
  },
  {
    path: "/symptoms/white-dots-in-hair-lice-or-dandruff",
    title: "White Dots in Hair: Lice, Dandruff, or Something Else?",
    description: "A symptom-led comparison to separate lice indicators from dandruff and common false alarms.",
    primaryKeyword: "white dots in hair lice or dandruff",
    secondaryKeywords: ["nits vs dandruff", "white specks in hair", "lice eggs identification", "child scalp flakes"],
    intentType: "informational",
    funnelStage: "panic",
    pageType: "cluster",
    publishOn: "2026-03-03",
    summaryFocus: "This page helps parents reduce panic from visual misreads during home checks.",
  },
  {
    path: "/symptoms/why-is-my-childs-head-itchy-at-night",
    title: "Why Is My Child's Head Itchy at Night?",
    description: "Night-time itch triage guidance to distinguish likely lice symptoms from other scalp causes.",
    primaryKeyword: "why is my childs head itchy at night",
    secondaryKeywords: ["itchy scalp at night child", "head lice itching pattern", "child scalp irritation", "lice symptoms at night"],
    intentType: "informational",
    funnelStage: "panic",
    pageType: "cluster",
    publishOn: "2026-03-07",
    summaryFocus: "This page turns high-anxiety symptom searches into practical evidence-gathering steps.",
  },
  {
    path: "/symptoms/can-you-have-lice-without-seeing-bugs",
    title: "Can You Have Lice Without Seeing Bugs?",
    description: "Explains why visible bugs are often missed early and how to triage persistent symptoms safely.",
    primaryKeyword: "can you have lice without seeing bugs",
    secondaryKeywords: ["lice without visible bugs", "hidden head lice signs", "early lice evidence", "nits no live lice"],
    intentType: "informational",
    funnelStage: "panic",
    pageType: "cluster",
    publishOn: "2026-03-10",
    summaryFocus: "This page addresses silent or low-visibility infestations and practical follow-up timing.",
  },
  {
    path: "/symptoms/early-signs-of-head-lice-in-children",
    title: "Early Signs of Head Lice in Children",
    description: "A parent-focused guide to the earliest signs, false positives, and the right escalation sequence.",
    primaryKeyword: "early signs of head lice in children",
    secondaryKeywords: ["first signs head lice child", "child lice symptoms", "head scratching lice", "school lice warning signs"],
    intentType: "informational",
    funnelStage: "panic",
    pageType: "cluster",
    publishOn: "2026-03-14",
    summaryFocus: "This page supports early decision-making before symptoms escalate.",
  },
  {
    path: "/symptoms/how-often-should-you-check-for-lice",
    title: "How Often Should You Check for Lice?",
    description: "Check frequency guidance for households, exposure periods, and prevention-oriented routines.",
    primaryKeyword: "how often should you check for lice",
    secondaryKeywords: ["lice check frequency", "how often inspect childs hair", "school outbreak lice checks", "household lice routine"],
    intentType: "informational",
    funnelStage: "evaluation",
    pageType: "cluster",
    publishOn: "2026-03-17",
    summaryFocus: "This page gives practical cadence guidance for regular and outbreak periods.",
  },
  {
    path: "/ai-detection/how-to-take-a-clear-lice-check-photo",
    title: "How to Take a Clear Lice Check Photo for Better AI Triage",
    description: "A practical image-capture guide to improve AI lice screening confidence and reduce false uncertainty.",
    primaryKeyword: "how to take a clear lice check photo",
    secondaryKeywords: ["best photo for lice checker", "lice scan image quality", "phone photo lice detection", "clear scalp photo tips"],
    intentType: "informational",
    funnelStage: "evaluation",
    pageType: "support",
    publishOn: "2026-03-19",
    summaryFocus: "This support page improves upstream scan quality and downstream triage decisions.",
  },
  {
    path: "/professional/how-to-choose-a-head-lice-clinic-near-you",
    title: "How to Choose a Head Lice Clinic Near You",
    description: "A calm checklist for choosing verified regional clinics, comparing options, and setting expectations.",
    primaryKeyword: "how to choose a head lice clinic near you",
    secondaryKeywords: ["choose head lice clinic", "verified regional clinics", "head lice clinic checklist", "lice clinic near me"],
    intentType: "commercial",
    funnelStage: "decision",
    pageType: "support",
    publishOn: "2026-03-19",
    summaryFocus: "This support page improves clinic selection quality without sales-driven language.",
  },
];

const LEGACY_MIGRATED_SEEDS: SeedPage[] = [
  {
    path: "/professional/head-lice-treatment-for-adults",
    title: "Head Lice Treatment for Adults: Structured Home and Professional Pathways",
    description: "Updated adult guidance covering home checks, treatment options, and clinic escalation criteria.",
    primaryKeyword: "head lice treatment for adults",
    secondaryKeywords: ["adult nits treatment", "adult lice removal", "head lice in adults", "professional lice support"],
    intentType: "mixed",
    funnelStage: "evaluation",
    pageType: "legacy-migrated",
    publishOn: "2026-02-24",
    summaryFocus: "Migrated legacy article aligned to professional folder architecture.",
  },
  {
    path: "/symptoms/what-are-the-first-signs-of-head-lice",
    title: "What Are the First Signs of Head Lice?",
    description: "Early signs guide moved into symptoms architecture with updated escalation framing.",
    primaryKeyword: "what are the first signs of head lice",
    secondaryKeywords: ["first signs of lice", "early lice symptoms", "head lice warning signs", "child lice early detection"],
    intentType: "informational",
    funnelStage: "panic",
    pageType: "legacy-migrated",
    publishOn: "2026-02-24",
    summaryFocus: "Migrated legacy article aligned to symptoms folder architecture.",
  },
  {
    path: "/professional/best-over-the-counter-head-lice-treatment-for-sensitive-skin",
    title: "Best Over-the-Counter Head Lice Treatment for Sensitive Skin",
    description: "Migrated OTC treatment guide aligned with professional pathway and escalation boundaries.",
    primaryKeyword: "best over the counter head lice treatment for sensitive skin",
    secondaryKeywords: ["sensitive skin lice treatment", "gentle lice products", "otc lice treatment", "non aggressive lice treatment"],
    intentType: "commercial",
    funnelStage: "decision",
    pageType: "legacy-migrated",
    publishOn: "2026-02-24",
    summaryFocus: "Migrated legacy article aligned to professional folder architecture.",
  },
];

const ALL_SEEDS = [...SEEDS, ...LEGACY_MIGRATED_SEEDS];

function conversionLinkFor(pillar: ContentPage["pillar"]): ContentPageLink {
  if (pillar === "professional") {
    return { href: "/locations", label: "Browse verified regional clinics by location", type: "conversion" };
  }
  if (pillar === "symptoms") {
    return { href: "/professional/how-to-choose-a-head-lice-clinic-near-you", label: "Compare professional confirmation pathways", type: "conversion" };
  }
  return { href: "/find-clinics", label: "Move to clinic confirmation support", type: "conversion" };
}

function toContentPage(seed: SeedPage, allPaths: string[]): ContentPage {
  const pillar = inferPillar(seed.path);
  const slug = inferSlug(seed.path);
  const hubPath = `/${pillar}`;
  const siblingCandidates = allPaths
    .filter((path) => path !== seed.path && path.startsWith(hubPath) && path.split("/").length > 2)
    .slice(0, 2);

  const internalLinks: ContentPageLink[] = [
    { href: seed.pageType === "hub" ? `${hubPath}#overview` : hubPath, label: `${titleFromPath(hubPath)} overview`, type: "hub" },
    ...siblingCandidates.map((href, index) => ({
      href,
      label: `Related guide ${index + 1}: ${titleFromPath(href)}`,
      type: "sibling" as const,
    })),
    conversionLinkFor(pillar),
    { href: "/#start-scan", label: "Run the AI head lice checker", type: "tool" },
  ];

  const sections = buildSections(seed.title, seed.summaryFocus);
  if (seed.path === "/professional/professional-head-lice-removal-cost-uk") {
    sections[0].paragraphs.unshift(
      "Typical UK clinic ranges are often GBP60-GBP120 for a single short-hair check and treatment session, GBP90-GBP180 for medium or dense hair, and GBP140-GBP260 for longer or high-density treatment sessions that require more time. Some clinics apply household bundles that can range from GBP170-GBP420 depending on household size and repeat follow-up requirements."
    );
    sections[1].paragraphs.unshift(
      "Costs usually increase when there is higher egg density, repeated reinfestation, longer hair requiring extended comb time, urgent same-day appointments, travel distance for mobile visits, or where a recheck appointment is clinically sensible after initial treatment."
    );
    sections[2].paragraphs.unshift(
      "Clinic support is often more efficient than OTC-only cycles when repeated home checks remain uncertain, when multiple household members are involved, when prior OTC attempts failed, or when parents need fast and structured confirmation before school return."
    );
  }

  const baseFaq = [
    {
      question: `${seed.title}: what is the safest first step?`,
      answer:
        "Start with clear evidence capture and a calm confidence review, then follow the standard escalation sequence if uncertainty persists.",
    },
    {
      question: `${seed.title}: when should families escalate?`,
      answer:
        "Escalate when likely indicators repeat, confidence remains uncertain after a better recheck, or symptoms are worsening.",
    },
    {
      question: `${seed.title}: can this page replace diagnosis?`,
      answer:
        "No. This guidance supports triage only and does not replace clinical diagnosis or treatment advice.",
    },
    {
      question: `${seed.title}: what link should be used for next action?`,
      answer:
        "Use the AI scan link first, then move to professional confirmation pathways when escalation criteria are met.",
    },
  ];

  return {
    slug,
    path: seed.path,
    pillar,
    pageType: seed.pageType,
    title: seed.title,
    description: seed.description,
    keywords: [seed.primaryKeyword, ...seed.secondaryKeywords],
    primaryKeyword: seed.primaryKeyword,
    secondaryKeywords: seed.secondaryKeywords,
    intentType: seed.intentType,
    funnelStage: seed.funnelStage,
    publishedAt: seed.publishOn,
    updatedAt: seed.publishOn,
    intro: `${seed.summaryFocus} This page uses calm non-diagnostic language and keeps decisions practical for families, schools, and clinic-facing teams. It is designed for UK-first wording with US-secondary relevance where needed, and it routes users to verified escalation steps instead of one-step assumptions.`,
    sections,
    faqs: baseFaq,
    internalLinks,
    escalationModelRequired: true,
    escalationModelText: ESCALATION_MODEL_TEXT,
    toolCtaAboveFold: true,
    professionalBoundaryDisclaimer:
      "This content is educational and non-diagnostic. It supports triage and escalation planning but does not replace qualified medical or clinical assessment.",
    internalAnchors: ["overview", "escalation-model", "next-steps", "faq"],
    isPublished: true,
  };
}

const allPaths = ALL_SEEDS.map((seed) => seed.path);

const contentPages = ALL_SEEDS.map((seed) => toContentPage(seed, allPaths));

const HUB_CHILDREN: Record<ContentPage["pillar"], string[]> = {
  "ai-detection": contentPages
    .filter((page) => page.pillar === "ai-detection" && (page.pageType === "cluster" || page.pageType === "support"))
    .map((page) => page.path),
  professional: contentPages
    .filter((page) => page.pillar === "professional" && (page.pageType === "cluster" || page.pageType === "support"))
    .map((page) => page.path),
  symptoms: contentPages
    .filter((page) => page.pillar === "symptoms" && (page.pageType === "cluster" || page.pageType === "support"))
    .map((page) => page.path),
};

export const CONTENT_PAGES: ContentPage[] = contentPages.map((page) =>
  page.pageType === "hub" ? { ...page, hubChildren: HUB_CHILDREN[page.pillar] } : page
);

export const STANDARD_ESCALATION_MODEL = ESCALATION_MODEL_TEXT;
