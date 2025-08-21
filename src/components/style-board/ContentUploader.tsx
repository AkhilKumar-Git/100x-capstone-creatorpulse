"use client";

import { useState, useCallback } from "react";
import { Upload, File, X, CheckCircle, BarChart3, Brain, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface ContentUploaderProps {
  onAnalyze: (files: File[], textContent: string) => void;
  isAnalyzing: boolean;
  isAnalyzed?: boolean;
  onRetrain?: () => void;
}

export function ContentUploader({ onAnalyze, isAnalyzing, isAnalyzed = false, onRetrain }: ContentUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [textContent, setTextContent] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'text/plain' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = () => {
    onAnalyze(uploadedFiles, textContent);
  };

  const canAnalyze = uploadedFiles.length > 0 || textContent.trim().length > 0;

  // Show analysis results view if analyzed
  if (isAnalyzed) {
    return (
      <Card className="h-full bg-gradient-to-br from-green-500/10 to-purple-500/10 border-green-500/30">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <CardTitle className="text-white text-xl">Style Analysis Complete!</CardTitle>
              <p className="text-green-400 text-sm font-medium">
                Your AI writing assistant is now calibrated
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Analysis Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-800/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <File className="h-5 w-5 text-purple-400" />
              </div>
              <p className="text-white font-semibold text-lg">247</p>
              <p className="text-gray-400 text-sm">Posts Analyzed</p>
            </div>
            <div className="bg-neutral-800/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
              </div>
              <p className="text-white font-semibold text-lg">156</p>
              <p className="text-gray-400 text-sm">Avg. Words</p>
            </div>
          </div>

          {/* Key Insights */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">Key Insights Discovered:</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 bg-neutral-800/30 rounded-lg p-3">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="text-gray-300 text-sm">75% Professional tone with business focus</span>
              </div>
              <div className="flex items-center space-x-3 bg-neutral-800/30 rounded-lg p-3">
                <Brain className="h-4 w-4 text-pink-400" />
                <span className="text-gray-300 text-sm">Strong vocabulary in innovation & strategy</span>
              </div>
              <div className="flex items-center space-x-3 bg-neutral-800/30 rounded-lg p-3">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-gray-300 text-sm">Grade 9 readability for broad appeal</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <GradientButton
              onClick={onRetrain}
              
              className="flex-1 border-neutral-600 text-white hover:bg-neutral-800"
            >
              Add More Content
            </GradientButton>
            <GradientButton 
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              onClick={() => {
                // Scroll to the results section
                const toneSectionElement = document.querySelector('[data-tone-analysis]');
                if (toneSectionElement) {
                  toneSectionElement.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              View Full Analysis
            </GradientButton>
          </div>

          {/* Success Message */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-400 text-sm text-center">
              🎉 Your personalized writing style is now active! Scroll down to explore detailed insights.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-[#1E1E1E] border-neutral-800">
      <CardHeader>
        <CardTitle className="text-white text-xl">Upload Your Best Content</CardTitle>
        <p className="text-gray-400 text-sm">
          For best results, upload a PDF or paste the text of at least 20 of your top-performing posts.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Uploader */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? "border-purple-500 bg-purple-500/10"
              : "border-neutral-600 hover:border-neutral-500"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-white font-medium mb-2">
            Drop your files here or click to browse
          </p>
          <p className="text-gray-400 text-sm mb-4">
            Supports PDF, TXT, and DOCX files
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,.txt,.docx"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-white font-medium text-sm">Uploaded Files:</p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-neutral-800/50 rounded-lg p-3"
                >
                  <div className="flex items-center space-x-3">
                    <File className="h-4 w-4 text-purple-400" />
                    <span className="text-white text-sm">{file.name}</span>
                    <Badge  className="text-xs">
                      {(file.size / 1024).toFixed(1)} KB
                    </Badge>
                  </div>
                  <GradientButton
                    
                    
                    onClick={() => removeFile(index)}
                    className="h-6 w-6 p-0 hover:bg-red-500/20"
                  >
                    <X className="h-3 w-3" />
                  </GradientButton>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Text Input Alternative */}
        <div className="space-y-3">
          <p className="text-white font-medium text-sm">
            Or paste your content directly:
          </p>
          <Textarea
            placeholder="Paste your best-performing posts here... (at least 500 words recommended)"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            className="min-h-24 bg-neutral-800/50 border-neutral-700 text-white placeholder:text-gray-500 resize-none"
            rows={4}
          />
          <p className="text-gray-500 text-xs">
            {textContent.length} characters
          </p>
        </div>

        {/* Analyze Button */}
        <GradientButton
          onClick={handleAnalyze}
          disabled={!canAnalyze || isAnalyzing}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3"
        >
          {isAnalyzing ? (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Your Style...</span>
            </div>
          ) : (
            "Analyze & Build Style Profile"
          )}
        </GradientButton>
      </CardContent>
    </Card>
  );
}
