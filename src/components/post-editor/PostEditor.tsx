'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { XIcon } from '@/components/ui/x-icon';
import { AICoPilot } from './AICoPilot';
import { TwitterPreview } from './previews/TwitterPreview';
import { InstagramPreview } from './previews/InstagramPreview';
import { LinkedInPreview } from './previews/LinkedInPreview';
import {
  Sparkles,
  Calendar,
  Clock,
  Image,
  Plus,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Minimize2,
  Maximize2,
  Save,
  Send,
  Linkedin,
  Instagram,
  Upload,
  Hash,
  PenTool,
  RefreshCw,
  Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GenerateNowButton } from '@/components/GenerateNowButton';
import { toast } from 'sonner';

type Platform = 'x' | 'linkedin' | 'instagram';

interface ThreadTweet {
  id: string;
  content: string;
  characterCount: number;
}

interface PostData {
  platform: Platform;
  content: string;
  title?: string; // LinkedIn article title
  firstComment?: string; // Instagram first comment
  media?: File[];
  threads?: ThreadTweet[]; // For X threads
  scheduledDate?: Date;
  scheduledTime?: string;
  generatedImageUrl?: string; // AI-generated image URL
}

interface GeneratedContent {
  x?: {
    content: string;
    threads?: ThreadTweet[];
    isThread?: boolean;
  };
  linkedin?: {
    content: string;
  };
  instagram?: {
    content: string;
  };
}

