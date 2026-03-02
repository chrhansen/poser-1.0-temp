import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { PageError } from "@/components/shared/PageError";
import { analysisService } from "@/lib/services";
import type { AnalysisResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

function ScoreRing({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-border text-xl font-bold text-foreground">
        {score}
      </div>
      <span className="text-xs text-muted-foreground capitalize">{label}</span>
    </div>
  );
}

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    analysisService.getResult(id ?? "").then((r) => {
      if (!r) setError(true);
      else setResult(r);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <Layout><PageLoader /></Layout>;
  if (error || !result) return <Layout><PageError message="Result not found." /></Layout>;

  if (result.status === "processing") {
    return (
      <Layout>
        <Section>
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <h1 className="text-2xl font-bold text-foreground">Analyzing your clip…</h1>
            <p className="text-muted-foreground">This usually takes 1-2 minutes.</p>
          </div>
        </Section>
      </Layout>
    );
  }

  return (
    <Layout>
      <Section>
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Your Results</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Analyzed on {new Date(result.createdAt).toLocaleDateString()}
          </p>

          {/* Scores */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 rounded-xl border border-border bg-surface-sunken p-6">
            <ScoreRing label="Overall" score={result.scores.overall} />
            <ScoreRing label="Stance" score={result.scores.stance} />
            <ScoreRing label="Balance" score={result.scores.balance} />
            <ScoreRing label="Edging" score={result.scores.edging} />
            <ScoreRing label="Rotation" score={result.scores.rotation} />
          </div>

          {/* Feedback */}
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Feedback</h2>
            {result.feedback.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "rounded-lg border p-4",
                  item.severity === "critical" && "border-destructive/30 bg-destructive/5",
                  item.severity === "warning" && "border-accent/30 bg-accent/5",
                  item.severity === "info" && "border-border"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "inline-block h-2 w-2 rounded-full",
                    item.severity === "critical" && "bg-destructive",
                    item.severity === "warning" && "bg-accent",
                    item.severity === "info" && "bg-muted-foreground"
                  )} />
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </Layout>
  );
}
