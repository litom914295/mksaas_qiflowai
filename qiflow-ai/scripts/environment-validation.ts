#!/usr/bin/env tsx
/**
 * QiFlow AI 环境验证脚本
 * 验证 Supabase/Redis 连接和数据流转
 */

import dotenv from 'dotenv';
import { performance } from 'perf_hooks';
import {
  checkDatabaseHealth,
  getServiceClient,
} from '../src/lib/database/supabase-server';
import { RedisConnection } from '../src/lib/redis/connection';

// 加载环境变量
dotenv.config();

interface ValidationResult {
  success: boolean;
  message: string;
  details?: any;
  duration?: number;
}

interface TestSuite {
  name: string;
  tests: Array<() => Promise<ValidationResult>>;
}

class EnvironmentValidator {
  private results: { [testName: string]: ValidationResult } = {};

  async run(): Promise<void> {
    console.log('🚀 开始 QiFlow AI 环境验证\n');

    const testSuites: TestSuite[] = [
      {
        name: '环境变量检查',
        tests: [() => this.validateEnvironmentVariables()],
      },
      {
        name: 'Supabase 连接测试',
        tests: [
          () => this.testSupabaseConnection(),
          () => this.testSupabaseSchemaValidation(),
          () => this.testSupabaseBasicOperations(),
        ],
      },
      {
        name: 'Redis 连接测试',
        tests: [
          () => this.testRedisConnection(),
          () => this.testRedisBasicOperations(),
          () => this.testRedisFallbackMechanism(),
        ],
      },
      {
        name: '数据库架构验证',
        tests: [
          () => this.validateDatabaseSchema(),
          () => this.validateMigrationTables(),
        ],
      },
      {
        name: '性能基准测试',
        tests: [
          () => this.benchmarkDatabaseQueries(),
          () => this.benchmarkRedisOperations(),
        ],
      },
    ];

    for (const suite of testSuites) {
      console.log(`\n📋 ${suite.name}`);
      console.log('='.repeat(50));

      for (const test of suite.tests) {
        try {
          const result = await test();
          this.results[test.name] = result;
          this.logResult(test.name, result);
        } catch (error) {
          const errorResult: ValidationResult = {
            success: false,
            message: `测试执行失败: ${error instanceof Error ? error.message : String(error)}`,
          };
          this.results[test.name] = errorResult;
          this.logResult(test.name, errorResult);
        }
      }
    }

    this.printSummary();
  }

  private async validateEnvironmentVariables(): Promise<ValidationResult> {
    const startTime = performance.now();
    const requiredVars = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'REDIS_HOST',
      'REDIS_PORT',
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    const duration = performance.now() - startTime;

    if (missingVars.length > 0) {
      return {
        success: false,
        message: `缺少必要的环境变量: ${missingVars.join(', ')}`,
        duration,
      };
    }

    // 检查 URL 格式
    try {
      const supabaseUrl =
        process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        new URL(supabaseUrl);
      }
    } catch (error) {
      return {
        success: false,
        message: 'SUPABASE_URL 格式无效',
        duration,
      };
    }

