import type { AnalysisResult } from "@/lib/types";
import { mockResults } from "./mock-data";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const ALLOWED_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const MAX_SIZE_MB = 100;

export interface UploadValidation {
  valid: boolean;
  error?: string;
}

export type SkierPosition = "left" | "center" | "right";

// TODO_BACKEND_HOOKUP: Replace all methods with real API calls
export const analysisService = {
  validateFile: (file: File): UploadValidation => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: "Please upload an MP4, MOV, or WebM file." };
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return { valid: false, error: `File must be under ${MAX_SIZE_MB}MB.` };
    }
    return { valid: true };
  },

  uploadClip: async (
    _file: File,
    _skierPosition: SkierPosition,
    _onProgress?: (pct: number) => void
  ): Promise<{ id: string }> => {
    // TODO_BACKEND_HOOKUP: Upload to storage, trigger analysis pipeline
    for (let i = 0; i <= 100; i += 10) {
      await delay(200);
      _onProgress?.(i);
    }
    return { id: "res_1" };
  },

  getResult: async (id: string): Promise<AnalysisResult | null> => {
    await delay(400);
    return mockResults.find((r) => r.id === id) ?? mockResults[0] ?? null;
  },

  getResults: async (): Promise<AnalysisResult[]> => {
    await delay(400);
    return mockResults;
  },

  getEmbedResult: async (_token: string): Promise<AnalysisResult | null> => {
    await delay(400);
    return mockResults[0] ?? null;
  },
};
