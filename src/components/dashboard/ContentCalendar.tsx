'use client';

import React, { useState } from 'react';
import {
  CalendarBody,
  CalendarDate,
  CalendarDatePagination,
  CalendarDatePicker,
  CalendarHeader,
  CalendarItem,
  CalendarMonthPicker,
  CalendarProvider,
  CalendarYearPicker,
  Feature,
  Status,
} from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { XIcon } from '@/components/ui/x-icon';
import {
  Plus,
  Linkedin,
  Instagram,
  Edit3,
  Clock
} from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns';

// Status definitions for different post states
const postStatuses: Status[] = [
  { id: 'scheduled', name: 'Scheduled', color: '#10B981' }, // Green
  { id: 'draft', name: 'Draft', color: '#3B82F6' }, // Blue
  { id: 'ai-generated', name: 'AI Generated', color: '#8B5CF6' }, // Purple
  { id: 'needs-review', name: 'Needs Review', color: '#F59E0B' }, // Orange
];

// Mock scheduled posts as calendar features
const mockCalendarPosts: Feature[] = [
  {
    id: '1',
    name: 'The future of AI in content creation...',
    startAt: new Date(2025, 0, 16, 9, 0), // Jan 16, 9:00 AM
    endAt: new Date(2025, 0, 16, 9, 0),
    status: postStatuses[0], // Scheduled
  },
  {
    id: '2',
    name: '5 lessons from scaling creator business',
    startAt: new Date(2025, 0, 16, 14, 0), // Jan 16, 2:00 PM
    endAt: new Date(2025, 0, 16, 14, 0),
    status: postStatuses[1], // Draft
  },
  {
    id: '3',
    name: 'Content strategy that works in 2024',
    startAt: new Date(2025, 0, 17, 10, 30), // Jan 17, 10:30 AM
    endAt: new Date(2025, 0, 17, 10, 30),
    status: postStatuses[2], // AI Generated
  },
  {
    id: '4',
    name: 'Building authentic connections online',
    startAt: new Date(2025, 0, 18, 11, 0), // Jan 18, 11:00 AM
    endAt: new Date(2025, 0, 18, 11, 0),
    status: postStatuses[3], // Needs Review
  },
  {
    id: '5',
    name: 'Social media trends for 2025',
    startAt: new Date(2025, 0, 19, 9, 30), // Jan 19, 9:30 AM
    endAt: new Date(2025, 0, 19, 9, 30),
    status: postStatuses[0], // Scheduled
  },
  {
    id: '6',
    name: 'Maximizing engagement with AI tools',
    startAt: new Date(2025, 0, 20, 15, 0), // Jan 20, 3:00 PM
    endAt: new Date(2025, 0, 20, 15, 0),
    status: postStatuses[2], // AI Generated
  },
  {
    id: '7',
    name: 'Personal branding essentials',
    startAt: new Date(2025, 0, 21, 8, 0), // Jan 21, 8:00 AM
    endAt: new Date(2025, 0, 21, 8, 0),
    status: postStatuses[1], // Draft
  },
  {
    id: '8',
    name: 'Creating viral content consistently',
    startAt: new Date(2025, 0, 22, 12, 0), // Jan 22, 12:00 PM
    endAt: new Date(2025, 0, 22, 12, 0),
    status: postStatuses[3], // Needs Review
  }
];

interface ContentCalendarProps {
  onPlanPost?: (date: Date) => void;
}

export function ContentCalendar({ onPlanPost }: ContentCalendarProps) {
  const currentYear = new Date().getFullYear();
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const getPlatformIcon = (postId: string) => {
    // Simple logic to assign platforms based on post ID
    const platformIndex = parseInt(postId) % 3;
    switch (platformIndex) {
      case 0:
        return <XIcon className="h-3 w-3 text-white" />;
      case 1:
        return <Linkedin className="h-3 w-3 text-[#0077B5]" />;
      case 2:
        return <Instagram className="h-3 w-3 text-[#E4405F]" />;
      default:
        return <XIcon className="h-3 w-3 text-white" />;
    }
  };

  const getStatusBadgeColor = (status: Status) => {
    switch (status.id) {
      case 'scheduled':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'draft':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'ai-generated':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'needs-review':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleAddPost = (date: Date) => {
    if (onPlanPost) {
      onPlanPost(date);
    }
  };

  // Enhanced calendar body with click handlers
  const EnhancedCalendarBody = () => {
    return (
      <CalendarBody features={mockCalendarPosts}>
        {({ feature }) => (
          <div className="group relative">
            <div className="flex items-start gap-1 p-1 rounded bg-neutral-800/30 border border-neutral-700/50 hover:border-neutral-600/50 transition-colors cursor-pointer mb-1">
              <div className="flex-shrink-0 mt-0.5">
                {getPlatformIcon(feature.id)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white truncate font-medium">
                  {feature.name}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-2 w-2 text-gray-400" />
                  <span className="text-xs text-gray-400">
                    {format(feature.startAt, 'h:mm a')}
                  </span>
                </div>
                <Badge 
                  className={`text-xs px-1 py-0 h-4 mt-1 ${getStatusBadgeColor(feature.status)}`}
                >
                  {feature.status.name}
                </Badge>
              </div>
              <GradientButton
                
                
                className="opacity-0 group-hover:opacity-100 transition-opacity h-4 w-4 p-0 text-gray-400 hover:text-white"
              >
                <Edit3 className="h-3 w-3" />
              </GradientButton>
            </div>
          </div>
        )}
      </CalendarBody>
    );
  };

  return (
    <div className="h-full">
      <CalendarProvider
        locale="en-US"
        startDay={0}
        className="h-full bg-[#1E1E1E] border border-neutral-800 rounded-lg"
      >
        {/* Calendar Header with Date Picker and Navigation */}
        <CalendarDate>
          <CalendarDatePicker>
            <CalendarMonthPicker className="bg-neutral-800 border-neutral-700 text-white" />
            <CalendarYearPicker 
              start={currentYear - 2} 
              end={currentYear + 2}
              className="bg-neutral-800 border-neutral-700 text-white" 
            />
          </CalendarDatePicker>
          <CalendarDatePagination />
        </CalendarDate>

        {/* Day Headers */}
        <CalendarHeader className="border-b border-neutral-800" />

        {/* Calendar Grid */}
        <div className="flex-1 relative">
          <EnhancedCalendarBody />
          
          {/* Overlay for adding new posts */}
          <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
            {Array.from({ length: 42 }, (_, index) => {
              const currentDate = new Date(selectedYear, selectedMonth, index - 6); // Rough calculation
              return (
                <div
                  key={index}
                  className="relative aspect-square border-t border-r border-neutral-800/30 pointer-events-auto group"
                  onMouseEnter={() => setHoveredDay(index)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {hoveredDay === index && (
                    <div className="absolute inset-0 bg-purple-500/5 flex items-end justify-end p-1">
                      <GradientButton
                        
                        
                        className="h-6 w-6 p-0 bg-purple-600 hover:bg-purple-700 text-white opacity-80 hover:opacity-100"
                        onClick={() => handleAddPost(currentDate)}
                      >
                        <Plus className="h-3 w-3" />
                      </GradientButton>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="p-3 border-t border-neutral-800">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">Status:</span>
            {postStatuses.map((status) => (
              <div key={status.id} className="flex items-center gap-1">
                <div 
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: status.color }}
                />
                <span className="text-gray-300 text-xs">{status.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CalendarProvider>
    </div>
  );
}
