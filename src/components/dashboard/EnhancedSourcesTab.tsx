'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Instagram,
  Linkedin,
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

// Types
interface Source {
  id: string;
  type: 'x' | 'instagram' | 'linkedin' | 'rss' | 'youtube' | 'hashtag';
  name: string;
  identifier: string;
  status: 'Active' | 'Paused';
  health: 'healthy' | 'error' | 'warning';
  analytics: {
    trendsFound: number;
    postsAnalyzed: number;
    lastUpdate: string;
  };
}

interface FormInputs {
  x: string;
  instagram: string;
  linkedin: string;
  rss: string;
  youtube: string;
  hashtag: string;
}

interface SuggestedSource {
  type: Source['type'];
  name: string;
  identifier: string;
  description: string;
  relevanceScore: number;
}

// Mock data with enhanced analytics
const initialSources: Source[] = [
  {
    id: '1',
    type: 'x',
    name: '@elonmusk',
    identifier: 'elonmusk',
    status: 'Active',
    health: 'healthy',
    analytics: {
      trendsFound: 8,
      postsAnalyzed: 34,
      lastUpdate: '2 hours ago'
    }
  },
  {
    id: '2',
    type: 'instagram',
    name: '@garyvee',
    identifier: 'garyvee',
    status: 'Active',
    health: 'healthy',
    analytics: {
      trendsFound: 5,
      postsAnalyzed: 22,
      lastUpdate: '4 hours ago'
    }
  },
  {
    id: '3',
    type: 'linkedin',
    name: 'Reid Hoffman',
    identifier: 'reidhoffman',
    status: 'Active',
    health: 'warning',
    analytics: {
      trendsFound: 3,
      postsAnalyzed: 12,
      lastUpdate: '1 day ago'
    }
  },
  {
    id: '4',
    type: 'rss',
    name: 'TechCrunch Feed',
    identifier: 'https://techcrunch.com/feed/',
    status: 'Paused',
    health: 'error',
    analytics: {
      trendsFound: 0,
      postsAnalyzed: 0,
      lastUpdate: '3 days ago'
    }
  },
  {
    id: '5',
    type: 'youtube',
    name: 'Marques Brownlee',
    identifier: '@MKBHD',
    status: 'Active',
    health: 'healthy',
    analytics: {
      trendsFound: 12,
      postsAnalyzed: 18,
      lastUpdate: '1 hour ago'
    }
  }
];

const suggestedSources: SuggestedSource[] = [
  {
    type: 'x',
    name: '@naval',
    identifier: 'naval',
    description: 'Philosophical insights on startups and life',
    relevanceScore: 95
  },
  {
    type: 'linkedin',
    name: 'Simon Sinek',
    identifier: 'simonsinek',
    description: 'Leadership and motivation expert',
    relevanceScore: 88
  },
  {
    type: 'youtube',
    name: 'Ali Abdaal',
    identifier: '@aliabdaal',
    description: 'Productivity and business content creator',
    relevanceScore: 92
  }
];

