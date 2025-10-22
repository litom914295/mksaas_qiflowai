/**
 * Auth Type Extensions
 * 认证类型扩展 - 扩展 session 和 user 类型
 */

import type { User } from './user';

// 扩展 next-auth
declare module 'next-auth' {
  interface Session {
    user: User & {
      role?: 'user' | 'admin';
      permissions?: string[];
    };
  }

  interface User {
    role?: 'user' | 'admin';
    permissions?: string[];
  }
}

declare module '@/lib/auth-client' {
  interface SessionData {
    user: User;
    expires?: string | Date;
  }
}

// 扩展全局类型
declare global {
  interface Session {
    user: User;
    expires?: string | Date;
  }
}
