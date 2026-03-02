import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";

// TODO_BACKEND_HOOKUP: Wire up to real settings API
export default function SettingsPage() {
  return (
    <Layout>
      <Section>
        <div className="mx-auto max-w-lg">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <div className="mt-8 space-y-6">
            <div className="rounded-xl border border-border p-6">
              <h2 className="text-sm font-semibold text-foreground">Profile</h2>
              <p className="mt-1 text-sm text-muted-foreground">Manage your account details.</p>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Name</label>
                  <input
                    type="text"
                    defaultValue="Alex Chen"
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <input
                    type="email"
                    defaultValue="alex@example.com"
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border p-6">
              <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
              <p className="mt-1 text-sm text-muted-foreground">Choose what emails you receive.</p>
              {/* TODO_BACKEND_HOOKUP */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-foreground">Analysis complete</span>
                <div className="h-5 w-9 rounded-full bg-foreground" />
              </div>
            </div>
          </div>
        </div>
      </Section>
    </Layout>
  );
}
