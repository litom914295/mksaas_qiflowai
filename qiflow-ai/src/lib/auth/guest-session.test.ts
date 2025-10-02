import { guestSessionManager } from './guest-session';

// 模拟测试环境
const mockSupabase = {
  from: jest.fn(() => ({
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => ({
          data: {
            id: 'test-session-id',
            session_token: 'test-token',
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            analysis_count: 0,
            max_analyses: 3,
            ai_queries_count: 0,
            max_ai_queries: 10,
            is_active: true,
            created_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString(),
            renewal_count: 0,
          },
          error: null,
        })),
      })),
    })),
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: 'test-session-id',
              session_token: 'test-token',
              expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              analysis_count: 0,
              max_analyses: 3,
              ai_queries_count: 0,
              max_ai_queries: 10,
              is_active: true,
              created_at: new Date().toISOString(),
              last_accessed_at: new Date().toISOString(),
              renewal_count: 0,
            },
            error: null,
          })),
        })),
      })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        data: null,
        error: null,
      })),
    })),
  })),
};

// 测试套件
describe('GuestSessionManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateDeviceFingerprint', () => {
    it('should generate consistent fingerprint for same input', () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      const fingerprint1 = guestSessionManager.generateDeviceFingerprint(userAgent);
      const fingerprint2 = guestSessionManager.generateDeviceFingerprint(userAgent);
      
      expect(fingerprint1).toBe(fingerprint2);
      expect(fingerprint1).toHaveLength(32);
    });

    it('should generate different fingerprints for different inputs', () => {
      const userAgent1 = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
      const userAgent2 = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';
      
      const fingerprint1 = guestSessionManager.generateDeviceFingerprint(userAgent1);
      const fingerprint2 = guestSessionManager.generateDeviceFingerprint(userAgent2);
      
      expect(fingerprint1).not.toBe(fingerprint2);
    });
  });

  describe('generateSignedToken', () => {
    it('should generate valid JWT-like token', () => {
      const payload = { sessionId: 'test-id', exp: 1234567890 };
      const token = guestSessionManager.generateSignedToken(payload);
      
      expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
    });

    it('should be verifiable with verifySignedToken', () => {
      const payload = { sessionId: 'test-id', exp: Math.floor(Date.now() / 1000) + 3600 };
      const token = guestSessionManager.generateSignedToken(payload);
      const verification = guestSessionManager.verifySignedToken(token);
      
      expect(verification.valid).toBe(true);
      expect(verification.payload?.sessionId).toBe('test-id');
    });

    it('should reject expired tokens', () => {
      const payload = { sessionId: 'test-id', exp: Math.floor(Date.now() / 1000) - 3600 };
      const token = guestSessionManager.generateSignedToken(payload);
      const verification = guestSessionManager.verifySignedToken(token);
      
      expect(verification.valid).toBe(false);
    });

    it('should reject invalid tokens', () => {
      const verification1 = guestSessionManager.verifySignedToken('invalid.token');
      const verification2 = guestSessionManager.verifySignedToken('invalid');
      const verification3 = guestSessionManager.verifySignedToken('');
      
      expect(verification1.valid).toBe(false);
      expect(verification2.valid).toBe(false);
      expect(verification3.valid).toBe(false);
    });
  });

  describe('createSession', () => {
    it('should create session with default parameters', async () => {
      const session = await guestSessionManager.createSession();
      
      expect(session).toBeDefined();
      expect(session.id).toBe('test-session-id');
      expect(session.maxAnalyses).toBe(3);
      expect(session.maxAiQueries).toBe(10);
      expect(session.isActive).toBe(true);
      expect(session.analysisCount).toBe(0);
      expect(session.aiQueriesCount).toBe(0);
    });

    it('should create session with custom parameters', async () => {
      const params = {
        deviceFingerprint: 'test-fingerprint',
        userAgent: 'test-user-agent',
        maxAnalyses: 5,
        maxAiQueries: 20,
      };
      
      const session = await guestSessionManager.createSession(params);
      
      expect(session).toBeDefined();
      expect(session.deviceFingerprint).toBe('test-fingerprint');
      expect(session.userAgent).toBe('test-user-agent');
      expect(session.maxAnalyses).toBe(5);
      expect(session.maxAiQueries).toBe(20);
    });
  });

  describe('validateSession', () => {
    it('should validate valid session', async () => {
      const token = guestSessionManager.generateSignedToken({
        sessionId: 'test-session-id',
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      
      const validation = await guestSessionManager.validateSession(token);
      
      expect(validation.isValid).toBe(true);
      expect(validation.session).toBeDefined();
      expect(validation.needsRenewal).toBe(false);
    });

    it('should reject invalid token', async () => {
      const validation = await guestSessionManager.validateSession('invalid-token');
      
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBe('Invalid session token');
    });
  });

  describe('checkUsageLimit', () => {
    it('should allow usage within limits', async () => {
      const allowed = await guestSessionManager.checkUsageLimit('test-session-id', 'analysis');
      expect(allowed).toBe(true);
    });

    it('should reject usage beyond limits', async () => {
      // 模拟已达到限制的情况
      mockSupabase.from().select().eq().eq().single.mockReturnValueOnce({
        data: {
          id: 'test-session-id',
          session_token: 'test-token',
          expires_at: '2024-12-31T23:59:59Z',
          analysis_count: 3,
          max_analyses: 3,
          ai_queries_count: 10,
          max_ai_queries: 10,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          last_accessed_at: '2024-01-01T00:00:00Z',
          renewal_count: 0,
        },
        error: null,
      });
      
      const allowed = await guestSessionManager.checkUsageLimit('test-session-id', 'analysis');
      expect(allowed).toBe(false);
    });
  });
});

// 集成测试
describe('Guest Session Integration', () => {
  it('should handle complete session lifecycle', async () => {
    // 1. 创建会话
    const session = await guestSessionManager.createSession({
      deviceFingerprint: 'test-fingerprint',
      userAgent: 'test-user-agent',
    });
    
    expect(session).toBeDefined();
    expect(session.isActive).toBe(true);
    
    // 2. 验证会话
    const validation = await guestSessionManager.validateSession(session.sessionToken);
    expect(validation.isValid).toBe(true);
    
    // 3. 检查使用限制
    const canAnalyze = await guestSessionManager.checkUsageLimit(session.id, 'analysis');
    expect(canAnalyze).toBe(true);
    
    // 4. 记录使用量
    await guestSessionManager.incrementUsage(session.id, 'analysis');
    
    // 5. 再次检查限制
    const canAnalyzeAfter = await guestSessionManager.checkUsageLimit(session.id, 'analysis');
    expect(canAnalyzeAfter).toBe(true); // 仍然在限制内
  });
});
