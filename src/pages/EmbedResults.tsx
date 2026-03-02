import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PageLoader } from "@/components/shared/PageLoader";
import { PageError } from "@/components/shared/PageError";
import { analysisService } from "@/services/analysis.service";
import type { AnalysisResult } from "@/lib/types";

export default function EmbedResultsPage() {
  const { token } = useParams<{ token: string }>();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analysisService.getEmbedResult(token ?? "").then((r) => {
      setResult(r);
      setLoading(false);
    });
  }, [token]);

  if (loading) return <PageLoader />;
  if (!result) return <PageError message="Result not found or link expired." />;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-lg">
        <h1 className="text-xl font-bold text-foreground">Poser Analysis</h1>
        <div className="mt-6 flex flex-wrap justify-center gap-4 rounded-xl border border-border p-4">
          {Object.entries(result.scores).map(([key, val]) => (
            <div key={key} className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-foreground">{val}</span>
              <span className="text-xs capitalize text-muted-foreground">{key}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {result.feedback.map((f) => (
            <div key={f.id} className="rounded-lg border border-border p-3">
              <p className="text-sm font-medium text-foreground">{f.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Powered by <a href="/" className="underline">Poser</a>
        </p>
      </div>
    </div>
  );
}
