import toolkitContent from "@/content/pages/school-toolkit.json";

export interface SchoolToolkitAsset {
  id: string;
  title: string;
  type: "policy_template" | "parent_notice" | "escalation_tracker" | "staff_briefing" | "printable_poster";
  format: "docx" | "pptx";
  href: string;
}

export interface SchoolToolkitContent {
  title: string;
  intro: string;
  audiences: string[];
  highlights: string[];
  faq: Array<{ question: string; answer: string }>;
}

// Canonical manifest for all framework files shipped in /public/downloads/schools.
const assets: SchoolToolkitAsset[] = [
  {
    id: "policy-guidance-template-docx",
    title: "Policy Template",
    type: "policy_template",
    format: "docx",
    href: "/downloads/schools/policy-guidance-template.docx",
  },
  {
    id: "parent-communication-notice-docx",
    title: "Parent Notice Template",
    type: "parent_notice",
    format: "docx",
    href: "/downloads/schools/parent-communication-notice.docx",
  },
  {
    id: "escalation-tracker-docx",
    title: "Escalation Tracker",
    type: "escalation_tracker",
    format: "docx",
    href: "/downloads/schools/escalation-tracker.docx",
  },
  {
    id: "staff-briefing-framework-pptx",
    title: "Staff Briefing Slides",
    type: "staff_briefing",
    format: "pptx",
    href: "/downloads/schools/The%20Head%20Lice%20School%20Response%20Framework%E2%84%A2%20Staff%20Briefing.pptx",
  },
  {
    id: "staff-briefing-professional-pptx",
    title: "Staff Briefing Slides (Professional Briefing)",
    type: "staff_briefing",
    format: "pptx",
    href: "/downloads/schools/Head%20Lice%20Management%20Professional%20Briefing%20for%20School%20Staff.pptx",
  },
  {
    id: "school-family-guidance-pptx",
    title: "Printable Poster",
    type: "printable_poster",
    format: "pptx",
    href: "/downloads/schools/Head%20Lice%20Checker%20School%20%26%20Family%20Guidance.pptx",
  },
  {
    id: "modern-school-family-guidance-pptx",
    title: "Printable Poster (Modern Layout)",
    type: "printable_poster",
    format: "pptx",
    href: "/downloads/schools/Head%20Lice%20Checker%20Modern%20School%20%26%20Family%20Guidance.pptx",
  },
  {
    id: "quick-check-poster-docx",
    title: "Quick Check Poster",
    type: "printable_poster",
    format: "docx",
    href: "/downloads/schools/quick-check-poster.docx",
  },
];

export function getSchoolToolkitAssets(): SchoolToolkitAsset[] {
  return assets.slice();
}

export function getSchoolToolkitContent(): SchoolToolkitContent {
  return toolkitContent as SchoolToolkitContent;
}
