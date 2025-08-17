"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface ToneData {
  name: string;
  percentage: number;
  color: string;
  description: string;
}

interface ToneAnalysisProps {
  tones: ToneData[];
  className?: string;
}

export function ToneAnalysis({ tones, className = "" }: ToneAnalysisProps) {
  return (
    <div className={`h-full bg-[#1E1E1E] border border-neutral-800 rounded-xl p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Tone & Personality</h3>
        <p className="text-gray-400 text-sm">
          Your unique voice patterns across different emotional spectrums
        </p>
      </div>

      <div className="space-y-4">
        {tones.map((tone, index) => (
          <motion.div
            key={tone.name}
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-white font-medium text-sm">{tone.name}</span>
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  style={{ borderColor: tone.color, color: tone.color }}
                >
                  {tone.percentage}%
                </Badge>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="relative h-2 bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full rounded-full"
                style={{ backgroundColor: tone.color }}
                initial={{ width: 0 }}
                animate={{ width: `${tone.percentage}%` }}
                transition={{ duration: 1, delay: index * 0.1 + 0.3, ease: "easeOut" }}
              />
              {/* Glow effect */}
              <motion.div
                className="absolute top-0 left-0 h-full rounded-full opacity-50 blur-sm"
                style={{ backgroundColor: tone.color }}
                initial={{ width: 0 }}
                animate={{ width: `${tone.percentage}%` }}
                transition={{ duration: 1, delay: index * 0.1 + 0.3, ease: "easeOut" }}
              />
            </div>
            
            <p className="text-gray-500 text-xs leading-relaxed">
              {tone.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Formatting Habits Section */}
      <div className="mt-8 pt-6 border-t border-neutral-800">
        <h4 className="text-white font-medium mb-4">Formatting Habits</h4>
        <div className="space-y-2">
          {formattingHabits.map((habit, index) => (
            <motion.div
              key={index}
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 + 0.5 }}
            >
              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <span className="text-gray-300 text-sm">{habit}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Mock data for demonstration
export const mockToneData: ToneData[] = [
  {
    name: "Professional",
    percentage: 75,
    color: "#3B82F6",
    description: "Clear, authoritative communication with business focus"
  },
  {
    name: "Inspirational",
    percentage: 68,
    color: "#8B5CF6",
    description: "Motivational language that encourages and uplifts others"
  },
  {
    name: "Casual",
    percentage: 45,
    color: "#10B981",
    description: "Relaxed, conversational tone with personal touches"
  },
  {
    name: "Technical",
    percentage: 32,
    color: "#F59E0B",
    description: "Detailed explanations with industry-specific terminology"
  },
  {
    name: "Humorous",
    percentage: 28,
    color: "#EF4444",
    description: "Light-hearted content with witty observations"
  }
];

const formattingHabits = [
  "Prefers short, punchy paragraphs",
  "Frequently uses emojis for emphasis",
  "Often starts posts with a question",
  "Uses bullet points for clarity",
  "Includes call-to-action statements"
];
