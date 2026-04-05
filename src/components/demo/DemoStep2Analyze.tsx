import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import demoFrame from "@/assets/demo-frame.png";

interface DemoStep2Props {
  onComplete: () => void;
}

const progressRows = [
  { label: "Tracking skier", duration: 2700 },
  { label: "Estimating pose", duration: 3000 },
  { label: "Rendering replay views", duration: 2800 },
];

// Simple skeleton keypoints for the overlay (percentage-based)
const skeletonPoints = [
  { x: 38, y: 28 }, // head
  { x: 36, y: 36 }, // left shoulder
  { x: 40, y: 36 }, // right shoulder
  { x: 37, y: 46 }, // left hip
  { x: 40, y: 45 }, // right hip
  { x: 35, y: 55 }, // left knee
  { x: 42, y: 54 }, // right knee
  { x: 33, y: 63 }, // left ankle
  { x: 43, y: 62 }, // right ankle
];

const skeletonBones: [number, number][] = [
  [0, 1], [0, 2],
  [1, 2],
  [1, 3], [2, 4],
  [3, 4],
  [3, 5], [4, 6],
  [5, 7], [6, 8],
];

export function DemoStep2Analyze({ onComplete }: DemoStep2Props) {
  const [completedRows, setCompletedRows] = useState(0);
  const [activeRow, setActiveRow] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showTrackingBox, setShowTrackingBox] = useState(false);

  useEffect(() => {
    const skelTimer = setTimeout(() => setShowSkeleton(true), 3500);
    const trackTimer = setTimeout(() => setShowTrackingBox(true), 400);

    let elapsed = 0;
    const timers: ReturnType<typeof setTimeout>[] = [skelTimer, trackTimer];

    progressRows.forEach((row, i) => {
      const startTimer = setTimeout(() => setActiveRow(i), elapsed);
      timers.push(startTimer);
      elapsed += row.duration;
      const endTimer = setTimeout(() => setCompletedRows(i + 1), elapsed);
      timers.push(endTimer);
    });

    const finishTimer = setTimeout(() => onComplete(), elapsed + 600);
    timers.push(finishTimer);

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
      {/* Media area */}
      <div className="relative flex items-center justify-center bg-accent/20 md:w-1/2 overflow-hidden">
        <div className="relative w-full h-48 md:h-full">
          <img
            src={demoFrame}
            alt="Tracking in progress"
            className="h-full w-full object-cover"
          />

          {/* Scanning overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            className="absolute inset-0 bg-primary"
          />

          {/* Scan line */}
          <motion.div
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-px bg-primary/60"
          />

          {/* Tracking bounding box */}
          {showTrackingBox && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute border-2 border-primary rounded-md"
              style={{
                left: "26%",
                top: "22%",
                width: "22%",
                height: "50%",
              }}
            >
              <motion.div
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground whitespace-nowrap"
              >
                Tracking
              </motion.div>
            </motion.div>
          )}

          {/* Skeleton overlay — appears during pose estimation */}
          {showSkeleton && (
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {skeletonBones.map(([a, b], i) => (
                <motion.line
                  key={`bone-${i}`}
                  x1={skeletonPoints[a].x}
                  y1={skeletonPoints[a].y}
                  x2={skeletonPoints[b].x}
                  y2={skeletonPoints[b].y}
                  stroke="hsl(var(--primary))"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.9, 0.6] }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                />
              ))}
              {skeletonPoints.map((pt, i) => (
                <motion.circle
                  key={`joint-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="0.8"
                  fill="hsl(var(--primary))"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                />
              ))}
            </svg>
          )}
        </div>
      </div>

      {/* Copy area */}
      <div className="flex flex-1 flex-col justify-between p-6 md:w-1/2">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Step 2
            </p>
            <h3 className="mt-1 text-xl font-bold text-foreground">
              Poser tracks the skier and builds replay views
            </h3>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            We follow the selected skier through the clip, keep them centered, and render replay outputs you can inspect in seconds.
          </p>

          {/* Progress rows */}
          <div className="flex flex-col gap-2 mt-2">
            {progressRows.map((row, i) => {
              const done = i < completedRows;
              const active = i === activeRow && !done;
              return (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="flex items-center gap-2.5"
                >
                  <div className="flex h-5 w-5 items-center justify-center">
                    {done ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-primary"
                      >
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </motion.div>
                    ) : active ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-border" />
                    )}
                  </div>
                  <span
                    className={
                      done || active
                        ? "text-sm font-medium text-foreground"
                        : "text-sm text-muted-foreground"
                    }
                  >
                    {row.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground/70">
          Demo shortened. Your own clip usually takes around a minute.
        </p>
      </div>
    </div>
  );
}
