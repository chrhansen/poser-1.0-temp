import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { PageError } from "@/components/shared/PageError";
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog";
import { ContactSupportDialog } from "@/components/dialogs/ContactSupportDialog";
import { ModelViewer } from "@/components/results/ModelViewer";
import { analysisService } from "@/services/analysis.service";
import type { AnalysisResult, AnalysisMetrics } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Loader2, Maximize2, Minimize2, Download, RefreshCw, Trash2, Plus,
  AlertTriangle, Clock, CheckCircle, XCircle, HelpCircle,
  Cuboid, BarChart3, GitCompareArrows, RotateCw, Crosshair, Timer,
} from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";

// ─── Shared chart wrapper ───────────────────────────────────────────────────
function MetricChart({ children, height = 160 }: { children: React.ReactNode; height?: number }) {
  return (
    <div className="mt-3" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}

// ─── Metric definitions ─────────────────────────────────────────────────────
type MetricKey = "model" | "edge" | "shin" | "angulation" | "counter" | "angVsInc" | "com" | "turnSegments" | "cadence";

interface MetricDef {
  key: MetricKey;
  label: string;
  sub: string;
  icon: React.ElementType;
}

const METRICS: MetricDef[] = [
  { key: "model", label: "3D Body Model", sub: "Animated 3D pose reconstruction", icon: Cuboid },
  { key: "edge", label: "Edge Similarity", sub: "Edge quality per turn & aggregate", icon: GitCompareArrows },
  { key: "shin", label: "Shin Parallel", sub: "Left/right shin parallelism", icon: BarChart3 },
  { key: "angulation", label: "Angulation", sub: "Upper vs lower body separation", icon: Crosshair },
  { key: "counter", label: "Counter-Rotation", sub: "Torso–pelvis yaw separation", icon: RotateCw },
  { key: "angVsInc", label: "Ang. vs Inclination", sub: "Lower vs upper body lean", icon: GitCompareArrows },
  { key: "com", label: "Center of Mass", sub: "3D world-space COM tracking", icon: Crosshair },
  { key: "turnSegments", label: "Turn Segments", sub: "Discrete left/right turns", icon: Timer },
  { key: "cadence", label: "Turn Cadence", sub: "Tempo & rhythm metrics", icon: Timer },
];

// ─── Metric sidebar nav (desktop) ───────────────────────────────────────────
function MetricNav({ selected, onSelect }: { selected: MetricKey; onSelect: (k: MetricKey) => void }) {
  return (
    <nav className="hidden w-56 shrink-0 space-y-0.5 lg:block">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Metrics</p>
      {METRICS.map((m) => {
        const Icon = m.icon;
        const active = m.key === selected;
        return (
          <button
            key={m.key}
            onClick={() => onSelect(m.key)}
            className={cn(
              "flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors",
              active
                ? "border-l-2 border-accent bg-secondary"
                : "border-l-2 border-transparent hover:bg-secondary/50"
            )}
          >
            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", active ? "text-accent" : "text-muted-foreground")} />
            <div>
              <p className={cn("text-sm font-medium", active ? "text-foreground" : "text-muted-foreground")}>{m.label}</p>
              <p className="text-[11px] text-muted-foreground">{m.sub}</p>
            </div>
          </button>
        );
      })}
    </nav>
  );
}

// ─── Metric dropdown (mobile) ───────────────────────────────────────────────
function MetricDropdown({ selected, onSelect }: { selected: MetricKey; onSelect: (k: MetricKey) => void }) {
  const current = METRICS.find((m) => m.key === selected)!;
  const Icon = current.icon;
  return (
    <div className="lg:hidden">
      <Select value={selected} onValueChange={(v) => onSelect(v as MetricKey)}>
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-accent" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {METRICS.map((m) => {
            const MIcon = m.icon;
            return (
              <SelectItem key={m.key} value={m.key}>
                <div className="flex items-center gap-2">
                  <MIcon className="h-4 w-4" />
                  <span>{m.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

// ─── Overview stat card ─────────────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-border p-3 text-center">
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {sub && <span className="text-[10px] text-muted-foreground">{sub}</span>}
    </div>
  );
}

// ─── Status Badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: AnalysisResult["status"] }) {
  const config = {
    pending: { icon: Clock, label: "Pending", cls: "text-muted-foreground bg-muted" },
    processing: { icon: Loader2, label: "Processing", cls: "text-accent bg-accent/10" },
    complete: { icon: CheckCircle, label: "Complete", cls: "text-foreground bg-secondary" },
    error: { icon: XCircle, label: "Failed", cls: "text-destructive bg-destructive/10" },
  }[status];
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", config.cls)}>
      <Icon className={cn("h-3 w-3", status === "processing" && "animate-spin")} />
      {config.label}
    </span>
  );
}

// ─── Recent Analyses Sidebar ────────────────────────────────────────────────
function RecentSidebar({ results, currentId }: { results: AnalysisResult[]; currentId: string }) {
  return (
    <div className="hidden w-64 shrink-0 border-r border-border p-4 xl:block">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent analyses</h3>
      <div className="mt-3 space-y-2">
        {results.map((r) => (
          <Link
            key={r.id}
            to={`/results/${r.id}`}
            className={cn(
              "block rounded-lg border p-3 text-sm transition-colors",
              r.id === currentId ? "border-foreground bg-secondary" : "border-border hover:bg-secondary/50"
            )}
          >
            <div className="flex items-center justify-between">
              <StatusBadge status={r.status} />
              {r.status === "complete" && r.metrics && (
                <span className="text-xs font-bold text-foreground">{r.metrics.edgeSimilarity.overall}</span>
              )}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {new Date(r.createdAt).toLocaleDateString()}
              {r.duration ? ` · ${r.duration}s` : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Metrics drill-down panels ──────────────────────────────────────────────

function ShinParallelPanel({ m }: { m: AnalysisMetrics }) {
  const avgScore = Math.round(m.shinParallel.reduce((a, b) => a + b.parallelismScore, 0) / m.shinParallel.length);
  const step = Math.max(1, Math.floor(m.shinParallel.length / 80));
  const chartData = m.shinParallel.filter((_, i) => i % step === 0).map((f) => ({
    frame: f.frame, score: f.parallelismScore, angle: Math.round(f.shinAngle * 10) / 10,
  }));
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Shin Parallel</p>
      <p className="text-2xl font-bold text-foreground">{avgScore}<span className="text-sm font-normal text-muted-foreground">/100</span></p>
      <p className="text-xs text-muted-foreground">Average parallelism score across all frames</p>
      <MetricChart height={200}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="frame" tick={{ fontSize: 9 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
            formatter={(val: number, name: string) => [name === "score" ? `${val}/100` : `${val}°`, name === "score" ? "Parallelism" : "Shin Angle"]} />
          <Area type="monotone" dataKey="score" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.1} strokeWidth={2} />
        </AreaChart>
      </MetricChart>
    </div>
  );
}

function COMPanel({ m }: { m: AnalysisMetrics }) {
  const step = Math.max(1, Math.floor(m.com.length / 80));
  const chartData = m.com.filter((_, i) => i % step === 0).map((f) => ({
    frame: f.frame, x: Math.round(f.x * 100) / 100, y: Math.round(f.y * 100) / 100,
  }));
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Center of Mass</p>
      <p className="text-lg font-bold text-foreground">3D Position Tracking</p>
      <p className="text-xs text-muted-foreground">X (lateral), Y (vertical), Z (downhill) per frame</p>
      <MetricChart height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="frame" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 9 }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
          <Line type="monotone" dataKey="x" stroke="hsl(var(--accent))" strokeWidth={1.5} dot={false} name="X (lateral)" />
          <Line type="monotone" dataKey="y" stroke="hsl(var(--foreground))" strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="Y (vertical)" />
        </LineChart>
      </MetricChart>
    </div>
  );
}

function AngulationPanel({ m }: { m: AnalysisMetrics }) {
  const avgAbs = Math.round(m.angulation.reduce((a, b) => a + b.absolute, 0) / m.angulation.length * 10) / 10;
  const step = Math.max(1, Math.floor(m.angulation.length / 80));
  const chartData = m.angulation.filter((_, i) => i % step === 0).map((f) => ({ frame: f.frame, degrees: f.signed }));
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Angulation</p>
          <p className="text-lg font-bold text-foreground">Upper vs Lower Body</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-accent">{avgAbs}°</p>
          <p className="text-[10px] text-muted-foreground">avg separation</p>
        </div>
      </div>
      <MetricChart height={200}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="frame" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 9 }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
            formatter={(val: number) => [`${val}°`, "Angulation"]} />
          <Area type="monotone" dataKey="degrees" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.1} strokeWidth={2} />
        </AreaChart>
      </MetricChart>
    </div>
  );
}

function CounterPanel({ m }: { m: AnalysisMetrics }) {
  const avgAbs = Math.round(m.counter.reduce((a, b) => a + b.absolute, 0) / m.counter.length * 10) / 10;
  const peakAbs = Math.round(Math.max(...m.counter.map((c) => c.absolute)) * 10) / 10;
  const step = Math.max(1, Math.floor(m.counter.length / 80));
  const chartData = m.counter.filter((_, i) => i % step === 0).map((f) => ({ frame: f.frame, signed: f.signed, absolute: f.absolute }));
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Counter-Rotation</p>
          <p className="text-lg font-bold text-foreground">Torso–Pelvis Yaw</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-accent">{avgAbs}°</p>
          <p className="text-[10px] text-muted-foreground">avg counter</p>
        </div>
      </div>
      <MetricChart height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="frame" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 9 }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
            formatter={(val: number, name: string) => [`${val}°`, name === "signed" ? "Signed" : "Absolute"]} />
          <Line type="monotone" dataKey="signed" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} name="signed" />
          <Line type="monotone" dataKey="absolute" stroke="hsl(var(--foreground))" strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="absolute" />
        </LineChart>
      </MetricChart>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatCard label="Avg Counter" value={`${avgAbs}°`} sub="Active counter" />
        <StatCard label="Peak Counter" value={`${peakAbs}°`} sub="Maximum separation" />
      </div>
    </div>
  );
}

