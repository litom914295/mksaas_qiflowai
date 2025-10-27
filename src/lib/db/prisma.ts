// Prisma 兼容层 - 使用 Supabase 作为后端
import { supabaseAdmin } from '../auth-supabase-integration';

// 导出一个简单的 prisma 兼容对象（仅为类型与开发期构建通过而设计）
export const prisma: any = {
  // 通用事务封装
  async $transaction(ops: any) {
    if (typeof ops === 'function') return ops(prisma);
    return Promise.all(ops);
  },
  async $queryRaw() {
    return [];
  },

  // 用户表
  user: {
    findMany: async () => {
      const { data } = await supabaseAdmin.from('user').select('*');
      return data || [];
    },
    findFirst: async () => {
      const { data } = await supabaseAdmin.from('user').select('*').limit(1);
      return data?.[0] || null;
    },
    findUnique: async (args: any) => {
      const { data } = await supabaseAdmin
        .from('user')
        .select('*')
        .eq('id', args?.where?.id)
        .single();
      return data;
    },
    create: async (args: any) => {
      const { data } = await supabaseAdmin
        .from('user')
        .insert(args.data)
        .select()
        .single();
      return data;
    },
    update: async (args: any) => {
      const { data } = await supabaseAdmin
        .from('user')
        .update(args.data)
        .eq('id', args?.where?.id)
        .select()
        .single();
      return data;
    },
    delete: async (args: any) => {
      const { data } = await supabaseAdmin
        .from('user')
        .delete()
        .eq('id', args?.where?.id)
        .select()
        .single();
      return data;
    },
    count: async () => {
      const { count } = await supabaseAdmin
        .from('user')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
    aggregate: async () => ({ _avg: { credits: 0 } }),
  },

  // 签到表
  checkIn: {
    findUnique: async () => null,
    findFirst: async () => null,
    create: async (args: any) => args?.data || null,
    count: async () => 0,
  },

  // 交易表
  creditTransaction: {
    findMany: async () => [],
    count: async () => 0,
    aggregate: async () => ({ _sum: { amount: 0 }, _count: 0 }),
    create: async (args: any) => args?.data || null,
  },

  // 配置表
  creditConfig: {
    findUnique: async () => null,
    findMany: async () => [],
    upsert: async (args: any) => args?.create || args?.update || null,
    createMany: async (args: any) => ({ count: (args?.data || []).length }),
  },

  // 推荐关系
  referral: {
    findFirst: async () => null,
    update: async (args: any) => args?.data || null,
    create: async (args: any) => args?.data || null,
  },

  // 错误日志
  errorLog: {
    findMany: async () => [],
    count: async () => 0,
    update: async (args: any) => args?.data || null,
    create: async (args: any) => args?.data || null,
    groupBy: async (args: any) => [],
  },

  // 系统日志
  systemLog: {
    findMany: async () => [],
    count: async () => 0,
  },
};
