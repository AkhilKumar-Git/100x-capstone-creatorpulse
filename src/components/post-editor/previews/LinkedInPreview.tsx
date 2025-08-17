'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Send,
  MoreHorizontal,
  Users,
  Briefcase
} from 'lucide-react';

interface LinkedInPreviewProps {
  content: string;
  title?: string;
}

export function LinkedInPreview({ content, title }: LinkedInPreviewProps) {
  const formatContent = (content: string) => {
    if (!content.trim()) return 'Start writing your professional update...';
    
    // Format hashtags and mentions for LinkedIn
    return content
      .split(/(\s+)/)
      .map((word, index) => {
        if (word.startsWith('#')) {
          return (
            <span key={index} className="text-[#0A66C2] font-medium">
              {word}
            </span>
          );
        }
        if (word.startsWith('@')) {
          return (
            <span key={index} className="text-[#0A66C2] font-medium">
              {word}
            </span>
          );
        }
        return word;
      });
  };

  const formatTimeStamp = () => {
    return 'now';
  };

  return (
    <div className="bg-[#1B1F23] rounded-lg border border-[#38434F] max-w-lg mx-auto">
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face" />
            <AvatarFallback className="bg-gray-600 text-white">
              You
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white text-sm">Your Name</div>
                <div className="text-[#B0B7C3] text-xs">
                  Performance Marketing | Google Ads | Meta Ads | SEM | SEO | E...
                </div>
                <div className="flex items-center gap-1 text-[#B0B7C3] text-xs mt-1">
                  <span>{formatTimeStamp()}</span>
                  <span>•</span>
                  <Users className="h-3 w-3" />
                  <span>Everyone</span>
                </div>
              </div>
              <MoreHorizontal className="h-5 w-5 text-[#B0B7C3]" />
            </div>
          </div>
        </div>

        {/* Article Title (if provided) */}
        {title && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-white leading-tight">
              {title}
            </h2>
          </div>
        )}

        {/* Post Content */}
        <div className="mt-3 text-white text-sm leading-relaxed whitespace-pre-wrap">
          {formatContent(content)}
        </div>

        {/* Character count indicator */}
        {content && (
          <div className="mt-2 text-xs text-[#B0B7C3]">
            {content.length}/3,000 characters
          </div>
        )}
      </div>

      {/* Engagement Stats */}
      <div className="px-4 py-2 border-t border-[#38434F]">
        <div className="flex items-center justify-between text-xs text-[#B0B7C3]">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <div className="w-4 h-4 rounded-full bg-[#0A66C2] flex items-center justify-center">
                <ThumbsUp className="h-2 w-2 text-white" />
              </div>
              <div className="w-4 h-4 rounded-full bg-[#00A0DC] flex items-center justify-center">
                <span className="text-white text-xs">👏</span>
              </div>
              <div className="w-4 h-4 rounded-full bg-[#C37D16] flex items-center justify-center">
                <span className="text-white text-xs">💡</span>
              </div>
            </div>
            <span>14 reactions</span>
          </div>
          <div className="flex items-center gap-3">
            <span>2 comments</span>
            <span>1 repost</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-3 border-t border-[#38434F]">
        <div className="flex items-center justify-around">
          <Button variant="ghost" size="sm" className="text-[#B0B7C3] hover:bg-[#38434F] flex-1 h-10">
            <div className="flex flex-col items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span className="text-xs">Like</span>
            </div>
          </Button>
          
          <Button variant="ghost" size="sm" className="text-[#B0B7C3] hover:bg-[#38434F] flex-1 h-10">
            <div className="flex flex-col items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs">Comment</span>
            </div>
          </Button>
          
          <Button variant="ghost" size="sm" className="text-[#B0B7C3] hover:bg-[#38434F] flex-1 h-10">
            <div className="flex flex-col items-center gap-1">
              <Repeat2 className="h-4 w-4" />
              <span className="text-xs">Repost</span>
            </div>
          </Button>
          
          <Button variant="ghost" size="sm" className="text-[#B0B7C3] hover:bg-[#38434F] flex-1 h-10">
            <div className="flex flex-col items-center gap-1">
              <Send className="h-4 w-4" />
              <span className="text-xs">Send</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
