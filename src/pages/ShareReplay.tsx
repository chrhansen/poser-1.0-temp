import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { PageLoader } from "@/components/shared/PageLoader";
import { PageError } from "@/components/shared/PageError";
import { analysisService } from "@/services/analysis.service";
import type { AnalysisResult, ReplayOutputType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Video, Bone } from "lucide-react";

const outputIcons: Record<ReplayOutputType, React.ElementType> = {
  head_tracked: Video,
  head_tracked_skeleton: Bone,
  original_skeleton: Video,
};

const viewCaptions: Record<ReplayOutputType, string> = {
  head_tracked: "Head tracking keeps the skier centered so motion is easier to read.",
  head_tracked_skeleton: "Skeleton overlay helps visualize timing and alignment.",
  original_skeleton: "Skeleton overlay shown in the original camera framing.",
};

const viewLabels: Record<ReplayOutputType, string> = {
  head_tracked: "Head Tracked",
  head_tracked_skeleton: "Head Tracked + Skeleton",
  original_skeleton: "Original + Skeleton",
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
    analysisService
      .getResult(id ?? "")
      .then((r) => {
        if (!r || r.status !== "complete") {
          setError(true);
        } else {
          setResult(r);
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

  // Dynamic page title & OG
  useEffect(() => {
    const label = viewLabels[activeTab] ?? "Replay";
    document.title = `${label} replay — Poser`;

    // Update OG meta dynamically
    const setMeta = (prop: string, content: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`) || document.querySelector(`meta[name="${prop}"]`);
      if (el) {
        el.setAttribute("content", content);
      }
    };
    setMeta("og:title", `${label} replay — Poser`);
    setMeta("twitter:title", `${label} replay — Poser`);
    setMeta("og:description", `Watch this ${label} ski replay on Poser.`);
    setMeta("twitter:description", `Watch this ${label} ski replay on Poser.`);
  }, [activeTab]);

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

  // Mock profile data — replace with real data when available
  const profile = result.skierName
    ? { name: result.skierName, date: result.createdAt }
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="container flex h-12 items-center">
          <Link to="/" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
            Poser
          </Link>
        </div>
      </header>

      <main className="container py-6 md:py-10">
        <div className="mx-auto max-w-3xl space-y-4">
          {/* Title + attribution */}
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {viewLabels[activeTab]} replay
            </h1>
            {profile && (
              <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-foreground/80">{profile.name}</span>
                {profile.date && (
                  <>
                    <span className="text-border">·</span>
                    <span>Shared {new Date(profile.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </>
                )}
              </div>
            )}
            {!profile && result.duration && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {result.duration}s clip
              </p>
            )}
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

          {/* Compact caption */}
          <p className="text-xs text-muted-foreground">
            {viewCaptions[activeTab]}
          </p>

          {/* Inline footer CTA */}
          <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
            <span>
              Made with <span className="font-medium text-foreground">Poser</span>
            </span>
            <Link
              to="/"
              className="font-medium text-primary hover:underline"
            >
              Try your own clip →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
