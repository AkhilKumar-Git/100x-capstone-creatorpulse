'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomButton } from '@/components/ui/custom-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Rss,
  Youtube,
  Hash,
  Trash2,
  Plus,
  Loader2,
  Search,
  Sparkles,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  BarChart3,
  Users,
  Eye
} from 'lucide-react';
import { XIcon } from '@/components/ui/x-icon';
import { toast } from 'sonner';

// Import types
import { 
  type Source,
  type CreateSourceInput
} from '@/lib/sources';
import { useAuth } from '@/contexts/AuthContext';

// Types based on actual database schema
interface FormInputs {
  x: string;
  youtube: string;
  rss: string;
  blog: string;
}

interface SuggestedSource {
  type: Source['type'];
  name: string;
  identifier: string;
  description: string;
  relevanceScore: number;
}

// Mock suggested sources (these could be AI-generated in the future)
const suggestedSources: SuggestedSource[] = [
  {
    type: 'x',
    name: '@naval',
    identifier: 'naval',
    description: 'Philosophical insights on startups and life',
    relevanceScore: 95
  },
  {
    type: 'youtube',
    name: 'Ali Abdaal',
    identifier: '@aliabdaal',
    description: 'Productivity and business content creator',
    relevanceScore: 92
  },
  {
    type: 'rss',
    name: 'TechCrunch',
    identifier: 'https://techcrunch.com/feed/',
    description: 'Latest tech news and startup updates',
    relevanceScore: 88
  }
];

