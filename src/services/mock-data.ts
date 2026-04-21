import type {
  User,
  AnalysisResult,
  PricingPlan,
  PricingFAQ,
  Release,
  Partner,
  MetricsData,
  BillingInfo,
  SettingsProfile,
  ReplayOutput,
  EmbedClip,
} from "@/lib/types";
import { generateMockMetrics } from "./mock-metrics";

export const serviceConfig = {
  useMockData: true,
  apiBaseUrl: "/api",
} as const;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
export { delay };

// ─── Default replay outputs for complete results ────────────────────────────
const defaultReplayOutputs: ReplayOutput[] = [
  { type: "head_tracked", label: "Head Tracked", description: "A tracked replay that keeps the skier centered.", available: true },
  { type: "head_tracked_skeleton", label: "Head Tracked + Skeleton", description: "A tracked replay with pose overlay to show movement timing and body alignment.", available: true },
  { type: "original_skeleton", label: "Original + Skeleton", description: "The original camera view with pose overlay.", available: true },
];


// ─── Users ──────────────────────────────────────────────────────────────────
export const mockUser: User = {
  id: "usr_1",
  email: "alex@example.com",
  name: "Alex Chen",
  avatarUrl: undefined,
  plan: "pro",
  createdAt: "2025-11-01T00:00:00Z",
  emailConfirmed: true,
};

// ─── Analysis Results ───────────────────────────────────────────────────────
// Frame counts derived from duration * 30fps
export const mockResults: AnalysisResult[] = [
  {
    id: "res_1",
    userId: "usr_1",
    videoUrl: "",
    thumbnailUrl: "",
    status: "complete",
    createdAt: "2026-03-15T10:00:00Z",
    duration: 14,
    clipLength: 26,
    metrics: generateMockMetrics(14 * 30, 42),
    embedToken: "tok_abc123",
    filename: "morning-run-grindelwald.mp4",
    replayOutputs: defaultReplayOutputs,
  },
  {
    id: "res_2",
    userId: "usr_1",
    videoUrl: "",
    thumbnailUrl: "",
    status: "processing",
    createdAt: "2026-03-01T14:30:00Z",
    duration: 22,
    clipLength: 34,
    progress: 42,
    filename: "powder-day-verbier.mp4",
  },
  {
    id: "res_3",
    userId: "usr_1",
    videoUrl: "",
    thumbnailUrl: "",
    status: "error",
    createdAt: "2026-03-16T09:15:00Z",
    duration: 8,
    clipLength: 15,
    failedReason: "Video quality too low for reliable analysis. Please upload a higher resolution clip.",
    filename: "foggy-clip.mp4",
  },
  {
    id: "res_4",
    userId: "usr_1",
    videoUrl: "",
    thumbnailUrl: "",
    status: "pending",
    createdAt: "2026-03-02T08:00:00Z",
    clipLength: 20,
    filename: "steep-section-zermatt.mp4",
  },
  {
    id: "res_5",
    userId: "usr_1",
    videoUrl: "",
    thumbnailUrl: "",
    status: "complete",
    createdAt: "2026-02-20T16:45:00Z",
    duration: 18,
    clipLength: 30,
    metrics: generateMockMetrics(18 * 30, 99),
    embedToken: "tok_def456",
    filename: "carving-practice.mp4",
    replayOutputs: [
      ...defaultReplayOutputs,
    ],
  },
];
// ─── Pricing ────────────────────────────────────────────────────────────────
export const mockPricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "one-time",
    features: ["3 free clips", "Head Tracked replay", "Skeleton overlay views", "Download MP4 outputs"],
    ctaLabel: "Try for free",
  },
  {
    id: "pro",
    name: "Trip Pack",
    price: 19,
    interval: "one-time",
    features: ["5 clips", "Head Tracked replay", "Skeleton overlay views", "Download MP4 outputs"],
    highlighted: true,
    ctaLabel: "Buy trip pack",
  },
];

