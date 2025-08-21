'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  MessageCircle,
  Repeat2,
  Heart,
  Share,
  Bookmark,
  MoreHorizontal
} from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';

interface ThreadTweet {
  id: string;
  content: string;
  characterCount: number;
}

interface TwitterPreviewProps {
  threads: ThreadTweet[];
}

export function TwitterPreview({ threads }: TwitterPreviewProps) {
  // Ensure threads is always an array
  const safeThreads = threads || [{ id: '1', content: '', characterCount: 0 }];
  
  const formatContent = (content: string) => {
    if (!content || !content.trim()) return 'Start typing to see your post preview...';
    
    // Simple formatting for hashtags and mentions
    return content
      .split(/(\s+)/)
      .map((word, index) => {
        if (word.startsWith('#')) {
          return (
            <span key={index} className="text-[#1DA1F2]">
              {word}
            </span>
          );
        }
        if (word.startsWith('@')) {
          return (
            <span key={index} className="text-[#1DA1F2]">
              {word}
            </span>
          );
        }
        return word;
      });
  };

  const formatTimeStamp = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }) + ' · ' + now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="w-full overflow-hidden">
      {/* Scrollable container for multiple threads */}
      <div className={`space-y-3 ${safeThreads.length > 2 ? 'max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800' : ''}`}>
        {safeThreads.map((thread, index) => (
        <div key={thread.id} className="bg-black rounded-lg p-3 border border-gray-800 w-full min-w-0">
          {/* Tweet Header */}
          <div className="flex items-start gap-3 w-full min-w-0">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" />
              <AvatarFallback className="bg-gray-700 text-white">
                You
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              {/* User Info */}
              <div className="flex items-center gap-1 mb-1 min-w-0">
                <span className="font-bold text-white text-sm truncate">Your Name</span>
                <span className="text-blue-500 text-xs">✓</span>
                <span className="text-gray-500 text-sm truncate">@yourhandle</span>
                <span className="text-gray-500 text-sm">·</span>
                <span className="text-gray-500 text-sm">now</span>
                <div className="ml-auto flex-shrink-0">
                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                </div>
              </div>
              
              {/* Thread indicator for multi-tweet threads */}
              {safeThreads.length > 1 && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
                    {index + 1}/{safeThreads.length}
                  </span>
                  {index > 0 && (
                    <span className="text-xs text-gray-500">Replying to @yourhandle</span>
                  )}
                </div>
              )}
              
              {/* Tweet Content */}
              <div className="text-white text-sm leading-relaxed mb-3 whitespace-pre-wrap break-words">
                {formatContent(thread?.content || '')}
              </div>
              
              {/* Character Count Indicator */}
              {thread?.content && (
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="truncate">{formatTimeStamp()}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={(thread?.characterCount || 0) > 280 ? 'text-red-400' : 'text-gray-500'}>
                      {thread?.characterCount || 0}/280
                    </span>
                    {(thread?.characterCount || 0) > 280 && (
                      <div className="w-4 h-4 rounded-full border-2 border-red-400 relative">
                        <div 
                          className="absolute inset-0 rounded-full bg-red-400"
                          style={{ 
                            clipPath: `polygon(0 0, ${Math.min(100, ((thread?.characterCount || 0) / 280) * 100)}% 0, ${Math.min(100, ((thread?.characterCount || 0) / 280) * 100)}% 100%, 0 100%)` 
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Tweet Actions */}
              <div className="flex items-center justify-between w-full overflow-hidden">
                <Button   className="text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 p-2 h-auto min-w-0 bg-transparent">
                  <MessageCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="ml-1 text-xs">24</span>
                </Button>
                
                <Button   className="text-gray-500 hover:text-green-400 hover:bg-green-400/10 p-2 h-auto min-w-0 bg-transparent">
                  <Repeat2 className="h-4 w-4 flex-shrink-0" />
                  <span className="ml-1 text-xs">12</span>
                </Button>
                
                <Button   className="text-gray-500 hover:text-red-400 hover:bg-red-400/10 p-2 h-auto min-w-0 bg-transparent">
                  <Heart className="h-4 w-4 flex-shrink-0" />
                  <span className="ml-1 text-xs">89</span>
                </Button>
                
                <Button   className="text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 p-2 h-auto min-w-0 bg-transparent">
                  <Share className="h-4 w-4 flex-shrink-0" />
                </Button>
                
                <Button   className="text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 p-2 h-auto min-w-0 bg-transparent">
                  <Bookmark className="h-4 w-4 flex-shrink-0" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Thread Connection Line */}
          {index < safeThreads.length - 1 && (
            <div className="flex items-center justify-center mt-4">
              <div className="w-px h-4 bg-gray-700"></div>
            </div>
          )}
        </div>
        ))}
      </div>
      
      {/* Thread Summary for multiple tweets */}
      {safeThreads.length > 1 && (
        <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-800 w-full">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Thread Preview</span>
            <span>{safeThreads.length} tweets</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Total characters: {safeThreads.reduce((sum, thread) => sum + (thread?.characterCount || 0), 0)}
          </div>
          {safeThreads.length > 2 && (
            <div className="mt-1 text-xs text-blue-400">
              ↕ Scroll to view all tweets
            </div>
          )}
        </div>
      )}
    </div>
  );
}
