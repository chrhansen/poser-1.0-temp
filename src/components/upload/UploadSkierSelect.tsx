import { Button } from "@/components/ui/button";
import { VideoSkierSelect } from "@/components/shared/VideoSkierSelect";

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

      <VideoSkierSelect file={file} maxTrimSeconds={20}>
        {({ selected, getResult }) => (
          <Button
            className="w-full"
            disabled={!selected}
            onClick={() => {
              const result = getResult();
              onContinue(result.objectId);
            }}
          >
            {selected ? (submitLabel ?? "Analyze my skiing") : "Select a skier to continue"}
          </Button>
        )}
      </VideoSkierSelect>
    </div>
  );
}
