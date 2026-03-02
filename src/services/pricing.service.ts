import type { PricingPlan, PricingFAQ } from "@/lib/types";
import { mockPricingPlans, mockPricingFAQs } from "./mock-data";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// TODO_STRIPE_HOOKUP: Replace with real Stripe pricing API
export const pricingService = {
  getPlans: async (): Promise<PricingPlan[]> => {
    await delay(300);
    return mockPricingPlans;
  },

  getFAQs: async (): Promise<PricingFAQ[]> => {
    await delay(200);
    return mockPricingFAQs;
  },
};
