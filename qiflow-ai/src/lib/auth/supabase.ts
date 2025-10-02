// QiFlow AI Supabase 认证客户端
// 深度思考：创建类型安全、错误处理完善的Supabase认证封装

import {
    createClient,
    Session,
    SupabaseClient,
    User,
} from '@supabase/supabase-js';
import {
    AuthenticatedUser,
    AuthError,
    CreateGuestSessionParams,
    GuestSession,
    LoginCredentials,
    RegisterData,
    SensitiveDataUpdate,
    UserProfileUpdate,
} from './types';

// 数据库类型定义
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          role: 'guest' | 'user' | 'premium' | 'admin';
          birth_date_encrypted: string | null;
          birth_time_encrypted: string | null;
          birth_location_encrypted: string | null;
          phone_encrypted: string | null;
          preferred_locale: string;
          timezone: string;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
          is_active: boolean;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: 'guest' | 'user' | 'premium' | 'admin';
          preferred_locale?: string;
          timezone?: string;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          role?: 'guest' | 'user' | 'premium' | 'admin';
          preferred_locale?: string;
          timezone?: string;
          last_login_at?: string | null;
          is_active?: boolean;
        };
      };
      guest_sessions: {
        Row: {
          id: string;
          session_token: string;
          temp_birth_date: string | null;
          temp_birth_time: string | null;
          temp_birth_location: {
            latitude: number;
            longitude: number;
            address: string;
            timezone: string;
          } | null;
          expires_at: string;
          created_at: string;
          last_accessed_at: string;
          analysis_count: number;
          max_analyses: number;
        };
        Insert: {
          session_token: string;
          temp_birth_date?: string | null;
          temp_birth_time?: string | null;
          temp_birth_location?: {
            latitude: number;
            longitude: number;
            address: string;
            timezone: string;
          } | null;
          expires_at: string;
          max_analyses?: number;
        };
        Update: {
          temp_birth_date?: string | null;
          temp_birth_time?: string | null;
          temp_birth_location?: {
            latitude: number;
            longitude: number;
            address: string;
            timezone: string;
          } | null;
          last_accessed_at?: string;
          analysis_count?: number;
        };
      };
    };
    Functions: {
      insert_user_with_encryption: {
        Args: {
          p_id: string;
          p_email: string;
          p_display_name?: string;
          p_avatar_url?: string;
          p_role?: string;
          p_birth_date?: string;
          p_birth_time?: string;
          p_birth_location?: string;
          p_phone?: string;
          p_preferred_locale?: string;
          p_timezone?: string;
        };
        Returns: string;
      };
      update_user_sensitive_data: {
        Args: {
          p_user_id: string;
          p_birth_date?: string;
          p_birth_time?: string;
          p_birth_location?: string;
          p_phone?: string;
        };
        Returns: boolean;
      };
    };
  };
}

class SupabaseAuthClient {
  private client: SupabaseClient<Database>;
  private static instance: SupabaseAuthClient;

