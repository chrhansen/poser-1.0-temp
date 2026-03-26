import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrimStep } from "./TrimStep";
import { SkierSelectStep } from "./SkierSelectStep";
import type { SkierBbox } from "@/services/embed-api.service";

/* ─── Types ─── */

export interface VideoSkierSelectResult {
  trimStart: number;
  trimEnd: number;
  bbox: SkierBbox;
  objectId: number;
  normalizedTime: number;
}

type Step = "trim" | "select";

interface VideoSkierSelectProps {
  file: File;
  maxTrimSeconds?: number;
  /** Render-prop receives selection state and result getter */
  children: (props: { selected: boolean; getResult: () => VideoSkierSelectResult }) => React.ReactNode;
}

/* ─── Component ─── */

export function VideoSkierSelect({
  file,
  maxTrimSeconds = 20,
  children,
}: VideoSkierSelectProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [step, setStep] = useState<Step>("trim");
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [selection, setSelection] = useState<{ x: number; y: number; normalizedTime: number } | null>(null);

  // Create object URL
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
    v.addEventListener("loadedmetadata", () => {
      const dur = v.duration;
      setDuration(dur);
      // If short enough, skip trim
      if (dur <= maxTrimSeconds) {
        setTrimStart(0);
        setTrimEnd(dur);
        setStep("select");
      } else {
        setTrimStart(0);
        setTrimEnd(maxTrimSeconds);
        setStep("trim");
      }
    }, { once: true });
    return () => { v.src = ""; };
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

  const handleSelectConfirm = (sel: { x: number; y: number; normalizedTime: number }) => {
    setSelection(sel);
  };

  const getResult = (): VideoSkierSelectResult => {
    const bbox: SkierBbox = selection
      ? { x1: selection.x - 0.05, y1: selection.y - 0.1, x2: selection.x + 0.05, y2: selection.y + 0.1 }
      : { x1: 0, y1: 0, x2: 1, y2: 1 };

    return {
      trimStart,
      trimEnd,
      bbox,
      objectId: 1,
      normalizedTime: selection?.normalizedTime ?? 0,
    };
  };

  if (!videoUrl || duration <= 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground animate-pulse">
        Loading video…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Step indicator */}
      {totalSteps > 1 && (
        <p className="text-xs text-muted-foreground text-center">
          Step {currentStepNum} of {totalSteps}
        </p>
      )}

      {/* Title */}
      <div className="text-center">
        <h3 className="text-base font-semibold text-foreground">
          {step === "trim" ? "Choose the best 20 seconds" : "Who should we analyze?"}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {step === "trim"
            ? "Drag the ends to keep the part where your skier stays in view."
            : "Pick a frame where your skier is clear, then tap the skier."}
        </p>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {step === "trim" && (
          <motion.div
            key="trim"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <TrimStep
              videoUrl={videoUrl}
              duration={duration}
              maxTrimSeconds={maxTrimSeconds}
              onConfirm={handleTrimConfirm}
            />
          </motion.div>
        )}

        {step === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            <SkierSelectStep
              videoUrl={videoUrl}
              duration={duration}
              trimStart={trimStart}
              trimEnd={trimEnd}
              onConfirm={handleSelectConfirm}
              onBack={needsTrim ? () => { setStep("trim"); setSelection(null); } : undefined}
              submitLabel="dummy"
            />
            {/* External action slot replaces the SkierSelectStep's own button — 
                we let SkierSelectStep handle its own confirm internally and propagate via onConfirm.
                The render-prop children here get the final selection state. */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render prop action area — only shown in select step after selection */}
      {step === "select" && children({ selected: !!selection, getResult })}
    </div>
  );
}
