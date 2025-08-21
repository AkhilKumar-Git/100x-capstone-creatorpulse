"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { sbClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function EmbeddingDemo() {
  const { user } = useAuth();
  const [sampleText, setSampleText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUploadSample = async () => {
    if (!user || !sampleText.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/style/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'x',
          lines: [sampleText.trim()]
        })
      });

      const data = await response.json();
      
      if (data.ok) {
        setResult(data);
        setSampleText('');
      } else {
        setError(data.reason || 'Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSimilarity = async () => {
    if (!user || !sampleText.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // This would call your similarity search function
      // For now, just show a demo message
      setResult({
        message: 'Similarity search demo',
        query: sampleText,
        explanation: 'This would find similar style samples from your uploaded content'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vector Embeddings Demo</CardTitle>
          <CardDescription>Please log in to test the embedding system</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧠 Vector Embeddings Demo</CardTitle>
          <CardDescription>
            Test how your text gets converted to AI-understandable vectors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Enter your style sample:</label>
            <Textarea
              placeholder="Paste your best social media post here..."
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleUploadSample} 
              disabled={isLoading || !sampleText.trim()}
            >
              {isLoading ? 'Processing...' : '📤 Upload & Embed'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleTestSimilarity}
              disabled={isLoading || !sampleText.trim()}
            >
              🔍 Test Similarity
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">❌ Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">✅ Success!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.count && (
              <div>
                <Badge variant="secondary" className="mb-2">
                  {result.count} samples processed
                </Badge>
                <p className="text-sm text-gray-600">{result.message}</p>
              </div>
            )}
            
            {result.explanation && (
              <div>
                <p className="text-sm font-medium">What happened:</p>
                <p className="text-sm text-gray-600">{result.explanation}</p>
              </div>
            )}
            
            {result.query && (
              <div>
                <p className="text-sm font-medium">Your text:</p>
                <p className="text-sm text-gray-600 italic">"{result.query}"</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>🔬 How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium">1. Text Input</h4>
            <p className="text-gray-600">You provide your best social media posts</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">2. Vector Conversion</h4>
            <p className="text-gray-600">
              OpenAI converts your text into 1536 numbers that represent meaning
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">3. Storage</h4>
            <p className="text-gray-600">
              Vectors stored in PostgreSQL with fast similarity search
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">4. Style Matching</h4>
            <p className="text-gray-600">
              When generating content, we find your most similar style examples
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