  private constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // 在开发环境中，使用模拟客户端而不是抛出错误
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          'Supabase environment variables not configured, using mock client'
        );
        this.client = this.createMockClient();
        return;
      }
      throw new Error(
        'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY'
      );
    }

    this.client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
      global: {
        headers: {
          'X-Client-Info': 'qiflow-ai@1.0.0',
        },
      },
    });
  }

  private createMockClient(): any {
    return {
      auth: {
        getSession: () =>
          Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signUp: () =>
          Promise.resolve({
            data: { 
              user: {
                id: 'mock-user-id',
                email: 'mock@example.com',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                aud: 'authenticated',
                role: 'authenticated',
                email_confirmed_at: null,
                phone: null,
                confirmation_sent_at: null,
                recovery_sent_at: null,
                last_sign_in_at: null,
                app_metadata: {},
                user_metadata: {},
                identities: [],
                factors: []
              }
            },
            error: null,
          }),
        signInWithPassword: () =>
          Promise.resolve({
            data: { 
              user: {
                id: 'mock-user-id',
                email: 'mock@example.com',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                aud: 'authenticated',
                role: 'authenticated',
                email_confirmed_at: new Date().toISOString(),
                phone: null,
                confirmation_sent_at: null,
                recovery_sent_at: null,
                last_sign_in_at: new Date().toISOString(),
                app_metadata: {},
                user_metadata: {},
                identities: [],
                factors: []
              },
              session: {
                access_token: 'mock-access-token',
                refresh_token: 'mock-refresh-token',
                expires_in: 3600,
                expires_at: Math.floor(Date.now() / 1000) + 3600,
                token_type: 'bearer',
                user: {
                  id: 'mock-user-id',
                  email: 'mock@example.com',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  aud: 'authenticated',
                  role: 'authenticated',
                  email_confirmed_at: new Date().toISOString(),
                  phone: null,
                  confirmation_sent_at: null,
                  recovery_sent_at: null,
                  last_sign_in_at: new Date().toISOString(),
                  app_metadata: {},
                  user_metadata: {},
                  identities: [],
                  factors: []
                }
              }
            },
            error: null,
          }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        resetPasswordForEmail: () => Promise.resolve({ error: null }),
      },
      from: () => ({
        insert: () => ({
          select: () => ({
            single: () =>
              Promise.resolve({
                data: {
                  id: 'mock-guest-session-id',
                  session_token: 'mock-session-token',
                  temp_birth_date: null,
                  temp_birth_time: null,
                  temp_birth_location: null,
                  expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                  created_at: new Date().toISOString(),
                  last_accessed_at: new Date().toISOString(),
                  analysis_count: 0,
                  max_analyses: 3
                },
                error: null,
              }),
          }),
        }),
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({
                data: {
                  id: 'mock-user-id',
                  email: 'mock@example.com',
                  display_name: 'Mock User',
                  avatar_url: null,
                  role: 'user',
                  birth_date_encrypted: null,
                  birth_time_encrypted: null,
                  birth_location_encrypted: null,
                  phone_encrypted: null,
                  preferred_locale: 'zh-CN',
                  timezone: 'Asia/Shanghai',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  last_login_at: new Date().toISOString(),
                  is_active: true
                },
                error: null,
              }),
          }),
        }),
        update: () => ({
          eq: () => Promise.resolve({ error: null })
        }),
      }),
      rpc: () => Promise.resolve({ data: 'success', error: null }),
    };
  }

  public static getInstance(): SupabaseAuthClient {
    if (!SupabaseAuthClient.instance) {
      SupabaseAuthClient.instance = new SupabaseAuthClient();
    }
    return SupabaseAuthClient.instance;
  }

  // 获取当前会话
  public async getCurrentSession(): Promise<Session | null> {
    try {
      const {
        data: { session },
        error,
      } = await this.client.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  // 获取当前用户
  public async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
        error,
      } = await this.client.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // 用户注册
  public async signUp(
    data: RegisterData
  ): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      // 检查是否使用模拟客户端
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('mock-project') || supabaseUrl.includes('demo.supabase.co')) {
        console.warn('Development mode: Using mock authentication');
        // 在开发模式下，返回模拟的成功响应
        return { 
          user: {
            id: `dev-user-${Date.now()}`,
            email: data.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            aud: 'authenticated',
            role: 'authenticated',
            email_confirmed_at: new Date().toISOString(),
            phone: undefined,
            confirmation_sent_at: undefined,
            recovery_sent_at: undefined,
            last_sign_in_at: null,
            app_metadata: {},
            user_metadata: {
              display_name: data.displayName,
              preferred_locale: data.preferredLocale || 'zh-CN',
              timezone: data.timezone || 'Asia/Shanghai',
            },
            identities: [],
            factors: []
          } as any, 
          error: null 
        };
      }

      const { data: authData, error: authError } =
        await this.client.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              display_name: data.displayName,
              preferred_locale: data.preferredLocale || 'zh-CN',
              timezone: data.timezone || 'Asia/Shanghai',
            },
          },
        });

      if (authError) {
        return { user: null, error: this.mapAuthError(authError) };
      }

      // 创建用户资料
      if (authData.user) {
        try {
          await this.createUserProfile(authData.user, data);
        } catch (profileError) {
          console.warn('Failed to create user profile:', profileError);
          // 不阻塞注册流程，用户资料可以稍后创建
        }
        
        // 登录/注册成功后尝试触发游客数据合并（若存在HttpOnly游客cookie，服务端将处理）
        if (typeof window !== 'undefined') {
          try {
            await fetch('/api/guest/merge', { method: 'POST' });
          } catch (e) {
            console.warn('guest merge after signUp failed (ignored):', e);
          }
        }
      }

      return { user: authData.user, error: null };
    } catch (error) {
      console.error('Error during sign up:', error);
      return { user: null, error: 'UNKNOWN_ERROR' };
    }
  }

  // 用户登录
  public async signIn(
    credentials: LoginCredentials
  ): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      // 检查是否使用模拟客户端
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('mock-project') || supabaseUrl.includes('demo.supabase.co')) {
        console.warn('Development mode: Using mock authentication for login');
        // 在开发模式下，返回模拟的成功响应
        return { 
          user: {
            id: `dev-user-${Date.now()}`,
            email: credentials.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            aud: 'authenticated',
            role: 'authenticated',
            email_confirmed_at: new Date().toISOString(),
            phone: undefined,
            confirmation_sent_at: undefined,
            recovery_sent_at: undefined,
            last_sign_in_at: new Date().toISOString(),
            app_metadata: {},
            user_metadata: {},
            identities: [],
            factors: []
          },
          error: null
        };
      }

      const { data, error } = await this.client.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { user: null, error: this.mapAuthError(error) };
      }

      // 更新最后登录时间
      if (data.user) {
        await this.updateLastLoginTime(data.user.id);
        // 登录成功后尝试触发游客数据合并
        if (typeof window !== 'undefined') {
          try {
            await fetch('/api/guest/merge', { method: 'POST' });
          } catch (e) {
            console.warn('guest merge after signIn failed (ignored):', e);
          }
        }
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Error during sign in:', error);
      return { user: null, error: 'UNKNOWN_ERROR' };
    }
  }

  // 第三方登录（Google/Apple）。微信为占位，需网关/第三方平台对接
  public async signInWithProvider(
    provider: 'google' | 'apple' | 'wechat'
  ): Promise<{ error: AuthError | null }> {
    try {
      if (provider === 'wechat') {
        const wechatAuthUrl = process.env.NEXT_PUBLIC_WECHAT_OAUTH_URL;
        if (!wechatAuthUrl) {
          console.warn('WeChat OAuth URL not configured');
          return { error: 'UNKNOWN_ERROR' };
        }
        if (typeof window !== 'undefined') {
          window.location.href = wechatAuthUrl;
        }
        return { error: null };
      }

      const { error } = await this.client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo:
            typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      if (error) return { error: this.mapAuthError(error) };
      return { error: null };
    } catch (error) {
      console.error('Error during OAuth sign in:', error);
      return { error: 'UNKNOWN_ERROR' };
    }
  }

  // 用户登出
  public async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await this.client.auth.signOut();
      if (error) {
        return { error: this.mapAuthError(error) };
      }
      return { error: null };
    } catch (error) {
      console.error('Error during sign out:', error);
      return { error: 'UNKNOWN_ERROR' };
    }
  }

  // 创建游客会话
  public async createGuestSession(
    params?: CreateGuestSessionParams
  ): Promise<{ session: GuestSession | null; error: AuthError | null }> {
    try {
      // 生成安全的会话令牌
      const sessionToken = this.generateSecureToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24小时过期

      const { data, error } = await this.client
        .from('guest_sessions')
        .insert({
          session_token: sessionToken,
          temp_birth_date: params?.tempBirthDate || null,
          temp_birth_time: params?.tempBirthTime || null,
          temp_birth_location: params?.tempBirthLocation || null,
          expires_at: expiresAt.toISOString(),
          max_analyses: params?.maxAnalyses || 3,
        } as any)
        .select()
        .single();

      if (error) {
        console.error('Error creating guest session:', error);
        return { session: null, error: 'UNKNOWN_ERROR' };
      }

      // 类型安全的映射
      const guestSession: GuestSession = {
        id: (data as any).id,
        sessionToken: (data as any).session_token,
        tempBirthDate: (data as any).temp_birth_date || undefined,
        tempBirthTime: (data as any).temp_birth_time || undefined,
        tempBirthLocation: (data as any).temp_birth_location || undefined,
        expiresAt: (data as any).expires_at,
        createdAt: (data as any).created_at,
        lastAccessedAt: (data as any).last_accessed_at,
        analysisCount: (data as any).analysis_count,
        maxAnalyses: (data as any).max_analyses,
      };

      // 将会话令牌存储到localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('qiflow_guest_token', sessionToken);
      }

      return { session: guestSession, error: null };
    } catch (error) {
      console.error('Error creating guest session:', error);
      return { session: null, error: 'UNKNOWN_ERROR' };
    }
  }

  // 获取游客会话
  public async getGuestSession(
    sessionToken: string
  ): Promise<{ session: GuestSession | null; error: AuthError | null }> {
    try {
      const { data, error } = await this.client
        .from('guest_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { session: null, error: 'GUEST_SESSION_EXPIRED' };
        }
        return { session: null, error: 'UNKNOWN_ERROR' };
      }

      // 更新最后访问时间
      const updateData = { last_accessed_at: new Date().toISOString() };
      await (this.client as any)
        .from('guest_sessions')
        .update(updateData)
        .eq('id', (data as any).id);

      const guestSession: GuestSession = {
        id: (data as any).id,
        sessionToken: (data as any).session_token,
        tempBirthDate: (data as any).temp_birth_date || undefined,
        tempBirthTime: (data as any).temp_birth_time || undefined,
        tempBirthLocation: (data as any).temp_birth_location || undefined,
        expiresAt: (data as any).expires_at,
        createdAt: (data as any).created_at,
        lastAccessedAt: new Date().toISOString(),
        analysisCount: (data as any).analysis_count,
        maxAnalyses: (data as any).max_analyses,
      };

      return { session: guestSession, error: null };
    } catch (error) {
      console.error('Error getting guest session:', error);
      return { session: null, error: 'UNKNOWN_ERROR' };
    }
  }

  // 更新游客会话
  public async updateGuestSession(
    sessionId: string,
    updates: Partial<GuestSession>
  ): Promise<{ error: AuthError | null }> {
    try {
      const updateData: Record<string, unknown> = {};

      if (updates.tempBirthDate !== undefined) {
        updateData.temp_birth_date = updates.tempBirthDate;
      }
      if (updates.tempBirthTime !== undefined) {
        updateData.temp_birth_time = updates.tempBirthTime;
      }
      if (updates.tempBirthLocation !== undefined) {
        updateData.temp_birth_location = updates.tempBirthLocation;
      }
      if (updates.analysisCount !== undefined) {
        updateData.analysis_count = updates.analysisCount;
      }

      const { error } = await (this.client as any)
        .from('guest_sessions')
        .update(updateData)
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating guest session:', error);
        return { error: 'UNKNOWN_ERROR' };
      }

      return { error: null };
    } catch (error) {
      console.error('Error updating guest session:', error);
      return { error: 'UNKNOWN_ERROR' };
    }
  }

  // 获取用户资料
  public async getUserProfile(
    userId: string
  ): Promise<{ user: AuthenticatedUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return { user: null, error: 'USER_NOT_FOUND' };
      }

      const user: AuthenticatedUser = {
        id: (data as any).id,
        email: (data as any).email,
        displayName: (data as any).display_name || undefined,
        avatarUrl: (data as any).avatar_url || undefined,
        role: (data as any).role,
        preferredLocale: (data as any).preferred_locale,
        timezone: (data as any).timezone,
        createdAt: (data as any).created_at,
        updatedAt: (data as any).updated_at,
        lastLoginAt: (data as any).last_login_at || undefined,
        isActive: (data as any).is_active,
      };

      return { user, error: null };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return { user: null, error: 'UNKNOWN_ERROR' };
    }
  }

  // 更新用户资料
  public async updateUserProfile(
    userId: string,
    updates: UserProfileUpdate
  ): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await (this.client as any)
        .from('users')
        .update({
          display_name: updates.displayName,
          preferred_locale: updates.preferredLocale,
          timezone: updates.timezone,
          avatar_url: updates.avatarUrl,
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user profile:', error);
        return { error: 'UNKNOWN_ERROR' };
      }

      return { error: null };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { error: 'UNKNOWN_ERROR' };
    }
  }

  // 更新敏感数据
  public async updateSensitiveData(
    userId: string,
    updates: SensitiveDataUpdate
  ): Promise<{ error: AuthError | null }> {
    try {
      // 首先验证当前密码
      const { error: authError } = await this.client.auth.signInWithPassword({
        email: (await this.getCurrentUser())?.email || '',
        password: updates.currentPassword,
      });

      if (authError) {
        return { error: 'INVALID_CREDENTIALS' };
      }

      // 调用加密存储函数
      const { error } = await (this.client as any).rpc(
        'update_user_sensitive_data',
        {
          p_user_id: userId,
          p_birth_date: updates.birthDate,
          p_birth_time: updates.birthTime,
          p_birth_location: updates.birthLocation,
          p_phone: updates.phone,
        }
      );

      if (error) {
        console.error('Error updating sensitive data:', error);
        return { error: 'UNKNOWN_ERROR' };
      }

      return { error: null };
    } catch (error) {
      console.error('Error updating sensitive data:', error);
      return { error: 'UNKNOWN_ERROR' };
    }
  }

  // 密码重置
  public async resetPassword(
    email: string
  ): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await this.client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return { error: this.mapAuthError(error) };
      }

      return { error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { error: 'UNKNOWN_ERROR' };
    }
  }

  // 监听认证状态变化
  public onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ) {
    return this.client.auth.onAuthStateChange(callback);
  }

  // 私有方法

  private async createUserProfile(
    user: User,
    data: RegisterData
  ): Promise<void> {
    try {
      // 检查环境配置
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes('demo.supabase.co')) {
        console.log('Demo mode: Skipping user profile creation');
        return;
      }

      // 检查是否是模拟客户端
      if (this.client && typeof this.client === 'object' && 'auth' in this.client) {
        const mockClient = this.client as any;
        if (mockClient.auth && mockClient.auth.signUp && mockClient.auth.signUp().then) {
          // 这是模拟客户端，跳过数据库操作
          console.log('Mock client: Skipping user profile creation');
          return;
        }
      }

      // 尝试使用RPC函数创建用户资料
      try {
        await (this.client as any).rpc('insert_user_with_encryption', {
          p_id: user.id,
          p_email: user.email!,
          p_display_name: data.displayName,
          p_preferred_locale: data.preferredLocale || 'zh-CN',
          p_timezone: data.timezone || 'Asia/Shanghai',
        });
      } catch (rpcError) {
        console.warn('RPC function failed, trying direct insert:', rpcError);
        
        // 如果RPC函数不存在，尝试直接插入
        await (this.client as any).from('users').insert({
          id: user.id,
          email: user.email!,
          display_name: data.displayName,
          preferred_locale: data.preferredLocale || 'zh-CN',
          timezone: data.timezone || 'Asia/Shanghai',
          role: 'user',
          is_active: true,
        });
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error; // 重新抛出错误，让调用者处理
    }
  }

  private async updateLastLoginTime(userId: string): Promise<void> {
    try {
      // 检查是否是模拟客户端
      if (this.client && typeof this.client === 'object' && 'auth' in this.client) {
        const mockClient = this.client as any;
        if (mockClient.auth && mockClient.auth.signUp && mockClient.auth.signUp().then) {
          // 这是模拟客户端，跳过数据库操作
          console.log('Mock client: Skipping last login time update');
          return;
        }
      }

      await (this.client as any)
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating last login time:', error);
    }
  }

  private generateSecureToken(): string {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for server-side
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join(
      ''
    );
  }

  private mapAuthError(
    error: Error | { message?: string; code?: string } | null
  ): AuthError {
    if (!error) return 'UNKNOWN_ERROR';

    const message = error.message || '';
    const code = (error as any).code || '';

    // 根据Supabase错误代码和消息进行映射
    if (
      code === 'invalid_credentials' ||
      message.includes('Invalid login credentials')
    ) {
      return 'INVALID_CREDENTIALS';
    }
    if (code === 'user_not_found' || message.includes('User not found')) {
      return 'USER_NOT_FOUND';
    }
    if (
      code === 'email_address_not_authorized' ||
      message.includes('Email already registered')
    ) {
      return 'EMAIL_ALREADY_EXISTS';
    }
    if (
      code === 'weak_password' ||
      message.includes('Password should be at least 6 characters')
    ) {
      return 'WEAK_PASSWORD';
    }
    if (code === 'jwt_expired' || message.includes('JWT expired')) {
      return 'SESSION_EXPIRED';
    }
    if (message.includes('Network error') || message.includes('fetch')) {
      return 'NETWORK_ERROR';
    }
    if (message.includes('Mock client')) {
      return 'UNKNOWN_ERROR';
    }

    return 'UNKNOWN_ERROR';
  }

  // 获取客户端实例（用于其他操作）
  public getClient(): SupabaseClient<Database> {
    return this.client;
  }
}

// 延迟实例化，避免在构建/导入阶段因环境变量缺失导致页面崩溃
export const getSupabaseAuth = (): SupabaseAuthClient => {
  return SupabaseAuthClient.getInstance();
};
