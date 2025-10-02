import { createClient, SupabaseClient, User, Session, AuthError as SupabaseAuthError } from '@supabase/supabase-js';
import { 
  AuthenticatedUser, 
  LoginCredentials, 
  RegisterData,
  AuthError,
  SessionValidation,
  UserProfileUpdate,
  SensitiveDataUpdate,
  OAuthProvider,
  MFASetup,
  DeviceFingerprint,
  AuthConfig
} from './types';
import { guestSessionManager } from './guest-session';

// 认证管理器类
export class AuthManager {
  private supabase: SupabaseClient;
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }

  // 邮箱注册
  async signUp(data: RegisterData): Promise<{ user: User; session: Session | null }> {
    try {
      const { data: authData, error } = await this.supabase.auth.signUp({
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

      if (error) {
        throw this.mapSupabaseError(error);
      }

      // 创建用户记录
      if (authData.user) {
        await this.createUserProfile(authData.user, {
          displayName: data.displayName,
          preferredLocale: data.preferredLocale || 'zh-CN',
          timezone: data.timezone || 'Asia/Shanghai',
        });
      }

      return {
        user: authData.user!,
        session: authData.session,
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // 邮箱登录
  async signIn(credentials: LoginCredentials): Promise<{ user: User; session: Session }> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw this.mapSupabaseError(error);
      }

      if (!data.user || !data.session) {
        throw new Error('Authentication failed');
      }

      // 更新最后登录时间
      await this.updateLastLogin(data.user.id);

      // 检查是否有游客会话需要合并
      await this.mergeGuestSessionIfExists(data.user.id);

      return {
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // 第三方登录
  async signInWithOAuth(provider: OAuthProvider, redirectTo?: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw this.mapSupabaseError(error);
      }
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // 微信登录 (特殊处理)
  async signInWithWeChat(): Promise<void> {
    try {
      // 微信登录需要特殊的处理流程
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: 'wechat' as any,
        options: {
          redirectTo: `${window.location.origin}/api/auth/wechat/callback`,
        },
      });

      if (error) {
        throw this.mapSupabaseError(error);
      }
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // 登出
  async signOut(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) {
        throw this.mapSupabaseError(error);
      }
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // 密码重置
  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw this.mapSupabaseError(error);
      }
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // 确认密码重置
  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw this.mapSupabaseError(error);
      }
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // 更新用户资料
  async updateProfile(updates: UserProfileUpdate): Promise<void> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await this.supabase
        .from('users')
        .update({
          display_name: updates.displayName,
          preferred_locale: updates.preferredLocale,
          timezone: updates.timezone,
          avatar_url: updates.avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw new Error(`Failed to update profile: ${error.message}`);
      }
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // 更新敏感数据
  async updateSensitiveData(updates: SensitiveDataUpdate): Promise<void> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // 验证当前密码
      const { error: verifyError } = await this.supabase.auth.signInWithPassword({
        email: user.email!,
        password: updates.currentPassword,
      });

      if (verifyError) {
        throw new Error('Current password is incorrect');
      }

      // 加密敏感数据
      const encryptedData: any = {};
      if (updates.birthDate) {
        encryptedData.birth_date_encrypted = await this.encryptData(updates.birthDate);
      }
      if (updates.birthTime) {
        encryptedData.birth_time_encrypted = await this.encryptData(updates.birthTime);
      }
      if (updates.birthLocation) {
        encryptedData.birth_location_encrypted = await this.encryptData(updates.birthLocation);
      }
      if (updates.phone) {
        encryptedData.phone_encrypted = await this.encryptData(updates.phone);
      }

      const { error } = await this.supabase
        .from('users')
        .update({
          ...encryptedData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw new Error(`Failed to update sensitive data: ${error.message}`);
      }
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // 获取当前用户
  async getCurrentUser(): Promise<AuthenticatedUser | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      if (error || !user) {
        return null;
      }

      return await this.getUserProfile(user.id);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // 验证会话
  async validateSession(): Promise<SessionValidation> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (error || !session) {
        return { isValid: false, error: 'SESSION_EXPIRED' };
      }

      const user = await this.getUserProfile(session.user.id);
      if (!user) {
        return { isValid: false, error: 'USER_NOT_FOUND' };
      }

      return {
        isValid: true,
        user,
        expiresAt: new Date(session.expires_at! * 1000).toISOString(),
      };
    } catch (error) {
      return { isValid: false, error: 'UNKNOWN_ERROR' };
    }
  }

  // 刷新会话
  async refreshSession(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.refreshSession();
      if (error) {
        throw this.mapSupabaseError(error);
      }
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // 设置 MFA
  async setupMFA(): Promise<MFASetup> {
    try {
      const { data, error } = await this.supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (error) {
        throw this.mapSupabaseError(error);
      }

      return {
        isEnabled: true,
        backupCodes: (data as any).backup_codes || [],
        totpSecret: (data as any).secret,
        qrCode: (data as any).qr_code,
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // 验证 MFA
  async verifyMFA(code: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.mfa.verify({
        factorId: 'totp',
        code,
        challengeId: 'default' as any,
      });

      if (error) {
        throw this.mapSupabaseError(error);
      }
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // 生成设备指纹
  generateDeviceFingerprint(): DeviceFingerprint {
    const userAgent = navigator.userAgent;
    const screenResolution = `${screen.width}x${screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    const platform = navigator.platform;

    const fingerprint = this.hashString(
      `${userAgent}${screenResolution}${timezone}${language}${platform}`
    );

    return {
      userAgent,
      screenResolution,
      timezone,
      language,
      platform,
      fingerprint,
    };
  }

  // 私有方法

  private async createUserProfile(user: User, profileData: any): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email!,
        display_name: profileData.displayName,
        preferred_locale: profileData.preferredLocale,
        timezone: profileData.timezone,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }
  }

  private async getUserProfile(userId: string): Promise<AuthenticatedUser | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      displayName: data.display_name,
      avatarUrl: data.avatar_url,
      role: data.role,
      preferredLocale: data.preferred_locale,
      timezone: data.timezone,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      lastLoginAt: data.last_login_at,
      isActive: data.is_active,
    };
  }

  private async updateLastLogin(userId: string): Promise<void> {
    await this.supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);
  }

  private async mergeGuestSessionIfExists(userId: string): Promise<void> {
    // 检查是否有游客会话需要合并
    const guestSessionToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('guest_session_token='))
      ?.split('=')[1];

    if (guestSessionToken) {
      try {
        const validation = await guestSessionManager.validateSession(guestSessionToken);
        if (validation.isValid && validation.session) {
          // 调用合并 API
          await fetch('/api/guest/merge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              guestSessionId: validation.session.id,
            }),
          });
        }
      } catch (error) {
        console.error('Failed to merge guest session:', error);
      }
    }
  }

  private async encryptData(data: string): Promise<string> {
    // 使用 Supabase 的加密功能
    const { data: encrypted, error } = await this.supabase.rpc('encrypt_data', {
      data_to_encrypt: data,
    });

    if (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }

    return encrypted;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private mapSupabaseError(error: SupabaseAuthError): AuthError {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'INVALID_CREDENTIALS';
      case 'User not found':
        return 'USER_NOT_FOUND';
      case 'Email already registered':
        return 'EMAIL_ALREADY_EXISTS';
      case 'Password should be at least 6 characters':
        return 'WEAK_PASSWORD';
      case 'Session expired':
        return 'SESSION_EXPIRED';
      default:
        return 'UNKNOWN_ERROR';
    }
  }

  private handleAuthError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('Authentication error occurred');
  }
}

// 创建默认认证管理器实例
export const authManager = new AuthManager({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  guestSessionDuration: 24,
  maxGuestAnalyses: 3,
  passwordMinLength: 6,
  enableGuestMode: true,
  enableSocialLogin: true,
  enableMFA: true,
  socialProviders: ['google', 'apple', 'wechat'],
  rateLimitConfig: {
    loginAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15分钟
    blockDurationMs: 30 * 60 * 1000, // 30分钟
  },
});
