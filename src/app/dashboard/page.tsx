'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { AnalyticsTab } from '@/components/dashboard/AnalyticsTab';
import { DeliveryTab } from '@/components/dashboard/DeliveryTab';
import { EnhancedSourcesTab } from '@/components/dashboard/EnhancedSourcesTab';
import { useTrendingTopics } from '@/hooks/useTrendingTopics';
import NewAppLayout from '@/components/layout/NewAppLayout';

export default function DashboardPage() {
  const { trendingTopics, sources, drafts, loading, error, refreshTopics } = useTrendingTopics();

  const handleRegenerateClick = () => {
    refreshTopics();
  };

  if (loading) {
    return (
      <NewAppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
        </div>
      </NewAppLayout>
    );
  }

  if (error) {
    return (
      <NewAppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Dashboard</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </NewAppLayout>
    );
  }

  return (
    <NewAppLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Monitor your content performance and insights</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-neutral-800 border-neutral-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="sources" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              Sources
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="delivery" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              Delivery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview
              trendingTopics={trendingTopics}
              sources={sources}
              drafts={drafts}
              onRegenerateClick={handleRegenerateClick}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab />
          </TabsContent>

          <TabsContent value="delivery">
            <DeliveryTab />
          </TabsContent>

          <TabsContent value="sources">
            <EnhancedSourcesTab />
          </TabsContent>
        </Tabs>
      </div>
    </NewAppLayout>
  );
}