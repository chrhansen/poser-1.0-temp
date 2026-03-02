import { useEffect, useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { EmptyState } from "@/components/shared/EmptyState";
import { releasesService } from "@/services/releases.service";
import { Input } from "@/components/ui/input";
import type { Release } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

export default function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState<string | null>(null);

  useEffect(() => {
    releasesService.getReleases().then((r) => {
      setReleases(r);
      setLoading(false);
    });
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    releases.forEach((r) => r.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [releases]);

  const filtered = useMemo(() => {
    let result = [...releases].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.changes.some((c) => c.text.toLowerCase().includes(q))
      );
    }
    if (filterTag) {
      result = result.filter((r) => r.tags?.includes(filterTag));
    }
    return result;
  }, [releases, search, filterTag]);

  if (loading) return <Layout><PageLoader /></Layout>;

  return (
    <Layout>
      <Section>
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Releases</h1>
          <p className="mt-2 text-muted-foreground">What's new in Poser.</p>

          {/* Search + filters */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search releases…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setFilterTag(null)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    !filterTag ? "bg-foreground text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  All
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                      filterTag === tag ? "bg-foreground text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Releases list */}
          {filtered.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                title="No releases found"
                description={search ? "Try a different search term." : "No releases yet."}
              />
            </div>
          ) : (
            <div className="mt-10 space-y-10">
              {filtered.map((rel) => (
                <div key={rel.id} className="border-l-2 border-border pl-6">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-sm text-muted-foreground">v{rel.version}</span>
                    <span className="text-xs text-muted-foreground">{rel.date}</span>
                    {rel.tags?.map((t) => (
                      <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h2 className="mt-1 text-lg font-semibold text-foreground">{rel.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{rel.description}</p>
                  <ul className="mt-3 space-y-1.5">
                    {rel.changes.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className={cn(
                          "mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full",
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
          )}
        </div>
      </Section>
    </Layout>
  );
}
