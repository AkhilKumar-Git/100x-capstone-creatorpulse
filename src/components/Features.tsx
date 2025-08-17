"use client";

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { TrendingUp, PenTool, Clock } from 'lucide-react'
import { ReactNode } from 'react'
import { motion } from 'framer-motion'

export function Features() {
  const features = [
    {
      icon: TrendingUp,
      title: "Ride the Wave. Instantly.",
      subtitle: "AI Trend Engine",
      description: "CreatorPulse scans your trusted sources—Twitter handles, newsletters, YouTube channels—to detect emerging topics, so you never start from a blank page."
    },
    {
      icon: PenTool,
      title: "Your Ideas, Your Voice. Faster.",
      subtitle: "Voice-Matched Smart Drafts",
      description: "AI-generated drafts feel 70% ready to post because they're trained on your top content and continuously refined with simple 👍/👎 feedback."
    },
    {
      icon: Clock,
      title: "From Idea to Post in Minutes.",
      subtitle: "15-Minute Workflow",
      description: "Receive ready-to-post drafts every morning via Email or WhatsApp. Review, tweak, and publish—all in under 15 minutes."
    }
  ];

  return (
    <section id="features" className="pb-16 md:pb-20 bg-neutral-900 text-white">
      <div className="@container mx-auto max-w-6xl px-6">
        <motion.div 
          className="text-center pt-8 md:pt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl text-white">
            Why Creators Choose CreatorPulse
          </h2>
          <p className="mt-4 text-gray-400 text-lg max-w-3xl mx-auto">
            Transform your content creation workflow with AI-powered tools designed for modern creators.
          </p>
        </motion.div>
        
        <div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-12 grid max-w-sm gap-8 md:mt-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.subtitle}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.2,
                ease: "easeOut"
              }}
              viewport={{ once: true }}
            >
              <Card className="group relative border-0 bg-neutral-800/50 shadow-none hover:bg-neutral-800/70 transition-all duration-300 hover:-translate-y-2 text-center backdrop-blur-sm">
                {/* Magic UI Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                
                <div className="relative">
                  <CardHeader className="pb-3">
                    <CardDecorator>
                      <feature.icon className="size-6 text-white" aria-hidden />
                    </CardDecorator>

                    <div className="mt-6 space-y-2">
                      <p className="text-sm font-medium text-blue-400 uppercase tracking-wide">
                        {feature.subtitle}
                      </p>
                      <h3 className="font-semibold text-white text-xl">
                        {feature.title}
                      </h3>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
  <div aria-hidden className="relative mx-auto size-36 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]">
    <div className="absolute inset-0 [--border:rgba(255,255,255,0.1)] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-30"/>
    <div className="absolute inset-0 m-auto flex size-16 items-center justify-center border border-neutral-700 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm">
      {children}
    </div>
  </div>
)