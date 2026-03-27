import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Video, Bone, Play, Download } from "lucide-react";
import type { ReplayOutputType } from "@/lib/types";

const outputIcons: Record<string, React.ElementType> = {
  follow_cam: Video,
  follow_cam_skeleton: Bone,
  original_skeleton: Video,
};

interface OutputCardProps {
  type: string;
  label: string;
  description: string;
  isSelected?: boolean;
  onOpen?: () => void;
}

export function OutputCard({ type, label, description, isSelected, onOpen }: OutputCardProps) {
  const Icon = outputIcons[type] ?? Video;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-4 transition-all cursor-pointer",
        isSelected
          ? "border-primary/40 bg-accent/30 shadow-sm"
          : "border-border bg-card hover:border-primary/20 hover:shadow-sm"
      )}
      onClick={onOpen}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{description}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onOpen}>
          <Play className="mr-1 h-3 w-3" /> Open
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs">
          <Download className="mr-1 h-3 w-3" /> Download
        </Button>
      </div>
    </div>
  );
}