function AngVsIncPanel({ m }: { m: AnalysisMetrics }) {
  const step = Math.max(1, Math.floor(m.angulationVsInclination.length / 80));
  const chartData = m.angulationVsInclination.filter((_, i) => i % step === 0).map((f) => ({
    frame: f.frame, lower: f.lowerBodyLean, upper: f.upperBodyLean,
  }));
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Angulation vs Inclination</p>
      <p className="text-lg font-bold text-foreground">Lower vs Upper Body Lean</p>
      <MetricChart height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="frame" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 9 }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
            formatter={(val: number, name: string) => [`${val}°`, name === "lower" ? "Lower Body" : "Upper Body"]} />
          <Line type="monotone" dataKey="lower" stroke="hsl(var(--accent))" strokeWidth={1.5} dot={false} name="lower" />
          <Line type="monotone" dataKey="upper" stroke="hsl(var(--foreground))" strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="upper" />
        </LineChart>
      </MetricChart>
    </div>
  );
}

function TurnSegmentsPanel({ m }: { m: AnalysisMetrics }) {
  const chartData = m.turnSegments.map((t) => ({
    turn: t.id.replace("turn_", "T"), duration: t.durationMs, dir: t.direction,
  }));
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Turn Segments</p>
      <p className="text-lg font-bold text-foreground">{m.turnSegments.length} Turns Detected</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {m.turnSegments.map((t) => (
          <span key={t.id} className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium",
            t.direction === "left" ? "bg-accent/10 text-accent" : "bg-secondary text-foreground"
          )}>
            {t.direction === "left" ? "L" : "R"} · {t.durationMs}ms
          </span>
        ))}
      </div>
      <MetricChart height={160}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="turn" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 9 }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
            formatter={(val: number) => [`${val}ms`, "Duration"]} />
          <Bar dataKey="duration" fill="hsl(var(--accent))" radius={[3, 3, 0, 0]} />
        </BarChart>
      </MetricChart>
    </div>
  );
}

