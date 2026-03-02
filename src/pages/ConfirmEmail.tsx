import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/services";

export default function ConfirmEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    authService.confirmEmail(token).then((ok) => setStatus(ok ? "success" : "error"));
  }, [token]);

  if (status === "loading") return <Layout><PageLoader /></Layout>;

  return (
    <Layout>
      <Section>
        <div className="mx-auto flex max-w-sm flex-col items-center text-center">
          {status === "success" ? (
            <>
              <CheckCircle className="h-12 w-12 text-foreground" />
              <h1 className="mt-4 text-2xl font-bold text-foreground">Email confirmed</h1>
              <p className="mt-2 text-muted-foreground">You're all set. Start uploading clips.</p>
              <Button className="mt-6" asChild><Link to="/dashboard">Go to dashboard</Link></Button>
            </>
          ) : (
            <>
              <XCircle className="h-12 w-12 text-destructive" />
              <h1 className="mt-4 text-2xl font-bold text-foreground">Confirmation failed</h1>
              <p className="mt-2 text-muted-foreground">The link may have expired. Try signing up again.</p>
              <Button variant="outline" className="mt-6" asChild><Link to="/">Go home</Link></Button>
            </>
          )}
        </div>
      </Section>
    </Layout>
  );
}
