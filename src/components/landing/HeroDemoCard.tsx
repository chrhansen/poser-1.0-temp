import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Bone, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Tab config ─── */

const tabs = [
  { id: "preview", icon: Eye, label: "Preview" },
  { id: "follow-cam", icon: Video, label: "Follow Cam" },
  { id: "follow-cam-skeleton", icon: Bone, label: "Follow Cam + Skeleton" },
  { id: "original-skeleton", icon: Eye, label: "Original + Skeleton" },
] as const;

type TabId = (typeof tabs)[number]["id"];

/* ─── Callout pills that appear over the video ─── */

const calloutsByTab: Record<TabId, { label: string; position: string }[]> = {
  "preview": [],
  "follow-cam": [
    { label: "Skier tracked", position: "bottom-3 left-3" },
  ],
  "follow-cam-skeleton": [
    { label: "Skier tracked", position: "bottom-3 left-3" },
    { label: "Skeleton overlay", position: "bottom-3 right-3" },
  ],
  "original-skeleton": [
    { label: "Original clip", position: "bottom-3 left-3" },
    { label: "Skeleton overlay", position: "bottom-3 right-3" },
  ],
};

/* ─── Placeholder shown until real video is added ─── */

function VideoPlaceholder({ activeTab }: { activeTab: TabId }) {
  const activeConfig = tabs.find((t) => t.id === activeTab)!;
  const Icon = activeConfig.icon;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
      <Icon className="h-12 w-12 text-primary/20" />
      <p className="text-sm font-medium text-muted-foreground">{activeConfig.label}</p>
      <p className="max-w-[220px] text-xs text-muted-foreground/70">
        Demo video coming soon
      </p>
    </div>
  );
}

/* ─── Main component ─── */

export function HeroDemoCard() {
  const [activeTab, setActiveTab] = useState<TabId>("preview");
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoByTab: Record<TabId, string | null> = {
    "preview": null,              // TODO: add preview video path
    "follow-cam": null,           // TODO: add follow-cam video path
    "follow-cam-skeleton": "/demo/hero-clip.mov",
    "original-skeleton": null,    // TODO: add original+skeleton video path
  };

  const videoSrc = videoByTab[activeTab];

  useEffect(() => {
    if (videoRef.current && videoSrc) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [activeTab, videoSrc]);

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-border bg-secondary/30 p-1.5 md:justify-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
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

        {/* Media area */}
        <div
          className="relative aspect-video w-full bg-secondary/20"
          style={{ maxHeight: 480 }}
        >
          {videoSrc ? (
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <VideoPlaceholder activeTab={activeTab} />
          )}

          {/* Callout pills */}
          <AnimatePresence mode="wait">
            {(videoSrc ? calloutsByTab[activeTab] : []).map((pill) => (
              <motion.span
                key={pill.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  "absolute rounded-full bg-background/80 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur-sm",
                  pill.position
                )}
              >
                {pill.label}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Helper line */}
      <p className="text-center text-xs text-muted-foreground">
        Watch how Poser turns a normal ski clip into a tracked replay.
      </p>
    </div>
  );
}
