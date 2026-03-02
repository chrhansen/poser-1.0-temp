import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { partnersService } from "@/services/partners.service";
import type { Partner } from "@/lib/types";

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    partnersService.getPartners().then((p) => { setPartners(p); setLoading(false); });
  }, []);

  if (loading) return <Layout><PageLoader /></Layout>;

  return (
    <Layout>
      <Section>
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Partners</h1>
          <p className="mt-2 text-muted-foreground">Organizations we work with.</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {partners.map((p) => (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-border p-6 transition-shadow hover:shadow-md"
              >
                <h3 className="text-base font-semibold text-foreground">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
              </a>
            ))}
          </div>
        </div>
      </Section>
    </Layout>
  );
}
