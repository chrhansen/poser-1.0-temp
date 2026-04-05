import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, RotateCcw, Upload, Video, Bone, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DemoStep3Props {
  onReplay: () => void;
  onClose: () => void;
}

/* ─── Output tabs ─── */

const outputTabs = [
  { id: "follow-cam", icon: Video, label: "Head Tracked", description: "Keeps the skier centered" },
  { id: "follow-cam-skeleton", icon: Bone, label: "Head Tracked + Skeleton", description: "Shows movement timing and body alignment" },
  { id: "original-skeleton", icon: Eye, label: "Original + Skeleton", description: "Compare the overlay in the original framing" },
] as const;

type OutputTabId = (typeof outputTabs)[number]["id"];

const videoByTab: Record<OutputTabId, string | null> = {
  "follow-cam": null,
  "follow-cam-skeleton": "/demo/hero-clip.mov",
  "original-skeleton": null,
};

function VideoPlaceholder({ tab }: { tab: typeof outputTabs[number] }) {
  const Icon = tab.icon;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
      <Icon className="h-12 w-12 text-primary/20" />
      <p className="text-sm font-medium text-muted-foreground">{tab.label}</p>
      <p className="max-w-[220px] text-xs text-muted-foreground/70">
        Demo video coming soon
      </p>
    </div>
  );
}

export function DemoStep3Feedback({ onReplay, onClose }: DemoStep3Props) {
  const [activeTab, setActiveTab] = useState<OutputTabId>("follow-cam-skeleton");
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoSrc = videoByTab[activeTab];
  const activeConfig = outputTabs.find((t) => t.id === activeTab)!;

  useEffect(() => {
    if (videoRef.current && videoSrc) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [activeTab, videoSrc]);

  return (
    <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
      {/* Media viewer area */}
      <div className="relative flex flex-col bg-accent/20 md:w-3/5 overflow-hidden">

        {/* Video / placeholder */}
        <div className="relative flex-1 min-h-[200px]">
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
            <VideoPlaceholder tab={activeConfig} />
          )}
        </div>
      </div>

      {/* Copy area */}
      <div className="flex flex-1 flex-col justify-between p-4 md:p-6 md:w-2/5">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Step 3
            </p>
            <h3 className="mt-1 text-xl font-bold text-foreground">
              Explore the outputs
            </h3>
          </div>

          {/* Output descriptions */}
          <div className="flex flex-col gap-2 mt-1">
            {outputTabs.map((tab, i) => (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.1 }}
                className={cn(
                  "flex items-start gap-2 rounded-lg px-3 py-2 text-xs transition-colors cursor-pointer",
                  tab.id === activeTab
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-muted/30 border border-transparent hover:bg-muted/50"
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                <div>
                  <span className="font-semibold text-foreground">{tab.label}</span>
                  <span className="text-muted-foreground"> — {tab.description}</span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-col gap-2">
          <Button
            size="lg"
            className="w-full"
            onClick={onClose}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload my clip
          </Button>

          <button
            onClick={onReplay}
            className="mt-1 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Replay demo
          </button>
        </div>
      </div>
    </div>
  );
}
