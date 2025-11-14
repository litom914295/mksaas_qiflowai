import type { GenerateImageRequest } from '@/ai/image/lib/api-types';
import {
  getModerationErrorMessage,
  moderateContent,
  validatePrompt,
} from '@/ai/image/lib/moderation';
import type { ProviderKey } from '@/ai/image/lib/provider-config';
import { consumeCredits, refundCredits } from '@/credits/credits';
import {
  AuditEventType,
  AuditSeverity,
  logAIEvent,
  logSecurityEvent,
} from '@/lib/audit-log';
import { auth } from '@/lib/auth';
import { createRateLimiter } from '@/lib/rate-limit';
import { createFal } from '@ai-sdk/fal';
import { fireworks } from '@ai-sdk/fireworks';
import { openai } from '@ai-sdk/openai';
import { replicate } from '@ai-sdk/replicate';
import {
  type ImageModel,
  experimental_generateImage as generateImage,
} from 'ai';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Intended to be slightly less than the maximum execution time allowed by the
 * runtime so that we can gracefully terminate our request.
 */
const TIMEOUT_MILLIS = 55 * 1000;

const DEFAULT_IMAGE_SIZE = '1024x1024';
const DEFAULT_ASPECT_RATIO = '1:1';

const fal = createFal({
  apiKey: process.env.FAL_API_KEY,
});

interface ProviderConfig {
  createImageModel: (modelId: string) => ImageModel;
  dimensionFormat: 'size' | 'aspectRatio';
}

const providerConfig: Record<ProviderKey, ProviderConfig> = {
  openai: {
    createImageModel: openai.image,
    dimensionFormat: 'size',
  },
  fireworks: {
    createImageModel: fireworks.image,
    dimensionFormat: 'aspectRatio',
  },
  replicate: {
    createImageModel: replicate.image,
    dimensionFormat: 'size',
  },
  fal: {
    createImageModel: fal.image,
    dimensionFormat: 'size',
  },
};

const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMillis: number
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), timeoutMillis)
    ),
  ]);
};

// Cost per image generation (in credits)
const IMAGE_GENERATION_COST = 10; // Adjust based on your pricing

// Rate limiter: 10 requests per minute per user
const imageGenerationRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  message: 'Too many image generation requests. Please try again later.',
});

