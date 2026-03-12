import { AppLayout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountTab } from "@/components/settings/AccountTab";
import { BillingTab } from "@/components/settings/BillingTab";
import { IntegrationsTab } from "@/components/settings/IntegrationsTab";
import { useSearchParams } from "react-router-dom";
import { User, CreditCard, Puzzle } from "lucide-react";

const tabs = [
  { value: "account", label: "Account", icon: User },
  { value: "billing", label: "Billing", icon: CreditCard },
  { value: "integrations", label: "Integrations", icon: Puzzle },
] as const;

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "account";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value }, { replace: true });
  };

  return (
    <AppLayout>
      <Section compact>
        <div className="mx-auto max-w-lg">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
            <TabsList className="w-full">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex-1 gap-2">
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-6">
              <TabsContent value="account"><AccountTab /></TabsContent>
              <TabsContent value="billing"><BillingTab /></TabsContent>
              <TabsContent value="integrations"><IntegrationsTab /></TabsContent>
            </div>
          </Tabs>
        </div>
      </Section>
    </AppLayout>
  );
}
