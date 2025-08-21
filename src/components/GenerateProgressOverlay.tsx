import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Clock, Loader2, Sparkles, TrendingUp, FileText, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface GenerationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  icon: React.ReactNode;
  progress?: number;
}

interface GenerateProgressOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: string;
  steps: GenerationStep[];
  overallProgress: number;
  onCancel?: () => void;
}

const stepConfig = {
  'planning': {
    title: 'Planning Next Moves',
    description: 'Analyzing your sources and planning content strategy',
    icon: <Sparkles className="h-5 w-5" />
  },
  'reading_x': {
    title: 'Reading from X',
    description: 'Fetching latest tweets and engagement data',
    icon: <TrendingUp className="h-5 w-5" />
  },
  'reading_youtube': {
    title: 'Reading from YouTube',
    description: 'Analyzing video transcripts and channel data',
    icon: <TrendingUp className="h-5 w-5" />
  },
  'reading_rss': {
    title: 'Reading from RSS',
    description: 'Processing latest articles and blog posts',
    icon: <FileText className="h-5 w-5" />
  },
  'reading_blogs': {
    title: 'Reading from Blogs',
    description: 'Scraping and analyzing blog content',
    icon: <FileText className="h-5 w-5" />
  },
  'unifying_sources': {
    title: 'Unifying Sources',
    description: 'Combining data from all platforms',
    icon: <Zap className="h-5 w-5" />
  },
  'summarizing_trends': {
    title: 'Summarizing Trends',
    description: 'Identifying key trending topics',
    icon: <TrendingUp className="h-5 w-5" />
  },
  'scoring': {
    title: 'Scoring Trends',
    description: 'Calculating momentum and engagement scores',
    icon: <Zap className="h-5 w-5" />
  },
  'almost_done': {
    title: 'Almost Done',
    description: 'Uploading everything to Supabase',
    icon: <Loader2 className="h-5 w-5 animate-spin" />
  },
  'finished': {
    title: 'Finished!',
    description: 'Content generation completed successfully',
    icon: <CheckCircle className="h-5 w-5" />
  }
};

export function GenerateProgressOverlay({
  isOpen,
  onClose,
  currentStep,
  steps,
  overallProgress,
  onCancel
}: GenerateProgressOverlayProps) {
  const [currentStepConfig] = useState(() => stepConfig[currentStep as keyof typeof stepConfig] || stepConfig.planning);

  useEffect(() => {
    if (currentStep === 'finished') {
      const timer = setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-2xl mx-4 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Generating Content</h2>
                  <p className="text-sm text-gray-400">Creating trending topics and drafts from your sources</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">Overall Progress</span>
                  <span className="text-sm text-gray-400">{Math.round(overallProgress)}%</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-2">
                  <motion.div
                    className="h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Current Step */}
              <div className="mb-6">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-800/50 border border-neutral-700">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    {currentStepConfig.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{currentStepConfig.title}</h3>
                    <p className="text-sm text-gray-400">{currentStepConfig.description}</p>
                  </div>
                  {currentStep === 'almost_done' && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                      <span className="text-xs text-blue-400">Uploading...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* All Steps */}
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                      step.status === 'completed'
                        ? 'bg-green-500/10 border border-green-500/20'
                        : step.status === 'active'
                        ? 'bg-blue-500/10 border border-blue-500/20'
                        : step.status === 'error'
                        ? 'bg-red-500/10 border border-red-500/20'
                        : 'bg-neutral-800/30 border border-neutral-700/50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      step.status === 'completed'
                        ? 'bg-green-500 text-white'
                        : step.status === 'active'
                        ? 'bg-blue-500 text-white'
                        : step.status === 'error'
                        ? 'bg-red-500 text-white'
                        : 'bg-neutral-600 text-gray-400'
                    }`}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : step.status === 'active' ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : step.status === 'error' ? (
                        <X className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className={`text-sm font-medium ${
                        step.status === 'completed'
                          ? 'text-green-400'
                          : step.status === 'active'
                          ? 'text-blue-400'
                          : step.status === 'error'
                          ? 'text-red-400'
                          : 'text-gray-400'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    {step.progress !== undefined && step.status === 'active' && (
                      <div className="text-xs text-blue-400">
                        {Math.round(step.progress)}%
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-neutral-800 bg-neutral-900/50">
              <div className="text-sm text-gray-400">
                {currentStep === 'finished' ? (
                  <span className="text-green-400">✅ Generation completed successfully!</span>
                ) : (
                  <span>Processing your sources...</span>
                )}
              </div>
              {currentStep !== 'finished' && onCancel && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  Cancel Generation
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
