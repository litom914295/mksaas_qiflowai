#!/usr/bin/env tsx
/**
 * 完整修复认证系统 - 一键修复所有问题
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 开始修复认证系统...\n');

// 1. 修复 API 路由
const authRouteContent = `import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 初始化 Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  const path = new URL(request.url).pathname;
  console.log('Auth API called:', path);
  
  // 处理登录
  if (path.includes('/sign-in/email')) {
    try {
      const body = await request.json();
      const { email, password } = body;
      
      console.log('Login attempt for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      
      if (!data.session || !data.user) {
        return NextResponse.json({ error: 'No session created' }, { status: 401 });
      }
      
      // 创建响应
      const response = NextResponse.json({ 
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || 'User',
          image: null,
          emailVerified: true,
          createdAt: data.user.created_at,
        },
        session: {
          token: data.session.access_token,
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
        }
      });
      
      // 设置 Cookie
      response.cookies.set('auth-token', data.session.access_token, {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        maxAge: 3600,
        path: '/',
      });
      
      console.log('✅ Login successful for:', email);
      return response;
    } catch (error: any) {
      console.error('Login error:', error);
      return NextResponse.json(
        { error: error.message || 'Login failed' },
        { status: 500 }
      );
    }
  }
  
  // 处理登出
  if (path.includes('/sign-out')) {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('auth-token');
    console.log('✅ User signed out');
    return response;
  }
  
  // 默认响应
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function GET(request: Request) {
  const path = new URL(request.url).pathname;
  
  // 获取会话
  if (path.includes('/get-session')) {
    try {
      const token = request.cookies.get('auth-token')?.value;
      
      if (!token) {
        return NextResponse.json({ session: null, user: null });
      }
      
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error || !data.user) {
        return NextResponse.json({ session: null, user: null });
      }
      
      return NextResponse.json({
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || 'User',
          image: null,
          emailVerified: true,
          createdAt: data.user.created_at,
        },
        session: {
          token,
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
        }
      });
    } catch (error) {
      return NextResponse.json({ session: null, user: null });
    }
  }
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
`;

// 2. 修复 server.ts
const serverContent = `import 'server-only';

import { cookies } from 'next/headers';
import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const getSession = cache(async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token || !supabaseUrl || !supabaseKey) {
      return null;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.auth.getUser(token);
    
    if (!error && data.user) {
      return {
        session: {
          token,
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
        },
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || 'User',
          image: null,
          emailVerified: true,
          createdAt: data.user.created_at,
        },
      };
    }
  } catch (error) {
    console.error('Failed to get session:', error);
  }
  
  return null;
});
`;

// 3. 修复登录表单错误处理
const loginFormFix = `
        onError: (ctx: any) => {
          console.error('Login error:', ctx);
          
          let errorMessage = '登录失败';
          
          if (ctx.error) {
            if (typeof ctx.error === 'string') {
              errorMessage = ctx.error;
            } else if (ctx.error.message) {
              errorMessage = ctx.error.message;
            }
          }
          
          if (ctx.response?.status === 401) {
            errorMessage = '邮箱或密码错误';
          } else if (ctx.response?.status === 500) {
            errorMessage = '服务器错误，请稍后重试';
          }
          
          setError(errorMessage);
          
          if (captchaConfigured) {
            resetCaptcha();
          }
        },`;

// 写入文件
try {
  // 1. 修复 API 路由
  const authRoutePath = path.join(process.cwd(), 'src/app/api/auth/[...all]/route.ts');
  fs.writeFileSync(authRoutePath, authRouteContent);
  console.log('✅ Fixed: API route');
  
  // 2. 修复 server.ts
  const serverPath = path.join(process.cwd(), 'src/lib/server.ts');
  fs.writeFileSync(serverPath, serverContent);
  console.log('✅ Fixed: server.ts');
  
  // 3. 修复登录表单
  const loginFormPath = path.join(process.cwd(), 'src/components/auth/login-form.tsx');
  let loginFormContent = fs.readFileSync(loginFormPath, 'utf-8');
  
  // 查找并替换 onError 函数
  const onErrorStart = loginFormContent.indexOf('onError: (ctx: any) => {');
  if (onErrorStart !== -1) {
    const onErrorEnd = loginFormContent.indexOf('        },', onErrorStart) + 10;
    loginFormContent = 
      loginFormContent.substring(0, onErrorStart) + 
      loginFormFix.trim() + 
      loginFormContent.substring(onErrorEnd);
    fs.writeFileSync(loginFormPath, loginFormContent);
    console.log('✅ Fixed: login-form.tsx');
  }
  
  console.log('\n✅ 认证系统修复完成！');
  console.log('\n请执行以下步骤：');
  console.log('1. 停止开发服务器 (Ctrl+C)');
  console.log('2. 清除缓存: Remove-Item -Path ".next" -Recurse -Force');
  console.log('3. 重启服务器: npm run dev');
  console.log('4. 清除浏览器缓存 (Ctrl+Shift+Delete)');
  console.log('5. 访问: http://localhost:3001/zh-CN/auth/login');
  console.log('6. 登录: admin@qiflowai.com / admin123456');
  
} catch (error) {
  console.error('❌ 修复失败:', error);
}