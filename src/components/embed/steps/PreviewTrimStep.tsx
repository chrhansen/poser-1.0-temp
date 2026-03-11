import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VideoSkierSelect, type VideoSkierSelectResult } from "@/components/shared/VideoSkierSelect";
import type { SkierBbox } from "@/services/embed-api.service";

interface PreviewTrimStepProps {
  file: File;
  maxTrimSeconds: number;
  onContinue: (payload: {
    trimStart: number;
    trimEnd: number;
    bbox: SkierBbox;
    objectId: number;
    normalizedTime: number;
  }) => void;
}

export function PreviewTrimStep({ file, maxTrimSeconds, onContinue }: PreviewTrimStepProps) {
  const [error, setError] = useState("");

  return (
    <VideoSkierSelect file={file} maxTrimSeconds={maxTrimSeconds}>
      {({ selected, getResult }) => (
        <div className="flex flex-col gap-3">
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              if (!selected) {
                setError("Please select a skier to track.");
                return;
              }
              setError("");
              onContinue(getResult());
            }}
          >
            Continue
          </Button>
        </div>
      )}
    </VideoSkierSelect>
  );
}
