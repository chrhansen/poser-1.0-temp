// Types for the Poser application

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  plan: "free" | "pro" | "team";
  createdAt: string;
}

export interface AnalysisResult {
  id: string;
  userId: string;
  videoUrl: string;
  thumbnailUrl: string;
  status: "processing" | "complete" | "error";
  createdAt: string;
  scores: {
    overall: number;
    stance: number;
    balance: number;
    edging: number;
    rotation: number;
  };
  feedback: FeedbackItem[];
  embedToken?: string;
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

export interface Release {
  id: string;
  version: string;
  date: string;
  title: string;
  description: string;
  changes: { type: "feature" | "fix" | "improvement"; text: string }[];
}

export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  url: string;
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
}
