// Prisma 兼容层 - 使用 Supabase 作为后端
import { supabaseAdmin } from '../auth';

// 导出一个简单的 prisma 兼容对象
export const prisma = {
  user: {
    findMany: async () => {
      const { data } = await supabaseAdmin.from('user').select('*');
      return data || [];
    },
    findFirst: async (args?: any) => {
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
  },
};
