"use client";

import { StyleSample } from "@/lib/database.types";

export interface WordData {
  text: string;
  frequency: number;
  category?: 'action' | 'emotion' | 'business' | 'casual' | 'technical';
}

export interface ToneData {
  name: string;
  percentage: number;
  color: string;
  description: string;
}

// Common business/professional words
const BUSINESS_WORDS = new Set([
  'business', 'strategy', 'growth', 'revenue', 'market', 'client', 'customer', 
  'solution', 'innovation', 'team', 'project', 'management', 'leadership', 
  'success', 'goal', 'objective', 'performance', 'results', 'analysis',
  'opportunity', 'investment', 'partnership', 'collaboration', 'network',
  'industry', 'company', 'organization', 'professional', 'corporate'
]);

// Action/verb words
const ACTION_WORDS = new Set([
  'create', 'build', 'develop', 'launch', 'grow', 'achieve', 'implement',
  'execute', 'deliver', 'optimize', 'improve', 'enhance', 'transform',
  'innovate', 'design', 'establish', 'generate', 'produce', 'scale',
  'drive', 'lead', 'manage', 'organize', 'plan', 'strategize'
]);

// Emotional/descriptive words
const EMOTION_WORDS = new Set([
  'amazing', 'awesome', 'incredible', 'fantastic', 'excellent', 'outstanding',
  'passionate', 'excited', 'proud', 'grateful', 'inspired', 'motivated',
  'thrilled', 'delighted', 'happy', 'love', 'enjoy', 'appreciate',
  'wonderful', 'brilliant', 'impressive', 'remarkable', 'extraordinary'
]);

// Casual/informal words
const CASUAL_WORDS = new Set([
  'hey', 'yeah', 'cool', 'awesome', 'nice', 'great', 'super', 'really',
  'pretty', 'quite', 'totally', 'definitely', 'absolutely', 'basically',
  'actually', 'honestly', 'seriously', 'literally', 'obviously'
]);

// Technical words
const TECHNICAL_WORDS = new Set([
  'algorithm', 'data', 'analytics', 'technology', 'digital', 'platform',
  'system', 'process', 'methodology', 'framework', 'infrastructure',
  'automation', 'integration', 'optimization', 'efficiency', 'metrics',
  'api', 'database', 'software', 'hardware', 'cloud', 'ai', 'ml'
]);

// Common names to filter out (basic list - can be expanded)
const COMMON_NAMES = new Set([
  'john', 'jane', 'mike', 'sarah', 'david', 'mary', 'james', 'jennifer',
  'robert', 'linda', 'michael', 'elizabeth', 'william', 'barbara',
  'richard', 'susan', 'joseph', 'jessica', 'thomas', 'karen', 'alex',
  'chris', 'sam', 'taylor', 'jordan', 'casey', 'morgan', 'jamie'
]);

// Common place names to filter out
const PLACE_NAMES = new Set([
  'america', 'europe', 'asia', 'africa', 'australia', 'canada', 'mexico',
  'france', 'germany', 'italy', 'spain', 'japan', 'china', 'india',
  'brazil', 'russia', 'london', 'paris', 'tokyo', 'york', 'angeles',
  'francisco', 'chicago', 'houston', 'phoenix', 'philadelphia',
  'antonio', 'diego', 'dallas', 'jose', 'austin', 'jacksonville',
  'columbus', 'charlotte', 'seattle', 'denver', 'boston', 'nashville'
]);

// Common animal names to filter out
const ANIMAL_NAMES = new Set([
  'dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'pig', 'chicken',
  'sheep', 'goat', 'rabbit', 'mouse', 'rat', 'hamster', 'guinea',
  'lion', 'tiger', 'bear', 'wolf', 'fox', 'deer', 'elephant',
  'giraffe', 'zebra', 'monkey', 'gorilla', 'chimpanzee', 'dolphin',
  'whale', 'shark', 'eagle', 'hawk', 'owl', 'parrot', 'snake',
  'lizard', 'turtle', 'frog', 'spider', 'butterfly', 'bee', 'ant'
]);

