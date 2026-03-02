import type { BillingInfo } from "@/lib/types";
import { mockBilling, delay } from "./mock-data";

// TODO_STRIPE_HOOKUP: Replace with real Stripe billing API
export const billingService = {
  getBillingInfo: async (): Promise<BillingInfo> => {
    await delay(400);
    return mockBilling;
  },

  createCheckoutSession: async (_planId: string): Promise<{ url: string }> => {
    // TODO_STRIPE_HOOKUP: Create Stripe Checkout session
    await delay(500);
    return { url: "#" };
  },

  createPortalSession: async (): Promise<{ url: string }> => {
    // TODO_STRIPE_HOOKUP: Create Stripe Customer Portal session
    await delay(500);
    return { url: "#" };
  },

  cancelSubscription: async (): Promise<void> => {
    // TODO_STRIPE_HOOKUP: Cancel subscription at period end
    await delay(500);
  },

  resumeSubscription: async (): Promise<void> => {
    // TODO_STRIPE_HOOKUP: Resume cancelled subscription
    await delay(500);
  },
};
