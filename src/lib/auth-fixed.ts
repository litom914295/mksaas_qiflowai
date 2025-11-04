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
 * Fixed Better Auth configuration for Supabase compatibility
 */
export const auth = betterAuth({
  baseURL: getBaseUrl(),
  appName: defaultMessages.Metadata.name,
  database: drizzleAdapter(await getDb(), {
    provider: 'pg',
    // 使用映射后的 schema
    schema: mappedSchema,
  }),
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
    requireEmailVerification: false,
    // 自定义密码验证以兼容 Supabase Auth
    async verifyPassword(password: string, hashedPassword: string) {
      // 支持 bcrypt 和 Supabase 的密码验证
      try {
        return await bcrypt.compare(password, hashedPassword);
      } catch {
        // 如果不是 bcrypt hash，尝试直接比较（仅用于开发）
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
    sendVerificationEmail: async ({ user, url, token }, request) => {
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
        // 映射到实际的列名
        fieldName: 'customer_id',
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
    onError: (error, ctx) => {
      console.error('auth error:', error);
      // 详细的错误日志
      if ((error as Error).message?.includes('Tenant or user not found')) {
        console.error(
          'Database connection issue - check Supabase configuration'
        );
      }
    },
  },
  // 添加自定义认证逻辑
  experimental: {
    // 使用自定义的用户查询
    customUserQuery: async (db: any, email: any) => {
      try {
        const result = await db
          .select()
          .from(mappedSchema.user)
          .where(eq(mappedSchema.user.email, email))
          .limit(1);

        if (result.length > 0) {
          // 转换列名格式
          const user = result[0];
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
            image: user.image,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            customerId: user.customerId,
            role: user.role,
            banned: user.banned,
            banReason: user.banReason,
            banExpires: user.banExpires,
          };
        }
        return null;
      } catch (error) {
        console.error('customUserQuery error:', error);
        return null;
      }
    },
  },
});

/**
 * Gets the locale from a request by parsing the cookies
 */
export function getLocaleFromRequest(request?: Request): Locale {
  const cookies = parseCookies(request?.headers.get('cookie') ?? '');
  return (cookies[LOCALE_COOKIE_NAME] as Locale) ?? routing.defaultLocale;
}

/**
 * Verifies authentication from a request
 */
export async function verifyAuth(request: Request): Promise<{
  authenticated: boolean;
  userId: string | null;
}> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.session || !session.user) {
      return { authenticated: false, userId: null };
    }

    return {
      authenticated: true,
      userId: session.user.id,
    };
  } catch (error) {
    console.error('verifyAuth error:', error);
    return { authenticated: false, userId: null };
  }
}

/**
 * On create user hook
 */
async function onCreateUser(user: User) {
  // Auto subscribe user to newsletter after sign up if enabled in website config
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

  // Add register gift credits to the user if enabled in website config
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

  // Add free monthly credits to the user if enabled in website config
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

  // Initialize QiFlow profiles for the user
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

// 导入 eq 操作符
import { eq } from 'drizzle-orm';
