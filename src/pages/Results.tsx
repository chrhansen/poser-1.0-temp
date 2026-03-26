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
import type { AnalysisResult, ReplayOutputType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewAnalysisSheet } from "@/components/upload/NewAnalysisSheet";
import {
  Loader2, RefreshCw, Trash2, MessageSquare, AlertTriangle, Clock, Bell, Video, Bone, Box,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Side nav for replay sections ───────────────────────────────────────────
const navItems = [
  { id: "overview", label: "Overview", icon: Video },
  { id: "outputs", label: "Outputs", icon: Bone },
  { id: "3d_model", label: "3D Model", icon: Box },
  { id: "coming_soon", label: "Coming soon", icon: Clock },
];

function ReplayNav({ activeView, onViewChange }: { activeView: string; onViewChange: (v: string) => void }) {
  return (
    <nav className="hidden w-52 shrink-0 space-y-0.5 lg:block">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              activeView === item.id
                ? "bg-accent/10 text-foreground shadow-[inset_3px_0_0_hsl(var(--accent))]"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

function ReplayPills({ activeView, onViewChange }: { activeView: string; onViewChange: (v: string) => void }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
      {navItems.map((p) => (
        <button
          key={p.id}
          onClick={() => onViewChange(p.id)}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
            activeView === p.id
              ? "bg-accent text-accent-foreground shadow-sm"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main Results Page ──────────────────────────────────────────────────────
export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [newAnalysisOpen, setNewAnalysisOpen] = useState(false);
  const [rerunFile, setRerunFile] = useState<File | undefined>(undefined);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const [activeView, setActiveView] = useState<string>("overview");

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
    navigate("/dashboard");
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
  const hasModel = !!result.modelUrl;

  // Build output card list
  const allOutputCards = [
    ...outputs.filter((o) => o.available).map((o) => ({
      type: o.type,
      label: o.label,
      description: o.description,
    })),
    ...(hasModel ? [{
      type: "3d_model" as const,
      label: "3D Body Model",
      description: "An interactive 3D replay of the skier's body motion.",
    }] : []),
  ];

  return (
    <AppLayout>
      <Section compact>
        <div className="mx-auto max-w-5xl space-y-5">
          <ResultsHeader result={result} />

          {/* Info banner */}
          <div className="rounded-lg border border-border bg-accent/20 px-4 py-3 text-xs text-muted-foreground">
            You're viewing Poser's visual replay outputs. SkiRank, per-turn scoring, and technique feedback are coming soon.
          </div>

          {/* Mobile pills */}
          <ReplayPills activeView={activeView} onViewChange={setActiveView} />

          {/* Layout: sidebar (desktop) + content */}
          <div className="flex gap-6">
            <ReplayNav activeView={activeView} onViewChange={setActiveView} />

            {/* Main content */}
            <div className="min-w-0 flex-1 space-y-6">
              {activeView === "overview" && (
                <>
                  {/* Main viewer */}
                  <ReplayViewer outputs={outputs} hasModel={hasModel} />

                  {/* Output cards grid */}
                  {allOutputCards.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {allOutputCards.map((card) => (
                        <OutputCard
                          key={card.type}
                          type={card.type}
                          label={card.label}
                          description={card.description}
                          onOpen={() => setActiveView(card.type === "3d_model" ? "3d_model" : "outputs")}
                        />
                      ))}
                    </div>
                  )}

                  {/* What you're seeing */}
                  <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">What you're seeing</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>Follow Cam keeps the skier centered so motion is easier to read.</li>
                      <li>Skeleton overlays help visualize body timing and alignment.</li>
                      <li>The 3D body model lets you inspect the movement from other angles.</li>
                    </ul>
                  </div>
                </>
              )}

              {activeView === "outputs" && (
                <>
                  <ReplayViewer outputs={outputs} hasModel={false} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {outputs.filter((o) => o.available).map((o) => (
                      <OutputCard
                        key={o.type}
                        type={o.type}
                        label={o.label}
                        description={o.description}
                      />
                    ))}
                  </div>
                </>
              )}

              {activeView === "3d_model" && (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-xl border border-border bg-card">
                    <div className="relative flex aspect-video items-center justify-center bg-secondary/20">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <Box className="h-16 w-16 text-primary/30" />
                        <p className="text-sm font-medium text-foreground">3D Body Model</p>
                        <p className="max-w-xs text-xs text-muted-foreground">
                          An interactive 3D replay of the skier's body motion.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeView === "coming_soon" && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <ComingSoonStrip />
                  <p className="mt-4 text-sm text-muted-foreground">
                    SkiRank, per-turn scoring, and detailed technique feedback are being developed. These features will use the same motion data already captured from your clips.
                  </p>
                </div>
              )}
            </div>
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
      <NewAnalysisSheet open={newAnalysisOpen} onOpenChange={(open) => { setNewAnalysisOpen(open); if (!open) setRerunFile(undefined); }} rerunFile={rerunFile} />
    </AppLayout>
  );
}
