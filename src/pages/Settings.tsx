import { AppLayout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";

// TODO_BACKEND_HOOKUP: Wire up to real settings API
export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <Section>
        <div className="mx-auto max-w-lg">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <div className="mt-8 space-y-6">
            <div className="rounded-xl border border-border p-6">
              <h2 className="text-sm font-semibold text-foreground">Profile</h2>
              <p className="mt-1 text-sm text-muted-foreground">Manage your account details.</p>
              <div className="mt-4 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="settings-name">Name</Label>
                  <Input id="settings-name" defaultValue={user?.name ?? ""} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="settings-email">Email</Label>
                  <Input id="settings-email" type="email" defaultValue={user?.email ?? ""} />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border p-6">
              <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
              <p className="mt-1 text-sm text-muted-foreground">Choose what emails you receive.</p>
              {/* TODO_BACKEND_HOOKUP */}
              <div className="mt-4 flex items-center justify-between">
                <Label htmlFor="notif-complete">Analysis complete</Label>
                <Switch id="notif-complete" defaultChecked />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Label htmlFor="notif-tips">Weekly tips</Label>
                <Switch id="notif-tips" />
              </div>
            </div>
          </div>
        </div>
      </Section>
    </AppLayout>
  );
}
