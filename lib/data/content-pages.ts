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
  image?: string;
  introOverride?: string;
  faqOverride?: { question: string; answer: string }[];
};

interface SectionPlan {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

const PAGE_DETAIL_POINTS: Record<string, string[]> = {
  "/ai-detection": [
    "users compare scan output against visible signs at the nape and behind the ears",
    "confidence should always be interpreted with image quality and symptom timing",
    "low-confidence output should trigger recheck, not immediate panic",
    "clinic confirmation remains the decision end-point when uncertainty persists",
  ],
  "/professional": [
    "families often need practical routing to verified regional clinics rather than broad advice",
    "clear response timing and follow-up expectations improve conversion quality",
    "objective comparison criteria are more useful than promotional claims",
    "clinic pathways should be framed as confirmation support, not diagnosis replacement",
  ],
  "/symptoms": [
    "panic searches are usually driven by itch, sleep disruption, and white-speck uncertainty",
    "symptoms overlap with dandruff and irritation, so repeat checks are essential",
    "household communication quality affects whether escalation is timely or delayed",
    "structured triage reduces unnecessary treatments and stress for children",
  ],
  "/ai-detection/can-ai-detect-head-lice": [
    "AI can detect likely patterns but cannot provide diagnosis from one image",
    "small nits near low-light roots are commonly missed in weak captures",
    "confidence bands should inform urgency, not replace judgment",
    "repeat image capture usually improves triage reliability",
  ],
  "/ai-detection/how-accurate-is-an-online-head-lice-checker": [
    "accuracy changes materially with focus, distance, and scalp exposure",
    "false reassurance risk increases when only one zone is photographed",
    "repeatability across two to three captures is a stronger signal than one image",
    "persistent symptoms should still route to professional confirmation",
  ],
  "/ai-detection/ai-vs-manual-lice-combing": [
    "AI offers speed while manual combing provides tactile confirmation across strands",
    "combing quality depends on technique and consistency over days",
    "combined workflows outperform either method used in isolation",
    "decision quality improves when both methods feed the same escalation model",
  ],
  "/ai-detection/is-a-photo-enough-to-detect-head-lice": [
    "a single photo is often insufficient for high-confidence triage",
    "coverage across multiple scalp zones improves reliability",
    "unclear photos should be treated as low confidence and repeated",
    "clinical confirmation is still required when risk indicators persist",
  ],
  "/professional/professional-head-lice-removal-cost-uk": [
    "price changes with hair length, density, infestation level, and required follow-up",
    "travel, urgent booking windows, and household bundles can materially increase total cost",
    "transparent cost framing helps families decide between repeat OTC cycles and clinic support",
    "cost decisions should include time burden, not price alone",
  ],
  "/professional/are-head-lice-clinics-worth-it": [
    "value depends on uncertainty reduction speed and household time pressure",
    "professional checks can reduce repeated low-confidence home cycles",
    "clinic suitability is strongest where symptoms persist across contacts",
    "neutral comparison language improves trust and decision quality",
  ],
  "/professional/mobile-head-lice-removal-services": [
    "mobile services reduce travel burden but may include distance pricing",
    "families should confirm scope, duration, and follow-up policy in advance",
    "same-day expectations should be aligned with realistic availability",
    "service quality depends on structure and communication, not convenience alone",
  ],
  "/professional/how-long-does-professional-lice-treatment-take": [
    "appointment time varies with hair profile and infestation complexity",
    "follow-up checks can be needed even after an apparently successful first session",
    "timeline expectations are clearer when technicians explain step-by-step workflow",
    "families should plan around treatment windows and recheck timing",
  ],
  "/professional/do-head-lice-clinics-guarantee-results": [
    "guarantees usually include conditions tied to follow-up compliance",
    "wording often differs between immediate clearance and monitored follow-up windows",
    "families should confirm what triggers re-treatment support",
    "realistic framing prevents disappointment and improves informed consent",
  ],
  "/symptoms/white-dots-in-hair-lice-or-dandruff": [
    "attachment behavior is usually the most useful distinction marker",
    "lighting angle can make harmless debris look suspicious",
    "pattern consistency across sections matters more than one strand",
    "repeat checks reduce panic from isolated findings",
  ],
  "/symptoms/why-is-my-childs-head-itchy-at-night": [
    "night-time discomfort can indicate lice but also overlaps with other scalp irritation",
    "timing patterns should be recorded across several days before assumptions",
    "sleep disruption with persistent itch increases escalation priority",
    "child reassurance and calm language improve check quality",
  ],
  "/symptoms/can-you-have-lice-without-seeing-bugs": [
    "early infestations are commonly missed in quick visual checks",
    "nits or symptom patterns may appear before visible moving lice",
    "absence of visible bugs does not automatically mean zero risk",
    "repeat evidence collection is the safest route when uncertainty remains",
  ],
  "/symptoms/early-signs-of-head-lice-in-children": [
    "behavioral cues often appear before clear visual confirmation",
    "scratching around ears and nape should trigger structured recheck",
    "school exposure context helps prioritize same-day action",
    "early triage reduces spread and household stress",
  ],
  "/symptoms/how-often-should-you-check-for-lice": [
    "frequency depends on exposure windows and symptom persistence",
    "routine checks every few days are usually practical during outbreaks",
    "over-checking without structure can increase anxiety and confusion",
    "consistent method matters more than high frequency alone",
  ],
  "/ai-detection/how-to-take-a-clear-lice-check-photo": [
    "photo clarity is the biggest controllable factor for AI triage quality",
    "close-parted root shots in strong light outperform casual snapshots",
    "multiple angles reduce missed indicators in dense hair",
    "quality capture reduces unnecessary repeat scanning",
  ],
  "/professional/how-to-choose-a-head-lice-clinic-near-you": [
    "families should prioritize verified regional clinics with clear follow-up policies",
    "comparison should focus on response quality, not promotional language",
    "location, availability, and communication standards all affect outcomes",
    "structured shortlisting leads to faster and calmer decisions",
  ],
  "/professional/head-lice-treatment-for-adults": [
    "adult cases are often delayed because symptoms are mistaken for dry scalp",
    "treatment consistency matters more than one-off product switching",
    "household coordination prevents reinfestation loops",
    "professional support can be useful when repeat home cycles fail",
  ],
  "/symptoms/what-are-the-first-signs-of-head-lice": [
    "first signals are often subtle and easy to dismiss in early stages",
    "itch can be delayed, so visual checks remain essential",
    "early structured checks reduce spread before school-week escalation",
    "prompt triage lowers unnecessary panic actions",
  ],
  "/professional/best-over-the-counter-head-lice-treatment-for-sensitive-skin": [
    "sensitive skin decisions should balance tolerability and repeatability",
    "families should confirm safe usage windows before repeated application",
    "product selection should avoid harsh cycles driven by panic",
    "professional review is useful when irritation or uncertainty persists",
  ],
};

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

const COMMON_CHECKLIST_BULLETS = [
  "Record what you saw, where on the scalp you saw it, and when you checked.",
  "Repeat checks in strong light and use the same method each time.",
  "Keep checks short and calm so children do not resist follow-up.",
  "Escalate to clinic confirmation if likely indicators repeat across checks.",
];

const SECTION_BLUEPRINTS: Record<string, string[]> = {
  "/ai-detection": [
    "What This Hub Helps You Decide",
    "How to Read AI Results Without Guessing",
    "When to Recheck and When to Escalate",
    "Best Guides to Start With",
    "Common Mistakes to Avoid",
    "How This Connects to Clinic Confirmation",
    "Quick Next Steps",
  ],
  "/professional": [
    "What This Hub Helps You Compare",
    "When Professional Support Makes Sense",
    "Cost, Time, and Booking Factors",
    "How to Compare Clinics Fairly",
    "What to Prepare Before Contacting a Clinic",
    "Mistakes That Delay Resolution",
    "Quick Next Steps",
  ],
  "/symptoms": [
    "What This Hub Helps You Triage",
    "Symptoms That Commonly Cause Panic",
    "What Is Often Misread at Home",
    "How to Recheck Without Overreacting",
    "When to Move to Professional Confirmation",
    "How to Communicate With School Calmly",
    "Quick Next Steps",
  ],
  "/ai-detection/can-ai-detect-head-lice": [
    "What AI Can Detect Reliably",
    "Where AI Results Are Most Likely to Miss",
    "How to Improve Scan Quality at Home",
    "When to Pair AI With Manual Checks",
    "When to Escalate to a Clinic",
    "Bottom Line",
  ],
  "/ai-detection/how-accurate-is-an-online-head-lice-checker": [
    "What Accuracy Means in Real Use",
    "Why Results Vary Between Families",
    "How to Increase Accuracy Before Rechecking",
    "How to Interpret Confidence Safely",
    "When an Online Checker Is Not Enough",
    "Bottom Line",
  ],
  "/ai-detection/ai-vs-manual-lice-combing": [
    "AI and Manual Combing Solve Different Problems",
    "Where AI Is Faster",
    "Where Combing Gives Better Confirmation",
    "A Practical Combined Workflow",
    "When to Escalate to a Clinic",
    "Bottom Line",
  ],
  "/ai-detection/is-a-photo-enough-to-detect-head-lice": [
    "When a Photo Can Be Useful",
    "Why One Photo Is Often Not Enough",
    "How to Capture Better Images",
    "How to Decide Between Recheck and Escalation",
    "When to Seek Professional Confirmation",
    "Bottom Line",
  ],
  "/professional/professional-head-lice-removal-cost-uk": [
    "Typical UK Price Ranges",
    "What Usually Increases Cost",
    "How to Compare Value Instead of Just Price",
    "When Paying for Clinic Support Saves Time",
    "Questions to Ask Before Booking",
    "Bottom Line",
  ],
  "/professional/are-head-lice-clinics-worth-it": [
    "When Clinics Are Usually Worth It",
    "When Home Checks May Be Enough",
    "Time and Stress Trade-Offs",
    "How to Compare Local Options",
    "Signs You Should Escalate Soon",
    "Bottom Line",
  ],
  "/professional/mobile-head-lice-removal-services": [
    "How Mobile Services Typically Work",
    "What to Confirm Before Booking",
    "Pricing and Availability Realities",
    "Who Mobile Care Suits Best",
    "When to Choose Clinic Visit Instead",
    "Bottom Line",
  ],
  "/professional/how-long-does-professional-lice-treatment-take": [
    "Typical Appointment Lengths",
    "What Makes Sessions Longer",
    "When Follow-Up Is Needed",
    "How to Plan Around School and Work",
    "Questions to Ask Your Clinic",
    "Bottom Line",
  ],
  "/professional/do-head-lice-clinics-guarantee-results": [
    "What Clinics Mean by a Guarantee",
    "Common Conditions in Guarantee Policies",
    "How to Read the Fine Print",
    "What to Do If Symptoms Return",
    "How to Set Realistic Expectations",
    "Bottom Line",
  ],
  "/symptoms/white-dots-in-hair-lice-or-dandruff": [
    "How to Tell White Dots Apart",
    "Signs That Suggest Lice",
    "Signs That Suggest Dandruff or Debris",
    "A Simple Home Recheck Method",
    "When to Escalate to Confirmation",
    "Bottom Line",
  ],
  "/symptoms/why-is-my-childs-head-itchy-at-night": [
    "Why Itch Often Feels Worse at Night",
    "When Itch Points to Lice",
    "Other Common Causes of Night Itch",
    "A Calm Recheck Plan for Parents",
    "When to Escalate Quickly",
    "Bottom Line",
  ],
  "/symptoms/can-you-have-lice-without-seeing-bugs": [
    "Yes, It Can Happen Early On",
    "Why Bugs Are Often Missed",
    "What to Look For Instead",
    "How to Recheck Over 48 Hours",
    "When to Escalate to a Clinic",
    "Bottom Line",
  ],
  "/symptoms/early-signs-of-head-lice-in-children": [
    "Early Signs Parents Notice First",
    "What Is Often Missed in Fast Checks",
    "How to Check at Home Step by Step",
    "How to Respond Without Panic",
    "When to Move to Professional Confirmation",
    "Bottom Line",
  ],
  "/symptoms/how-often-should-you-check-for-lice": [
    "A Practical Checking Frequency",
    "How Frequency Changes During Outbreaks",
    "How to Avoid Overchecking",
    "A Repeatable Weekly Routine",
    "When to Escalate Beyond Routine Checks",
    "Bottom Line",
  ],
  "/ai-detection/how-to-take-a-clear-lice-check-photo": [
    "What Makes a Photo Useful for AI",
    "Lighting and Parting Technique",
    "Angles and Distance That Work Best",
    "Common Photo Mistakes to Avoid",
    "How to Review Before Uploading",
    "Bottom Line",
  ],
  "/professional/how-to-choose-a-head-lice-clinic-near-you": [
    "What to Check First",
    "How to Compare Clinics Quickly",
    "Questions to Ask Before You Book",
    "Red Flags to Watch For",
    "How to Decide Without Delaying",
    "Bottom Line",
  ],
  "/professional/head-lice-treatment-for-adults": [
    "Why Adult Cases Are Often Delayed",
    "What Treatment Options Usually Involve",
    "How to Reduce Reinfestation at Home",
    "When to Move to Professional Support",
    "What to Track Between Checks",
    "Bottom Line",
  ],
  "/symptoms/what-are-the-first-signs-of-head-lice": [
    "First Signs People Usually Notice",
    "Early Signs Commonly Misread",
    "How to Check Properly at Home",
    "What to Do in the First 24 Hours",
    "When to Escalate for Confirmation",
    "Bottom Line",
  ],
  "/professional/best-over-the-counter-head-lice-treatment-for-sensitive-skin": [
    "Choosing Products for Sensitive Skin",
    "How to Test Tolerance Safely",
    "Application Habits That Matter",
    "When OTC Is Not Enough",
    "When to Seek Professional Advice",
    "Bottom Line",
  ],
};

function sectionHeadingsFor(seed: SeedPage): string[] {
  const headings = SECTION_BLUEPRINTS[seed.path];
  if (headings) return headings;
  return SECTION_BLUEPRINTS[`/${inferPillar(seed.path)}`] ?? [];
}

function topicLabelForSeed(seed: SeedPage): string {
  return seed.path
    .split("/")
    .filter(Boolean)
    .pop()
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase()) ?? "This Topic";
}

