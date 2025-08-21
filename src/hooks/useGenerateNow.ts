'use client';
import { Play, Database, Zap, Twitter, Youtube, Rss, Brain, Edit, Check } from 'lucide-react';
import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { DashboardGenerationStep } from '@/components/DashboardGenerateProgressOverlay';

export interface GenerateNowParams {
  sourceIds?: number[];
  includePlatforms?: Array<'x' | 'youtube' | 'blog' | 'rss'>;
  forceRegenerate?: boolean;
}

export interface GenerateNowResult {
  ok: boolean;
  trends?: number;
  drafts?: number;
  message?: string;
  reason?: string;
  alreadyGenerated?: boolean;
}

export interface GenerationProgress {
  currentStep: string;
  steps: DashboardGenerationStep[];
  overallProgress: number;
}

export const useGenerateNow = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateNowResult | null>(null);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [alreadyGenerated, setAlreadyGenerated] = useState(false);
  const router = useRouter();

  // Memoize the steps array to prevent unnecessary re-renders
// In useGenerateNow.ts, update the allSteps array:
const allSteps = useMemo(() => [
  { id: 'start', title: 'Starting Generation', description: 'Initializing your request...', status: 'pending' as const, icon: Play },
  { id: 'fetch-sources', title: 'Fetching Sources', description: 'Gathering your active sources...', status: 'pending' as const, icon: Database },
  { id: 'edge-function', title: 'Setting Up', description: 'Preparing the analysis engine...', status: 'pending' as const, icon: Zap },
  { id: 'ingest-x', title: 'Analyzing X', description: 'Processing Twitter trends...', status: 'pending' as const, icon: Twitter },
  { id: 'ingest-youtube', title: 'Analyzing YouTube', description: 'Processing video content...', status: 'pending' as const, icon: Youtube },
  { id: 'ingest-blogs', title: 'Analyzing Blogs', description: 'Processing article content...', status: 'pending' as const, icon: Rss },
  { id: 'ai-analysis', title: 'AI Processing', description: 'Generating insights...', status: 'pending' as const, icon: Brain },
  { id: 'generate-drafts', title: 'Creating Content', description: 'Writing your drafts...', status: 'pending' as const, icon: Edit },
  { id: 'complete', title: 'Almost Done', description: 'Finalizing your content...', status: 'pending' as const, icon: Check }
], []);

  const updateProgress = useCallback((step: string, progress: number) => {
    const updatedSteps = allSteps.map(s => {
      if (s.id === step) {
        return { ...s, status: 'in-progress' as const };  // Change 'active' to 'in-progress'
      } else {
        // Find the index of the current step and mark previous steps as completed
        const currentStepIndex = allSteps.findIndex(stepItem => stepItem.id === step);
        const stepIndex = allSteps.findIndex(stepItem => stepItem.id === s.id);
        
        if (currentStepIndex !== -1 && stepIndex < currentStepIndex) {
          return { ...s, status: 'completed' as const };
        }
      }
      return s;
    });

    setProgress({
      currentStep: step,
      steps: updatedSteps,
      overallProgress: progress
    });
  }, [allSteps]);

  const generate = async (params: GenerateNowParams = {}) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setAlreadyGenerated(false);
    setShowProgress(true);
    
    // Initialize progress
    updateProgress('start', 10);

    try {
      // Simulate progress updates for each step
      const progressSteps = [
        { step: 'fetch-sources', delay: 1000, progress: 15 },
        { step: 'edge-function', delay: 2500, progress: 25 },
        { step: 'ingest-x', delay: 4000, progress: 35 },
        { step: 'ingest-youtube', delay: 5500, progress: 45 },
        { step: 'ingest-blogs', delay: 7000, progress: 55 },
        { step: 'ai-analysis', delay: 8500, progress: 65 },
        { step: 'generate-drafts', delay: 10000, progress: 75 },
        { step: 'complete', delay: 11500, progress: 90 }
      ];

      // Start progress simulation
      progressSteps.forEach(({ step, delay, progress: stepProgress }) => {
        setTimeout(() => updateProgress(step, stepProgress), delay);
      });

      // Make the actual API call
      const response = await fetch('/api/generate-now', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data: GenerateNowResult = await response.json();

      if (!response.ok) {
        // Handle case when daily topics are already generated
        if (response.status === 409 && data.alreadyGenerated) {
          setAlreadyGenerated(true);
          setShowProgress(false);
          
          toast.info(
            'Trending topics already generated',
            {
              description: 'You can regenerate if you want fresh trends',
              action: {
                label: 'Regenerate',
                onClick: () => generate({ ...params, forceRegenerate: true })
              }
            }
          );
          
          return { ok: false, reason: 'Already generated', alreadyGenerated: true };
        }
        
        throw new Error(data.reason || `HTTP ${response.status}`);
      }

      if (!data.ok) {
        throw new Error(data.reason || 'Generation failed');
      }

      // Complete the process
      setTimeout(() => updateProgress('complete', 100), 11500);

      setResult(data);

      // Show success toast
      const trendsText = data.trends ? `${data.trends} trends processed` : '';
      const draftsText = data.drafts ? `${data.drafts} drafts created` : '';
      const message = [trendsText, draftsText].filter(Boolean).join(', ');
      
      const toastMessage = params.forceRegenerate 
        ? `Trending topics regenerated! ${message}. Refreshing...`
        : `Trending topics generated! ${message}. Refreshing...`;
      
      toast.success(
        toastMessage,
        {
          description: data.message || 'Your trending topics are now updated',
        }
      );

      // Wait for progress to complete before refreshing
      setTimeout(() => {
        setShowProgress(false);
        router.refresh();
      }, 13000);

      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Generation failed';
      setError(errorMessage);
      
      // Show error toast
      toast.error(
        `Couldn't generate trends — ${errorMessage}`,
        {
          description: 'Please try again or check your sources',
        }
      );
      
      setShowProgress(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setResult(null);
    setProgress(null);
    setShowProgress(false);
    setAlreadyGenerated(false);
  };

  const closeProgress = () => {
    setShowProgress(false);
  };

  return {
    generate,
    loading,
    error,
    result,
    progress,
    showProgress,
    closeProgress,
    alreadyGenerated,
    reset,
  };
};