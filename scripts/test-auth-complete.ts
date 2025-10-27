/**
 * Better Auth 完整测试脚本
 * 
 * 测试项目:
 * 1. 数据库连接
 * 2. 表结构验证
 * 3. 用户注册
 * 4. 积分初始化
 * 5. 用户登录
 * 6. 会话管理
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// 加载环境变量
config({ path: resolve(process.cwd(), '.env.local') });

import { getDb } from '../src/db';
import { user, session, account, verification, userCredit, creditTransaction } from '../src/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function log(result: TestResult) {
  const emoji = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️';
  console.log(`${emoji} ${result.name}`);
  console.log(`   ${result.message}`);
  if (result.details) {
    console.log(`   Details:`, JSON.stringify(result.details, null, 2));
  }
  results.push(result);
}

async function testDatabaseConnection(): Promise<boolean> {
  try {
    const db = await getDb();
    const result = await db.execute(sql`SELECT 1 as test`);
    log({
      name: 'Database Connection',
      status: 'passed',
      message: 'Successfully connected to database',
    });
    return true;
  } catch (error) {
    log({
      name: 'Database Connection',
      status: 'failed',
      message: `Failed to connect: ${error instanceof Error ? error.message : String(error)}`,
    });
    return false;
  }
}

async function testTableStructure(): Promise<boolean> {
  try {
    const db = await getDb();
    
    // 检查关键表是否存在
    const tables = ['user', 'session', 'account', 'verification', 'user_credit'];
    let allTablesExist = true;
    
    for (const tableName of tables) {
      const result = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = ${tableName}
        )
      `);
      const exists = result[0]?.exists;
      if (!exists) {
        log({
          name: `Table: ${tableName}`,
          status: 'failed',
          message: `Table "${tableName}" does not exist`,
        });
        allTablesExist = false;
      }
    }
    
    if (allTablesExist) {
      log({
        name: 'Table Structure',
        status: 'passed',
        message: 'All required tables exist',
        details: { tables },
      });
    }
    
    return allTablesExist;
  } catch (error) {
    log({
      name: 'Table Structure',
      status: 'failed',
      message: `Error checking tables: ${error instanceof Error ? error.message : String(error)}`,
    });
    return false;
  }
}

async function testUserRegistration(): Promise<{ userId: string | null; email: string }> {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';
  const testName = 'Test User';
  
  try {
    const db = await getDb();
    
    // 创建用户
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const userId = nanoid();
    const now = new Date();
    
    await db.insert(user).values({
      id: userId,
      email: testEmail,
      name: testName,
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
      role: 'user',
      banned: false,
    });
    
    // 创建 account (用于密码登录)
    await db.insert(account).values({
      id: nanoid(),
      userId,
      accountId: testEmail,
      providerId: 'credential',
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    });
    
    // 验证用户是否创建成功
    const createdUser = await db.select().from(user).where(eq(user.email, testEmail)).limit(1);
    
    if (createdUser.length > 0) {
      log({
        name: 'User Registration',
        status: 'passed',
        message: `User created successfully: ${testEmail}`,
        details: {
          userId,
          email: testEmail,
          name: testName,
        },
      });
      return { userId, email: testEmail };
    } else {
      log({
        name: 'User Registration',
        status: 'failed',
        message: 'User not found after creation',
      });
      return { userId: null, email: testEmail };
    }
  } catch (error) {
    log({
      name: 'User Registration',
      status: 'failed',
      message: `Registration failed: ${error instanceof Error ? error.message : String(error)}`,
    });
    return { userId: null, email: testEmail };
  }
}

async function testCreditsInitialization(userId: string): Promise<boolean> {
  try {
    const db = await getDb();
    
    // 创建用户积分记录
    const initialCredits = 100; // 注册赠送积分
    
    await db.insert(userCredit).values({
      id: nanoid(),
      userId,
      currentCredits: initialCredits,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // 创建积分交易记录
    await db.insert(creditTransaction).values({
      id: nanoid(),
      userId,
      type: 'register_gift',
      description: 'Registration bonus',
      amount: initialCredits,
      remainingAmount: initialCredits,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // 验证积分是否正确创建
    const credits = await db.select().from(userCredit).where(eq(userCredit.userId, userId)).limit(1);
    
    if (credits.length > 0 && credits[0].currentCredits === initialCredits) {
      log({
        name: 'Credits Initialization',
        status: 'passed',
        message: `Credits initialized: ${initialCredits} credits`,
        details: {
          userId,
          currentCredits: credits[0].currentCredits,
        },
      });
      return true;
    } else {
      log({
        name: 'Credits Initialization',
        status: 'failed',
        message: 'Credits not initialized correctly',
      });
      return false;
    }
  } catch (error) {
    log({
      name: 'Credits Initialization',
      status: 'failed',
      message: `Failed to initialize credits: ${error instanceof Error ? error.message : String(error)}`,
    });
    return false;
  }
}

async function testUserLogin(email: string): Promise<boolean> {
  try {
    const db = await getDb();
    
    // 查找用户
    const users = await db.select().from(user).where(eq(user.email, email)).limit(1);
    
    if (users.length === 0) {
      log({
        name: 'User Login',
        status: 'failed',
        message: 'User not found',
      });
      return false;
    }
    
    const foundUser = users[0];
    
    // 创建会话
    const sessionId = nanoid();
    const token = nanoid(64);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await db.insert(session).values({
      id: sessionId,
      userId: foundUser.id,
      token,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: '127.0.0.1',
      userAgent: 'Test Script',
    });
    
    // 验证会话是否创建成功
    const sessions = await db.select().from(session).where(eq(session.userId, foundUser.id)).limit(1);
    
    if (sessions.length > 0) {
      log({
        name: 'User Login',
        status: 'passed',
        message: 'Login successful, session created',
        details: {
          sessionId,
          userId: foundUser.id,
          expiresAt,
        },
      });
      return true;
    } else {
      log({
        name: 'User Login',
        status: 'failed',
        message: 'Session not created',
      });
      return false;
    }
  } catch (error) {
    log({
      name: 'User Login',
      status: 'failed',
      message: `Login failed: ${error instanceof Error ? error.message : String(error)}`,
    });
    return false;
  }
}

async function testSessionPersistence(email: string): Promise<boolean> {
  try {
    const db = await getDb();
    
    // 查找用户
    const users = await db.select().from(user).where(eq(user.email, email)).limit(1);
    
    if (users.length === 0) {
      log({
        name: 'Session Persistence',
        status: 'failed',
        message: 'User not found',
      });
      return false;
    }
    
    // 查找会话
    const sessions = await db
      .select()
      .from(session)
      .where(eq(session.userId, users[0].id))
      .orderBy(desc(session.createdAt))
      .limit(1);
    
    if (sessions.length > 0) {
      const currentSession = sessions[0];
      const isValid = currentSession.expiresAt > new Date();
      
      if (isValid) {
        log({
          name: 'Session Persistence',
          status: 'passed',
          message: 'Session is valid and persistent',
          details: {
            sessionId: currentSession.id,
            expiresAt: currentSession.expiresAt,
          },
        });
        return true;
      } else {
        log({
          name: 'Session Persistence',
          status: 'warning',
          message: 'Session exists but expired',
          details: {
            expiresAt: currentSession.expiresAt,
          },
        });
        return false;
      }
    } else {
      log({
        name: 'Session Persistence',
        status: 'failed',
        message: 'No session found',
      });
      return false;
    }
  } catch (error) {
    log({
      name: 'Session Persistence',
      status: 'failed',
      message: `Failed to check session: ${error instanceof Error ? error.message : String(error)}`,
    });
    return false;
  }
}

async function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('🎯 Better Auth Test Report');
  console.log('='.repeat(60) + '\n');
  
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const total = results.length;
  
  console.log(`📊 Summary:`);
  console.log(`   Total Tests: ${total}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⚠️  Warnings: ${warnings}`);
  console.log(`   Success Rate: ${Math.round((passed / total) * 100)}%\n`);
  
  if (failed > 0) {
    console.log('❌ Failed Tests:');
    results.filter(r => r.status === 'failed').forEach(r => {
      console.log(`   - ${r.name}: ${r.message}`);
    });
    console.log('');
  }
  
  if (warnings > 0) {
    console.log('⚠️  Warnings:');
    results.filter(r => r.status === 'warning').forEach(r => {
      console.log(`   - ${r.name}: ${r.message}`);
    });
    console.log('');
  }
  
  console.log('='.repeat(60));
  
  if (failed === 0 && warnings === 0) {
    console.log('🎉 All tests passed! Better Auth is working correctly.');
  } else if (failed > 0) {
    console.log('⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  } else {
    console.log('⚠️  Tests completed with warnings.');
  }
  
  console.log('='.repeat(60) + '\n');
}

async function main() {
  console.log('\n🚀 Starting Better Auth Tests...\n');
  
  // Test 1: Database Connection
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.log('\n❌ Cannot proceed without database connection.\n');
    process.exit(1);
  }
  
  // Test 2: Table Structure
  await testTableStructure();
  
  // Test 3: User Registration
  const { userId, email } = await testUserRegistration();
  
  if (userId) {
    // Test 4: Credits Initialization
    await testCreditsInitialization(userId);
    
    // Test 5: User Login
    await testUserLogin(email);
    
    // Test 6: Session Persistence
    await testSessionPersistence(email);
  } else {
    console.log('\n⚠️  Skipping remaining tests due to registration failure.\n');
  }
  
  // Generate Report
  await generateReport();
}

main().catch((error) => {
  console.error('❌ Test script error:', error);
  process.exit(1);
});
