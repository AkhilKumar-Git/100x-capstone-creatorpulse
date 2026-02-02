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
  // Convert tone data to radar chart format
  // const chartData = tones.map(tone => ({
  //   tone: tone.name,
  //   value: tone.percentage,
  //   color: tone.color
  // }));

  return (
    <div className={`h-full bg-[#1E1E1E] border border-neutral-800 rounded-xl p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Tone & Personality</h3>
        <p className="text-gray-400 text-sm">
          Your unique voice patterns across different emotional spectrums
        </p>
      </div>

      {/* Tone Details */}
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


