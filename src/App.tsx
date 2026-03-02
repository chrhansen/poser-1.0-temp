import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Results from "./pages/Results";
import Settings from "./pages/Settings";
import ConfirmEmail from "./pages/ConfirmEmail";
import EmbedResults from "./pages/EmbedResults";
import Releases from "./pages/Releases";
import Partners from "./pages/Partners";
import Billing from "./pages/Billing";
import Dashboard from "./pages/Dashboard";
import MetricsDebug from "./pages/MetricsDebug";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// TODO_BACKEND_HOOKUP: Add auth guards for protected routes (/settings, /billing, /dashboard, /internal/*)

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/results/:id" element={<Results />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/confirm-email" element={<ConfirmEmail />} />
          <Route path="/embed/results/:token" element={<EmbedResults />} />
          <Route path="/releases" element={<Releases />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/internal/metrics-debug" element={<MetricsDebug />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
