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
import bcrypt from 'bcryptjs';
import { type User, betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import { parse as parseCookies } from 'cookie';
import type { Locale } from 'next-intl';
import { onQiflowUserCreated } from './auth-qiflow';
import { mappedSchema } from './auth-schema-mapper';
import { getAllPricePlans } from './price-plan';
import { getBaseUrl, getUrlWithLocaleInCallbackUrl } from './urls/urls';

/**
 * Better Auth configuration (Supabase-compatible)
 */
export const auth = betterAuth({
  baseURL: getBaseUrl(),
  appName: defaultMessages.Metadata.name,
  database: drizzleAdapter(await getDb(), {
    provider: 'pg',
    schema: mappedSchema,
  }),
  session: {
    cookieCache: { enabled: true, maxAge: 60 * 60 },
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    freshAge: 0,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    async verifyPassword(password: string, hashedPassword: string) {
      try {
        return await bcrypt.compare(password, hashedPassword);
      } catch {
        return password === hashedPassword;
      }
    },
    async sendResetPassword({ user, url }, request) {
      const locale = getLocaleFromRequest(request);
      const localizedUrl = getUrlWithLocaleInCallbackUrl(url, locale);
      try {
        await sendEmail({
          to: user.email,
          template: 'forgotPassword',
          context: { url: localizedUrl, name: user.name },
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
          context: { url: localizedUrl, name: user.name },
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
    accountLinking: { enabled: true, trustedProviders: ['google', 'github'] },
  },
  user: {
    additionalFields: {
      customerId: { type: 'string', required: false, fieldName: 'customer_id' },
    },
    deleteUser: { enabled: true },
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
    onError: (error) => {
      console.error('auth error:', error);
    },
  },
});

// 提供一个最小 supabaseAdmin 兼容导出（用于 prisma 兼容层开发期类型通过）
// 注意：仅供开发编译使用，不用于生产数据访问
export const supabaseAdmin: any = {
  from: () => ({
    select: () => ({ data: [] }),
    insert: () => ({ select: () => ({ single: () => ({ data: null }) }) }),
    update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null }) }) }) }),
    delete: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null }) }) }) }),
    eq: () => ({ select: () => ({ single: () => ({ data: null }) }) }),
  }),
};

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
