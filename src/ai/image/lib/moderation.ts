/**
 * Content Moderation Module
 *
 * Uses OpenAI Moderation API to check prompts for inappropriate content
 * before processing AI image generation requests.
 *
 * @see https://platform.openai.com/docs/guides/moderation
 */

import {
  AuditEventType,
  AuditSeverity,
  logSecurityEvent,
} from '@/lib/audit-log';

/**
 * Moderation API response structure
 */
interface ModerationResult {
  id: string;
  model: string;
  results: Array<{
    flagged: boolean;
    categories: {
      sexual: boolean;
      hate: boolean;
      harassment: boolean;
      'self-harm': boolean;
      'sexual/minors': boolean;
      'hate/threatening': boolean;
      'violence/graphic': boolean;
      'self-harm/intent': boolean;
      'self-harm/instructions': boolean;
      'harassment/threatening': boolean;
      violence: boolean;
    };
    category_scores: {
      sexual: number;
      hate: number;
      harassment: number;
      'self-harm': number;
      'sexual/minors': number;
      'hate/threatening': number;
      'violence/graphic': number;
      'self-harm/intent': number;
      'self-harm/instructions': number;
      'harassment/threatening': number;
      violence: number;
    };
  }>;
}

/**
 * Custom moderation result for internal use
 */
export interface ContentModerationResult {
  /** Whether the content was flagged */
  isFlagged: boolean;
  /** Categories that were flagged (if any) */
  flaggedCategories: string[];
  /** Severity scores for each category */
  scores: Record<string, number>;
  /** Reason for flagging (user-friendly message) */
  reason?: string;
}

/**
 * Configuration for moderation thresholds
 * Adjust these values to be more or less strict
 */
const MODERATION_CONFIG = {
  // Strict categories - block immediately if flagged
  strictCategories: [
    'sexual/minors',
    'hate/threatening',
    'violence/graphic',
    'self-harm/intent',
    'self-harm/instructions',
    'harassment/threatening',
  ],

  // Custom thresholds for other categories (0-1 scale)
  // Default is OpenAI's built-in threshold (~0.5), these are overrides
  customThresholds: {
    sexual: 0.7, // Slightly more lenient for artistic content
    hate: 0.5, // Standard
    harassment: 0.6, // Slightly more lenient
    'self-harm': 0.5, // Standard
    violence: 0.65, // Slightly more lenient for action/fantasy content
  },
} as const;

/**
 * Check if content contains inappropriate material using OpenAI Moderation API
 *
 * @param prompt - The text prompt to check
 * @param userId - User ID for audit logging (optional)
 * @returns Moderation result with flagging status and details
 * @throws Error if moderation API call fails
 */
