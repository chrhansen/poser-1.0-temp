import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";

export default function TermsPage() {
  return (
    <Layout>
      <Section>
        <div className="mx-auto max-w-2xl prose prose-sm text-muted-foreground">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Terms of Service</h1>
          <p className="mt-4">Last updated: March 1, 2026</p>
          <p>By using Poser, you agree to these terms. Poser provides AI-powered ski technique analysis on an "as-is" basis.</p>
          <h2 className="text-foreground">Acceptable Use</h2>
          <p>You may upload ski videos for personal technique analysis. You may not use the service for commercial redistribution without permission.</p>
          <h2 className="text-foreground">Liability</h2>
          <p>Poser is not a substitute for professional ski instruction. Use feedback at your own risk.</p>
          {/* TODO_BACKEND_HOOKUP: Add full legal terms */}
        </div>
      </Section>
    </Layout>
  );
}
