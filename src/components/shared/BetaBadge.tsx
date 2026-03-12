import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function BetaBadge({ className = "" }: { className?: string }) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <Badge
          className={`text-[10px] px-1.5 py-0 font-semibold bg-primary/15 text-primary border border-primary/30 hover:bg-primary/15 cursor-default ${className}`}
        >
          Beta
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6} className="max-w-52 text-center">
        Not all features are fully functioning. Until then, Poser is free.
      </TooltipContent>
    </Tooltip>
  );
}
