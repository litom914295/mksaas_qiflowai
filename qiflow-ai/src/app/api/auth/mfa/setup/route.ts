import { NextRequest, NextResponse } from 'next/server';
import { authManager } from '@/lib/auth/auth-manager';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // 验证用户是否已登录
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // 设置 MFA
    const mfaSetup = await authManager.setupMFA();

    // 记录 MFA 设置事件
    console.log('MFA setup initiated:', {
      userId: user.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      mfa: {
        isEnabled: mfaSetup.isEnabled,
        backupCodes: mfaSetup.backupCodes,
        totpSecret: mfaSetup.totpSecret,
        qrCode: mfaSetup.qrCode,
      },
      message: 'MFA setup initiated. Please scan the QR code with your authenticator app.',
    });

  } catch (error) {
    console.error('MFA setup error:', error);

    return NextResponse.json(
      { 
        error: 'MFA setup failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
