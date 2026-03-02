import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { billingService } from "@/lib/services";
import type { BillingInfo } from "@/lib/types";

// TODO_STRIPE_HOOKUP: Replace with real Stripe integration
export default function BillingPage() {
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    billingService.getBillingInfo().then((b) => { setBilling(b); setLoading(false); });
  }, []);

  if (loading) return <Layout><PageLoader /></Layout>;
  if (!billing) return <Layout><Section><p className="text-muted-foreground">Unable to load billing info.</p></Section></Layout>;

  return (
    <Layout>
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
            </div>
            {billing.paymentMethod && (
              <div className="rounded-xl border border-border p-6">
                <h2 className="text-sm font-semibold text-foreground">Payment method</h2>
                <p className="mt-1 text-sm text-muted-foreground capitalize">
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
    </Layout>
  );
}
