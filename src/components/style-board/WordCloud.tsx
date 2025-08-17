"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface WordData {
  text: string;
  frequency: number;
  category?: 'action' | 'emotion' | 'business' | 'casual' | 'technical';
}

interface WordCloudProps {
  words: WordData[];
  className?: string;
}

export function WordCloud({ words, className = "" }: WordCloudProps) {
  const sortedWords = useMemo(() => {
    return words
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 30); // Limit to top 30 words
  }, [words]);

  const getWordSize = (frequency: number, maxFreq: number) => {
    const minSize = 0.75;
    const maxSize = 2.5;
    const ratio = frequency / maxFreq;
    return minSize + (maxSize - minSize) * ratio;
  };

  const getWordColor = (category?: string) => {
    switch (category) {
      case 'action':
        return 'text-purple-400';
      case 'emotion':
        return 'text-pink-400';
      case 'business':
        return 'text-blue-400';
      case 'casual':
        return 'text-green-400';
      case 'technical':
        return 'text-orange-400';
      default:
        return 'text-gray-300';
    }
  };

  const maxFrequency = Math.max(...sortedWords.map(w => w.frequency));

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/50 to-neutral-800/30 rounded-lg" />
      
      {/* Word cloud */}
      <div className="relative z-10 p-4 flex flex-wrap items-center justify-center gap-2 min-h-[200px] max-h-[300px] overflow-y-auto">
        {sortedWords.slice(0, 20).map((word, index) => {
          const fontSize = getWordSize(word.frequency, maxFrequency);
          const colorClass = getWordColor(word.category);
          
          return (
            <motion.span
              key={`${word.text}-${index}`}
              className={`font-semibold cursor-pointer transition-all duration-200 hover:scale-110 ${colorClass}`}
              style={{ 
                fontSize: `${Math.min(fontSize, 1.8)}rem`, // Cap the max size
                lineHeight: 1.2,
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.03, // Faster animation
                ease: "easeOut"
              }}
              whileHover={{
                scale: 1.1,
                transition: { duration: 0.2 }
              }}
              title={`Used ${word.frequency} times`}
            >
              {word.text}
            </motion.span>
          );
        })}
      </div>

      {/* Legend */}
      <div className="relative p-2 border-t border-neutral-800/50">
        <div className="flex flex-wrap gap-2 text-xs justify-center">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-gray-400">Action</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
            <span className="text-gray-400">Emotion</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-gray-400">Business</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-gray-400">Casual</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock data for demonstration
export const mockWordData: WordData[] = [
  { text: "create", frequency: 45, category: 'action' },
  { text: "amazing", frequency: 38, category: 'emotion' },
  { text: "business", frequency: 42, category: 'business' },
  { text: "love", frequency: 35, category: 'emotion' },
  { text: "build", frequency: 40, category: 'action' },
  { text: "awesome", frequency: 33, category: 'emotion' },
  { text: "strategy", frequency: 37, category: 'business' },
  { text: "grow", frequency: 39, category: 'action' },
  { text: "excited", frequency: 31, category: 'emotion' },
  { text: "launch", frequency: 34, category: 'action' },
  { text: "startup", frequency: 36, category: 'business' },
  { text: "innovative", frequency: 28, category: 'business' },
  { text: "team", frequency: 32, category: 'business' },
  { text: "journey", frequency: 29, category: 'emotion' },
  { text: "success", frequency: 41, category: 'business' },
  { text: "passionate", frequency: 27, category: 'emotion' },
  { text: "solution", frequency: 30, category: 'business' },
  { text: "impact", frequency: 35, category: 'business' },
  { text: "proud", frequency: 26, category: 'emotion' },
  { text: "develop", frequency: 33, category: 'action' },
  { text: "community", frequency: 25, category: 'casual' },
  { text: "inspire", frequency: 24, category: 'emotion' },
  { text: "incredible", frequency: 23, category: 'emotion' },
  { text: "transform", frequency: 28, category: 'action' },
  { text: "grateful", frequency: 22, category: 'emotion' },
  { text: "vision", frequency: 27, category: 'business' },
  { text: "powerful", frequency: 21, category: 'emotion' },
  { text: "network", frequency: 20, category: 'business' },
  { text: "achieve", frequency: 26, category: 'action' },
  { text: "collaboration", frequency: 19, category: 'business' },
];
