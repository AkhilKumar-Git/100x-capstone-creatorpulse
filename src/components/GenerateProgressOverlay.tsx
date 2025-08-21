'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Wand2, Brain, Target, RefreshCw } from 'lucide-react';

interface ProgressStep {
  id: string;
  label: string;
  status: 'waiting' | 'active' | 'completed';
  duration?: number;
}

export interface GenerationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  icon: React.ReactNode | null;
}

interface GenerateProgressOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  platformCount?: number;
  waitForApiResponse?: boolean;
  imageApiCompleted?: boolean;
}

const generateSteps: ProgressStep[] = [
  { id: 'analyzing', label: 'Analyzing your topic', status: 'waiting', duration: 2000 },
  { id: 'style', label: 'Retrieving your writing style', status: 'waiting', duration: 1500 },
  { id: 'context', label: 'Gathering trending context', status: 'waiting', duration: 1800 },
  { id: 'x-content', label: 'Crafting viral X content', status: 'waiting', duration: 2500 },
  { id: 'linkedin-content', label: 'Creating professional LinkedIn post', status: 'waiting', duration: 2200 },
  { id: 'instagram-content', label: 'Designing engaging Instagram caption', status: 'waiting', duration: 2000 },
  { id: 'image-gen', label: 'Generating visual content', status: 'waiting', duration: 3000 },
  { id: 'finalizing', label: 'Loading content into previews', status: 'waiting', duration: 1000 }
];

export function GenerateProgressOverlay({ isVisible, onComplete, platformCount = 3, waitForApiResponse = false, imageApiCompleted = false }: GenerateProgressOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<ProgressStep[]>([]);

  useEffect(() => {
    if (isVisible) {
      // Reset when becoming visible
      setCurrentStepIndex(0);
      setProgress(0);
      setSteps(generateSteps.map(step => ({ ...step, status: 'waiting' })));
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || currentStepIndex >= steps.length) return;

    const currentStep = steps[currentStepIndex];
    if (!currentStep) return;

    // Mark current step as active
    setSteps(prev => prev.map((step, index) => 
      index === currentStepIndex 
        ? { ...step, status: 'active' }
        : step
    ));

    const timer = setTimeout(() => {
      // Mark current step as completed
      setSteps(prev => prev.map((step, index) => 
        index === currentStepIndex 
          ? { ...step, status: 'completed' }
          : step
      ));

      const nextIndex = currentStepIndex + 1;
      
      // If we're at the image generation step (index 6), wait for image API
      if (currentStepIndex === 6) { // image-gen step
        if (imageApiCompleted) {
          // Image API completed, move to next step
          const progressValue = (nextIndex / steps.length) * 100;
          setProgress(progressValue);
          setCurrentStepIndex(nextIndex);
        }
        // If image API not yet completed, stay on image generation step
        return;
      }
      
      // If we're at the finalizing step, wait for API response
      if (currentStepIndex === steps.length - 1) {
        // This is the finalizing step - wait for API response
        if (waitForApiResponse) {
          const progressValue = (nextIndex / steps.length) * 100;
          setProgress(progressValue);
          // All steps completed, API response received
          setTimeout(() => {
            onComplete();
          }, 500);
        }
        // If API response not yet received, stay on finalizing step
        return;
      }

      const progressValue = (nextIndex / steps.length) * 100;
      setProgress(progressValue);

      if (nextIndex >= steps.length) {
        // All steps completed
        setTimeout(() => {
          onComplete();
        }, 500);
      } else {
        setCurrentStepIndex(nextIndex);
      }
    }, currentStep.duration || 2000);

    return () => clearTimeout(timer);
  }, [currentStepIndex, steps.length, isVisible, onComplete]);

  // Watch for image API completion when on image generation step
  useEffect(() => {
    if (imageApiCompleted && currentStepIndex === 6) {
      // Image API completed while on image generation step - move forward
      const timer = setTimeout(() => {
        setSteps(prev => prev.map((step, index) => 
          index === 6 
            ? { ...step, status: 'completed' }
            : step
        ));
        setCurrentStepIndex(7);
        setProgress((7 / steps.length) * 100);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [imageApiCompleted, currentStepIndex, steps.length]);

  // Watch for API response when on finalizing step
  useEffect(() => {
    if (waitForApiResponse && currentStepIndex === steps.length - 1) {
      // API response received while on finalizing step - complete the progress
      const timer = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          onComplete();
        }, 500);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [waitForApiResponse, currentStepIndex, steps.length, onComplete]);

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'analyzing':
        return <Brain className="h-4 w-4" />;
      case 'style':
        return <Target className="h-4 w-4" />;
      case 'context':
        return <RefreshCw className="h-4 w-4" />;
      case 'x-content':
      case 'linkedin-content':
      case 'instagram-content':
        return <Wand2 className="h-4 w-4" />;
      case 'image-gen':
        return <Sparkles className="h-4 w-4" />;
      case 'finalizing':
        return <Target className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1E1E1E] border border-neutral-800 rounded-2xl p-8 max-w-md w-full"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
              >
                <Sparkles className="h-8 w-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Creating Your Content
              </h3>
              <p className="text-gray-400 text-sm">
                AI is crafting optimized content for all your platforms
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Progress</span>
                <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Current Step with Shimmer Effect */}
            <div className="space-y-4">
              {steps.slice(Math.max(0, currentStepIndex - 1), currentStepIndex + 2).map((step, index) => {
                const isActive = step.status === 'active';
                const isCompleted = step.status === 'completed';
                const isWaiting = step.status === 'waiting';

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                      isActive 
                        ? 'bg-purple-500/10 border border-purple-500/20' 
                        : isCompleted
                        ? 'bg-green-500/10 border border-green-500/20'
                        : 'bg-neutral-800/30'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`flex-shrink-0 p-2 rounded-full transition-all duration-300 ${
                      isActive 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : isCompleted
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-neutral-700 text-gray-500'
                    }`}>
                      {isActive && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          {getStepIcon(step.id)}
                        </motion.div>
                      )}
                      {!isActive && getStepIcon(step.id)}
                    </div>

                    {/* Text */}
                    <div className="flex-1">
                      {isActive ? (
                        <motion.span
                          className="text-sm font-medium text-white"
                          initial={{ backgroundPosition: "200% 0" }}
                          animate={{ backgroundPosition: "-200% 0" }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                          style={{
                            background: "linear-gradient(90deg, #ffffff 0%, #a855f7 25%, #ec4899 50%, #a855f7 75%, #ffffff 100%)",
                            backgroundSize: "200% 100%",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text"
                          }}
                        >
                          {step.label}...
                        </motion.span>
                      ) : (
                        <span className={`text-sm ${
                          isCompleted ? 'text-green-400' : 'text-gray-500'
                        }`}>
                          {step.label}
                          {isCompleted && ' ✓'}
                        </span>
                      )}
                    </div>

                    {/* Loading dots for active step */}
                    {isActive && (
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 bg-purple-400 rounded-full"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.2
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                This usually takes 10-15 seconds
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}