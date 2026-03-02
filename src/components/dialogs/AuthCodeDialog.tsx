import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";

interface AuthCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onVerify: (code: string) => Promise<boolean>;
}

export function AuthCodeDialog({ open, onOpenChange, email, onVerify }: AuthCodeDialogProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (code.length < 6) return;
    setError("");
    setLoading(true);
    try {
      const success = await onVerify(code);
      if (success) {
        onOpenChange(false);
      } else {
        setError("Invalid code. Please try again.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Enter verification code</DialogTitle>
          <DialogDescription>
            We sent a 6-digit code to <strong>{email}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col items-center gap-4">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button className="w-full" onClick={handleVerify} disabled={loading || code.length < 6}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
