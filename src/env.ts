import { z } from 'zod';

const serverSchema = z.object({
  // Supabase Auth
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY is required"),
  
  // Database (Direct connection often needed for migrations, though app uses HTTP)
  // DATABASE_URL: z.string().url().optional(),

  // AI Providers
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  PERPLEXITY_API_KEY: z.string().optional(), // Optional for now as we have fallbacks
  FIRECRAWL_API_KEY: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

// Validate Client-side variables immediately
// This ensures the app crashes early in the browser if misconfigured
try {
  clientSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Invalid client-side environment variables:", error.flatten().fieldErrors);
    throw new Error("Invalid client-side environment variables");
  }
}

// Validation function for server-side usage
export function validateEnv() {
  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

// Export a typed env object
export const env = validateEnv();
