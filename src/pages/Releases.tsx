import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { releasesService } from "@/lib/services";
import type { Release } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    releasesService.getReleases().then((r) => { setReleases(r); setLoading(false); });
  }, []);

  if (loading) return <Layout><PageLoader /></Layout>;

  return (
    <Layout>
      <Section>
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Releases</h1>
          <p className="mt-2 text-muted-foreground">What's new in Poser.</p>
          <div className="mt-10 space-y-10">
            {releases.map((rel) => (
              <div key={rel.id} className="border-l-2 border-border pl-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-sm font-mono text-muted-foreground">v{rel.version}</span>
                  <span className="text-xs text-muted-foreground">{rel.date}</span>
                </div>
                <h2 className="mt-1 text-lg font-semibold text-foreground">{rel.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{rel.description}</p>
                <ul className="mt-3 space-y-1.5">
                  {rel.changes.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className={cn(
                        "mt-1 inline-block h-1.5 w-1.5 rounded-full shrink-0",
                        c.type === "feature" && "bg-accent",
                        c.type === "fix" && "bg-destructive",
                        c.type === "improvement" && "bg-muted-foreground"
                      )} />
                      <span className="text-muted-foreground">{c.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </Layout>
  );
}