export const mockPricingFAQs: PricingFAQ[] = [
  {
    id: "faq1",
    question: "What kind of ski clip works best?",
    answer:
      "The skier should be as clear as possible with a steady camera. If you can see all parts of the skier clearly, so can Poser.",
  },
  { id: "faq2", question: "How long does processing take?", answer: "1–2 minutes per clip." },
  { id: "faq3", question: "Do I need sensors or special hardware?", answer: "No, we just need a video clip." },
  { id: "faq4", question: "Can I upload from my phone?", answer: "Yes." },
  {
    id: "faq5",
    question: "What happens if multiple skiers are in frame?",
    answer: "No worries, just tap the right skier and Poser will track the correct skier through the clip.",
  },
  { id: "faq6", question: "Can I try a demo first?", answer: "YES_DEMO_LINK" },
];

// ─── Releases ───────────────────────────────────────────────────────────────
export const mockReleases: Release[] = [
  {
    id: "rel_1",
    version: "2.4.0",
    date: "2026-02-25",
    title: "Improved Edge Detection",
    description: "Major improvements to ski edge angle detection accuracy.",
    tags: ["ai", "analysis"],
    changes: [
      { type: "feature", text: "New edge angle measurement algorithm" },
      { type: "improvement", text: "30% faster video processing" },
      { type: "fix", text: "Fixed score display rounding on results page" },
    ],
  },
  {
    id: "rel_2",
    version: "2.3.0",
    date: "2026-02-10",
    title: "Team Features",
    description: "Collaboration tools for coaches and teams.",
    tags: ["teams", "collaboration"],
    changes: [
      { type: "feature", text: "Team workspaces with shared analyses" },
      { type: "feature", text: "Coach annotation tools" },
      { type: "improvement", text: "Updated results sharing UI" },
    ],
  },
  {
    id: "rel_3",
    version: "2.2.0",
    date: "2026-01-20",
    title: "Embed Widget",
    description: "Embeddable results for partner integrations.",
    tags: ["partners", "embed"],
    changes: [
      { type: "feature", text: "Embeddable result widget for websites" },
      { type: "feature", text: "Partner API keys" },
      { type: "fix", text: "Fixed video playback on Safari" },
    ],
  },
  {
    id: "rel_4",
    version: "2.1.0",
    date: "2026-01-05",
    title: "Progress Tracking",
    description: "Track your improvement over time.",
    tags: ["analysis"],
    changes: [
      { type: "feature", text: "Score history graph" },
      { type: "improvement", text: "Redesigned dashboard layout" },
    ],
  },
];

// ─── Partners ───────────────────────────────────────────────────────────────
export const mockPartners: Partner[] = [
  {
    id: "p1",
    name: "Alpine Academy",
    logoUrl: "",
    description: "Professional ski instruction across the Alps.",
    url: "https://alpineacademy.example.com",
    slug: "alpine-academy",
    domain: "alpineacademy.example.com",
    integrationSnippets: {
      html: `<iframe src="https://poser.app/embed/results/TOKEN" width="400" height="600" frameborder="0"></iframe>`,
      react: `import { PoserEmbed } from '@poser/react';\n\nexport default function Results() {\n  return <PoserEmbed token="TOKEN" />;\n}`,
      next: `import { PoserEmbed } from '@poser/react';\n\nexport default function ResultsPage() {\n  return (\n    <main>\n      <PoserEmbed token="TOKEN" />\n    </main>\n  );\n}`,
    },
  },
  {
    id: "p2",
    name: "FIL ALPIN",
    logoUrl: "",
    description: "French ski school network.",
    url: "https://filalpin.example.com",
    slug: "fil-alpin",
    domain: "filalpin.example.com",
    integrationSnippets: {
      html: `<iframe src="https://poser.app/embed/results/TOKEN" width="400" height="600" frameborder="0"></iframe>`,
      react: `import { PoserEmbed } from '@poser/react';\n\nexport default function Results() {\n  return <PoserEmbed token="TOKEN" />;\n}`,
      next: `import { PoserEmbed } from '@poser/react';\n\nexport default function ResultsPage() {\n  return (\n    <main>\n      <PoserEmbed token="TOKEN" />\n    </main>\n  );\n}`,
    },
  },
];

