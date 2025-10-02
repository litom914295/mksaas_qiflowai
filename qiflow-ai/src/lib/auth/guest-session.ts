import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// 游客会话类型定义
export type GuestSession = {
  id: string;
  sessionToken: string;
  deviceFingerprint?: string;
  userAgent?: string;
  ipAddress?: string;
  metadata: Record<string, unknown>;

  // 临时数据
  tempBirthDate?: Date;
  tempBirthTime?: string;
  tempBirthLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    country: string;
  };
  tempContact?: {
    email?: string;
    phone?: string;
  };

  // 会话管理
  expiresAt: Date;
  createdAt: Date;
  lastAccessedAt: Date;
  renewedAt?: Date;
  renewalCount: number;

  // 使用限制
  analysisCount: number;
  maxAnalyses: number;
  aiQueriesCount: number;
  maxAiQueries: number;

  // 状态
  isActive: boolean;
  mergedToUserId?: string;
  mergedAt?: Date;
};

export type CreateGuestSessionParams = {
  deviceFingerprint?: string;
  userAgent?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
  maxAnalyses?: number;
  maxAiQueries?: number;
};

export type GuestSessionValidation = {
  isValid: boolean;
  session?: GuestSession;
  error?: string;
  needsRenewal?: boolean;
};

// 会话配置
const SESSION_CONFIG = {
  DEFAULT_TTL_HOURS: 24,
  RENEWAL_THRESHOLD_HOURS: 6,
  MAX_RENEWALS: 3,
  DEFAULT_MAX_ANALYSES: 3,
  DEFAULT_MAX_AI_QUERIES: 10,
} as const;

// 签名密钥 (生产环境必须从环境变量获取)
const SIGNING_SECRET = (() => {
  const secret = process.env.GUEST_SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'GUEST_SESSION_SECRET environment variable is required in production'
      );
    }
    console.warn(
      'Using default guest session secret in development. Set GUEST_SESSION_SECRET for production.'
    );
    return 'dev-secret-key-change-in-production';
  }
  if (secret.length < 32) {
    throw new Error('GUEST_SESSION_SECRET must be at least 32 characters long');
  }
  return secret;
})();

// Mock Supabase客户端用于测试环境
function createMockSupabaseClient() {
  return {
    from: (table: string) => ({
      insert: (data: any) => ({
        select: () => ({
          single: () =>
            Promise.resolve({
              data: {
                id: crypto.randomUUID(),
                ...data,
                created_at: new Date().toISOString(),
                last_accessed_at: new Date().toISOString(),
                analysis_count: 0,
                ai_queries_count: 0,
                is_active: true,
              },
              error: null,
            }),
        }),
      }),
      select: (columns = '*') => ({
        eq: (column: string, value: any) => ({
          eq: (column2: string, value2: any) => ({
            single: () =>
              Promise.resolve({
                data: null,
                error: { code: 'PGRST116', message: 'No rows found' },
              }),
          }),
          single: () =>
            Promise.resolve({
              data: null,
              error: { code: 'PGRST116', message: 'No rows found' },
            }),
        }),
        lt: (column: string, value: any) => ({
          select: (columns: string) =>
            Promise.resolve({
              data: [],
              error: null,
            }),
        }),
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: () =>
              Promise.resolve({
                data: {
                  id: value,
                  ...data,
                  updated_at: new Date().toISOString(),
                },
                error: null,
              }),
          }),
        }),
      }),
      delete: () => ({
        lt: (column: string, value: any) => ({
          select: (columns: string) =>
            Promise.resolve({
              data: [],
              error: null,
            }),
        }),
      }),
    }),
    rpc: (functionName: string, params: any) =>
      Promise.resolve({
        data: null,
        error: null,
      }),
  };
}

class GuestSessionManager {
  private supabase: any;
  private initialized = false;

  constructor() {
    // 延迟初始化，避免在模块加载时因环境变量缺失导致错误
    this.initialize();
  }

