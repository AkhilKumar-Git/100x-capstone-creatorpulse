'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientButton } from '@/components/ui/gradient-button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { XIcon } from '@/components/ui/x-icon';
import { TwitterPreview } from '../post-editor/previews/TwitterPreview';
import { InstagramPreview } from '../post-editor/previews/InstagramPreview';
import { LinkedInPreview } from '../post-editor/previews/LinkedInPreview';
import {
  FileText,
  Edit,
  Trash2,
  Calendar,
  Linkedin,
  Instagram,
  Filter,
  Search,
  ChevronRight,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';

type Platform = 'x' | 'linkedin' | 'instagram';

interface ThreadTweet {
  id: string;
  content: string;
  characterCount: number;
}

interface Draft {
  id: string;
  user_id: string;
  platform: Platform;
  content: string;
  draft_title?: string | null;
  based_on: number | null;
  status: 'generated' | 'reviewed' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  metadata?: {
    title?: string;
    firstComment?: string;
    threads?: ThreadTweet[];
    originalTopic?: string;
    savedAt?: string;
  };
}

export default function YourDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const router = useRouter();

  // Fetch drafts on component mount
  useEffect(() => {
    fetchDrafts();
  }, [platformFilter]);

  const fetchDrafts = async () => {
    setIsLoading(true);
    try {
      const url = new URL('/api/drafts', window.location.origin);
      if (platformFilter !== 'all') {
        url.searchParams.set('platform', platformFilter);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch drafts');
      }

      const data = await response.json();
      setDrafts(data.drafts || []);
      
      // Auto-select first draft if none selected
      if (data.drafts && data.drafts.length > 0 && !selectedDraft) {
        setSelectedDraft(data.drafts[0]);
      }
    } catch (error) {
      console.error('Error fetching drafts:', error);
      toast.error('Failed to load drafts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) return;
    
    setIsDeleting(draftId);
    try {
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete draft');
      }

      setDrafts(prev => prev.filter(d => d.id !== draftId));
      
      // If deleted draft was selected, select another one
      if (selectedDraft?.id === draftId) {
        const remainingDrafts = drafts.filter(d => d.id !== draftId);
        setSelectedDraft(remainingDrafts.length > 0 ? remainingDrafts[0] : null);
      }
      
      toast.success('Draft deleted successfully');
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast.error('Failed to delete draft');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditDraft = (draft: Draft) => {
    // Navigate to post editor with draft data pre-filled
    const params = new URLSearchParams();
    if (draft.metadata?.originalTopic) {
      params.set('prompt', draft.metadata.originalTopic);
    }
    params.set('draftId', draft.id);
    
    router.push(`/post-editor?${params.toString()}`);
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'x':
        return <XIcon className="h-4 w-4" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
    }
  };

  const getPlatformColor = (platform: Platform) => {
    switch (platform) {
      case 'x':
        return 'text-white';
      case 'linkedin':
        return 'text-[#0077B5]';
      case 'instagram':
        return 'text-[#E4405F]';
    }
  };

  const getPlatformBadgeColor = (platform: Platform) => {
    switch (platform) {
      case 'x':
        return 'bg-neutral-800 text-white border-neutral-600';
      case 'linkedin':
        return 'bg-[#0077B5]/10 text-[#0077B5] border-[#0077B5]/30';
      case 'instagram':
        return 'bg-[#E4405F]/10 text-[#E4405F] border-[#E4405F]/30';
    }
  };

  // Filter drafts based on search term
  const filteredDrafts = drafts.filter(draft => {
    const matchesSearch = !searchTerm || 
      draft.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft.metadata?.originalTopic?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const renderPreview = (draft: Draft) => {
    console.log('🎨 Rendering preview for draft:', draft);
    console.log('📱 Platform:', draft.platform);
    console.log('📝 Content:', draft.content);
    console.log('🔧 Metadata:', draft.metadata);
    console.log('🔧 Metadata type:', typeof draft.metadata);
    console.log('🔧 Metadata keys:', draft.metadata ? Object.keys(draft.metadata) : 'null');
    
    switch (draft.platform) {
      case 'x':
        console.log('🐦 Processing X platform draft');
        console.log('🧵 Threads from metadata:', draft.metadata?.threads);
        console.log('🧵 Threads type:', typeof draft.metadata?.threads);
        console.log('🧵 Threads length:', draft.metadata?.threads?.length);
        
        let threads = draft.metadata?.threads;
        
        // If no threads in metadata, try to parse the content for numbered tweets
        if (!threads || !Array.isArray(threads) || threads.length === 0) {
          console.log('🔍 No threads found in metadata, attempting to parse content');
          
          // Check if content contains numbered parts (1/, 2/, 3/, etc.)
          const numberedPattern = /(\d+\/.*?)(?=\d+\/|$)/g;
          const matches = [];
          let match;
          
          while ((match = numberedPattern.exec(draft.content)) !== null) {
            matches.push(match[1]);
          }
          
          if (matches && matches.length > 1) {
            console.log('🔍 Found numbered content, creating threads:', matches);
            threads = matches.map((match, index) => ({
              id: (index + 1).toString(),
              content: match.trim(),
              characterCount: match.trim().length
            }));
          } else {
            console.log('🔍 No numbered content found, using single tweet');
            threads = [{ 
              id: '1', 
              content: draft.content, 
              characterCount: draft.content.length 
            }];
          }
        }
        
        console.log('🧵 Final threads for X preview:', threads);
        console.log('🧵 Threads array length:', threads.length);
        
        return <TwitterPreview threads={threads} />;
      case 'linkedin':
        return (
          <LinkedInPreview 
            content={draft.content}
            title={draft.metadata?.title}
          />
        );
      case 'instagram':
        return (
          <InstagramPreview 
            content={draft.content}
            firstComment={draft.metadata?.firstComment}
          />
        );
    }
  };

  return (
    <div className="h-full bg-[#121212] p-6">
      <div className="grid grid-cols-12 gap-6 h-full">
        {/* Left Sidebar - Drafts List */}
        <div className="col-span-4">
          <Card className="bg-[#1E1E1E] border-neutral-800 h-full">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-400" />
                Your Drafts
              </CardTitle>
              
              {/* Search and Filter */}
              <div className="space-y-3 mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search drafts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500 pl-10"
                  />
                </div>
                
                <Select value={platformFilter} onValueChange={(value: Platform | 'all') => setPlatformFilter(value)}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="x">X (Twitter)</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {isLoading ? (
                <div className="space-y-3 p-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full bg-neutral-700" />
                      <Skeleton className="h-3 w-3/4 bg-neutral-700" />
                    </div>
                  ))}
                </div>
              ) : filteredDrafts.length === 0 ? (
                <div className="p-6 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">No drafts found</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {searchTerm ? 'Try adjusting your search' : 'Create your first draft in the Post Editor'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredDrafts.map((draft) => (
                    <motion.div
                      key={draft.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 cursor-pointer border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors ${
                        selectedDraft?.id === draft.id ? 'bg-neutral-800/50 border-r-2 border-r-purple-500' : ''
                      }`}
                      onClick={() => setSelectedDraft(draft)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={`${getPlatformBadgeColor(draft.platform)} text-xs`}>
                          <div className="flex items-center gap-1">
                            {getPlatformIcon(draft.platform)}
                            {draft.platform === 'x' ? 'X' : draft.platform.charAt(0).toUpperCase() + draft.platform.slice(1)}
                          </div>
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(draft.created_at), { addSuffix: true })}
                        </div>
                      </div>
                      
                      <p className="text-white text-sm font-medium line-clamp-2 mb-2">
                        {draft.draft_title || draft.metadata?.originalTopic || draft.metadata?.title || 'Draft Content'}
                      </p>
                      
                      <p className="text-gray-400 text-xs line-clamp-2">
                        {draft.content}
                      </p>
                      
                      {selectedDraft?.id === draft.id && (
                        <ChevronRight className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Content - Preview and Actions */}
        <div className="col-span-8">
          {selectedDraft ? (
            <Card className="bg-[#1E1E1E] border-neutral-800 h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    {getPlatformIcon(selectedDraft.platform)}
                    <span className={getPlatformColor(selectedDraft.platform)}>
                      {selectedDraft.platform === 'x' ? 'X' : 
                       selectedDraft.platform.charAt(0).toUpperCase() + selectedDraft.platform.slice(1)} Preview
                    </span>
                  </CardTitle>
                  
                  <div className="flex items-center gap-2">
                    <GradientButton
                      onClick={() => handleEditDraft(selectedDraft)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </GradientButton>
                    <GradientButton
                      onClick={() => handleDeleteDraft(selectedDraft.id)}
                      disabled={isDeleting === selectedDraft.id}
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isDeleting === selectedDraft.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Delete
                    </GradientButton>
                  </div>
                </div>
                
                {/* Draft Info */}
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Created {format(new Date(selectedDraft.created_at), 'MMM d, yyyy')}
                  </div>
                  {selectedDraft.metadata?.originalTopic && (
                    <div className="flex items-center gap-1">
                      <span>Topic:</span>
                      <span className="text-purple-400">{selectedDraft.metadata.originalTopic}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedDraft.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderPreview(selectedDraft)}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-[#1E1E1E] border-neutral-800 h-full">
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white text-lg font-medium mb-2">Select a Draft</h3>
                  <p className="text-gray-400">
                    Choose a draft from the sidebar to preview and manage it
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
