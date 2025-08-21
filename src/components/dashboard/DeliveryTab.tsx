'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { XIcon } from '@/components/ui/x-icon';
import { ContentCalendar } from './ContentCalendar';
import {
  Clock,
  Calendar,
  Settings,
  Mail,
  MessageCircle,
  Plus,
  List,
  Grid3X3,
  Linkedin,
  Instagram,
  Sparkles,
  Edit3,
  PenTool
} from 'lucide-react';
import { motion } from 'motion/react';

// Mock data for scheduled posts
const mockScheduledPosts = [
  {
    id: '1',
    date: '2025-01-16',
    time: '9:00 AM',
    platform: 'x',
    type: 'Single Post',
    content: 'The future of AI in content creation...',
    status: 'scheduled'
  },
  {
    id: '2',
    date: '2025-01-16',
    time: '2:00 PM',
    platform: 'linkedin',
    type: 'Professional Post',
    content: '5 lessons learned from scaling a creator business',
    status: 'draft'
  },
  {
    id: '3',
    date: '2025-01-17',
    time: '10:30 AM',
    platform: 'instagram',
    type: 'Caption',
    content: 'Content strategy that actually works in 2024',
    status: 'ai-generated'
  }
];

const contentFormats = {
  x: [
    { id: 'single-posts', label: 'Single Posts', enabled: true },
    { id: 'threads', label: 'Thread (8-12 posts)', enabled: true },
    { id: 'quote-posts', label: 'Quote Posts', enabled: false }
  ],
  linkedin: [
    { id: 'professional-posts', label: 'Professional Posts', enabled: true },
    { id: 'carousels', label: 'Carousels', enabled: false },
    { id: 'articles', label: 'Articles', enabled: false }
  ],
  instagram: [
    { id: 'captions', label: 'Captions', enabled: true },
    { id: 'stories', label: 'Stories', enabled: false },
    { id: 'reel-scripts', label: 'Reel Scripts', enabled: false }
  ]
};

