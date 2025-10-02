import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // 检查是否有错误
    if (error) {
      console.error('WeChat OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/auth/login?error=wechat_oauth_error&message=${error}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/auth/login?error=missing_code', request.url)
      );
    }

    // 获取设备信息
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || 
                     headersList.get('x-real-ip') || 'unknown';

    // 处理微信 OAuth 回调
    // 注意：这里需要根据实际的微信 OAuth 流程进行调整
    // 微信的 OAuth 流程可能与标准的 OAuth 2.0 有所不同

    try {
      // 1. 使用 code 获取 access_token
      const tokenResponse = await fetch('https://api.weixin.qq.com/sns/oauth2/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          appid: process.env.WECHAT_APP_ID!,
          secret: process.env.WECHAT_APP_SECRET!,
          code,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.errcode) {
        throw new Error(`WeChat token error: ${tokenData.errmsg}`);
      }

      // 2. 使用 access_token 获取用户信息
      const userResponse = await fetch(
        `https://api.weixin.qq.com/sns/userinfo?access_token=${tokenData.access_token}&openid=${tokenData.openid}`
      );

      const userData = await userResponse.json();

      if (userData.errcode) {
        throw new Error(`WeChat user info error: ${userData.errmsg}`);
      }

      // 3. 检查用户是否已存在
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', `${userData.openid}@wechat.local`)
        .single();

      let userId: string;

      if (existingUser) {
        // 用户已存在，更新最后登录时间
        userId = existingUser.id;
        await supabase
          .from('users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', userId);
      } else {
        // 创建新用户
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email: `${userData.openid}@wechat.local`,
            display_name: userData.nickname || '微信用户',
            avatar_url: userData.headimgurl,
            role: 'user',
            preferred_locale: 'zh-CN',
            timezone: 'Asia/Shanghai',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_login_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) {
          throw new Error(`Failed to create user: ${createError.message}`);
        }

        userId = newUser.id;
      }

      // 4. 创建 Supabase 会话
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: `${userData.openid}@wechat.local`,
        options: {
          redirectTo: `${request.nextUrl.origin}/auth/callback`,
        },
      });

      if (sessionError) {
        throw new Error(`Failed to create session: ${sessionError.message}`);
      }

      // 5. 记录登录事件
      console.log('WeChat OAuth login:', {
        userId,
        openid: userData.openid,
        nickname: userData.nickname,
        ipAddress,
        userAgent: userAgent.substring(0, 100),
        timestamp: new Date().toISOString(),
      });

      // 6. 重定向到成功页面
      return NextResponse.redirect(
        new URL(`/auth/callback?token=${(sessionData.properties as any)?.access_token}`, request.url)
      );

    } catch (wechatError) {
      console.error('WeChat OAuth processing error:', wechatError);
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=wechat_processing_error&message=${encodeURIComponent(
            wechatError instanceof Error ? wechatError.message : 'Unknown error'
          )}`,
          request.url
        )
      );
    }

  } catch (error) {
    console.error('WeChat callback error:', error);
    
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=callback_error&message=${encodeURIComponent(
          error instanceof Error ? error.message : 'Unknown error'
        )}`,
        request.url
      )
    );
  }
}