export async function moderateContent(
  prompt: string,
  userId?: string
): Promise<ContentModerationResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('OpenAI API key not configured for moderation');
    // Fail open (allow content) if API key is missing, but log the issue
    return {
      isFlagged: false,
      flaggedCategories: [],
      scores: {},
    };
  }

  try {
    // Call OpenAI Moderation API
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: prompt,
        model: 'text-moderation-latest', // Use the latest model
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Moderation API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = (await response.json()) as ModerationResult;
    const result = data.results[0];

    if (!result) {
      throw new Error('No moderation result returned');
    }

    // Check strict categories first (always block if flagged)
    const strictViolations = MODERATION_CONFIG.strictCategories.filter(
      (category) =>
        result.categories[category as keyof typeof result.categories]
    );

    if (strictViolations.length > 0) {
      const moderationResult: ContentModerationResult = {
        isFlagged: true,
        flaggedCategories: strictViolations,
        scores: result.category_scores,
        reason: 'Content violates content policy (strict violation)',
      };

      // Log strict violation
      if (userId) {
        await logSecurityEvent({
          eventType: AuditEventType.CONTENT_MODERATION_FLAGGED,
          userId,
          description: `Strict content policy violation: ${strictViolations.join(', ')}`,
          severity: AuditSeverity.ERROR,
          metadata: {
            prompt: prompt.substring(0, 100), // First 100 chars only
            flaggedCategories: strictViolations,
            scores: result.category_scores,
          },
        }).catch((error) => {
          console.error('Failed to log moderation event:', error);
        });
      }

      return moderationResult;
    }

    // Check custom thresholds for other categories
    const flaggedCategories: string[] = [];

    for (const [category, threshold] of Object.entries(
      MODERATION_CONFIG.customThresholds
    )) {
      const score =
        result.category_scores[category as keyof typeof result.category_scores];

      if (score >= threshold) {
        flaggedCategories.push(category);
      }
    }

    const isFlagged = flaggedCategories.length > 0;

    if (isFlagged) {
      const moderationResult: ContentModerationResult = {
        isFlagged: true,
        flaggedCategories,
        scores: result.category_scores,
        reason: 'Content may violate content policy',
      };

      // Log threshold violation
      if (userId) {
        await logSecurityEvent({
          eventType: AuditEventType.CONTENT_MODERATION_FLAGGED,
          userId,
          description: `Content flagged by moderation: ${flaggedCategories.join(', ')}`,
          severity: AuditSeverity.WARNING,
          metadata: {
            prompt: prompt.substring(0, 100),
            flaggedCategories,
            scores: result.category_scores,
          },
        }).catch((error) => {
          console.error('Failed to log moderation event:', error);
        });
      }

      return moderationResult;
    }

    // Content passed moderation
    return {
      isFlagged: false,
      flaggedCategories: [],
      scores: result.category_scores,
    };
  } catch (error) {
    console.error('Content moderation failed:', error);

    // Log moderation failure
    if (userId) {
      await logSecurityEvent({
        eventType: AuditEventType.CONTENT_MODERATION_FAILED,
        userId,
        description: 'Content moderation service failed',
        severity: AuditSeverity.ERROR,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }).catch((logError) => {
        console.error('Failed to log moderation failure:', logError);
      });
    }

    // Fail closed (block content) on errors for safety
    // You can change this to fail open (allow content) if preferred
    return {
      isFlagged: true,
      flaggedCategories: ['moderation_error'],
      scores: {},
      reason: 'Content moderation service temporarily unavailable',
    };
  }
}

/**
 * Helper function to get a user-friendly error message for flagged content
 *
 * @param result - The moderation result
 * @returns User-friendly error message
 */
export function getModerationErrorMessage(
  result: ContentModerationResult
): string {
  if (!result.isFlagged) {
    return '';
  }

  if (result.flaggedCategories.includes('moderation_error')) {
    return 'Content moderation service is temporarily unavailable. Please try again later.';
  }

  // Generic message that doesn't reveal specific categories
  // to avoid giving attackers information on how to bypass moderation
  return 'Your prompt contains content that violates our content policy. Please revise your prompt and try again.';
}

/**
 * Validate prompt length and basic content
 *
 * @param prompt - The prompt to validate
 * @returns Validation result with error message if invalid
 */
export function validatePrompt(prompt: string): {
  isValid: boolean;
  error?: string;
} {
  // Empty prompt
  if (!prompt || prompt.trim().length === 0) {
    return {
      isValid: false,
      error: 'Prompt cannot be empty',
    };
  }

  // Too short
  if (prompt.trim().length < 3) {
    return {
      isValid: false,
      error: 'Prompt must be at least 3 characters long',
    };
  }

  // Too long (OpenAI's limit is ~4000 chars, but we set a lower limit)
  if (prompt.length > 2000) {
    return {
      isValid: false,
      error: 'Prompt must be less than 2000 characters',
    };
  }

  // Check for suspicious patterns (basic XSS prevention)
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onclick=/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(prompt)) {
      return {
        isValid: false,
        error: 'Prompt contains invalid characters',
      };
    }
  }

  return { isValid: true };
}
