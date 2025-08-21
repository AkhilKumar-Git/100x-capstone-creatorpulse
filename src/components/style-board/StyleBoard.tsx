"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { StyleCard } from "./StyleCard";
import { StyleDialog } from "./StyleDialog";
import { WordCloud } from "./WordCloud";
import { ToneAnalysis } from "./ToneAnalysis";
import { VoiceDNA } from "./VoiceDNA";
import { extractVocabularyWithAI, analyzeTone, extractFormattingHabits, extractPhrasePatterns, type WordData, type ToneData, type PhrasePattern } from "@/lib/style/analysis";
import { shouldRefreshAnalysis, storeAnalysisData, getStoredAnalysisData, testDatabaseConnection } from "@/lib/style/database";
import { FileText, Plus, Brain, BarChart3 } from "lucide-react";
import { StyleSample } from "@/lib/database.types";
import {
  listStyleSamplesClient,
  embedAndCreateStyleSample,
  updateStyleSampleWithEmbedding,
  deleteStyleSampleClient,
} from "@/lib/style/client";
import { useAuth } from "@/contexts/AuthContext";
import { CustomButton } from "@/components/ui/custom-button";
import { toast } from "sonner";

export function StyleBoard() {
  const { user } = useAuth();
  const [styles, setStyles] = useState<StyleSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<StyleSample | null>(null);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  // State for cached analysis data
  const [cachedAnalysis, setCachedAnalysis] = useState<{
    vocabulary: WordData[];
    toneAnalysis: ToneData[];
    formattingHabits: string[];
  } | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Calculate metrics and analysis from actual style data or cache
  const analysisData = useMemo(() => {
    if (styles.length === 0) return null;
    
    // Calculate basic metrics
    const totalWords = styles.reduce((sum, style) => {
      const words = style.raw_text.split(/\s+/).length;
      return sum + words;
    }, 0);
    const avgWordCount = Math.round(totalWords / styles.length);
    
    // Calculate readability score (simplified Flesch-Kincaid)
    const avgSentenceLength = styles.reduce((sum, style) => {
      const sentences = style.raw_text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const avgWordsPerSentence = sentences.reduce((sSum, sentence) => {
        return sSum + sentence.split(/\s+/).filter(w => w.trim().length > 0).length;
      }, 0) / Math.max(sentences.length, 1);
      return sum + avgWordsPerSentence;
    }, 0) / styles.length;
    
    // Simplified readability calculation
    let readabilityScore = "Grade 9";
    if (avgSentenceLength <= 8) readabilityScore = "Grade 6";
    else if (avgSentenceLength <= 12) readabilityScore = "Grade 8";
    else if (avgSentenceLength <= 16) readabilityScore = "Grade 10";
    else readabilityScore = "Grade 12";
    
    // Use cached analysis if available, otherwise compute fresh
    let vocabulary: WordData[], toneAnalysis: ToneData[], formattingHabits: string[];
    
    if (cachedAnalysis) {
      vocabulary = cachedAnalysis.vocabulary;
      toneAnalysis = cachedAnalysis.toneAnalysis;
      formattingHabits = cachedAnalysis.formattingHabits;
    } else {
      // Use fallback analysis for immediate display, AI analysis will be loaded separately
      vocabulary = [];
      toneAnalysis = analyzeTone(styles);
      formattingHabits = extractFormattingHabits(styles);
    }
    
    return {
      avgWordCount,
      readabilityScore,
      styleCount: styles.length,
      vocabulary,
      toneAnalysis,
      formattingHabits
    };
  }, [styles, cachedAnalysis]);

  // Load styles on component mount
  useEffect(() => {
    if (user) {
      loadStyles();
    }
  }, [user]);

  const loadStyles = async () => {
    try {
      setLoading(true);
      const data = await listStyleSamplesClient();
      setStyles(data);
      setIsAnalyzed(data.length > 0);
      
      // Load cached analysis data if available
      if (data.length > 0) {
        await loadAnalysisData(data.length);
      }
    } catch (error) {
      console.error("Error loading styles:", error);
      toast.error("Failed to load styles");
    } finally {
      setLoading(false);
    }
  };

  const loadAnalysisData = async (currentSampleCount: number) => {
    try {
      setAnalysisLoading(true);
      
      // Test database connection first
      await testDatabaseConnection();
      
      // Always try to load cached data first
      const cachedData = await getStoredAnalysisData();
      if (cachedData) {
        console.log('Loaded cached analysis data');
        setCachedAnalysis(cachedData);
        return;
      }
      
      // Only check refresh if no cached data exists
      const needsRefresh = await shouldRefreshAnalysis(currentSampleCount);
      
      if (!needsRefresh) {
        console.log('Analysis is fresh, no refresh needed');
        return;
      }
      
      // If we reach here, we need fresh analysis
      console.log('Fresh analysis needed, will compute and store');
      setCachedAnalysis(null);
      
      // Load AI-powered vocabulary analysis
      await loadAIVocabularyAnalysis();
      
    } catch (error) {
      console.error("Error loading analysis data:", error);
      setCachedAnalysis(null);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Load AI-powered vocabulary analysis
  const loadAIVocabularyAnalysis = async () => {
    try {
      if (styles.length === 0) return;
      
      console.log('Loading AI-powered vocabulary analysis...');
      
      // Get AI vocabulary analysis
      const aiVocabulary = await extractVocabularyWithAI(styles);
      
      // Get other analysis data
      const toneAnalysis = analyzeTone(styles);
      const formattingHabits = extractFormattingHabits(styles);
      
      // Set cached analysis with AI results
      setCachedAnalysis({
        vocabulary: aiVocabulary,
        toneAnalysis,
        formattingHabits
      });
      
      console.log('AI vocabulary analysis loaded successfully:', aiVocabulary.length, 'items');
      
    } catch (error) {
      console.error('Error loading AI vocabulary analysis:', error);
      // Fallback to basic analysis
      const toneAnalysis = analyzeTone(styles);
      const formattingHabits = extractFormattingHabits(styles);
      
      setCachedAnalysis({
        vocabulary: [],
        toneAnalysis,
        formattingHabits
      });
    }
  };

  // Store fresh analysis only when new styles are added (not on every load)
  useEffect(() => {
    // Only store if we have analysis data, no cached data, and this is a new analysis
    if (analysisData && !cachedAnalysis && styles.length > 0) {
      const storeData = async () => {
        try {
          console.log('Attempting to store analysis data...');
          console.log('Vocabulary:', analysisData.vocabulary.length, 'words');
          console.log('Tone analysis:', analysisData.toneAnalysis.length, 'tones');
          console.log('Formatting habits:', analysisData.formattingHabits.length, 'habits');
          
          await storeAnalysisData(
            analysisData.vocabulary,
            analysisData.toneAnalysis,
            analysisData.formattingHabits,
            analysisData.styleCount
          );
          
          console.log('Analysis data stored successfully');
          // Set cached analysis to prevent re-storing
          setCachedAnalysis({
            vocabulary: analysisData.vocabulary,
            toneAnalysis: analysisData.toneAnalysis,
            formattingHabits: analysisData.formattingHabits
          });
        } catch (error) {
          console.error("Error storing analysis data:", error);
          // Show a toast notification but don't break the UI
          toast.error('Failed to save style analysis to database. Analysis will be computed fresh each time.');
          // Set cached analysis anyway so the UI still works
          setCachedAnalysis({
            vocabulary: analysisData.vocabulary,
            toneAnalysis: analysisData.toneAnalysis,
            formattingHabits: analysisData.formattingHabits
          });
        }
      };
      storeData();
    }
  }, [analysisData, cachedAnalysis, styles.length]);

  const handleAddStyle = () => {
    setDialogMode("add");
    setEditingStyle(null);
    setDialogOpen(true);
  };

  const handleEditStyle = (style: StyleSample) => {
    setDialogMode("edit");
    setEditingStyle(style);
    setDialogOpen(true);
  };

  const handleDeleteStyle = async (id: string) => {
    try {
      await deleteStyleSampleClient(id);
      setStyles(styles.filter(style => style.id !== id));
      setIsAnalyzed(styles.length > 1); // Check if we still have styles after deletion
      toast.success("Style deleted successfully");
    } catch (error) {
      console.error("Error deleting style:", error);
      toast.error("Failed to delete style");
    }
  };

  const handleSaveStyle = async (data: { content: string; platform: string }) => {
    try {
      if (dialogMode === "add") {
        const newStyle = await embedAndCreateStyleSample(data.content, data.platform);
        setStyles([newStyle, ...styles]);
        setIsAnalyzed(true);
        toast.success("Style added successfully");
        
        // Force refresh analysis when new style is added
        setCachedAnalysis(null);
        await loadAnalysisData(styles.length + 1);
      } else if (editingStyle) {
        const updatedStyle = await updateStyleSampleWithEmbedding(
          editingStyle.id,
          data.content,
          data.platform
        );
        setStyles(styles.map(style => 
          style.id === editingStyle.id ? updatedStyle : style
        ));
        toast.success("Style updated successfully");
        
        // Force refresh analysis when style is updated
        setCachedAnalysis(null);
        await loadAnalysisData(styles.length);
      }
    } catch (error) {
      console.error("Error saving style:", error);
      toast.error("Failed to save style");
    }
  };

  const handleRetrain = async () => {
    try {
      toast.info("Profile update initiated. This may take a few moments.");
      setCachedAnalysis(null); // Force fresh analysis
      await loadAnalysisData(styles.length);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error retraining profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleReset = async () => {
    try {
      // Clear all styles
      for (const style of styles) {
        await deleteStyleSampleClient(style.id);
      }
      setStyles([]);
      setIsAnalyzed(false);
      toast.success("Profile reset successfully");
    } catch (error) {
      console.error("Error resetting profile:", error);
      toast.error("Failed to reset profile");
    }
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

      {/* Style Samples Section - Main Content */}
      <motion.div
        className="mt-8 max-w-8xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="bg-[#1E1E1E] border border-neutral-800 rounded-xl p-6 min-h-[600px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <FileText className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Style Samples</h3>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {styles.length} samples
              </Badge>
            </div>
            <CustomButton
              onClick={handleAddStyle}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Style
            </CustomButton>
          </div>

          {/* Writing Patterns Summary - Moved to top */}
          {analysisData && analysisData.formattingHabits.length > 0 && (
            <motion.div
              className="mb-8 bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                Writing Patterns Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {analysisData.formattingHabits.map((habit: string, index: number) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-3 bg-neutral-700/30 rounded-md px-3 py-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.4 }}
                  >
                    <div className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <span className="text-gray-300 text-sm">{habit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-400">Loading styles...</span>
            </div>
          ) : styles.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-green-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">No style samples yet</h4>
              <p className="text-gray-400 text-sm mb-4">
                Add your first style sample to start building your AI voice profile
              </p>
              <CustomButton onClick={handleAddStyle} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Style
              </CustomButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {styles.map((style, index) => (
                <StyleCard
                  key={style.id}
                  style={style}
                  index={index}
                  onEdit={handleEditStyle}
                  onDelete={handleDeleteStyle}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Analysis Components */}
      <motion.div
        className="mt-8 max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {/* Word Cloud */}
        <motion.div
          className="lg:col-span-1 bg-[#1E1E1E] border border-neutral-800 rounded-xl min-h-[400px]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="h-full p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Brain className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Signature Vocabulary</h3>
              </div>
              {styles.length > 0 && (
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
            {styles.length > 0 && analysisData ? (
              <div className="flex-1 min-h-0">
                <WordCloud words={analysisData.vocabulary} />
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

        {/* Tone Analysis */}
        <motion.div
          className="lg:col-span-1 min-h-[400px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {styles.length > 0 && analysisData ? (
            <ToneAnalysis tones={analysisData.toneAnalysis} />
          ) : (
            <div className="h-full bg-[#1E1E1E] border border-neutral-800 rounded-xl p-6 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Tone & Personality Analysis</h3>
                <p className="text-gray-400 text-sm">
                  Add style samples to analyze your writing tone
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Voice DNA */}
        <motion.div
          className="lg:col-span-1 min-h-[400px]"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <VoiceDNA
            isAnalyzed={isAnalyzed}
            onRetrain={handleRetrain}
            onReset={handleReset}
            styleCount={analysisData?.styleCount || 0}
            averageWordCount={analysisData?.avgWordCount || 0}
            readabilityScore={analysisData?.readabilityScore || "Grade 9"}
            confidenceLevel={analysisData ? Math.min(85 + (analysisData.styleCount * 2), 98) : 0}
          />
        </motion.div>
      </motion.div>

      {/* Style Dialog */}
      <StyleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        style={editingStyle}
        onSave={handleSaveStyle}
        mode={dialogMode}
      />

    </div>
  );
}