// Stop words and common words to filter out
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
  'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
  'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy',
  'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'this', 'that',
  'with', 'from', 'they', 'have', 'will', 'been', 'were', 'said', 'each',
  'which', 'their', 'what', 'there', 'would', 'could', 'should', 'about',
  'after', 'before', 'during', 'while', 'where', 'when', 'why', 'how',
  'then', 'than', 'them', 'these', 'those', 'through', 'between', 'into',
  'onto', 'upon', 'over', 'under', 'above', 'below', 'across', 'around',
  'behind', 'beside', 'beyond', 'inside', 'outside', 'within', 'without'
]);

function shouldFilterWord(word: string): boolean {
  const lowerWord = word.toLowerCase();
  
  // Filter out common names, places, animals, and stop words
  if (COMMON_NAMES.has(lowerWord)) return true;
  if (PLACE_NAMES.has(lowerWord)) return true;
  if (ANIMAL_NAMES.has(lowerWord)) return true;
  if (STOP_WORDS.has(lowerWord)) return true;
  
  // Filter out words that are likely proper nouns (start with capital letter in original)
  if (word !== lowerWord && word.length > 2) {
    // This is a capitalized word, likely a proper noun
    return true;
  }
  
  // Filter out very short words
  if (word.length < 3) return true;
  
  // Filter out numbers
  if (/^\d+$/.test(word)) return true;
  
  return false;
}

function categorizeWord(word: string): WordData['category'] {
  const lowerWord = word.toLowerCase();
  
  if (BUSINESS_WORDS.has(lowerWord)) return 'business';
  if (ACTION_WORDS.has(lowerWord)) return 'action';
  if (EMOTION_WORDS.has(lowerWord)) return 'emotion';
  if (CASUAL_WORDS.has(lowerWord)) return 'casual';
  if (TECHNICAL_WORDS.has(lowerWord)) return 'technical';
  
  // Default categorization based on word characteristics
  if (lowerWord.endsWith('ing') || lowerWord.endsWith('ed')) return 'action';
  if (lowerWord.includes('feel') || lowerWord.includes('love') || lowerWord.includes('hate')) return 'emotion';
  
  return 'business'; // Default category
}

