'use client';

import React from 'react';
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

// Mock data for drafts
const mockDrafts = [
  {
    id: 1,
    platform: 'X',
    topic: 'LLM Agents',
    snippet: 'LLM Agents is reshaping how we think about content creation. Here\'s what I\'ve learned after diving deep into this trend: 1/ The traditional approach is broken 2/ AI-powered tools are game-changers 3/ Personal...'
  },
  {
    id: 2,
    platform: 'X', 
    topic: 'Agents',
    snippet: 'Agents is reshaping how we think about content creation. Here\'s what I\'ve learned after diving deep into this trend: 1/ The traditional approach is broken 2/ AI-powered tools are game-changers 3/ Personal voice...'
  },
  {
    id: 3,
    platform: 'X',
    topic: 'LLM',
    snippet: 'LLM is reshaping how we think about content creation. Here\'s what I\'ve learned after diving deep into this trend: 1/ The traditional approach is broken 2/ AI-powered tools are game-changers 3/ Personal voice still...'
  }
];

// Mock data for trending topics
const mockTrendingTopics = [
  {
    id: 1,
    name: 'AI Content Creation',
    momentum: '+156%'
  },
  {
    id: 2,
    name: 'Creator Economy', 
    momentum: '+89%'
  },
  {
    id: 3,
    name: 'Social Media Trends',
    momentum: '+67%'
  }
];

export function DashboardOverview() {
  const userName = "Sarah";
  const router = useRouter();

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
            <div className="text-3xl font-bold text-white mb-1">247</div>
            <div className="text-green-400 text-sm font-medium">+12% vs last week</div>
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
              {mockDrafts.map((draft, index) => (
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
                        <Badge className="bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border-orange-500/30 text-xs">
                          Approved
                        </Badge>
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <Eye className="h-3 w-3" />
                          <span>12.4K</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <BarChart3 className="h-3 w-3" />
                          <span>8.2%</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                          {draft.topic === 'LLM Agents' ? 'The future of AI in content creation...' : 
                           draft.topic === 'Agents' ? '5 lessons learned from scaling a creator business' :
                           'Content strategy that actually works in 2024'}
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
                          {draft.snippet}
                        </p>
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
                      Review
                    </button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Trending Topics - Right Column */}
        <div className="space-y-6">
          <Card className="bg-[#1E1E1E] border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Trending Topics
              </CardTitle>
              <p className="text-gray-400 text-sm">Hot topics in your niche</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'AI-Generated Content', momentum: 95, color: 'from-purple-500 to-purple-600' },
                { name: 'Creator Economy', momentum: 87, color: 'from-orange-500 to-orange-600' },
                { name: 'Social Commerce', momentum: 72, color: 'from-blue-500 to-blue-600' },
                { name: 'Video Marketing', momentum: 68, color: 'from-green-500 to-green-600' }
              ].map((topic, index) => (
                <motion.div
                  key={topic.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onClick={() => handleTrendingTopicClick(topic.name)}
                  className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-800/50 hover:border-purple-500/30 hover:bg-neutral-800/70 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white text-sm group-hover:text-purple-300 transition-colors">{topic.name}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-green-400">{topic.momentum}</span>
                      <TrendingUp className="h-3 w-3 text-green-400" />
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full bg-gradient-to-r ${topic.color}`}
                      style={{ width: `${topic.momentum}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs text-gray-400 group-hover:text-purple-400 transition-colors opacity-0 group-hover:opacity-100">
                    Click to create content about this trend
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Hot Trend Alert */}
          <Card className="bg-[#1E1E1E] border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Zap className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-purple-300 text-sm mb-1">🔥 Hot Trend Alert</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    "AI-Generated Content" is spiking! Perfect time to create content around this topic.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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
                <p className="text-gray-300">Your morning drafts are ready. Review and schedule your posts for maximum impact.</p>
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