export function DeliveryTab() {
  const router = useRouter();
  const [dailyDraftsEnabled, setDailyDraftsEnabled] = useState(true);
  const [deliveryFrequency, setDeliveryFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [postsPerWeek, setPostsPerWeek] = useState(5);
  const [selectedDays, setSelectedDays] = useState<string[]>(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
  const [deliveryTimes, setDeliveryTimes] = useState<{[key: string]: string[]}>({
    monday: ['9:00 AM'],
    tuesday: ['9:00 AM'], 
    wednesday: ['9:00 AM'],
    thursday: ['9:00 AM'],
    friday: ['9:00 AM'],
    saturday: [],
    sunday: []
  });
  const [timezone, setTimezone] = useState('UTC+5:30 (IST)');
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [selectedDate, setSelectedDate] = useState('2025-01-16');
  const [selectedTime, setSelectedTime] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'draft': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'ai-generated': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'x': return <XIcon className="h-4 w-4 text-white" />;
      case 'linkedin': return <Linkedin className="h-4 w-4 text-[#0077B5]" />;
      case 'instagram': return <Instagram className="h-4 w-4 text-[#E4405F]" />;
      default: return <XIcon className="h-4 w-4 text-white" />;
    }
  };

  const handlePlanPost = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setIsDialogOpen(true);
  };

  const handleFormatToggle = (formatId: string) => {
    setSelectedFormats(prev => 
      prev.includes(formatId) 
        ? prev.filter(id => id !== formatId)
        : [...prev, formatId]
    );
  };

  const handleGoToEditor = () => {
    setIsDialogOpen(false);
    
    // Map format IDs to a cleaner format for URL params
    const formatMap: { [key: string]: string } = {
      'single-posts': 'twitter-post',
      'threads': 'twitter-thread',
      'quote-posts': 'twitter-quote',
      'professional-posts': 'linkedin-post',
      'carousels': 'linkedin-carousel',
      'articles': 'linkedin-article',
      'captions': 'instagram-post',
      'stories': 'instagram-story',
      'reel-scripts': 'instagram-reel'
    };
    
    const mappedFormats = selectedFormats.map(id => formatMap[id] || id);
    const formatsParam = mappedFormats.join(',');
    
    // Convert time to 24-hour format for consistency
    const timeParam = selectedTime || '09:00';
    
    // Build URL with parameters
    const params = new URLSearchParams();
    params.set('date', selectedDate);
    params.set('time', timeParam);
    params.set('formats', formatsParam);
    
    router.push(`/post-editor?${params.toString()}`);
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const addTimeSlot = (day: string, time: string) => {
    setDeliveryTimes(prev => ({
      ...prev,
      [day]: [...(prev[day] || []), time]
    }));
  };

  const removeTimeSlot = (day: string, timeIndex: number) => {
    setDeliveryTimes(prev => ({
      ...prev,
      [day]: prev[day].filter((_, index) => index !== timeIndex)
    }));
  };

  const daysOfWeek = [
    { key: 'sunday', label: 'Sunday', short: 'Sun' },
    { key: 'monday', label: 'Monday', short: 'Mon' },
    { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { key: 'thursday', label: 'Thursday', short: 'Thu' },
    { key: 'friday', label: 'Friday', short: 'Fri' },
    { key: 'saturday', label: 'Saturday', short: 'Sat' }
  ];

  const timeSlots = [
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Delivery Preferences */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="lg:col-span-1 space-y-6"
      >
        {/* Delivery Schedule */}
        <Card className="bg-[#1E1E1E] border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-400" />
              Delivery Schedule
            </CardTitle>
            <p className="text-gray-400 text-sm">Configure when and how you receive your AI-generated drafts</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-white font-medium">Enable Auto Delivery</Label>
                <p className="text-sm text-gray-400">Automatically receive AI-generated drafts</p>
              </div>
              <Switch
                checked={dailyDraftsEnabled}
                onCheckedChange={setDailyDraftsEnabled}
                className="data-[state=checked]:bg-purple-600"
              />
            </div>

            {dailyDraftsEnabled && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-6"
              >
                {/* Delivery Frequency */}
                <div className="space-y-3">
                  <Label className="text-white">Delivery Frequency</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'daily', label: 'Every Day' },
                      { key: 'weekly', label: 'Weekly' },
                      { key: 'custom', label: 'Custom' }
                    ].map((freq) => (
                      <button
                        key={freq.key}
                        onClick={() => setDeliveryFrequency(freq.key as 'daily' | 'weekly' | 'custom')}
                        className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                          deliveryFrequency === freq.key
                            ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                            : 'border-neutral-700 bg-neutral-800/30 text-gray-300 hover:border-neutral-600'
                        }`}
                      >
                        {freq.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Posts Per Week (for weekly/custom) */}
                {(deliveryFrequency === 'weekly' || deliveryFrequency === 'custom') && (
                  <div className="space-y-3">
                    <Label className="text-white">Drafts Per Week</Label>
                    <div className="flex items-center gap-3">
                      <Button
                        
                        
                        onClick={() => setPostsPerWeek(Math.max(1, postsPerWeek - 1))}
                        className="h-8 w-8 p-0 bg-neutral-800 hover:bg-neutral-700 text-white"
                      >
                        -
                        </Button>
                      <span className="text-white font-medium text-lg min-w-[2rem] text-center">
                        {postsPerWeek}
                      </span>
                      <Button
                        
                        
                        onClick={() => setPostsPerWeek(Math.min(14, postsPerWeek + 1))}
                        className="h-8 w-8 p-0 bg-neutral-800 hover:bg-neutral-700 text-white"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                )}

                {/* Day Selection (for custom) */}
                {deliveryFrequency === 'custom' && (
                  <div className="space-y-3">
                    <Label className="text-white">Delivery Days</Label>
                    <div className="grid grid-cols-7 gap-1">
                      {daysOfWeek.map((day) => (
                        <button
                          key={day.key}
                          onClick={() => toggleDay(day.key)}
                          className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                            selectedDays.includes(day.key)
                              ? 'bg-purple-600 text-white'
                              : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700'
                          }`}
                        >
                          {day.short}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Time Slots (for custom) */}
                {deliveryFrequency === 'custom' && (
                  <div className="space-y-4">
                    <Label className="text-white">Delivery Times</Label>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {selectedDays.map((day) => (
                        <div key={day} className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium capitalize">{day}</span>
                            <Select
                              value=""
                              onValueChange={(time) => addTimeSlot(day, time)}
                            >
                              <SelectTrigger className="w-24 h-6 text-xs bg-neutral-700 border-neutral-600">
                                <Plus className="h-3 w-3" />
                              </SelectTrigger>
                              <SelectContent className="bg-neutral-800 border-neutral-700">
                                {timeSlots.map((time) => (
                                  <SelectItem key={time} value={time} className="text-xs">
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(deliveryTimes[day] || []).map((time, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1 px-2 py-1 bg-purple-600/20 border border-purple-500/30 rounded text-xs text-purple-300"
                              >
                                <span>{time}</span>
                                <button
                                  onClick={() => removeTimeSlot(day, index)}
                                  className="text-purple-400 hover:text-purple-200"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Simple time selector for daily/weekly */}
                {(deliveryFrequency === 'daily' || deliveryFrequency === 'weekly') && (
                  <div className="space-y-2">
                    <Label className="text-white">Delivery Time</Label>
                    <Select 
                      value={deliveryTimes.monday[0] || '9:00 AM'} 
                      onValueChange={(time) => {
                        const newTimes = { ...deliveryTimes };
                        Object.keys(newTimes).forEach(day => {
                          if (deliveryFrequency === 'daily' || (deliveryFrequency === 'weekly' && day === 'monday')) {
                            newTimes[day] = [time];
                          }
                        });
                        setDeliveryTimes(newTimes);
                      }}
                    >
                      <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-800 border-neutral-700">
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Timezone */}
                <div className="space-y-2">
                  <Label className="text-white">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="UTC-5 (EST)">UTC-5 (EST)</SelectItem>
                      <SelectItem value="UTC-8 (PST)">UTC-8 (PST)</SelectItem>
                      <SelectItem value="UTC+0 (GMT)">UTC+0 (GMT)</SelectItem>
                      <SelectItem value="UTC+5:30 (IST)">UTC+5:30 (IST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Content Formats */}
        <Card className="bg-[#1E1E1E] border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-400" />
              Content Formats
            </CardTitle>
            <p className="text-gray-400 text-sm">Choose which types of content to generate</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(contentFormats).map(([platform, formats]) => (
              <div key={platform} className="space-y-3">
                <div className="flex items-center gap-2">
                  {getPlatformIcon(platform)}
                  <span className="text-white font-medium capitalize">
                    {platform === 'x' ? 'X' : platform}
                  </span>
                </div>
                <div className="space-y-2 ml-6">
                  {formats.map((format) => (
                    <div key={format.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={format.id}
                        checked={format.enabled}
                        className="border-neutral-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                      />
                      <Label 
                        htmlFor={format.id}
                        className="text-sm text-gray-300 cursor-pointer"
                      >
                        {format.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Delivery Channels */}
        <Card className="bg-[#1E1E1E] border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-purple-400" />
              Delivery Channels
            </CardTitle>
            <p className="text-gray-400 text-sm">How you want to receive your drafts</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                emailEnabled ? 'border-purple-500/50 bg-purple-500/10' : 'border-neutral-700 bg-neutral-800/30'
              }`}
              onClick={() => setEmailEnabled(!emailEnabled)}
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={emailEnabled}
                  className="border-neutral-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-white font-medium">Email</p>
                  <p className="text-sm text-gray-400">Get drafts in your inbox</p>
                </div>
              </div>
            </div>

            <div 
              className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                whatsappEnabled ? 'border-purple-500/50 bg-purple-500/10' : 'border-neutral-700 bg-neutral-800/30'
              }`}
              onClick={() => setWhatsappEnabled(!whatsappEnabled)}
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={whatsappEnabled}
                  className="border-neutral-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <MessageCircle className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-white font-medium">WhatsApp</p>
                  <p className="text-sm text-gray-400">Get drafts via WhatsApp</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Right Column - Content Calendar */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="lg:col-span-2"
      >
        <Card className="bg-[#1E1E1E] border-neutral-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-400" />
                  Content Calendar
                </CardTitle>
                <p className="text-gray-400 text-sm mt-1">Plan and schedule your content</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-400">
                  All times in {timezone}
                </div>
                <div className="flex items-center gap-1 bg-neutral-800 rounded-lg p-1">
                  <Button
                    
                    
                    className={`h-8 px-3 ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    
                    
                    className={`h-8 px-3 ${viewMode === 'calendar' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
                    onClick={() => setViewMode('calendar')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                      </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {viewMode === 'list' ? (
              <div className="space-y-6">
                {/* Today */}
                <div>
                  <h3 className="text-white font-semibold mb-3">Today, January 16</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/50 border border-neutral-800/50">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm font-mono">9:59 PM</span>
                        <Button
                          
                          
                          className="text-purple-400 hover:text-purple-300 p-0 h-auto"
                          onClick={() => handlePlanPost('2025-01-16', '9:59 PM')}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          New
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tomorrow */}
                <div>
                  <h3 className="text-white font-semibold mb-3">Tomorrow, January 17</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/50 border border-neutral-800/50">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm font-mono">6:35 PM</span>
                        <Button
                          
                          
                          className="text-purple-400 hover:text-purple-300 p-0 h-auto"
                          onClick={() => handlePlanPost('2025-01-17', '6:35 PM')}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          New
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scheduled Posts */}
                {mockScheduledPosts.map((post) => (
                  <div key={post.id} className="p-4 rounded-lg bg-neutral-800/30 border border-neutral-800/50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getPlatformIcon(post.platform)}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{post.content}</span>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(post.status)}`}>
                              {post.status === 'ai-generated' ? 'Needs Review' : post.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>{post.date}</span>
                            <span>•</span>
                            <span>{post.time}</span>
                            <span>•</span>
                            <span>{post.type}</span>
                          </div>
                        </div>
                      </div>
                      <Button   className="text-gray-400 hover:text-white">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[600px]">
                <ContentCalendar onPlanPost={(date) => handlePlanPost(date.toISOString().split('T')[0], date.toLocaleTimeString())} />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Plan a Post Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#1E1E1E] border-neutral-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Plan a Post
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose the content formats you want to create for {selectedDate} at {selectedTime}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {Object.entries(contentFormats).map(([platform, formats]) => (
              <div key={platform} className="space-y-3">
                <div className="flex items-center gap-2">
                  {getPlatformIcon(platform)}
                  <span className="text-white font-medium capitalize">
                    {platform === 'x' ? 'X' : platform}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2 ml-6">
                  {formats.map((format) => (
                    <div
                      key={format.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedFormats.includes(format.id)
                          ? 'border-purple-500/50 bg-purple-500/10'
                          : 'border-neutral-700 bg-neutral-800/30 hover:border-neutral-600'
                      }`}
                      onClick={() => handleFormatToggle(format.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedFormats.includes(format.id)}
                          className="border-neutral-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                        />
                        <span className="text-sm text-gray-300">{format.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-neutral-700 text-gray-300 hover:bg-neutral-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGoToEditor}
              disabled={selectedFormats.length === 0}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <PenTool className="h-4 w-4 mr-2" />
              Go to Editor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