export function extractVocabulary(styles: StyleSample[]): WordData[] {
  const wordCount = new Map<string, number>();
  
  // Combine all text content
  const allText = styles.map(style => style.raw_text).join(' ');
  
  // Extract words (preserve original case for proper noun detection)
  const words = allText
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.trim().length > 0)
    .filter(word => !shouldFilterWord(word)); // Apply comprehensive filtering
  
  // Count word frequencies (normalize to lowercase for counting)
  words.forEach(word => {
    const normalizedWord = word.toLowerCase();
    wordCount.set(normalizedWord, (wordCount.get(normalizedWord) || 0) + 1);
  });
  
  // Convert to WordData array and sort by frequency
  const vocabulary = Array.from(wordCount.entries())
    .map(([text, frequency]) => ({
      text,
      frequency,
      category: categorizeWord(text)
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 25); // Top 25 words
  
  return vocabulary;
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
  
  const allText = styles.map(style => style.raw_text.toLowerCase()).join(' ');
  const totalWords = allText.split(/\s+/).length;
  
  // Calculate professional tone (business words, formal language)
  const businessWords = Array.from(BUSINESS_WORDS).filter(word => allText.includes(word)).length;
  const professionalScore = Math.min((businessWords / totalWords) * 1000, 100);
  
  // Calculate inspirational tone (emotion words, motivational language)
  const emotionWords = Array.from(EMOTION_WORDS).filter(word => allText.includes(word)).length;
  const inspirationalScore = Math.min((emotionWords / totalWords) * 800, 100);
  
  // Calculate casual tone (informal words, contractions)
  const casualWords = Array.from(CASUAL_WORDS).filter(word => allText.includes(word)).length;
  const contractions = (allText.match(/\b\w+'\w+\b/g) || []).length;
  const casualScore = Math.min(((casualWords + contractions) / totalWords) * 600, 100);
  
  // Calculate technical tone (technical terms, complex sentences)
  const technicalWords = Array.from(TECHNICAL_WORDS).filter(word => allText.includes(word)).length;
  const technicalScore = Math.min((technicalWords / totalWords) * 1200, 100);
  
  // Calculate humorous tone (exclamation marks, certain words)
  const exclamations = (allText.match(/!/g) || []).length;
  const humorousWords = ['funny', 'hilarious', 'joke', 'laugh', 'lol', 'haha', 'witty'].filter(word => allText.includes(word)).length;
  const humorousScore = Math.min(((exclamations + humorousWords) / totalWords) * 400, 100);
  
  return [
    { 
      name: "Professional", 
      percentage: Math.round(Math.max(professionalScore, 15)), // Minimum 15% for realistic display
      color: "#3B82F6", 
      description: "Clear, authoritative communication with business focus" 
    },
    { 
      name: "Inspirational", 
      percentage: Math.round(Math.max(inspirationalScore, 10)), 
      color: "#8B5CF6", 
      description: "Motivational language that encourages and uplifts others" 
    },
    { 
      name: "Casual", 
      percentage: Math.round(Math.max(casualScore, 8)), 
      color: "#10B981", 
      description: "Relaxed, conversational tone with personal touches" 
    },
    { 
      name: "Technical", 
      percentage: Math.round(Math.max(technicalScore, 5)), 
      color: "#F59E0B", 
      description: "Detailed explanations with industry-specific terminology" 
    },
    { 
      name: "Humorous", 
      percentage: Math.round(Math.max(humorousScore, 3)), 
      color: "#EF4444", 
      description: "Light-hearted content with witty observations" 
    }
  ];
}

export function extractFormattingHabits(styles: StyleSample[]): string[] {
  if (styles.length === 0) return [];
  
  const allTexts = styles.map(style => style.raw_text);
  const habits: string[] = [];
  
  // Analyze paragraph length
  const avgParagraphLength = allTexts.reduce((sum, text) => {
    const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
    return sum + paragraphs.reduce((pSum, p) => pSum + p.length, 0) / paragraphs.length;
  }, 0) / allTexts.length;
  
  if (avgParagraphLength < 100) {
    habits.push("Prefers short, punchy paragraphs");
  } else if (avgParagraphLength > 200) {
    habits.push("Writes detailed, comprehensive paragraphs");
  }
  
  // Check for emoji usage
  const emojiCount = allTexts.reduce((count, text) => {
    return count + (text.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length;
  }, 0);
  
  if (emojiCount > 0) {
    habits.push("Frequently uses emojis for emphasis");
  }
  
  // Check for questions
  const questionCount = allTexts.reduce((count, text) => {
    return count + (text.match(/\?/g) || []).length;
  }, 0);
  
  if (questionCount > styles.length * 0.3) {
    habits.push("Often starts posts with a question");
  }
  
  // Check for bullet points or lists
  const listCount = allTexts.reduce((count, text) => {
    return count + (text.match(/^[-•*]\s/gm) || []).length;
  }, 0);
  
  if (listCount > 0) {
    habits.push("Uses bullet points for clarity");
  }
  
  // Check for call-to-action patterns
  const ctaWords = ['check out', 'learn more', 'read more', 'click here', 'sign up', 'join', 'follow', 'share'];
  const ctaCount = allTexts.reduce((count, text) => {
    return count + ctaWords.filter(cta => text.toLowerCase().includes(cta)).length;
  }, 0);
  
  if (ctaCount > 0) {
    habits.push("Includes call-to-action statements");
  }
  
  // Default habits if none detected
  if (habits.length === 0) {
    habits.push("Maintains consistent writing style", "Uses clear and direct communication");
  }
  
  return habits.slice(0, 5); // Limit to 5 habits
}
