'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, X, Youtube, Rss, Hash, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PlatformType = 'x' | 'youtube' | 'blog' | 'rss';

interface PlatformFilterProps {
  selectedPlatforms: PlatformType[];
  onPlatformsChange: (platforms: PlatformType[]) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const platformConfig = {
  x: {
    label: 'Only X',
    icon: Hash,
    color: 'text-blue-500',
  },
  youtube: {
    label: 'Only YouTube',
    icon: Youtube,
    color: 'text-red-500',
  },
  blog: {
    label: 'Only Blogs',
    icon: Globe,
    color: 'text-green-500',
  },
  rss: {
    label: 'Only RSS',
    icon: Rss,
    color: 'text-orange-500',
  },
};

export const PlatformFilter: React.FC<PlatformFilterProps> = ({
  selectedPlatforms,
  onPlatformsChange,
  className,
  variant = 'outline',
  size = 'sm',
}) => {
  const handlePlatformToggle = (platform: PlatformType) => {
    if (selectedPlatforms.includes(platform)) {
      onPlatformsChange(selectedPlatforms.filter(p => p !== platform));
    } else {
      onPlatformsChange([...selectedPlatforms, platform]);
    }
  };

  const handleSelectAll = () => {
    onPlatformsChange(['x', 'youtube', 'blog', 'rss']);
  };

  const handleClearAll = () => {
    onPlatformsChange([]);
  };

  const getCurrentLabel = () => {
    if (selectedPlatforms.length === 0) {
      return 'All Platforms';
    }
    if (selectedPlatforms.length === 1) {
      return platformConfig[selectedPlatforms[0]].label;
    }
    if (selectedPlatforms.length === 4) {
      return 'All Platforms';
    }
    return `${selectedPlatforms.length} Platforms`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            'flex items-center gap-2',
            selectedPlatforms.length > 0 && 'ring-2 ring-primary/20',
            className
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
          {getCurrentLabel()}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Filter by Platform</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSelectAll}>
          <Globe className="mr-2 h-4 w-4" />
          All Platforms
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {Object.entries(platformConfig).map(([platform, config]) => {
          const Icon = config.icon;
          const isSelected = selectedPlatforms.includes(platform as PlatformType);
          
          return (
            <DropdownMenuItem
              key={platform}
              onClick={() => handlePlatformToggle(platform as PlatformType)}
              className={cn(
                'flex items-center justify-between',
                isSelected && 'bg-accent'
              )}
            >
              <div className="flex items-center">
                <Icon className={cn('mr-2 h-4 w-4', config.color)} />
                {config.label}
              </div>
              {isSelected && (
                <X className="h-4 w-4 text-muted-foreground" />
              )}
            </DropdownMenuItem>
          );
        })}
        
        {selectedPlatforms.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleClearAll} className="text-muted-foreground">
              Clear All Filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
