import type { ReplayOutputType } from "@/lib/types";

const shortMap: Record<ReplayOutputType, string> = {
  head_tracked: "ht",
  head_tracked_skeleton: "hts",
  original_skeleton: "os",
};

const longMap: Record<string, ReplayOutputType> = Object.fromEntries(
  Object.entries(shortMap).map(([k, v]) => [v, k as ReplayOutputType])
);

export function viewToShort(type: ReplayOutputType): string {
  return shortMap[type] ?? type;
}

export function shortToView(code: string): ReplayOutputType {
  return longMap[code] ?? (code as ReplayOutputType);
}
