"use client";

import { motion } from 'framer-motion';
import { cn } from "@/shared/utils/cn";
import { TestimonialCard, TestimonialAuthor } from "@/components/ui/testimonial-card";

interface TestimonialsSectionProps {
  title: string;
  description: string;
  testimonials: Array<{
    author: TestimonialAuthor;
    text: string;
    href?: string;
  }>;
  className?: string;
}

export function TestimonialsSection({ 
  title,
  description,
  testimonials,
  className 
}: TestimonialsSectionProps) {
  return (
    <section 
      id="testimonials"
      className={cn(
        "bg-neutral-900 text-white",
        "pb-16 md:pb-20",
        className
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center sm:gap-12 px-6">
        {/* Section Header */}
        <motion.div 
          className="flex flex-col items-center gap-4 pt-8 md:pt-12 sm:gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="max-w-[720px] text-4xl font-semibold leading-tight sm:text-5xl sm:leading-tight text-white">
            {title}
          </h2>
          <p className="text-lg max-w-[600px] font-medium text-gray-400 sm:text-xl">
            {description}
          </p>
        </motion.div>

        {/* Testimonials Marquee */}
        <motion.div 
          className="relative flex w-full flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="group flex overflow-hidden p-2 [--gap:1.5rem] [gap:var(--gap)] flex-row [--duration:80s]">
            <div className="flex shrink-0 [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]">
              {/* First set of testimonials */}
              {testimonials.map((testimonial, i) => (
                <TestimonialCard 
                  key={`set1-${i}`}
                  {...testimonial}
                />
              ))}
              {/* Second set - exact duplicate for seamless loop */}
              {testimonials.map((testimonial, i) => (
                <TestimonialCard 
                  key={`set2-${i}`}
                  {...testimonial}
                />
              ))}
            </div>
          </div>

          {/* Gradient Overlays */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-neutral-900 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-neutral-900 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}

export function Testimonials() {
  const testimonials = [
    {
      author: {
        name: "Alex Carter",
        handle: "@alexcreates",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        platform: "twitter" as const
      },
      text: "CreatorPulse cut my content prep time from 2 hours to 15 minutes. I can finally post daily without burning out."
    },
    {
      author: {
        name: "Mia Thompson",
        handle: "@miathompson",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
        platform: "linkedin" as const
      },
      text: "Managing 5 client brands got 10x easier. Voice-matched drafts are scarily accurate—feels like magic."
    },
    {
      author: {
        name: "Jordan Lee",
        handle: "@jordanbuilds",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        platform: "producthunt" as const
      },
      text: "Tried CreatorPulse on launch week. It spotted trends I'd never find alone. Engagement doubled in 3 days."
    },
    {
      author: {
        name: "Sophia Alvarez",
        handle: "@sophiamarketing",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
        platform: "twitter" as const
      },
      text: "The trend insights alone are worth it. I wake up, review drafts, and post in under 20 minutes."
    }
  ];

  return (
    <TestimonialsSection
      title="Loved by Creators and Agencies"
      description="Here's what early users are saying about CreatorPulse"
      testimonials={testimonials}
    />
  );
}