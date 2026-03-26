import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const pipelineSteps = [
  "Uploading clip",
  "Tracking skier",
  "Estimating pose",
  "Rendering replay",
  "Preparing 3D model",
];

interface ProcessingStepperProps {
  progress: number; // 0–100
}

export function ProcessingStepper({ progress }: ProcessingStepperProps) {
  // Map progress to active step index (0-4)
  const activeIndex = Math.min(Math.floor(progress / 20), pipelineSteps.length - 1);

  return (
    <div className="space-y-2">
      {pipelineSteps.map((step, i) => {
        const isDone = i < activeIndex;
        const isActive = i === activeIndex;
        return (
          <div key={step} className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors",
                isDone
                  ? "bg-primary text-primary-foreground"
                  : isActive
                  ? "bg-accent text-accent-foreground ring-2 ring-primary/30"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-sm",
                isDone
                  ? "text-muted-foreground line-through"
                  : isActive
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
