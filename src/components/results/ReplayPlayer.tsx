import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Maximize2, Minimize2, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReplayPlayerProps {
  src?: string;
  poster?: string;
  /** Shown when there's no video source (mock state) */
  placeholderLabel?: string;
  placeholderDescription?: string;
  className?: string;
}

const SPEEDS = [0.5, 1, 2] as const;
type Speed = (typeof SPEEDS)[number];

function formatTime(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/**
 * Mobile-first interactive video player with overlay controls.
 * - Tap video to toggle play/pause.
 * - Bottom overlay: play/pause, speed cycle (0.5x / 1x / 2x), time, expand.
 * - Expand uses an in-app fullscreen (fixed inset-0) so overlay controls stay visible.
 */
export function ReplayPlayer({
  src,
  poster,
  placeholderLabel,
  placeholderDescription,
  className,
}: ReplayPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const [expanded, setExpanded] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  // Transient center icon flashed on each play/pause toggle.
  const [flash, setFlash] = useState<{ kind: "play" | "pause"; key: number } | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout>>();

  const triggerFlash = useCallback((kind: "play" | "pause") => {
    setFlash({ kind, key: Date.now() });
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 600);
  }, []);

  useEffect(() => () => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
  }, []);

  // Keep playbackRate in sync.
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed]);

  // Lock body scroll while expanded.
  useEffect(() => {
    if (!expanded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [expanded]);

  // ESC to exit expanded.
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, []);

  const cycleSpeed = useCallback(() => {
    setSpeed((s) => {
      const idx = SPEEDS.indexOf(s);
      return SPEEDS[(idx + 1) % SPEEDS.length];
    });
  }, []);

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrent(v.currentTime);
  };

  const onLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration);
    v.playbackRate = speed;
  };

  // Auto-hide controls while playing (after 2.5s of no interaction).
  const bumpControls = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (isPlaying) {
      hideTimer.current = setTimeout(() => setShowControls(false), 2500);
    }
  }, [isPlaying]);

  useEffect(() => {
    bumpControls();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [isPlaying, bumpControls]);

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const t = (Number(e.target.value) / 1000) * duration;
    v.currentTime = t;
    setCurrent(t);
  };

  const hasSrc = Boolean(src);

  // Container sizing:
  // - Inline: portrait-friendly tall area on mobile (up to ~70vh), aspect-video on md+.
  // - Expanded: full viewport, video object-contain to fit any aspect.
  const containerClass = expanded
    ? "fixed inset-0 z-50 bg-black"
    : cn(
        "relative w-full overflow-hidden bg-black",
        "h-[min(70vh,calc(100vw*16/9))] md:h-auto md:aspect-video",
        className,
      );

  return (
    <div
      className={containerClass}
      onMouseMove={bumpControls}
      onTouchStart={bumpControls}
    >
      {/* Video / placeholder */}
      {hasSrc ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-contain bg-black"
          onClick={togglePlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-secondary/20 text-center p-6">
          <Video className="h-10 w-10 text-muted-foreground/60" />
          {placeholderLabel && (
            <p className="text-sm font-medium text-foreground">{placeholderLabel}</p>
          )}
          {placeholderDescription && (
            <p className="max-w-xs text-xs text-muted-foreground">{placeholderDescription}</p>
          )}
        </div>
      )}

      {/* Center tap-to-play affordance when paused */}
      {hasSrc && !isPlaying && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play"
          className="absolute inset-0 z-10 flex items-center justify-center"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-transform hover:scale-105">
            <Play className="h-7 w-7 translate-x-0.5" fill="currentColor" />
          </span>
        </button>
      )}

      {/* Top-right: expand / close */}
      <div
        className={cn(
          "absolute right-2 top-2 z-20 transition-opacity",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-label={expanded ? "Exit fullscreen" : "Enter fullscreen"}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm hover:bg-black/60"
        >
          {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Bottom overlay controls */}
      {hasSrc && (
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-20 flex flex-col gap-2 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pb-3 pt-8 transition-opacity",
            showControls ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          {/* Scrubber */}
          <input
            type="range"
            min={0}
            max={1000}
            value={duration ? (current / duration) * 1000 : 0}
            onChange={onSeek}
            aria-label="Seek"
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/25 accent-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white"
          />

          <div className="flex items-center gap-3 text-white">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm hover:bg-white/25"
            >
              {isPlaying ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="h-4 w-4 translate-x-0.5" fill="currentColor" />}
            </button>

            <button
              type="button"
              onClick={cycleSpeed}
              aria-label="Playback speed"
              className="flex h-9 min-w-[3rem] items-center justify-center rounded-full bg-white/15 px-3 text-xs font-semibold backdrop-blur-sm hover:bg-white/25"
            >
              {speed}x
            </button>

            <div className="ml-auto text-[11px] tabular-nums text-white/85">
              {formatTime(current)} / {formatTime(duration)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
