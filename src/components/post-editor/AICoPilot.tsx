'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { XIcon } from '@/components/ui/x-icon';
import {
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Copy,
  Wand2,
  MessageSquare,
  TrendingUp,
  Lightbulb,
  Zap,
  Target,
  Heart,
  Star,
  Flame,
  Linkedin,
  Instagram
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GradientButton } from '../ui/gradient-button';
import { toast } from 'sonner';
import { GenerateProgressOverlay } from '@/components/GenerateProgressOverlay';

type Platform = 'x' | 'linkedin' | 'instagram';
type Tone = 'casual' | 'professional' | 'witty' | 'inspirational' | 'technical' | 'bold' | 'friendly' | 'authoritative';

interface ThreadTweet {
  id: string;
  content: string;
  characterCount: number;
}

interface AICoPilotProps {
  onInsertContent: (content: string) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  platform: Platform;
  initialPrompt?: string;
  onGenerateComplete?: (data: GeneratedPlatformContent) => void;
}

interface GeneratedPlatformContent {
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

interface ViralTemplate {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  template: string;
  color: string;
}

export function AICoPilot({ onInsertContent, isGenerating, setIsGenerating, platform, initialPrompt, onGenerateComplete }: AICoPilotProps) {
  const [topic, setTopic] = useState(initialPrompt || '');
  const [generatedContent, setGeneratedContent] = useState<GeneratedPlatformContent | null>(null);
  const [selectedTones, setSelectedTones] = useState<Tone[]>(['professional']);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [showProgressOverlay, setShowProgressOverlay] = useState(false);
  const [apiResponseReceived, setApiResponseReceived] = useState(false);
  const [imageApiCompleted, setImageApiCompleted] = useState(false);

  // Update topic when initialPrompt changes
  React.useEffect(() => {
    if (initialPrompt && initialPrompt !== topic) {
      setTopic(initialPrompt);
    }
  }, [initialPrompt]);

  const toneOptions = [
    { value: 'casual', label: 'Casual', icon: Heart, color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
    { value: 'professional', label: 'Professional', icon: Target, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { value: 'witty', label: 'Witty', icon: Sparkles, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { value: 'inspirational', label: 'Inspirational', icon: Star, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { value: 'technical', label: 'Technical', icon: Zap, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { value: 'bold', label: 'Bold', icon: Flame, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { value: 'friendly', label: 'Friendly', icon: Heart, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    { value: 'authoritative', label: 'Authoritative', icon: Target, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' }
  ];

  const viralTemplates: ViralTemplate[] = [
    {
      id: 'hook',
      name: 'Hook Builder',
      icon: Zap,
      template: 'Write a viral hook about',
      color: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    },
    {
      id: 'story',
      name: 'Story Booster',
      icon: MessageSquare,
      template: 'Tell an engaging story about',
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    },
    {
      id: 'listicle',
      name: 'List Master',
      icon: TrendingUp,
      template: 'Create a compelling list about',
      color: 'bg-green-500/20 text-green-400 border-green-500/30'
    },
    {
      id: 'insight',
      name: 'Insight Booster',
      icon: Lightbulb,
      template: 'Share valuable insights about',
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    },
    {
      id: 'controversy',
      name: 'Hot Take',
      icon: Flame,
      template: 'Share a controversial but thoughtful opinion about',
      color: 'bg-red-500/20 text-red-400 border-red-500/30'
    },
    {
      id: 'behind-scenes',
      name: 'Behind Scenes',
      icon: Star,
      template: 'Show behind the scenes of',
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    }
  ];

  const mockGeneratedContent = {
    x: [
      "🚀 The future of AI in content creation is here!\n\nAfter spending months building with the latest AI tools, here's what I've learned:\n\n• Traditional content workflows are broken\n• AI-powered creation isn't about replacement—it's about amplification\n• Your personal voice still matters most\n\nThe creators who win will be those who learn to dance with AI, not fight it. 💭\n\nWhat's your take on AI in creative work?",
      "Building in public taught me this:\n\nThe tech stack doesn't matter as much as the problem you're solving.\n\nI've seen incredible products built with \"outdated\" tech that solve real problems, and I've seen cutting-edge apps that nobody uses.\n\nFocus on your users first, tech second. 🎯",
      "Hot take: Most startups fail not because of competition, but because they stop talking to their customers.\n\nI've been guilty of this too. You build something amazing (in your mind), but forget to validate it with real people.\n\nThe cure? Talk to 10 users this week. Listen more than you pitch. 👂"
    ],
    linkedin: [
      "The landscape of content creation is undergoing a fundamental transformation, and artificial intelligence is at the center of this revolution.\n\nAs someone who has been exploring AI-powered tools for content strategy, I've observed three critical shifts:\n\n1️⃣ Efficiency Without Compromise: AI doesn't replace creativity—it amplifies it. The most successful creators I know use AI to handle the mechanical aspects of content creation, freeing up mental space for strategic thinking and genuine insights.\n\n2️⃣ Personalization at Scale: We're moving beyond one-size-fits-all content. AI enables us to create multiple variations of our message, each tailored to different audience segments while maintaining our authentic voice.\n\n3️⃣ Data-Driven Creativity: The integration of real-time analytics with content generation means we can now create content that's not just engaging, but strategically aligned with our business objectives.\n\nThe question isn't whether AI will change content creation—it already has. The question is: How will you adapt to stay relevant?\n\nWhat's your experience with AI in your content workflow? I'd love to hear your thoughts in the comments.",
      "Leadership in the digital age requires a new kind of vulnerability.\n\nToday's most effective leaders aren't those who project perfection, but those who share their learning journey authentically.\n\nI've noticed this shift particularly in how successful entrepreneurs build their personal brands:\n\n• They document failures alongside successes\n• They ask questions publicly, not just provide answers\n• They show the process, not just the results\n• They build communities, not just audiences\n\nThis approach doesn't just humanize leadership—it accelerates growth for everyone involved.\n\nWhen leaders learn in public, they create permission for their teams to do the same. This psychological safety becomes a competitive advantage.\n\nHow has your leadership style evolved in the digital era?",
      "The most undervalued skill in business today? \n\nActive listening.\n\nIn our rush to scale, optimize, and iterate, we've forgotten that business is fundamentally about human connection.\n\nEvery breakthrough product I've seen started with someone who truly listened to a problem that others overlooked.\n\nEvery successful partnership began with genuine understanding, not just alignment of interests.\n\nEvery meaningful career pivot happened when someone stopped talking and started hearing what the market was actually saying.\n\nYet we spend more time crafting our pitch than understanding our audience.\n\nMore time building features than discovering needs.\n\nMore time networking than relationship building.\n\nThe companies that will thrive in the next decade won't be those with the most sophisticated technology—they'll be those that listen most carefully to human needs.\n\nWhat's one thing you learned recently just by listening?"
    ],
    instagram: [
      "✨ Plot twist: The best content creators aren't the most talented—they're the most consistent.\n\nI used to think I needed the perfect shot, the perfect caption, the perfect everything before posting. \n\nThen I realized perfectionism was just fear in disguise. 😅\n\nNow I focus on:\n🎯 Showing up daily\n📸 Capturing real moments\n💭 Sharing honest thoughts\n🤝 Building genuine connections\n\nYour \"imperfect\" content today is better than your perfect content never.\n\nWhat's stopping you from sharing your story? Drop it in the comments 👇\n\n#ContentCreator #AuthenticityOverPerfection #BuildInPublic #CreatorTips",
      "🚀 Behind the scenes of building something from nothing:\n\nMonth 1: \"This is going to change everything!\"\nMonth 3: \"Maybe this wasn't such a good idea...\"\nMonth 6: \"I have no clue what I'm doing\"\nMonth 9: \"Wait, people actually like this?\"\nMonth 12: \"How did we get here?!\"\n\nThe entrepreneurial journey in a nutshell 😂\n\nCurrently somewhere between month 6 and 9 with my latest project. The uncertainty is terrifying and exciting at the same time.\n\nTo everyone building something: you're not alone in feeling lost sometimes. That's not failure—that's growth.\n\nKeep going. The breakthrough might be just around the corner. 💪\n\nWhat month are you in with your current project? 👇\n\n#Entrepreneur #StartupLife #BuildingInPublic #NeverGiveUp",
      "💡 Unpopular opinion: Your competition isn't your enemy—it's your validation.\n\nWhen I started seeing others build similar tools, my first instinct was panic. \"They're going to steal all my users!\"\n\nThen a mentor told me something that shifted my perspective:\n\n\"If no one else is solving this problem, maybe it's not a real problem.\"\n\n🤯 Mind = blown\n\nCompetition means:\n✅ There's a real market\n✅ People will pay for solutions\n✅ You're onto something valuable\n✅ There's room for innovation\n\nNow when I see competitors, I think:\n\"Great! Someone else believes this matters too.\"\n\nThe market is usually big enough for multiple players. Focus on serving your specific audience better than anyone else.\n\nHow do you view your competition? Friend or foe? 👇\n\n#Mindset #Competition #BusinessTips #Entrepreneurship"
    ]
  };

  const toggleTone = (tone: Tone) => {
    setSelectedTones(prev => 
      prev.includes(tone) 
        ? prev.filter(t => t !== tone)
        : [...prev, tone]
    );
  };

  const applyTemplate = (template: ViralTemplate) => {
    // Do not generate; just pre-append the template so the user can see/confirm
    setSelectedTemplate(template.id);
    const base = topic.trim();
    const enhancedTopic = base ? `${template.template} ${base}` : `${template.template} `;
    setTopic(enhancedTopic);
  };

  const handleGenerate = async (customTopic?: string) => {
    const finalTopic = customTopic || topic;
    if (!finalTopic.trim()) {
      toast.error('Please enter a topic to generate content');
      return;
    }
    
    setIsGenerating(true);
    setShowProgressOverlay(true);
    setApiResponseReceived(false);
    setImageApiCompleted(false);
    setFeedback(null);
    
    try {
      const response = await fetch('/api/generate-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: finalTopic.trim(),
          platforms: ['x', 'linkedin', 'instagram'],
          tones: selectedTones
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      console.log('🎯 Frontend received API response:', data);
      console.log('📋 Platforms data:', data.platforms);
      
      setGeneratedContent(data.platforms);
      
      // Notify parent component if callback exists
      if (onGenerateComplete) {
        console.log('🔄 Calling onGenerateComplete with:', data.platforms);
        onGenerateComplete(data.platforms);
      }
      
      // Signal that API response has been received
      setApiResponseReceived(true);
      // Since image generation is part of the same API call, mark it as completed too
      setImageApiCompleted(true);
    } catch (error) {
      console.error('Error generating content:', error);
      setShowProgressOverlay(false);
      setIsGenerating(false);
      toast.error('Failed to generate content. Please try again.');
    }
  };

  const handleProgressComplete = () => {
    setShowProgressOverlay(false);
    setIsGenerating(false);
    toast.success('Content generated for all platforms!');
  };

  const handleRegenerate = async () => {
    if (topic.trim()) {
      await handleGenerate();
    }
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



  const handleInsertToPlatform = (platform: Platform) => {
    const platformContent = generatedContent?.[platform];
    if (platformContent) {
      // For X platform, if we have threads, use the complete thread content
      if (platform === 'x' && 'threads' in platformContent && platformContent.threads) {
        const threadContent = platformContent.threads.map(t => t.content).join('\n\n---\n\n');
        onInsertContent(threadContent);
      } else {
        onInsertContent(platformContent.content);
      }
      toast.success(`Content inserted for ${platform.toUpperCase()}`);
    }
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    // Here you would send feedback to your backend
    console.log(`User feedback: ${type} for generated content`);
    toast.success(`Thank you for your feedback!`);
  };

  return (
    <>
      <GenerateProgressOverlay
        isVisible={showProgressOverlay}
        onComplete={handleProgressComplete}
        platformCount={3}
        waitForApiResponse={apiResponseReceived}
        imageApiCompleted={imageApiCompleted}
      />
      
      <Card className="bg-[#1E1E1E] border-neutral-800 h-full">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            CreatorPulse Co-Pilot
          </CardTitle>
        </CardHeader>
      
      <CardContent className="space-y-6">
        {!generatedContent ? (
          /* Initial State */
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">What do you want to write about?</label>
              <Input
                placeholder="E.g. My experience building a SaaS product, tips for remote work, or the future of AI..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isGenerating) {
                    handleGenerate();
                  }
                }}
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-white text-sm font-medium">Tone (Select multiple)</label>
              <div className="flex flex-wrap gap-2">
                {toneOptions.map((tone) => {
                  const Icon = tone.icon;
                  const isSelected = selectedTones.includes(tone.value as Tone);
                  return (
                    <button
                      key={tone.value}
                      onClick={() => toggleTone(tone.value as Tone)}
                      className={`px-3 py-2 rounded-full text-xs font-medium border transition-all duration-200 ${
                        isSelected 
                          ? tone.color 
                          : 'bg-neutral-800 text-gray-400 border-neutral-700 hover:border-neutral-600'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <Icon className="h-3 w-3" />
                        {tone.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <GradientButton
              onClick={() => handleGenerate()}
              disabled={!topic.trim() || isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Generate Draft
                </div>
              )}
            </GradientButton>

            {/* Viral Templates */}
            <div className="space-y-3">
              <label className="text-white text-sm font-medium">Viral Boosters</label>
              <div className="grid grid-cols-1 gap-2">
                {viralTemplates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      disabled={!topic.trim() || isGenerating}
                      className={`text-sm h-10 justify-start px-3 py-2 rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${template.color} hover:opacity-80`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {template.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Generated State - Platform Previews */
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <Skeleton className="h-4 w-full bg-neutral-700" />
                  <Skeleton className="h-4 w-5/6 bg-neutral-700" />
                  <Skeleton className="h-32 w-full bg-neutral-700" />
                  <Skeleton className="h-32 w-full bg-neutral-700" />
                  <Skeleton className="h-32 w-full bg-neutral-700" />
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Generated Content Summary */}
                  <div className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
                    <div className="text-center space-y-3">
                      <div className="text-green-400 text-sm font-medium">✨ Content Generated Successfully!</div>
                      <div className="text-gray-300 text-sm">
                        AI has created optimized content for all platforms. Check the preview panel to see your content.
                      </div>
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        {(['x', 'linkedin', 'instagram'] as Platform[]).map((platformType, index) => (
                          <div key={platformType} className="flex items-center gap-1">
                            {index > 0 && <span>•</span>}
                            {getPlatformIcon(platformType)}
                            <span>{platformType === 'x' ? 'X' : platformType.charAt(0).toUpperCase() + platformType.slice(1)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Note: Previews are shown only in the right panel */}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-4">
                    <GradientButton
                      onClick={handleRegenerate}
                      disabled={isGenerating}
                      className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate All
                    </GradientButton>
                  </div>

                  {/* Feedback Section */}
                  <div className="space-y-3 pt-4 border-t border-neutral-800">
                    <label className="text-white text-sm font-medium">Rate this generation</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleFeedback('up')}
                        className={`p-2 rounded-lg border transition-all duration-200 ${
                          feedback === 'up' 
                            ? 'bg-green-600/20 border-green-600/50 text-green-400' 
                            : 'bg-neutral-800 border-neutral-700 text-gray-400 hover:text-green-400'
                        }`}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleFeedback('down')}
                        className={`p-2 rounded-lg border transition-all duration-200 ${
                          feedback === 'down' 
                            ? 'bg-red-600/20 border-red-600/50 text-red-400' 
                            : 'bg-neutral-800 border-neutral-700 text-gray-400 hover:text-red-400'
                        }`}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </button>
                      <span className="text-xs text-gray-400 ml-2">
                        Help us improve AI quality
                      </span>
                    </div>
                  </div>

                  {/* Start Over */}
                  <button
                    onClick={() => {
                      setGeneratedContent(null);
                      setTopic('');
                      setFeedback(null);
                      setSelectedTemplate('');
                    }}
                    className="w-full py-2 text-gray-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors duration-200"
                  >
                    Start Over
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}
