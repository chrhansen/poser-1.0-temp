import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { AppLayout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { PageError } from "@/components/shared/PageError";
import { EmptyState } from "@/components/shared/EmptyState";
import { embedClipsService } from "@/services/embed-clips.service";
import { partnersService } from "@/services/partners.service";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EmbedClip, Partner } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Clock, Loader2, CheckCircle, XCircle, Search, Globe } from "lucide-react";
import { RelativeDate } from "@/components/shared/RelativeDate";

const PAGE_SIZE = 20;

const statusConfig: Record<EmbedClip["status"], { label: string; cls: string }> = {
  pending: { label: "Queued", cls: "text-muted-foreground" },
  processing: { label: "Processing", cls: "text-accent-foreground" },
  complete: { label: "Ready", cls: "text-primary" },
  error: { label: "Failed", cls: "text-destructive" },
  not_ski: { label: "Not a ski clip", cls: "text-destructive" },
};

function StatusBadge({ status }: { status: EmbedClip["status"] }) {
  const { label, cls } = statusConfig[status];
  return (
    <Badge variant="outline" className={cn("text-[10px] font-medium", cls)}>
      {status === "processing" && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
      {status === "complete" && <CheckCircle className="mr-1 h-3 w-3" />}
      {status === "pending" && <Clock className="mr-1 h-3 w-3" />}
      {status === "error" && <XCircle className="mr-1 h-3 w-3" />}
      {label}
    </Badge>
  );
}

function OutputChips({ c }: { c: EmbedClip }) {
  if (c.status !== "complete" || !c.result?.replayOutputs) return <span className="text-xs text-muted-foreground">—</span>;
  const available = c.result.replayOutputs.filter((o) => o.available);
  if (available.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {available.map((o) => (
        <span
          key={o.type}
          className="rounded-full bg-accent/60 px-2 py-0.5 text-[10px] font-medium text-accent-foreground"
        >
          {o.label}
        </span>
      ))}
    </div>
  );
}

function ClipCard({ c }: { c: EmbedClip }) {
  const navigate = useNavigate();
  return (
    <div
      className="cursor-pointer rounded-xl border border-border p-4 transition-shadow hover:shadow-md"
      onClick={() => navigate(`/embeds-clips/${c.id}`)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{c.submitterEmail}</p>
          <p className="mt-0.5 text-xs text-muted-foreground truncate">{c.filename}</p>
        </div>
        <StatusBadge status={c.status} />
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Globe className="h-3 w-3" />
        <span className="truncate">{c.partnerName} · {c.partnerDomain}</span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <RelativeDate date={c.submittedAt} className="text-xs text-muted-foreground" />
        <OutputChips c={c} />
      </div>
    </div>
  );
}

function ClipRow({ c }: { c: EmbedClip }) {
  const navigate = useNavigate();
  return (
    <div
      className="grid cursor-pointer grid-cols-[1.4fr_1.4fr_1fr_0.8fr_1fr_auto] items-center gap-4 border-b border-border px-4 py-3 text-sm transition-colors hover:bg-secondary/50 last:border-0"
      onClick={() => navigate(`/embeds-clips/${c.id}`)}
    >
      <div className="min-w-0">
        <p className="font-medium text-foreground truncate">{c.submitterEmail}</p>
        <p className="text-xs text-muted-foreground truncate">{c.filename}</p>
      </div>
      <div className="min-w-0">
        <p className="font-medium text-foreground truncate">{c.partnerName}</p>
        <p className="text-xs text-muted-foreground truncate">{c.partnerDomain}</p>
      </div>
      <RelativeDate date={c.submittedAt} className="text-xs text-muted-foreground" />
      <StatusBadge status={c.status} />
      <OutputChips c={c} />
      <span className="text-muted-foreground">→</span>
    </div>
  );
}

export default function EmbedClipsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [partners, setPartners] = useState<Partner[]>([]);
  const [clips, setClips] = useState<EmbedClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const partnerSlug = searchParams.get("embed") ?? "all";
  const status = (searchParams.get("status") as EmbedClip["status"] | "all" | null) ?? "all";
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const search = searchParams.get("q") ?? "";

  const sentinelRef = useRef<HTMLDivElement>(null);

  const filterParams = useMemo(
    () => ({ partnerSlug, status: status as EmbedClip["status"] | "all", search }),
    [partnerSlug, status, search]
  );

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  const loadData = useCallback(() => {
    setLoading(true);
    setError(false);
    embedClipsService
      .listEmbedClips({ ...filterParams, offset: 0, limit: PAGE_SIZE })
      .then((res) => {
        setClips(res.data);
        setHasMore(res.hasMore);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [filterParams]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    embedClipsService
      .listEmbedClips({ ...filterParams, offset: clips.length, limit: PAGE_SIZE })
      .then((res) => {
        setClips((prev) => [...prev, ...res.data]);
        setHasMore(res.hasMore);
        setLoadingMore(false);
      })
      .catch(() => setLoadingMore(false));
  }, [loadingMore, hasMore, clips.length, filterParams]);

  useEffect(() => {
    document.title = "Poser — Embed clips";
    partnersService.getPartners().then(setPartners);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Debounce search input → URL
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== search) setParam("q", searchInput);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <AppLayout>
      <Section compact>
        <div className="mx-auto max-w-5xl">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Embed clips</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Clips submitted through your embed widgets.
            </p>
          </div>

          {/* Filter bar */}
          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_1.4fr]">
            <Select value={partnerSlug} onValueChange={(v) => setParam("embed", v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All embeds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All embeds</SelectItem>
                {partners.map((p) => (
                  <SelectItem key={p.id} value={p.slug ?? p.id}>
                    {p.name} · {p.domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={(v) => setParam("status", v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="complete">Ready</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="pending">Queued</SelectItem>
                <SelectItem value="error">Failed</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by email or filename"
                className="h-9 pl-9 text-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-16"><PageLoader /></div>
          ) : error ? (
            <PageError message="Failed to load embed clips." onRetry={loadData} />
          ) : clips.length === 0 ? (
            <EmptyState
              title="No clips found"
              description="No clips submitted yet through your embeds, or none match these filters."
            />
          ) : (
            <>
              {/* Mobile cards */}
              <div className="mt-6 space-y-3 md:hidden">
                {clips.map((c) => <ClipCard key={c.id} c={c} />)}
              </div>

              {/* Desktop table */}
              <div className="mt-6 hidden overflow-hidden rounded-xl border border-border md:block">
                <div className="grid grid-cols-[1.4fr_1.4fr_1fr_0.8fr_1fr_auto] gap-4 border-b border-border bg-secondary/50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Submitter</span>
                  <span>Embed</span>
                  <span>Submitted</span>
                  <span>Status</span>
                  <span>Outputs</span>
                  <span />
                </div>
                {clips.map((c) => <ClipRow key={c.id} c={c} />)}
              </div>

              <div ref={sentinelRef} className="flex justify-center py-6">
                {loadingMore && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                {!hasMore && clips.length > 0 && (
                  <p className="text-xs text-muted-foreground">All clips loaded</p>
                )}
              </div>
            </>
          )}
        </div>
      </Section>
    </AppLayout>
  );
}
