import { websiteConfig } from '@/config/website';
import {
  addMonthlyFreeCredits,
  addRegisterGiftCredits,
} from '@/credits/credits';
import { getDb } from '@/db';
import { defaultMessages } from '@/i18n/messages';
import { LOCALE_COOKIE_NAME, routing } from '@/i18n/routing';
import { sendEmail } from '@/mail';
import { subscribe } from '@/newsletter';
import { type User, betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import bcrypt from 'bcryptjs';
import { parse as parseCookies } from 'cookie';
import type { Locale } from 'next-intl';
import { onQiflowUserCreated } from './auth-qiflow';
import { getAllPricePlans } from './price-plan';
import { getBaseUrl, getUrlWithLocaleInCallbackUrl } from './urls/urls';

/**
 * Better Auth configuration
 *
 * docs:
 * https://mksaas.com/docs/auth
 * https://www.better-auth.com/docs/reference/options
 */
export const auth = betterAuth({
  baseURL: getBaseUrl(),
  appName: defaultMessages.Metadata.name,
  database: drizzleAdapter(await getDb(), {
    provider: 'pg',
  }),
  password: {
    async hash(password: string) {
      const saltRounds = 10;
      return await bcrypt.hash(password, saltRounds);
    },
    async verify(password: string, hash: string) {
      if (typeof hash === 'string' && hash.startsWith('$2')) {
        return await bcrypt.compare(password, hash);
      }
      // 非 bcrypt 哈希（例如旧数据），暂不支持，返回 false 以避免抛错
      try {
        return await bcrypt.compare(password, hash as unknown as string);
      } catch {
        return false;
      }
    },
    config: { minPasswordLength: 8, maxPasswordLength: 128 },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60,
    },
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    freshAge: 0,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // QiFlow: 暂时禁用邮箱验证以便测试
    async sendResetPassword({ user, url }, request) {
      const locale = getLocaleFromRequest(request);
      const localizedUrl = getUrlWithLocaleInCallbackUrl(url, locale);

      try {
        await sendEmail({
          to: user.email,
          template: 'forgotPassword',
          context: {
            url: localizedUrl,
            name: user.name,
          },
          locale,
        });
      } catch (error) {
        console.error('❌ sendResetPassword email error:', {
          userId: user.id,
          email: user.email,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }, request) => {
      const locale = getLocaleFromRequest(request);
      const localizedUrl = getUrlWithLocaleInCallbackUrl(url, locale);

      try {
        await sendEmail({
          to: user.email,
          template: 'verifyEmail',
          context: {
            url: localizedUrl,
            name: user.name,
          },
          locale,
        });
      } catch (error) {
        console.error('❌ sendVerificationEmail error:', {
          userId: user.id,
          email: user.email,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || 'dummy',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy',
      enabled: !!process.env.GITHUB_CLIENT_ID,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy',
      enabled: !!process.env.GOOGLE_CLIENT_ID,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google', 'github'],
    },
  },
  user: {
    additionalFields: {
      customerId: {
        type: 'string',
        required: false,
      },
    },
    deleteUser: {
      enabled: true,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            await onCreateUser(user);
          } catch (error) {
            console.error('❌ onCreateUser hook failed:', {
              userId: user.id,
              email: user.email,
              error: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
            });
          }
        },
      },
    },
  },
  plugins: [
    admin({
      defaultBanExpiresIn: undefined,
      bannedUserMessage:
        'You have been banned from this application. Please contact support if you believe this is an error.',
    }),
  ],
  onAPIError: {
    errorURL: '/auth/error',
    onError: async (error, ctx) => {
      console.error('=== Better Auth API Error ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error cause:', error.cause);
      console.error('Error stack:', error.stack);
      console.error('Request URL:', ctx?.request?.url);
      console.error('Request Method:', ctx?.request?.method);
      
      // 如果是登录错误，打印详细的账号信息
      if (ctx?.request?.url?.includes('sign-in')) {
        try {
          const body = await ctx.request.json().catch(() => ({}));
          console.error('Login attempt email:', body.email);
          
          // 查询数据库验证
          const db = await getDb();
          const { account, user } = await import('@/db/schema');
          const { eq, and } = await import('drizzle-orm');
          
          const users = await db.select().from(user).where(eq(user.email, body.email)).limit(1);
          if (users.length > 0) {
            console.error('User found:', users[0].id);
            const accounts = await db.select().from(account)
              .where(and(
                eq(account.userId, users[0].id),
                eq(account.providerId, 'credential')
              )).limit(1);
            
            if (accounts.length > 0) {
              console.error('Account found, password hash prefix:', accounts[0].password?.substring(0, 10));
            } else {
              console.error('No credential account found for user');
            }
          } else {
            console.error('User not found in database');
          }
        } catch (e) {
          console.error('Debug query error:', e);
        }
      }
    },
  },
});

export function getLocaleFromRequest(request?: Request): Locale {
  const cookies = parseCookies(request?.headers.get('cookie') ?? '');
  return (cookies[LOCALE_COOKIE_NAME] as Locale) ?? routing.defaultLocale;
}

export async function verifyAuth(request: Request): Promise<{
  authenticated: boolean;
  userId: string | null;
}> {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.session || !session.user) {
      return { authenticated: false, userId: null };
    }
    return { authenticated: true, userId: session.user.id };
  } catch (error) {
    console.error('verifyAuth error:', error);
    return { authenticated: false, userId: null };
  }
}

async function onCreateUser(user: User) {
  if (
    user.email &&
    websiteConfig.newsletter.enable &&
    websiteConfig.newsletter.autoSubscribeAfterSignUp
  ) {
    setTimeout(async () => {
      try {
        const subscribed = await subscribe(user.email);
        if (!subscribed) {
          console.error(`Failed to subscribe user ${user.email} to newsletter`);
        } else {
          console.log(`User ${user.email} subscribed to newsletter`);
        }
      } catch (error) {
        console.error('Newsletter subscription error:', error);
      }
    }, 2000);
  }

  if (
    websiteConfig.credits.enableCredits &&
    websiteConfig.credits.registerGiftCredits.enable &&
    websiteConfig.credits.registerGiftCredits.amount > 0
  ) {
    try {
      await addRegisterGiftCredits(user.id);
      console.log(`✅ Added register gift credits for user ${user.id}`);
    } catch (error) {
      console.error('❌ Register gift credits error:', {
        userId: user.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }

  if (websiteConfig.credits.enableCredits) {
    const pricePlans = getAllPricePlans();
    const freePlan = pricePlans.find(
      (plan) => plan.isFree && !plan.disabled && plan.credits?.enable
    );
    if (freePlan) {
      try {
        await addMonthlyFreeCredits(user.id, freePlan.id);
        console.log(`✅ Added Free monthly credits for user ${user.id}`);
      } catch (error) {
        console.error('❌ Free monthly credits error:', {
          userId: user.id,
          planId: freePlan.id,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    }
  }

  // QiFlow 特定：初始化八字档案
  try {
    await onQiflowUserCreated(user);
    console.log(`✅ QiFlow profiles initialized for user ${user.id}`);
  } catch (error) {
    console.error('❌ QiFlow profile initialization error:', {
      userId: user.id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
