'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Copy,
  Wand2,
  MessageSquare,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GradientButton } from '../ui/gradient-button';

type Platform = 'x' | 'linkedin' | 'instagram';
type Tone = 'casual' | 'professional' | 'witty' | 'inspirational' | 'technical';

interface AICoPilotProps {
  onInsertContent: (content: string) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  platform: Platform;
  initialPrompt?: string;
}

interface GeneratedContent {
  text: string;
  id: string;
  timestamp: Date;
}

export function AICoPilot({ onInsertContent, isGenerating, setIsGenerating, platform, initialPrompt }: AICoPilotProps) {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [selectedTone, setSelectedTone] = useState<Tone>('professional');
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  // Update prompt when initialPrompt changes
  React.useEffect(() => {
    if (initialPrompt && initialPrompt !== prompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const toneOptions = [
    { value: 'casual', label: 'Casual', description: 'Friendly and conversational' },
    { value: 'professional', label: 'Professional', description: 'Formal and business-like' },
    { value: 'witty', label: 'Witty', description: 'Humorous and engaging' },
    { value: 'inspirational', label: 'Inspirational', description: 'Motivating and uplifting' },
    { value: 'technical', label: 'Technical', description: 'Detailed and informative' }
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

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setFeedback(null);
    
    // Simulate AI generation delay
    setTimeout(() => {
      const contentOptions = mockGeneratedContent[platform];
      const randomContent = contentOptions[Math.floor(Math.random() * contentOptions.length)];
      
      setGeneratedContent({
        text: randomContent,
        id: Date.now().toString(),
        timestamp: new Date()
      });
      setIsGenerating(false);
    }, 2000);
  };

  const handleRegenerate = () => {
    if (generatedContent) {
      setIsGenerating(true);
      setTimeout(() => {
        const contentOptions = mockGeneratedContent[platform];
        const randomContent = contentOptions[Math.floor(Math.random() * contentOptions.length)];
        
        setGeneratedContent({
          text: randomContent,
          id: Date.now().toString(),
          timestamp: new Date()
        });
        setIsGenerating(false);
      }, 1500);
    }
  };

  const handleShorten = () => {
    if (generatedContent) {
      const shortened = generatedContent.text.split('\n\n')[0] + '\n\nWhat are your thoughts?';
      setGeneratedContent({
        ...generatedContent,
        text: shortened,
        id: Date.now().toString()
      });
    }
  };

  const handleExpand = () => {
    if (generatedContent) {
      const expanded = generatedContent.text + '\n\nThis is just the beginning. The real transformation happens when we start applying these insights consistently.\n\nWhat\'s your next step?';
      setGeneratedContent({
        ...generatedContent,
        text: expanded,
        id: Date.now().toString()
      });
    }
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    // Here you would send feedback to your backend
    console.log(`User feedback: ${type} for content: ${generatedContent?.id}`);
  };

  return (
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
              <Textarea
                placeholder="E.g. My experience building a SaaS product, tips for remote work, or the future of AI..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white placeholder:text-gray-500 min-h-[120px] resize-none"
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-white text-sm font-medium">Tone</label>
              <Select value={selectedTone} onValueChange={(value: Tone) => setSelectedTone(value)}>
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700 min-w-[380px] max-w-[480px]">
                  {toneOptions.map((tone) => (
                    <SelectItem key={tone.value} value={tone.value} className="py-4 px-4 cursor-pointer h-auto">
                      <div className="flex flex-col w-full">
                        <div className="font-medium text-sm text-white leading-tight">{tone.label}</div>
                        <div className="text-xs text-gray-400 leading-snug -mt-0.5">{tone.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <GradientButton
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
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

            {/* Quick Prompts */}
            <div className="space-y-3">
              <label className="text-white text-sm font-medium">Quick Prompts</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { icon: Lightbulb, text: 'Industry insights', color: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30' },
                  { icon: TrendingUp, text: 'Growth tips', color: 'bg-green-600/20 text-green-400 border-green-600/30' },
                  { icon: MessageSquare, text: 'Personal story', color: 'bg-blue-600/20 text-blue-400 border-blue-600/30' }
                ].map((quickPrompt, index) => (
                  <GradientButton
                    key={index}
                    
                    
                    onClick={() => setPrompt(`Write about ${quickPrompt.text.toLowerCase()} in the ${platform === 'x' ? 'tech' : platform === 'linkedin' ? 'business' : 'creator'} space`)}
                    className={`text-sm h-10 justify-start ${quickPrompt.color} hover:opacity-80`}
                  >
                    <quickPrompt.icon className="h-4 w-4 mr-2" />
                    {quickPrompt.text}
                  </GradientButton>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Generated State */
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
                  <Skeleton className="h-4 w-4/5 bg-neutral-700" />
                  <Skeleton className="h-20 w-full bg-neutral-700" />
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Generated Content */}
                  <div className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
                    <div className="whitespace-pre-wrap text-white text-sm leading-relaxed">
                      {generatedContent.text}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <GradientButton
                      onClick={() => onInsertContent(generatedContent.text)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Insert to Editor
                    </GradientButton>
                    <GradientButton
                      
                      onClick={handleRegenerate}
                      className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </GradientButton>
                  </div>

                  {/* Refinement Tools */}
                  <div className="space-y-4">
                    <label className="text-white text-sm font-medium">Refine Content</label>
                    <div className="grid grid-cols-2 gap-2">
                      <GradientButton
                        
                        
                        onClick={handleShorten}
                        className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700 text-sm h-9"
                      >
                        Shorten
                      </GradientButton>
                      <GradientButton
                        
                        
                        onClick={handleExpand}
                        className="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700 text-sm h-9"
                      >
                        Expand
                      </GradientButton>
                    </div>
                    <div className="space-y-2">
                      <label className="text-white text-xs font-medium text-gray-400">Change Tone</label>
                      <Select value={selectedTone} onValueChange={(value: Tone) => setSelectedTone(value)}>
                        <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white text-sm h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-800 border-neutral-700">
                          {toneOptions.map((tone) => (
                            <SelectItem key={tone.value} value={tone.value} className="text-sm">
                              {tone.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Feedback Section */}
                  <div className="space-y-3 pt-4 border-t border-neutral-800">
                    <label className="text-white text-sm font-medium">Rate this generation</label>
                    <div className="flex items-center gap-2">
                      <GradientButton
                        
                        
                        onClick={() => handleFeedback('up')}
                        className={`${
                          feedback === 'up' 
                            ? 'bg-green-600/20 border-green-600/50 text-green-400' 
                            : 'bg-neutral-800 border-neutral-700 text-gray-400 hover:text-green-400'
                        }`}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </GradientButton>
                      <GradientButton
                        
                        
                        onClick={() => handleFeedback('down')}
                        className={`${
                          feedback === 'down' 
                            ? 'bg-red-600/20 border-red-600/50 text-red-400' 
                            : 'bg-neutral-800 border-neutral-700 text-gray-400 hover:text-red-400'
                        }`}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </GradientButton>
                      <span className="text-xs text-gray-400 ml-2">
                        Help us improve AI quality
                      </span>
                    </div>
                  </div>

                  {/* Start Over */}
                  <GradientButton
                    
                    onClick={() => {
                      setGeneratedContent(null);
                      setPrompt('');
                      setFeedback(null);
                    }}
                    className="w-full text-gray-400 hover:text-white hover:bg-neutral-800"
                  >
                    Start Over
                  </GradientButton>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
