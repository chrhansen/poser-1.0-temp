import { useState } from "react";
import type { ReplayOutput, ReplayOutputType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Video, Bone } from "lucide-react";

const outputIcons: Record<ReplayOutputType, React.ElementType> = {
  follow_cam: Video,
  follow_cam_skeleton: Bone,
  original_skeleton: Video,
};

interface ReplayViewerProps {
  outputs: ReplayOutput[];
}

export function ReplayViewer({ outputs }: ReplayViewerProps) {
  const availableOutputs = outputs.filter((o) => o.available);

  const [activeTab, setActiveTab] = useState(
    availableOutputs.find((o) => o.type === "follow_cam_skeleton")?.type
    ?? availableOutputs[0]?.type
    ?? "follow_cam"
  );

  if (availableOutputs.length === 0) return null;

  const current = availableOutputs.find((t) => t.type === activeTab) ?? availableOutputs[0];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Tab bar — scrollable on mobile */}
      <div className="flex gap-1 overflow-x-auto border-b border-border bg-secondary/30 p-1.5">
        {availableOutputs.map((tab) => {
          const Icon = outputIcons[tab.type] ?? Video;
          const isActive = tab.type === activeTab;
          return (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Viewer area */}
      <div className="relative flex aspect-video items-center justify-center bg-secondary/20">
        <div className="flex flex-col items-center gap-3 text-center">
          <Video className="h-12 w-12 text-muted-foreground/50" />
          <p className="text-sm font-medium text-foreground">{current.label}</p>
          <p className="max-w-xs text-xs text-muted-foreground">{current.description}</p>
        </div>
      </div>
    </div>
  );
}
