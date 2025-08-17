"use client";

import React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

interface FooterLink {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSection {
  label: string;
  links: FooterLink[];
}

const footerLinks: FooterSection[] = [
  {
    label: 'Product',
    links: [
      { title: 'Features', href: '#features' },
      { title: 'Pricing', href: '#pricing' },
      { title: 'Testimonials', href: '#testimonials' },
      { title: 'Integrations', href: '/' },
    ],
  },
  {
    label: 'Company',
    links: [
      { title: 'About Us', href: '/about' },
      { title: 'FAQs', href: '#faq' },
      { title: 'Privacy Policy', href: '/privacy' },
      { title: 'Terms of Service', href: '/terms' },
    ],
  },
  {
    label: 'Resources',
    links: [
      { title: 'Blog', href: '/blog' },
      { title: 'Changelog', href: '/changelog' },
      { title: 'Brand Assets', href: '/brand' },
      { title: 'Help Center', href: '/help' },
    ],
  },
  {
    label: 'Social Links',
    links: [
      { title: 'Twitter/X', href: 'https://twitter.com', icon: Twitter },
      { title: 'Instagram', href: 'https://instagram.com', icon: Instagram },
      { title: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
      { title: 'YouTube', href: 'https://youtube.com', icon: Youtube },
    ],
  },
];

export default function Footer() {
  return (
    <footer 
      id="footer"
      className="relative w-full bg-neutral-900 border-t border-neutral-800/50"
    >
      {/* Subtle gradient fade at top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-8">
          
          {/* Logo & Tagline Section */}
          <AnimatedContainer className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-3">
                CreatorPulse
              </h3>
              <p className="text-gray-300 text-base leading-relaxed max-w-md">
                Your AI co-pilot for effortless content creation.
              </p>
            </div>
          </AnimatedContainer>

          {/* Link Columns */}
          <div className="lg:col-span-3 grid grid-cols-2 gap-8 md:grid-cols-4">
            {footerLinks.map((section, index) => (
              <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
                <div>
                  <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
                    {section.label}
                  </h4>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.title}>
                        <a
                          href={link.href}
                          className={`
                            text-gray-300 hover:text-white transition-all duration-300
                            inline-flex items-center text-sm
                            ${section.label === 'Social Links' 
                              ? 'hover:text-blue-400 p-2 -m-2 rounded-lg hover:bg-blue-500/10' 
                              : 'hover:translate-x-1'
                            }
                          `}
                        >
                          {link.icon && (
                            <link.icon className="mr-2 size-4" />
                          )}
                          {link.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedContainer>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <AnimatedContainer delay={0.5}>
          <div className="mt-16 pt-8 border-t border-neutral-800/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-300 text-sm">
                © {new Date().getFullYear()} CreatorPulse. All rights reserved.
              </p>
              
              {/* Additional bottom links */}
              <div className="flex items-center gap-6 text-sm">
                <a 
                  href="/privacy" 
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Privacy
                </a>
                <a 
                  href="/terms" 
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Terms
                </a>
                <a 
                  href="/cookies" 
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </AnimatedContainer>
      </div>

      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/50 via-transparent to-transparent pointer-events-none" />
    </footer>
  );
}

// Animation helper component
type ViewAnimationProps = {
  delay?: number;
  className?: ComponentProps<typeof motion.div>['className'];
  children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: 'blur(2px)', translateY: 20, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}