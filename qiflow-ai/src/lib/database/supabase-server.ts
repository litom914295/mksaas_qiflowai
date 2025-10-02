import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * 用户角色枚举
 */
export type UserRole = 'guest' | 'user' | 'premium' | 'admin';

/**
 * 日历类型枚举
 */
export type CalendarType = 'gregorian' | 'lunar';

/**
 * 游客会话位置信息类型
 */
export interface GuestLocationInfo {
  latitude: number;
  longitude: number;
  address: string;
  timezone: string;
}

/**
 * 游客会话联系信息类型
 */
export interface GuestContactInfo {
  email?: string;
  phone?: string;
  name?: string;
  wechat?: string;
}

/**
 * 游客会话元数据类型
 */
export interface GuestSessionMetadata {
  createdAt: string;
  source: 'api' | 'web' | 'mobile';
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

/**
 * 八字计算结果类型
 */
export interface BaziCalculationResult {
  pillars: {
    year: { heavenly: string; earthly: string };
    month: { heavenly: string; earthly: string };
    day: { heavenly: string; earthly: string };
    hour: { heavenly: string; earthly: string };
  };
  elements: {
    dayMaster: string;
    strength: 'strong' | 'weak';
    favorableElements: string[];
    unfavorableElements: string[];
  };
  analysis: {
    personality: string[];
    career: string[];
    health: string[];
    relationships: string[];
  };
  metadata: {
    calculatedAt: string;
    method: string;
    confidence: number;
  };
}

/**
 * 风水分析结果类型
 */
export interface FengshuiAnalysisResult {
  flyingStars: {
    period: number;
    facingDirection: number;
    mountainDirection: number;
    starChart: Array<Array<{ star: number; meaning: string }>>;
  };
  recommendations: Array<{
    room: string;
    issue: string;
    solution: string;
    priority: 'high' | 'medium' | 'low';
    confidence: number;
  }>;
  overallRating: {
    score: number; // 1-10
    description: string;
    strengths: string[];
    weaknesses: string[];
  };
  metadata: {
    analyzedAt: string;
    method: string;
    version: string;
  };
}

/**
 * 房屋位置信息类型
 */
export interface HouseLocationInfo {
  latitude: number;
  longitude: number;
  address: string;
  timezone: string;
  country?: string;
  region?: string;
  city?: string;
}

/**
 * 数据库表结构定义
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          role: UserRole;
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
          role?: UserRole;
          preferred_locale?: string;
          timezone?: string;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
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
          device_fingerprint: string | null;
          user_agent: string | null;
          ip_address: string | null;
          metadata: GuestSessionMetadata | null;
          temp_birth_date_encrypted: string | null;
          temp_birth_time_encrypted: string | null;
          temp_birth_location_encrypted: GuestLocationInfo | null;
          temp_contact_encrypted: GuestContactInfo | null;
          expires_at: string;
          created_at: string;
          last_accessed_at: string;
          renewed_at: string | null;
          renewal_count: number;
          analysis_count: number;
          max_analyses: number;
          ai_queries_count: number;
          max_ai_queries: number;
          is_active: boolean;
          merged_to_user_id: string | null;
          merged_at: string | null;
        };
        Insert: {
          session_token: string;
          device_fingerprint?: string | null;
          user_agent?: string | null;
          ip_address?: string | null;
          metadata?: GuestSessionMetadata | null;
          temp_birth_date_encrypted?: string | null;
          temp_birth_time_encrypted?: string | null;
          temp_birth_location_encrypted?: GuestLocationInfo | null;
          temp_contact_encrypted?: GuestContactInfo | null;
          expires_at: string;
          max_analyses?: number;
          max_ai_queries?: number;
        };
        Update: {
          temp_birth_date_encrypted?: string | null;
          temp_birth_time_encrypted?: string | null;
          temp_birth_location_encrypted?: GuestLocationInfo | null;
          temp_contact_encrypted?: GuestContactInfo | null;
          last_accessed_at?: string;
          renewed_at?: string | null;
          renewal_count?: number;
          analysis_count?: number;
          ai_queries_count?: number;
          is_active?: boolean;
          merged_to_user_id?: string | null;
          merged_at?: string | null;
        };
      };
      bazi_calculations: {
        Row: {
          id: string;
          user_id: string | null;
          guest_session_id: string | null;
          birth_datetime: string;
          timezone: string;
          longitude: number;
          latitude: number;
          calendar_type: CalendarType;
          use_true_solar_time: boolean;
          result: BaziCalculationResult;
          created_at: string;
        };
        Insert: {
          user_id?: string | null;
          guest_session_id?: string | null;
          birth_datetime: string;
          timezone: string;
          longitude: number;
          latitude: number;
          calendar_type: CalendarType;
          use_true_solar_time: boolean;
          result: BaziCalculationResult;
        };
        Update: {
          result?: BaziCalculationResult;
        };
      };
      fengshui_analyses: {
        Row: {
          id: string;
          user_id: string | null;
          guest_session_id: string | null;
          house_id: string | null;
          facing_angle: number;
          observed_at: string;
          location: HouseLocationInfo;
          result: FengshuiAnalysisResult;
          created_at: string;
        };
        Insert: {
          user_id?: string | null;
          guest_session_id?: string | null;
          house_id?: string | null;
          facing_angle: number;
          observed_at: string;
          location: HouseLocationInfo;
          result: FengshuiAnalysisResult;
        };
        Update: {
          result?: FengshuiAnalysisResult;
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
          p_role?: UserRole;
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
      merge_guest_session_to_user: {
        Args: {
          guest_session_id: string;
          user_id: string;
        };
        Returns: boolean;
      };
    };
  };
}

let serviceClient: SupabaseClient<Database> | null = null;

// 验证环境变量安全性
const validateEnvironmentVariables = (url: string, key: string): void => {
  // 检查URL格式
  try {
    new URL(url);
  } catch {
    throw new Error('SUPABASE_URL格式无效');
  }

  // 检查是否使用了测试/演示环境
  if (url.includes('demo.supabase.co') || url.includes('localhost') || url.includes('127.0.0.1')) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('生产环境不能使用演示或本地数据库URL');
    }
    console.warn('检测到使用演示或本地数据库，请确保仅用于开发环境');
  }

  // 检查服务密钥格式
  if (!key.startsWith('eyJ')) {
    console.warn('Supabase服务密钥格式可能不正确');
  }

  // 检查密钥长度
  if (key.length < 100) {
    console.warn('Supabase服务密钥长度异常，可能不是有效的JWT');
  }
};

export const getServiceClient = (): SupabaseClient<Database> => {
  if (serviceClient) {
    return serviceClient as SupabaseClient<Database>;
  }
  
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
  
  if (!url || !key) {
    throw new Error('缺少必要的环境变量: SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY');
  }

  // 验证环境变量
  try {
    validateEnvironmentVariables(url.trim(), key.trim());
  } catch (error) {
    throw new Error(`Supabase配置验证失败: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    serviceClient = createClient<Database>(url.trim(), key.trim(), {
      auth: { 
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'User-Agent': 'QiFlow-AI/1.0',
          'X-Client-Info': 'qiflow-ai-server'
        },
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });

    // 验证连接（可选的健康检查）
    if (process.env.NODE_ENV !== 'test') {
      const promise = serviceClient
        .from('users')
        .select('count')
        .limit(0);
      promise
        .then(() => {
          console.log('Supabase连接验证成功');
        }, (error: any) => {
          console.warn('Supabase连接验证失败:', error?.message ?? error);
        });
    }

    return serviceClient as SupabaseClient<Database>;
  } catch (error) {
    serviceClient = null;
    throw new Error(`创建Supabase客户端失败: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// 连接健康检查
export const checkDatabaseHealth = async (): Promise<{ healthy: boolean; error?: string }> => {
  try {
    const client = getServiceClient();
    const { data, error } = await client
      .from('users')
      .select('count')
      .limit(0)
      .single();
    
    if (error) {
      return { healthy: false, error: error.message };
    }
    
    return { healthy: true };
  } catch (error) {
    return { 
      healthy: false, 
      error: error instanceof Error ? error.message : '数据库连接检查失败' 
    };
  }
};

// 优雅关闭数据库连接
export const closeDatabaseConnection = (): void => {
  if (serviceClient) {
    // Supabase客户端会自动处理连接关闭
    serviceClient = null;
  }
};

/**
 * 类型保护函数：验证八字计算结果
 */
export const isBaziCalculationResult = (data: unknown): data is BaziCalculationResult => {
  if (!data || typeof data !== 'object') return false;
  
  const result = data as any;
  return (
    result.pillars &&
    result.elements &&
    result.analysis &&
    result.metadata &&
    typeof result.pillars === 'object' &&
    typeof result.elements === 'object' &&
    typeof result.analysis === 'object' &&
    typeof result.metadata === 'object'
  );
};

/**
 * 类型保护函数：验证风水分析结果
 */
export const isFengshuiAnalysisResult = (data: unknown): data is FengshuiAnalysisResult => {
  if (!data || typeof data !== 'object') return false;
  
  const result = data as any;
  return (
    result.flyingStars &&
    result.recommendations &&
    result.overallRating &&
    result.metadata &&
    Array.isArray(result.recommendations) &&
    typeof result.overallRating === 'object' &&
    typeof result.metadata === 'object'
  );
};

/**
 * 类型保护函数：验证游客位置信息
 */
export const isGuestLocationInfo = (data: unknown): data is GuestLocationInfo => {
  if (!data || typeof data !== 'object') return false;
  
  const location = data as any;
  return (
    typeof location.latitude === 'number' &&
    typeof location.longitude === 'number' &&
    typeof location.address === 'string' &&
    typeof location.timezone === 'string'
  );
};
