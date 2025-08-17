"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { BarChart3, FileText, Target, TrendingUp, RefreshCw, Trash2 } from "lucide-react";

interface VoiceDNAProps {
  isAnalyzed: boolean;
  onRetrain: () => void;
  onReset: () => void;
  className?: string;
}

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: string;
  color: string;
}

function MetricCard({ icon, title, value, change, color }: MetricCardProps) {
  return (
    <motion.div
      className="bg-neutral-800/50 rounded-lg p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm font-medium">{title}</span>
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {change && (
        <div className="text-green-400 text-sm font-medium">{change}</div>
      )}
    </motion.div>
  );
}

export function VoiceDNA({ isAnalyzed, onRetrain, onReset, className = "" }: VoiceDNAProps) {
  if (!isAnalyzed) {
    return (
      <div className={`h-full bg-[#1E1E1E] border border-neutral-800 rounded-xl p-6 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-purple-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">Voice DNA Analysis</h3>
          <p className="text-gray-400 text-sm">
            Upload content to see your unique voice profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full bg-[#1E1E1E] border border-neutral-800 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-xl font-semibold text-white">Voice DNA</h3>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              Calibrated
            </Badge>
          </div>
          <p className="text-gray-400 text-sm">
            Your AI writing assistant is now trained on your unique style
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <MetricCard
          icon={<FileText className="h-4 w-4 text-blue-400" />}
          title="Posts Analyzed"
          value="247"
          change="+12 this week"
          color="bg-blue-500/20"
        />
        <MetricCard
          icon={<Target className="h-4 w-4 text-purple-400" />}
          title="Avg. Word Count"
          value="156"
          color="bg-purple-500/20"
        />
        <MetricCard
          icon={<TrendingUp className="h-4 w-4 text-green-400" />}
          title="Readability Score"
          value="Grade 9"
          color="bg-green-500/20"
        />
        <MetricCard
          icon={<BarChart3 className="h-4 w-4 text-orange-400" />}
          title="Confidence Level"
          value="94%"
          color="bg-orange-500/20"
        />
      </div>

      {/* Profile Management */}
      <div className="pt-6 border-t border-neutral-800">
        <h4 className="text-white font-medium mb-4">Profile Management</h4>
        <div className="space-y-3">
          <Button
            onClick={onRetrain}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Update Profile with New Content
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Profile & Start Over
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-neutral-800 border-neutral-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">
                  Reset Voice Profile?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  This action cannot be undone. This will permanently delete your 
                  current voice profile and all analyzed content. You'll need to 
                  upload new content to rebuild your profile.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-neutral-700 text-white border-neutral-600 hover:bg-neutral-600">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onReset}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Yes, Reset Profile
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Training Tips */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h5 className="text-blue-400 font-medium text-sm mb-2">💡 Pro Tip</h5>
        <p className="text-blue-300 text-xs leading-relaxed">
          For even better results, regularly update your profile with new high-performing content. 
          The AI learns and adapts to your evolving style over time.
        </p>
      </div>
    </div>
  );
}
