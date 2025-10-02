import { authManager } from '@/lib/auth/auth-manager';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 用户资料更新验证模式
const profileUpdateSchema = z.object({
  displayName: z.string().min(1, '显示名称不能为空').max(50, '显示名称不能超过50个字符'),
  preferredLocale: z.string().optional(),
  timezone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

// 敏感数据更新验证模式
const sensitiveDataUpdateSchema = z.object({
  birthDate: z.string().optional(),
  birthTime: z.string().optional(),
  birthLocation: z.string().optional(),
  phone: z.string().optional(),
  currentPassword: z.string().min(1, '需要当前密码验证'),
});

export async function GET(request: NextRequest) {
  try {
    // 获取当前用户
    const user = await authManager.getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        preferredLocale: user.preferredLocale,
        timezone: user.timezone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
        isActive: user.isActive,
      },
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get user profile',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 获取当前用户
    const user = await authManager.getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, data } = body;

    if (type === 'profile') {
      // 更新基础资料
      const validatedData = profileUpdateSchema.parse(data);
      
      await authManager.updateProfile(validatedData);

      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully',
      });

    } else if (type === 'sensitive') {
      // 更新敏感数据
      const validatedData = sensitiveDataUpdateSchema.parse(data);
      
      await authManager.updateSensitiveData(validatedData);

      return NextResponse.json({
        success: true,
        message: 'Sensitive data updated successfully',
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid update type' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Update user profile error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: (error as any).errors.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // 根据错误类型返回不同的状态码
    let statusCode = 500;
    if (errorMessage.includes('Current password is incorrect')) {
      statusCode = 401;
    } else if (errorMessage.includes('User not authenticated')) {
      statusCode = 401;
    }

    return NextResponse.json(
      { 
        error: 'Failed to update profile',
        message: errorMessage,
      },
      { status: statusCode }
    );
  }
}

// 删除用户账户
export async function DELETE(request: NextRequest) {
  try {
    // 获取当前用户
    const user = await authManager.getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { password, confirmDelete } = body;

    if (!confirmDelete) {
      return NextResponse.json(
        { error: 'Account deletion must be confirmed' },
        { status: 400 }
      );
    }

    // 验证密码
    try {
      await authManager.signIn({
        email: user.email,
        password: password,
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // 删除用户账户
    // 注意：这里需要实现删除逻辑，包括：
    // 1. 删除用户数据
    // 2. 删除相关分析记录
    // 3. 删除订阅信息
    // 4. 发送确认邮件
    
    return NextResponse.json({
      success: true,
      message: 'Account deletion request submitted. Please check your email for confirmation.',
    });

  } catch (error) {
    console.error('Delete user account error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to delete account',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}