import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type FeedbackVariant = "replay" | "failed" | "not_ski";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: FeedbackVariant;
  /** Optional initial sentiment for the replay variant. */
  initialSentiment?: "up" | "down" | null;
  /** Optional context (e.g. clip id) sent with the feedback payload. */
  clipId?: string;
}

type Copy = {
  title: string;
  description: string;
  categoryLabel: string;
  categories: { value: string; label: string }[];
  placeholder: string;
  submitLabel: string;
  successTitle: string;
  successBody: string;
  showSentiment?: boolean;
};

const COPY: Record<FeedbackVariant, Copy> = {
  replay: {
    title: "Was this replay useful?",
    description: "Tell us what worked or what felt off — it shapes what we ship next.",
    categoryLabel: "What's this about?",
    categories: [
      { value: "tracking", label: "Tracking / Skeleton quality" },
      { value: "ui", label: "User interface / Using Poser's web app" },
      { value: "metrics", label: "Metrics / Data / Feedback" },
      { value: "idea", label: "Your feature idea" },
      { value: "other", label: "Something else" },
    ],
    placeholder: "What stood out — good or bad?",
    submitLabel: "Send feedback",
    successTitle: "Thanks for the nudge",
    successBody: "Every note goes straight to the team building Poser.",
    showSentiment: true,
  },
  failed: {
    title: "Help us debug this clip",
    description: "A short note about the source clip helps us track down the failure faster.",
    categoryLabel: "What was the clip like?",
    categories: [
      { value: "phone", label: "Filmed on a phone" },
      { value: "gopro", label: "GoPro / action cam" },
      { value: "drone", label: "Drone footage" },
      { value: "edited", label: "Already edited / exported" },
      { value: "other", label: "Other" },
    ],
    placeholder: "Anything unusual about the lighting, framing, or skier?",
    submitLabel: "Send debug note",
    successTitle: "Got it — thanks",
    successBody: "We'll use this to investigate why the clip failed.",
  },
  not_ski: {
    title: "Is this actually skiing?",
    description: "If we got it wrong, let us know — these reports directly tune the detector.",
    categoryLabel: "What's in the clip?",
    categories: [
      { value: "alpine", label: "Yes — alpine skiing" },
      { value: "snowboard", label: "Snowboarding" },
      { value: "nordic", label: "Cross-country / nordic" },
      { value: "freestyle", label: "Park / freestyle" },
      { value: "other", label: "Something else" },
    ],
    placeholder: "Anything else we should know about the clip?",
    submitLabel: "Report mistake",
    successTitle: "Report received",
    successBody: "Thanks — this helps us teach the detector what counts as skiing.",
  },
};

export function FeedbackDialog({
  open,
  onOpenChange,
  variant,
  initialSentiment = null,
  clipId,
}: FeedbackDialogProps) {
  const copy = COPY[variant];
  const [sentiment, setSentiment] = useState<"up" | "down" | null>(initialSentiment);
  const [category, setCategory] = useState<string>("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // Sync sentiment whenever the dialog reopens with a new initial value.
  useEffect(() => {
    if (open) setSentiment(initialSentiment);
  }, [open, initialSentiment]);

  const reset = () => {
    setSentiment(initialSentiment);
    setCategory("");
    setMessage("");
    setSent(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(reset, 250);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = typeof window !== "undefined" ? window.location.href : "";
    // TODO_BACKEND_HOOKUP: POST { variant, sentiment, category, message, clipId, url }
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setSent(true);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(o) : handleClose())}>
      <DialogContent className="sm:max-w-[460px]">
        {sent ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <CheckCircle2 className="h-6 w-6 text-foreground" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">{copy.successTitle}</h3>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">{copy.successBody}</p>
            <Button variant="outline" className="mt-6" onClick={handleClose}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg">{copy.title}</DialogTitle>
              <DialogDescription className="text-sm">{copy.description}</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="mt-2 space-y-4">
              {copy.showSentiment && (
                <div className="flex items-center gap-2">
                  <SentimentButton
                    active={sentiment === "up"}
                    onClick={() => setSentiment(sentiment === "up" ? null : "up")}
                    icon={<ThumbsUp className="h-4 w-4" />}
                    label="Useful"
                  />
                  <SentimentButton
                    active={sentiment === "down"}
                    onClick={() => setSentiment(sentiment === "down" ? null : "down")}
                    icon={<ThumbsDown className="h-4 w-4" />}
                    label="Off"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="feedback-category" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {copy.categoryLabel}
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="feedback-category" className="h-10">
                    <SelectValue placeholder="Pick one (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {copy.categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback-message" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Your note
                </Label>
                <Textarea
                  id="feedback-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={copy.placeholder}
                  rows={5}
                  required
                  className="resize-none"
                />
              </div>

              {clipId && (
                <p className="text-xs text-muted-foreground">
                  Sent with clip reference{" "}
                  <span className="font-mono text-foreground/80">{clipId}</span>
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {copy.submitLabel}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SentimentButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
