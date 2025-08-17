"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BentoGrid } from "@/components/ui/bento-grid";
import { Badge } from "@/components/ui/badge";
import { ContentUploader } from "./ContentUploader";
import { WordCloud, mockWordData } from "./WordCloud";
import { ToneAnalysis, mockToneData } from "./ToneAnalysis";
import { VoiceDNA } from "./VoiceDNA";
import { Upload, Brain, BarChart3, FileText } from "lucide-react";

export function StyleBoard() {
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async (files: File[], textContent: string) => {
    setIsAnalyzing(true);
    
    // Simulate analysis process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsAnalyzing(false);
    setIsAnalyzed(true);
  };

  const handleRetrain = () => {
    // Reset to uploader state for retraining
    setIsAnalyzed(false);
  };

  const handleReset = () => {
    setIsAnalyzed(false);
  };

  return (
    <div className="min-h-screen bg-neutral-900 p-6">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
          Your AI's Voice, Perfected by You
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Upload your best-performing content to create a unique Style Profile. 
          The more content you provide, the more the AI-generated drafts will sound exactly like you.
        </p>
      </motion.div>

      {/* Bento Grid Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <BentoGrid className="lg:grid-rows-3 max-w-7xl mx-auto">
          {/* Main Uploader - Large (2x2) */}
          <motion.div
            className="lg:row-start-1 lg:row-end-3 lg:col-start-1 lg:col-end-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <ContentUploader 
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              isAnalyzed={isAnalyzed}
              onRetrain={handleRetrain}
            />
          </motion.div>

          {/* Word Cloud - Tall (1x2) */}
          <motion.div
            className="lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-3 bg-[#1E1E1E] border border-neutral-800 rounded-xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="h-full p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Brain className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Signature Vocabulary</h3>
                </div>
                {isAnalyzed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Active
                    </Badge>
                  </motion.div>
                )}
              </div>
              {isAnalyzed ? (
                <div className="flex-1 min-h-0">
                  <WordCloud words={mockWordData} />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="h-8 w-8 text-purple-400" />
                    </div>
                    <p className="text-gray-400 text-sm">
                      Your most-used words will appear here
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Tone Analysis - Wide (2x1) */}
          <motion.div
            className="lg:col-start-1 lg:col-end-3 lg:row-start-3 lg:row-end-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            data-tone-analysis
          >
            {isAnalyzed ? (
              <ToneAnalysis tones={mockToneData} />
            ) : (
              <div className="h-full bg-[#1E1E1E] border border-neutral-800 rounded-xl p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Tone & Personality Analysis</h3>
                  <p className="text-gray-400 text-sm">
                    Upload content to analyze your writing style
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Voice DNA Metrics - Small (1x1) */}
          <motion.div
            className="lg:col-start-3 lg:col-end-4 lg:row-start-3 lg:row-end-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <VoiceDNA
              isAnalyzed={isAnalyzed}
              onRetrain={handleRetrain}
              onReset={handleReset}
            />
          </motion.div>
        </BentoGrid>
      </motion.div>

      {/* Loading Overlay */}
      {isAnalyzing && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[#1E1E1E] border border-neutral-700 rounded-xl p-8 text-center max-w-md mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-white text-xl font-semibold mb-2">
              Analyzing Your Style...
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Our AI is processing your content to understand your unique voice, 
              tone patterns, and writing habits. This usually takes a few moments.
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
