import { createClient } from '@/utils/supabase/server';
import { Redis } from '@upstash/redis';
import { type NextRequest, NextResponse } from 'next/server';

// 创建 Redis 客户端用于速率限制（需要配置环境变量）
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// 简单的内存速率限制（如果没有 Redis）
const rateLimitMemory = new Map<string, { count: number; resetAt: number }>();

async function checkRateLimit(
  userId: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const key = `email_verification_${userId}`;
  const now = Date.now();
  const window = 60 * 1000; // 1 分钟
  const maxAttempts = 3; // 每分钟最多3次

  if (redis) {
    // 使用 Redis 进行速率限制
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, 60);
    }

    if (count > maxAttempts) {
      const ttl = await redis.ttl(key);
      return { allowed: false, retryAfter: ttl };
    }

    return { allowed: true };
  } else {
    // 使用内存进行速率限制
    const record = rateLimitMemory.get(key);

    if (!record || record.resetAt < now) {
      rateLimitMemory.set(key, { count: 1, resetAt: now + window });
      return { allowed: true };
    }

    if (record.count >= maxAttempts) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      return { allowed: false, retryAfter };
    }

    record.count++;
    return { allowed: true };
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // 获取当前用户
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 检查用户是否已经验证
    const { data: userData } = await supabase
      .from('users')
      .select('email_verified')
      .eq('id', user.id)
      .single();

    if (userData?.email_verified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // 检查速率限制
    const rateLimit = await checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'RATE_LIMIT',
          message: 'Too many requests. Please wait before trying again.',
          retryAfter: rateLimit.retryAfter,
        },
        { status: 429 }
      );
    }

    // 重新发送验证邮件
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: user.email!,
    });

    if (resendError) {
      console.error('Failed to resend verification email:', resendError);
      return NextResponse.json(
        { error: resendError.message || 'Failed to send verification email' },
        { status: 500 }
      );
    }

    // 记录重发事件
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'verification_email_resent',
      metadata: { email: user.email },
      ip_address:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    });

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    console.error('Resend verification error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 清理过期的内存速率限制记录（每5分钟执行一次）
if (!redis && typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, record] of rateLimitMemory.entries()) {
        if (record.resetAt < now) {
          rateLimitMemory.delete(key);
        }
      }
    },
    5 * 60 * 1000
  );
}
