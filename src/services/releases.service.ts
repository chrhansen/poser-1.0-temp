import type { Release } from "@/lib/types";
import { mockReleases } from "./mock-data";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const releasesService = {
  getReleases: async (): Promise<Release[]> => {
    await delay(300);
    return mockReleases;
  },
};
