import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  embedApiService,
  type EmbedPartnerConfig,
  type FeedbackResponse,
  type AnalysisStatus,
} from "@/services/embed-api.service";
import { UploadStep } from "./steps/UploadStep";
import { PreviewTrimStep } from "./steps/PreviewTrimStep";
import { EmailStep } from "./steps/EmailStep";
import { AwaitingConfirmationStep } from "./steps/AwaitingConfirmationStep";
import { ProcessingStep } from "./steps/ProcessingStep";
import { ResultsStep } from "./steps/ResultsStep";

export type EmbedStep =
  | "upload"
  | "preview"
  | "email"
  | "awaiting_confirmation"
  | "processing"
  | "results";

interface EmbedWidgetProps {
  partnerSlug?: string;
}

const transition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2 },
};

export function EmbedWidget({ partnerSlug = "demo" }: EmbedWidgetProps) {
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  // Config
  const [config, setConfig] = useState<EmbedPartnerConfig>({
    partner_slug: partnerSlug,
    partner_name: "",
    max_upload_size_mb: 250,
    max_trim_seconds: 20,
  });

  // Flow state
  const [step, setStep] = useState<EmbedStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [trimPayload, setTrimPayload] = useState<{
    trimStart: number;
    trimEnd: number;
  } | null>(null);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [processingError, setProcessingError] = useState("");
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);

  // Load partner config
  useEffect(() => {
    embedApiService.getPartnerConfig(partnerSlug).then(setConfig).catch(() => {});
  }, [partnerSlug]);

  // Polling for status
  useEffect(() => {
    if ((step !== "awaiting_confirmation" && step !== "processing") || !analysisId) return;

    pollRef.current = setInterval(async () => {
      try {
        const status = await embedApiService.getStatus(analysisId);

        if (status.status === "processing" || status.status === "pending") {
          setStep("processing");
          setProgress(status.progress?.overall_percentage ?? 0);
        } else if (status.status === "complete") {
          clearInterval(pollRef.current);
          setProgress(100);
          // Fetch feedback
          const fb = await embedApiService.getFeedback(analysisId);
          setFeedback(fb);
          setStep("results");
        } else if (status.status === "failed") {
          clearInterval(pollRef.current);
          setProcessingError(status.error ?? "Analysis failed. Please try again.");
          setStep("processing");
        }
        // awaiting_confirmation / awaiting_upload → stay on current step
      } catch {
        // Polling error — silent, will retry
      }
    }, 2000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [step, analysisId]);

  // File selection
  const handleFileSelected = useCallback(
    (f: File) => {
      const validation = embedApiService.validateFileType(f);
      if (!validation.valid) {
        setUploadError(validation.error!);
        return;
      }
      if (f.size > config.max_upload_size_mb * 1024 * 1024) {
        setUploadError(`File must be under ${config.max_upload_size_mb} MB.`);
        return;
      }
      setUploadError("");
      setFile(f);
      setStep("preview");
    },
    [config.max_upload_size_mb]
  );

  // Trim selection done (or auto-skipped for short clips)
  const handlePreviewContinue = useCallback(
    (payload: { trimStart: number; trimEnd: number }) => {
      setTrimPayload(payload);
      setStep("email");
    },
    []
  );

  // Email submit → POST /submit → upload → POST /upload-complete
  const handleEmailSubmit = useCallback(
    async (emailValue: string) => {
      if (!file || !trimPayload) return;
      setEmail(emailValue);
      setSubmitting(true);
      setSubmitError("");

      try {
        const res = await embedApiService.submit({
          email: emailValue,
          filename: file.name,
          content_type: file.type,
          trim_start_seconds: trimPayload.trimStart,
          trim_end_seconds: trimPayload.trimEnd,
          // Backend now auto-detects the primary skier; send full-frame defaults.
          bbox_x1: 0,
          bbox_y1: 0,
          bbox_x2: 1,
          bbox_y2: 1,
          click_normalized_time: 0,
          click_object_id: 0,
        });

        setAnalysisId(res.analysis_id);

        // Upload to storage
        await embedApiService.uploadToStorage(res.upload_url, res.upload_fields, file);

        // Confirm upload
        await embedApiService.uploadComplete(res.analysis_id);

        setStep("awaiting_confirmation");
      } catch (err: any) {
        setSubmitError(err?.message ?? "Submission failed. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [file, trimPayload]
  );

  // Full reset
  const reset = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    setStep("upload");
    setFile(null);
    setUploadError("");
    setTrimPayload(null);
    setEmail("");
    setSubmitting(false);
    setSubmitError("");
    setAnalysisId(null);
    setProgress(0);
    setProcessingError("");
    setFeedback(null);
  }, []);

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-md">
      <AnimatePresence mode="wait">
        {step === "upload" && (
          <motion.div key="upload" {...transition}>
            <UploadStep
              maxSizeMB={config.max_upload_size_mb}
              onFileSelected={handleFileSelected}
              error={uploadError}
            />
          </motion.div>
        )}

        {step === "preview" && file && (
          <motion.div key="preview" {...transition}>
            <PreviewTrimStep
              file={file}
              maxTrimSeconds={config.max_trim_seconds}
              onContinue={handlePreviewContinue}
            />
          </motion.div>
        )}

        {step === "email" && (
          <motion.div key="email" {...transition}>
            <EmailStep
              onSubmit={handleEmailSubmit}
              onBack={() => setStep("preview")}
              submitting={submitting}
              submitError={submitError}
            />
          </motion.div>
        )}

        {step === "awaiting_confirmation" && (
          <motion.div key="awaiting" {...transition}>
            <AwaitingConfirmationStep email={email} />
          </motion.div>
        )}

        {step === "processing" && (
          <motion.div key="processing" {...transition}>
            <ProcessingStep
              progress={progress}
              email={email}
              error={processingError}
              onRetry={reset}
            />
          </motion.div>
        )}

        {step === "results" && feedback && (
          <motion.div key="results" {...transition}>
            <ResultsStep feedback={feedback} onReset={reset} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <p className="mt-5 text-center text-xs text-muted-foreground">
        Powered by{" "}
        <a
          href="https://poser.pro"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-muted-foreground hover:text-foreground hover:underline transition-colors"
        >
          poser.pro
        </a>
      </p>
    </div>
  );
}
