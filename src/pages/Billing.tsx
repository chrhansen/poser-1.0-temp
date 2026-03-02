import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { billingService } from "@/services/billing.service";
import { Button } from "@/components/ui/button";
import type { BillingInfo } from "@/lib/types";

// TODO_STRIPE_HOOKUP: Replace with real Stripe integration
export default function BillingPage() {
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    billingService.getBillingInfo().then((b) => { setBilling(b); setLoading(false); });
  }, []);

  if (loading) return <AppLayout><PageLoader /></AppLayout>;
  if (!billing) return <AppLayout><Section><p className="text-muted-foreground">Unable to load billing info.</p></Section></AppLayout>;

  return (
    <AppLayout>
      <Section>
        <div className="mx-auto max-w-lg">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Billing</h1>
          <div className="mt-8 space-y-6">
            <div className="rounded-xl border border-border p-6">
              <h2 className="text-sm font-semibold text-foreground">Current plan</h2>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {billing.plan.name} — ${billing.plan.price}/{billing.plan.interval}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Next billing: {billing.nextBillingDate}
              </p>
              {/* TODO_STRIPE_HOOKUP */}
              <Button variant="outline" size="sm" className="mt-4">
                Manage subscription
              </Button>
            </div>
            {billing.paymentMethod && (
              <div className="rounded-xl border border-border p-6">
                <h2 className="text-sm font-semibold text-foreground">Payment method</h2>
                <p className="mt-1 text-sm capitalize text-muted-foreground">
                  {billing.paymentMethod.type} ending in {billing.paymentMethod.last4}
                </p>
              </div>
            )}
            <div className="rounded-xl border border-border p-6">
              <h2 className="text-sm font-semibold text-foreground">Invoices</h2>
              <div className="mt-3 space-y-2">
                {billing.invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{inv.date}</span>
                    <span className="text-foreground">${inv.amount}</span>
                    <span className="capitalize text-muted-foreground">{inv.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </AppLayout>
  );
}