function withEditorialDepth(paragraphs: string[], detail: string, actionLine: string): string[] {
  return [
    ...paragraphs,
    `For this topic, keep one short evidence log with dates, check method, and confidence notes. That record prevents repeated guesswork and makes handovers clearer if another parent, school lead, or clinic team needs to understand what has already been tried. ${detail}.`,
    `${actionLine} The aim is steady progress, not instant certainty. A consistent process over one or two days usually gives better decisions than a rushed sequence of unrelated checks and treatments.`,
  ];
}

function buildSectionParagraphs(seed: SeedPage, pillar: ContentPage["pillar"], heading: string, index: number): string[] {
  const details = PAGE_DETAIL_POINTS[seed.path] ?? PAGE_DETAIL_POINTS[`/${pillar}`] ?? [seed.summaryFocus.toLowerCase()];
  const detailA = details[index % details.length];
  const detailB = details[(index + 1) % details.length];
  const detailC = details[(index + 2) % details.length];
  const actionLine =
    pillar === "professional"
      ? "Before booking, prepare symptom timing, recent checks, prior treatment attempts, and any constraints around school or work so clinics can triage quickly and set realistic expectations."
      : pillar === "ai-detection"
        ? "Use two to three clear checks in the same scalp zones before deciding that confidence is high enough to stop, and keep capture quality consistent so comparisons are meaningful."
        : "Use a calm, repeatable check method and note what changed between checks before making treatment decisions, especially when symptoms are affecting sleep or school confidence.";

  if (seed.pageType === "hub") {
    return [
      `This part of the hub is designed to make same-day decisions clearer. In practice, ${detailA}. Keep language simple, focus on what can be observed, and avoid escalating based on one uncertain check.`,
      `${detailB}. A short, repeatable process usually gives better outcomes than long unstructured checking sessions. If confidence remains mixed after improved checks, move to a clear next action rather than staying in a loop.`,
      `${actionLine}`,
      `If multiple people are involved in checking, agree one shared method first. Consistency between adults is often the difference between useful progress and repeated uncertainty, especially in busy school-week routines.`,
    ];
  }

  if (/bottom line/i.test(heading) || /quick next steps/i.test(heading)) {
    return withEditorialDepth(
      [
      `${seed.summaryFocus} Keep decisions practical: check clearly, recheck when confidence is mixed, and escalate when likely indicators persist. Families usually do best when they follow one simple sequence and avoid changing strategy after every uncertain result.`,
      `In this topic, ${detailA}. That means the goal is not perfection on the first check; the goal is better evidence over a short window so you can make a confident next decision without unnecessary panic or delay.`,
      `${actionLine}`,
      `If uncertainty remains after repeat checks, move to professional confirmation rather than repeating guess-based cycles. A clear handover of what you observed, when you observed it, and how confidence changed will usually improve triage speed and reduce back-and-forth.`,
      ],
      detailB,
      actionLine
    );
  }

  if (/mistakes|red flags|overchecking/i.test(heading)) {
    return withEditorialDepth(
      [
      `A common problem is reacting to one unclear check as if it were final proof. In this topic, ${detailA}. Slow down, document what you observed, and avoid switching methods every time confidence feels uncertain.`,
      `${detailB}. Consistency beats urgency: use the same method, the same high-probability zones, and a clear note of what changed after each check so decisions are based on pattern, not anxiety.`,
      `Another frequent issue is over-correcting with too many products, too many checks, or mixed advice from multiple sources in one evening. That usually creates confusion and can make it harder to tell whether things are improving.`,
      `A better approach is one calm routine for 24-48 hours, followed by a clear escalation decision. This keeps households aligned, improves communication with schools, and gives clinics usable context if professional support is needed.`,
      ],
      detailC,
      actionLine
    );
  }

  if (/escalate|clinic|professional|booking|guarantee/i.test(heading)) {
    return withEditorialDepth(
      [
      `Escalation should be based on repeated indicators, not a single moment of uncertainty. In practice, ${detailA}. This keeps decisions proportionate and helps families move quickly when confidence improves, rather than escalating out of fear.`,
      `Use local clinic routes when symptoms continue after improved rechecks. Ask about response time, follow-up policy, and what evidence is most useful before your appointment so the first conversation is productive.`,
      `${detailB}. If a clinic offers guarantees, clarify exactly what is covered, what follow-up is expected from you, and the timeframe in which recheck support applies.`,
      `Where possible, book the earliest suitable slot rather than waiting for a perfect option. Earlier confirmation usually reduces repeated household disruption and avoids treatment loops driven by uncertainty.`,
      ],
      detailC,
      actionLine
    );
  }

  if (/photo|ai|accuracy|confidence|signal|combing/i.test(heading)) {
    return withEditorialDepth(
      [
      `This section matters because ${detailA}. Reliable outcomes come from clear inputs, not rushed checks or low-light photos, and most confidence problems begin before the scan rather than after it.`,
      `Treat confidence as decision support, not diagnosis. ${detailB}. Combine strong capture quality with repeat checks so results are easier to trust and easier to explain to another adult helping with checks.`,
      `${detailC}. If AI and manual combing appear to disagree, repeat both methods with cleaner technique before jumping to a final conclusion; mixed first-pass evidence is common and manageable.`,
      `The strongest workflow is usually: capture clearly, interpret confidence cautiously, run a structured recheck, then escalate if likely indicators continue. That sequence protects against both false reassurance and unnecessary alarm.`,
      ],
      detailA,
      actionLine
    );
  }

  return withEditorialDepth(
    [
      `Families usually search this question while trying to make a same-day decision under pressure. Here, ${detailA}, so plain-language steps are more useful than technical terms and easier for households to follow consistently.`,
      `${detailB}. Keep notes short, use the same check method each time, and focus on evidence that can be repeated across a short window rather than one isolated observation.`,
      `When possible, separate checking from treatment decisions. First gather better evidence, then choose next actions. That order reduces mistakes, keeps communication calmer, and prevents unnecessary cycles that are hard to interpret later.`,
      `If signs persist or confidence stays mixed, escalation is a practical next step, not a failure. A clear summary of your timeline, observations, and previous checks will help clinics or school teams support you more effectively.`,
    ],
    detailC,
    actionLine
  );
}

