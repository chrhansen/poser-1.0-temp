import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { analysisService } from "@/lib/services";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/lib/types";

// TODO_BACKEND_HOOKUP: Wire up real dashboard
export default function DashboardPage() {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analysisService.getResults().then((r) => { setResults(r); setLoading(false); });
  }, []);

  if (loading) return <Layout><PageLoader /></Layout>;

  return (
    <Layout>
      <Section>
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <Button size="sm" asChild><Link to="/#upload">New analysis</Link></Button>
          </div>
          {results.length === 0 ? (
            <EmptyState
              title="No analyses yet"
              description="Upload a clip to get your first analysis."
              action={<Button asChild><Link to="/#upload">Upload clip</Link></Button>}
            />
          ) : (
            <div className="mt-8 space-y-3">
              {results.map((r) => (
                <Link
                  key={r.id}
                  to={`/results/${r.id}`}
                  className="flex items-center justify-between rounded-xl border border-border p-4 transition-shadow hover:shadow-md"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {r.status === "processing" ? "Processing…" : `Score: ${r.scores.overall}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs capitalize text-muted-foreground">{r.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Section>
    </Layout>
  );
}
