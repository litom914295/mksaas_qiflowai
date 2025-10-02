/** @jest-environment node */
jest.setTimeout(30000);
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import { Redis } from 'ioredis';

// 测试数据库配置
const TEST_SUPABASE_URL =
  process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const TEST_SUPABASE_ANON_KEY =
  process.env.TEST_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const TEST_SUPABASE_SERVICE_KEY =
  process.env.TEST_SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEST_REDIS_URL = process.env.TEST_REDIS_URL || 'redis://localhost:6379';
// 显式开关：只有当启用时才连接真实外部依赖
const ENABLE_DB_TESTS = process.env.ENABLE_DB_TESTS === 'true';
const ENABLE_REDIS_TESTS = process.env.ENABLE_REDIS_TESTS === 'true';

describe('数据库和缓存集成测试', () => {
  // 条件化 describe，按需跳过外部依赖测试
  const describeDb =
    ENABLE_DB_TESTS && TEST_SUPABASE_URL && TEST_SUPABASE_ANON_KEY
      ? describe
      : describe.skip;
  const describeRedis = ENABLE_REDIS_TESTS ? describe : describe.skip;
  const describeBoth =
    ENABLE_DB_TESTS && ENABLE_REDIS_TESTS ? describe : describe.skip;
  let supabase: any;
  let redis: Redis;
  let testSessionId: string;
  let testUserId: string;

  beforeAll(async () => {
    // 初始化 Supabase 客户端（仅在显式开启时）
    if (ENABLE_DB_TESTS && TEST_SUPABASE_URL && TEST_SUPABASE_ANON_KEY) {
      supabase = createClient(
        TEST_SUPABASE_URL,
        TEST_SUPABASE_SERVICE_KEY || TEST_SUPABASE_ANON_KEY
      );
    } else {
      console.warn('跳过 Supabase 测试 - 未显式启用或未配置');
      // 保持 supabase 为 undefined，使各用例早退
      // supabase = undefined
    }

    // 初始化 Redis 客户端（仅在显式开启时）
    if (ENABLE_REDIS_TESTS) {
      try {
        redis = new Redis(TEST_REDIS_URL);
        await redis.ping();
      } catch (error) {
        console.warn('Redis 连接失败，跳过相关测试:', error);
        // 确保后续用例与清理逻辑跳过 Redis 操作
        // @ts-expect-error - Redis connection failed, setting to undefined for test cleanup
        redis = undefined as unknown as Redis;
      }
    } else {
      console.warn('跳过 Redis 测试 - 未显式启用');
      // @ts-expect-error - Redis not enabled, setting to undefined for test cleanup
      redis = undefined as unknown as Redis;
    }
  });

  afterAll(async () => {
    if (redis && (redis as any).status === 'ready') {
      await redis.quit();
    }
  });

  beforeEach(() => {
    testSessionId = `test-session-${Date.now()}-${Math.random()}`;
    testUserId = `test-user-${Date.now()}-${Math.random()}`;
  });

  afterEach(async () => {
    // 清理测试数据
    if (supabase) {
      try {
        await supabase
          .from('chat_sessions')
          .delete()
          .match({ session_id: testSessionId });
        await supabase
          .from('chat_messages')
          .delete()
          .match({ session_id: testSessionId });
        await supabase
          .from('guest_sessions')
          .delete()
          .match({ session_id: testSessionId });
      } catch (error) {
        console.warn('清理测试数据失败:', error);
      }
    }

    if (redis && (redis as any).status === 'ready') {
      try {
        await redis.del(`session:${testSessionId}`);
        await redis.del(`user:${testUserId}:*`);
        await redis.del(`chat:${testSessionId}:*`);
      } catch (error) {
        console.warn('清理 Redis 数据失败:', error);
      }
    }
  });

  describeDb('Supabase 集成测试', () => {
    test('应该能够创建和查询嘉宾会话', async () => {
      if (!supabase) {
        console.warn('跳过 Supabase 测试 - 未配置');
        return;
      }

      // 创建嘉宾会话
      const sessionData = {
        session_id: testSessionId,
        user_type: 'guest',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24小时后过期
        metadata: {
          userAgent: 'test-agent',
          ip: '127.0.0.1',
          locale: 'zh-CN',
        },
      };

      const { data: createResult, error: createError } = await supabase
        .from('guest_sessions')
        .insert(sessionData)
        .select();

      expect(createError).toBeNull();
      expect(createResult).toHaveLength(1);
      expect(createResult[0].session_id).toBe(testSessionId);

      // 查询会话
      const { data: queryResult, error: queryError } = await supabase
        .from('guest_sessions')
        .select('*')
        .eq('session_id', testSessionId)
        .single();

      expect(queryError).toBeNull();
      expect(queryResult.session_id).toBe(testSessionId);
      expect(queryResult.user_type).toBe('guest');
    });

    test('应该能够存储和检索聊天消息', async () => {
      if (!supabase) {
        console.warn('跳过 Supabase 测试 - 未配置');
        return;
      }

      // 首先创建会话
      await supabase.from('chat_sessions').insert({
        session_id: testSessionId,
        user_id: testUserId,
        state: 'greeting',
        created_at: new Date().toISOString(),
      });

      // 存储用户消息
      const userMessage = {
        session_id: testSessionId,
        message_id: `msg-${Date.now()}-user`,
        role: 'user',
        content: '你好，我想了解我的八字',
        timestamp: new Date().toISOString(),
        metadata: {
          inputTokens: 15,
        },
      };

      const { data: userResult, error: userError } = await supabase
        .from('chat_messages')
        .insert(userMessage)
        .select();

      expect(userError).toBeNull();
      expect(userResult).toHaveLength(1);

      // 存储AI响应
      const aiMessage = {
        session_id: testSessionId,
        message_id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content:
          '您好！我是AI风水大师，很高兴为您服务。请提供您的出生日期和时间。',
        timestamp: new Date().toISOString(),
        metadata: {
          outputTokens: 25,
          confidence: 0.95,
          processingTime: 1200,
        },
      };

      const { data: aiResult, error: aiError } = await supabase
        .from('chat_messages')
        .insert(aiMessage)
        .select();

      expect(aiError).toBeNull();
      expect(aiResult).toHaveLength(1);

      // 查询会话的所有消息
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', testSessionId)
        .order('timestamp', { ascending: true });

      expect(messagesError).toBeNull();
      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe('user');
      expect(messages[1].role).toBe('assistant');
    });

    test('应该能够存储八字分析结果', async () => {
      if (!supabase) {
        console.warn('跳过 Supabase 测试 - 未配置');
        return;
      }

      const baziAnalysis = {
        session_id: testSessionId,
        user_id: testUserId,
        birth_date: '1990-01-01',
        birth_time: '12:00:00',
        gender: 'male',
        timezone: 'Asia/Shanghai',
        is_lunar: false,
        bazi_result: {
          year_pillar: { heavenly: '庚', earthly: '午' },
          month_pillar: { heavenly: '戊', earthly: '子' },
          day_pillar: { heavenly: '甲', earthly: '寅' },
          hour_pillar: { heavenly: '丙', earthly: '子' },
          elements: {
            wood: 2,
            fire: 1,
            earth: 1,
            metal: 1,
            water: 2,
          },
          favorable_elements: ['wood', 'fire'],
          unfavorable_elements: ['metal'],
        },
        analysis_confidence: 0.92,
        created_at: new Date().toISOString(),
      };

      const { data: result, error } = await supabase
        .from('bazi_analyses')
        .insert(baziAnalysis)
        .select();

      expect(error).toBeNull();
      expect(result).toHaveLength(1);
      expect(result[0].birth_date).toBe('1990-01-01');
      expect(result[0].bazi_result.favorable_elements).toContain('wood');
    });

    test('应该能够处理房屋和罗盘数据', async () => {
      if (!supabase) {
        console.warn('跳过 Supabase 测试 - 未配置');
        return;
      }

      const houseData = {
        session_id: testSessionId,
        user_id: testUserId,
        address: '上海市黄浦区南京东路100号',
        build_year: 2010,
        floor_number: 15,
        total_floors: 30,
        compass_reading: {
          magnetic_bearing: 185,
          true_bearing: 180,
          declination: -5,
          accuracy: 'high',
          calibrated: true,
          reading_time: new Date().toISOString(),
        },
        floor_plan: {
          rooms: [
            {
              id: 'living-room',
              name: '客厅',
              type: 'living',
              area: 25.5,
              position: { x: 0, y: 0, width: 400, height: 300 },
            },
          ],
          total_area: 120.5,
        },
        created_at: new Date().toISOString(),
      };

      const { data: result, error } = await supabase
        .from('houses')
        .insert(houseData)
        .select();

      expect(error).toBeNull();
      expect(result).toHaveLength(1);
      expect(result[0].compass_reading.true_bearing).toBe(180);
      expect(result[0].floor_plan.rooms).toHaveLength(1);
    });
  });

  describeRedis('Redis 缓存集成测试', () => {
    test('应该能够缓存会话状态', async () => {
      if (!redis || (redis as any).status !== 'ready') {
        console.warn('跳过 Redis 测试 - 未连接');
        return;
      }

      const sessionState = {
        sessionId: testSessionId,
        userId: testUserId,
        currentState: 'collecting_info',
        context: {
          userInfo: {
            hasName: false,
            hasBirthData: false,
            hasLocationData: false,
          },
          conversationHistory: [
            { role: 'user', content: '你好' },
            { role: 'assistant', content: '您好！请提供您的出生信息。' },
          ],
        },
        lastActivity: Date.now(),
      };

      // 设置缓存（1小时过期）
      await redis.setex(
        `session:${testSessionId}`,
        3600,
        JSON.stringify(sessionState)
      );

      // 读取缓存
      const cachedData = await redis.get(`session:${testSessionId}`);
      expect(cachedData).toBeTruthy();

      const parsedData = JSON.parse(cachedData!);
      expect(parsedData.sessionId).toBe(testSessionId);
      expect(parsedData.currentState).toBe('collecting_info');
      expect(parsedData.context.conversationHistory).toHaveLength(2);
    });

    test('应该能够缓存AI响应', async () => {
      if (!redis || (redis as any).status !== 'ready') {
        console.warn('跳过 Redis 测试 - 未连接');
        return;
      }

      const cacheKey = `ai_response:${testSessionId}:greeting`;
      const aiResponse = {
        content: '您好！我是AI风水大师，很高兴为您服务。',
        confidence: 0.95,
        state: 'greeting',
        timestamp: Date.now(),
        metadata: {
          model: 'gpt-4',
          tokens: 50,
          cost: 0.001,
        },
      };

      // 缓存AI响应（30分钟过期）
      await redis.setex(cacheKey, 1800, JSON.stringify(aiResponse));

      // 读取缓存
      const cachedResponse = await redis.get(cacheKey);
      expect(cachedResponse).toBeTruthy();

      const parsedResponse = JSON.parse(cachedResponse!);
      expect(parsedResponse.content).toBe(aiResponse.content);
      expect(parsedResponse.confidence).toBe(0.95);
    });

    test('应该能够管理用户使用配额', async () => {
      if (!redis || (redis as any).status !== 'ready') {
        console.warn('跳过 Redis 测试 - 未连接');
        return;
      }

      const dailyQuotaKey = `quota:daily:${testUserId}`;
      const monthlyQuotaKey = `quota:monthly:${testUserId}`;

      // 模拟用户使用API
      await redis.incr(dailyQuotaKey);
      await redis.expire(dailyQuotaKey, 86400); // 24小时过期

      await redis.incr(monthlyQuotaKey);
      await redis.expire(monthlyQuotaKey, 2592000); // 30天过期

      // 检查使用量
      const dailyUsage = await redis.get(dailyQuotaKey);
      const monthlyUsage = await redis.get(monthlyQuotaKey);

      expect(parseInt(dailyUsage!)).toBe(1);
      expect(parseInt(monthlyUsage!)).toBe(1);

      // 模拟多次使用
      await redis.incr(dailyQuotaKey);
      await redis.incr(monthlyQuotaKey);

      const updatedDailyUsage = await redis.get(dailyQuotaKey);
      expect(parseInt(updatedDailyUsage!)).toBe(2);
    });

    test('应该能够实现分布式锁', async () => {
      if (!redis || (redis as any).status !== 'ready') {
        console.warn('跳过 Redis 测试 - 未连接');
        return;
      }

      const lockKey = `lock:analysis:${testUserId}`;
      const lockValue = `${Date.now()}-${Math.random()}`;

      // 获取锁（5分钟过期）
      const lockAcquired = await redis.set(
        lockKey,
        lockValue,
        'PX',
        300000,
        'NX'
      );
      expect(lockAcquired).toBe('OK');

      // 尝试再次获取锁（应该失败）
      const secondLockAttempt = await redis.set(
        lockKey,
        'another-value',
        'PX',
        300000,
        'NX'
      );
      expect(secondLockAttempt).toBeNull();

      // 释放锁
      const script = `
        if redis.call("GET", KEYS[1]) == ARGV[1] then
          return redis.call("DEL", KEYS[1])
        else
          return 0
        end
      `;

      const lockReleased = await redis.eval(script, 1, lockKey, lockValue);
      expect(lockReleased).toBe(1);

      // 现在应该能够重新获取锁
      const newLockAcquired = await redis.set(
        lockKey,
        'new-value',
        'PX',
        300000,
        'NX'
      );
      expect(newLockAcquired).toBe('OK');

      // 清理
      await redis.del(lockKey);
    });
  });

  describeBoth('数据一致性测试', () => {
    test('应该保持 Supabase 和 Redis 数据一致', async () => {
      if (!supabase || !redis) {
        console.warn('跳过数据一致性测试 - 服务未配置');
        return;
      }

      // 在 Supabase 中创建会话
      const sessionData = {
        session_id: testSessionId,
        user_id: testUserId,
        state: 'analyzing',
        created_at: new Date().toISOString(),
        metadata: { source: 'test' },
      };

      await supabase.from('chat_sessions').insert(sessionData);

      // 在 Redis 中缓存相同数据
      const cacheData = {
        sessionId: testSessionId,
        userId: testUserId,
        state: 'analyzing',
        lastSync: Date.now(),
      };

      await redis.setex(
        `session:${testSessionId}`,
        3600,
        JSON.stringify(cacheData)
      );

      // 验证数据一致性
      const { data: dbData } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('session_id', testSessionId)
        .single();

      const cachedData = JSON.parse(
        (await redis.get(`session:${testSessionId}`)) || '{}'
      );

      expect(dbData.session_id).toBe(cachedData.sessionId);
      expect(dbData.user_id).toBe(cachedData.userId);
      expect(dbData.state).toBe(cachedData.state);
    });

    test('应该处理缓存失效和重建', async () => {
      if (!supabase || !redis) {
        console.warn('跳过缓存失效测试 - 服务未配置');
        return;
      }

      // 在数据库中存储数据
      const analysisData = {
        session_id: testSessionId,
        user_id: testUserId,
        birth_date: '1990-01-01',
        birth_time: '12:00:00',
        bazi_result: { test: 'data' },
        created_at: new Date().toISOString(),
      };

      await supabase.from('bazi_analyses').insert(analysisData);

      // 模拟缓存命中失败，需要从数据库重建
      const cacheKey = `bazi:${testSessionId}`;
      const cachedData = await redis.get(cacheKey);
      expect(cachedData).toBeNull(); // 缓存不存在

      // 从数据库加载并重建缓存
      const { data: dbData } = await supabase
        .from('bazi_analyses')
        .select('*')
        .eq('session_id', testSessionId)
        .single();

      expect(dbData).toBeTruthy();

      // 重建缓存
      await redis.setex(cacheKey, 1800, JSON.stringify(dbData));

      // 验证缓存重建成功
      const rebuiltCache = await redis.get(cacheKey);
      expect(rebuiltCache).toBeTruthy();

      const parsedCache = JSON.parse(rebuiltCache!);
      expect(parsedCache.session_id).toBe(testSessionId);
      expect(parsedCache.birth_date).toBe('1990-01-01');
    });
  });

  describeBoth('性能测试', () => {
    test('应该在合理时间内完成数据库操作', async () => {
      if (!supabase) {
        console.warn('跳过性能测试 - Supabase 未配置');
        return;
      }

      const startTime = Date.now();

      // 执行一系列数据库操作
      const operations = [
        supabase.from('chat_sessions').insert({
          session_id: `perf-test-${Date.now()}`,
          user_id: testUserId,
          state: 'greeting',
          created_at: new Date().toISOString(),
        }),
        supabase
          .from('chat_sessions')
          .select('count')
          .eq('user_id', testUserId),
        supabase.from('chat_sessions').select('*').limit(10),
      ];

      await Promise.all(operations);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(2000); // 应该在2秒内完成
    });

    test('应该在合理时间内完成Redis操作', async () => {
      if (!redis) {
        console.warn('跳过性能测试 - Redis 未连接');
        return;
      }

      const startTime = Date.now();

      // 执行一系列Redis操作
      const operations = [];
      for (let i = 0; i < 100; i++) {
        operations.push(redis.set(`perf-test-${i}`, `value-${i}`));
      }

      await Promise.all(operations);

      // 读取操作
      const readOperations = [];
      for (let i = 0; i < 100; i++) {
        readOperations.push(redis.get(`perf-test-${i}`));
      }

      const results = await Promise.all(readOperations);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 应该在1秒内完成
      expect(results).toHaveLength(100);
      expect(results[0]).toBe('value-0');

      // 清理
      const deleteOperations = [];
      for (let i = 0; i < 100; i++) {
        deleteOperations.push(redis.del(`perf-test-${i}`));
      }
      await Promise.all(deleteOperations);
    });
  });
});