function EdgeSimilarityPanel({ m }: { m: AnalysisMetrics }) {
  const e = m.edgeSimilarity;
  const barData = e.perTurn.map((t) => ({
    turn: t.turnId.replace("turn_", "T"),
    score: t.score,
  }));
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Edge Similarity</p>
      <div className="flex items-baseline gap-6">
        <p className="text-4xl font-bold text-foreground">{e.overall}</p>
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-xl font-bold text-foreground">{e.left}</p>
            <p className="text-[10px] text-muted-foreground">Left Turns</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-muted-foreground">{e.right}</p>
            <p className="text-[10px] text-muted-foreground">Right Turns</p>
          </div>
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Overall edge quality score based on apex shin parallelism.</p>
      {barData.length > 0 && (
        <>
          <p className="mt-6 text-[10px] uppercase tracking-widest text-muted-foreground">Per-Turn Edge Score</p>
          <MetricChart height={180}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="turn" tick={{ fontSize: 9 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                formatter={(val: number) => [`${val}/100`, "Edge Score"]} />
              <Bar dataKey="score" fill="hsl(var(--accent))" radius={[3, 3, 0, 0]} />
            </BarChart>
          </MetricChart>
        </>
      )}
    </div>
  );
}

function TurnCadencePanel({ m }: { m: AnalysisMetrics }) {
  const c = m.turnCadence;
  const cvLabel = c.turnDurationCv < 0.2 ? "Consistent" : c.turnDurationCv < 0.35 ? "Moderate" : "Variable";
  return (
    <div>
      <div className="rounded-lg border border-border bg-secondary/50 p-6 text-center">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Turn Cadence</p>
        <p className="mt-2 text-4xl font-bold text-accent">{c.tpmMedian}</p>
        <p className="text-sm text-muted-foreground">median turns per minute</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <StatCard label="TPM Peak (6)" value={c.tpmPeak6} sub="tpm" />
        <StatCard label="Duration CV" value={`${Math.round(c.turnDurationCv * 100)}%`} sub={cvLabel} />
        <StatCard label="Total Turns" value={m.turnSegments.length} />
      </div>
    </div>
  );
}

// ─── 3D Model panel ─────────────────────────────────────────────────────────
function ModelPanel({ result, videoTime, videoPlaying, onSeek }: {
  result: AnalysisResult; videoTime: number; videoPlaying: boolean; onSeek: (t: number) => void;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">3D Body Model</p>
      <p className="text-lg font-bold text-foreground">Pose Reconstruction</p>
      <div className="mt-4">
        <ModelViewer
          duration={result.duration ?? 10}
          currentTime={videoTime}
          onSeek={onSeek}
          isPlaying={videoPlaying}
          modelUrl={result.modelUrl}
          className="border-0"
        />
      </div>
    </div>
  );
}

// ─── Metric content renderer ────────────────────────────────────────────────
function MetricContent({ metricKey, m, result, videoTime, videoPlaying, onSeek }: {
  metricKey: MetricKey; m: AnalysisMetrics; result: AnalysisResult;
  videoTime: number; videoPlaying: boolean; onSeek: (t: number) => void;
}) {
  switch (metricKey) {
    case "model": return <ModelPanel result={result} videoTime={videoTime} videoPlaying={videoPlaying} onSeek={onSeek} />;
    case "edge": return <EdgeSimilarityPanel m={m} />;
    case "shin": return <ShinParallelPanel m={m} />;
    case "angulation": return <AngulationPanel m={m} />;
    case "counter": return <CounterPanel m={m} />;
    case "angVsInc": return <AngVsIncPanel m={m} />;
    case "com": return <COMPanel m={m} />;
    case "turnSegments": return <TurnSegmentsPanel m={m} />;
    case "cadence": return <TurnCadencePanel m={m} />;
  }
}

// ─── Main Results Page ──────────────────────────────────────────────────────
export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [allResults, setAllResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("edge");
  const [theater, setTheater] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoTime, setVideoTime] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [r, all] = await Promise.all([
        analysisService.getResult(id ?? ""),
        analysisService.getResults(),
      ]);
      if (!r) { setError(true); setLoading(false); return; }
      setResult(r);
      setAllResults(all);
      setLoading(false);
    } catch {
      setError(true);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { setLoading(true); setError(false); loadData(); }, [loadData]);

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
    toast.success("Analysis deleted.");
    navigate("/dashboard");
  };

  const handleRerun = async () => {
    if (!result) return;
    await analysisService.rerunAnalysis(result.id);
    toast.success("Re-running analysis…");
    setResult({ ...result, status: "processing", progress: 0, failedReason: undefined });
  };

  if (loading) return <AppLayout><PageLoader /></AppLayout>;
  if (error || !result) return <AppLayout><PageError message="Result not found." onRetry={loadData} /></AppLayout>;

  // ── Non-complete states ──
  if (result.status === "pending") {
    return (
      <AppLayout>
        <div className="flex flex-1">
          <RecentSidebar results={allResults} currentId={result.id} />
          <div className="flex-1">
            <Section>
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <Clock className="h-10 w-10 text-muted-foreground" />
                <h1 className="text-2xl font-bold text-foreground">Queued for analysis</h1>
                <p className="text-muted-foreground">Your clip is in the queue. Analysis will begin shortly.</p>
              </div>
            </Section>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (result.status === "processing") {
    return (
      <AppLayout>
        <div className="flex flex-1">
          <RecentSidebar results={allResults} currentId={result.id} />
          <div className="flex-1">
            <Section>
              <div className="mx-auto flex max-w-md flex-col items-center gap-6 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-accent" />
                <h1 className="text-2xl font-bold text-foreground">Analyzing your clip…</h1>
                <p className="text-muted-foreground">This usually takes 1–2 minutes.</p>
                <div className="w-full">
                  <Progress value={result.progress ?? 0} className="h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">{result.progress ?? 0}% complete</p>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (result.status === "error") {
    return (
      <AppLayout>
        <div className="flex flex-1">
          <RecentSidebar results={allResults} currentId={result.id} />
          <div className="flex-1">
            <Section>
              <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
                <AlertTriangle className="h-10 w-10 text-destructive" />
                <h1 className="text-2xl font-bold text-foreground">Analysis failed</h1>
                <p className="text-sm text-muted-foreground">{result.failedReason ?? "An unexpected error occurred."}</p>
                <div className="flex gap-3">
                  <Button onClick={handleRerun}><RefreshCw className="mr-2 h-4 w-4" />Re-run analysis</Button>
                  <Button variant="outline" onClick={() => setSupportOpen(true)}><HelpCircle className="mr-2 h-4 w-4" />Contact support</Button>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />Delete analysis
                </Button>
              </div>
            </Section>
          </div>
        </div>
        <ConfirmActionDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete analysis?" description="This action cannot be undone." confirmLabel="Delete" destructive onConfirm={handleDelete} />
        <ContactSupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
      </AppLayout>
    );
  }

  // ── Complete state ──
  const m = result.metrics;

  const handleVideoTimeUpdate = () => { if (videoRef.current) setVideoTime(videoRef.current.currentTime); };
  const handleVideoPlay = () => setVideoPlaying(true);
  const handleVideoPause = () => setVideoPlaying(false);
  const handleModelSeek = (time: number) => {
    if (videoRef.current) { videoRef.current.currentTime = time; setVideoTime(time); }
  };

  return (
    <AppLayout>
      <div className="flex flex-1">
        <RecentSidebar results={allResults} currentId={result.id} />
        <div className="flex-1 overflow-auto">
          <Section>
            <div className="mx-auto max-w-5xl">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Your Results</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(result.createdAt).toLocaleDateString()}
                    {result.duration ? ` · ${result.duration}s clip` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {m && (
                    <span className="rounded-full border border-border px-3 py-1 text-sm font-bold text-foreground">
                      Score {m.edgeSimilarity.overall}
                    </span>
                  )}
                  <Button variant="outline" size="sm" aria-label="Download results">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate("/#upload")}>
                    <Plus className="mr-1 h-4 w-4" /> New
                  </Button>
                </div>
              </div>

              {/* Metric nav dropdown (mobile) */}
              {m && (
                <div className="mt-6">
                  <MetricDropdown selected={selectedMetric} onSelect={setSelectedMetric} />
                </div>
              )}

              {/* Content area: sidebar + metric panel */}
              {m && (
                <div className="mt-6 flex gap-6">
                  <MetricNav selected={selectedMetric} onSelect={setSelectedMetric} />
                  <div className="min-w-0 flex-1 rounded-xl border border-border p-5">
                    <MetricContent
                      metricKey={selectedMetric}
                      m={m}
                      result={result}
                      videoTime={videoTime}
                      videoPlaying={videoPlaying}
                      onSeek={handleModelSeek}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-8 flex gap-3 border-t border-border pt-6">
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSupportOpen(true)}>
                  <HelpCircle className="mr-2 h-4 w-4" /> Support
                </Button>
              </div>
            </div>
          </Section>
        </div>
      </div>

      <ConfirmActionDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete analysis?" description="This will permanently remove this analysis and all associated data." confirmLabel="Delete" destructive onConfirm={handleDelete} />
      <ContactSupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
    </AppLayout>
  );
}
