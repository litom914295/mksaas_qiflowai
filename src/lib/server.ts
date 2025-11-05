import 'server-only';

import { cookies, headers } from 'next/headers';
import { cache } from 'react';
import { auth } from './auth';

/**
 * Get the current session
 *
 * NOTICE: do not call it from middleware
 */
export const getSession = cache(async () => {
  try {
    // 1. 先检查 Cookie 是否存在
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('better-auth.session_token');

    console.log('[getSession] Cookie check:', {
      hasSessionToken: !!sessionToken,
      tokenLength: sessionToken?.value?.length,
    });

    if (!sessionToken) {
      console.warn('[getSession] No session token found in cookies');
      return null;
    }

    // 2. 获取 headers
    const headersList = await headers();
    console.log('[getSession] Headers check:', {
      hasCookie: !!headersList.get('cookie'),
      userAgent: headersList.get('user-agent')?.substring(0, 50),
    });

    // 3. 调用 Better Auth API
    const session = await auth.api.getSession({
      headers: headersList,
    });

    console.log('[getSession] Session result:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
    });

    return session;
  } catch (error) {
    console.error('[getSession] Error:', error);
    return null;
  }
});
