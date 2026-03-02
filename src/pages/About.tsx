import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";

export default function AboutPage() {
  return (
    <Layout>
      <Section>
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">About Poser</h1>
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>
              Poser uses computer vision to analyze ski technique from short video clips.
              We break down your stance, balance, edge angles, and body rotation to give you
              clear, actionable feedback.
            </p>
            <p>
              Founded by skiers and engineers who believe everyone deserves access to
              high-quality technique coaching — not just those who can afford private lessons.
            </p>
            <p>
              Our mission is to make ski improvement accessible, measurable, and fun.
            </p>
          </div>
        </div>
      </Section>
    </Layout>
  );
}
