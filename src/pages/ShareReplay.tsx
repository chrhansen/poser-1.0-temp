import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { PageLoader } from "@/components/shared/PageLoader";
import { PageError } from "@/components/shared/PageError";
import { analysisService } from "@/services/analysis.service";
import type { AnalysisResult, ReplayOutput, ReplayOutputType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Video, Bone } from "lucide-react";

const outputIcons: Record<ReplayOutputType, React.ElementType> = {
  head_tracked: Video,
  head_tracked_skeleton: Bone,
  original_skeleton: Video,
};

const viewDescriptions: Record<ReplayOutputType, string> = {
  head_tracked: "Keeps the skier centered so motion is easier to read.",
  head_tracked_skeleton: "Adds a skeleton overlay to help visualize timing and alignment.",
  original_skeleton: "Shows the overlay in the original camera framing.",
};

export default function ShareReplayPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const defaultView = (searchParams.get("view") as ReplayOutputType) || "head_tracked";

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<ReplayOutputType>(defaultView);

  useEffect(() => {
    document.title = "Shared replay — Poser";
    analysisService
      .getResult(id ?? "")
      .then((r) => {
        if (!r || r.status !== "complete") {
          setError(true);
        } else {
          setResult(r);
          // Validate default view exists
          const outputs = (r.replayOutputs ?? []).filter((o) => o.available);
          const viewExists = outputs.some((o) => o.type === defaultView);
          if (!viewExists && outputs.length > 0) {
            setActiveTab(outputs[0].type);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id, defaultView]);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <PageLoader />
      </div>
    );
  if (error || !result)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <PageError message="Replay not found or no longer available." />
      </div>
    );

  const outputs = (result.replayOutputs ?? []).filter((o) => o.available);
  const current = outputs.find((o) => o.type === activeTab) ?? outputs[0];

  const titleLabel =
    current?.label
      ? `${current.label} replay`
      : "Shared ski replay";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="container flex h-12 items-center justify-between">
          <Link to="/" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
            Poser
          </Link>
        </div>
      </header>

      <main className="container py-6 md:py-10">
        <div className="mx-auto max-w-3xl space-y-5">
          {/* Title */}
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {titleLabel}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Shared replay · {result.duration ? `${result.duration}s` : ""}
            </p>
          </div>

          {/* Replay viewer */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto border-b border-border bg-secondary/30 p-1.5">
              {outputs.map((tab) => {
                const Icon = outputIcons[tab.type] ?? Video;
                const isActive = tab.type === activeTab;
                return (
                  <button
                    key={tab.type}
                    onClick={() => setActiveTab(tab.type)}
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                      isActive
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Video area */}
            <div className="relative flex aspect-video items-center justify-center bg-secondary/20">
              <div className="flex flex-col items-center gap-3 text-center">
                <Video className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm font-medium text-foreground">{current?.label}</p>
                <p className="max-w-xs text-xs text-muted-foreground">{current?.description}</p>
              </div>
            </div>
          </div>

          {/* What you're seeing */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <h3 className="text-sm font-semibold text-foreground">What you're seeing</h3>
            <p className="text-sm text-muted-foreground">
              {viewDescriptions[activeTab]}
            </p>
          </div>

          {/* CTA */}
          <div className="rounded-xl border border-border bg-card p-5 text-center space-y-2">
            <p className="text-sm font-medium text-foreground">Made with Poser</p>
            <p className="text-xs text-muted-foreground">
              Upload your own ski clip and get motion replay outputs in minutes.
            </p>
            <Link
              to="/"
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Try your own clip
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
