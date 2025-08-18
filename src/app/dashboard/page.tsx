import NewAppLayout from "@/components/layout/NewAppLayout";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { EnhancedSourcesTab } from "@/components/dashboard/EnhancedSourcesTab";
import { DeliveryTab } from "@/components/dashboard/DeliveryTab";
import { AnalyticsTab } from "@/components/dashboard/AnalyticsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <NewAppLayout>
        {/* Tabs section */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="sources">
            <EnhancedSourcesTab />
          </TabsContent>

          <TabsContent value="delivery">
            <DeliveryTab />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab />
          </TabsContent>
        </Tabs>
      </NewAppLayout>
    </ProtectedRoute>
  );
}