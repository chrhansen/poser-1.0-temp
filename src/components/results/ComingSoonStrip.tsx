import { cn } from "@/lib/utils";

const items = [
  "SkiRank",
  "Per-turn analysis",
  "Balance",
  "Pressure",
  "Edging",
  "Steering",
];

interface ComingSoonStripProps {
  className?: string;
}

export function ComingSoonStrip({ className }: ComingSoonStripProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Coming soon
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
