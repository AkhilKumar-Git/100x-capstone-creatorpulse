"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, TrendingUp, Eye, Heart, Clock, BarChart3, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface DateRange {
  label: string;
  value: string;
  days: number;
}

const dateRanges: DateRange[] = [
  { label: "Last 7 Days", value: "7d", days: 7 },
  { label: "Last 30 Days", value: "30d", days: 30 },
  { label: "Last 90 Days", value: "90d", days: 90 },
  { label: "This Month", value: "month", days: 30 },
  { label: "This Year", value: "year", days: 365 },
];

// Mock data for charts
const platformData = [
  {
    platform: "X",
    posts: 12,
    impressions: 28400,
    engagement: 5.1,
    growth: "+34%",
    color: "#1DA1F2"
  },
  {
    platform: "LinkedIn",
    posts: 8,
    impressions: 12800,
    engagement: 3.8,
    growth: "+67%",
    color: "#0077B5"
  },
  {
    platform: "Instagram",
    posts: 4,
    impressions: 4400,
    engagement: 3.2,
    growth: "+12%",
    color: "#E4405F"
  }
];

const timeseriesData = [
  { date: "Week 1", baseline: 2500, actual: 3200 },
  { date: "Week 2", baseline: 2600, actual: 3800 },
  { date: "Week 3", baseline: 2700, actual: 4200 },
  { date: "Week 4", baseline: 2800, actual: 4600 },
];

const roiData = [
  { name: "Accepted", value: 73, color: "#22C55E" },
  { name: "Needs Review", value: 27, color: "#64748B" },
];

const topPosts = [
  {
    platform: "X",
    title: "The future of AI in content creation...",
    impressions: "25.4k",
    engagement: "6.4%",
    time: "2 hours ago"
  },
  {
    platform: "LinkedIn",
    title: "Why consistency beats perfection...",
    impressions: "18.2k",
    engagement: "4.1%",
    time: "5 hours ago"
  },
  {
    platform: "X",
    title: "Building in public: Month 3 update",
    impressions: "12.8k",
    engagement: "8.2%",
    time: "1 day ago"
  }
];

interface AnimatedNumberProps {
  value: number | string;
  suffix?: string;
  prefix?: string;
}

function AnimatedNumber({ value, suffix = "", prefix = "" }: AnimatedNumberProps) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-3xl font-bold text-white"
    >
      {prefix}{value}{suffix}
    </motion.span>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: string;
  suffix?: string;
  prefix?: string;
}

function MetricCard({ title, value, change, icon, color, suffix = "", prefix = "" }: MetricCardProps) {
  const isPositive = change && change.startsWith("+");
  
  return (
    <Card className="bg-[#1E1E1E] border-neutral-800 hover:border-purple-500/30 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-sm font-medium">{title}</span>
          <div className={`p-2 rounded-lg ${color}`}>
            {icon}
          </div>
        </div>
        <div className="mb-1">
          <AnimatedNumber value={value} suffix={suffix} prefix={prefix} />
        </div>
        {change && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${
            isPositive ? "text-green-400" : "text-red-400"
          }`}>
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            <span>{change}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AnalyticsTab() {
  const [selectedRange, setSelectedRange] = useState("30d");

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Analytics Dashboard</h2>
          <p className="text-gray-400">Detailed insights about your content performance and AI-generated drafts</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <CalendarDays className="h-4 w-4 text-gray-400" />
          <Select value={selectedRange} onValueChange={setSelectedRange}>
            <SelectTrigger className="w-40 bg-neutral-800 border-neutral-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-neutral-800 border-neutral-700">
              {dateRanges.map((range) => (
                <SelectItem key={range.value} value={range.value} className="text-white focus:bg-neutral-700">
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* KPI Metrics Bar */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <MetricCard
          title="Posts Published"
          value={24}
          change="+18%"
          icon={<BarChart3 className="h-4 w-4 text-orange-400" />}
          color="bg-orange-500/20"
        />
        <MetricCard
          title="Total Impressions"
          value="45.6"
          suffix="k"
          change="+127%"
          icon={<Eye className="h-4 w-4 text-blue-400" />}
          color="bg-blue-500/20"
        />
        <MetricCard
          title="Avg. Engagement Rate"
          value="4.2"
          suffix="%"
          change="+0.8%"
          icon={<Heart className="h-4 w-4 text-pink-400" />}
          color="bg-pink-500/20"
        />
        <MetricCard
          title="Hours Saved"
          value={18}
          change="+6 hrs"
          icon={<Clock className="h-4 w-4 text-green-400" />}
          color="bg-green-500/20"
        />
      </motion.div>

      {/* Main Dashboard - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Performance */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-[#1E1E1E] border-neutral-800 h-full">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <span>Platform Performance</span>
              </CardTitle>
              <p className="text-gray-400 text-sm">Performance breakdown by social platform</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bar Chart */}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="platform" 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <Bar 
                      dataKey="impressions" 
                      fill="#8B5CF6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Platform Details Table */}
              <div className="space-y-3">
                {platformData.map((platform) => (
                  <div key={platform.platform} className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: platform.color }}
                      />
                      <div>
                        <p className="text-white font-medium">{platform.platform}</p>
                        <p className="text-gray-400 text-sm">{platform.posts} posts</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{platform.impressions.toLocaleString()}</p>
                      <p className="text-gray-400 text-sm">{platform.engagement}% engagement</p>
                    </div>
                    <div className="text-green-400 font-medium text-sm">
                      {platform.growth}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CreatorPulse ROI */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-[#1E1E1E] border-neutral-800 h-full">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-400" />
                <span>CreatorPulse ROI</span>
              </CardTitle>
              <p className="text-gray-400 text-sm">Track your content creation goals</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Impressions Uplift Line Chart */}
              <div>
                <h4 className="text-white font-medium mb-3">Impressions Growth</h4>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeseriesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        fontSize={11}
                      />
                      <YAxis 
                        stroke="#9CA3AF"
                        fontSize={11}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="baseline" 
                        stroke="#64748B" 
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        stroke="#22C55E" 
                        strokeWidth={3}
                        dot={{ fill: "#22C55E", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Draft Acceptance Rate */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium mb-1">Draft Acceptance Rate</h4>
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl font-bold text-white">73%</div>
                    <div className="text-gray-400 text-sm">Target: 70%</div>
                  </div>
                </div>
                <div className="w-20 h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roiData}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={35}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {roiData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-800/50 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Review Time</p>
                  <p className="text-white font-semibold">12 min</p>
                  <p className="text-orange-400 text-xs">Target: ≤15 min</p>
                </div>
                <div className="bg-neutral-800/50 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Impression Growth</p>
                  <p className="text-white font-semibold">2.3x</p>
                  <p className="text-green-400 text-xs">Target: 2x</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Performing Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-[#1E1E1E] border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Posts Performance</CardTitle>
            <p className="text-gray-400 text-sm">Performance metrics for your recently published content</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPosts.map((post, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-neutral-800/30 rounded-lg hover:bg-neutral-800/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 font-semibold text-sm">
                        {post.platform === "X" ? "𝕏" : post.platform.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{post.title}</p>
                      <p className="text-gray-400 text-sm">{post.platform} • {post.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <p className="text-gray-400">Impressions</p>
                      <p className="text-white font-semibold">{post.impressions}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400">Engagement</p>
                      <p className="text-green-400 font-semibold">{post.engagement}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
