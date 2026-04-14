import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrimStep } from "./TrimStep";
import { SkierSelectStep } from "./SkierSelectStep";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { SkierBbox } from "@/services/embed-api.service";

/* ─── Types ─── */

export interface VideoSkierSelectResult {
  trimStart: number;
  trimEnd: number;
  bbox: SkierBbox;
  objectId: number;
  normalizedTime: number;
}

type Step = "loading" | "trim" | "select";

interface VideoSkierSelectProps {
  file: File;
  maxTrimSeconds?: number;
  /** Called when user wants to cancel/clear the clip entirely */
  onCancel?: () => void;
  children: (props: { selected: boolean; getResult: () => VideoSkierSelectResult }) => React.ReactNode;
}

/* ─── Component ─── */

export function VideoSkierSelect({
  file,
  maxTrimSeconds = 20,
  onCancel,
  children,
}: VideoSkierSelectProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [step, setStep] = useState<Step>("loading");
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [selection, setSelection] = useState<{ x: number; y: number } | null>(null);

  // Object URL
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Read duration
  useEffect(() => {
    if (!videoUrl) return;
    const v = document.createElement("video");
    v.src = videoUrl;
    v.preload = "metadata";
    const onMeta = () => {
      const dur = v.duration;
      setDuration(dur);
      if (dur <= maxTrimSeconds) {
        setTrimStart(0);
        setTrimEnd(dur);
        setStep("select");
      } else {
        setTrimStart(0);
        setTrimEnd(maxTrimSeconds);
        setStep("trim");
      }
    };
    v.addEventListener("loadedmetadata", onMeta, { once: true });
    return () => { v.removeEventListener("loadedmetadata", onMeta); v.src = ""; };
  }, [videoUrl, maxTrimSeconds]);

  const needsTrim = duration > maxTrimSeconds;
  const totalSteps = needsTrim ? 2 : 1;
  const currentStepNum = step === "trim" ? 1 : needsTrim ? 2 : 1;

  const handleTrimConfirm = (start: number, end: number) => {
    setTrimStart(start);
    setTrimEnd(end);
    setSelection(null);
    setStep("select");
  };

  const getResult = (): VideoSkierSelectResult => {
    const bbox: SkierBbox = selection
      ? { x1: selection.x - 0.05, y1: selection.y - 0.1, x2: selection.x + 0.05, y2: selection.y + 0.1 }
      : { x1: 0, y1: 0, x2: 1, y2: 1 };
    return { trimStart, trimEnd, bbox, objectId: 1, normalizedTime: 0 };
  };

  if (step === "loading" || !videoUrl) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground animate-pulse">
        Loading video…
      </div>
    );
  }

  const stepTitle = step === "trim" ? "Choose the best 20 seconds" : "Who should we analyze?";
  const stepHint = step === "trim"
    ? "Drag the ends to keep the part where your skier stays in view."
    : "Pick a frame where your skier is clear, then tap the skier.";

  return (
    <div className="flex flex-col gap-3">
      {/* Step indicator + title */}
      <div className="flex flex-col gap-1">
        {totalSteps > 1 && (
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => {
              const active = i + 1 <= currentStepNum;
              return (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors",
                    active ? "bg-primary text-primary-foreground" : "bg-border text-muted-foreground"
                  )}>
                    {i + 1}
                  </div>
                  <div className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    active ? "bg-primary" : "bg-border"
                  )} />
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <h3 className="text-base font-semibold text-foreground">{stepTitle}</h3>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors" aria-label="More info">
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[240px] text-xs">
                {stepHint}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Steps */}
      <AnimatePresence mode="wait">
        {step === "trim" && (
          <motion.div
            key="trim"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <TrimStep
              videoUrl={videoUrl}
              duration={duration}
              maxTrimSeconds={maxTrimSeconds}
              onConfirm={handleTrimConfirm}
              onCancel={onCancel}
            />
          </motion.div>
        )}

        {step === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <SkierSelectStep
              videoUrl={videoUrl}
              duration={duration}
              trimStart={trimStart}
              trimEnd={trimEnd}
              selection={selection}
              onSelectionChange={setSelection}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render-prop action area — only in select step */}
      {step === "select" && (
        <div className="flex flex-col gap-2">
          {children({ selected: !!selection, getResult })}
          {needsTrim && (
            <div className="flex items-center justify-center">
              <button
                onClick={() => { setStep("trim"); setSelection(null); }}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Back to trim
              </button>
            </div>
          )}
          {!needsTrim && onCancel && (
            <div className="flex items-center justify-center">
              <button
                onClick={onCancel}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
