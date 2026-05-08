import { UploadTrimContent } from "@/components/upload/UploadTrimContent";

interface PreviewTrimStepProps {
  file: File;
  maxTrimSeconds: number;
  onContinue: (payload: { trimStart: number; trimEnd: number }) => void;
}

export function PreviewTrimStep({ file, maxTrimSeconds, onContinue }: PreviewTrimStepProps) {
  return (
    <UploadTrimContent
      file={file}
      maxTrimSeconds={maxTrimSeconds}
      onContinue={onContinue}
    />
  );
}
