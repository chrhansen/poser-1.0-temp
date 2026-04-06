import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Copy, Share2, Check, Film } from "lucide-react";
import type { ReplayOutputType } from "@/lib/types";
import { toast } from "sonner";

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-6 pt-4">
        <SheetHeader className="pb-1">
          <SheetTitle className="text-base">Share clip</SheetTitle>
        </SheetHeader>

        {/* Primary: share current view */}
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-foreground">Share current view</p>
          <p className="text-xs text-muted-foreground">
            Visitors land on <span className="font-medium text-foreground">{viewLabels[activeView]}</span> first and can switch between replay views.
          </p>
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="flex-1" onClick={handleCopy}>
              {copied ? (
                <Check className="mr-1.5 h-3.5 w-3.5" />
              ) : (
                <Copy className="mr-1.5 h-3.5 w-3.5" />
              )}
              {copied ? "Copied!" : "Copy link"}
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={handleNativeShare}>
              <Share2 className="mr-1.5 h-3.5 w-3.5" />
              Share…
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-border" />

        {/* Secondary: share video file */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Share current video file</p>
          <p className="text-xs text-muted-foreground">
            Send or save the currently selected MP4.
          </p>
          <Button size="sm" variant="outline" className="w-full" onClick={handleShareVideo}>
            <Film className="mr-1.5 h-3.5 w-3.5" />
            Share video
          </Button>
        </div>

        {/* Privacy note */}
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Anyone with the link can view it.
        </p>
      </SheetContent>
    </Sheet>
  );
}
