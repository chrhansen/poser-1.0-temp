import { useState } from "react";
import type { ReplayOutput, ReplayOutputType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Video, Bone, Box } from "lucide-react";

const outputIcons: Record<ReplayOutputType, React.ElementType> = {
  follow_cam: Video,
  follow_cam_skeleton: Bone,
  original_skeleton: Video,
};

interface ReplayViewerProps {
  outputs: ReplayOutput[];
  hasModel?: boolean;
}

export function ReplayViewer({ outputs, hasModel }: ReplayViewerProps) {
  const availableOutputs = outputs.filter((o) => o.available);
  const allTabs = [
    ...availableOutputs,
    ...(hasModel
      ? [
          {
            type: "3d_model" as const,
            label: "3D Model",
            description: "An interactive 3D replay of the skier's body motion.",
            available: true,
          },
        ]
      : []),
  ];

  const [activeTab, setActiveTab] = useState(allTabs[1]?.type ?? allTabs[0]?.type ?? "follow_cam");

  if (allTabs.length === 0) return null;

  const current = allTabs.find((t) => t.type === activeTab) ?? allTabs[0];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto border-b border-border bg-secondary/30 p-1.5">
        {allTabs.map((tab) => {
          const Icon = tab.type === "3d_model" ? Box : outputIcons[tab.type as ReplayOutputType] ?? Video;
          const isActive = tab.type === activeTab;
          return (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type as ReplayOutputType | "3d_model")}
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
        {current.type === "3d_model" ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <Box className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">3D body model viewer</p>
            <p className="text-xs text-muted-foreground/60">Interactive replay coming soon</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <Video className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm font-medium text-foreground">{current.label}</p>
            <p className="max-w-xs text-xs text-muted-foreground">{current.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
