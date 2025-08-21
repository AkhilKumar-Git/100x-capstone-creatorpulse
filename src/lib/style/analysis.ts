"use client";

import { StyleSample } from "@/lib/database.types";

export interface WordData {
  text: string;
  frequency: number;
  category?: 'action' | 'emotion' | 'business' | 'casual' | 'technical' | 'pattern' | 'phrase';
  confidence?: number;
  context?: string;
}

export interface ToneData {
  name: string;
  percentage: number;
  color: string;
  description: string;
}

export interface PhrasePattern {
  text: string;
  type: 'idiom' | 'collocation' | 'transition' | 'emphasis' | 'question' | 'statement';
  frequency: number;
  context: string;
}

// OpenAI-powered vocabulary extraction
export async function extractVocabularyWithAI(styles: StyleSample[]): Promise<WordData[]> {
  try {
    // Combine all text content
    const allText = styles.map(style => style.raw_text).join(' ');
    
    if (!allText.trim()) {
      return [];
    }

    // Call OpenAI API for intelligent vocabulary analysis
    const response = await fetch('/api/ai/analyze-vocabulary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: allText,
        styleCount: styles.length,
        focusAreas: ['phrases', 'patterns', 'collocations', 'transitions', 'emphasis']
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    return result.vocabulary || [];
    
  } catch (error) {
    console.error('OpenAI vocabulary analysis failed, falling back to rule-based:', error);
    // Fallback to rule-based extraction
    return extractVocabularyFallback(styles);
  }
}

// Fallback rule-based extraction (simplified)
function extractVocabularyFallback(styles: StyleSample[]): WordData[] {
  const wordCount = new Map<string, number>();
  
  // Combine all text content
  const allText = styles.map(style => style.raw_text).join(' ');
  
  // Extract words and basic phrases
  const words = allText
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.trim().length > 0)
    .filter(word => !isBasicStopWord(word.toLowerCase()));
  
  // Count word frequencies
  words.forEach(word => {
    const normalizedWord = word.toLowerCase();
    wordCount.set(normalizedWord, (wordCount.get(normalizedWord) || 0) + 1);
  });
  
  // Convert to WordData array
  const vocabulary = Array.from(wordCount.entries())
    .map(([text, frequency]) => ({
      text,
      frequency,
      category: 'business' as const,
      confidence: 0.5
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20);
  
  return vocabulary;
}

// Simple stop word filter for fallback
function isBasicStopWord(word: string): boolean {
  const basicStopWords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
    'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
    'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy',
    'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'this', 'that'
  ]);
  
  return basicStopWords.has(word) || word.length < 3;
}

// Enhanced phrase pattern extraction
export function extractPhrasePatterns(styles: StyleSample[]): PhrasePattern[] {
  const patterns: PhrasePattern[] = [];
  
  styles.forEach(style => {
    const text = style.raw_text;
    
    // Extract common patterns
    const idioms = extractIdioms(text);
    const collocations = extractCollocations(text);
    const transitions = extractTransitions(text);
    const emphasis = extractEmphasis(text);
    
    patterns.push(...idioms, ...collocations, ...transitions, ...emphasis);
  });
  
  // Aggregate and sort by frequency
  const patternCount = new Map<string, PhrasePattern>();
  
  patterns.forEach(pattern => {
    const key = pattern.text.toLowerCase();
    if (patternCount.has(key)) {
      patternCount.get(key)!.frequency += pattern.frequency;
    } else {
      patternCount.set(key, { ...pattern });
    }
  });
  
  return Array.from(patternCount.values())
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 15);
}

// Extract idiomatic expressions
function extractIdioms(text: string): PhrasePattern[] {
  const idioms = [
    'game changer', 'next level', 'on point', 'spot on', 'hit the nail on the head',
    'think outside the box', 'break the mold', 'raise the bar', 'set the tone',
    'take it to the next level', 'bring your A game', 'crush it', 'nail it',
    'rock it', 'kill it', 'smash it', 'ace it', 'knock it out of the park'
  ];
  
  return idioms
    .filter(idiom => text.toLowerCase().includes(idiom))
    .map(idiom => ({
      text: idiom,
      type: 'idiom' as const,
      frequency: 1,
      context: 'Common idiomatic expressions'
    }));
}

// Extract word collocations (words that commonly go together)
function extractCollocations(text: string): PhrasePattern[] {
  const collocations = [
    'high impact', 'deep dive', 'quick win', 'big picture', 'real time',
    'hands on', 'cutting edge', 'state of the art', 'best practice',
    'key insight', 'core value', 'strategic thinking', 'creative solution',
    'innovative approach', 'transformative change', 'breakthrough moment'
  ];
  
  return collocations
    .filter(collocation => text.toLowerCase().includes(collocation))
    .map(collocation => ({
      text: collocation,
      type: 'collocation' as const,
      frequency: 1,
      context: 'Common word combinations'
    }));
}

// Extract transition phrases
function extractTransitions(text: string): PhrasePattern[] {
  const transitions = [
    'on the other hand', 'in addition', 'furthermore', 'moreover',
    'however', 'nevertheless', 'despite this', 'in contrast',
    'as a result', 'therefore', 'consequently', 'for this reason',
    'to illustrate', 'for example', 'specifically', 'in particular'
  ];
  
  return transitions
    .filter(transition => text.toLowerCase().includes(transition))
    .map(transition => ({
      text: transition,
      type: 'transition' as const,
      frequency: 1,
      context: 'Transitional phrases'
    }));
}

