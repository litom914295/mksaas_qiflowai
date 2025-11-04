/**
 * 用户积分系统诊断和修复脚本 v2.0
 * 用于检测和修复用户积分记录缺失问题
 */
import { getDb } from '@/db';
import { userCredit, creditTransaction, user } from '@/db/schema';
import { and, desc, eq, gte } from 'drizzle-orm';
import { randomUUID } from 'crypto';

async function fixUserCredits(userEmail: string) {
  console.log('========================================');
  console.log('🔧 开始修复用户积分系统');
  console.log('用户邮箱:', userEmail);
  console.log('========================================\n');

  try {
    const db = await getDb();
    
    // 1. 查找用户
    console.log('📍 步骤1: 查找用户...');
    const users = await db
      .select()
      .from(user)
      .where(eq(user.email, userEmail))
      .limit(1);
      
    if (!users[0]) {
      console.error('❌ 用户不存在:', userEmail);
      return;
    }
    
    const userId = users[0].id;
    console.log('✅ 找到用户 ID:', userId);
    console.log('用户名:', users[0].name);
    console.log('');
    
    // 2. 检查/创建积分记录
    console.log('📍 步骤2: 检查积分记录...');
    const credits = await db
      .select()
      .from(userCredit)
      .where(eq(userCredit.userId, userId))
      .limit(1);
      
    if (!credits[0]) {
      console.log('⚠️  用户没有积分记录，正在创建...');
      const initialCredits = 100; // 给100初始积分作为欢迎礼物
      
      await db.insert(userCredit).values({
        id: randomUUID(),
        userId,
        currentCredits: initialCredits,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      // 记录初始积分交易
      await db.insert(creditTransaction).values({
        id: randomUUID(),
        userId,
        type: 'WELCOME_BONUS',
        amount: initialCredits,
        remainingAmount: initialCredits,
        description: `新用户欢迎积分 +${initialCredits}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log('✅ 积分记录已创建');
      console.log('💰 初始积分:', initialCredits);
    } else {
      console.log('✅ 积分记录存在');
      console.log('💰 当前积分:', credits[0].currentCredits);
    }
    console.log('');
    
    // 3. 检查今日签到状态
    console.log('📍 步骤3: 检查今日签到状态...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySignIn = await db
      .select()
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          eq(creditTransaction.type, 'DAILY_SIGNIN'),
          gte(creditTransaction.createdAt, today)
        )
      )
      .limit(1);
      
    if (todaySignIn.length > 0) {
      console.log('✅ 今日已签到');
      console.log('签到时间:', todaySignIn[0].createdAt);
      console.log('获得积分:', todaySignIn[0].amount);
    } else {
      console.log('⚠️  今日未签到');
      console.log('提示: 访问页面将自动触发签到');
    }
    console.log('');
    
    // 4. 计算连续签到天数
    console.log('📍 步骤4: 计算连续签到天数...');
    const signIns = await db
      .select()
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          eq(creditTransaction.type, 'DAILY_SIGNIN')
        )
      )
      .orderBy(desc(creditTransaction.createdAt));
      
    console.log('📊 总签到次数:', signIns.length);
    
    // 计算连续天数
    const dateKey = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    
    const marked = new Set<string>();
    for (const record of signIns) {
      const d = new Date(record.createdAt as any);
      marked.add(dateKey(d));
    }
    
    let streak = 0;
    const checkDay = new Date();
    checkDay.setHours(0, 0, 0, 0);
    
    // 从今天开始向前检查连续天数
    for (let i = 0; i < 365; i++) {
      const cur = new Date(checkDay);
      cur.setDate(checkDay.getDate() - i);
      if (marked.has(dateKey(cur))) {
        streak++;
      } else if (i > 0) {
        // 如果不是今天且断了，就停止
        break;
      }
    }
    
    console.log('🔥 连续签到天数:', streak);
    console.log('');
    
    // 5. 显示最近的签到记录
    console.log('📍 步骤5: 最近签到记录...');
    const recentSignIns = signIns.slice(0, 5);
    if (recentSignIns.length > 0) {
      console.log('最近5次签到:');
      recentSignIns.forEach((s, i) => {
        const date = new Date(s.createdAt as any);
        console.log(`  ${i + 1}. ${date.toLocaleDateString()} ${date.toLocaleTimeString()} - 获得 ${s.amount} 积分`);
      });
    } else {
      console.log('暂无签到记录');
    }
    console.log('');
    
    // 6. 统计所有积分交易
    console.log('📍 步骤6: 积分交易统计...');
    const allTransactions = await db
      .select()
      .from(creditTransaction)
      .where(eq(creditTransaction.userId, userId))
      .orderBy(desc(creditTransaction.createdAt));
      
    const stats = {
      total: allTransactions.length,
      earned: 0,
      spent: 0,
      signIns: 0,
    };
    
    allTransactions.forEach(t => {
      if (t.amount > 0) {
        stats.earned += t.amount;
      } else {
        stats.spent += Math.abs(t.amount);
      }
      if (t.type === 'DAILY_SIGNIN') {
        stats.signIns++;
      }
    });
    
    console.log('📊 交易统计:');
    console.log('  总交易次数:', stats.total);
    console.log('  累计获得积分:', stats.earned);
    console.log('  累计消费积分:', stats.spent);
    console.log('  签到次数:', stats.signIns);
    console.log('');
    
    // 7. 最终状态
    console.log('========================================');
    console.log('✅ 诊断完成！');
    console.log('');
    console.log('📋 用户状态总结:');
    const finalCredit = await db
      .select()
      .from(userCredit)
      .where(eq(userCredit.userId, userId))
      .limit(1);
      
    console.log('  用户ID:', userId);
    console.log('  用户邮箱:', userEmail);
    console.log('  当前积分余额:', finalCredit[0]?.currentCredits || 0);
    console.log('  连续签到天数:', streak);
    console.log('  总签到次数:', stats.signIns);
    console.log('');
    
    if (finalCredit[0]?.currentCredits === 0 && stats.signIns === 0) {
      console.log('💡 建议: 用户还未开始使用积分系统');
      console.log('   - 访问页面将自动触发每日签到');
      console.log('   - 首次签到可获得 5-20 积分');
    } else if (todaySignIn.length === 0) {
      console.log('💡 建议: 今日未签到');
      console.log('   - 访问页面即可自动签到');
    } else {
      console.log('✨ 状态良好，积分系统运行正常');
    }
    
    console.log('========================================');
    
  } catch (error) {
    console.error('❌ 修复过程出错:', error);
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
      console.error('堆栈:', error.stack);
    }
  } finally {
    process.exit(0);
  }
}

// 从命令行参数获取邮箱，默认使用 admin
const email = process.argv[2] || 'admin@qiflowai.com';
console.log('🚀 启动积分系统诊断和修复工具\n');

// 运行修复
fixUserCredits(email).catch(console.error);