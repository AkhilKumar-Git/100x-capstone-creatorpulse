'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { useGenerateNow, type GenerateNowParams } from '@/hooks/useGenerateNow';
import { cn } from '@/lib/utils';
import { GenerateProgressOverlay } from './GenerateProgressOverlay';

interface GenerateNowButtonProps {
  sourceIds?: number[];
  includePlatforms?: Array<'x' | 'youtube' | 'blog' | 'rss'>;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const GenerateNowButton: React.FC<GenerateNowButtonProps> = ({
  sourceIds,
  includePlatforms,
  className,
  variant = 'default',
  size = 'default',
  children,
  onSuccess,
  onError,
}) => {
  const { generate, loading, progress, showProgress, closeProgress } = useGenerateNow();

  const handleClick = async () => {
    try {
      const params: GenerateNowParams = {};
      
      if (sourceIds && sourceIds.length > 0) {
        params.sourceIds = sourceIds;
      }
      
      if (includePlatforms && includePlatforms.length > 0) {
        params.includePlatforms = includePlatforms;
      }

      const result = await generate(params);
      
      if (onSuccess) {
        onSuccess();
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Generation failed';
      
      if (onError) {
        onError(errorMessage);
      }
      
      throw err;
    }
  };

  const defaultChildren = (
    <>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Now
        </>
      )}
    </>
  );

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn(
          'transition-all duration-200',
          loading && 'cursor-not-allowed opacity-80',
          className
        )}
        onClick={handleClick}
        disabled={loading}
        aria-label={loading ? 'Generating content...' : 'Generate content now'}
        aria-busy={loading}
      >
        {children || defaultChildren}
      </Button>

      {/* Progress Overlay */}
      {progress && (
        <GenerateProgressOverlay
          isOpen={showProgress}
          onClose={closeProgress}
          currentStep={progress.currentStep}
          steps={progress.steps}
          overallProgress={progress.overallProgress}
          onCancel={closeProgress}
        />
      )}
    </>
  );
};