export function EnhancedSourcesTab() {
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSources, setIsLoadingSources] = useState(true);
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({});
  const [activeTab, setActiveTab] = useState<keyof FormInputs>('x');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formInputs, setFormInputs] = useState<FormInputs>({
    x: '',
    youtube: '',
    rss: '',
    blog: ''
  });

  const { user, session } = useAuth();

  // Load sources on component mount
  useEffect(() => {
    if (user) {
      loadSources();
    }
  }, [user]);

    // Load sources from database
  const loadSources = async () => {
    setIsLoadingSources(true);
    try {
      console.log('Current user state:', user);
      console.log('Current session state:', session);
      
      const response = await fetch('/api/sources');
      const result = await response.json();
      
      if (result.success && result.data) {
        setSources(result.data);
      } else {
        console.error('Failed to load sources:', result.error);
        toast.error('Failed to load sources');
      }
    } catch (error) {
      console.error('Error loading sources:', error);
      toast.error('Error loading sources');
    } finally {
      setIsLoadingSources(false);
    }
  };

  // Filter sources based on search query
  const filteredSources = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return sources;
    return sources.filter(source => 
      (source.handle && source.handle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (source.url && source.url.toLowerCase().includes(searchQuery.toLowerCase())) ||
      getSourceTypeName(source.type).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sources, searchQuery]);

  // Helper functions
  const getSourceIcon = (type: Source['type'] | keyof FormInputs) => {
    switch (type) {
      case 'x':
        return <XIcon className="h-5 w-5 text-white" />;
      case 'youtube':
        return <Youtube className="h-5 w-5 text-[#FF0000]" />;
      case 'rss':
        return <Rss className="h-5 w-5 text-[#FF6600]" />;
      case 'blog':
        return <Hash className="h-5 w-5 text-[#64748B]" />;
      default:
        return <Rss className="h-5 w-5 text-[#FF6600]" />;
    }
  };

  const getSourceTypeName = (type: Source['type'] | keyof FormInputs) => {
    switch (type) {
      case 'x': return 'X';
      case 'youtube': return 'YouTube';
      case 'rss': return 'RSS Feed';
      case 'blog': return 'Blog';
      default: return 'Unknown';
    }
  };

  const getPlaceholder = (type: string) => {
    switch (type) {
      case 'x': return 'Enter X handle...';
      case 'youtube': return 'Enter YouTube channel handle or ID...';
      case 'rss': return 'Enter RSS feed URL...';
      case 'blog': return 'Enter blog URL...';
      default: return 'Enter source...';
    }
  };

  const getHealthIndicator = (source: Source) => {
    // Simple health indicator based on source status and age
    const isRecent = new Date(source.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
    
    if (source.active && isRecent) {
      return (
        <Tooltip>
          <TooltipTrigger>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Healthy - Active and recent</p>
          </TooltipContent>
        </Tooltip>
      );
    } else if (source.active) {
      return (
        <Tooltip>
          <TooltipTrigger>
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Warning - Active but older source</p>
          </TooltipContent>
        </Tooltip>
      );
    } else {
      return (
        <Tooltip>
          <TooltipTrigger>
            <div className="w-2 h-2 bg-red-500 rounded-full" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Inactive - Source is paused</p>
          </TooltipContent>
        </Tooltip>
      );
    }
  };

  // Handlers
  const handleInputChange = (type: keyof FormInputs, value: string) => {
    if (type in formInputs) {
      setFormInputs(prev => ({ ...prev, [type]: value }));
    }
  };

  const handleAddSource = async () => {
    const currentInput = formInputs[activeTab as keyof FormInputs];
    if (!currentInput || !currentInput.trim()) return;

    if (!user) {
      toast.error('Please log in to add sources');
      return;
    }

    setIsLoading(true);
    
    try {
      // Map UI types to database types
      let dbType: Source['type'];
      let handle: string | null = null;
      let url: string | null = null;

      switch (activeTab) {
        case 'x':
          dbType = 'x';
          handle = currentInput.startsWith('@') ? currentInput.substring(1) : currentInput;
          break;
        case 'youtube':
          dbType = 'youtube';
          // YouTube handle can be a channel handle (@aliabdaal) or a channel ID (UC_x5XG1OV2P6uZZ5FSM9Ttw)
          // We'll try to parse it as a handle first, then as a URL if it looks like a channel ID
          if (currentInput.startsWith('@')) {
            handle = currentInput.substring(1);
          } else if (currentInput.includes('youtube.com/channel/') || currentInput.includes('youtube.com/user/')) {
            // This is a channel URL, extract the ID
            const urlMatch = currentInput.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]+)/);
            if (urlMatch) {
              handle = urlMatch[1];
            } else {
              const userMatch = currentInput.match(/youtube\.com\/user\/([a-zA-Z0-9_-]+)/);
              if (userMatch) {
                handle = userMatch[1];
              }
            }
          } else {
            // Assume it's a handle if it doesn't look like a URL
            handle = currentInput;
          }
          break;
        case 'rss':
          dbType = 'rss';
          url = currentInput;
          break;
        case 'blog':
          dbType = 'blog';
          url = currentInput;
          break;
        default:
          dbType = 'x';
          handle = currentInput;
      }

      // Create source directly using the API
      const response = await fetch('/api/sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: dbType,
          handle: handle || undefined,
          url: url || undefined
        }),
      });

      const result = await response.json();

      console.log('Create source result:', result); // Debug log

      if (result.success) {
        toast.success(`${getSourceTypeName(dbType)} source added successfully!`);
        setFormInputs(prev => ({ ...prev, [activeTab]: '' }));
        // Reload sources to get the updated list
        await loadSources();
      } else {
        if (result.error === 'This source already exists') {
          toast.error('This source already exists in your list');
        } else {
          toast.error(result.error || 'Failed to add source');
        }
      }
    } catch (error) {
      console.error('Error adding source:', error);
      toast.error('Failed to add source. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    if (!user) {
      toast.error('Please log in to manage sources');
      return;
    }

    setLoadingStates(prev => ({ ...prev, [id]: true }));
    
    try {
      const source = sources.find(s => s.id === id);
      if (!source) return;

      const response = await fetch(`/api/sources/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          active: !source.active
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setSources(prev => prev.map(source => 
          source.id === id 
            ? { ...source, active: !source.active }
            : source
        ));
        toast.success('Source status updated');
      } else {
        toast.error(result.error || 'Failed to update source status');
      }
    } catch (error) {
      console.error('Error toggling source:', error);
      toast.error('Failed to update source status');
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDeleteSource = async (id: string) => {
    if (!user) {
      toast.error('Please log in to manage sources');
      return;
    }

    setLoadingStates(prev => ({ ...prev, [id]: true }));
    
    try {
      const response = await fetch(`/api/sources/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setSources(prev => prev.filter(source => source.id !== id));
        toast.success('Source removed successfully');
      } else {
        toast.error(result.error || 'Failed to remove source');
      }
    } catch (error) {
      console.error('Error deleting source:', error);
      toast.error('Failed to remove source');
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleAddSuggestedSource = async (suggested: SuggestedSource) => {
    if (!user) {
      toast.error('Please log in to add sources');
      return;
    }

    try {
      let handle: string | undefined = undefined;
      let url: string | undefined = undefined;

      if (suggested.type === 'x' || suggested.type === 'youtube') {
        handle = suggested.identifier;
      } else {
        url = suggested.identifier;
      }

      const response = await fetch('/api/sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: suggested.type,
          handle,
          url
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`${suggested.name} added successfully!`);
        setShowSuggestions(false);
        // Reload sources to get the updated list
        await loadSources();
      } else {
        toast.error(result.error || 'Failed to add suggested source');
      }
    } catch (error) {
      console.error('Error adding suggested source:', error);
      toast.error('Failed to add suggested source');
    }
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Add Source */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-[#1E1E1E] border-neutral-800">
            <CardHeader>
              <CardTitle className="text-[#F5F5F5]">Add Source</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Source Type Selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-[#A0A0A0] mb-4">Choose Platform</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { type: 'x', label: 'X', icon: <XIcon className="h-5 w-5 text-white" /> },
                    { type: 'youtube', label: 'YouTube', icon: <Youtube className="h-5 w-5 text-[#FF0000]" /> },
                  ].map((platform) => (
                    <motion.button
                      key={platform.type}
                      onClick={() => setActiveTab(platform.type as keyof FormInputs)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all duration-200 ${
                        activeTab === platform.type 
                          ? 'border-purple-500/50 bg-purple-500/10 text-[#F5F5F5]' 
                          : 'border-neutral-700 bg-neutral-800/30 text-[#A0A0A0] hover:border-neutral-600 hover:bg-neutral-800/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {platform.icon}
                      <span className="text-xs font-semibold">{platform.label}</span>
                    </motion.button>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { type: 'rss', label: 'RSS Feed', icon: <Rss className="h-5 w-5 text-[#FF6600]" /> },
                    { type: 'blog', label: 'Blog', icon: <Hash className="h-5 w-5 text-[#64748B]" /> },
                  ].map((platform) => (
                    <motion.button
                      key={platform.type}
                      onClick={() => setActiveTab(platform.type as keyof FormInputs)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all duration-200 ${
                        activeTab === platform.type 
                          ? 'border-purple-500/50 bg-purple-500/10 text-[#F5F5F5]' 
                          : 'border-neutral-700 bg-neutral-800/30 text-[#A0A0A0] hover:border-neutral-600 hover:bg-neutral-800/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {platform.icon}
                      <span className="text-xs font-semibold">{platform.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Source Input Form */}
              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <div className="flex items-center gap-3 mb-4">
                  {getSourceIcon(activeTab as Source['type'])}
                  <h3 className="text-lg font-bold text-[#F5F5F5]">
                    Add {getSourceTypeName(activeTab as Source['type'])} Source
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="source-input" className="text-[#A0A0A0] text-sm font-medium">
                    {getSourceTypeName(activeTab as Source['type'])} Handle/URL
                  </Label>
                  <Input
                    id="source-input"
                    placeholder={getPlaceholder(activeTab)}
                    value={formInputs[activeTab as keyof FormInputs] || ''}
                    onChange={(e) => handleInputChange(activeTab as keyof FormInputs, e.target.value)}
                    className="bg-neutral-800/50 border-neutral-700 text-[#F5F5F5] placeholder:text-[#64748B] h-12"
                  />
                  {/* Helper text for each source type */}
                  <p className="text-xs text-[#64748B]">
                    {activeTab === 'x' && 'Enter the X handle (e.g., "elonmusk" or "@elonmusk")'}
                    {activeTab === 'youtube' && 'Enter YouTube channel handle (e.g., "@aliabdaal") or channel URL'}
                    {activeTab === 'rss' && 'Enter the RSS feed URL (e.g., "https://techcrunch.com/feed/")'}
                    {activeTab === 'blog' && 'Enter the blog URL (e.g., "https://example.com")'}
                  </p>
                </div>
                
                <motion.button
                  onClick={handleAddSource}
                  disabled={isLoading || !formInputs[activeTab as keyof FormInputs] || !formInputs[activeTab as keyof FormInputs].trim()}
                  className="group relative w-full flex items-center justify-center gap-2 overflow-hidden rounded-lg border-[1.5px] border-purple-500/40 bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 text-base font-semibold text-white cursor-pointer transition-all duration-500 ease-out hover:border-transparent hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"></div>
                  
                  {/* Button Content */}
                  <div className="relative z-10 flex items-center gap-2">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Adding Source...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5" />
                        <span>Add {getSourceTypeName(activeTab as Source['type'])}</span>
                      </>
                    )}
                  </div>
                </motion.button>
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card className="bg-[#1E1E1E] border-neutral-800">
            <CardHeader>
              <CardTitle className="text-[#F5F5F5] flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Need Inspiration?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
                <DialogTrigger asChild>
                  <CustomButton 
                    variant="outline" 
                    className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Suggest Sources
                  </CustomButton>
                </DialogTrigger>
                <DialogContent className="bg-[#1E1E1E] border-neutral-800 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-[#F5F5F5]">AI-Recommended Sources</DialogTitle>
                    <DialogDescription className="text-[#A0A0A0]">
                      Based on your existing sources and style preferences
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {suggestedSources.map((source, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center justify-between p-4 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center gap-3">
                          {getSourceIcon(source.type)}
                          <div>
                            <p className="text-[#F5F5F5] font-medium">{source.name}</p>
                            <p className="text-[#A0A0A0] text-sm">{source.description}</p>
                            <p className="text-purple-400 text-xs">{source.relevanceScore}% match</p>
                          </div>
                        </div>
                        <CustomButton
                          onClick={() => handleAddSuggestedSource(source)}
                          size="sm"
                          className="bg-purple-500 hover:bg-purple-600"
                        >
                          Add
                        </CustomButton>
                      </motion.div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Connected Sources */}
        <div className="lg:col-span-2">
          <Card className="bg-[#1E1E1E] border-neutral-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#F5F5F5]">Connected Sources</CardTitle>
                <div className="flex items-center gap-3">
                  {sources.length > 0 && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                      <Input
                        placeholder="Search sources..."
                        value={searchQuery || ''}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64 bg-neutral-800/50 border-neutral-700 text-[#F5F5F5]"
                      />
                    </div>
                  )}
                  <CustomButton
                    onClick={loadSources}
                    disabled={isLoadingSources}
                    variant="outline"
                    size="sm"
                    className="border-neutral-700 text-[#A0A0A0] hover:bg-neutral-800/50"
                  >
                    {isLoadingSources ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Activity className="h-4 w-4" />
                    )}
                  </CustomButton>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!user ? (
                // Not authenticated state
                <motion.div 
                  className="flex flex-col items-center justify-center py-12 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Rss className="h-12 w-12 text-[#64748B] mb-4" />
                  <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2">
                    Authentication Required
                  </h3>
                  <p className="text-[#A0A0A0] text-sm mb-4">
                    Please log in to view and manage your sources.
                  </p>
                  <CustomButton
                    onClick={() => window.location.href = '/login'}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    Go to Login
                  </CustomButton>
                </motion.div>
              ) : isLoadingSources ? (
                <motion.div 
                  className="flex flex-col items-center justify-center py-12 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Loader2 className="h-12 w-12 text-[#64748B] animate-spin" />
                  <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2">
                    Loading sources...
                  </h3>
                  <p className="text-[#A0A0A0] text-sm">
                    Please wait while we fetch your connected sources.
                  </p>
                </motion.div>
              ) : filteredSources.length === 0 ? (
                // Empty State
                <motion.div 
                  className="flex flex-col items-center justify-center py-12 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Rss className="h-12 w-12 text-[#64748B] mb-4" />
                  <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2">
                    {sources.length === 0 ? "Connect your first source" : "No sources found"}
                  </h3>
                  <p className="text-[#A0A0A0] text-sm">
                    {sources.length === 0 
                      ? "Use the form on the left to start analyzing content."
                      : "Try adjusting your search query."
                    }
                  </p>
                </motion.div>
              ) : (
                // Source List
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredSources.map((source, index) => (
                      <motion.div
                        key={source.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-neutral-800/50 hover:border-neutral-700/50 transition-colors bg-neutral-800/20"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        layout
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 bg-neutral-800">
                            <AvatarFallback className="bg-neutral-800 border-0">
                              {getSourceIcon(source.type)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#F5F5F5] text-sm">
                                {source.handle || source.url || 'Unknown'}
                              </span>
                              {getHealthIndicator(source)}
                            </div>
                            <span className="text-[#A0A0A0] text-xs">
                              {getSourceTypeName(source.type)} • {source.handle || source.url}
                            </span>
                            {/* Source Info */}
                            <div className="flex items-center gap-4 mt-1 text-xs">
                              <span className="text-purple-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Added {new Date(source.created_at).toLocaleDateString()}
                              </span>
                              <span className="text-blue-400 flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                {source.active ? 'Active' : 'Paused'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={source.active ? 'default' : 'secondary'}
                            className={source.active 
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30' 
                              : 'bg-neutral-700 text-[#A0A0A0] hover:bg-neutral-600'
                            }
                          >
                            {source.active ? 'Active' : 'Paused'}
                          </Badge>

                          <Switch
                            checked={source.active}
                            onCheckedChange={() => handleToggleStatus(source.id)}
                            disabled={loadingStates[source.id]}
                            className="data-[state=checked]:bg-green-500"
                          />

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <CustomButton
                                variant="ghost"
                                size="sm"
                                disabled={loadingStates[source.id]}
                                className="h-8 w-8 p-0 text-[#A0A0A0] hover:text-red-400 hover:bg-red-400/10"
                              >
                                {loadingStates[source.id] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </CustomButton>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#1E1E1E] border-neutral-800">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-[#F5F5F5]">
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-[#A0A0A0]">
                                  This will permanently remove the source from your feed analysis. All associated data will be lost.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-neutral-800 text-[#F5F5F5] border-neutral-700 hover:bg-neutral-700">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteSource(source.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Remove Source
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
