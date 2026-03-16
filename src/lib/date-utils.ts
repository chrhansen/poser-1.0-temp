const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Format a date with short month name.
 * e.g. "Feb 14, 2026"
 */
export function formatDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/**
 * Format a full absolute timestamp for tooltips.
 * e.g. "Feb 14, 2026 at 14:32"
 */
export function formatAbsoluteTimestamp(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${formatDate(d)} at ${time}`;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const RELATIVE_THRESHOLD = 14 * DAY; // 2 weeks

/**
 * Returns a relative string for recent dates (< 2 weeks),
 * or a short absolute date for older ones.
 */
export function formatRelativeDate(input: string | Date): { text: string; isRelative: boolean } {
  const d = typeof input === "string" ? new Date(input) : input;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (diff < 0 || diff >= RELATIVE_THRESHOLD) {
    return { text: formatDate(d), isRelative: false };
  }

  if (diff < MINUTE) return { text: "Just now", isRelative: true };
  if (diff < HOUR) {
    const mins = Math.floor(diff / MINUTE);
    return { text: `${mins}m ago`, isRelative: true };
  }
  if (diff < DAY) {
    const hrs = Math.floor(diff / HOUR);
    return { text: `${hrs}h ago`, isRelative: true };
  }

  const days = Math.floor(diff / DAY);
  if (days === 1) return { text: "Yesterday", isRelative: true };
  return { text: `${days}d ago`, isRelative: true };
}