// Extract emphasis patterns
function extractEmphasis(text: string): PhrasePattern[] {
  const emphasis = [
    'absolutely', 'definitely', 'certainly', 'without a doubt',
    'clearly', 'obviously', 'evidently', 'undoubtedly',
    'remarkably', 'notably', 'significantly', 'substantially',
    'dramatically', 'exponentially', 'radically', 'fundamentally'
  ];
  
  return emphasis
    .filter(emph => text.toLowerCase().includes(emph))
    .map(emph => ({
      text: emph,
      type: 'emphasis' as const,
      frequency: 1,
      context: 'Emphasis words'
    }));
}

// Legacy function for backward compatibility
export function extractVocabulary(styles: StyleSample[]): WordData[] {
  return extractVocabularyFallback(styles);
}

export function analyzeTone(styles: StyleSample[]): ToneData[] {
  if (styles.length === 0) {
    return [
      { name: "Professional", percentage: 0, color: "#3B82F6", description: "Clear, authoritative communication with business focus" },
      { name: "Inspirational", percentage: 0, color: "#8B5CF6", description: "Motivational language that encourages and uplifts others" },
      { name: "Casual", percentage: 0, color: "#10B981", description: "Relaxed, conversational tone with personal touches" },
      { name: "Technical", percentage: 0, color: "#F59E0B", description: "Detailed explanations with industry-specific terminology" },
      { name: "Humorous", percentage: 0, color: "#EF4444", description: "Light-hearted content with witty observations" }
    ];
  }

  // Analyze tone based on content patterns
  const allText = styles.map(style => style.raw_text).join(' ').toLowerCase();
  
  let professional = 0, inspirational = 0, casual = 0, technical = 0, humorous = 0;
  
  // Professional indicators
  if (allText.includes('strategy') || allText.includes('business') || allText.includes('professional')) professional += 20;
  if (allText.includes('analysis') || allText.includes('research') || allText.includes('data')) professional += 15;
  
  // Inspirational indicators
  if (allText.includes('inspire') || allText.includes('motivate') || allText.includes('empower')) inspirational += 25;
  if (allText.includes('dream') || allText.includes('vision') || allText.includes('purpose')) inspirational += 20;
  
  // Casual indicators
  if (allText.includes('hey') || allText.includes('cool') || allText.includes('awesome')) casual += 20;
  if (allText.includes('you know') || allText.includes('basically') || allText.includes('actually')) casual += 15;
  
  // Technical indicators
  if (allText.includes('algorithm') || allText.includes('api') || allText.includes('framework')) technical += 25;
  if (allText.includes('integration') || allText.includes('optimization') || allText.includes('methodology')) technical += 20;
  
  // Humorous indicators
  if (allText.includes('funny') || allText.includes('hilarious') || allText.includes('joke')) humorous += 25;
  if (allText.includes('lol') || allText.includes('haha') || allText.includes('witty')) humorous += 20;
  
  // Normalize percentages
  const total = professional + inspirational + casual + technical + humorous;
  const normalize = (score: number) => Math.round((score / Math.max(total, 1)) * 100);
  
  return [
    { name: "Professional", percentage: normalize(professional), color: "#3B82F6", description: "Clear, authoritative communication with business focus" },
    { name: "Inspirational", percentage: normalize(inspirational), color: "#8B5CF6", description: "Motivational language that encourages and uplifts others" },
    { name: "Casual", percentage: normalize(casual), color: "#10B981", description: "Relaxed, conversational tone with personal touches" },
    { name: "Technical", percentage: normalize(technical), color: "#F59E0B", description: "Detailed explanations with industry-specific terminology" },
    { name: "Humorous", percentage: normalize(humorous), color: "#EF4444", description: "Light-hearted content with witty observations" }
  ];
}

export function extractFormattingHabits(styles: StyleSample[]): string[] {
  const habits: string[] = [];
  
  styles.forEach(style => {
    const text = style.raw_text;
    
    // Check for common formatting patterns
    if (text.includes('**') || text.includes('__')) {
      habits.push('Uses bold/emphasis formatting');
    }
    
    if (text.includes('- ') || text.includes('• ')) {
      habits.push('Uses bullet points and lists');
    }
    
    if (text.includes('?') && text.split('?').length > 2) {
      habits.push('Frequently asks questions');
    }
    
    if (text.includes('!') && text.split('!').length > 2) {
      habits.push('Uses exclamation marks for emphasis');
    }
    
    if (text.includes('...') || text.includes('…')) {
      habits.push('Uses ellipsis for dramatic effect');
    }
    
    if (text.includes('"') && text.split('"').length > 2) {
      habits.push('Uses quotes and citations');
    }
    
    if (text.includes('@') || text.includes('#')) {
      habits.push('Uses mentions and hashtags');
    }
    
    if (text.includes('→') || text.includes('->') || text.includes('→')) {
      habits.push('Uses arrows and directional indicators');
    }
  });
  
  // Remove duplicates and return unique habits
  return [...new Set(habits)];
}
