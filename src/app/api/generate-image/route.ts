import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

const GenerateImageSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  platform: z.enum(['linkedin', 'instagram']),
  topic: z.string().optional(),
});

const platformImagePrompts = {
  linkedin: (content: string, topic: string) => 
    `Professional business image representing: ${topic || content}. 
    Style: Corporate, professional, clean, modern business aesthetic. 
    Aspect ratio: 16:9 (LinkedIn optimal). 
    Content: ${content.substring(0, 200)}...`,
  
  instagram: (content: string, topic: string) => 
    `Engaging social media image representing: ${topic || content}. 
    Style: Creative, vibrant, social media friendly, eye-catching. 
    Aspect ratio: 4:5 (Instagram optimal). 
    Content: ${content.substring(0, 200)}...`
};

export async function POST(request: NextRequest) {
  try {
    // 1) Auth - Get current user
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch {
              // The `set` method was called from a Server Component.
            }
          },
          remove(name: string, options: Record<string, unknown>) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch {
              // The `delete` method was called from a Server Component.
            }
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2) Parse and validate request body
    const body = await request.json();
    const validation = GenerateImageSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.message },
        { status: 400 }
      );
    }

    const { content, platform, topic } = validation.data;

    // 3) Generate image prompt based on platform
    const imagePrompt = platformImagePrompts[platform](content, topic || '');
    console.log(`🎨 Generating image for ${platform} with prompt:`, imagePrompt);

    // 4) Call Replicate API for image generation
    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
              body: JSON.stringify({
          version: "black-forest-labs/flux-schnell",
          input: {
            prompt: imagePrompt,
            aspect_ratio: platform === 'instagram' ? '4:5' : '16:9',
            num_frames: 1,
            num_inference_steps: 4,
            guidance_scale: 7.5,
            negative_prompt: "text, watermark, logo, low quality, blurry, distorted"
          }
        }),
    });

    if (!replicateResponse.ok) {
      const errorData = await replicateResponse.json();
      console.error('Replicate API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      );
    }

    const replicateData = await replicateResponse.json();
    console.log('🔄 Replicate prediction started:', replicateData);

    // 5) Poll for completion
    let imageUrl: string | null = null;
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes max (10 second intervals)

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      
      const statusResponse = await fetch(replicateData.urls.get, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });

      if (!statusResponse.ok) {
        console.error('Failed to check status:', await statusResponse.text());
        break;
      }

      const statusData = await statusResponse.json();
      console.log(`📊 Status check ${attempts + 1}:`, statusData.status);

      if (statusData.status === 'succeeded') {
        imageUrl = statusData.output[0];
        console.log('✅ Image generated successfully:', imageUrl);
        break;
      } else if (statusData.status === 'failed') {
        console.error('Image generation failed:', statusData.error);
        return NextResponse.json(
          { error: 'Image generation failed' },
          { status: 500 }
        );
      }

      attempts++;
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image generation timed out' },
        { status: 408 }
      );
    }

    // 6) Download and upload to Supabase storage
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error('Failed to download image from Replicate');
      return NextResponse.json(
        { error: 'Failed to download generated image' },
        { status: 500 }
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
    
    const uploadRes = await supabase.storage.from('generations').upload(filePath, imageBuffer, {
      contentType: 'image/webp',
      upsert: true
    });

    if (uploadRes.error) {
      console.error('Supabase upload failed:', uploadRes.error);
      return NextResponse.json(
        { error: 'Failed to upload image to storage' },
        { status: 500 }
      );
    }

    const { data } = supabase.storage.from('generations').getPublicUrl(filePath);
    const finalImageUrl = data.publicUrl;
    console.log('🖼️ Image uploaded to Supabase:', finalImageUrl);

    // 7) Return the image URL
    return NextResponse.json({
      ok: true,
      imageUrl: finalImageUrl,
      message: 'Image generated and uploaded successfully'
    });

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
