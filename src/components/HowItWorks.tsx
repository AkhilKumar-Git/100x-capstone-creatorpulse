"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link2, Upload, CheckCircle, Check } from 'lucide-react';
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperTitle,
  StepperTrigger,
  StepperSeparator,
} from '@/components/ui/stepper';

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

        {/* Stepper Container */}
        <Stepper
          value={activeStep}
          onValueChange={setActiveStep}
          orientation="vertical"
          className="flex flex-col lg:flex-row items-start justify-center gap-12 lg:gap-20"
          indicators={{
            completed: <Check className="size-4" />,
            active: <div className="w-2 h-2 bg-white rounded-full" />,
          }}
        >
          {/* Steps Navigation - Left side on desktop */}
          <div className="w-full lg:w-auto">
            <StepperNav className="relative">
              {steps.map((step, index) => (
                <motion.div
                  key={step.step}
                  ref={(el) => (stepRefs.current[index] = el)}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.2,
                    ease: "easeOut"
                  }}
                  viewport={{ once: true }}
                  className="mb-8 lg:mb-12"
                >
                  <StepperItem
                    step={step.step}
                    className="relative items-start not-last:flex-1"
                  >
                    <StepperTrigger className="items-start pb-8 last:pb-0 gap-4 group">
                      {/* Magic UI Glow Effect */}
                      <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-full blur opacity-0 group-data-[state=active]:opacity-100 transition duration-1000"></div>
                        
                        <StepperIndicator className="relative size-12 data-[state=completed]:bg-green-500 data-[state=completed]:text-white data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=inactive]:bg-neutral-700 data-[state=inactive]:text-gray-400 border-2 border-neutral-600 data-[state=active]:border-blue-400 data-[state=completed]:border-green-400">
                          <step.icon className="size-5" />
                        </StepperIndicator>
                      </div>
                      
                      <div className="mt-1 text-left max-w-sm">
                        <StepperTitle className="text-lg font-semibold mb-2 text-white group-data-[state=active]:text-blue-400 group-data-[state=completed]:text-green-400">
                          {step.title}
                        </StepperTitle>
                        <StepperDescription className="text-gray-300 leading-relaxed text-sm">
                          {step.description}
                        </StepperDescription>
                      </div>
                    </StepperTrigger>
                    
                    {index < steps.length - 1 && (
                      <StepperSeparator className="absolute top-12 left-6 -order-1 m-0 -translate-x-1/2 group-data-[orientation=vertical]/stepper-nav:h-16 group-data-[orientation=vertical]/stepper-nav:w-0.5 group-data-[state=completed]/step:bg-green-500 group-data-[state=active]/step:bg-blue-500 bg-neutral-700" />
                    )}
                  </StepperItem>
                </motion.div>
              ))}
            </StepperNav>
          </div>

          {/* Content Panel - Right side on desktop */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-32">
            <StepperPanel>
              {steps.map((step, index) => (
                <StepperContent key={step.step} value={step.step}>
                  <motion.div
                    className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-8 border border-neutral-700"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Step Visual/Icon */}
                    <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full border border-neutral-600">
                      <step.icon className="w-10 h-10 text-blue-400" />
                    </div>
                    
                    {/* Step Content */}
                    <div className="text-center">
                      <h3 className="text-2xl font-semibold mb-4 text-white">
                        Step {step.step}: {step.title}
                      </h3>
                      <p className="text-gray-300 text-lg leading-relaxed mb-6">
                        {step.description}
                      </p>
                      
                      {/* Progress indicator */}
                      <div className="flex items-center justify-center space-x-2">
                        {steps.map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                              i + 1 <= activeStep ? 'bg-blue-400' : 'bg-neutral-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </StepperContent>
              ))}
            </StepperPanel>
          </div>
        </Stepper>
      </div>
    </section>
  );
}