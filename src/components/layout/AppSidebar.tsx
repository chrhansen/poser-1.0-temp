import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, BarChart3, Settings, CreditCard, HelpCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { ContactSupportDialog } from "@/components/dialogs/ContactSupportDialog";

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
];

const internalLinks = [
  { label: "Metrics", href: "/internal/metrics-debug", icon: BarChart3 },
];

export function AppSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <>
      <aside className="hidden w-56 shrink-0 border-r border-border bg-surface-sunken lg:block">
        <div className="flex h-full flex-col px-3 py-6">
          <nav className="flex-1 space-y-1">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === link.href
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}

            {/* Internal links — TODO_BACKEND_HOOKUP: only show for admin role */}
            {user?.plan === "team" && (
              <>
                <div className="my-3 border-t border-border" />
                <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Internal
                </p>
                {internalLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      location.pathname === link.href
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </>
            )}
          </nav>

          <div className="mt-auto space-y-1">
            <button
              onClick={() => setSupportOpen(true)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
            >
              <HelpCircle className="h-4 w-4" />
              Support
            </button>
            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <ContactSupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
    </>
  );
}
