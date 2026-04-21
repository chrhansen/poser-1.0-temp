import type { EmbedClip } from "@/lib/types";
import { mockEmbedClips, delay } from "./mock-data";

export interface ListEmbedClipsParams {
  partnerSlug?: string;          // undefined or "all" = no filter
  status?: EmbedClip["status"] | "all";
  search?: string;               // matches submitterEmail or filename (case-insensitive)
  offset?: number;
  limit?: number;
}

function matches(c: EmbedClip, p: ListEmbedClipsParams): boolean {
  if (p.partnerSlug && p.partnerSlug !== "all" && c.partnerSlug !== p.partnerSlug) return false;
  if (p.status && p.status !== "all" && c.status !== p.status) return false;
  if (p.search && p.search.trim()) {
    const q = p.search.trim().toLowerCase();
    if (!c.submitterEmail.toLowerCase().includes(q) && !c.filename.toLowerCase().includes(q)) {
      return false;
    }
  }
  return true;
}

// TODO_BACKEND_HOOKUP: Replace with real API calls
export const embedClipsService = {
  listEmbedClips: async (
    params: ListEmbedClipsParams = {}
  ): Promise<{ data: EmbedClip[]; hasMore: boolean; total: number }> => {
    await delay(300);
    const { offset = 0, limit = 20 } = params;
    const filtered = mockEmbedClips.filter((c) => matches(c, params));
    const sorted = [...filtered].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
    const page = sorted.slice(offset, offset + limit);
    return {
      data: page,
      hasMore: offset + limit < sorted.length,
      total: sorted.length,
    };
  },

  getEmbedClip: async (id: string): Promise<EmbedClip | null> => {
    await delay(250);
    return mockEmbedClips.find((c) => c.id === id) ?? null;
  },
};
