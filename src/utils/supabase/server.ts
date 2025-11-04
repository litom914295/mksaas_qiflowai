import type { Database } from '@/types/database';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookie = (await cookieStore).get(name);
          return cookie?.value;
        },
        async set(name: string, value: string, options) {
          try {
            (await cookieStore).set({ name, value, ...options });
          } catch (error) {
            // Cookie 只能在服务端组件中设置
            // 在服务端 Actions 中设置 cookie 可能会失败,这是预期的行为
          }
        },
        async remove(name: string, options) {
          try {
            (await cookieStore).set({ name, value: '', ...options });
          } catch (error) {
            // Cookie 只能在服务端组件中删除
            // 在服务端 Actions 中删除 cookie 可能会失败,这是预期的行为
          }
        },
      },
    }
  );
}
