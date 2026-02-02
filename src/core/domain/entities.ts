
export interface Trend {
  id?: string;
  topic: string;
  description: string;
  score: number;
  source: string;
  url?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ContentPiece {
  id?: string;
  platform: 'x' | 'linkedin' | 'instagram' | 'blog' | 'youtube';
  content: string;
  mediaUrls?: string[];
  styleId?: string;
}

export interface StyleProfile {
  id: string;
  userId: string;
  name: string;
  platform: string;
  vocabulary: { word: string; frequency: number }[];
  tone: { name: string; score: number }[];
  embedding?: number[]; 
}
