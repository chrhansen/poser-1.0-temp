import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <Section>
        <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "50vh" }}>
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <p className="mt-3 text-lg text-muted-foreground">Page not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The page <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">{location.pathname}</code> doesn't exist.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </Section>
    </Layout>
  );
};

export default NotFound;
