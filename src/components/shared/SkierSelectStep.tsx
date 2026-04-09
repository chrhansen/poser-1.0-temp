import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ZoomIn, ZoomOut, ChevronLeft, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ─── */

interface SkierSelectStepProps {
  videoUrl: string;
  duration: number;
  trimStart: number;
  trimEnd: number;
  /** Called whenever the user clicks (or re-clicks) a skier. null means cleared. */
  onSelectionChange: (sel: { x: number; y: number } | null) => void;
  /** Current selection (controlled) */
  selection: { x: number; y: number } | null;
  onBack?: () => void;
}

const THUMBNAIL_COUNT = 8;

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/* ─── Component ─── */

export function SkierSelectStep({
  videoUrl,
  duration,
  trimStart,
  trimEnd,
  onSelectionChange,
  selection,
  onBack,
}: SkierSelectStepProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [currentTime, setCurrentTime] = useState((trimStart + trimEnd) / 2);
  const [activeThumb, setActiveThumb] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [showScrubber, setShowScrubber] = useState(false);
  const [thumbnails, setThumbnails] = useState<{ time: number; src: string }[]>([]);

  // Seek video
  useEffect(() => {
    if (videoRef.current) videoRef.current.currentTime = currentTime;
  }, [currentTime]);

  // Generate thumbnails
  useEffect(() => {
    if (duration <= 0) return;
    let cancelled = false;
    const tv = document.createElement("video");
    tv.muted = true;
    tv.playsInline = true;
    tv.preload = "auto";
    tv.setAttribute("muted", "");
    tv.setAttribute("playsinline", "");
    tv.src = videoUrl;
    tv.load();

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const tw = 100, th = 64;
    canvas.width = tw;
    canvas.height = th;

    const results: { time: number; src: string }[] = [];
    const rangeLen = trimEnd - trimStart;
    let captureStarted = false;

    const capture = async (i: number) => {
      if (cancelled || i >= THUMBNAIL_COUNT) {
        if (!cancelled) setThumbnails(results);
        return;
      }
      const time = trimStart + ((i + 0.5) / THUMBNAIL_COUNT) * rangeLen;
      tv.currentTime = time;
      await new Promise<void>((r) => {
        const h = () => { tv.removeEventListener("seeked", h); r(); };
        tv.addEventListener("seeked", h);
      });
      if (cancelled) return;
      const vw = tv.videoWidth, vh = tv.videoHeight;
      const scale = Math.max(tw / vw, th / vh);
      ctx.clearRect(0, 0, tw, th);
      ctx.drawImage(tv, (tw - vw * scale) / 2, (th - vh * scale) / 2, vw * scale, vh * scale);
      results.push({ time, src: canvas.toDataURL("image/jpeg", 0.6) });
      await capture(i + 1);
    };

    const startCapture = () => {
      if (!cancelled && !captureStarted) {
        captureStarted = true;
        capture(0);
      }
    };
    tv.addEventListener("loadeddata", startCapture, { once: true });
    tv.addEventListener("canplaythrough", startCapture, { once: true });
    const fallbackTimer = setTimeout(() => {
      if (!cancelled && tv.readyState >= 2) startCapture();
    }, 2000);
    return () => { cancelled = true; clearTimeout(fallbackTimer); tv.src = ""; };
  }, [videoUrl, duration, trimStart, trimEnd]);

  // Default active thumbnail to middle
  useEffect(() => {
    if (thumbnails.length > 0 && activeThumb === null) {
      const mid = Math.floor(thumbnails.length / 2);
      setActiveThumb(mid);
      setCurrentTime(thumbnails[mid].time);
    }
  }, [thumbnails, activeThumb]);

  const handleThumbClick = (index: number) => {
    setActiveThumb(index);
    setCurrentTime(thumbnails[index].time);
    onSelectionChange(null); // clear when frame changes
  };

  const handleVideoClick = useCallback((e: React.MouseEvent<HTMLVideoElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    onSelectionChange({ x, y });
  }, [onSelectionChange]);

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    setCurrentTime(t);
    onSelectionChange(null);
    let closest = 0;
    let minDist = Infinity;
    thumbnails.forEach((th, i) => {
      const d = Math.abs(th.time - t);
      if (d < minDist) { minDist = d; closest = i; }
    });
    setActiveThumb(closest);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Video preview */}
      <div className={cn(
        "relative overflow-hidden rounded-2xl bg-secondary cursor-crosshair",
        zoomed && "overflow-auto"
      )}>
        <video
          ref={videoRef}
          src={videoUrl}
          className={cn(
            "w-full object-contain transition-transform duration-200",
            zoomed ? "max-h-[70vh] scale-150 origin-center" : "max-h-[50vh]"
          )}
          muted
          playsInline
          onClick={handleVideoClick}
        />

        {/* Selection marker */}
        <AnimatePresence>
          {selection && (
            <motion.div
              key="marker"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="pointer-events-none absolute z-20"
              style={{ left: `${selection.x * 100}%`, top: `${selection.y * 100}%`, transform: "translate(-50%, -50%)" }}
            >
              <motion.div
                animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary"
                style={{ left: "50%", top: "50%" }}
              />
              <div className="h-4 w-4 rounded-full border-2 border-primary bg-primary/30 shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zoom toggle */}
        <button
          onClick={() => setZoomed(!zoomed)}
          className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-foreground/50 text-background backdrop-blur-sm hover:bg-foreground/70 transition-colors"
          aria-label={zoomed ? "Zoom out" : "Zoom in"}
        >
          {zoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
        </button>

        {/* Instruction overlay */}
        {!selection && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 rounded-full bg-foreground/60 px-4 py-1.5 text-xs font-medium text-background backdrop-blur-sm">
            Tap the skier to select
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-1.5 overflow-x-auto pb-1"
      >
        {thumbnails.map((thumb, i) => (
          <button
            key={i}
            onClick={() => handleThumbClick(i)}
            className={cn(
              "relative flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
              activeThumb === i
                ? "border-primary ring-2 ring-primary/20 scale-105"
                : "border-transparent hover:border-border opacity-70 hover:opacity-100"
            )}
            style={{ width: 64, height: 44 }}
          >
            <img src={thumb.src} alt="" className="h-full w-full object-cover" draggable={false} />
            <span className="absolute bottom-0 inset-x-0 bg-foreground/50 text-[9px] text-background text-center leading-tight">
              {formatTime(thumb.time)}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Optional scrubber */}
      <div>
        <button
          onClick={() => setShowScrubber(!showScrubber)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {showScrubber ? "Hide scrubber" : "Show scrubber"}
        </button>
        {showScrubber && (
          <div className="mt-2 flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-10">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={trimStart}
              max={trimEnd}
              step={0.05}
              value={currentTime}
              onChange={handleScrubberChange}
              className="flex-1 accent-primary h-1.5"
            />
            <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(trimEnd)}</span>
          </div>
        )}
      </div>

      {/* Secondary actions */}
      {onBack && (
        <div className="flex items-center justify-center">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to trim
          </button>
        </div>
      )}
    </div>
  );
}