export default function PostEditor() {
  const [postData, setPostData] = useState<PostData>({
    platform: 'x',
    content: '',
    threads: [{ id: '1', content: '', characterCount: 0 }]
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({});
  const [hasGenerated, setHasGenerated] = useState(false);
  const [currentTopic, setCurrentTopic] = useState('');

  // Handle URL parameters on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const prompt = urlParams.get('prompt');
      const date = urlParams.get('date');
      const time = urlParams.get('time');
      const formats = urlParams.get('formats');
      const draftId = urlParams.get('draftId');

      if (prompt) {
        setInitialPrompt(decodeURIComponent(prompt));
        setCurrentTopic(decodeURIComponent(prompt));
      }

      if (date && time) {
        const scheduledDate = new Date(date);
        setPostData(prev => ({
          ...prev,
          scheduledDate,
          scheduledTime: time
        }));
      }

      if (formats) {
        const formatList = formats.split(',');
        // Set platform based on first format
        if (formatList.includes('twitter-thread') || formatList.includes('twitter-post')) {
          setPostData(prev => ({ ...prev, platform: 'x' }));
        } else if (formatList.includes('linkedin-post') || formatList.includes('linkedin-article')) {
          setPostData(prev => ({ ...prev, platform: 'linkedin' }));
        } else if (formatList.includes('instagram-post') || formatList.includes('instagram-story')) {
          setPostData(prev => ({ ...prev, platform: 'instagram' }));
        }
      }

      // If draftId is provided, load the draft
      if (draftId) {
        loadDraft(draftId);
      }
    }
  }, []);

  const loadDraft = async (draftId: string) => {
    try {
      console.log('🔄 Loading draft with ID:', draftId);
      const response = await fetch(`/api/drafts/${draftId}`);
      if (!response.ok) {
        throw new Error(`Failed to load draft: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const draft = data.draft;
      
      console.log('📥 Draft data received:', draft);

      if (!draft) {
        throw new Error('No draft data received');
      }

      // Set platform first
      setPostData(prev => ({ ...prev, platform: draft.platform }));
      console.log('🎯 Platform set to:', draft.platform);

      // Set content based on platform
      if (draft.platform === 'x' && draft.metadata?.threads) {
        console.log('🧵 Loading X threads:', draft.metadata.threads);
        setPostData(prev => ({
          ...prev,
          content: draft.content,
          threads: draft.metadata.threads,
          title: draft.metadata?.title,
          firstComment: draft.metadata?.firstComment
        }));
      } else {
        console.log('📝 Loading single content for platform:', draft.platform);
        setPostData(prev => ({
          ...prev,
          content: draft.content,
          title: draft.metadata?.title,
          firstComment: draft.metadata?.firstComment,
          threads: draft.platform === 'x' ? [{ 
            id: '1', 
            content: draft.content, 
            characterCount: draft.content.length 
          }] : undefined
        }));
      }

      if (draft.metadata?.originalTopic) {
        console.log('📋 Setting original topic:', draft.metadata.originalTopic);
        setCurrentTopic(draft.metadata.originalTopic);
      }

      // Set initial prompt if available
      if (draft.metadata?.originalTopic) {
        setInitialPrompt(draft.metadata.originalTopic);
      }

      console.log('✅ Draft loaded successfully');
      toast.success('Draft loaded successfully');
    } catch (error) {
      console.error('❌ Error loading draft:', error);
      toast.error(`Failed to load draft: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Character limits for different platforms
  const characterLimits = {
    x: 280,
    linkedin: 3000,
    instagram: 2200
  };

  const handlePlatformChange = (platform: Platform) => {
    // Check if we have generated content for this platform
    const platformContent = generatedContent[platform];
    
    if (platformContent) {
      if (platform === 'x' && 'threads' in platformContent && platformContent.threads) {
        setPostData(prev => ({
          ...prev,
          platform,
          content: platformContent.content,
          threads: platformContent.threads,
          title: undefined,
          firstComment: undefined,
          media: undefined
        }));
      } else {
        setPostData(prev => ({
          ...prev,
          platform,
          content: platformContent.content,
          title: undefined,
          firstComment: undefined,
          media: undefined,
          threads: platform === 'x' ? [{ id: '1', content: '', characterCount: 0 }] : undefined
        }));
      }
    } else {
      setPostData(prev => ({
        ...prev,
        platform,
        content: '',
        title: undefined,
        firstComment: undefined,
        media: undefined,
        threads: platform === 'x' ? [{ id: '1', content: '', characterCount: 0 }] : undefined
      }));
    }
  };

  const handleContentChange = (content: string) => {
    if (postData.platform === 'x' && postData.threads) {
      // For X platform, update the first thread
      const updatedThreads = [...postData.threads];
      updatedThreads[0] = {
        ...updatedThreads[0],
        content,
        characterCount: content.length
      };
      setPostData(prev => ({ 
        ...prev, 
        content,
        threads: updatedThreads 
      }));
    } else {
      setPostData(prev => ({ ...prev, content }));
    }
    setIsDraftSaved(false);
  };

  const addThread = () => {
    if (postData.platform === 'x' && postData.threads) {
      const newThread: ThreadTweet = {
        id: (postData.threads.length + 1).toString(),
        content: '',
        characterCount: 0
      };
      setPostData(prev => ({
        ...prev,
        threads: [...(prev.threads || []), newThread]
      }));
    }
  };

  const updateThread = (threadId: string, content: string) => {
    if (postData.threads) {
      setPostData(prev => ({
        ...prev,
        threads: prev.threads?.map(thread =>
          thread.id === threadId
            ? { ...thread, content, characterCount: content.length }
            : thread
        )
      }));
    }
  };

  const removeThread = (threadId: string) => {
    if (postData.threads && postData.threads.length > 1) {
      setPostData(prev => ({
        ...prev,
        threads: prev.threads?.filter(thread => thread.id !== threadId)
      }));
    }
  };



  const handleSaveDraft = async () => {
    if (!postData.content || !postData.content.trim()) {
      toast.error('Cannot save empty draft');
      return;
    }

    setIsSaving(true);
    
    try {
      // Structure the metadata properly for the database
      const metadata: Record<string, unknown> = {
        originalTopic: currentTopic,
        generatedImageUrl: postData.generatedImageUrl
      };

      // Add platform-specific metadata
      if (postData.platform === 'x' && postData.threads) {
        metadata.threads = postData.threads;
      }
      
      if (postData.platform === 'linkedin' && postData.title) {
        metadata.title = postData.title;
      }
      
      if (postData.platform === 'instagram' && postData.firstComment) {
        metadata.firstComment = postData.firstComment;
      }

      const draftData = {
        platform: postData.platform,
        content: postData.platform === 'x' && postData.threads && postData.threads.length > 0 
          ? postData.threads[0].content 
          : postData.content,
        metadata
      };

      console.log('💾 Saving draft with data:', draftData);

      const response = await fetch('/api/save-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftData),
      });

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      setIsDraftSaved(true);
      toast.success('Draft saved successfully!');
      setTimeout(() => setIsDraftSaved(false), 3000);
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!postData.content.trim()) {
      toast.error('Please enter content first to generate a matching image');
      return;
    }

    setIsGeneratingImage(true);
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: postData.content,
          platform: postData.platform,
          topic: currentTopic
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      
      if (data.imageUrl) {
        setPostData(prev => ({ ...prev, generatedImageUrl: data.imageUrl }));
        toast.success('Image generated successfully!');
      } else {
        throw new Error('No image URL received');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSchedulePost = async () => {
    // Here you would schedule the post
    console.log('Scheduling post:', postData);
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

  return (
    <div className="h-full bg-[#121212] p-6">
      <motion.div 
        className={`grid gap-6 h-full transition-all duration-300 ${
          focusMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'
        }`}
        layout
      >
        {/* Left Column - AI Co-Pilot */}
        <AnimatePresence>
          {!focusMode && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="lg:col-span-3"
            >
              <AICoPilot
                onInsertContent={(content) => handleContentChange(content)}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
                platform={postData.platform}
                initialPrompt={initialPrompt}
                onGenerateComplete={(data) => {
                  console.log('📥 PostEditor received data:', data);
                  setGeneratedContent(data);
                  setHasGenerated(true);
                  
                  // Set the content for the current platform
                  const currentPlatformContent = data[postData.platform];
                  console.log(`🎯 Current platform (${postData.platform}) content:`, currentPlatformContent);
                  
                  if (currentPlatformContent) {
                    if (postData.platform === 'x' && 'threads' in currentPlatformContent && currentPlatformContent.threads) {
                      console.log('🧵 Setting X threads:', currentPlatformContent.threads);
                      setPostData(prev => ({
                        ...prev,
                        content: currentPlatformContent.content,
                        threads: currentPlatformContent.threads
                      }));
                    } else {
                      console.log('📝 Setting content for platform:', postData.platform, currentPlatformContent.content);
                      setPostData(prev => ({
                        ...prev,
                        content: currentPlatformContent.content
                      }));
                    }
                  } else {
                    console.log('❌ No content found for current platform:', postData.platform);
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Column - Main Editor */}
        <motion.div 
          className={`${focusMode ? 'col-span-1' : 'lg:col-span-6'}`}
          layout
        >
          <Card className="bg-[#1E1E1E] border-neutral-800 h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <PenTool className="h-5 w-5 text-purple-400" />
                  Post Editor
                </CardTitle>
                <button
                  onClick={() => setFocusMode(!focusMode)}
                  className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800/50 transition-colors"
                >
                  {focusMode ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Platform Selector */}
              <div className="flex items-center gap-4 mt-4">
                <Label className="text-gray-400 text-sm font-medium">Platform:</Label>
                <div className="flex items-center">
                  {(['x', 'linkedin', 'instagram'] as Platform[]).map((platform) => (
                    <button
                      key={platform}
                      className={`relative h-10 px-4 transition-all duration-200 bg-transparent hover:bg-neutral-800/30 rounded-lg ${
                        postData.platform === platform 
                          ? 'text-white' 
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                      onClick={() => handlePlatformChange(platform)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={getPlatformColor(platform)}>
                          {getPlatformIcon(platform)}
                        </div>
                        <span className="text-sm font-medium">
                          {platform === 'x' ? 'X' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </span>
                      </div>
                      {postData.platform === platform && (
                        <motion.div
                          layoutId="platform-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                          initial={false}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              

            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* LinkedIn Article Title */}
              {postData.platform === 'linkedin' && (
                <div className="space-y-3">
                  <Label className="text-white font-medium">Article Title (Optional)</Label>
                  <Input
                    placeholder="Enter article title..."
                    value={postData.title || ''}
                    onChange={(e) => setPostData(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500 h-11"
                  />
                </div>
              )}

              {/* Main Content Editor */}
              {postData.platform === 'x' ? (
                /* Thread Builder for X */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Thread Builder</Label>
                    <button
                      onClick={addThread}
                      className="text-purple-400 hover:text-purple-300 px-3 py-2 rounded-lg hover:bg-purple-500/10 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Tweet
                    </button>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {postData.threads?.map((thread, index) => (
                      <motion.div
                        key={thread.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative p-5 rounded-lg bg-neutral-800/50 border border-neutral-700/50 hover:border-neutral-600/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-300 font-medium">
                            Tweet {index + 1}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-mono ${
                              thread.characterCount > characterLimits.x 
                                ? 'text-red-400' 
                                : 'text-gray-400'
                            }`}>
                              {thread.characterCount}/{characterLimits.x}
                            </span>
                            {postData.threads && postData.threads.length > 1 && (
                              <GradientButton
                                
                                
                                onClick={() => removeThread(thread.id)}
                                className="h-7 w-7 p-0 text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </GradientButton>
                            )}
                          </div>
                        </div>
                        <Textarea
                          placeholder={`What's happening? (Tweet ${index + 1})`}
                          value={thread.content}
                          onChange={(e) => updateThread(thread.id, e.target.value)}
                          className="bg-neutral-900 border-neutral-600 text-white placeholder:text-gray-500 min-h-[120px] resize-none text-sm leading-relaxed"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Single Content Editor for LinkedIn/Instagram */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-white font-medium">Content</Label>
                    <span className={`text-sm font-mono ${
                      (postData.content?.length || 0) > characterLimits[postData.platform]
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }`}>
                      {postData.content?.length || 0}/{characterLimits[postData.platform]}
                    </span>
                  </div>
                  <Textarea
                    placeholder={`What would you like to share on ${postData.platform === 'instagram' ? 'Instagram' : 'LinkedIn'}?`}
                    value={postData.content || ''}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500 min-h-[220px] resize-none text-sm leading-relaxed"
                  />
                </div>
              )}

              {/* LinkedIn/Instagram Media Generation */}
              {(postData.platform === 'linkedin' || postData.platform === 'instagram') && (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <Label className="text-white font-medium">AI-Generated Media</Label>
                    <div className="space-y-3">
                      {postData.generatedImageUrl ? (
                        <div className="relative">
                          <img 
                            src={postData.generatedImageUrl} 
                            alt="Generated content" 
                            className="w-full h-48 object-cover rounded-lg border border-neutral-700"
                          />
                          <button
                            onClick={() => setPostData(prev => ({ ...prev, generatedImageUrl: undefined }))}
                            className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center hover:border-neutral-600 transition-colors">
                          <Sparkles className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            Generate an AI image that matches your content
                          </p>
                          <GradientButton
                            onClick={() => handleGenerateImage()}
                            disabled={!postData.content.trim() || isGeneratingImage}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                          >
                            {isGeneratingImage ? (
                              <div className="flex items-center gap-2">
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Generating Image...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Generate AI Image
                              </div>
                            )}
                          </GradientButton>
                          <p className="text-xs text-gray-500 mt-2">
                            {postData.platform === 'instagram' ? '4:5 aspect ratio recommended' : '1.91:1 aspect ratio recommended'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Instagram-specific fields */}
                  {postData.platform === 'instagram' && (
                    <div className="space-y-3">
                      <Label className="text-white font-medium">First Comment (Optional)</Label>
                      <Input
                        placeholder="Add a first comment..."
                        value={postData.firstComment || ''}
                        onChange={(e) => setPostData(prev => ({ ...prev, firstComment: e.target.value }))}
                        className="bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500 h-11"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Scheduling Section */}
              <div className="space-y-4 pt-6 border-t border-neutral-800">
                <Label className="text-white font-medium">Schedule Post</Label>
                <div className="grid grid-cols-2 gap-3">
                  <GradientButton
                    
                    className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700 h-11 justify-start"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Today
                  </GradientButton>
                  <GradientButton
                    
                    className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700 h-11 justify-start"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    9:00 AM
                  </GradientButton>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-6">
                <GradientButton
                  onClick={handleSaveDraft}
                  disabled={isSaving || !postData.content || !postData.content.trim()}
                  className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700 h-11 flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : isDraftSaved ? 'Saved!' : 'Save Draft'}
                </GradientButton>
                <GradientButton
                  onClick={handleSchedulePost}
                  disabled={!postData.content || !postData.content.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-11 flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Schedule Post
                </GradientButton>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column - Live Preview */}
        <AnimatePresence>
          {!focusMode && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-3"
            >
              <Card className="bg-[#1E1E1E] border-neutral-800 h-full">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    {getPlatformIcon(postData.platform)}
                    <span className={getPlatformColor(postData.platform)}>
                      {postData.platform === 'x' ? 'X' : 
                       postData.platform.charAt(0).toUpperCase() + postData.platform.slice(1)} Preview
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full bg-neutral-700" />
                      <Skeleton className="h-4 w-3/4 bg-neutral-700" />
                      <Skeleton className="h-20 w-full bg-neutral-700" />
                    </div>
                  ) : (
                    <>
                      {postData.platform === 'x' && (
                        <TwitterPreview 
                          threads={(() => {
                            console.log('🐦 TwitterPreview receiving threads:', postData.threads);
                            return postData.threads || [];
                          })()}
                        />
                      )}
                      {postData.platform === 'linkedin' && (
                        <LinkedInPreview 
                          content={(() => {
                            console.log('💼 LinkedInPreview receiving content:', postData.content);
                            return postData.content || '';
                          })()}
                          title={postData.title}
                        />
                      )}
                      {postData.platform === 'instagram' && (
                        <InstagramPreview 
                          content={(() => {
                            console.log('📸 InstagramPreview receiving content:', postData.content);
                            return postData.content || '';
                          })()}
                          firstComment={postData.firstComment}
                          media={postData.media}
                        />
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
