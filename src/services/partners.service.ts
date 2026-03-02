import type { Partner } from "@/lib/types";
import { mockPartners } from "./mock-data";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const partnersService = {
  getPartners: async (): Promise<Partner[]> => {
    await delay(300);
    return mockPartners;
  },
};
