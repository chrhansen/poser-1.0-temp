import { formatRelativeDate, formatAbsoluteTimestamp } from "@/lib/date-utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RelativeDateProps {
  date: string | Date;
  className?: string;
  suffix?: string;
}

/**
 * Renders a relative date (e.g. "5m ago") with an absolute tooltip,
 * or a short absolute date for older entries.
 */
export function RelativeDate({ date, className, suffix }: RelativeDateProps) {
  const { text, isRelative } = formatRelativeDate(date);
  const display = suffix ? `${text} · ${suffix}` : text;

  if (!isRelative) {
    return <span className={className}>{display}</span>;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={className} style={{ cursor: "default" }}>
            {display}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {formatAbsoluteTimestamp(date)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
