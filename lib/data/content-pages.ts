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
};

interface SectionPlan {
  heading: string;
  prompt: string;
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

function sectionPlansFor(seed: SeedPage, pillar: ContentPage["pillar"]): SectionPlan[] {
  const commonBullets = [
    "Document what was seen, where it was seen, and when the check was completed.",
    "Use the same high-light, close-parting method on each repeat check.",
    "Prioritize child comfort and short, calm checks over rushed repeated checks.",
    "Escalate to professional confirmation if likely indicators persist across checks.",
    "Use local clinic pathways when practical support is needed quickly.",
  ];

  if (seed.pageType === "hub") {
    return [
      { heading: "Pillar overview and intent", prompt: "Define what this pillar solves and who it serves in the user journey." },
      { heading: "How to use this hub", prompt: "Explain how users should navigate the cluster pages and when to use each one." },
      { heading: "Core risk boundaries", prompt: "State non-diagnostic limits and when self-triage is insufficient." },
      { heading: "Structured escalation in practice", prompt: "Apply the shared escalation model to common household and school scenarios.", bullets: commonBullets },
      { heading: "Links to all cluster pages", prompt: "Introduce each cluster page as a decision-support step within the same pillar." },
      { heading: "Tool-first workflow", prompt: "Describe how the AI scan fits before manual checks and clinic escalation." },
      { heading: "Professional confirmation thresholds", prompt: "Set practical thresholds for when clinic confirmation should be prioritized." },
      { heading: "Common mistakes and safer alternatives", prompt: "List avoidable errors and calmer, evidence-first alternatives.", bullets: commonBullets },
      { heading: "Summary and next actions", prompt: "Close with practical next actions and clear conversion routes." },
    ];
  }

  if (pillar === "ai-detection") {
    return [
      { heading: "Question framing and user context", prompt: "Frame the high-intent question and define what users usually need to decide today." },
      { heading: "How the detection signal is created", prompt: "Explain image quality, scalp visibility, and confidence interpretation in plain language." },
      { heading: "Known limitations and false reassurance risks", prompt: "Clarify where AI output can underperform or overstate confidence." },
      { heading: "Structured escalation in practice", prompt: "Apply the fixed escalation model to mixed-confidence outcomes.", bullets: commonBullets },
      { heading: "AI versus alternative checking methods", prompt: "Compare AI triage with manual checks and professional confirmation workflow." },
      { heading: "Photo quality and repeat-check protocol", prompt: "Describe repeatability standards that improve consistency between checks." },
      { heading: "When to move to clinics and locations", prompt: "Define escalation triggers that should route to verified regional clinics." },
      { heading: "Common interpretation mistakes", prompt: "Show common user misreads and how to avoid overconfidence or overreaction.", bullets: commonBullets },
      { heading: "Decision summary for families and schools", prompt: "Provide an action-ready summary with scan, monitor, and clinic pathways." },
    ];
  }

  if (pillar === "professional") {
    return [
      { heading: "Decision context and practical expectations", prompt: "Set clear expectations for professional support without hard-sell language." },
      { heading: "What influences outcome quality", prompt: "Explain how service quality, timing, and evidence quality shape outcomes." },
      { heading: "Costs, time, and logistics variables", prompt: "Describe concrete variables that change cost and service planning." },
      { heading: "Structured escalation in practice", prompt: "Map when families should move from home checks to clinic confirmation.", bullets: commonBullets },
      { heading: "How to compare verified regional clinics", prompt: "Give objective comparison criteria for families choosing care routes." },
      { heading: "When clinic support is better than OTC-only cycles", prompt: "Define practical decision triggers where clinic care is more efficient." },
      { heading: "Communication checklist before booking", prompt: "Explain what details to prepare so clinics can triage quickly and safely." },
      { heading: "Avoiding aggressive or premature decisions", prompt: "Reinforce calm tone and avoid unnecessary urgency language.", bullets: commonBullets },
      { heading: "Summary with clear next steps", prompt: "Close with neutral routing to scan, locations, and professional follow-up." },
    ];
  }

  return [
    { heading: "Symptom framing and panic reduction", prompt: "Acknowledge anxiety while reframing decisions around observable evidence." },
    { heading: "What the symptom may indicate", prompt: "Differentiate likely lice indicators from common non-lice causes." },
    { heading: "What is often misread", prompt: "Explain why quick checks produce false alarms and false reassurance." },
    { heading: "Structured escalation in practice", prompt: "Apply the fixed escalation sequence to symptom-led decisions.", bullets: commonBullets },
    { heading: "Home check method for clearer evidence", prompt: "Give a repeatable home-check protocol for better confidence." },
    { heading: "When to escalate to professional confirmation", prompt: "Define thresholds for clinic support and location-based routing." },
    { heading: "School and household communication guidance", prompt: "Provide practical communication guidance to avoid stigma and panic." },
    { heading: "Frequent mistakes and safer alternatives", prompt: "Highlight avoidable actions and practical alternatives.", bullets: commonBullets },
    { heading: "Summary and next actions", prompt: "Close with clear, calm actions including scan and clinic pathways." },
  ];
}

function buildParagraph(seed: SeedPage, pillar: ContentPage["pillar"], plan: SectionPlan, variant: number): string {
  const details = PAGE_DETAIL_POINTS[seed.path] ?? PAGE_DETAIL_POINTS[`/${pillar}`] ?? [];
  const detail = details[variant % Math.max(details.length, 1)] ?? seed.summaryFocus.toLowerCase();
  if (variant % 4 === 0) {
    return `${plan.prompt} In day-to-day use, one of the most important realities is that ${detail}. Families often search this topic when they need a practical answer quickly, so this section keeps language plain and decision-focused rather than technical or alarm-driven. The goal is to reduce uncertainty with a repeatable process, document what was actually observed, and avoid assumptions based on a single low-quality check. ${seed.summaryFocus} This supports calmer decisions at home and clearer communication if professional follow-up becomes necessary.`;
  }
  if (variant % 4 === 1) {
    return `Use a consistent method each time: strong lighting, hair parted close to the scalp, and checks repeated across the same high-probability zones. Consistency matters because mixed evidence is common, especially when families are tired, short on time, or checking more than one child. A structured method reduces both false reassurance and unnecessary panic actions, and it creates better continuity between scan output, manual observations, and later escalation decisions. Clear process is usually more valuable than rushing through multiple unstructured checks.`;
  }
  if (variant % 4 === 2) {
    return `Keep communication concise and factual, especially for school and household updates. Record when symptoms started, what was seen, and how confidence changed after recheck. This evidence-first approach improves decision quality because it separates urgency from uncertainty, helping families avoid repeated treatment cycles driven by guesswork. When professional teams receive clear timelines and consistent observations, triage is faster, advice is more targeted, and follow-up planning is usually more efficient for everyone involved.`;
  }
  return `When confidence remains unclear or likely indicators persist, follow the fixed escalation pathway instead of escalating emotionally. Move from detection signals to confidence review, then monitor and recheck before deciding on professional confirmation unless symptoms are clearly worsening. This keeps the process proportionate and medically responsible, while still allowing rapid escalation when needed. Where practical, use verified clinic routes and location pathways so next steps are specific, time-bound, and easier to execute without delay.`;
}

function buildSections(seed: SeedPage, pillar: ContentPage["pillar"]): ContentSection[] {
  return sectionPlansFor(seed, pillar).map((plan, index) => {
    const baseTitle = seed.title.split(":")[0].replace(/\?$/, "");
    const heading = seed.pageType === "hub" ? plan.heading : `${plan.heading} for ${baseTitle}`;
    const paragraphs = [0, 1, 2, 3].map((variant) => buildParagraph(seed, pillar, plan, variant + index));
    return {
      heading,
      paragraphs,
      ...(plan.bullets ? { bullets: plan.bullets } : {}),
    };
  });
}

function buildFaq(seed: SeedPage, pillar: ContentPage["pillar"]) {
  if (pillar === "professional") {
    return [
      {
        question: `${seed.title}: when is professional confirmation better than repeating OTC attempts?`,
        answer:
          "Professional confirmation is often more efficient when uncertainty persists across repeat checks, when multiple household members are affected, or when prior OTC cycles have not resolved likely indicators.",
      },
      {
        question: `${seed.title}: how should families compare verified regional clinics objectively?`,
        answer:
          "Compare response times, session structure, follow-up policy, and communication clarity. Choose the first suitable confirmation slot rather than delaying for an ideal option.",
      },
      {
        question: `${seed.title}: does this page provide diagnosis or treatment prescriptions?`,
        answer:
          "No. This guidance supports practical routing and decision preparation. Diagnosis and treatment decisions should be confirmed by qualified professionals.",
      },
      {
        question: `${seed.title}: what should I prepare before contacting a clinic?`,
        answer:
          "Prepare symptom timing, what was seen in checks, scan confidence context, and any prior treatment attempts so the clinic can triage accurately.",
      },
    ];
  }

  if (pillar === "ai-detection") {
    return [
      {
        question: `${seed.title}: can a high-confidence result still need professional confirmation?`,
        answer:
          "Yes. High confidence can support triage but does not replace in-person confirmation where symptoms persist, risk is repeated, or clinical advice is needed.",
      },
      {
        question: `${seed.title}: what causes low-confidence AI outcomes most often?`,
        answer:
          "Low light, unclear focus, poor scalp visibility, and limited section coverage are common causes. Repeat with better image quality before making decisions.",
      },
      {
        question: `${seed.title}: should families rely on one photo only?`,
        answer:
          "Usually no. Multiple close-up images across likely zones improve consistency and reduce false reassurance.",
      },
      {
        question: `${seed.title}: what is the safest action order?`,
        answer:
          "Use the scan as triage, classify confidence, monitor or recheck where needed, and escalate to professional confirmation when patterns persist.",
      },
    ];
  }

  return [
    {
      question: `${seed.title}: can symptoms appear before visible bugs are found?`,
      answer:
        "Yes. Symptoms can appear before clearly visible bugs, which is why repeatable checks and confidence-based escalation are important.",
    },
    {
      question: `${seed.title}: what usually causes false alarms?`,
      answer:
        "Dandruff, product residue, weak lighting, and rushed checks are frequent causes. Better image quality and section-based checking reduce misreads.",
    },
    {
      question: `${seed.title}: when should we escalate beyond home checks?`,
      answer:
        "Escalate when likely indicators repeat, symptoms worsen, or uncertainty remains after an improved recheck cycle.",
    },
    {
      question: `${seed.title}: is this intended for schools and family use?`,
      answer:
        "Yes. The guidance is designed for practical household and school communication while maintaining non-diagnostic boundaries.",
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
    intro: `${seed.summaryFocus} This guide is written for practical, calm decision-making and keeps a strict non-diagnostic boundary. It prioritizes evidence quality, confidence-based escalation, and clear routing to the AI scan tool, hub context, and verified clinic pathways. UK-first wording is used with US-secondary relevance where appropriate.`,
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

const allPaths = ALL_SEEDS.map((seed) => seed.path);

const contentPages = ALL_SEEDS.map((seed) => toContentPage(seed, allPaths));

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
