"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface WordData {
  text: string;
  frequency: number;
  category?: 'action' | 'emotion' | 'business' | 'casual' | 'technical' | 'pattern' | 'phrase';
}

interface WordCloudProps {
  words: WordData[];
  className?: string;
}

export function WordCloud({ words, className = "" }: WordCloudProps) {
  const sortedWords = useMemo(() => {
    return words
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20); // Limit to top 20 words for better layout
  }, [words]);

  const getWordSize = (frequency: number, maxFreq: number) => {
    const minSize = 0.6;
    const maxSize = 1.4;
    const ratio = frequency / maxFreq;
    return minSize + (maxSize - minSize) * ratio;
  };

  const getWordColor = (category?: string) => {
    switch (category) {
      case 'action':
        return 'from-purple-300 to-purple-500';
      case 'emotion':
        return 'from-pink-300 to-pink-500';
      case 'business':
        return 'from-blue-300 to-blue-500';
      case 'casual':
        return 'from-green-300 to-green-500';
      case 'technical':
        return 'from-orange-300 to-orange-500';
      case 'pattern':
        return 'from-indigo-300 to-indigo-500';
      case 'phrase':
        return 'from-cyan-300 to-cyan-500';
      default:
        return 'from-gray-300 to-gray-500';
    }
  };

  const getWordBorderColor = () => {
    return 'border-neutral-800/60'; // Uniform elegant black border
  };

  const maxFrequency = Math.max(...sortedWords.map(w => w.frequency));

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/50 to-neutral-800/30 rounded-lg" />
      
      {/* Word cloud */}
      <div className="relative z-10 p-4 flex flex-wrap items-center justify-center gap-3 min-h-[180px] max-h-[250px] overflow-y-auto">
        {sortedWords.map((word, index) => {
          const fontSize = getWordSize(word.frequency, maxFrequency);
          const colorClass = getWordColor(word.category);
          const borderClass = getWordBorderColor();
          
          return (
            <motion.div
              key={`${word.text}-${index}`}
              className={`relative px-2.5 py-1.5 rounded-full cursor-pointer transition-all duration-300 hover:scale-105 ${borderClass} border-2 bg-gradient-to-r ${colorClass} shadow-sm hover:shadow-md`}
              style={{ 
                fontSize: `${Math.min(fontSize, 1.1)}rem`,
                lineHeight: 1.1,
              }}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.05,
                ease: "easeOut"
              }}
              whileHover={{
                scale: 1.06,
                y: -1,
                transition: { duration: 0.2 }
              }}
              title={`Used ${word.frequency} times`}
            >
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-60 transition-opacity duration-300" />
              
              {/* Text with subtle shadow */}
              <span className="relative z-10 text-white font-medium drop-shadow-sm">
                {word.text}
              </span>
              
              {/* Subtle inner highlight for depth */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/5 to-transparent opacity-30" />
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="relative p-3 border-t border-neutral-800/50">
        <div className="flex flex-wrap gap-3 text-xs justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 bg-gradient-to-r from-purple-300 to-purple-500 rounded-full border border-neutral-800/60"></div>
            <span className="text-gray-400 text-xs">Action</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 bg-gradient-to-r from-pink-300 to-pink-500 rounded-full border border-neutral-800/60"></div>
            <span className="text-gray-400 text-xs">Emotion</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full border border-neutral-800/60"></div>
            <span className="text-gray-400 text-xs">Business</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 bg-gradient-to-r from-green-300 to-green-500 rounded-full border border-neutral-800/60"></div>
            <span className="text-gray-400 text-xs">Casual</span>
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
