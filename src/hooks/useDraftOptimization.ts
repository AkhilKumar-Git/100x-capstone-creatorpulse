import { useState } from 'react';
import { toast } from 'sonner';

export interface OptimizeDraftParams {
  content: string;
  platform: 'x' | 'linkedin' | 'instagram';
  originalDraftId?: string;
}

export interface OptimizeDraftResult {
  ok: boolean;
  optimized_content?: string;
  draft_id?: string;
  platform?: string;
  message?: string;
  reason?: string;
}

export function useDraftOptimization() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OptimizeDraftResult | null>(null);

  const optimizeDraft = async (params: OptimizeDraftParams): Promise<OptimizeDraftResult> => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/optimize-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data: OptimizeDraftResult = await response.json();

      if (!response.ok) {
        throw new Error(data.reason || `HTTP ${response.status}`);
      }

      if (!data.ok) {
        throw new Error(data.reason || 'Optimization failed');
      }

      setResult(data);

      // Show success toast
      toast.success(
        `Content optimized for ${params.platform}!`,
        {
          description: data.message || 'Your content has been optimized for maximum engagement',
        }
      );

      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Optimization failed';
      setError(errorMessage);
      
      // Show error toast
      toast.error(
        `Couldn't optimize content — ${errorMessage}`,
        {
          description: 'Please try again or check your content',
        }
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setResult(null);
  };

  return {
    optimizeDraft,
    loading,
    error,
    result,
    reset,
  };
}
