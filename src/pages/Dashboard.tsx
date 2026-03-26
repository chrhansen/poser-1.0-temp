import { useEffect, useState, useRef, useCallback } from "react";
import { AppLayout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { PageError } from "@/components/shared/PageError";
import { EmptyState } from "@/components/shared/EmptyState";
import { analysisService } from "@/services/analysis.service";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AnalysisResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Upload, Clock, Loader2, CheckCircle, XCircle, RotateCcw, AlertTriangle } from "lucide-react";
import { NewAnalysisSheet } from "@/components/upload/NewAnalysisSheet";
import { RelativeDate } from "@/components/shared/RelativeDate";

const PAGE_SIZE = 20;

const statusConfig: Record<AnalysisResult["status"], { icon: typeof Clock; label: string; cls: string }> = {
  pending: { icon: Clock, label: "Queued", cls: "text-muted-foreground" },
  processing: { icon: Loader2, label: "Processing", cls: "text-accent-foreground" },
  complete: { icon: CheckCircle, label: "Ready", cls: "text-primary" },
  error: { icon: XCircle, label: "Failed", cls: "text-destructive" },
};

function ClipMeta({ r }: { r: AnalysisResult }) {
  const suffix = r.clipLength ? `${r.clipLength}s clip` : undefined;
  return (
    <RelativeDate
      date={r.createdAt}
      suffix={suffix}
      className="text-xs text-muted-foreground"
    />
  );
}

function OutputChips({ r }: { r: AnalysisResult }) {
  if (r.status !== "complete" || !r.replayOutputs) return null;
  const available = r.replayOutputs.filter((o) => o.available);
  return (
    <div className="flex flex-wrap gap-1">
      {available.length > 0 && (
        <span className="rounded-full bg-accent/60 px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
          Replay
        </span>
      )}
      {available.some((o) => o.type.includes("skeleton")) && (
        <span className="rounded-full bg-accent/60 px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
          Skeleton
        </span>
      )}
      {r.modelUrl && (
        <span className="rounded-full bg-accent/60 px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
          3D
        </span>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: AnalysisResult["status"] }) {
  const { label, cls } = statusConfig[status];
  return (
    <Badge variant="outline" className={cn("text-[10px] font-medium", cls)}>
      {status === "processing" && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
      {label}
    </Badge>
  );
}

function ResultCard({ r, onRetry }: { r: AnalysisResult; onRetry: (id: string) => void }) {
  const navigate = useNavigate();
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, a")) return;
    navigate(`/results/${r.id}`);
  };

  return (
    <div className="cursor-pointer rounded-xl border border-border p-4 transition-shadow hover:shadow-md" onClick={handleCardClick}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground truncate">{r.filename ?? "Untitled clip"}</p>
          <ClipMeta r={r} />
        </div>
        <StatusBadge status={r.status} />
      </div>
      <div className="mt-2">
        <OutputChips r={r} />
      </div>
      {r.status === "error" && (
        <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onRetry(r.id)}>
            <RotateCcw className="mr-1 h-3 w-3" /> Retry
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
            <Link to={`/results/${r.id}`}>
              <AlertTriangle className="mr-1 h-3 w-3" /> View issue
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function ResultTableRow({ r, onRetry }: { r: AnalysisResult; onRetry: (id: string) => void }) {
  const navigate = useNavigate();
  const handleRowClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, a")) return;
    navigate(`/results/${r.id}`);
  };

  return (
    <div
      className="grid cursor-pointer grid-cols-[1.5fr_0.8fr_1fr_auto] items-center gap-4 border-b border-border px-4 py-3 text-sm transition-colors hover:bg-secondary/50 last:border-0"
      onClick={handleRowClick}
    >
      <div>
        <p className="font-medium text-foreground truncate">{r.filename ?? "Untitled clip"}</p>
        <ClipMeta r={r} />
      </div>
      <div>
        <StatusBadge status={r.status} />
      </div>
      <div>
        {r.status === "complete" ? (
          <OutputChips r={r} />
        ) : r.status === "error" ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onRetry(r.id)}>
              <RotateCcw className="mr-1 h-3 w-3" /> Retry
            </Button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>
      <span className="text-muted-foreground">→</span>
    </div>
  );
}

export default function DashboardPage() {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [newAnalysisOpen, setNewAnalysisOpen] = useState(false);
  const [rerunFile, setRerunFile] = useState<File | undefined>(undefined);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    setLoading(true);
    setError(false);
    analysisService.getResults(0, PAGE_SIZE).then((res) => {
      setResults(res.data);
      setHasMore(res.hasMore);
      setLoading(false);
    }).catch(() => {
      setError(true);
      setLoading(false);
    });
  };

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    analysisService.getResults(results.length, PAGE_SIZE).then((res) => {
      setResults((prev) => [...prev, ...res.data]);
      setHasMore(res.hasMore);
      setLoadingMore(false);
    }).catch(() => {
      setLoadingMore(false);
    });
  }, [loadingMore, hasMore, results.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleRetry = (id: string) => {
    const mockFile = new File([new Blob([""], { type: "video/mp4" })], "retry-clip.mp4", { type: "video/mp4" });
    setRerunFile(mockFile);
    setNewAnalysisOpen(true);
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <AppLayout><PageLoader /></AppLayout>;
  if (error) return <AppLayout><PageError message="Failed to load clips." onRetry={loadData} /></AppLayout>;

  return (
    <AppLayout>
      <Section compact>
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Your Replays</h1>
              <Badge variant="secondary" className="text-[10px]">Motion Replay Beta</Badge>
            </div>
            <Button size="sm" onClick={() => setNewAnalysisOpen(true)}>
              <Upload className="mr-1 h-4 w-4" /> Upload clip
            </Button>
          </div>

          {results.length === 0 ? (
            <EmptyState
              title="No clips yet"
              description="Upload a clip to generate your first replay."
              action={<Button onClick={() => setNewAnalysisOpen(true)}>Upload clip</Button>}
            />
          ) : (
            <>
              {/* Mobile cards */}
              <div className="mt-6 space-y-3 md:hidden">
                {results.map((r) => <ResultCard key={r.id} r={r} onRetry={handleRetry} />)}
              </div>

              {/* Desktop table */}
              <div className="mt-6 hidden overflow-hidden rounded-xl border border-border md:block">
                <div className="grid grid-cols-[1.5fr_0.8fr_1fr_auto] gap-4 border-b border-border bg-secondary/50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Clip</span>
                  <span>Status</span>
                  <span>Outputs</span>
                  <span />
                </div>
                {results.map((r) => <ResultTableRow key={r.id} r={r} onRetry={handleRetry} />)}
              </div>

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="flex justify-center py-6">
                {loadingMore && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                {!hasMore && results.length > 0 && (
                  <p className="text-xs text-muted-foreground">All clips loaded</p>
                )}
              </div>
            </>
          )}
        </div>
      </Section>
      <NewAnalysisSheet
        open={newAnalysisOpen}
        onOpenChange={(open) => {
          setNewAnalysisOpen(open);
          if (!open) setRerunFile(undefined);
        }}
        rerunFile={rerunFile}
      />
    </AppLayout>
  );
}
