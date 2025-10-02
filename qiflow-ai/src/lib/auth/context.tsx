'use client';

// QiFlow AI 认证上下文
// 深度思考：设计一个健壮的认证状态管理系统，支持用户和游客两种模式
// 考虑状态同步、错误处理、性能优化和用户体验

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { getSupabaseAuth } from './supabase';
import {
  AuthContextValue,
  AuthError,
  AuthState,
  AuthStatus,
  AuthenticatedUser,
  CreateGuestSessionParams,
  GuestSession,
  LoginCredentials,
  PasswordResetConfirm,
  PasswordResetRequest,
  PermissionCheck,
  RegisterData,
  SensitiveDataUpdate,
  SessionValidation,
  UsageQuota,
  UserProfileUpdate,
  UserRole,
} from './types';

// 创建认证上下文
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// 认证状态初始值
const initialAuthState: AuthState = {
  status: 'loading',
  user: null,
  guestSession: null,
  isLoading: true,
  error: null,
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // 状态管理
  const [state, setState] = useState<AuthState>(initialAuthState);
  const [isInitialized, setIsInitialized] = useState(false);

  // 防止重复初始化
  const initializationRef = useRef(false);
  const sessionCheckRef = useRef<NodeJS.Timeout | null>(null);

  // 状态更新辅助函数
  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // 设置错误状态
  const setError = useCallback(
    (error: string | null) => {
      updateState({ error, isLoading: false });
    },
    [updateState]
  );

  // 清除错误状态
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // 初始化认证状态
  const initializeAuth = useCallback(async () => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    try {
      updateState({ isLoading: true, error: null });

      // 检查环境变量是否配置
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('demo.supabase.co') || supabaseUrl.includes('mock-project')) {
        console.warn(
          'Supabase environment variables not configured or using demo mode - allowing guest access'
        );
        // 在开发环境中，允许游客访问而不是显示错误
        updateState({
          status: 'unauthenticated',
          user: null,
          guestSession: null,
          isLoading: false,
          error: null, // 不显示错误，允许用户继续使用
        });
        return;
      }

      // 检查现有的认证会话
      const session = await getSupabaseAuth().getCurrentSession();

      if (session?.user) {
        // 用户已认证，获取用户资料
        const { user, error } = await getSupabaseAuth().getUserProfile(
          session.user.id
        );

        if (error) {
          console.error('Error loading user profile:', error);
          setError('Failed to load user profile');
          return;
        }

        updateState({
          status: 'authenticated',
          user,
          guestSession: null,
          isLoading: false,
          error: null,
        });
      } else {
        // 检查游客会话
        const guestToken =
          typeof window !== 'undefined'
            ? localStorage.getItem('qiflow_guest_token')
            : null;

        if (guestToken) {
          try {
            const { session: guestSession, error } =
              await getSupabaseAuth().getGuestSession(guestToken);

            if (guestSession && !error) {
              updateState({
                status: 'guest',
                user: null,
                guestSession,
                isLoading: false,
                error: null,
              });
            } else {
              // 游客会话无效，清除本地存储
              if (typeof window !== 'undefined') {
                localStorage.removeItem('qiflow_guest_token');
              }
              updateState({
                status: 'unauthenticated',
                user: null,
                guestSession: null,
                isLoading: false,
                error: null,
              });
            }
          } catch (guestError) {
            console.warn('Guest session validation failed:', guestError);
            // 清除无效的游客令牌
            if (typeof window !== 'undefined') {
              localStorage.removeItem('qiflow_guest_token');
            }
            updateState({
              status: 'unauthenticated',
              user: null,
              guestSession: null,
              isLoading: false,
              error: null,
            });
          }
        } else {
          updateState({
            status: 'unauthenticated',
            user: null,
            guestSession: null,
            isLoading: false,
            error: null,
          });
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      // 不设置错误状态，而是设置为未认证状态，避免阻塞用户访问
      updateState({
        status: 'unauthenticated',
        user: null,
        guestSession: null,
        isLoading: false,
        error: null,
      });
    } finally {
      setIsInitialized(true);
    }
  }, [updateState, setError]);

  // 用户登录
  const signIn = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        clearError();
        updateState({ isLoading: true });

        const { user, error } = await getSupabaseAuth().signIn(credentials);

        if (error) {
          setError(getErrorMessage(error));
          return;
        }

        if (user) {
          const { user: userProfile, error: profileError } =
            await getSupabaseAuth().getUserProfile(user.id);

          if (profileError) {
            setError('Failed to load user profile');
            return;
          }

          // 清除游客会话
          if (typeof window !== 'undefined') {
            localStorage.removeItem('qiflow_guest_token');
          }

          updateState({
            status: 'authenticated',
            user: userProfile,
            guestSession: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Error during sign in:', error);
        setError('An unexpected error occurred during sign in');
      }
    },
    [clearError, updateState, setError]
  );

  // 用户注册
  const signUp = useCallback(
    async (data: RegisterData) => {
      try {
        clearError();
        updateState({ isLoading: true });

        const { user, error } = await getSupabaseAuth().signUp(data);

        if (error) {
          setError(getErrorMessage(error));
          return;
        }

        if (user) {
          // 检查是否为demo模式
          const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('demo.supabase.co');
          
          if (isDemoMode) {
            // Demo模式：直接设置为已认证状态
            const mockUser: AuthenticatedUser = {
              id: user.id,
              email: user.email!,
              displayName: data.displayName,
              role: 'user',
              preferredLocale: data.preferredLocale || 'zh-CN',
              timezone: data.timezone || 'Asia/Shanghai',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isActive: true,
            };
            
            updateState({
              status: 'authenticated',
              user: mockUser,
              guestSession: null,
              isLoading: false,
              error: null,
            });
          } else {
            // 正式模式：注册成功，等待邮箱验证
            updateState({
              status: 'unauthenticated',
              user: null,
              guestSession: null,
              isLoading: false,
              error: null,
            });
          }
        }
      } catch (error) {
        console.error('Error during sign up:', error);
        setError('An unexpected error occurred during sign up');
      }
    },
    [clearError, updateState, setError]
  );

  // 用户登出
  const signOut = useCallback(async () => {
    try {
      clearError();
      updateState({ isLoading: true });

      const { error } = await getSupabaseAuth().signOut();

      if (error) {
        setError(getErrorMessage(error));
        return;
      }

      // 清除本地状态
      updateState({
        status: 'unauthenticated',
        user: null,
        guestSession: null,
        isLoading: false,
        error: null,
      });

      // 清除本地存储
      if (typeof window !== 'undefined') {
        localStorage.removeItem('qiflow_guest_token');
      }
    } catch (error) {
      console.error('Error during sign out:', error);
      setError('An unexpected error occurred during sign out');
    }
  }, [clearError, updateState, setError]);

  // 创建游客会话
  const createGuestSession = useCallback(
    async (params?: CreateGuestSessionParams): Promise<GuestSession> => {
      try {
        clearError();
        updateState({ isLoading: true });

        const { session, error } =
          await getSupabaseAuth().createGuestSession(params);

        if (error || !session) {
          const errorMsg = error
            ? getErrorMessage(error)
            : 'Failed to create guest session';
          setError(errorMsg);
          throw new Error(errorMsg);
        }

        updateState({
          status: 'guest',
          user: null,
          guestSession: session,
          isLoading: false,
          error: null,
        });

        return session;
      } catch (error) {
        console.error('Error creating guest session:', error);
        setError('Failed to create guest session');
        throw error;
      }
    },
    [clearError, updateState, setError]
  );

  // 更新游客会话
  const updateGuestSession = useCallback(
    async (updates: Partial<GuestSession>) => {
      try {
        if (!state.guestSession) {
          throw new Error('No active guest session');
        }

        clearError();

        const { error } = await getSupabaseAuth().updateGuestSession(
          state.guestSession.id,
          updates
        );

        if (error) {
          setError(getErrorMessage(error));
          return;
        }

        // 更新本地状态
        updateState({
          guestSession: {
            ...state.guestSession,
            ...updates,
          },
        });
      } catch (error) {
        console.error('Error updating guest session:', error);
        setError('Failed to update guest session');
      }
    },
    [state.guestSession, clearError, updateState, setError]
  );

  // 更新用户资料
  const updateProfile = useCallback(
    async (updates: UserProfileUpdate) => {
      try {
        if (!state.user) {
          throw new Error('User not authenticated');
        }

        clearError();

        const { error } = await getSupabaseAuth().updateUserProfile(
          state.user.id,
          updates
        );

        if (error) {
          setError(getErrorMessage(error));
          return;
        }

        // 更新本地状态
        updateState({
          user: {
            ...state.user,
            ...updates,
          },
        });
      } catch (error) {
        console.error('Error updating profile:', error);
        setError('Failed to update profile');
      }
    },
    [state.user, clearError, updateState, setError]
  );

  // 更新敏感数据
  const updateSensitiveData = useCallback(
    async (updates: SensitiveDataUpdate) => {
      try {
        if (!state.user) {
          throw new Error('User not authenticated');
        }

        clearError();

        const { error } = await getSupabaseAuth().updateSensitiveData(
          state.user.id,
          updates
        );

        if (error) {
          setError(getErrorMessage(error));
          return;
        }

        // 敏感数据更新成功，不更新本地状态（需要重新获取）
      } catch (error) {
        console.error('Error updating sensitive data:', error);
        setError('Failed to update sensitive data');
      }
    },
    [state.user, clearError, setError]
  );

  // 密码重置
  const resetPassword = useCallback(
    async (request: PasswordResetRequest) => {
      try {
        clearError();

        const { error } = await getSupabaseAuth().resetPassword(request.email);

        if (error) {
          setError(getErrorMessage(error));
          return;
        }
      } catch (error) {
        console.error('Error resetting password:', error);
        setError('Failed to reset password');
      }
    },
    [clearError, setError]
  );

  // 确认密码重置
  const confirmPasswordReset = useCallback(
    async (confirm: PasswordResetConfirm) => {
      try {
        clearError();
        // 实现密码重置确认逻辑
        // 这需要在密码重置页面中处理
      } catch (error) {
        console.error('Error confirming password reset:', error);
        setError('Failed to confirm password reset');
      }
    },
    [clearError, setError]
  );

  // 修改密码
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        clearError();
        // 实现密码修改逻辑
      } catch (error) {
        console.error('Error changing password:', error);
        setError('Failed to change password');
      }
    },
    [clearError, setError]
  );

  // 刷新会话
  const refreshSession = useCallback(async () => {
    try {
      const session = await getSupabaseAuth().getCurrentSession();

      if (session?.user && state.user) {
        // 重新获取用户资料
        const { user, error } = await getSupabaseAuth().getUserProfile(
          session.user.id
        );

        if (!error && user) {
          updateState({ user });
        }
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  }, [state.user, updateState]);

  // 验证会话
  const validateSession = useCallback(async (): Promise<SessionValidation> => {
    try {
      if (state.status === 'authenticated' && state.user) {
        const session = await getSupabaseAuth().getCurrentSession();
        return {
          isValid: !!session,
          user: state.user,
          expiresAt: session?.expires_at
            ? new Date(session.expires_at * 1000).toISOString()
            : undefined,
        };
      }

      if (state.status === 'guest' && state.guestSession) {
        const isValid = new Date(state.guestSession.expiresAt) > new Date();
        return {
          isValid,
          guestSession: state.guestSession,
          error: isValid ? undefined : 'GUEST_SESSION_EXPIRED',
        };
      }

      return { isValid: false };
    } catch (error) {
      console.error('Error validating session:', error);
      return { isValid: false, error: 'UNKNOWN_ERROR' };
    }
  }, [state]);

  // 权限检查
  const hasPermission = useCallback(
    (requiredRole: UserRole): boolean => {
      if (!state.user) return false;

      const roleHierarchy: Record<UserRole, number> = {
        guest: 0,
        user: 1,
        premium: 2,
        admin: 3,
      };

      return roleHierarchy[state.user.role] >= roleHierarchy[requiredRole];
    },
    [state.user]
  );

  // 检查配额
  const checkQuota = useCallback(
    async (quotaType: string): Promise<UsageQuota> => {
      // 实现配额检查逻辑
      // 这需要调用相应的API
      throw new Error('Not implemented');
    },
    []
  );

  // 工具函数
  const isAuthenticated = useCallback((): boolean => {
    return state.status === 'authenticated' && !!state.user;
  }, [state]);

  const isGuest = useCallback((): boolean => {
    return state.status === 'guest' && !!state.guestSession;
  }, [state]);

  const canPerformAction = useCallback(
    async (action: string): Promise<PermissionCheck> => {
      // 实现动作权限检查逻辑
      return { hasPermission: true };
    },
    []
  );

  // 监听认证状态变化
  useEffect(() => {
    if (!isInitialized) return;

    const {
      data: { subscription },
    } = getSupabaseAuth().onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);

      if (event === 'SIGNED_IN' && session?.user) {
        const { user, error } = await getSupabaseAuth().getUserProfile(
          session.user.id
        );

        if (!error && user) {
          updateState({
            status: 'authenticated',
            user,
            guestSession: null,
            isLoading: false,
            error: null,
          });
        }
      } else if (event === 'SIGNED_OUT') {
        updateState({
          status: 'unauthenticated',
          user: null,
          guestSession: null,
          isLoading: false,
          error: null,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isInitialized, updateState]);

  // 定期检查游客会话有效性
  useEffect(() => {
    if (state.status === 'guest' && state.guestSession) {
      const checkGuestSession = async () => {
        const validation = await validateSession();
        if (!validation.isValid) {
          // 游客会话已过期
          if (typeof window !== 'undefined') {
            localStorage.removeItem('qiflow_guest_token');
          }
          updateState({
            status: 'unauthenticated',
            guestSession: null,
            error: 'Guest session expired',
          });
        }
      };

      // 每5分钟检查一次
      sessionCheckRef.current = setInterval(checkGuestSession, 5 * 60 * 1000);

      return () => {
        if (sessionCheckRef.current) {
          clearInterval(sessionCheckRef.current);
        }
      };
    }
    return undefined;
  }, [state.status, state.guestSession, validateSession, updateState]);

  // 初始化
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // 错误消息映射
  const getErrorMessage = (error: AuthError): string => {
    const errorMessages: Record<AuthError, string> = {
      INVALID_CREDENTIALS: '邮箱或密码错误，请检查后重试',
      USER_NOT_FOUND: '该邮箱尚未注册，请先注册账户',
      EMAIL_ALREADY_EXISTS: '该邮箱已被注册，请直接登录或使用其他邮箱',
      WEAK_PASSWORD: '密码强度不够，请至少包含8个字符，包括大小写字母、数字和特殊字符',
      SESSION_EXPIRED: '登录会话已过期，请重新登录',
      GUEST_SESSION_EXPIRED: '游客会话已过期，请重新开始',
      MAX_ANALYSES_REACHED: '已达到最大分析次数限制，请升级账户或明天再试',
      NETWORK_ERROR: '网络连接错误，请检查网络连接后重试',
      UNKNOWN_ERROR: '系统暂时不可用，请稍后重试或联系客服',
    };

    return errorMessages[error] || '系统暂时不可用，请稍后重试或联系客服';
  };

  // 上下文值
  const contextValue: AuthContextValue = {
    // 状态
    status: state.status,
    user: state.user,
    guestSession: state.guestSession,
    isLoading: state.isLoading,
    error: state.error,

    // 认证操作
    signIn,
    signUp,
    signOut,

    // 游客模式
    createGuestSession,
    updateGuestSession,

    // 用户管理
    updateProfile,
    updateSensitiveData,

    // 密码管理
    resetPassword,
    confirmPasswordReset,
    changePassword,

    // 会话管理
    refreshSession,
    validateSession,

    // 权限检查
    hasPermission,
    checkQuota,

    // 工具函数
    isAuthenticated,
    isGuest,
    canPerformAction,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// 自定义Hook
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// 认证状态Hook
export function useAuthStatus(): AuthStatus {
  const { status } = useAuth();
  return status;
}

// 用户Hook
export function useUser(): AuthenticatedUser | null {
  const { user } = useAuth();
  return user;
}

// 游客会话Hook
export function useGuestSession(): GuestSession | null {
  const { guestSession } = useAuth();
  return guestSession;
}

// 权限Hook
export function usePermission(requiredRole: UserRole): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(requiredRole);
}