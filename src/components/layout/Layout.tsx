import { Header } from "./Header";
import { Footer } from "./Footer";
import { AppSidebar } from "./AppSidebar";

interface LayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export function Layout({ children, hideHeader, hideFooter }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {!hideHeader && <Header />}
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}

/** Layout for authenticated app pages with sidebar */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <AppSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
