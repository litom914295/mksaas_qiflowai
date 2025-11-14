import { createSafeActionClient } from 'next-safe-action';
import { AuditEventType, AuditSeverity, logSecurityEvent } from './audit-log';
import type { User } from './auth-types';
import { isDemoWebsite } from './demo';
import { createRateLimiter } from './rate-limit';
import { getSession } from './server';

// -----------------------------------------------------------------------------
// 1. Base action client – put global error handling / metadata here if needed
// -----------------------------------------------------------------------------
export const actionClient = createSafeActionClient({
  handleServerError: (e) => {
    if (e instanceof Error) {
      return {
        success: false,
        error: e.message,
      };
    }

    return {
      success: false,
      error: 'Something went wrong while executing the action',
    };
  },
});

// -----------------------------------------------------------------------------
// 2. Auth-guarded client
// -----------------------------------------------------------------------------
export const userActionClient = actionClient.use(async ({ next }) => {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized: Please login to continue');
  }

  return next({ ctx: { user: session.user } });
});

// -----------------------------------------------------------------------------
// 3. Admin-only client (extends auth client)
// -----------------------------------------------------------------------------
export const adminActionClient = userActionClient.use(async ({ next, ctx }) => {
  const user = (ctx as { user: User }).user;
  const isDemo = isDemoWebsite();
  const isAdmin = user.role === 'admin';

  // If this is a demo website and user is not an admin, allow the request
  if (!isAdmin && !isDemo) {
    throw new Error('Unauthorized: Admin access required');
  }

  return next({ ctx });
});

// -----------------------------------------------------------------------------
// 4. Rate-limited action clients
// -----------------------------------------------------------------------------

/**
 * Rate-limited user action client
 * Default: 60 requests per minute
 */
export const rateLimitedActionClient = userActionClient.use(
  async ({ next, ctx }) => {
    const user = (ctx as { user: User }).user;
    const rateLimiter = createRateLimiter({
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 60,
      message: 'Too many requests. Please slow down.',
    });

    const result = await rateLimiter(user.id);

    if (!result.success) {
      // Log rate limit exceeded
      try {
        await logSecurityEvent({
          eventType: AuditEventType.RATE_LIMIT_EXCEEDED,
          userId: user.id,
          description: `Action rate limit exceeded (${result.limit}/min)`,
          severity: AuditSeverity.WARNING,
          metadata: {
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset.toISOString(),
          },
        });
      } catch (error) {
        console.error('Failed to log rate limit event:', error);
      }

      throw new Error(result.message);
    }

    return next({ ctx });
  }
);

/**
 * Strict rate-limited user action client
 * For high-risk actions: 10 requests per minute
 */
export const strictRateLimitedActionClient = userActionClient.use(
  async ({ next, ctx }) => {
    const user = (ctx as { user: User }).user;
    const rateLimiter = createRateLimiter({
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10,
      message: 'Too many sensitive requests. Please wait before trying again.',
    });

    const result = await rateLimiter(user.id);

    if (!result.success) {
      // Log rate limit exceeded with higher severity
      try {
        await logSecurityEvent({
          eventType: AuditEventType.RATE_LIMIT_EXCEEDED,
          userId: user.id,
          description: `Strict action rate limit exceeded (${result.limit}/min)`,
          severity: AuditSeverity.ERROR,
          metadata: {
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset.toISOString(),
            strict: true,
          },
        });
      } catch (error) {
        console.error('Failed to log rate limit event:', error);
      }

      throw new Error(result.message);
    }

    return next({ ctx });
  }
);

/**
 * Create a custom rate-limited action client
 *
 * @param config - Rate limiter configuration
 * @returns Custom rate-limited action client
 */
export function createRateLimitedActionClient(config: {
  windowMs: number;
  maxRequests: number;
  message?: string;
}) {
  return userActionClient.use(async ({ next, ctx }) => {
    const user = (ctx as { user: User }).user;
    const rateLimiter = createRateLimiter({
      windowMs: config.windowMs,
      maxRequests: config.maxRequests,
      message: config.message || 'Too many requests. Please slow down.',
    });

    const result = await rateLimiter(user.id);

    if (!result.success) {
      // Log rate limit exceeded
      try {
        await logSecurityEvent({
          eventType: AuditEventType.RATE_LIMIT_EXCEEDED,
          userId: user.id,
          description: `Custom action rate limit exceeded (${result.limit}/${config.windowMs / 1000}s)`,
          severity: AuditSeverity.WARNING,
          metadata: {
            limit: result.limit,
            windowMs: config.windowMs,
            remaining: result.remaining,
            reset: result.reset.toISOString(),
          },
        });
      } catch (error) {
        console.error('Failed to log rate limit event:', error);
      }

      throw new Error(result.message);
    }

    return next({ ctx });
  });
}
