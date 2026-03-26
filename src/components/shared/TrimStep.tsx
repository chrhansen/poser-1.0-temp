import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ─── Types ─── */

interface TrimStepProps {
  videoUrl: string;
  duration: number;
  maxTrimSeconds: number;
  onConfirm: (trimStart: number, trimEnd: number) => void;
  onCancel?: () => void;
}

const FILMSTRIP_FRAMES = 14;
const BAR_HEIGHT = 52;

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const ms = Math.floor((s % 1) * 10);
  return m > 0 ? `${m}:${sec.toString().padStart(2, "0")}.${ms}` : `${sec}.${ms}s`;
}

/* ─── Component ─── */

export function TrimStep({ videoUrl, duration, maxTrimSeconds, onConfirm, onCancel }: TrimStepProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Trim state in seconds
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(Math.min(duration, maxTrimSeconds));
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [frames, setFrames] = useState<string[]>([]);
  const [dragging, setDragging] = useState<"start" | "end" | "window" | null>(null);
  const dragStartRef = useRef<{ mouseX: number; origStart: number; origEnd: number }>({ mouseX: 0, origStart: 0, origEnd: 0 });

  // iOS Safari: force a seek to render the first frame (otherwise preview stays gray)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const forceFirstFrame = () => {
      // Seek to trimStart (or a tiny offset) to force iOS to render a frame
      v.currentTime = trimStart || 0.01;
    };
    if (v.readyState >= 2) {
      forceFirstFrame();
    } else {
      v.addEventListener("loadeddata", forceFirstFrame, { once: true });
      v.addEventListener("canplaythrough", forceFirstFrame, { once: true });
    }
  }, [videoUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync video time
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setCurrentTime(v.currentTime);
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, []);

  // Pause if playhead reaches trimEnd
  useEffect(() => {
    if (playing && currentTime >= trimEnd) {
      videoRef.current?.pause();
      setPlaying(false);
    }
  }, [playing, currentTime, trimEnd]);

  // Generate filmstrip
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
    const tw = 80, th = BAR_HEIGHT;
    canvas.width = tw;
    canvas.height = th;

    const newFrames: string[] = [];
    const capture = async (i: number) => {
      if (cancelled || i >= FILMSTRIP_FRAMES) {
        if (!cancelled) setFrames(newFrames);
        return;
      }
      tv.currentTime = Math.max(0.1, ((i + 0.5) / FILMSTRIP_FRAMES) * duration);
      await new Promise<void>((r) => {
        const h = () => { tv.removeEventListener("seeked", h); r(); };
        tv.addEventListener("seeked", h);
      });
      if (cancelled) return;
      const vw = tv.videoWidth, vh = tv.videoHeight;
      const scale = Math.max(tw / vw, th / vh);
      ctx.clearRect(0, 0, tw, th);
      ctx.drawImage(tv, (tw - vw * scale) / 2, (th - vh * scale) / 2, vw * scale, vh * scale);
      newFrames.push(canvas.toDataURL("image/jpeg", 0.5));
      await capture(i + 1);
    };

    let captureStarted = false;
    const startCapture = () => { if (!cancelled && !captureStarted) { captureStarted = true; capture(0); } };
    // iOS Safari: loadeddata may not fire; listen to multiple events
    tv.addEventListener("loadeddata", startCapture, { once: true });
    tv.addEventListener("canplaythrough", startCapture, { once: true });
    // Fallback: if neither fires within 2s, try to start anyway
    const fallbackTimer = setTimeout(() => {
      if (!cancelled && tv.readyState >= 2) startCapture();
    }, 2000);
    return () => { cancelled = true; clearTimeout(fallbackTimer); tv.src = ""; };
  }, [videoUrl, duration]);

  /* ─── Pointer logic ─── */
  const toPct = useCallback((s: number) => (s / Math.max(duration, 0.01)) * 100, [duration]);
  const toSec = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return pct * duration;
  }, [duration]);

  const handlePointerDown = useCallback((type: "start" | "end" | "window", e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(type);
    dragStartRef.current = { mouseX: e.clientX, origStart: trimStart, origEnd: trimEnd };
  }, [trimStart, trimEnd]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const sec = toSec(e.clientX);

    if (dragging === "window") {
      const dx = e.clientX - dragStartRef.current.mouseX;
      const track = trackRef.current;
      if (!track) return;
      const dSec = (dx / track.getBoundingClientRect().width) * duration;
      const winLen = dragStartRef.current.origEnd - dragStartRef.current.origStart;
      let newStart = dragStartRef.current.origStart + dSec;
      let newEnd = newStart + winLen;
      if (newStart < 0) { newStart = 0; newEnd = winLen; }
      if (newEnd > duration) { newEnd = duration; newStart = duration - winLen; }
      setTrimStart(newStart);
      setTrimEnd(newEnd);
      if (videoRef.current) videoRef.current.currentTime = newStart;
      return;
    }

    if (dragging === "start") {
      let s = Math.max(0, Math.min(sec, trimEnd - 0.5));
      if (trimEnd - s > maxTrimSeconds) s = trimEnd - maxTrimSeconds;
      setTrimStart(s);
      if (videoRef.current) videoRef.current.currentTime = s;
    } else {
      let e2 = Math.min(duration, Math.max(sec, trimStart + 0.5));
      if (e2 - trimStart > maxTrimSeconds) e2 = trimStart + maxTrimSeconds;
      setTrimEnd(e2);
      if (videoRef.current) videoRef.current.currentTime = e2;
    }
  }, [dragging, duration, maxTrimSeconds, toSec, trimStart, trimEnd]);

  const handlePointerUp = useCallback(() => setDragging(null), []);

  const handleTrackClick = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-handle]")) return;
    const sec = toSec(e.clientX);
    const clamped = Math.max(trimStart, Math.min(sec, trimEnd));
    if (videoRef.current) videoRef.current.currentTime = clamped;
  }, [toSec, trimStart, trimEnd]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) {
      v.pause();
      setPlaying(false);
    } else {
      if (v.currentTime < trimStart || v.currentTime >= trimEnd) v.currentTime = trimStart;
      v.play();
      setPlaying(true);
    }
  };

  const resetTrim = () => {
    setTrimStart(0);
    setTrimEnd(Math.min(duration, maxTrimSeconds));
    if (videoRef.current) videoRef.current.currentTime = 0;
  };

  const trimDuration = trimEnd - trimStart;
  const startPct = toPct(trimStart);
  const endPct = toPct(trimEnd);
  const playheadPct = toPct(currentTime);

  return (
    <div className="flex flex-col gap-4">
      {/* Video preview */}
      <div className="relative overflow-hidden rounded-2xl bg-secondary">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full max-h-[50vh] object-contain"
          preload="auto"
          muted
          playsInline
        />
        {/* Play / pause overlay */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-foreground/0 hover:bg-foreground/5 transition-colors"
          aria-label={playing ? "Pause" : "Play"}
        >
          {!playing && (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground/60 text-background backdrop-blur-sm">
              <Play className="h-6 w-6 ml-0.5" />
            </div>
          )}
        </button>
      </div>

      {/* Timeline / filmstrip with trim handles */}
      <div className="flex flex-col gap-2">
        <div
          ref={trackRef}
          className="relative cursor-pointer select-none"
          style={{ height: BAR_HEIGHT }}
          onPointerDown={handleTrackClick}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Filmstrip */}
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            <div className="absolute inset-0 flex">
              {frames.length > 0
                ? frames.map((src, i) => (
                    <img key={i} src={src} alt="" className="h-full flex-1 object-cover" draggable={false} />
                  ))
                : Array.from({ length: FILMSTRIP_FRAMES }).map((_, i) => (
                    <div key={i} className="h-full flex-1 bg-secondary" />
                  ))}
            </div>

            {/* Dimmed outside */}
            <div className="absolute inset-y-0 left-0 bg-background/70 rounded-l-lg" style={{ width: `${startPct}%` }} />
            <div className="absolute inset-y-0 right-0 bg-background/70 rounded-r-lg" style={{ width: `${100 - endPct}%` }} />

            {/* Selected range border */}
            <div
              className="absolute inset-y-0 pointer-events-none border-y-[3px] border-primary"
              style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
            />

            {/* Draggable window area */}
            <div
              data-handle
              className="absolute inset-y-0 cursor-grab active:cursor-grabbing z-10"
              style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
              onPointerDown={(e) => handlePointerDown("window", e)}
            />

          </div>

          {/* Left handle */}
          <motion.div
            data-handle
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={cn(
              "absolute inset-y-0 z-20 flex w-[14px] cursor-ew-resize items-center justify-center bg-primary rounded-l-md",
              dragging === "start" && "shadow-lg shadow-primary/40"
            )}
            style={{ left: `calc(${startPct}% - 14px)` }}
            onPointerDown={(e) => handlePointerDown("start", e)}
          >
            <div className="h-5 w-0.5 rounded-full bg-primary-foreground/80" />
          </motion.div>

          {/* Right handle */}
          <motion.div
            data-handle
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={cn(
              "absolute inset-y-0 z-20 flex w-[14px] cursor-ew-resize items-center justify-center bg-primary rounded-r-md",
              dragging === "end" && "shadow-lg shadow-primary/40"
            )}
            style={{ left: `${endPct}%` }}
            onPointerDown={(e) => handlePointerDown("end", e)}
          >
            <div className="h-5 w-0.5 rounded-full bg-primary-foreground/80" />
          </motion.div>
        </div>

        {/* Duration pill + time labels */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatTime(trimStart)}</span>
          <span className="rounded-full bg-secondary px-3 py-1 font-medium text-foreground">
            {trimDuration.toFixed(1)}s selected &bull; max {maxTrimSeconds}s
          </span>
          <span>{formatTime(trimEnd)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button className="w-full" size="lg" onClick={() => onConfirm(trimStart, trimEnd)}>
          Use this clip
        </Button>
        <div className="flex items-center justify-center gap-4">
          {onCancel && (
            <button onClick={onCancel} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
          )}
          <button onClick={resetTrim} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to first {maxTrimSeconds}s
          </button>
        </div>
      </div>
    </div>
  );
}
