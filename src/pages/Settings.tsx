import { useEffect, useState, useRef, useCallback } from "react";
import { AppLayout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { settingsService } from "@/services/settings.service";
import type { SettingsProfile } from "@/lib/types";
import { toast } from "sonner";
import { Loader2, Upload, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState<SettingsProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const [emailChangePending, setEmailChangePending] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);
  const originalRef = useRef<SettingsProfile | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notifComplete, setNotifComplete] = useState(true);
  const [notifTips, setNotifTips] = useState(false);

  useEffect(() => {
    settingsService.getProfile().then((p) => {
      setProfile(p);
      originalRef.current = p;
      setName(p.name);
      setEmail(p.email);
      setNotifComplete(p.notifications.analysisComplete);
      setNotifTips(p.notifications.weeklyTips);
      setAvatarPreview(p.avatarUrl);
      setLoading(false);
    });
  }, []);

  // Track dirty state
  useEffect(() => {
    if (!originalRef.current) return;
    const o = originalRef.current;
    const isDirty = name !== o.name || notifComplete !== o.notifications.analysisComplete || notifTips !== o.notifications.weeklyTips;
    setDirty(isDirty);
  }, [name, notifComplete, notifTips]);

  // Unsaved change guard
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = settingsService.validateAvatar(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    try {
      const { url } = await settingsService.uploadAvatar(file);
      setAvatarPreview(url);
      toast.success("Avatar updated.");
    } catch {
      toast.error("Failed to upload avatar.");
    }
  };

  const handleEmailChange = async () => {
    if (!profile || email === profile.email) return;
    try {
      const { needsConfirmation } = await settingsService.updateEmail(email);
      if (needsConfirmation) {
        setEmailChangePending(true);
        toast.info("Check your new email for a confirmation link.");
      }
    } catch {
      toast.error("Failed to update email.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await settingsService.updateProfile({
        name,
        notifications: { analysisComplete: notifComplete, weeklyTips: notifTips },
      });
      originalRef.current = updated;
      setProfile(updated);
      setDirty(false);
      toast.success("Settings saved.");
      // Handle email separately
      if (email !== updated.email) handleEmailChange();
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AppLayout><PageLoader /></AppLayout>;

  return (
    <AppLayout>
      <Section>
        <div className="mx-auto max-w-lg">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>

          {/* Email pending confirmation banner */}
          {emailChangePending && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0 text-accent" />
              <span className="text-muted-foreground">Email change pending confirmation. Check your inbox.</span>
            </div>
          )}

          {/* Not confirmed banner */}
          {profile && !profile.emailConfirmed && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <span className="text-muted-foreground">Your email is not confirmed. Check your inbox or request a new link.</span>
            </div>
          )}

          <div className="mt-8 space-y-6">
            {/* Avatar */}
            <div className="rounded-xl border border-border p-6">
              <h2 className="text-sm font-semibold text-foreground">Avatar</h2>
              <p className="mt-1 text-sm text-muted-foreground">JPG, PNG, WebP, or GIF. Max 5MB.</p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-muted-foreground">{name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => avatarRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" /> Upload
                </Button>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
            </div>

            {/* Profile */}
            <div className="rounded-xl border border-border p-6">
              <h2 className="text-sm font-semibold text-foreground">Profile</h2>
              <p className="mt-1 text-sm text-muted-foreground">Manage your account details.</p>
              <div className="mt-4 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="settings-name">Name</Label>
                  <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="settings-email">Email</Label>
                  <Input id="settings-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="rounded-xl border border-border p-6">
              <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
              <p className="mt-1 text-sm text-muted-foreground">Choose what emails you receive.</p>
              <div className="mt-4 flex items-center justify-between">
                <Label htmlFor="notif-complete">Analysis complete</Label>
                <Switch id="notif-complete" checked={notifComplete} onCheckedChange={setNotifComplete} />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Label htmlFor="notif-tips">Weekly tips</Label>
                <Switch id="notif-tips" checked={notifTips} onCheckedChange={setNotifTips} />
              </div>
            </div>

            {/* Save */}
            <div className="flex items-center justify-between">
              {dirty && <p className="text-xs text-accent">You have unsaved changes.</p>}
              <Button onClick={handleSave} disabled={saving || !dirty} className="ml-auto">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </AppLayout>
  );
}
