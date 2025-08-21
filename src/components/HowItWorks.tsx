"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link2, Upload, CheckCircle, Check, Sparkles, TrendingUp, Zap } from 'lucide-react';
import DisplayCards from '@/components/ui/display-cards';

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const steps = [
    {
      step: 1,
      title: "Connect Your Platforms",
      description: "Link your Twitter, LinkedIn, and Instagram accounts, plus your favorite sources like YouTube or newsletters.",
      icon: Link2,
    },
    {
      step: 2,
      title: "Upload Your Best Content",
      description: "Share your top-performing posts so CreatorPulse can learn your unique voice and style.",
      icon: Upload,
    },
    {
      step: 3,
      title: "Set Preferences & Start Creating",
      description: "Choose delivery channels and draft formats, then receive AI-powered posts every morning in under 15 minutes.",
      icon: CheckCircle,
    },
  ];

  // Three cards representing the three steps
  const stepCards = [
    {
      icon: <Link2 className="size-4 text-blue-300" />,
      title: "Connect Platforms",
      description: "Link your social media accounts",
      date: "Step 1",
      iconClassName: "text-blue-500",
      titleClassName: "text-blue-500",
      className: "[grid-area:stack] hover:-translate-y-16 hover:scale-110 hover:rotate-y-0 hover:skew-y-0 hover:z-50 hover:shadow-2xl before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0 transition-all duration-700 ease-out",
    },
    {
      icon: <Upload className="size-4 text-purple-300" />,
      title: "Upload Content",
      description: "Share your best posts for AI learning",
      date: "Step 2",
      iconClassName: "text-purple-500",
      titleClassName: "text-purple-500",
      className: "[grid-area:stack] translate-x-24 translate-y-16 hover:-translate-y-8 hover:scale-110 hover:rotate-y-0 hover:skew-y-0 hover:z-50 hover:shadow-2xl before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0 transition-all duration-700 ease-out",
    },
    {
      icon: <Zap className="size-4 text-green-300" />,
      title: "AI Generation",
      description: "Get personalized content every morning",
      date: "Step 3",
      iconClassName: "text-green-500",
      titleClassName: "text-green-500",
      className: "[grid-area:stack] translate-x-48 translate-y-32 hover:translate-y-16 hover:scale-110 hover:rotate-y-0 hover:skew-y-0 hover:z-50 hover:shadow-2xl transition-all duration-700 ease-out",
    },
  ];

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    stepRefs.current.forEach((stepRef, index) => {
      if (stepRef) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                // Set active step when step comes into view
                setActiveStep(index + 1);
              }
            });
          },
          {
            root: null,
            rootMargin: '-40% 0px -40% 0px', // Trigger when step is in middle 20% of viewport
            threshold: 0,
          }
        );

        observer.observe(stepRef);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, []);

  return (
    <section 
      id="how-it-works" 
      ref={sectionRef}
      className="pb-16 md:pb-20 bg-neutral-900 text-white"
    >
      <div className="container mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <motion.div 
          className="text-center pt-8 md:pt-12 mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl text-white mb-4">
            How CreatorPulse Works
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Get started in three simple steps and start posting in minutes.
          </p>
        </motion.div>

        {/* Main Content Container */}
        <div className="flex flex-col lg:flex-row items-start justify-center gap-12 mb-20">

          {/* DisplayCards - Right side */}
          <div className="w-full">
              {/* DisplayCards Component */}
              <div className="flex justify-center">
                <DisplayCards cards={stepCards} />
              </div>
          </div>
        </div>
      </div>
    </section>
  );
}