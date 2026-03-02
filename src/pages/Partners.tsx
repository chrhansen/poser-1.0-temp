import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { partnersService } from "@/services/partners.service";
import type { Partner } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check, Code, AlertTriangle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copied to clipboard.`);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

function IntegrationSnippets({ partner }: { partner: Partner }) {
  if (!partner.integrationSnippets) return null;
  const { html, react, next } = partner.integrationSnippets;
  return (
    <div className="mt-4 rounded-lg border border-border bg-surface-sunken p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Code className="h-4 w-4" />
        Integration snippets
      </div>
      <Tabs defaultValue="html" className="mt-3">
        <TabsList className="h-8">
          <TabsTrigger value="html" className="text-xs">HTML</TabsTrigger>
          <TabsTrigger value="react" className="text-xs">React</TabsTrigger>
          <TabsTrigger value="next" className="text-xs">Next.js</TabsTrigger>
        </TabsList>
        <TabsContent value="html" className="mt-3">
          <pre className="overflow-x-auto rounded-md bg-secondary p-3 text-xs text-muted-foreground">{html}</pre>
          <div className="mt-2"><CopyButton text={html} label="HTML snippet" /></div>
        </TabsContent>
        <TabsContent value="react" className="mt-3">
          <pre className="overflow-x-auto rounded-md bg-secondary p-3 text-xs text-muted-foreground">{react}</pre>
          <div className="mt-2"><CopyButton text={react} label="React snippet" /></div>
        </TabsContent>
        <TabsContent value="next" className="mt-3">
          <pre className="overflow-x-auto rounded-md bg-secondary p-3 text-xs text-muted-foreground">{next}</pre>
          <div className="mt-2"><CopyButton text={next} label="Next.js snippet" /></div>
        </TabsContent>
      </Tabs>

      {/* Troubleshooting */}
      <div className="mt-4 rounded-lg border border-border p-3">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <AlertTriangle className="h-3 w-3" /> Troubleshooting
        </div>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          <li>• Make sure your domain ({partner.domain}) is whitelisted in your partner settings.</li>
          <li>• The embed iframe requires HTTPS on production domains.</li>
          <li>• If the widget doesn't load, check your browser's Content Security Policy headers.</li>
        </ul>
      </div>
    </div>
  );
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    partnersService.getPartners().then((p) => {
      setPartners(p);
      setLoading(false);
    });
  }, []);

  if (loading) return <Layout><PageLoader /></Layout>;

  return (
    <Layout>
      <Section>
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Partners</h1>
          <p className="mt-2 text-muted-foreground">Organizations we work with.</p>

          <div className="mt-10 space-y-4">
            {partners.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-border p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{p.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                    {p.domain && (
                      <p className="mt-1 text-xs text-muted-foreground">Domain: {p.domain}</p>
                    )}
                  </div>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground hover:text-foreground">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                {p.integrationSnippets && (
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                    >
                      <Code className="mr-2 h-3 w-3" />
                      {expanded === p.id ? "Hide integration" : "View integration"}
                    </Button>
                    {expanded === p.id && <IntegrationSnippets partner={p} />}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>
    </Layout>
  );
}
