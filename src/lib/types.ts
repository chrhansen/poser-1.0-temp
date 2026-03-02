// Types for the Poser application

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  plan: "free" | "pro" | "team";
  createdAt: string;
  emailConfirmed?: boolean;
}

export interface AnalysisResult {
  id: string;
  userId: string;
  videoUrl: string;
  thumbnailUrl: string;
  status: "pending" | "processing" | "complete" | "error";
  createdAt: string;
  duration?: number; // seconds
  progress?: number; // 0-100 for processing
  failedReason?: string;
  modelUrl?: string; // optional 3D model
  scores: {
    overall: number;
    stance: number;
    balance: number;
    edging: number;
    rotation: number;
  };
  feedback: FeedbackItem[];
  embedToken?: string;
  edgeSimilarity?: number[]; // frame-level edge similarity data
}

export interface FeedbackItem {
  id: string;
  category: "stance" | "balance" | "edging" | "rotation" | "timing";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  timestamp?: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  highlighted?: boolean;
  ctaLabel: string;
}

export interface PricingFAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Release {
  id: string;
  version: string;
  date: string;
  title: string;
  description: string;
  changes: { type: "feature" | "fix" | "improvement"; text: string }[];
  tags?: string[];
}

export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  url: string;
  slug?: string;
  domain?: string;
  integrationSnippets?: {
    html: string;
    react: string;
    next: string;
  };
}

export interface MetricsData {
  totalUsers: number;
  totalAnalyses: number;
  avgScore: number;
  dailyActiveUsers: number[];
  analysesPerDay: number[];
  conversionRate: number;
}

export interface BillingInfo {
  plan: PricingPlan;
  nextBillingDate: string;
  paymentMethod?: {
    type: string;
    last4: string;
  };
  invoices: {
    id: string;
    date: string;
    amount: number;
    status: "paid" | "pending" | "failed";
  }[];
  usageCredits: number;
  usageLimit: number;
  cancelAtPeriodEnd?: boolean;
  currency: "usd" | "eur" | "gbp";
}

export interface SettingsProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  emailConfirmed: boolean;
  notifications: {
    analysisComplete: boolean;
    weeklyTips: boolean;
  };
}
