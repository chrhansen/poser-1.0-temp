import type { AnalysisResult } from "@/lib/types";
import { mockResults, delay } from "./mock-data";

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
    return mockResults.find((r) => r.id === id) ?? null;
  },

  getResults: async (): Promise<AnalysisResult[]> => {
    await delay(400);
    return mockResults;
  },

  getEmbedResult: async (_token: string): Promise<AnalysisResult | null> => {
    await delay(400);
    return mockResults[0] ?? null;
  },

  deleteResult: async (_id: string): Promise<void> => {
    // TODO_BACKEND_HOOKUP: Delete analysis from database
    await delay(300);
  },

  rerunAnalysis: async (_id: string): Promise<{ id: string }> => {
    // TODO_BACKEND_HOOKUP: Re-trigger analysis pipeline
    await delay(500);
    return { id: _id };
  },

  pollResult: async (id: string): Promise<AnalysisResult | null> => {
    // TODO_BACKEND_HOOKUP: Poll for analysis status updates
    await delay(1500);
    // In mock mode, simulate progress advancement
    const result = mockResults.find((r) => r.id === id);
    if (result && result.status === "processing") {
      return { ...result, progress: Math.min((result.progress ?? 0) + 15, 95) };
    }
    return result ?? null;
  },
};