export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);

  // 1. Authentication check
  const session = await auth();
  if (!session?.user?.id) {
    console.error(
      `Unauthorized image generation attempt [requestId=${requestId}]`
    );
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  // 2. Rate limit check
  const rateLimitResult = await imageGenerationRateLimiter(userId);
  if (!rateLimitResult.success) {
    console.warn(
      `Rate limit exceeded [requestId=${requestId}, userId=${userId}]`
    );

    // Log rate limit exceeded
    try {
      await logSecurityEvent({
        eventType: AuditEventType.AI_RATE_LIMIT_EXCEEDED,
        userId,
        description: `AI image generation rate limit exceeded (${rateLimitResult.limit}/min)`,
        severity: AuditSeverity.WARNING,
        metadata: { requestId, limit: rateLimitResult.limit },
      });
    } catch (error) {
      console.error('Failed to log rate limit event:', error);
    }

    return NextResponse.json(
      { error: rateLimitResult.message },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toISOString(),
          'Retry-After': Math.ceil(
            (rateLimitResult.reset.getTime() - Date.now()) / 1000
          ).toString(),
        },
      }
    );
  }

  const { prompt, provider, modelId } =
    (await req.json()) as GenerateImageRequest;

  try {
    if (!prompt || !provider || !modelId || !providerConfig[provider]) {
      const error = 'Invalid request parameters';
      console.error(`${error} [requestId=${requestId}]`);
      return NextResponse.json({ error }, { status: 400 });
    }

    // 3. Validate prompt
    const validation = validatePrompt(prompt);
    if (!validation.isValid) {
      console.warn(
        `Invalid prompt [requestId=${requestId}, userId=${userId}]: ${validation.error}`
      );
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 4. Content moderation check
    const moderationResult = await moderateContent(prompt, userId);
    if (moderationResult.isFlagged) {
      console.warn(
        `Content flagged [requestId=${requestId}, userId=${userId}, categories=${moderationResult.flaggedCategories.join(', ')}]`
      );

      return NextResponse.json(
        { error: getModerationErrorMessage(moderationResult) },
        { status: 403 } // Forbidden
      );
    }

    // 5. Consume credits before generation
    try {
      await consumeCredits({
        userId,
        amount: IMAGE_GENERATION_COST,
        description: `AI Image Generation: ${provider}/${modelId}`,
      });
      console.log(
        `Credits consumed [requestId=${requestId}, userId=${userId}, amount=${IMAGE_GENERATION_COST}]`
      );
    } catch (creditError) {
      console.error(
        `Credit consumption failed [requestId=${requestId}, userId=${userId}]: `,
        creditError
      );
      return NextResponse.json(
        {
          error:
            creditError instanceof Error
              ? creditError.message
              : 'Insufficient credits',
        },
        { status: 402 } // Payment Required
      );
    }

    const config = providerConfig[provider];
    const startstamp = performance.now();
    const generatePromise = generateImage({
      model: config.createImageModel(modelId),
      prompt,
      ...(config.dimensionFormat === 'size'
        ? { size: DEFAULT_IMAGE_SIZE }
        : { aspectRatio: DEFAULT_ASPECT_RATIO }),
      ...(provider !== 'openai' && {
        seed: Math.floor(Math.random() * 1000000),
      }),
      // Vertex AI only accepts a specified seed if watermark is disabled.
      providerOptions: { vertex: { addWatermark: false } },
    }).then(({ image, warnings }) => {
      if (warnings?.length > 0) {
        console.warn(
          `Warnings [requestId=${requestId}, provider=${provider}, model=${modelId}]: `,
          warnings
        );
      }
      console.log(
        `Completed image request [requestId=${requestId}, provider=${provider}, model=${modelId}, elapsed=${(
          (performance.now() - startstamp) / 1000
        ).toFixed(1)}s].`
      );

      return {
        provider,
        image: image.base64,
      };
    });

    const result = await withTimeout(generatePromise, TIMEOUT_MILLIS);

    // Log successful generation
    try {
      await logAIEvent({
        userId,
        eventType: AuditEventType.AI_IMAGE_GENERATED,
        description: `Generated image: ${provider}/${modelId}`,
        provider,
        model: modelId,
        creditsConsumed: IMAGE_GENERATION_COST,
        success: true,
        metadata: { requestId, promptLength: prompt.length },
      });
    } catch (error) {
      console.error('Failed to log AI event:', error);
    }

    return NextResponse.json(result, {
      status: 'image' in result ? 200 : 500,
    });
  } catch (error) {
    // 3. Refund credits on failure
    try {
      await refundCredits({
        userId,
        amount: IMAGE_GENERATION_COST,
        reason: `AI Image Generation Failed: ${provider}/${modelId}`,
        metadata: {
          requestId,
          provider,
          modelId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      console.log(
        `Credits refunded [requestId=${requestId}, userId=${userId}, amount=${IMAGE_GENERATION_COST}]`
      );
    } catch (refundError) {
      console.error(
        `Credit refund failed [requestId=${requestId}, userId=${userId}]: `,
        refundError
      );
      // Continue to return error even if refund fails
      // Refund failure should be logged and handled separately
    }

    // Log failed generation
    try {
      await logAIEvent({
        userId,
        eventType: AuditEventType.AI_IMAGE_FAILED,
        description: `Image generation failed: ${provider}/${modelId}`,
        provider,
        model: modelId,
        creditsConsumed: 0, // Refunded
        success: false,
        metadata: {
          requestId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } catch (logError) {
      console.error('Failed to log AI failure event:', logError);
    }

    // Log full error detail on the server, but return a generic error message
    // to avoid leaking any sensitive information to the client.
    console.error(
      `Error generating image [requestId=${requestId}, provider=${provider}, model=${modelId}]: `,
      error
    );
    return NextResponse.json(
      {
        error: 'Failed to generate image. Please try again later.',
      },
      { status: 500 }
    );
  }
}
