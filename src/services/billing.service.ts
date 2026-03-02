import type { BillingInfo } from "@/lib/types";
import { mockBilling } from "./mock-data";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// TODO_STRIPE_HOOKUP: Replace with real Stripe billing API
export const billingService = {
  getBillingInfo: async (): Promise<BillingInfo> => {
    await delay(400);
    return mockBilling;
  },

  createCheckoutSession: async (_planId: string): Promise<{ url: string }> => {
    // TODO_STRIPE_HOOKUP
    await delay(500);
    return { url: "#" };
  },

  createPortalSession: async (): Promise<{ url: string }> => {
    // TODO_STRIPE_HOOKUP
    await delay(500);
    return { url: "#" };
  },
};
