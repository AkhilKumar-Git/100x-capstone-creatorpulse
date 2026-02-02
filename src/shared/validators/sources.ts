import { z } from 'zod';

// Source type enum
export const SourceType = z.enum(['x', 'youtube', 'rss', 'blog']);

// Base source input schema
const BaseSourceInput = z.object({
  type: SourceType,
  handle: z.string().optional(),
  url: z.string().url().optional(),
});

// X (Twitter) source validation
const XSourceInput = BaseSourceInput.extend({
  type: z.literal('x'),
  handle: z.string()
    .min(1, 'X handle is required')
    .max(15, 'X handle must be 15 characters or less')
    .regex(/^[a-zA-Z0-9_]+$/, 'X handle can only contain letters, numbers, and underscores')
    .transform(val => val.toLowerCase()),
  url: z.never().optional(), // X sources don't use URLs
});

// YouTube source validation
const YouTubeSourceInput = BaseSourceInput.extend({
  type: z.literal('youtube'),
  handle: z.string()
    .min(1, 'YouTube channel ID is required')
    .regex(/^UC[a-zA-Z0-9_-]{22}$/, 'YouTube channel ID must start with UC and be 24 characters long'),
  url: z.never().optional(), // YouTube sources don't use URLs
});

// RSS source validation
const RSSSourceInput = BaseSourceInput.extend({
  type: z.literal('rss'),
  url: z.string()
    .min(1, 'RSS feed URL is required')
    .url('Must be a valid URL')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'URL must start with http:// or https://'
    ),
  handle: z.never().optional(), // RSS sources don't use handles
});

// Blog source validation
const BlogSourceInput = BaseSourceInput.extend({
  type: z.literal('blog'),
  url: z.string()
    .min(1, 'Blog URL is required')
    .url('Must be a valid URL')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'URL must start with http:// or https://'
    ),
  handle: z.never().optional(), // Blog sources don't use handles
});

// Union of all source input types
export const SourceInputSchema = z.discriminatedUnion('type', [
  XSourceInput,
  YouTubeSourceInput,
  RSSSourceInput,
  BlogSourceInput,
]);

// Source creation input (for createSource)
export const CreateSourceInputSchema = SourceInputSchema;

// Source update input (for toggleSource)
export const ToggleSourceInputSchema = z.object({
  id: z.string().uuid('Invalid source ID'),
  active: z.boolean(),
});

// Source deletion input (for deleteSource)
export const DeleteSourceInputSchema = z.object({
  id: z.string().uuid('Invalid source ID'),
});

// Source verification input (for verifySource)
export const VerifySourceInputSchema = SourceInputSchema;

// Source record from database
export const SourceRecordSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: SourceType,
  handle: z.string().nullable(),
  url: z.string().nullable(),
  active: z.boolean(),
  created_at: z.string().datetime(),
});

// Validation function
export function validateSourceInput(input: unknown) {
  return SourceInputSchema.safeParse(input);
}

// Type exports
export type SourceType = z.infer<typeof SourceType>;
export type SourceInput = z.infer<typeof SourceInputSchema>;
export type CreateSourceInput = z.infer<typeof CreateSourceInputSchema>;
export type ToggleSourceInput = z.infer<typeof ToggleSourceInputSchema>;
export type DeleteSourceInput = z.infer<typeof DeleteSourceInputSchema>;
export type VerifySourceInput = z.infer<typeof VerifySourceInputSchema>;
export type SourceRecord = z.infer<typeof SourceRecordSchema>;

// Helper function to get user-friendly error messages
export function getSourceValidationError(error: z.ZodError): string {
  try {
    const firstError = error.issues?.[0];
    
    if (!firstError) {
      return 'Invalid input. Please check your source details.';
    }
    
    if (Array.isArray(firstError.path) && firstError.path.includes('type')) {
      return 'Please select a valid source type';
    }
    
    if (Array.isArray(firstError.path) && firstError.path.includes('handle')) {
      if (firstError.message.includes('required')) {
        return 'Handle is required for this source type';
      }
      if (firstError.message.includes('regex')) {
        if (firstError.message.includes('UC')) {
          return 'YouTube channel ID must start with UC and be 24 characters long';
        }
        return 'Handle contains invalid characters';
      }
      return firstError.message;
    }
    
    if (Array.isArray(firstError.path) && firstError.path.includes('url')) {
      if (firstError.message.includes('required')) {
        return 'URL is required for this source type';
      }
      if (firstError.message.includes('valid URL')) {
        return 'Please enter a valid URL';
      }
      if (firstError.message.includes('http:// or https://')) {
        return 'URL must start with http:// or https://';
      }
      return firstError.message;
    }
    
    return 'Invalid input. Please check your source details.';
  } catch {
    return 'Invalid input. Please check your source details.';
  }
}
