'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, X } from 'lucide-react';

export interface DashboardGenerationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardGenerateProgressOverlayProps {
  isVisible: boolean;
  currentStep: number;
  steps: DashboardGenerationStep[];
  onClose?: () => void;
  overallProgress?: number;
  onCancel?: () => void; 
}

export function DashboardGenerateProgressOverlay({
  isVisible,
  currentStep,
  steps,
  onClose,
  overallProgress,
  onCancel
}: DashboardGenerateProgressOverlayProps) {
  if (!isVisible) return null;

  // Get current step info for status display
  const safeCurrentStep = Math.max(0, Math.min(currentStep, steps.length - 1));
  const currentStepInfo = steps[safeCurrentStep] || steps[0];
  const progressPercentage = overallProgress || Math.max(0, Math.min(100, ((safeCurrentStep + 1) / steps.length) * 100));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-gray-700"
        >
          {/* Header with close button */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Generating Trends
              </h3>
            </div>
            {(onClose || onCancel) && (
              <button
                onClick={onClose || onCancel}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Status Message */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {currentStepInfo?.title || 'Processing...'}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentStepInfo?.description || 'Please wait while we analyze your sources...'}
            </p>
          </div>

          {/* Simple Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 ease-out"
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round(progressPercentage)}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Step {safeCurrentStep + 1} of {steps.length}
              </span>
            </div>
          </div>

          {/* Cancel Button */}
          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel Generation
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
