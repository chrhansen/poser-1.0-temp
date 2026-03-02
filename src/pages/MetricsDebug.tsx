import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { metricsService } from "@/lib/services";
import type { MetricsData } from "@/lib/types";

// TODO_BACKEND_HOOKUP: Restrict access to internal/admin users only
export default function MetricsDebugPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    metricsService.getMetrics().then((m) => { setMetrics(m); setLoading(false); });
  }, []);

  if (loading) return <Layout><PageLoader /></Layout>;
  if (!metrics) return null;

  const stats = [
    { label: "Total Users", value: metrics.totalUsers.toLocaleString() },
    { label: "Total Analyses", value: metrics.totalAnalyses.toLocaleString() },
    { label: "Avg Score", value: metrics.avgScore.toFixed(1) },
    { label: "Conversion", value: `${(metrics.conversionRate * 100).toFixed(1)}%` },
  ];

  return (
    <Layout>
      <Section>
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Metrics <span className="text-sm font-normal text-muted-foreground">(internal)</span>
          </h1>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-border p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-xl border border-border p-6">
            <h2 className="text-sm font-semibold text-foreground">Daily Active Users (last 7 days)</h2>
            <div className="mt-4 flex items-end gap-2" style={{ height: 120 }}>
              {metrics.dailyActiveUsers.map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-foreground/10"
                  style={{ height: `${(v / Math.max(...metrics.dailyActiveUsers)) * 100}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </Section>
    </Layout>
  );
}
