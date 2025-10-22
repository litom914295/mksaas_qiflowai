/**
 * Supabase Auth Client
 * 兼容 Better Auth 客户端接口
 */

import { getBaseUrl } from './urls/urls';

class SupabaseAuthClient {
  private baseURL: string;

  constructor() {
    this.baseURL = getBaseUrl();
  }

  signIn = {
    email: async (
      params: {
        email: string;
        password: string;
        callbackURL?: string;
      },
      options?: {
        onRequest?: (ctx: any) => void;
        onResponse?: (ctx: any) => void;
        onSuccess?: (ctx: any) => void;
        onError?: (ctx: any) => void;
      }
    ) => {
      // Call onRequest callback
      options?.onRequest?.({ url: `${this.baseURL}/api/auth/sign-in/email` });

      try {
        const response = await fetch(`${this.baseURL}/api/auth/sign-in/email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email: params.email,
            password: params.password,
          }),
        });

        // Call onResponse callback
        options?.onResponse?.({ response });

        const data = await response.json();

        if (!response.ok) {
          // Call onError callback
          options?.onError?.({
            error: {
              status: response.status,
              message: data.error || 'Login failed',
            },
          });
          return { error: data.error };
        }

        // Call onSuccess callback
        options?.onSuccess?.({ data });

        // If there's a callback URL, redirect
        if (params.callbackURL && typeof window !== 'undefined') {
          window.location.href = params.callbackURL;
        }

        return { data };
      } catch (error) {
        // Call onError callback
        options?.onError?.({
          error: {
            status: 500,
            message: error instanceof Error ? error.message : 'Network error',
          },
        });
        return { error: 'Network error' };
      }
    },
  };

  signUp = {
    email: async (
      params: {
        email: string;
        password: string;
        name?: string;
        callbackURL?: string;
      },
      options?: {
        onRequest?: (ctx: any) => void;
        onResponse?: (ctx: any) => void;
        onSuccess?: (ctx: any) => void;
        onError?: (ctx: any) => void;
      }
    ) => {
      options?.onRequest?.({ url: `${this.baseURL}/api/auth/sign-up/email` });

      try {
        const response = await fetch(`${this.baseURL}/api/auth/sign-up/email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email: params.email,
            password: params.password,
            name: params.name,
          }),
        });

        options?.onResponse?.({ response });

        const data = await response.json();

        if (!response.ok) {
          options?.onError?.({
            error: {
              status: response.status,
              message: data.error || 'Registration failed',
            },
          });
          return { error: data.error };
        }

        options?.onSuccess?.({ data });

        if (params.callbackURL && typeof window !== 'undefined') {
          window.location.href = params.callbackURL;
        }

        return { data };
      } catch (error) {
        options?.onError?.({
          error: {
            status: 500,
            message: error instanceof Error ? error.message : 'Network error',
          },
        });
        return { error: 'Network error' };
      }
    },
  };

  signOut = async () => {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/sign-out`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }

      return { success: response.ok };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: 'Sign out failed' };
    }
  };

  getSession = async () => {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/session`, {
        credentials: 'include',
      });

      if (!response.ok) {
        return { session: null, user: null };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get session error:', error);
      return { session: null, user: null };
    }
  };

  // 兼容 Better Auth 的 useSession hook
  useSession = () => {
    // 这是一个简化版本，实际的 React hook 需要更复杂的实现
    if (typeof window === 'undefined') {
      return { data: null, isPending: false, error: null };
    }

    // 简单的实现，实际应该使用 React 的 state 和 effect
    return {
      data: null,
      isPending: false,
      error: null,
    };
  };
}

// 创建并导出客户端实例
export const authClient = new SupabaseAuthClient();
