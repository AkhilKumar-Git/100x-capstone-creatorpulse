"use client";

import { motion } from "framer-motion";
import { FaqSection } from "@/components/ui/faq-section";

const faqItems = [
  {
    question: "Will this sound like me, or just another AI?",
    answer: "It sounds like you. We start by training the AI on at least 20 of your best-performing posts. Our feedback loop then fine-tunes the style with every draft you review, ensuring each one matches your unique voice, tone, and formatting."
  },
  {
    question: "How are the trends identified?",
    answer: "You control the sources. Our engine analyzes your selected Twitter handles, newsletters, and YouTube channels to detect engagement spikes, surfacing only the trends that truly matter to your niche."
  },
  {
    question: "How long does it take to get started?",
    answer: "Less than 30 minutes. Connect your platforms, upload your past content, and you'll start receiving AI-powered drafts the very next morning."
  },
  {
    question: "What if I don't like a draft?",
    answer: "Simple—tap 👎 and the system learns from your feedback. With usage-based billing, you only pay for drafts you accept."
  },
  {
    question: "Do I need to open the dashboard daily?",
    answer: "Nope! Drafts and trends arrive via Email or WhatsApp every morning. The dashboard is optional for reviewing analytics, sources, and preferences."
  }
];

export default function FAQ() {
  return (
    <motion.section
      id="faq"
      className="bg-neutral-900 text-white pt-8 md:pt-12 pb-16 md:pb-20"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-4xl px-6">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-semibold lg:text-5xl text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Everything you need to know before getting started
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqItems.map((item, index) => (
            <FaqItem
              key={index}
              question={item.question}
              answer={item.answer}
              index={index}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// Custom FAQ Item component with CreatorPulse styling
function FaqItem({ 
  question, 
  answer, 
  index 
}: { 
  question: string; 
  answer: string; 
  index: number; 
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group"
    >
      <div
        className={`
          rounded-xl border border-neutral-700/50 bg-neutral-800/30 backdrop-blur-sm
          transition-all duration-300 ease-in-out
          hover:border-neutral-600/50 hover:bg-neutral-800/50
          ${isOpen ? 'border-blue-500/30 bg-neutral-800/60' : ''}
        `}
        style={{
          boxShadow: isOpen 
            ? '0 0 20px rgba(59, 130, 246, 0.1)' 
            : 'none'
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none"
        >
          <h3 className={`
            text-lg font-medium transition-colors duration-200
            ${isOpen ? 'text-white' : 'text-gray-200 group-hover:text-white'}
          `}>
            {question}
          </h3>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={`
              flex-shrink-0 ml-4
              ${isOpen ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-300'}
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>
        
        <motion.div
          initial={false}
          animate={{
            height: isOpen ? "auto" : 0,
            opacity: isOpen ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="px-6 pb-6 pt-2">
            <p className="text-gray-300 leading-relaxed">
              {answer}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Fix React import
import * as React from "react";