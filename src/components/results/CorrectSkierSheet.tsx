import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { SkierSelectStep } from "@/components/shared/SkierSelectStep";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CorrectSkierSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** URL of the trimmed clip to re-pick from. */
  videoUrl: string;
}

export function CorrectSkierSheet({ open, onOpenChange, videoUrl }: CorrectSkierSheetProps) {
  const isMobile = useIsMobile();
  const [duration, setDuration] = useState(0);
  const [selection, setSelection] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!open || !videoUrl) return;
    setDuration(0);
    setSelection(null);
    const v = document.createElement("video");
    v.src = videoUrl;
    v.preload = "metadata";
    const onMeta = () => setDuration(v.duration || 0);
    v.addEventListener("loadedmetadata", onMeta, { once: true });
    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      v.src = "";
    };
  }, [open, videoUrl]);

  const handleReanalyze = () => {
    // TODO_BACKEND_HOOKUP: submit corrected skier selection to re-analyze the clip
    toast.success("Re-analyzing with the correct skier… (UI-only demo)");
    onOpenChange(false);
  };

  const body = (
    <div className="flex flex-col gap-4 px-4 py-5 sm:px-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">
          Pick a frame where you're clearly visible, then tap the right person.
          We'll re-run the analysis tracking them instead.
        </p>
      </div>

      {duration > 0 && videoUrl ? (
        <SkierSelectStep
          videoUrl={videoUrl}
          duration={duration}
          trimStart={0}
          trimEnd={duration}
          selection={selection}
          onSelectionChange={setSelection}
        />
      ) : (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading clip…
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          className="w-full"
          disabled={!selection}
          onClick={handleReanalyze}
        >
          {selection ? "Re-analyze with this person" : "Tap the right person to continue"}
        </Button>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="flex h-[92dvh] flex-col p-0 rounded-t-xl [&>button]:hidden"
        >
          <div className="border-b border-border px-4 py-3 sm:px-6">
            <SheetTitle className="text-base font-semibold">Tracking the wrong person?</SheetTitle>
            <SheetDescription className="sr-only">
              Pick the correct skier from the clip to re-analyze.
            </SheetDescription>
          </div>
          <div className="overflow-y-auto">{body}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-w-lg flex-col overflow-hidden rounded-xl p-0 max-h-[85vh]">
        <div className="border-b border-border px-4 py-3 sm:px-6">
          <DialogTitle className="text-base font-semibold">Tracking the wrong person?</DialogTitle>
          <DialogDescription className="sr-only">
            Pick the correct skier from the clip to re-analyze.
          </DialogDescription>
        </div>
        <div className="overflow-y-auto">{body}</div>
      </DialogContent>
    </Dialog>
  );
}