export function EnhancedSourcesTab() {
  const [sources, setSources] = useState<Source[]>(initialSources);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({});
  const [activeTab, setActiveTab] = useState('x');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formInputs, setFormInputs] = useState<FormInputs>({
    x: '',
    instagram: '',
    linkedin: '',
    rss: '',
    youtube: '',
    hashtag: ''
  });

  // Filter sources based on search query
  const filteredSources = useMemo(() => {
    if (!searchQuery.trim()) return sources;
    return sources.filter(source => 
      source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getSourceTypeName(source.type).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sources, searchQuery]);

  // Helper functions
  const getSourceIcon = (type: Source['type']) => {
    switch (type) {
      case 'x':
        return <XIcon className="h-5 w-5 text-white" />;
      case 'instagram':
        return <Instagram className="h-5 w-5 text-[#E4405F]" />;
      case 'linkedin':
        return <Linkedin className="h-5 w-5 text-[#0077B5]" />;
      case 'rss':
        return <Rss className="h-5 w-5 text-[#FF6600]" />;
      case 'youtube':
        return <Youtube className="h-5 w-5 text-[#FF0000]" />;
      case 'hashtag':
        return <Hash className="h-5 w-5 text-[#64748B]" />;
      default:
        return <Rss className="h-5 w-5 text-[#64748B]" />;
    }
  };

  const getSourceTypeName = (type: Source['type']) => {
    switch (type) {
      case 'x': return 'X';
      case 'instagram': return 'Instagram';
      case 'linkedin': return 'LinkedIn';
      case 'rss': return 'RSS Feed';
      case 'youtube': return 'YouTube';
      case 'hashtag': return 'Hashtag';
      default: return 'Unknown';
    }
  };

  const getPlaceholder = (type: string) => {
    switch (type) {
      case 'x': return 'Enter X handle...';
      case 'instagram': return 'Enter Instagram handle...';
      case 'linkedin': return 'Enter LinkedIn profile...';
      case 'rss': return 'Enter RSS feed URL...';
      case 'youtube': return 'Enter YouTube channel handle...';
      case 'hashtag': return 'Enter hashtag (without #)...';
      default: return 'Enter source...';
    }
  };

  const getHealthIndicator = (health: Source['health'], analytics: Source['analytics']) => {
    switch (health) {
      case 'healthy':
        return (
          <Tooltip>
            <TooltipTrigger>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Healthy - Last updated {analytics.lastUpdate}</p>
            </TooltipContent>
          </Tooltip>
        );
      case 'warning':
        return (
          <Tooltip>
            <TooltipTrigger>
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Warning - Slow updates detected</p>
            </TooltipContent>
          </Tooltip>
        );
      case 'error':
        return (
          <Tooltip>
            <TooltipTrigger>
              <div className="w-2 h-2 bg-red-500 rounded-full" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Error - Unable to fetch data</p>
            </TooltipContent>
          </Tooltip>
        );
    }
  };

  // Handlers
  const handleInputChange = (type: keyof FormInputs, value: string) => {
    setFormInputs(prev => ({ ...prev, [type]: value }));
  };

  const handleAddSource = async () => {
    const currentInput = formInputs[activeTab as keyof FormInputs];
    if (!currentInput.trim()) return;

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newSource: Source = {
        id: Date.now().toString(),
        type: activeTab as Source['type'],
        name: activeTab === 'x' || activeTab === 'instagram' ? `@${currentInput}` : 
              activeTab === 'hashtag' ? `#${currentInput}` : 
              currentInput,
        identifier: currentInput,
        status: 'Active',
        health: 'healthy',
        analytics: {
          trendsFound: Math.floor(Math.random() * 10) + 1,
          postsAnalyzed: Math.floor(Math.random() * 20) + 5,
          lastUpdate: 'Just now'
        }
      };

      setSources(prev => [...prev, newSource]);
      setFormInputs(prev => ({ ...prev, [activeTab]: '' }));
      toast.success(`${getSourceTypeName(activeTab as Source['type'])} source added successfully!`);
    } catch (error) {
      toast.error('Failed to add source. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSources(prev => prev.map(source => 
        source.id === id 
          ? { ...source, status: source.status === 'Active' ? 'Paused' : 'Active' }
          : source
      ));
      toast.success('Source status updated');
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDeleteSource = async (id: string) => {
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSources(prev => prev.filter(source => source.id !== id));
      toast.success('Source removed successfully');
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleAddSuggestedSource = async (suggested: SuggestedSource) => {
    try {
      const newSource: Source = {
        id: Date.now().toString(),
        type: suggested.type,
        name: suggested.name,
        identifier: suggested.identifier,
        status: 'Active',
        health: 'healthy',
        analytics: {
          trendsFound: Math.floor(Math.random() * 10) + 1,
          postsAnalyzed: Math.floor(Math.random() * 20) + 5,
          lastUpdate: 'Just now'
        }
      };

      setSources(prev => [...prev, newSource]);
      toast.success(`${suggested.name} added successfully!`);
      setShowSuggestions(false);
    } catch (error) {
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
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { type: 'x', label: 'X', icon: <XIcon className="h-5 w-5 text-white" /> },
                    { type: 'instagram', label: 'Instagram', icon: <Instagram className="h-5 w-5 text-[#E4405F]" /> },
                    { type: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="h-5 w-5 text-[#0077B5]" /> },
                  ].map((platform) => (
                    <motion.button
                      key={platform.type}
                      onClick={() => setActiveTab(platform.type)}
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
                
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { type: 'youtube', label: 'YouTube', icon: <Youtube className="h-5 w-5 text-[#FF0000]" /> },
                    { type: 'rss', label: 'RSS Feed', icon: <Rss className="h-5 w-5 text-[#FF6600]" /> },
                    { type: 'hashtag', label: 'Hashtag', icon: <Hash className="h-5 w-5 text-[#64748B]" /> },
                  ].map((platform) => (
                    <motion.button
                      key={platform.type}
                      onClick={() => setActiveTab(platform.type)}
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
                    value={formInputs[activeTab as keyof FormInputs]}
                    onChange={(e) => handleInputChange(activeTab as keyof FormInputs, e.target.value)}
                    className="bg-neutral-800/50 border-neutral-700 text-[#F5F5F5] placeholder:text-[#64748B] h-12"
                  />
                </div>
                
                <motion.button
                  onClick={handleAddSource}
                  disabled={isLoading || !formInputs[activeTab as keyof FormInputs].trim()}
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
                  <Button 
                    variant="outline" 
                    className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Suggest Sources
                  </Button>
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
                        <Button
                          onClick={() => handleAddSuggestedSource(source)}
                          size="sm"
                          className="bg-purple-500 hover:bg-purple-600"
                        >
                          Add
                        </Button>
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
                {sources.length > 0 && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                    <Input
                      placeholder="Search sources..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64 bg-neutral-800/50 border-neutral-700 text-[#F5F5F5]"
                    />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filteredSources.length === 0 ? (
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
                                {source.name}
                              </span>
                              {getHealthIndicator(source.health, source.analytics)}
                            </div>
                            <span className="text-[#A0A0A0] text-xs">
                              {getSourceTypeName(source.type)} • {source.identifier}
                            </span>
                            {/* Inline Analytics */}
                            <div className="flex items-center gap-4 mt-1 text-xs">
                              <span className="text-purple-400 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {source.analytics.trendsFound} trends
                              </span>
                              <span className="text-blue-400 flex items-center gap-1">
                                <BarChart3 className="h-3 w-3" />
                                {source.analytics.postsAnalyzed} posts
                              </span>
                              <span className="text-[#64748B]">
                                Updated {source.analytics.lastUpdate}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={source.status === 'Active' ? 'default' : 'secondary'}
                            className={source.status === 'Active' 
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30' 
                              : 'bg-neutral-700 text-[#A0A0A0] hover:bg-neutral-600'
                            }
                          >
                            {source.status}
                          </Badge>

                          <Switch
                            checked={source.status === 'Active'}
                            onCheckedChange={() => handleToggleStatus(source.id)}
                            disabled={loadingStates[source.id]}
                            className="data-[state=checked]:bg-green-500"
                          />

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
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
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#1E1E1E] border-neutral-800">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-[#F5F5F5]">
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-[#A0A0A0]">
                                  This will permanently remove the source "{source.name}" from your feed analysis. All associated data will be lost.
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