function sectionPlansFor(seed: SeedPage, pillar: ContentPage["pillar"]): SectionPlan[] {
  const headings = sectionHeadingsFor(seed);
  const topicLabel = topicLabelForSeed(seed);
  return headings.map((heading, index) => ({
    heading: seed.pageType === "hub" ? heading : `${heading}: ${topicLabel}`,
    paragraphs: buildSectionParagraphs(seed, pillar, heading, index),
    ...(index === headings.length - 1 ? { bullets: COMMON_CHECKLIST_BULLETS } : {}),
  }));
}

function buildSections(seed: SeedPage, pillar: ContentPage["pillar"]): ContentSection[] {
  return sectionPlansFor(seed, pillar).map((plan) => ({
    heading: plan.heading,
    paragraphs: plan.paragraphs,
    ...(plan.bullets ? { bullets: plan.bullets } : {}),
  }));
}

function buildFaq(seed: SeedPage, pillar: ContentPage["pillar"]) {
  if (seed.faqOverride) return seed.faqOverride;

  const topicLabel = topicLabelForSeed(seed);
  const withTopic = (question: string) => (seed.pageType === "hub" ? question : `${question} (${topicLabel})`);

  if (pillar === "professional") {
    return [
      {
        question: withTopic("When is clinic support usually better than repeating home treatment?"),
        answer:
          "Clinic support is usually faster when signs repeat after structured checks, more than one household member is affected, or previous home attempts have not resolved likely indicators.",
      },
      {
        question: withTopic("How should I compare clinics fairly?"),
        answer:
          "Compare response time, follow-up policy, clarity of communication, and whether expectations are explained in plain language before booking.",
      },
      {
        question: withTopic("Does this page replace clinical advice?"),
        answer: "No. The guide supports practical decisions and preparation, but diagnosis and treatment should be confirmed by qualified professionals.",
      },
      {
        question: withTopic("What details should I prepare before contacting a clinic?"),
        answer: "Prepare symptom timing, what you observed in checks, any scan context, and prior treatment steps so triage can be faster and more accurate.",
      },
    ];
  }

  if (pillar === "ai-detection") {
    return [
      {
        question: withTopic("Can a high-confidence AI result still need clinic confirmation?"),
        answer: "Yes. High confidence can support triage, but persistent symptoms or repeated uncertainty should still be confirmed professionally.",
      },
      {
        question: withTopic("What usually causes low-confidence scan results?"),
        answer: "Low light, poor focus, limited scalp coverage, and inconsistent capture distance are the most common causes.",
      },
      {
        question: withTopic("Is one image enough to make a decision?"),
        answer: "Usually not. Two to three clear images across likely zones are more reliable than a single photo.",
      },
      {
        question: withTopic("What is the safest order of actions?"),
        answer: "Capture clearly, review confidence, recheck if uncertain, and escalate to clinic confirmation when likely indicators repeat.",
      },
    ];
  }

  return [
    {
      question: withTopic("Can symptoms appear before I see live bugs?"),
      answer: "Yes. Early infestations are easy to miss visually, so symptom patterns and repeat checks are important.",
    },
    {
      question: withTopic("What causes the most false alarms?"),
      answer: "Dandruff, product residue, and rushed low-light checks are common causes of false positives.",
    },
    {
      question: withTopic("When should we move beyond home checks?"),
      answer: "Escalate when likely indicators repeat across structured checks or symptoms worsen despite better checking quality.",
    },
    {
      question: withTopic("Is this guidance suitable for families and schools?"),
      answer: "Yes. The guidance is designed for practical household and school use with calm, non-diagnostic language.",
    },
  ];
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
    publishOn: "2026-02-24",
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
    publishOn: "2026-02-24",
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
    publishOn: "2026-02-24",
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
    publishOn: "2026-02-24",
    summaryFocus: "This page clarifies what AI can and cannot infer from a single scalp photo.",
    image: "/blog_images/hub_images/ai-detection:can-ai-detect-head-lice.png",
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
    publishOn: "2026-02-25",
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
    publishOn: "2026-02-25",
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
    publishOn: "2026-02-24",
    summaryFocus: "This page provides concrete UK pricing ranges and when costs typically increase.",
    image: "/blog_images/hub_images/professional_professional-head-lice-removal-cost-uk.png",
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
    publishOn: "2026-02-25",
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
    publishOn: "2026-02-25",
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
    publishOn: "2026-02-24",
    summaryFocus: "This page helps parents reduce panic from visual misreads during home checks.",
    image: "/blog_images/hub_images/symptoms_white-dots-in-hair-lice-or-dandruff.png",
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
    publishOn: "2026-02-25",
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
    publishOn: "2026-02-25",
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
    image: "/blog_images/head-lice-treatment-for-adults.jpg",
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
    image: "/blog_images/what-are-the-first-signs-of-head-lice.jpg",
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
    image: "/blog_images/best-over-the-counter-head-lice-treatment-for-sensitive-skin.jpg",
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

function buildIntro(seed: SeedPage, pillar: ContentPage["pillar"]): string {
  if (seed.introOverride) return seed.introOverride;

  const focus =
    PAGE_DETAIL_POINTS[seed.path]?.[0] ??
    PAGE_DETAIL_POINTS[`/${pillar}`]?.[0] ??
    "families need practical next steps and clear language";
  return `${seed.summaryFocus} In practical terms, ${focus}. This guide is educational and non-diagnostic: it helps you gather clearer evidence, choose the next sensible action, and know when to move from home checks to professional confirmation.`;
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

  const sections = buildSections(seed, pillar);
  if (seed.path === "/professional/professional-head-lice-removal-cost-uk") {
    sections[0].paragraphs.unshift(
      "Typical UK clinic ranges are often £60-£120 for a single short-hair check and treatment session, £90-£180 for medium or dense hair, and £140-£260 for longer or high-density treatment sessions that require more time. Some clinics apply household bundles that can range from £170-£420 depending on household size and repeat follow-up requirements."
    );
    sections[1].paragraphs.unshift(
      "Costs usually increase when there is higher egg density, repeated reinfestation, longer hair requiring extended comb time, urgent same-day appointments, travel distance for mobile visits, or where a recheck appointment is clinically sensible after initial treatment."
    );
    sections[2].paragraphs.unshift(
      "Clinic support is often more efficient than OTC-only cycles when repeated home checks remain uncertain, when multiple household members are involved, when prior OTC attempts failed, or when parents need fast and structured confirmation before school return."
    );
  }

  const baseFaq = buildFaq(seed, pillar);

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
    intro: buildIntro(seed, pillar),
    sections,
    faqs: baseFaq,
    internalLinks,
    escalationModelRequired: seed.pageType === "cluster",
    escalationModelText: ESCALATION_MODEL_TEXT,
    toolCtaAboveFold: true,
    professionalBoundaryDisclaimer:
      "This content is educational and non-diagnostic. It supports triage and escalation planning but does not replace qualified medical or clinical assessment.",
    internalAnchors: ["overview", "escalation-model", "next-steps", "faq"],
    ...(seed.image ? { image: seed.image } : {}),
    isPublished: true,
  };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validateEditorialQuality(pages: ContentPage[]): void {
  const bannedHeadingPatterns = [/question framing and user context/i, /structured escalation in practice/i];

  for (const page of pages) {
    const seen = new Set<string>();
    const titleNoPunctuation = page.title.replace(/[?:]/g, "").trim();
    const titleSuffixPattern = new RegExp(`\\bfor\\s+${escapeRegex(titleNoPunctuation)}\\b`, "i");

    for (const section of page.sections) {
      const headingKey = section.heading.trim().toLowerCase();
      if (seen.has(headingKey)) {
        throw new Error(`[content-pages] Duplicate section heading "${section.heading}" on ${page.path}`);
      }
      seen.add(headingKey);

      if (titleSuffixPattern.test(section.heading)) {
        throw new Error(`[content-pages] Robotic heading pattern detected on ${page.path}: "${section.heading}"`);
      }

      if (bannedHeadingPatterns.some((pattern) => pattern.test(section.heading))) {
        throw new Error(`[content-pages] Banned heading phrase detected on ${page.path}: "${section.heading}"`);
      }
    }
  }
}

const allPaths = ALL_SEEDS.map((seed) => seed.path);

const contentPages = ALL_SEEDS.map((seed) => toContentPage(seed, allPaths));
validateEditorialQuality(contentPages);

const HUB_CHILDREN: Record<ContentPage["pillar"], string[]> = {
  "ai-detection": contentPages
    .filter(
      (page) =>
        page.pillar === "ai-detection" &&
        (page.pageType === "cluster" || page.pageType === "support" || page.pageType === "legacy-migrated")
    )
    .map((page) => page.path),
  professional: contentPages
    .filter(
      (page) =>
        page.pillar === "professional" &&
        (page.pageType === "cluster" || page.pageType === "support" || page.pageType === "legacy-migrated")
    )
    .map((page) => page.path),
  symptoms: contentPages
    .filter(
      (page) =>
        page.pillar === "symptoms" &&
        (page.pageType === "cluster" || page.pageType === "support" || page.pageType === "legacy-migrated")
    )
    .map((page) => page.path),
};

export const CONTENT_PAGES: ContentPage[] = contentPages.map((page) =>
  page.pageType === "hub" ? { ...page, hubChildren: HUB_CHILDREN[page.pillar] } : page
);

export const STANDARD_ESCALATION_MODEL = ESCALATION_MODEL_TEXT;
