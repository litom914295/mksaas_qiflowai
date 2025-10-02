#!/usr/bin/env tsx

/**
 * 嘉宾会话迁移脚本
 * 将旧版会话数据转换到 ConversationSessionState 新模型
 *
 * 用法：
 * npm run migrate:guest-sessions
 * 或者: npx tsx scripts/migrate-guest-session.ts --dry-run
 */

import { createClient } from '@supabase/supabase-js';
import { Command } from 'commander';
import dotenv from 'dotenv';
import {
  ConversationSessionState,
  createEmptySessionState,
} from '../src/lib/ai/conversation-memory';
import {
  ConversationContext,
  ConversationMessage,
} from '../src/lib/ai/types/conversation';

// 加载环境变量
dotenv.config({ path: '.env.local' });

interface LegacyGuestSession {
  id: string;
  guest_id: string;
  session_data: any;
  messages: any[];
  created_at: string;
  updated_at: string;
}

interface MigrationStats {
  total: number;
  migrated: number;
  skipped: number;
  errors: number;
  errorDetails: Array<{ id: string; error: string }>;
}

class GuestSessionMigrator {
  private supabase;
  private dryRun = false;
  private batchSize = 50;

  constructor(dryRun = false) {
    this.dryRun = dryRun;

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      throw new Error('Missing required Supabase environment variables');
    }

    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  /**
   * 迁移所有嘉宾会话
   */
  async migrate(): Promise<MigrationStats> {
    const stats: MigrationStats = {
      total: 0,
      migrated: 0,
      skipped: 0,
      errors: 0,
      errorDetails: [],
    };

    console.log('🚀 开始嘉宾会话迁移...');
    if (this.dryRun) {
      console.log('⚠️  DRY RUN 模式 - 不会执行实际写入操作');
    }

    try {
      // 获取所有待迁移的嘉宾会话
      const legacySessions = await this.fetchLegacySessions();
      stats.total = legacySessions.length;

      console.log(`📊 找到 ${stats.total} 个待迁移的嘉宾会话`);

      // 分批处理
      for (let i = 0; i < legacySessions.length; i += this.batchSize) {
        const batch = legacySessions.slice(i, i + this.batchSize);
        console.log(
          `📦 处理批次 ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(legacySessions.length / this.batchSize)}`
        );

        await Promise.all(
          batch.map(async session => {
            try {
              const migrated = await this.migrateSession(session);
              if (migrated) {
                stats.migrated++;
              } else {
                stats.skipped++;
              }
            } catch (error) {
              stats.errors++;
              stats.errorDetails.push({
                id: session.id,
                error: error instanceof Error ? error.message : String(error),
              });
              console.error(`❌ 迁移会话 ${session.id} 失败:`, error);
            }
          })
        );

        // 避免过于频繁的请求
        if (i + this.batchSize < legacySessions.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      console.error('💥 迁移过程中发生错误:', error);
      throw error;
    }

    return stats;
  }

  /**
   * 获取所有旧版嘉宾会话
   */
  private async fetchLegacySessions(): Promise<LegacyGuestSession[]> {
    const { data, error } = await this.supabase
      .from('guest_sessions') // 假设旧表名为 guest_sessions
      .select('*')
      .is('migrated_at', null); // 只获取未迁移的会话

    if (error) {
      throw new Error(`获取旧会话数据失败: ${error.message}`);
    }

    return data || [];
  }

  /**
   * 迁移单个会话
   */
  private async migrateSession(
    legacySession: LegacyGuestSession
  ): Promise<boolean> {
    try {
      // 检查是否已经存在于新表中
      const { data: existing } = await this.supabase
        .from('conversation_states')
        .select('id')
        .eq('session_id', legacySession.id)
        .single();

      if (existing) {
        console.log(`⏭️  会话 ${legacySession.id} 已存在于新表中，跳过`);
        return false;
      }

      // 转换数据格式
      const newSessionState = this.transformLegacySession(legacySession);

      if (!this.dryRun) {
        // 插入到新表
        const { error: insertError } = await this.supabase
          .from('conversation_states')
          .insert({
            session_id: newSessionState.sessionId,
            user_id: newSessionState.userId,
            current_state: newSessionState.currentState,
            context_stack: newSessionState.context.contextStack,
            topic_graph: {}, // 暂时为空，后续可以通过分析填充
            metadata: newSessionState.context.metadata,
            created_at: newSessionState.createdAt,
            updated_at: newSessionState.updatedAt,
          });

        if (insertError) {
          throw new Error(`插入新会话状态失败: ${insertError.message}`);
        }

        // 标记原会话为已迁移
        const { error: updateError } = await this.supabase
          .from('guest_sessions')
          .update({ migrated_at: new Date().toISOString() })
          .eq('id', legacySession.id);

        if (updateError) {
          console.warn(
            `⚠️  标记会话 ${legacySession.id} 为已迁移失败:`,
            updateError.message
          );
        }
      }

      console.log(`✅ 成功迁移会话 ${legacySession.id}`);
      return true;
    } catch (error) {
      console.error(`❌ 迁移会话 ${legacySession.id} 时发生错误:`, error);
      throw error;
    }
  }

  /**
   * 转换旧版会话数据到新格式
   */
  private transformLegacySession(
    legacySession: LegacyGuestSession
  ): ConversationSessionState {
    // 提取并转换消息格式
    const messages: ConversationMessage[] = (legacySession.messages || []).map(
      (msg, index) => ({
        id: msg.id || `msg_${index}`,
        role: msg.role || 'user',
        content: msg.content || '',
        timestamp: new Date(
          msg.timestamp || legacySession.created_at
        ).toISOString(),
        metadata: msg.metadata,
      })
    );

    // 构建新的对话上下文
    const context: ConversationContext = {
      sessionId: legacySession.id,
      userId: legacySession.guest_id,
      messages,
      currentTopic: legacySession.session_data?.topic || 'general',
      userProfile: {
        expertise: legacySession.session_data?.expertise || 'beginner',
        preferences: {
          language: legacySession.session_data?.language || 'zh-CN',
          responseStyle:
            legacySession.session_data?.responseStyle || 'detailed',
          culturalBackground:
            legacySession.session_data?.culturalBackground || 'mainland',
        },
        baziData: legacySession.session_data?.baziData,
        fengshuiData: legacySession.session_data?.fengshuiData,
      },
      contextStack: [],
      metadata: {
        totalMessages: messages.length,
        sessionDuration: 0, // 可以根据创建时间和最后消息时间计算
        lastActivity: new Date(legacySession.updated_at).toISOString(),
        analysisCount: legacySession.session_data?.analysisCount || 0,
      },
    };

    // 推断当前状态
    const currentState = this.inferCurrentState(context);

    return createEmptySessionState({
      sessionId: legacySession.id,
      userId: legacySession.guest_id,
      locale: context.userProfile.preferences.language,
      initialState: currentState,
      context,
    });
  }

  /**
   * 根据会话上下文推断当前状态
   */
  private inferCurrentState(
    context: ConversationContext
  ): ConversationSessionState['currentState'] {
    if (context.messages.length === 0) {
      return 'greeting';
    }

    const lastMessage = context.messages[context.messages.length - 1];

    // 如果有八字或风水数据，可能在分析阶段
    if (context.userProfile.baziData || context.userProfile.fengshuiData) {
      if (context.metadata.analysisCount > 0) {
        return 'explaining';
      }
      return 'analyzing';
    }

    // 如果最后一条是用户消息，可能在收集信息
    if (lastMessage.role === 'user') {
      return 'collecting_info';
    }

    // 默认状态
    return 'greeting';
  }

  /**
   * 验证迁移结果
   */
  async validateMigration(): Promise<void> {
    console.log('🔍 验证迁移结果...');

    const { data: legacyCount } = await this.supabase
      .from('guest_sessions')
      .select('id', { count: 'exact', head: true })
      .is('migrated_at', null);

    const { data: newCount } = await this.supabase
      .from('conversation_states')
      .select('id', { count: 'exact', head: true });

    console.log(`📊 验证结果:`);
    console.log(`   - 未迁移的旧会话: ${legacyCount?.length || 0}`);
    console.log(`   - 新表中的会话总数: ${newCount?.length || 0}`);
  }
}

// CLI 接口
const program = new Command();

program
  .name('migrate-guest-session')
  .description('迁移嘉宾会话数据到新的对话状态模型')
  .option('-d, --dry-run', '仅显示将要执行的操作，不实际修改数据')
  .option('-v, --validate', '验证迁移结果')
  .action(async options => {
    try {
      const migrator = new GuestSessionMigrator(options.dryRun);

      if (options.validate) {
        await migrator.validateMigration();
        return;
      }

      const stats = await migrator.migrate();

      console.log('\n📈 迁移统计:');
      console.log(`   总数: ${stats.total}`);
      console.log(`   成功迁移: ${stats.migrated}`);
      console.log(`   跳过: ${stats.skipped}`);
      console.log(`   失败: ${stats.errors}`);

      if (stats.errors > 0) {
        console.log('\n❌ 错误详情:');
        stats.errorDetails.forEach(({ id, error }) => {
          console.log(`   ${id}: ${error}`);
        });
      }

      console.log('\n✅ 迁移完成!');
    } catch (error) {
      console.error('💥 迁移失败:', error);
      process.exit(1);
    }
  });

// 如果直接运行此脚本
if (require.main === module) {
  program.parse();
}

export { GuestSessionMigrator };
