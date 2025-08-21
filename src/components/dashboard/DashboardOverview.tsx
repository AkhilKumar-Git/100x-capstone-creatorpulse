'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, FileText, Users, Activity } from 'lucide-react';
import { GenerateNowButton } from '@/components/GenerateNowButton';
import { AvatarGroup } from '@/components/ui/avatar-group';

interface TrendingTopic {
  id: string;
  topic_name: string;
  momentum_score: number;
  description?: string;
  source_ids: string[];
  created_at: string;
}

interface Source {
  id: string;
  type: string;
  handle?: string;
  url?: string;
  name: string;
  avatar: string;
}

interface Draft {
  id: string;
  title: string;
  content: string;
  platform: string;
  status: string;
  created_at: string;
}

interface DashboardOverviewProps {
  trendingTopics: TrendingTopic[];
  sources: Source[];
  drafts: Draft[];
  onRegenerateClick: () => void;
}

export function DashboardOverview({ 
  trendingTopics, 
  sources, 
  drafts, 
  onRegenerateClick 
}: DashboardOverviewProps) {
  // Debug logging
  console.log('DashboardOverview received:', {
    trendingTopics,
    sources,
    drafts
  });

  // Create avatar data for source attribution
  const createSourceAvatars = (sourceIds: string[]) => {
    console.log('Creating source avatars for:', sourceIds);
    console.log('Available sources:', sources);
    
    const avatars = sourceIds
      .map(id => {
        const source = sources.find(s => s.id === id);
        console.log(`Looking for source ${id}:`, source);
        if (!source) return null;
        
        return {
          src: source.avatar,
          alt: source.name,
          label: source.name
        };
      })
      .filter((avatar): avatar is { src: string; alt: string; label: string } => avatar !== null);
    
    console.log('Generated avatars:', avatars);
    return avatars;
  };

  return (
    <div className="space-y-6">
      {/* Daily Insights Generation Card */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-[#F5F5F5] flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-400" />
            Daily Insights Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#A0A0A0] text-sm">
                Generate trending topics from your active sources daily
              </p>
              <p className="text-[#F5F5F5] text-lg font-semibold mt-1">
                {trendingTopics.length}/5 topics generated
              </p>
            </div>
            <div className="flex gap-2">
              <GenerateNowButton />
              <Button
                onClick={onRegenerateClick}
                variant="outline"
                size="sm"
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate daily insights
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Main Content Area - Side by Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Trending Topics */}
        <Card className="bg-[#1E1E1E] border-neutral-800">
          <CardHeader>
            <CardTitle className="text-[#F5F5F5] flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              Trending Topics (5 daily)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendingTopics.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-[#64748B] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2">
                  No trending topics yet
                </h3>
                <p className="text-[#A0A0A0] text-sm mb-4">
                  Click "Generate Now" to analyze your sources and identify trending topics
                </p>
                <GenerateNowButton />
              </div>
            ) : (
              <div className="space-y-4">
                {trendingTopics.map((topic, index) => (
                  <div
                    key={topic.id}
                    className="p-4 rounded-lg border border-neutral-800/50 hover:border-neutral-700/50 transition-colors bg-neutral-800/20"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        #{index + 1}
                      </Badge>
                      <Badge variant="outline" className="border-green-500/30 text-green-400">
                        {topic.momentum_score}
                      </Badge>
                    </div>
                    
                    <h4 className="text-[#F5F5F5] font-semibold mb-2">
                      {topic.topic_name}
                    </h4>
                    
                    {topic.description && (
                      <p className="text-[#A0A0A0] text-sm mb-3">
                        {topic.description}
                      </p>
                    )}
                    
                                         {/* Source Attribution - This is the key component */}
                     <div className="flex items-center gap-3">
                       <span className="text-[#F5F5F5] text-sm font-medium">
                         Sources:
                       </span>
                       {topic.source_ids && topic.source_ids.length > 0 ? (
                         <AvatarGroup
                           avatars={createSourceAvatars(topic.source_ids)}
                           maxVisible={3}
                           size={28}
                           overlap={10}
                         />
                       ) : (
                         <span className="text-[#A0A0A0] text-sm">No sources</span>
                       )}
                     </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Recent Drafts */}
        <Card className="bg-[#1E1E1E] border-neutral-800">
          <CardHeader>
            <CardTitle className="text-[#F5F5F5] flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-400" />
              Recent Drafts ({drafts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {drafts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-[#64748B] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2">
                  No drafts yet
                </h3>
                <p className="text-[#A0A0A0] text-sm">
                  Create content drafts based on trending topics
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {drafts.slice(0, 5).map((draft) => (
                  <div
                    key={draft.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-neutral-800/50 hover:border-neutral-700/50 transition-colors bg-neutral-800/20"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[#F5F5F5] font-medium truncate">
                        {draft.title || 'Untitled Draft'}
                      </h4>
                      <p className="text-[#A0A0A0] text-sm truncate">
                        {draft.content || 'No content'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {draft.platform && (
                        <Badge variant="outline" className="text-xs border-neutral-600 text-[#A0A0A0]">
                          {draft.platform}
                        </Badge>
                      )}
                      <Badge 
                        variant={draft.status === 'published' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {draft.status || 'draft'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sources Overview */}
      <Card className="bg-[#1E1E1E] border-neutral-800">
        <CardHeader>
          <CardTitle className="text-[#F5F5F5] flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-400" />
            Active Sources ({sources.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-[#64748B] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2">
                No active sources
              </h3>
              <p className="text-[#A0A0A0] text-sm">
                Add sources to start generating trending topics
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-neutral-800/50 bg-neutral-800/20"
                >
                  <img
                    src={source.avatar}
                    alt={source.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#F5F5F5] font-medium text-sm truncate">
                      {source.name}
                    </p>
                    <Badge variant="outline" className="text-xs border-neutral-600 text-[#A0A0A0]">
                      {source.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
