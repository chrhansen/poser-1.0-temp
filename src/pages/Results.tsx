import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { PageError } from "@/components/shared/PageError";
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog";
import { ContactSupportDialog } from "@/components/dialogs/ContactSupportDialog";
import { ResultsHeader } from "@/components/results/ResultsHeader";
import { ReplayViewer } from "@/components/results/ReplayViewer";
import { OutputCard } from "@/components/results/OutputCard";
import { ComingSoonStrip } from "@/components/results/ComingSoonStrip";
import { ProcessingStepper } from "@/components/results/ProcessingStepper";
import { analysisService } from "@/services/analysis.service";
import type { AnalysisResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { NewAnalysisSheet } from "@/components/upload/NewAnalysisSheet";
import { ShareClipSheet } from "@/components/results/ShareClipSheet";
import { CorrectSkierSheet } from "@/components/results/CorrectSkierSheet";
import {
  Loader2, RefreshCw, Trash2, MessageSquare, AlertTriangle, Clock, Bell, UserX,
} from "lucide-react";
import { toast } from "sonner";
import type { ReplayOutputType } from "@/lib/types";

// ─── Main Results Page ──────────────────────────────────────────────────────
export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [correctOpen, setCorrectOpen] = useState(false);
  const [activeView, setActiveView] = useState<ReplayOutputType>("head_tracked_skeleton");
  const [newAnalysisOpen, setNewAnalysisOpen] = useState(false);
  const [rerunFile, setRerunFile] = useState<File | undefined>(undefined);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    document.title = "Poser — Clip Details";
  }, []);

  const loadData = useCallback(async () => {
    try {
      const r = await analysisService.getResult(id ?? "");
      if (!r) { setError(true); setLoading(false); return; }
      setResult(r);
      setLoading(false);
    } catch {
      setError(true);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { setLoading(true); setError(false); loadData(); }, [loadData]);

  // Polling for processing/pending
  useEffect(() => {
    if (!result || (result.status !== "processing" && result.status !== "pending")) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(async () => {
      const updated = await analysisService.pollResult(result.id);
      if (updated) setResult(updated);
      if (updated && (updated.status === "complete" || updated.status === "error")) clearInterval(pollRef.current);
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [result?.id, result?.status]);

  const handleDelete = async () => {
    if (!result) return;
    await analysisService.deleteResult(result.id);
    toast.success("Clip deleted.");
    navigate("/clips");
  };

  const handleRerun = () => {
    if (!result) return;
    const mockFile = new File([new Blob([""], { type: "video/mp4" })], "rerun-clip.mp4", { type: "video/mp4" });
    setRerunFile(mockFile);
    setNewAnalysisOpen(true);
  };

  // Loading / error states
  if (loading) return <AppLayout><PageLoader /></AppLayout>;
  if (error || !result) return <AppLayout><PageError message="Result not found." onRetry={loadData} /></AppLayout>;

  // Pending state
  if (result.status === "pending") {
    return (
      <AppLayout>
        <Section compact>
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Clock className="h-10 w-10 text-muted-foreground" />
            <h1 className="text-2xl font-bold text-foreground">Queued for processing</h1>
            <p className="text-muted-foreground">Your clip is in the queue. Processing will begin shortly.</p>
          </div>
        </Section>
      </AppLayout>
    );
  }

  // Processing state with stepper
  if (result.status === "processing") {
    return (
      <AppLayout>
        <Section compact>
          <div className="mx-auto flex max-w-md flex-col items-center gap-6 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Generating replay…</h1>
            <p className="text-muted-foreground">This usually takes 1–2 minutes.</p>
            <div className="w-full text-left">
              <ProcessingStepper progress={result.progress ?? 0} />
            </div>
          </div>
        </Section>
      </AppLayout>
    );
  }

  // Error state
  if (result.status === "error") {
    return (
      <AppLayout>
        <Section compact>
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <h1 className="text-2xl font-bold text-foreground">Couldn't process clip</h1>
            <p className="text-sm text-muted-foreground">{result.failedReason ?? "An unexpected error occurred."}</p>
            <div className="flex gap-3">
              <Button onClick={handleRerun}><RefreshCw className="mr-2 h-4 w-4" />Re-run clip</Button>
              <Button variant="outline" onClick={() => setSupportOpen(true)}><MessageSquare className="mr-2 h-4 w-4" />Give feedback</Button>
            </div>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />Delete clip
            </Button>
          </div>
        </Section>
        <ConfirmActionDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete clip?" description="This action cannot be undone." confirmLabel="Delete" destructive onConfirm={handleDelete} />
        <ContactSupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
        <NewAnalysisSheet open={newAnalysisOpen} onOpenChange={(open) => { setNewAnalysisOpen(open); if (!open) setRerunFile(undefined); }} rerunFile={rerunFile} />
      </AppLayout>
    );
  }

  // ── Complete state ──
  const outputs = result.replayOutputs ?? [];

  return (
    <AppLayout>
      <Section compact>
        <div className="mx-auto max-w-4xl space-y-5">
          <ResultsHeader result={result} onShare={() => setShareOpen(true)} />

          {/* Main viewer — this IS the primary navigation */}
          <ReplayViewer outputs={outputs} activeTab={activeView} onTabChange={setActiveView} />


          {/* Wrong-skier correction */}
          <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="text-sm font-medium text-foreground">Tracking the wrong person?</p>
              <p className="text-xs text-muted-foreground">
                Pick the right skier and we'll re-run the analysis.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCorrectOpen(true)}
            >
              <UserX className="mr-2 h-4 w-4" /> Pick the right person
            </Button>
          </div>

          {/* Coming soon */}
          <div className="rounded-xl border border-border bg-card p-5">
            <ComingSoonStrip />
          </div>

          {/* Bottom actions */}
          <div className="!mt-16 flex flex-wrap items-center gap-3 border-t border-border pt-5">
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSupportOpen(true)}>
              <MessageSquare className="mr-2 h-4 w-4" /> Give feedback
            </Button>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => toast.success("We'll notify you when SkiRank beta launches!")}>
              <Bell className="mr-1.5 h-3.5 w-3.5" /> Notify me when SkiRank launches
            </Button>
          </div>
        </div>
      </Section>

      <ConfirmActionDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete clip?" description="This will permanently remove this clip and all associated data." confirmLabel="Delete" destructive onConfirm={handleDelete} />
      <ContactSupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
      <ShareClipSheet open={shareOpen} onOpenChange={setShareOpen} clipId={result.id} activeView={activeView} />
      <NewAnalysisSheet open={newAnalysisOpen} onOpenChange={(open) => { setNewAnalysisOpen(open); if (!open) setRerunFile(undefined); }} rerunFile={rerunFile} />
      <CorrectSkierSheet
        open={correctOpen}
        onOpenChange={setCorrectOpen}
        videoUrl={outputs.find((o) => o.available)?.url ?? ""}
      />
    </AppLayout>
  );
}
