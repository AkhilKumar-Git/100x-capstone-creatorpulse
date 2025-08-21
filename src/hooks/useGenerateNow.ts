'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { GenerationStep } from '@/components/GenerateProgressOverlay';

export interface GenerateNowParams {
  sourceIds?: number[];
  includePlatforms?: Array<'x' | 'youtube' | 'blog' | 'rss'>;
}

export interface GenerateNowResult {
  ok: boolean;
  trends?: number;
  drafts?: number;
  message?: string;
  reason?: string;
}

export interface GenerationProgress {
  currentStep: string;
  steps: GenerationStep[];
  overallProgress: number;
}

export const useGenerateNow = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateNowResult | null>(null);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const router = useRouter();

  const updateProgress = useCallback((step: string, progress: number) => {
    const allSteps: GenerationStep[] = [
      { id: 'planning', title: 'Planning Next Moves', description: 'Analyzing your sources and planning content strategy', status: 'pending', icon: null },
      { id: 'reading_x', title: 'Reading from X', description: 'Fetching latest tweets and engagement data', status: 'pending', icon: null },
      { id: 'reading_youtube', title: 'Reading from YouTube', description: 'Analyzing video transcripts and channel data', status: 'pending', icon: null },
      { id: 'reading_rss', title: 'Reading from RSS', description: 'Processing latest articles and blog posts', status: 'pending', icon: null },
      { id: 'reading_blogs', title: 'Reading from Blogs', description: 'Scraping and analyzing blog content', status: 'pending', icon: null },
      { id: 'unifying_sources', title: 'Unifying Sources', description: 'Combining data from all platforms', status: 'pending', icon: null },
      { id: 'summarizing_trends', title: 'Summarizing Trends', description: 'Identifying key trending topics', status: 'pending', icon: null },
      { id: 'scoring', title: 'Scoring Trends', description: 'Calculating momentum and engagement scores', status: 'pending', icon: null },
      { id: 'almost_done', title: 'Almost Done', description: 'Uploading everything to Supabase', status: 'pending', icon: null },
      { id: 'finished', title: 'Finished!', description: 'Content generation completed successfully', status: 'pending', icon: null }
    ];

    const updatedSteps = allSteps.map(s => {
      if (s.id === step) {
        return { ...s, status: 'active' as const };
      } else if (allSteps.findIndex(step => step.id === s.id) < allSteps.findIndex(step => step.id === step)) {
        return { ...s, status: 'completed' as const };
      }
      return s;
    });

    setProgress({
      currentStep: step,
      steps: updatedSteps,
      overallProgress: progress
    });
  }, []);

  const generate = async (params: GenerateNowParams = {}) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setShowProgress(true);
    
    // Initialize progress
    updateProgress('planning', 10);

    try {
      // Simulate progress updates for each step
      const progressSteps = [
        { step: 'reading_x', delay: 1000, progress: 20 },
        { step: 'reading_youtube', delay: 2000, progress: 30 },
        { step: 'reading_rss', delay: 3000, progress: 40 },
        { step: 'reading_blogs', delay: 4000, progress: 50 },
        { step: 'unifying_sources', delay: 5000, progress: 60 },
        { step: 'summarizing_trends', delay: 6000, progress: 70 },
        { step: 'scoring', delay: 7000, progress: 80 },
        { step: 'almost_done', delay: 8000, progress: 90 }
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
        throw new Error(data.reason || `HTTP ${response.status}`);
      }

      if (!data.ok) {
        throw new Error(data.reason || 'Generation failed');
      }

      // Complete the process
      setTimeout(() => updateProgress('finished', 100), 9000);

      setResult(data);

      // Show success toast
      const trendsText = data.trends ? `${data.trends} trends processed` : '';
      const draftsText = data.drafts ? `${data.drafts} drafts created` : '';
      const message = [trendsText, draftsText].filter(Boolean).join(', ');
      
      toast.success(
        `Drafts generated! ${message}. Refreshing...`,
        {
          description: data.message || 'Your content is being processed',
        }
      );

      // Wait for progress to complete before refreshing
      setTimeout(() => {
        setShowProgress(false);
        router.refresh();
      }, 11000);

      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Generation failed';
      setError(errorMessage);
      
      // Show error toast
      toast.error(
        `Couldn't generate now — ${errorMessage}`,
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
    reset,
  };
};