  private initialize() {
    if (this.initialized) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      // 在非生产环境缺少环境变量时，回退到 mock 客户端，避免本地/测试报错
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          'Supabase environment variables not configured, using mock guest session manager'
        );
        this.supabase = createMockSupabaseClient();
      } else {
        throw new Error(
          'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY'
        );
      }
    } else {
      this.supabase = createClient(supabaseUrl, serviceRoleKey);
    }

    this.initialized = true;
  }

  private ensureInitialized() {
    if (!this.initialized) {
      this.initialize();
    }
  }

  // 生成设备指纹
  generateDeviceFingerprint(
    userAgent: string,
    additionalData?: string
  ): string {
    const data = `${userAgent}${additionalData || ''}`;
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex')
      .substring(0, 32);
  }

  // 生成签名令牌
  generateSignedToken(payload: Record<string, unknown>): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
      'base64url'
    );
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      'base64url'
    );

    const signature = crypto
      .createHmac('sha256', SIGNING_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  // 验证签名令牌
  verifySignedToken(token: string): {
    valid: boolean;
    payload?: Record<string, unknown>;
  } {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return { valid: false };

      const [header, payload, signature] = parts;

      // 验证签名
      const expectedSignature = crypto
        .createHmac('sha256', SIGNING_SECRET)
        .update(`${header}.${payload}`)
        .digest('base64url');

      if (signature !== expectedSignature) return { valid: false };

      // 解析载荷
      const decodedPayload = JSON.parse(
        Buffer.from(payload, 'base64url').toString()
      );

      // 检查过期时间
      if (decodedPayload.exp && Date.now() > decodedPayload.exp * 1000) {
        return { valid: false };
      }

      return { valid: true, payload: decodedPayload };
    } catch {
      return { valid: false };
    }
  }

  // 创建游客会话
  async createSession(
    params: CreateGuestSessionParams = {}
  ): Promise<GuestSession> {
    this.ensureInitialized();
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + SESSION_CONFIG.DEFAULT_TTL_HOURS * 60 * 60 * 1000
    );

    const sessionId = crypto.randomUUID();
    const sessionToken = this.generateSignedToken({
      sessionId,
      exp: Math.floor(expiresAt.getTime() / 1000),
      iat: Math.floor(now.getTime() / 1000),
    });

    const sessionData = {
      id: sessionId,
      session_token: sessionToken,
      device_fingerprint: params.deviceFingerprint,
      user_agent: params.userAgent,
      ip_address: params.ipAddress,
      metadata: params.metadata || {},
      expires_at: expiresAt.toISOString(),
      max_analyses: params.maxAnalyses || SESSION_CONFIG.DEFAULT_MAX_ANALYSES,
      max_ai_queries:
        params.maxAiQueries || SESSION_CONFIG.DEFAULT_MAX_AI_QUERIES,
    };

    try {
      const { data, error } = await this.supabase
        .from('guest_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create guest session: ${error.message}`);
      }

      return this.mapDbToSession(data);
    } catch (error) {
      // 如果是mock客户端或数据库错误，创建一个内存中的会话
      console.warn(
        'Database operation failed, creating in-memory session:',
        error
      );

      const mockSession: GuestSession = {
        id: sessionId,
        sessionToken,
        deviceFingerprint: params.deviceFingerprint,
        userAgent: params.userAgent,
        ipAddress: params.ipAddress,
        metadata: params.metadata || {},
        expiresAt,
        createdAt: now,
        lastAccessedAt: now,
        renewalCount: 0,
        analysisCount: 0,
        maxAnalyses: params.maxAnalyses || SESSION_CONFIG.DEFAULT_MAX_ANALYSES,
        aiQueriesCount: 0,
        maxAiQueries:
          params.maxAiQueries || SESSION_CONFIG.DEFAULT_MAX_AI_QUERIES,
        isActive: true,
      };

      return mockSession;
    }
  }

  // 验证会话
  async validateSession(sessionToken: string): Promise<GuestSessionValidation> {
    this.ensureInitialized();
    // 首先验证令牌签名
    const tokenValidation = this.verifySignedToken(sessionToken);
    if (!tokenValidation.valid || !tokenValidation.payload) {
      return { isValid: false, error: 'Invalid session token' };
    }

    const sessionId = tokenValidation.payload.sessionId as string;
    if (!sessionId) {
      return { isValid: false, error: 'Invalid session ID' };
    }

    try {
      // 从数据库获取会话
      const { data, error } = await this.supabase
        .from('guest_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return { isValid: false, error: 'Session not found or inactive' };
      }

      const session = this.mapDbToSession(data);

      // 检查是否过期
      if (new Date() > session.expiresAt) {
        return { isValid: false, error: 'Session expired' };
      }

      // 检查是否需要续期
      const hoursUntilExpiry =
        (session.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60);
      const needsRenewal =
        hoursUntilExpiry < SESSION_CONFIG.RENEWAL_THRESHOLD_HOURS &&
        session.renewalCount < SESSION_CONFIG.MAX_RENEWALS;

      // 更新最后访问时间
      await this.updateLastAccessed(sessionId);

      return {
        isValid: true,
        session,
        needsRenewal,
      };
    } catch (error) {
      console.warn('Database validation failed, checking token only:', error);

      // 如果数据库操作失败，只验证令牌本身
      const now = new Date();
      const exp = tokenValidation.payload.exp as number;
      const expiresAt = new Date(exp * 1000);

      if (now > expiresAt) {
        return { isValid: false, error: 'Session expired' };
      }

      // 创建一个基本的会话对象用于验证
      const basicSession: GuestSession = {
        id: sessionId,
        sessionToken,
        expiresAt,
        createdAt: new Date((tokenValidation.payload.iat as number) * 1000),
        lastAccessedAt: now,
        renewalCount: 0,
        analysisCount: 0,
        maxAnalyses: SESSION_CONFIG.DEFAULT_MAX_ANALYSES,
        aiQueriesCount: 0,
        maxAiQueries: SESSION_CONFIG.DEFAULT_MAX_AI_QUERIES,
        isActive: true,
        metadata: {},
      };

      return {
        isValid: true,
        session: basicSession,
        needsRenewal: false,
      };
    }
  }

  // 续期会话
  async renewSession(sessionId: string): Promise<GuestSession> {
    const { data: existing, error: fetchError } = await this.supabase
      .from('guest_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('is_active', true)
      .single();

    if (fetchError || !existing) {
      throw new Error('Session not found or inactive');
    }

    const session = this.mapDbToSession(existing);

    if (session.renewalCount >= SESSION_CONFIG.MAX_RENEWALS) {
      throw new Error('Maximum renewals exceeded');
    }

    const now = new Date();
    const newExpiresAt = new Date(
      now.getTime() + SESSION_CONFIG.DEFAULT_TTL_HOURS * 60 * 60 * 1000
    );
    const newSessionToken = this.generateSignedToken({
      sessionId,
      exp: Math.floor(newExpiresAt.getTime() / 1000),
      iat: Math.floor(now.getTime() / 1000),
    });

    const { data, error } = await this.supabase
      .from('guest_sessions')
      .update({
        session_token: newSessionToken,
        expires_at: newExpiresAt.toISOString(),
        renewed_at: now.toISOString(),
        renewal_count: session.renewalCount + 1,
        last_accessed_at: now.toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to renew session: ${error.message}`);
    }

    return this.mapDbToSession(data);
  }

  // 更新最后访问时间
  async updateLastAccessed(sessionId: string): Promise<void> {
    await this.supabase
      .from('guest_sessions')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', sessionId);
  }

  // 增加使用计数
  async incrementUsage(
    sessionId: string,
    type: 'analysis' | 'ai_query'
  ): Promise<void> {
    const field = type === 'analysis' ? 'analysis_count' : 'ai_queries_count';
    await this.supabase
      .from('guest_sessions')
      .update({ [field]: this.supabase.raw(`${field} + 1`) })
      .eq('id', sessionId);
  }

  // 检查使用限制
  async checkUsageLimit(
    sessionId: string,
    type: 'analysis' | 'ai_query'
  ): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('guest_sessions')
      .select('analysis_count, max_analyses, ai_queries_count, max_ai_queries')
      .eq('id', sessionId)
      .single();

    if (error || !data) return false;

    if (type === 'analysis') {
      return data.analysis_count < data.max_analyses;
    } else {
      return data.ai_queries_count < data.max_ai_queries;
    }
  }

  // 清理过期会话
  async cleanupExpiredSessions(): Promise<number> {
    const { data, error } = await this.supabase
      .from('guest_sessions')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id');

    if (error) {
      console.error('Failed to cleanup expired sessions:', error);
      return 0;
    }

    return data?.length || 0;
  }

  // 数据库记录映射到会话对象
  private mapDbToSession(data: {
    id: string;
    session_token: string;
    device_fingerprint?: string;
    user_agent?: string;
    ip_address?: string;
    metadata?: Record<string, unknown>;
    temp_birth_date_encrypted?: string;
    temp_birth_time_encrypted?: string;
    temp_birth_location_encrypted?: {
      latitude: number;
      longitude: number;
      address: string;
      timezone: string;
    };
    temp_contact_encrypted?: Record<string, unknown>;
    expires_at: string;
    created_at: string;
    last_accessed_at: string;
    renewed_at?: string;
    renewal_count: number;
    analysis_count: number;
    max_analyses: number;
    ai_queries_count: number;
    max_ai_queries: number;
    is_active: boolean;
    merged_to_user_id?: string;
    merged_at?: string;
  }): GuestSession {
    return {
      id: data.id,
      sessionToken: data.session_token,
      deviceFingerprint: data.device_fingerprint,
      userAgent: data.user_agent,
      ipAddress: data.ip_address,
      metadata: data.metadata || {},
      tempBirthDate: data.temp_birth_date_encrypted
        ? new Date(data.temp_birth_date_encrypted)
        : undefined,
      tempBirthTime: data.temp_birth_time_encrypted,
      tempBirthLocation: data.temp_birth_location_encrypted ? {
        ...data.temp_birth_location_encrypted,
        city: (data.temp_birth_location_encrypted as any).city || '',
        country: (data.temp_birth_location_encrypted as any).country || ''
      } : undefined,
      tempContact: data.temp_contact_encrypted,
      expiresAt: new Date(data.expires_at),
      createdAt: new Date(data.created_at),
      lastAccessedAt: new Date(data.last_accessed_at),
      renewedAt: data.renewed_at ? new Date(data.renewed_at) : undefined,
      renewalCount: data.renewal_count || 0,
      analysisCount: data.analysis_count || 0,
      maxAnalyses: data.max_analyses || SESSION_CONFIG.DEFAULT_MAX_ANALYSES,
      aiQueriesCount: data.ai_queries_count || 0,
      maxAiQueries:
        data.max_ai_queries || SESSION_CONFIG.DEFAULT_MAX_AI_QUERIES,
      isActive: data.is_active,
      mergedToUserId: data.merged_to_user_id,
      mergedAt: data.merged_at ? new Date(data.merged_at) : undefined,
    };
  }
}

export const guestSessionManager = new GuestSessionManager();
