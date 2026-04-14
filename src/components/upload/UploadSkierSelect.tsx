import { Button } from "@/components/ui/button";
import { VideoSkierSelect } from "@/components/shared/VideoSkierSelect";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UploadSkierSelectProps {
  file: File;
  onCancel: () => void;
  onContinue: (skierId: number) => void;
  /** Override the submit button label (default: "Analyze my skiing") */
  submitLabel?: string;
}

export function UploadSkierSelect({ file, onCancel, onContinue, submitLabel }: UploadSkierSelectProps) {
  return (
    <div className="flex flex-col gap-3">

      <VideoSkierSelect file={file} maxTrimSeconds={20} onCancel={onCancel}>
        {({ selected, getResult }) => (
          <TooltipProvider delayDuration={0}>
            <Tooltip open={selected ? false : undefined}>
              <TooltipTrigger asChild>
                <span className="w-full">
                  <Button
                    className="w-full pointer-events-auto"
                    disabled={!selected}
                    onClick={() => {
                      const result = getResult();
                      onContinue(result.objectId);
                    }}
                  >
                    {selected ? (submitLabel ?? "Analyze skier") : "Select a skier to continue"}
                  </Button>
                </span>
              </TooltipTrigger>
              {!selected && (
                <TooltipContent side="bottom" className="text-xs">
                  Tap the skier in the frame above to select them
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
      </VideoSkierSelect>
    </div>
  );
}
