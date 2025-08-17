"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { AnimatedButton } from "@/components/ui/animated-button";
import { cn } from "@/lib/utils";

export default function Hero() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
  ];

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const platformLogos = [
    { 
      name: "X (Twitter)", 
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ), 
      color: "text-white" 
    },
    { 
      name: "LinkedIn", 
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ), 
      color: "text-blue-400" 
    },
    { 
      name: "Instagram", 
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.017 0C8.396 0 7.989.016 6.756.072 5.526.131 4.74.333 4.077.63a5.885 5.885 0 0 0-2.126 1.384 5.868 5.868 0 0 0-1.384 2.126C.333 4.74.131 5.526.072 6.756.016 7.99 0 8.396 0 12.017c0 3.624.016 4.03.072 5.263.059 1.23.261 2.016.558 2.68a5.9 5.9 0 0 0 1.384 2.126 5.9 5.9 0 0 0 2.126 1.384c.665.296 1.45.499 2.68.558C7.99 23.984 8.396 24 12.017 24c3.624 0 4.03-.016 5.263-.072 1.23-.06 2.016-.262 2.68-.558a5.9 5.9 0 0 0 2.126-1.384 5.9 5.9 0 0 0 1.384-2.126c.296-.665.499-1.45.558-2.68.056-1.233.072-1.639.072-5.263 0-3.621-.016-4.027-.072-5.26-.06-1.23-.262-2.016-.558-2.68a5.9 5.9 0 0 0-1.384-2.126A5.9 5.9 0 0 0 19.96.63C19.295.333 18.509.131 17.28.072 16.046.016 15.64 0 12.017 0zm0 2.163c3.557 0 3.98.016 5.38.072 1.299.06 2.005.278 2.476.463.622.242 1.066.53 1.532.997.466.466.754.91.997 1.532.185.47.403 1.177.463 2.476.056 1.4.072 1.823.072 5.38 0 3.557-.016 3.98-.072 5.38-.06 1.299-.278 2.005-.463 2.476a4.125 4.125 0 0 1-.997 1.532 4.125 4.125 0 0 1-1.532.997c-.47.185-1.177.403-2.476.463-1.4.056-1.823.072-5.38.072-3.557 0-3.98-.016-5.38-.072-1.299-.06-2.005-.278-2.476-.463a4.125 4.125 0 0 1-1.532-.997 4.125 4.125 0 0 1-.997-1.532c-.185-.47-.403-1.177-.463-2.476-.056-1.4-.072-1.823-.072-5.38 0-3.557.016-3.98.072-5.38.06-1.299.278-2.005.463-2.476.242-.622.53-1.066.997-1.532a4.125 4.125 0 0 1 1.532-.997c.47-.185 1.177-.403 2.476-.463 1.4-.056 1.823-.072 5.38-.072zm0 3.679a6.155 6.155 0 1 0 0 12.31 6.155 6.155 0 1 0 0-12.31zm0 10.147a3.992 3.992 0 1 1 0-7.984 3.992 3.992 0 0 1 0 7.984zm7.846-10.405a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/>
        </svg>
      ), 
      color: "text-pink-400" 
    },
  ];

  return (
    <div className="relative min-h-screen bg-neutral-900 text-white overflow-hidden">
      {/* Animated Background */}
      <AnimatedGridPattern
        numSquares={60}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
        )}
      />

      {/* Sticky Header */}
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-800"
            : "bg-transparent"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <a href="/" className="text-xl md:text-2xl font-bold font-nothing-you">
                CreatorPulse
              </a>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.nav
              className="hidden md:flex items-center space-x-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="text-gray-300 hover:text-white transition-colors duration-200 font-medium cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
            </motion.nav>

            {/* Desktop CTA */}
            <motion.div
              className="hidden md:block"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <AnimatedButton size="sm">
                Try Now
              </AnimatedButton>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden border-t border-neutral-800 bg-neutral-900/95 backdrop-blur-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 py-6 space-y-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block text-gray-300 hover:text-white transition-colors duration-200 font-medium cursor-pointer"
                    onClick={(e) => {
                      handleSmoothScroll(e, link.href);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-4">
                  <AnimatedButton size="sm" className="w-full">
                    Try Now
                  </AnimatedButton>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Main Hero Section */}
      <main className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 font-bitcount-prop leading-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Inspire
            </span>
            <span className="text-white"> </span>
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Create
            </span>
            <span className="text-white"> </span>
            <span className="bg-gradient-to-r from-pink-400 via-red-400 to-orange-400 bg-clip-text text-transparent">
              Amplify
            </span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.div
            className="space-y-4 mb-8 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto tracking-wide"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <p>
              <strong className="text-white">Reduce ideation time to under 15 minutes.</strong> Get AI-powered content for Twitter/X, LinkedIn, and Instagram with trend insights and smart feedback tools.
            </p>
            <p className="text-gray-400">
              Your all-in-one AI co-pilot for creators and agencies.
            </p>
          </motion.div>

          {/* Platform Logos */}
          <motion.div
            className="flex items-center justify-center space-x-8 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {platformLogos.map((platform, index) => (
              <motion.div
                key={platform.name}
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-full bg-neutral-800/50 border border-neutral-700",
                  platform.color
                )}
                whileHover={{ scale: 1.1, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                {platform.icon}
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
              <AnimatedButton size="lg" className="relative">
                Try Now
              </AnimatedButton>
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.p
            className="mt-8 text-sm text-gray-500 tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            Trusted by 10,000+ creators • AI-powered insights • Cross-platform publishing
          </motion.p>
        </div>
      </main>
    </div>
  );
}