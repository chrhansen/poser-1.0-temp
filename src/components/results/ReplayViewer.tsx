import { useState, useEffect } from "react";
import type { ReplayOutput, ReplayOutputType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Video, Bone } from "lucide-react";
import { ReplayPlayer } from "./ReplayPlayer";

const outputIcons: Record<ReplayOutputType, React.ElementType> = {
  head_tracked: Video,
  head_tracked_skeleton: Bone,
  original_skeleton: Video,
};

interface ReplayViewerProps {
  outputs: ReplayOutput[];
  activeTab?: ReplayOutputType;
  onTabChange?: (tab: ReplayOutputType) => void;
}

export function ReplayViewer({ outputs, activeTab: controlledTab, onTabChange }: ReplayViewerProps) {
  const availableOutputs = outputs.filter((o) => o.available);

  const defaultTab =
    availableOutputs.find((o) => o.type === "head_tracked_skeleton")?.type
    ?? availableOutputs[0]?.type
    ?? "head_tracked";

  const [internalTab, setInternalTab] = useState<ReplayOutputType>(controlledTab ?? defaultTab);

  // Sync with controlled prop
  useEffect(() => {
    if (controlledTab) setInternalTab(controlledTab);
  }, [controlledTab]);

  const activeType = controlledTab ?? internalTab;

  const handleTabChange = (tab: ReplayOutputType) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  if (availableOutputs.length === 0) return null;

  const current = availableOutputs.find((t) => t.type === activeType) ?? availableOutputs[0];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Tab bar — scrollable on mobile */}
      <div className="flex gap-1 overflow-x-auto border-b border-border bg-secondary/30 p-1.5">
        {availableOutputs.map((tab) => {
          const Icon = outputIcons[tab.type] ?? Video;
          const isActive = tab.type === activeType;
          return (
            <button
              key={tab.type}
              onClick={() => handleTabChange(tab.type)}
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
      <ReplayPlayer
        src={current.url}
        placeholderLabel={current.label}
        placeholderDescription={current.description}
      />
    </div>
  );
}
