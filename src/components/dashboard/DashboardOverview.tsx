'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TextRotate } from '@/components/ui/text-rotate';
import { 
  CheckCircle, 
  DatabaseZap, 
  TrendingUp, 
  Clock,
  Plus,
  Eye,
  BarChart3,
  Calendar,
  Settings,
  Star,
  Zap,
  Sparkles
} from 'lucide-react';
import { XIcon } from '@/components/ui/x-icon';
import { motion } from 'motion/react';
import { GenerateNowButton } from '@/components/GenerateNowButton';
import { PlatformFilter, type PlatformType } from '@/components/PlatformFilter';
import { useTrendingTopics } from '@/hooks/useTrendingTopics';



export function DashboardOverview() {
  const userName = "Sarah";
  const router = useRouter();
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>([]);
  const { trendingTopics, personalDrafts, loading: topicsLoading, error: topicsError, refreshTopics } = useTrendingTopics();

  const handleTrendingTopicClick = (topicName: string) => {
    const encodedPrompt = encodeURIComponent(topicName);
    router.push(`/post-editor?prompt=${encodedPrompt}`);
  };

  const handleNewDraftClick = () => {
    router.push('/post-editor');
  };

  const handleSettingsClick = () => {
    router.push('/settings');
  };

  return (
    <div className="space-y-6">
      {/* Animated Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-white">
              Good morning,{" "}
              <TextRotate
                texts={[userName + "! 👋", userName + "! ✨", userName + "! 🚀"]}
                mainClassName="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text"
                staggerFrom="first"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={3000}
              />
            </h1>
          </div>
          <p className="text-gray-300 text-base">
            Your daily content insights are ready. You have <span className="text-purple-400 font-semibold">3 new drafts</span> to review.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <PlatformFilter
              selectedPlatforms={selectedPlatforms}
              onPlatformsChange={setSelectedPlatforms}
              variant="outline"
              size="sm"
            />
            <GenerateNowButton
              includePlatforms={selectedPlatforms.length > 0 ? selectedPlatforms : undefined}
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            />
          </div>
          <button 
            onClick={handleSettingsClick}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
          >
            <Settings className="h-5 w-5 text-gray-400" />
          </button>
          <button 
            onClick={handleNewDraftClick}
            className="group relative flex items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-base font-semibold text-white cursor-pointer transition-all duration-500 ease-out hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:scale-105"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"></div>
            
            {/* Button Content */}
            <div className="relative z-10 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              <span>New Draft</span>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Vibrant KPI Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Drafts Generated */}
        <Card className="bg-[#1E1E1E] border-neutral-800 hover:border-purple-500/50 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm font-medium">Drafts Generated</span>
              <div className="p-2 rounded-lg bg-purple-500/20">
                <BarChart3 className="h-4 w-4 text-purple-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{personalDrafts.length}</div>
            <div className="text-green-400 text-sm font-medium">From your sources</div>
          </CardContent>
        </Card>

        {/* Acceptance Rate */}
        <Card className="bg-[#1E1E1E] border-neutral-800 hover:border-green-500/50 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm font-medium">Acceptance Rate</span>
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">73%</div>
            <div className="text-green-400 text-sm font-medium">+5% vs last week</div>
          </CardContent>
        </Card>

        {/* Avg Review Time */}
        <Card className="bg-[#1E1E1E] border-neutral-800 hover:border-orange-500/50 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm font-medium">Avg. Review Time</span>
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Clock className="h-4 w-4 text-orange-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">12m</div>
            <div className="text-green-400 text-sm font-medium">-18% vs last week</div>
          </CardContent>
        </Card>

        {/* Impressions Boost */}
        <Card className="bg-[#1E1E1E] border-neutral-800 hover:border-blue-500/50 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm font-medium">Impressions Boost</span>
              <div className="p-2 rounded-lg bg-blue-500/20">
                <TrendingUp className="h-4 w-4 text-blue-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">2.4×</div>
            <div className="text-green-400 text-sm font-medium">+23% vs last week</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Recent Drafts - Left Column */}
        <div className="lg:col-span-2">
          <Card className="bg-[#1E1E1E] border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-white text-xl font-bold">Recent Drafts</CardTitle>
                <p className="text-gray-400 text-sm mt-1">Ready for your review</p>
              </div>
              <button className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
                View All
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {topicsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  <span className="ml-2 text-gray-400">Loading drafts...</span>
                </div>
              ) : personalDrafts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No drafts yet. Use Generate Now to create your first draft!</p>
                </div>
              ) : (
                personalDrafts.map((draft, index) => (
                  <motion.div
                    key={draft.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="group p-4 rounded-xl bg-neutral-800/50 border border-neutral-800/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20">
                            <XIcon className="h-3 w-3 text-white" />
                            <span className="text-xs text-purple-300 font-medium">{draft.platform}</span>
                          </div>
                          <Badge className={`text-xs ${
                            draft.status === 'accepted' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                            draft.status === 'rejected' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                            draft.status === 'reviewed' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                            'bg-orange-500/20 text-orange-300 border-orange-500/30'
                          }`}>
                            {draft.status.charAt(0).toUpperCase() + draft.status.slice(1)}
                          </Badge>
                          <div className="flex items-center gap-1 text-gray-400 text-xs">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(draft.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                            {draft.content.length > 60 ? draft.content.substring(0, 60) + '...' : draft.content}
                          </h3>
                          <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
                            {draft.content}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => router.push(`/post-editor?draft=${draft.id}`)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
                      >
                        Review
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Trending Topics - Right Column */}
        <div className="space-y-6">
          <Card className="bg-[#1E1E1E] border-neutral-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    Trending Topics
                  </CardTitle>
                  <p className="text-gray-400 text-sm">Hot topics from your sources</p>
                </div>
                <button
                  onClick={refreshTopics}
                  disabled={topicsLoading}
                  className="p-2 rounded-lg bg-neutral-800/50 hover:bg-neutral-700/50 transition-colors disabled:opacity-50"
                  title="Refresh trending topics"
                >
                  <div className={`w-4 h-4 ${topicsLoading ? 'animate-spin' : ''}`}>
                    {topicsLoading ? (
                      <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                    ) : (
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {topicsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                  <span className="ml-2 text-gray-400 text-sm">Loading trends...</span>
                </div>
              ) : trendingTopics.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-400 text-sm">No trending topics yet. Connect sources and use Generate Now!</p>
                </div>
              ) : (
                trendingTopics.map((topic, index) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    onClick={() => handleTrendingTopicClick(topic.topic_name)}
                    className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-800/50 hover:border-purple-500/30 hover:bg-neutral-800/70 transition-all cursor-pointer group"
                  >
                                         <div className="flex items-center justify-between mb-2">
                       <span className="font-medium text-white text-sm group-hover:text-purple-300 transition-colors line-clamp-1">
                         {topic.topic_name}
                       </span>
                       <div className="flex items-center gap-1">
                         <span className="text-xs font-bold text-green-400">{Math.round(topic.momentum_score)}</span>
                         <TrendingUp className="h-3 w-3 text-green-400" />
                       </div>
                     </div>
                     
                     {/* Trending Metrics */}
                     {topic.metrics && (
                       <div className="flex items-center gap-2 mb-2">
                         <div className="flex items-center gap-1 text-xs">
                           <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                           <span className="text-blue-400">{Math.round(topic.metrics.engagement_rate || 0)}%</span>
                         </div>
                         <div className="flex items-center gap-1 text-xs">
                           <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                           <span className="text-orange-400">{Math.round(topic.metrics.velocity_score || 0)}</span>
                         </div>
                         <div className="flex items-center gap-1 text-xs">
                           <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                           <span className="text-purple-400">{Math.round(topic.metrics.reach_multiplier || 0)}x</span>
                         </div>
                       </div>
                     )}
                    
                    {/* Source Icons Row */}
                    <div className="flex items-center gap-1 mb-2">
                      {topic.source_icons.slice(0, 5).map((source, sourceIndex) => (
                        <div
                          key={source.id}
                          className="w-6 h-6 rounded-full border-2 border-neutral-700 overflow-hidden"
                          style={{ 
                            zIndex: 5 - sourceIndex,
                            marginLeft: sourceIndex > 0 ? '-4px' : '0'
                          }}
                        >
                          {source.avatar_url ? (
                            <img 
                              src={source.avatar_url} 
                              alt={source.type}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to platform icon if image fails
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center text-xs font-bold ${
                            source.type === 'x' ? 'bg-blue-500 text-white' :
                            source.type === 'youtube' ? 'bg-red-500 text-white' :
                            source.type === 'rss' ? 'bg-orange-500 text-white' :
                            'bg-green-500 text-white'
                          } ${source.avatar_url ? 'hidden' : ''}`}>
                            {source.type === 'x' ? 'X' : 
                             source.type === 'youtube' ? 'YT' :
                             source.type === 'rss' ? 'RSS' : 'B'}
                          </div>
                        </div>
                      ))}
                      {topic.source_count > 5 && (
                        <div className="w-6 h-6 rounded-full bg-neutral-600 text-white text-xs flex items-center justify-center font-bold ml-1">
                          +{topic.source_count - 5}
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${Math.min(topic.momentum_score, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-400 group-hover:text-purple-400 transition-colors opacity-0 group-hover:opacity-100">
                      Click to create content about this trend
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Hot Trend Alert */}
          {trendingTopics.length > 0 && (
            <Card className="bg-[#1E1E1E] border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Zap className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-300 text-sm mb-1">🔥 Hot Trend Alert</h4>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      "{trendingTopics[0]?.topic_name}" is trending with a score of {Math.round(trendingTopics[0]?.momentum_score || 0)}! 
                      Perfect time to create content around this topic from your {trendingTopics[0]?.source_count || 0} sources.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>

      {/* Bottom CTA Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-8"
      >
        <Card className="bg-[#1E1E1E] border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Ready for Today's Content?</h3>
                <p className="text-gray-300">
                  {personalDrafts.length > 0 
                    ? `You have ${personalDrafts.length} draft${personalDrafts.length === 1 ? '' : 's'} ready. Review and schedule your posts for maximum impact.`
                    : 'No drafts yet. Use Generate Now to create your first content!'
                  }
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-6 py-3 rounded-lg bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 transition-all duration-300 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Posts
                </button>
                <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Review Drafts
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
