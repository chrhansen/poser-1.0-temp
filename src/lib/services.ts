import type {
  User,
  AnalysisResult,
  PricingPlan,
  Release,
  Partner,
  MetricsData,
  BillingInfo,
} from "./types";

// ─── Mock Data ──────────────────────────────────────────────────────────────

const mockUser: User = {
  id: "usr_1",
  email: "alex@example.com",
  name: "Alex Chen",
  plan: "pro",
  createdAt: "2025-11-01T00:00:00Z",
};

const mockResults: AnalysisResult[] = [
  {
    id: "res_1",
    userId: "usr_1",
    videoUrl: "",
    thumbnailUrl: "",
    status: "complete",
    createdAt: "2026-02-28T10:00:00Z",
    scores: { overall: 78, stance: 82, balance: 74, edging: 80, rotation: 71 },
    feedback: [
      { id: "f1", category: "stance", severity: "warning", title: "Slightly narrow stance", description: "Widen your stance to hip-width for better stability at higher speeds." },
      { id: "f2", category: "balance", severity: "critical", title: "Weight too far back", description: "Shift weight forward over the center of your boots, especially during turn initiation." },
      { id: "f3", category: "edging", severity: "info", title: "Good edge engagement", description: "Solid edge angles on carving turns. Maintain this pressure through the turn finish." },
    ],
    embedToken: "tok_abc123",
  },
  {
    id: "res_2",
    userId: "usr_1",
    videoUrl: "",
    thumbnailUrl: "",
    status: "processing",
    createdAt: "2026-03-01T14:30:00Z",
    scores: { overall: 0, stance: 0, balance: 0, edging: 0, rotation: 0 },
    feedback: [],
  },
];

const mockPricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "month",
    features: ["1 analysis per month", "Basic feedback", "720p video support"],
    ctaLabel: "Get started",
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    interval: "month",
    features: ["Unlimited analyses", "Detailed feedback", "4K video support", "Frame-by-frame breakdown", "Progress tracking", "Priority processing"],
    highlighted: true,
    ctaLabel: "Start free trial",
  },
  {
    id: "team",
    name: "Team",
    price: 49,
    interval: "month",
    features: ["Everything in Pro", "5 team members", "Coaching tools", "Embeddable results", "API access", "Dedicated support"],
    ctaLabel: "Contact sales",
  },
];

const mockReleases: Release[] = [
  {
    id: "rel_1",
    version: "2.4.0",
    date: "2026-02-25",
    title: "Improved Edge Detection",
    description: "Major improvements to ski edge angle detection accuracy.",
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
    changes: [
      { type: "feature", text: "Team workspaces with shared analyses" },
      { type: "feature", text: "Coach annotation tools" },
      { type: "improvement", text: "Updated results sharing UI" },
    ],
  },
];

const mockPartners: Partner[] = [
  { id: "p1", name: "Alpine Academy", logoUrl: "", description: "Professional ski instruction across the Alps.", url: "#" },
  { id: "p2", name: "SkiTech Labs", logoUrl: "", description: "R&D partner for motion capture technology.", url: "#" },
  { id: "p3", name: "Mountain Sports Co.", logoUrl: "", description: "Premium ski equipment and apparel.", url: "#" },
];

const mockMetrics: MetricsData = {
  totalUsers: 12847,
  totalAnalyses: 48293,
  avgScore: 72.4,
  conversionRate: 0.084,
  dailyActiveUsers: [320, 345, 310, 380, 420, 390, 410],
  analysesPerDay: [180, 210, 195, 240, 280, 260, 275],
};

const mockBilling: BillingInfo = {
  plan: mockPricingPlans[1],
  nextBillingDate: "2026-04-01",
  paymentMethod: { type: "visa", last4: "4242" },
  invoices: [
    { id: "inv_1", date: "2026-03-01", amount: 19, status: "paid" },
    { id: "inv_2", date: "2026-02-01", amount: 19, status: "paid" },
  ],
};

// ─── Service Layer (stubs) ──────────────────────────────────────────────────

// TODO_BACKEND_HOOKUP: Replace mock implementations with real API calls

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const authService = {
  getCurrentUser: async (): Promise<User | null> => {
    await delay(300);
    return mockUser;
  },
  signIn: async (_email: string, _password: string): Promise<User> => {
    // TODO_BACKEND_HOOKUP
    await delay(500);
    return mockUser;
  },
  signOut: async (): Promise<void> => {
    // TODO_BACKEND_HOOKUP
    await delay(200);
  },
  confirmEmail: async (_token: string): Promise<boolean> => {
    // TODO_BACKEND_HOOKUP
    await delay(500);
    return true;
  },
};

export const analysisService = {
  getResult: async (id: string): Promise<AnalysisResult | null> => {
    await delay(400);
    return mockResults.find((r) => r.id === id) ?? mockResults[0];
  },
  getResults: async (): Promise<AnalysisResult[]> => {
    await delay(400);
    return mockResults;
  },
  getEmbedResult: async (_token: string): Promise<AnalysisResult | null> => {
    await delay(400);
    return mockResults[0];
  },
  uploadClip: async (_file: File): Promise<{ id: string }> => {
    // TODO_BACKEND_HOOKUP
    await delay(1000);
    return { id: "res_new" };
  },
};

export const pricingService = {
  getPlans: async (): Promise<PricingPlan[]> => {
    await delay(300);
    return mockPricingPlans;
  },
};

export const releasesService = {
  getReleases: async (): Promise<Release[]> => {
    await delay(300);
    return mockReleases;
  },
};

export const partnersService = {
  getPartners: async (): Promise<Partner[]> => {
    await delay(300);
    return mockPartners;
  },
};

export const metricsService = {
  getMetrics: async (): Promise<MetricsData> => {
    // TODO_BACKEND_HOOKUP
    await delay(500);
    return mockMetrics;
  },
};

export const billingService = {
  getBillingInfo: async (): Promise<BillingInfo> => {
    // TODO_STRIPE_HOOKUP
    await delay(400);
    return mockBilling;
  },
  createCheckoutSession: async (_planId: string): Promise<{ url: string }> => {
    // TODO_STRIPE_HOOKUP
    await delay(500);
    return { url: "#" };
  },
};
