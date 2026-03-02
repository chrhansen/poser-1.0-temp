import type { MetricsData } from "@/lib/types";
import { mockMetrics } from "./mock-data";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// TODO_BACKEND_HOOKUP: Replace with real internal metrics API
export const metricsService = {
  getMetrics: async (): Promise<MetricsData> => {
    await delay(500);
    return mockMetrics;
  },
};
