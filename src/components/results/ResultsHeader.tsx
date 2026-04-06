import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { AnalysisResult } from "@/lib/types";
import { formatDate } from "@/lib/date-utils";

interface ResultsHeaderProps {
  result: AnalysisResult;
  onShare?: () => void;
}

export function ResultsHeader({ result, onShare }: ResultsHeaderProps) {
  const navigate = useNavigate();
  const date = formatDate(result.createdAt);
  const clip = result.duration ? `${result.duration}s clip` : null;
  const meta = [date, clip].filter(Boolean).join(" · ");

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5 h-8 w-8 shrink-0"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {result.filename ?? "Clip replay"}
            </h1>
            <Badge variant="secondary" className="text-[10px]">Motion Replay Beta</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{meta}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="sm" className="h-8" aria-label="Download">
          <Download className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="sm" className="h-8" aria-label="Share" onClick={onShare}>
          <Share2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
