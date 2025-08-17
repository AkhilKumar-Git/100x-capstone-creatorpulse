'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Smile
} from 'lucide-react';

interface InstagramPreviewProps {
  content: string;
  firstComment?: string;
  media?: File[];
}

export function InstagramPreview({ content, firstComment, media }: InstagramPreviewProps) {
  const formatContent = (content: string) => {
    if (!content.trim()) return 'Start typing your caption...';
    
    // Format hashtags and mentions
    return content
      .split(/(\s+)/)
      .map((word, index) => {
        if (word.startsWith('#')) {
          return (
            <span key={index} className="text-[#0095F6] font-medium">
              {word}
            </span>
          );
        }
        if (word.startsWith('@')) {
          return (
            <span key={index} className="text-[#0095F6] font-medium">
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
    <div className="bg-black rounded-lg overflow-hidden border border-gray-800 max-w-sm mx-auto">
      {/* Post Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" />
            <AvatarFallback className="bg-gray-700 text-white text-xs">
              You
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-white text-sm font-medium">yourusername</div>
          </div>
        </div>
        <MoreHorizontal className="h-5 w-5 text-white" />
      </div>

      {/* Media Section */}
      <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        {media && media.length > 0 ? (
          <div className="text-white text-sm">Media Preview</div>
        ) : (
          <div className="text-center text-gray-500">
            <div className="w-16 h-16 mx-auto mb-2 bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-600 rounded"></div>
            </div>
            <div className="text-xs">Add photos or videos</div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-white hover:text-red-400 hover:bg-transparent p-0 h-auto">
              <Heart className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:text-blue-400 hover:bg-transparent p-0 h-auto">
              <MessageCircle className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:text-blue-400 hover:bg-transparent p-0 h-auto">
              <Send className="h-6 w-6" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="text-white hover:text-yellow-400 hover:bg-transparent p-0 h-auto">
            <Bookmark className="h-6 w-6" />
          </Button>
        </div>

        {/* Likes */}
        <div className="text-white text-sm font-medium mb-2">
          34,920 likes
        </div>

        {/* Caption */}
        <div className="text-white text-sm leading-relaxed">
          <span className="font-medium mr-2">yourusername</span>
          <span className="whitespace-pre-wrap">
            {formatContent(content)}
          </span>
        </div>

        {/* Character count indicator */}
        {content && (
          <div className="mt-2 text-xs text-gray-500">
            {content.length}/2,200 characters
          </div>
        )}

        {/* First Comment Preview */}
        {firstComment && (
          <div className="mt-3 text-white text-sm">
            <span className="font-medium mr-2">yourusername</span>
            <span className="text-gray-300">{firstComment}</span>
          </div>
        )}

        {/* View Comments */}
        <div className="mt-2 text-gray-500 text-sm">
          View all 59 comments
        </div>

        {/* Timestamp */}
        <div className="mt-1 text-gray-500 text-xs uppercase tracking-wide">
          {formatTimeStamp()}
        </div>

        {/* Add Comment */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-800">
          <Smile className="h-5 w-5 text-gray-500" />
          <div className="flex-1 text-gray-500 text-sm">
            Add a comment...
          </div>
          <div className="text-[#0095F6] text-sm font-medium">
            Post
          </div>
        </div>
      </div>
    </div>
  );
}