// ─── Metrics ────────────────────────────────────────────────────────────────
export const mockMetrics: MetricsData = {
  totalUsers: 12847,
  totalAnalyses: 48293,
  avgScore: 72.4,
  conversionRate: 0.084,
  dailyActiveUsers: [320, 345, 310, 380, 420, 390, 410],
  analysesPerDay: [180, 210, 195, 240, 280, 260, 275],
};

// ─── Billing ────────────────────────────────────────────────────────────────
export const mockBilling: BillingInfo = {
  currentPack: mockPricingPlans[1], // Trip Pack
  analysesUsed: 3,
  analysesTotal: 8, // 3 free + 5 from Trip Pack
  purchases: [{ id: "pur_1", date: "2026-02-15", packName: "Trip Pack", amount: 19, analyses: 5 }],
};

// ─── Settings ───────────────────────────────────────────────────────────────
export const mockProfile: SettingsProfile = {
  name: "Alex Chen",
  username: "alexchen",
  email: "alex@example.com",
  bio: "",
  avatarUrl: undefined,
  emailConfirmed: true,
  notifications: {
    analysisComplete: true,
    weeklyTips: false,
  },
};

// ─── Embed Clips (admin monitoring) ─────────────────────────────────────────

const embedSubmitterEmails = [
  "lara.weber@guest.example",
  "marc.dupont@guest.example",
  "sofia.rossi@guest.example",
  "tom.muller@guest.example",
  "ines.garcia@guest.example",
  "jakob.lindgren@guest.example",
  "amelie.fontaine@guest.example",
  "noah.kim@guest.example",
  "clara.hofer@guest.example",
  "leo.bianchi@guest.example",
];

const embedFilenames = [
  "lesson-clip.mp4",
  "morning-warmup.mov",
  "blue-run.mp4",
  "carving-attempt.mp4",
  "moguls-take2.mov",
  "first-day.mp4",
  "afternoon-session.mp4",
  "video-export.mp4",
  "ski-clip.mp4",
  "powder-day.mov",
];

function makeEmbedClip(
  i: number,
  partner: Partner,
  status: EmbedClip["status"]
): EmbedClip {
  const submittedAt = new Date(Date.now() - i * 1000 * 60 * 60 * 6).toISOString();
  const clipLength = 18 + (i % 12);
  const trimStart = i % 5;
  const trimEnd = trimStart + Math.min(20, clipLength - trimStart);
  const result: AnalysisResult | undefined =
    status === "complete"
      ? {
          id: `embed_res_${i}`,
          userId: "embed",
          videoUrl: "",
          thumbnailUrl: "",
          status: "complete",
          createdAt: submittedAt,
          duration: trimEnd - trimStart,
          clipLength,
          metrics: generateMockMetrics((trimEnd - trimStart) * 30, 30 + i),
          embedToken: `tok_embed_${i}`,
          filename: embedFilenames[i % embedFilenames.length],
          replayOutputs: defaultReplayOutputs,
        }
      : undefined;
  return {
    id: `ec_${i}`,
    partnerSlug: partner.slug ?? "unknown",
    partnerName: partner.name,
    partnerDomain: partner.domain ?? "",
    submitterEmail: embedSubmitterEmails[i % embedSubmitterEmails.length],
    filename: embedFilenames[i % embedFilenames.length],
    submittedAt,
    status,
    clipLength,
    trimStart,
    trimEnd,
    fileSize: (8 + (i % 25)) * 1024 * 1024,
    fileType: "video/mp4",
    failedReason:
      status === "error"
        ? "Skier could not be tracked through the full clip. Try a steadier camera and clearer view."
        : undefined,
    progress: status === "processing" ? 25 + ((i * 7) % 60) : undefined,
    result,
  };
}

const _statusCycle: EmbedClip["status"][] = [
  "complete", "complete", "complete", "complete",
  "processing", "pending", "complete", "error",
  "complete", "complete", "processing", "complete",
];

export const mockEmbedClips: EmbedClip[] = Array.from({ length: 26 }, (_, i) => {
  const partner = mockPartners[i % mockPartners.length];
  const status = _statusCycle[i % _statusCycle.length];
  return makeEmbedClip(i, partner, status);
});
