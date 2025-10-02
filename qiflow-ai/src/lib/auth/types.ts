// QiFlow AI 认证系统类型定义
// 深度思考：设计灵活且安全的认证类型系统，支持多种用户状态和会话管理

export type UserRole = 'guest' | 'user' | 'premium' | 'admin';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'guest';

// 用户基础信息接口
export interface BaseUser {
  id: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  role: UserRole;
  preferredLocale: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

// 认证用户完整信息
export interface AuthenticatedUser extends BaseUser {
  email: string;
  // 敏感信息通过专门的API获取，不在基础用户对象中暴露
}

// 游客会话信息
export interface GuestSession {
  id: string;
  sessionToken: string;
  tempBirthDate?: string;
  tempBirthTime?: string;
  tempBirthLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    timezone: string;
  };
  expiresAt: string;
  createdAt: string;
  lastAccessedAt: string;
  analysisCount: number;
  maxAnalyses: number;
}

// 认证状态接口
export interface AuthState {
  status: AuthStatus;
  user: AuthenticatedUser | null;
  guestSession: GuestSession | null;
  isLoading: boolean;
  error: string | null;
}

// 登录凭据
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// 注册信息
export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  preferredLocale?: string;
  timezone?: string;
}

// 游客会话创建参数
export interface CreateGuestSessionParams {
  tempBirthDate?: string;
  tempBirthTime?: string;
  tempBirthLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    timezone: string;
  };
  maxAnalyses?: number;
}

// 密码重置请求
export interface PasswordResetRequest {
  email: string;
}

// 密码重置确认
export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

// 用户资料更新
export interface UserProfileUpdate {
  displayName?: string;
  preferredLocale?: string;
  timezone?: string;
  avatarUrl?: string;
}

// 敏感信息更新（需要额外验证）
export interface SensitiveDataUpdate {
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  phone?: string;
  currentPassword: string; // 需要当前密码验证
}

// 认证错误类型
export type AuthError = 
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'EMAIL_ALREADY_EXISTS'
  | 'WEAK_PASSWORD'
  | 'SESSION_EXPIRED'
  | 'GUEST_SESSION_EXPIRED'
  | 'MAX_ANALYSES_REACHED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

// 认证事件类型
export type AuthEvent = 
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY'
  | 'GUEST_SESSION_CREATED'
  | 'GUEST_SESSION_EXPIRED'
  | 'TOKEN_REFRESHED';

// OAuth 提供商类型
export type OAuthProvider = 'google' | 'apple' | 'wechat' | 'github';

// 设备指纹信息
export interface DeviceFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  fingerprint: string;
}

// MFA 设置
export interface MFASetup {
  isEnabled: boolean;
  backupCodes: string[];
  totpSecret?: string;
  qrCode?: string;
}

// 认证配置
export interface AuthConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  guestSessionDuration: number; // 游客会话持续时间（小时）
  maxGuestAnalyses: number; // 游客最大分析次数
  passwordMinLength: number;
  enableGuestMode: boolean;
  enableSocialLogin: boolean;
  enableMFA: boolean;
  socialProviders: OAuthProvider[];
  rateLimitConfig: {
    loginAttempts: number;
    windowMs: number;
    blockDurationMs: number;
  };
}

// 会话验证结果
export interface SessionValidation {
  isValid: boolean;
  user?: AuthenticatedUser;
  guestSession?: GuestSession;
  error?: AuthError;
  expiresAt?: string;
}

// 权限检查结果
export interface PermissionCheck {
  hasPermission: boolean;
  reason?: string;
  requiredRole?: UserRole;
  currentRole?: UserRole;
}

// 使用配额信息
export interface UsageQuota {
  quotaType: 'analyses' | 'ai_queries' | 'houses';
  quotaLimit: number;
  quotaUsed: number;
  resetPeriod: 'monthly' | 'yearly' | 'never';
  lastResetAt: string;
  nextResetAt?: string;
}

// 认证上下文值
export interface AuthContextValue {
  // 状态
  status: AuthStatus;
  user: AuthenticatedUser | null;
  guestSession: GuestSession | null;
  isLoading: boolean;
  error: string | null;
  
  // 认证操作
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
  signOut: () => Promise<void>;
  
  // 游客模式
  createGuestSession: (params?: CreateGuestSessionParams) => Promise<GuestSession>;
  updateGuestSession: (updates: Partial<GuestSession>) => Promise<void>;
  
  // 用户管理
  updateProfile: (updates: UserProfileUpdate) => Promise<void>;
  updateSensitiveData: (updates: SensitiveDataUpdate) => Promise<void>;
  
  // 密码管理
  resetPassword: (request: PasswordResetRequest) => Promise<void>;
  confirmPasswordReset: (confirm: PasswordResetConfirm) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  
  // 会话管理
  refreshSession: () => Promise<void>;
  validateSession: () => Promise<SessionValidation>;
  
  // 权限检查
  hasPermission: (requiredRole: UserRole) => boolean;
  checkQuota: (quotaType: string) => Promise<UsageQuota>;
  
  // 工具函数
  isAuthenticated: () => boolean;
  isGuest: () => boolean;
  canPerformAction: (action: string) => Promise<PermissionCheck>;
}