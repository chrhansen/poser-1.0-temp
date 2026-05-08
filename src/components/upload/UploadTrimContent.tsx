import { useEffect, useState } from "react";
import { TrimStep } from "@/components/shared/TrimStep";

interface UploadTrimContentProps {
  file: File;
  /** Called once trimming is decided. For short clips, fires immediately with the full range. */
  onContinue: (trim: { trimStart: number; trimEnd: number }) => void;
  onCancel?: () => void;
  maxTrimSeconds?: number;
}

/**
 * Upload-side video step: only shows the trim UI when the clip is longer
 * than the max allowed length. Shorter clips skip straight through —
 * the backend now auto-detects the primary skier, so no manual select.
 */
export function UploadTrimContent({
  file,
  onContinue,
  onCancel,
  maxTrimSeconds = 20,
}: UploadTrimContentProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [needsTrim, setNeedsTrim] = useState<boolean | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!videoUrl) return;
    const v = document.createElement("video");
    v.src = videoUrl;
    v.preload = "metadata";
    const onMeta = () => {
      const dur = v.duration || 0;
      setDuration(dur);
      if (dur <= maxTrimSeconds) {
        setNeedsTrim(false);
        // Auto-continue — no UI needed
        onContinue({ trimStart: 0, trimEnd: dur });
      } else {
        setNeedsTrim(true);
      }
    };
    v.addEventListener("loadedmetadata", onMeta, { once: true });
    // Fallback if metadata never fires
    const fallback = setTimeout(() => {
      if (needsTrim === null) {
        setNeedsTrim(false);
        onContinue({ trimStart: 0, trimEnd: 0 });
      }
    }, 4000);
    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      clearTimeout(fallback);
      v.src = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoUrl, maxTrimSeconds]);

  if (!videoUrl || needsTrim === null) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground animate-pulse">
        Loading video…
      </div>
    );
  }

  if (!needsTrim) {
    // Short clip — auto-handed off; show a tiny waiting state until parent advances.
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground animate-pulse">
        Preparing clip…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-foreground">Trim to your best {maxTrimSeconds} seconds</h3>
        <p className="text-xs text-muted-foreground">
          Drag the ends to keep the part where your skier stays in view.
        </p>
      </div>
      <TrimStep
        videoUrl={videoUrl}
        duration={duration}
        maxTrimSeconds={maxTrimSeconds}
        onConfirm={(s, e) => onContinue({ trimStart: s, trimEnd: e })}
        onCancel={onCancel}
      />
    </div>
  );
}