    return {
      success: true,
      message: '所有必要的环境变量已配置',
      details: {
        supabaseUrl:
          process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
        redisHost: process.env.REDIS_HOST,
        redisPort: process.env.REDIS_PORT,
        hasRedisPassword: !!process.env.REDIS_PASSWORD,
      },
      duration,
    };
  }

  private async testSupabaseConnection(): Promise<ValidationResult> {
    const startTime = performance.now();

    try {
      const healthCheck = await checkDatabaseHealth();
      const duration = performance.now() - startTime;

      if (!healthCheck.healthy) {
        return {
          success: false,
          message: `Supabase 连接失败: ${healthCheck.error}`,
          duration,
        };
      }

      return {
        success: true,
        message: 'Supabase 连接正常',
        duration,
      };
    } catch (error) {
      return {
        success: false,
        message: `Supabase 连接测试失败: ${error instanceof Error ? error.message : String(error)}`,
        duration: performance.now() - startTime,
      };
    }
  }

  private async testSupabaseSchemaValidation(): Promise<ValidationResult> {
    const startTime = performance.now();

    try {
      const client = getServiceClient();

      // 检查核心表是否存在
      const tables = [
        'users',
        'guest_sessions',
        'chat_sessions',
        'conversation_states',
      ];
      const tableChecks = await Promise.all(
        tables.map(async tableName => {
          try {
            const { error } = await client
              .from(tableName as any)
              .select('*')
              .limit(0);
            return { table: tableName, exists: !error };
          } catch {
            return { table: tableName, exists: false };
          }
        })
      );

      const missingTables = tableChecks.filter(check => !check.exists);
      const duration = performance.now() - startTime;

      if (missingTables.length > 0) {
        return {
          success: false,
          message: `缺少核心表: ${missingTables.map(t => t.table).join(', ')}`,
          details: { tableChecks },
          duration,
        };
      }

      return {
        success: true,
        message: '数据库架构验证通过',
        details: { tableChecks },
        duration,
      };
    } catch (error) {
      return {
        success: false,
        message: `架构验证失败: ${error instanceof Error ? error.message : String(error)}`,
        duration: performance.now() - startTime,
      };
    }
  }

  private async testSupabaseBasicOperations(): Promise<ValidationResult> {
    const startTime = performance.now();

    try {
      const client = getServiceClient();
      const testSessionId = crypto.randomUUID();

      // 测试插入
      const { error: insertError } = await client
        .from('guest_sessions')
        .insert({
          session_token: `test_${testSessionId}`,
          expires_at: new Date(Date.now() + 3600000).toISOString(), // 1小时后
          max_analyses: 1,
          max_ai_queries: 1,
        } as any);

      if (insertError) {
        return {
          success: false,
          message: `插入测试失败: ${insertError.message}`,
          duration: performance.now() - startTime,
        };
      }

      // 测试查询
      const { data: selectData, error: selectError } = await client
        .from('guest_sessions')
        .select('*')
        .eq('session_token', `test_${testSessionId}`)
        .single();

      if (selectError) {
        return {
          success: false,
          message: `查询测试失败: ${selectError.message}`,
          duration: performance.now() - startTime,
        };
      }

      // 测试更新
      const { error: updateError } = await (client as any)
        .from('guest_sessions')
        .update({ analysis_count: 1 })
        .eq('session_token', `test_${testSessionId}`);

      if (updateError) {
        return {
          success: false,
          message: `更新测试失败: ${updateError.message}`,
          duration: performance.now() - startTime,
        };
      }

      // 测试删除
      const { error: deleteError } = await client
        .from('guest_sessions')
        .delete()
        .eq('session_token', `test_${testSessionId}`);

      if (deleteError) {
        return {
          success: false,
          message: `删除测试失败: ${deleteError.message}`,
          duration: performance.now() - startTime,
        };
      }

      return {
        success: true,
        message: 'Supabase CRUD 操作测试通过',
        details: {
          operations: ['insert', 'select', 'update', 'delete'],
          testData: selectData,
        },
        duration: performance.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        message: `CRUD 操作测试失败: ${error instanceof Error ? error.message : String(error)}`,
        duration: performance.now() - startTime,
      };
    }
  }

  private async testRedisConnection(): Promise<ValidationResult> {
    const startTime = performance.now();

    try {
      const testResult = await RedisConnection.testConnection();
      const healthStatus = await RedisConnection.getHealthStatus();

      return {
        success: testResult.success,
        message: testResult.success
          ? 'Redis 连接正常'
          : `Redis 连接失败: ${testResult.error}`,
        details: {
          responseTime: testResult.responseTime,
          healthStatus,
          circuitBreakerState: healthStatus.circuitBreakerState,
        },
        duration: performance.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        message: `Redis 连接测试失败: ${error instanceof Error ? error.message : String(error)}`,
        duration: performance.now() - startTime,
      };
    }
  }

  private async testRedisBasicOperations(): Promise<ValidationResult> {
    const startTime = performance.now();

    try {
      const testKey = `test_${Date.now()}`;
      const testValue = { message: 'hello', timestamp: Date.now() };

      // 测试设置
      const setResult = await RedisConnection.setWithMemoryFallback(
        testKey,
        testValue,
        300
      );
      if (!setResult) {
        return {
          success: false,
          message: 'Redis SET 操作失败',
          duration: performance.now() - startTime,
        };
      }

      // 测试获取
      const getValue = await RedisConnection.getWithMemoryFallback(testKey);
      if (!getValue || getValue.message !== testValue.message) {
        return {
          success: false,
          message: 'Redis GET 操作失败或数据不匹配',
          details: { expected: testValue, actual: getValue },
          duration: performance.now() - startTime,
        };
      }

      // 测试删除
      const deleteResult =
        await RedisConnection.deleteWithMemoryFallback(testKey);
      if (!deleteResult) {
        return {
          success: false,
          message: 'Redis DELETE 操作失败',
          duration: performance.now() - startTime,
        };
      }

      // 验证删除
      const deletedValue = await RedisConnection.getWithMemoryFallback(testKey);
      if (deletedValue !== undefined) {
        return {
          success: false,
          message: 'Redis 删除验证失败，数据仍然存在',
          duration: performance.now() - startTime,
        };
      }

      return {
        success: true,
        message: 'Redis 基础操作测试通过',
        details: {
          operations: ['set', 'get', 'delete'],
          testKey,
          testValue,
        },
        duration: performance.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        message: `Redis 基础操作测试失败: ${error instanceof Error ? error.message : String(error)}`,
        duration: performance.now() - startTime,
      };
    }
  }

  private async testRedisFallbackMechanism(): Promise<ValidationResult> {
    const startTime = performance.now();

    try {
      const testKey = `fallback_test_${Date.now()}`;
      const testValue = { message: 'fallback_test', timestamp: Date.now() };

      // 模拟 Redis 不可用的情况下的降级存储
      await RedisConnection.setWithMemoryFallback(testKey, testValue, 300);

      // 即使 Redis 失败，也应该能从内存降级中获取数据
      const fallbackValue =
        await RedisConnection.getWithMemoryFallback(testKey);

      if (!fallbackValue || fallbackValue.message !== testValue.message) {
        return {
          success: false,
          message: 'Redis 降级机制测试失败',
          details: { expected: testValue, actual: fallbackValue },
          duration: performance.now() - startTime,
        };
      }

      return {
        success: true,
        message: 'Redis 降级机制测试通过',
        details: {
          testKey,
          testValue,
          fallbackValue,
        },
        duration: performance.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        message: `Redis 降级机制测试失败: ${error instanceof Error ? error.message : String(error)}`,
        duration: performance.now() - startTime,
      };
    }
  }

  private async validateDatabaseSchema(): Promise<ValidationResult> {
    const startTime = performance.now();

    try {
      const client = getServiceClient();

      // 验证关键列的存在
      const schemaValidations = [
        {
          table: 'users',
          requiredColumns: ['id', 'email', 'role', 'created_at'],
        },
        {
          table: 'guest_sessions',
          requiredColumns: [
            'id',
            'session_token',
            'expires_at',
            'analysis_count',
            'max_analyses',
          ],
        },
        {
          table: 'chat_sessions',
          requiredColumns: ['id', 'user_id', 'status', 'created_at'],
        },
        {
          table: 'conversation_states',
          requiredColumns: [
            'id',
            'session_id',
            'current_state',
            'context_stack',
          ],
        },
      ];

      const validationResults = [];

      for (const validation of schemaValidations) {
        try {
          // 尝试查询表结构
          const { data, error } = await client
            .from(validation.table as any)
            .select(validation.requiredColumns.join(','))
            .limit(0);

          validationResults.push({
            table: validation.table,
            valid: !error,
            error: error?.message,
          });
        } catch (error) {
          validationResults.push({
            table: validation.table,
            valid: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      const invalidTables = validationResults.filter(r => !r.valid);
      const duration = performance.now() - startTime;

      if (invalidTables.length > 0) {
        return {
          success: false,
          message: `架构验证失败的表: ${invalidTables.map(t => t.table).join(', ')}`,
          details: { validationResults },
          duration,
        };
      }

      return {
        success: true,
        message: '数据库架构验证通过',
        details: { validationResults },
        duration,
      };
    } catch (error) {
      return {
        success: false,
        message: `架构验证失败: ${error instanceof Error ? error.message : String(error)}`,
        duration: performance.now() - startTime,
      };
    }
  }

  private async validateMigrationTables(): Promise<ValidationResult> {
    const startTime = performance.now();

    try {
      const client = getServiceClient();

      // 检查迁移创建的表
      const migrationTables = [
        'chat_sessions',
        'conversation_states',
        'knowledge_graph',
        'confidence_scores',
        'ai_usage_metrics',
      ];

      const tableExists = await Promise.all(
        migrationTables.map(async tableName => {
          try {
            const { error } = await client
              .from(tableName as any)
              .select('*')
              .limit(0);
            return { table: tableName, exists: !error };
          } catch {
            return { table: tableName, exists: false };
          }
        })
      );

      const missingTables = tableExists.filter(t => !t.exists);
      const duration = performance.now() - startTime;

      return {
        success: missingTables.length === 0,
        message:
          missingTables.length === 0
            ? '迁移表验证通过'
            : `缺少迁移表: ${missingTables.map(t => t.table).join(', ')}`,
        details: { tableExists },
        duration,
      };
    } catch (error) {
      return {
        success: false,
        message: `迁移表验证失败: ${error instanceof Error ? error.message : String(error)}`,
        duration: performance.now() - startTime,
      };
    }
  }

  private async benchmarkDatabaseQueries(): Promise<ValidationResult> {
    const startTime = performance.now();

    try {
      const client = getServiceClient();
      const iterations = 10;
      const queryTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const queryStart = performance.now();
        await client.from('guest_sessions').select('count').limit(1);
        queryTimes.push(performance.now() - queryStart);
      }

      const avgQueryTime =
        queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length;
      const minQueryTime = Math.min(...queryTimes);
      const maxQueryTime = Math.max(...queryTimes);
      const duration = performance.now() - startTime;

      return {
        success: true,
        message: `数据库查询性能基准: 平均 ${avgQueryTime.toFixed(2)}ms`,
        details: {
          iterations,
          avgQueryTime: parseFloat(avgQueryTime.toFixed(2)),
          minQueryTime: parseFloat(minQueryTime.toFixed(2)),
          maxQueryTime: parseFloat(maxQueryTime.toFixed(2)),
          queryTimes,
        },
        duration,
      };
    } catch (error) {
      return {
        success: false,
        message: `数据库性能测试失败: ${error instanceof Error ? error.message : String(error)}`,
        duration: performance.now() - startTime,
      };
    }
  }

  private async benchmarkRedisOperations(): Promise<ValidationResult> {
    const startTime = performance.now();

    try {
      const iterations = 50;
      const setTimes: number[] = [];
      const getTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const testKey = `benchmark_${i}`;
        const testValue = { iteration: i, timestamp: Date.now() };

        // 测试 SET 性能
        const setStart = performance.now();
        await RedisConnection.setWithMemoryFallback(testKey, testValue, 300);
        setTimes.push(performance.now() - setStart);

        // 测试 GET 性能
        const getStart = performance.now();
        await RedisConnection.getWithMemoryFallback(testKey);
        getTimes.push(performance.now() - getStart);

        // 清理
        await RedisConnection.deleteWithMemoryFallback(testKey);
      }

      const avgSetTime = setTimes.reduce((a, b) => a + b, 0) / setTimes.length;
      const avgGetTime = getTimes.reduce((a, b) => a + b, 0) / getTimes.length;
      const duration = performance.now() - startTime;

      return {
        success: true,
        message: `Redis 操作性能基准: SET ${avgSetTime.toFixed(2)}ms, GET ${avgGetTime.toFixed(2)}ms`,
        details: {
          iterations,
          avgSetTime: parseFloat(avgSetTime.toFixed(2)),
          avgGetTime: parseFloat(avgGetTime.toFixed(2)),
          setTimes,
          getTimes,
        },
        duration,
      };
    } catch (error) {
      return {
        success: false,
        message: `Redis 性能测试失败: ${error instanceof Error ? error.message : String(error)}`,
        duration: performance.now() - startTime,
      };
    }
  }

  private logResult(testName: string, result: ValidationResult): void {
    const icon = result.success ? '✅' : '❌';
    const duration = result.duration
      ? ` (${result.duration.toFixed(2)}ms)`
      : '';
    console.log(`${icon} ${testName}${duration}: ${result.message}`);

    if (result.details && Object.keys(result.details).length > 0) {
      console.log(`   📊 详细信息:`, JSON.stringify(result.details, null, 2));
    }
  }

  private printSummary(): void {
    const totalTests = Object.keys(this.results).length;
    const passedTests = Object.values(this.results).filter(
      r => r.success
    ).length;
    const failedTests = totalTests - passedTests;

    console.log('\n' + '='.repeat(60));
    console.log('📊 验证结果汇总');
    console.log('='.repeat(60));
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过: ${passedTests} ✅`);
    console.log(`失败: ${failedTests} ❌`);
    console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests > 0) {
      console.log('\n❌ 失败的测试:');
      Object.entries(this.results)
        .filter(([_, result]) => !result.success)
        .forEach(([testName, result]) => {
          console.log(`- ${testName}: ${result.message}`);
        });
    }

    console.log('\n🏁 环境验证完成');

    // 设置退出码
    process.exitCode = failedTests > 0 ? 1 : 0;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const validator = new EnvironmentValidator();
  validator.run().catch(error => {
    console.error('❌ 验证过程中发生错误:', error);
    process.exit(1);
  });
}

export { EnvironmentValidator };
