import { useState, useCallback, useRef } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadTrimContent } from "@/components/upload/UploadTrimContent";
import { analysisService } from "@/services/analysis.service";
import { QrUploadSection } from "@/components/upload/QrUploadSection";
import { cn } from "@/lib/utils";

interface UploadPickContentProps {
  /** Called once the clip is ready to upload (after optional trim) */
  onContinue: () => void;
  /** Optional extra content rendered below (e.g. sign-in helper) */
  footer?: React.ReactNode;
  /** When provided, skip file upload and go directly to skier select */
  initialFile?: File;
  /** Called when user wants to cancel/clear the selected clip */
  onCancel?: () => void;
}

type ViewState = "pick" | "trim";

export function UploadPickContent({ onContinue, footer, initialFile, onCancel }: UploadPickContentProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<ViewState>(initialFile ? "trim" : "pick");
  const [file, setFile] = useState<File | null>(initialFile ?? null);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const reset = () => {
    setView("pick");
    setFile(null);
    setErrorMsg("");
    setDragOver(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFileSelect = useCallback((f: File) => {
    const validation = analysisService.validateFile(f);
    if (!validation.valid) {
      setErrorMsg(validation.error!);
      return;
    }
    setErrorMsg("");
    setFile(f);
    setView("trim");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }, [handleFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileSelect(f);
  };

  if (view === "trim" && file) {
    return (
      <UploadTrimContent
        file={file}
        onCancel={initialFile ? (onCancel ?? (() => {})) : reset}
        onContinue={() => onContinue()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Drop zone */}
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors",
          dragOver ? "border-foreground bg-secondary" : "border-border",
          errorMsg && "border-destructive/50"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium text-foreground">
          Drag & drop your ski clip here
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Up to 250 MB</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => inputRef.current?.click()}>
          Browse files
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={handleInputChange}
        />
        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* OR divider */}
      <div className="relative flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Send from phone */}
      <QrUploadSection />

      {footer}
    </div>
  );
}
