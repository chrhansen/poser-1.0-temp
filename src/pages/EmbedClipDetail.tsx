import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { PageError } from "@/components/shared/PageError";
import { embedClipsService } from "@/services/embed-clips.service";
import type { EmbedClip } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReplayViewer } from "@/components/results/ReplayViewer";
import { OutputCard } from "@/components/results/OutputCard";
import { ProcessingStepper } from "@/components/results/ProcessingStepper";
import { RelativeDate } from "@/components/shared/RelativeDate";
import { formatAbsoluteTimestamp } from "@/lib/date-utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<EmbedClip["status"], { label: string; cls: string }> = {
  pending: { label: "Queued", cls: "text-muted-foreground" },
  processing: { label: "Processing", cls: "text-accent-foreground" },
  complete: { label: "Ready", cls: "text-primary" },
  error: { label: "Failed", cls: "text-destructive" },
};

function StatusBadge({ status }: { status: EmbedClip["status"] }) {
  const { label, cls } = statusConfig[status];
  return (
    <Badge variant="outline" className={cn("text-[10px] font-medium", cls)}>
      {status === "processing" && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
      {status === "complete" && <CheckCircle className="mr-1 h-3 w-3" />}
      {status === "pending" && <Clock className="mr-1 h-3 w-3" />}
      {status === "error" && <XCircle className="mr-1 h-3 w-3" />}
      {label}
    </Badge>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 text-sm border-b border-border last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function formatBytes(bytes?: number) {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export default function EmbedClipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [clip, setClip] = useState<EmbedClip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [logOpen, setLogOpen] = useState(false);

  const load = () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    embedClipsService
      .getEmbedClip(id)
      .then((c) => {
        if (!c) setError(true);
        else setClip(c);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    document.title = "Poser — Embed clip";
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <AppLayout><PageLoader /></AppLayout>;
  if (error || !clip) return <AppLayout><PageError message="Clip not found." onRetry={load} /></AppLayout>;

  const publicLink = clip.result?.embedToken
    ? `${window.location.origin}/embed/results/${clip.result.embedToken}`
    : null;

  const handleCopy = () => {
    if (!publicLink) return;
    navigator.clipboard.writeText(publicLink);
    toast.success("Public link copied.");
  };

  const handleRetry = () => {
    // TODO_BACKEND_HOOKUP: trigger reprocessing
    toast.success("Retry queued.");
  };

  const showOutputs = clip.status === "complete" && clip.result?.replayOutputs?.length;
  const showStepper = clip.status === "processing" || clip.status === "pending";
  const showError = clip.status === "error";

  return (
    <AppLayout>
      <Section compact>
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Back link */}
          <Link
            to="/embeds-clips"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All embed clips
          </Link>

          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">
                  {clip.filename}
                </h1>
                <StatusBadge status={clip.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Submitted by <span className="text-foreground font-medium">{clip.submitterEmail}</span>
                {" · "}via {clip.partnerName} ({clip.partnerDomain})
                {" · "}<RelativeDate date={clip.submittedAt} />
              </p>
            </div>
            {publicLink && (
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy link
                </Button>
                <Button size="sm" asChild>
                  <a href={publicLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open public results
                  </a>
                </Button>
              </div>
            )}
          </div>

          {/* Error alert */}
          {showError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-foreground">Processing failed</p>
                  <p className="text-sm text-muted-foreground">
                    {clip.failedReason ?? "Unknown error."}
                  </p>
                  <Button variant="outline" size="sm" onClick={handleRetry}>
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Retry
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Submission details */}
          <div className="rounded-xl border border-border p-4">
            <h2 className="text-sm font-semibold text-foreground">Submission details</h2>
            <div className="mt-3">
              <MetaRow label="Submitter" value={clip.submitterEmail} />
              <MetaRow
                label="Embed"
                value={<span><span className="font-mono text-xs">{clip.partnerSlug}</span> · {clip.partnerDomain}</span>}
              />
              <MetaRow label="Submitted" value={formatAbsoluteTimestamp(clip.submittedAt)} />
              <MetaRow
                label="Original clip length"
                value={clip.clipLength ? `${clip.clipLength}s` : "—"}
              />
              <MetaRow
                label="Trimmed range"
                value={
                  clip.trimStart != null && clip.trimEnd != null
                    ? `${clip.trimStart}s – ${clip.trimEnd}s (${clip.trimEnd - clip.trimStart}s)`
                    : "—"
                }
              />
              <MetaRow label="File size" value={formatBytes(clip.fileSize)} />
              <MetaRow label="File type" value={clip.fileType ?? "—"} />
            </div>
          </div>

          {/* Replay outputs OR stepper */}
          {showOutputs && clip.result?.replayOutputs && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Replay outputs</h2>
              <ReplayViewer outputs={clip.result.replayOutputs} />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {clip.result.replayOutputs
                  .filter((o) => o.available)
                  .map((o) => (
                    <OutputCard
                      key={o.type}
                      type={o.type}
                      label={o.label}
                      description={o.description}
                    />
                  ))}
              </div>
            </div>
          )}

          {showStepper && (
            <div className="rounded-xl border border-border p-4">
              <h2 className="text-sm font-semibold text-foreground">Processing</h2>
              <div className="mt-3">
                <ProcessingStepper progress={clip.progress ?? 0} />
              </div>
            </div>
          )}

          {/* Summary metrics */}
          {clip.status === "complete" && clip.result?.metrics && (
            <div className="rounded-xl border border-border p-4">
              <h2 className="text-sm font-semibold text-foreground">Summary metrics</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs text-foreground">
                  Edge similarity{" "}
                  <span className="font-semibold">
                    {clip.result.metrics.edgeSimilarity.overall}
                  </span>
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs text-foreground">
                  Turns analyzed{" "}
                  <span className="font-semibold">
                    {clip.result.metrics.turnSegments.length}
                  </span>
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs text-foreground">
                  Turn cadence (median){" "}
                  <span className="font-semibold">
                    {clip.result.metrics.turnCadence.tpmMedian.toFixed(1)} tpm
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Processing log (collapsible) — also useful when complete */}
          {clip.status !== "pending" && (
            <div className="rounded-xl border border-border">
              <button
                onClick={() => setLogOpen((v) => !v)}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-foreground"
              >
                <span>Processing log</span>
                {logOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {logOpen && (
                <div className="border-t border-border p-4">
                  <ProcessingStepper
                    progress={
                      clip.status === "complete"
                        ? 100
                        : clip.status === "error"
                        ? Math.min(clip.progress ?? 40, 80)
                        : clip.progress ?? 0
                    }
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </Section>
    </AppLayout>
  );
}
