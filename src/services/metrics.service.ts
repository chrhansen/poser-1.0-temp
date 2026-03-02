import type { MetricsData, AnalysisResult } from "@/lib/types";
import { mockMetrics, mockResults } from "./mock-data";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// TODO_BACKEND_HOOKUP: Replace with real internal metrics API (admin only)
export const metricsService = {
  getMetrics: async (): Promise<MetricsData> => {
    await delay(500);
    return mockMetrics;
  },

  getAnalysisById: async (id: string): Promise<AnalysisResult | null> => {
    await delay(300);
    return mockResults.find((r) => r.id === id) ?? null;
  },

  getAnalysisByToken: async (token: string): Promise<AnalysisResult | null> => {
    await delay(300);
    return mockResults.find((r) => r.embedToken === token) ?? null;
  },

  rerunAnalysis: async (_id: string): Promise<void> => {
    // TODO_BACKEND_HOOKUP: Rerun analysis pipeline (admin)
    await delay(500);
  },
};
