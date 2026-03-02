import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/shared/PageLoader";
import { pricingService } from "@/lib/services";
import type { PricingPlan } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pricingService.getPlans().then((p) => { setPlans(p); setLoading(false); });
  }, []);

  if (loading) return <Layout><PageLoader /></Layout>;

  return (
    <Layout>
      <Section>
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Simple, transparent pricing</h1>
          <p className="mt-3 text-muted-foreground">Start free. Upgrade when you're ready.</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col rounded-xl border p-6",
                plan.highlighted
                  ? "border-foreground shadow-lg"
                  : "border-border"
              )}
            >
              <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                <span className="text-sm text-muted-foreground">/{plan.interval}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                    {f}
                  </li>
                ))}
              </ul>
              {/* TODO_STRIPE_HOOKUP */}
              <Button
                variant={plan.highlighted ? "default" : "outline"}
                className="mt-6"
                asChild
              >
                <Link to="/billing">
                  {plan.ctaLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </Section>
    </Layout>
  );
}
