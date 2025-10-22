/**
 * Supabase Auth Client
 * 兼容 Better Auth 客户端接口
 */

class SupabaseAuthClient {
  // 使用相对路径而不是完整 URL，避免 CORS 问题
  private getApiUrl(path: string): string {
    // 在浏览器中使用相对路径
    if (typeof window !== 'undefined') {
      return path;
    }
    // 在服务器端使用完整 URL
    return `http://localhost:${process.env.PORT || 3000}${path}`;
  }

  signIn = {
    social: async (
      params: {
        provider: string;
        callbackURL?: string;
      },
      options?: {
        onRequest?: (ctx: any) => void;
        onResponse?: (ctx: any) => void;
        onSuccess?: (ctx: any) => void;
        onError?: (ctx: any) => void;
      }
    ) => {
      // Social login implementation
      const apiUrl = this.getApiUrl(`/api/auth/sign-in/${params.provider}`);
      options?.onRequest?.({ url: apiUrl });

      // For social login, typically redirect to provider
      if (typeof window !== 'undefined') {
        window.location.href = apiUrl;
      }

      return { data: { redirecting: true } };
    },
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
      const apiUrl = this.getApiUrl('/api/auth/sign-in/email');
      console.log('Attempting to sign in with URL:', apiUrl);
      options?.onRequest?.({ url: apiUrl });

      try {
        const response = await fetch(apiUrl, {
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

        // 安全解析响应：优先依据 Content-Type，其次再回退到文本解析
        let data: any = null;
        const contentType = response.headers.get('content-type') || '';

        try {
          if (response.status === 204) {
            data = { success: true };
          } else if (contentType.includes('application/json')) {
            data = await response.json();
          } else {
            const rawText = await response.text();
            // 尝试在文本不是 JSON 时给出更明确的错误信息（如返回了 HTML 错误页）
            const isLikelyHtml =
              rawText.trim().startsWith('<!DOCTYPE') ||
              rawText.trim().startsWith('<html');
            if (
              !isLikelyHtml &&
              (rawText.trim().startsWith('{') || rawText.trim().startsWith('['))
            ) {
              data = JSON.parse(rawText);
            } else {
              // 从 HTML 中提取 <title> 作为错误消息的简要摘要
              let message = 'Invalid server response';
              if (isLikelyHtml) {
                const titleMatch = rawText.match(/<title>([^<]*)<\/title>/i);
                if (titleMatch?.[1]) message = titleMatch[1];
              } else if (rawText) {
                message = rawText.slice(0, 500);
              }
              data = { error: message };
            }
          }
        } catch (parseError) {
          console.error('Response parse error:', parseError);
          data = { error: 'Failed to parse server response' };
        }

        if (!response.ok) {
          // Call onError callback
          const errorMessage =
            data?.error ||
            data?.message ||
            `HTTP ${response.status}: ${response.statusText}`;
          const errorObj = {
            error: {
              status: response.status,
              message: errorMessage,
            },
          };
          options?.onError?.(errorObj);
          return { error: errorMessage };
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
        console.error('Auth client network error:', error);

        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Network error or server is not responding';
        const errorObj = {
          error: {
            status: 0,
            message: errorMessage,
          },
        };

        options?.onError?.(errorObj);
        return { error: errorMessage };
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
      const apiUrl = this.getApiUrl('/api/auth/sign-up/email');
      options?.onRequest?.({ url: apiUrl });

      try {
        const response = await fetch(apiUrl, {
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

  signOut = async (options?: {
    fetchOptions?: any;
    onRequest?: (ctx: any) => void;
    onResponse?: (ctx: any) => void;
    onSuccess?: (ctx: any) => void;
    onError?: (ctx: any) => void;
  }) => {
    try {
      const response = await fetch(this.getApiUrl('/api/auth/sign-out'), {
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
      options?.onError?.(error);
      return { error: 'Sign out failed' };
    }
  };

  getSession = async () => {
    try {
      const response = await fetch(this.getApiUrl('/api/auth/session'), {
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
    // 这需要在客户端组件中使用，服务端返回空数据
    if (typeof window === 'undefined') {
      return {
        data: null,
        isPending: false,
        error: null,
        isLoading: false,
        refetch: async () => {},
      };
    }

    // 在客户端使用 React hooks
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [data, setData] = (
      require('react') as typeof import('react')
    ).useState<any>(null);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isLoading, setIsLoading] = (
      require('react') as typeof import('react')
    ).useState(true);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [error, setError] = (
      require('react') as typeof import('react')
    ).useState<any>(null);

    const fetchSession = async () => {
      try {
        setIsLoading(true);
        const result = await this.getSession();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    (require('react') as typeof import('react')).useEffect(() => {
      fetchSession();
    }, []);

    return {
      data,
      isPending: isLoading,
      error,
      isLoading,
      refetch: fetchSession,
    };
  };

  // 添加缺失的方法
  listAccounts = async () => {
    try {
      const response = await fetch(this.getApiUrl('/api/auth/accounts'), {
        credentials: 'include',
      });
      const data = await response.json();
      return data.accounts || [];
    } catch {
      return [];
    }
  };

  updateUser = async (userData: any, options?: any) => {
    const apiUrl = this.getApiUrl('/api/auth/update-user');
    options?.onRequest?.({ url: apiUrl });

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      options?.onResponse?.({ response });
      const data = await response.json();

      if (!response.ok) {
        options?.onError?.({ error: { message: data.error } });
        return { error: data.error };
      }

      options?.onSuccess?.({ data });
      return { data };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Network error';
      options?.onError?.({ error: { message: errorMessage } });
      return { error: errorMessage };
    }
  };

  changePassword = async (
    params: { newPassword: string; currentPassword: string },
    options?: any
  ) => {
    const apiUrl = this.getApiUrl('/api/auth/change-password');
    options?.onRequest?.({ url: apiUrl });

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params),
      });

      options?.onResponse?.({ response });
      const data = await response.json();

      if (!response.ok) {
        options?.onError?.({ error: { message: data.error } });
        return { error: data.error };
      }

      options?.onSuccess?.({ data });
      return { data };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Network error';
      options?.onError?.({ error: { message: errorMessage } });
      return { error: errorMessage };
    }
  };

  deleteUser = async (options?: any) => {
    const apiUrl = this.getApiUrl('/api/auth/delete-user');
    options?.onRequest?.({ url: apiUrl });

    try {
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        credentials: 'include',
      });

      options?.onResponse?.({ response });
      const data = await response.json();

      if (!response.ok) {
        options?.onError?.({ error: { message: data.error } });
        return { error: data.error };
      }

      options?.onSuccess?.({ data });
      return { data };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Network error';
      options?.onError?.({ error: { message: errorMessage } });
      return { error: errorMessage };
    }
  };

  forgetPassword = async (
    params: { email: string; redirectTo?: string },
    options?: any
  ) => {
    const apiUrl = this.getApiUrl('/api/auth/forgot-password');
    options?.onRequest?.({ url: apiUrl });

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params),
      });

      options?.onResponse?.({ response });
      const data = await response.json();

      if (!response.ok) {
        options?.onError?.({ error: { message: data.error } });
        return { error: data.error };
      }

      options?.onSuccess?.({ data });
      return { data };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Network error';
      options?.onError?.({ error: { message: errorMessage } });
      return { error: errorMessage };
    }
  };

  resetPassword = async (
    params: { token: string; password: string },
    options?: any
  ) => {
    const apiUrl = this.getApiUrl('/api/auth/reset-password');
    options?.onRequest?.({ url: apiUrl });

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params),
      });

      options?.onResponse?.({ response });
      const data = await response.json();

      if (!response.ok) {
        options?.onError?.({ error: { message: data.error } });
        return { error: data.error };
      }

      options?.onSuccess?.({ data });
      return { data };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Network error';
      options?.onError?.({ error: { message: errorMessage } });
      return { error: errorMessage };
    }
  };

  admin = {
    banUser: async (params: { userId: string }) => {
      try {
        const response = await fetch(
          this.getApiUrl('/api/auth/admin/ban-user'),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(params),
          }
        );
        return await response.json();
      } catch (error) {
        return { error: 'Failed to ban user' };
      }
    },
    unbanUser: async (params: { userId: string }) => {
      try {
        const response = await fetch(
          this.getApiUrl('/api/auth/admin/unban-user'),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(params),
          }
        );
        return await response.json();
      } catch (error) {
        return { error: 'Failed to unban user' };
      }
    },
  };
}

// 创建并导出客户端实例
export const authClient = new SupabaseAuthClient();
