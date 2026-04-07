import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Share2, Check, Film } from "lucide-react";
import type { ReplayOutputType } from "@/lib/types";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const viewLabels: Record<ReplayOutputType, string> = {
  head_tracked: "Head Tracked",
  head_tracked_skeleton: "Head Tracked + Skeleton",
  original_skeleton: "Original + Skeleton",
};

interface ShareClipSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clipId: string;
  activeView: ReplayOutputType;
}

export function ShareClipSheet({
  open,
  onOpenChange,
  clipId,
  activeView,
}: ShareClipSheetProps) {
  const [copied, setCopied] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const isMobile = useIsMobile();
  const supportsShare = typeof navigator !== "undefined" && !!navigator.share;

  const shareUrl = `${window.location.origin}/s/${clipId}?view=${activeView}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy link.");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${viewLabels[activeView]} replay — Poser`,
          url: shareUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  };

  const handleShareVideo = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${viewLabels[activeView]} — Poser`,
          text: `Check out this ${viewLabels[activeView]} replay`,
          url: shareUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      toast.info("Use the download button to save the video first, then share it.");
    }
  };

  const handleClose = (v: boolean) => {
    onOpenChange(v);
    if (!v) setShowMore(false);
  };

  const content = (
    <>
      {/* Preview header */}
      <p className="text-xs text-muted-foreground">
        Sharing: <span className="font-medium text-foreground">{viewLabels[activeView]}</span>
      </p>

      {/* Link preview */}
      <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2">
        <p className="flex-1 truncate text-xs text-muted-foreground select-all">{shareUrl}</p>
      </div>

      {/* Actions */}
      <div className="mt-2.5 flex gap-2">
        <Button size="sm" className="flex-1" onClick={handleCopy}>
          {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy link"}
        </Button>
        {supportsShare && (
          <Button size="sm" variant="outline" className="flex-1" onClick={handleNativeShare}>
            <Share2 className="mr-1.5 h-3.5 w-3.5" />
            Share link…
          </Button>
        )}
      </div>

      {/* Helper */}
      <p className="mt-2.5 text-[11px] text-muted-foreground">
        Opens on this view. Viewers can switch tabs.
      </p>

      {/* More options */}
      {!showMore ? (
        <button
          onClick={() => setShowMore(true)}
          className="mt-2 text-xs font-medium text-primary hover:underline"
        >
          More options
        </button>
      ) : (
        <div className="mt-2">
          <Button size="sm" variant="outline" className="w-full" onClick={handleShareVideo}>
            <Film className="mr-1.5 h-3.5 w-3.5" />
            Share selected MP4
          </Button>
        </div>
      )}

      {/* Privacy */}
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Anyone with the link can watch.
      </p>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-5 pt-4">
          <SheetHeader className="pb-0">
            <SheetTitle className="text-base">Share replay</SheetTitle>
          </SheetHeader>
          <div className="mt-2">{content}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[520px] gap-3 p-5">
        <DialogHeader className="pb-0">
          <DialogTitle className="text-base">Share replay</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
