import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Webhook verification secret
const WEBHOOK_SECRET =
  process.env.AI_ERROR_WEBHOOK_SECRET || 'default-webhook-secret';

// AI Error Event Schema for validation
const AIErrorEventSchema = z.object({
  timestamp: z.string().datetime(),
  provider: z.enum([
    'openai',
    'anthropic',
    'gemini',
    'deepseek',
    'openai-compatible',
    'grok',
  ]),
  model: z.string(),
  error: z.object({
    type: z.string(),
    message: z.string(),
    code: z.string().optional(),
    statusCode: z.number().optional(),
    details: z.record(z.string(), z.any()).optional(),
  }),
  request: z.object({
    requestId: z.string(),
    userId: z.string().optional(),
    guestSessionId: z.string().optional(),
    endpoint: z.string(),
    method: z.string(),
    tokens: z
      .object({
        prompt: z.number().optional(),
        completion: z.number().optional(),
        total: z.number().optional(),
      })
      .optional(),
    cost: z.number().optional(),
  }),
  context: z
    .object({
      userAgent: z.string().optional(),
      ipAddress: z.string().optional(),
      locale: z.string().optional(),
      feature: z.string().optional(), // e.g., 'bazi-analysis', 'fengshui-chat'
    })
    .optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

type AIErrorEvent = z.infer<typeof AIErrorEventSchema>;

/**
 * Verify webhook signature for security
 */
async function verifyWebhookSignature(
  body: string,
  signature: string
): Promise<boolean> {
  try {
    // Simple HMAC verification using the webhook secret
    const crypto = await import('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    const providedSignature = signature.replace('sha256=', '');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}

/**
 * Log AI error to database and monitoring systems
 */
async function logAIError(errorEvent: AIErrorEvent): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Log to api_logs table for general API monitoring
    const apiLogEntry = {
      user_id: errorEvent.request.userId || null,
      guest_session_id: errorEvent.request.guestSessionId || null,
      endpoint: errorEvent.request.endpoint,
      method: errorEvent.request.method,
      ip_address: errorEvent.context?.ipAddress || null,
      user_agent: errorEvent.context?.userAgent || null,
      status_code: errorEvent.error.statusCode || 500,
      response_time_ms: null, // Not available for error events
      error_message: `[${errorEvent.provider}] ${errorEvent.error.message}`,
      metadata: {
        provider: errorEvent.provider,
        model: errorEvent.model,
        errorType: errorEvent.error.type,
        errorCode: errorEvent.error.code,
        requestId: errorEvent.request.requestId,
        feature: errorEvent.context?.feature,
        tokens: errorEvent.request.tokens,
        cost: errorEvent.request.cost,
        details: errorEvent.error.details,
        originalTimestamp: errorEvent.timestamp,
        ...errorEvent.metadata,
      },
    };

    const { error: dbError } = await supabase
      .from('api_logs')
      .insert(apiLogEntry);

    if (dbError) {
      console.error('Failed to log AI error to database:', dbError);
      throw dbError;
    }

    // Log to console for immediate visibility in production logs
    console.error(`[AI-ERROR] ${errorEvent.provider}/${errorEvent.model}:`, {
      requestId: errorEvent.request.requestId,
      error: errorEvent.error,
      userId: errorEvent.request.userId,
      feature: errorEvent.context?.feature,
      timestamp: errorEvent.timestamp,
    });

    // Additional monitoring integrations can be added here
    // e.g., Sentry, DataDog, CloudWatch, etc.
  } catch (error) {
    console.error('Critical: Failed to log AI error:', error);

    // Fallback logging to console to ensure error is not lost
    console.error('[AI-ERROR-FALLBACK]', {
      originalEvent: errorEvent,
      loggingError: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

/**
 * POST handler for AI error webhook
 */
export async function POST(request: NextRequest) {
  try {
    // Get request body and headers
    const body = await request.text();
    const headersList = await headers();

    // Verify webhook signature for security
    const signature = headersList.get('x-webhook-signature') || '';
    if (!(await verifyWebhookSignature(body, signature))) {
      console.warn('Invalid webhook signature received:', {
        signature: signature.substring(0, 10) + '...',
        bodyLength: body.length,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Parse and validate the error event
    let errorEvent: AIErrorEvent;
    try {
      const rawEvent = JSON.parse(body);
      errorEvent = AIErrorEventSchema.parse(rawEvent);
    } catch (validationError) {
      console.error('Invalid AI error event format:', validationError);

      return NextResponse.json(
        {
          error: 'Invalid event format',
          details:
            validationError instanceof Error
              ? validationError.message
              : String(validationError),
        },
        { status: 400 }
      );
    }

    // Log the error event
    await logAIError(errorEvent);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        requestId: errorEvent.request.requestId,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Webhook processing error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler for webhook health check
 */
export async function GET() {
  try {
    // Basic health check
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Test database connectivity
    const { error } = await supabase
      .from('api_logs')
      .select('id')
      .limit(1)
      .single();

    const isHealthy = !error || error.code === 'PGRST116'; // PGRST116 = no rows found (which is fine)

    return NextResponse.json(
      {
        status: isHealthy ? 'healthy' : 'unhealthy',
        service: 'ai-error-webhook',
        timestamp: new Date().toISOString(),
        database: isHealthy ? 'connected' : 'error',
        version: '1.0.0',
      },
      { status: isHealthy ? 200 : 503 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        service: 'ai-error-webhook',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
