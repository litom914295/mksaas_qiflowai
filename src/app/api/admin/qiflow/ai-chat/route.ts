import { verifyAuth } from '@/lib/auth/verify';
import { type NextRequest, NextResponse } from 'next/server';

// AI对话管理API
// 注意: 当前项目没有chat相关数据表,返回模拟数据
// TODO: 需要创建 chat_sessions 和 chat_messages 表来支持实际功能

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'stats';

    if (type === 'stats') {
      // 返回模拟统计数据
      const stats = {
        totalSessions: 0,
        todaySessions: 0,
        thisMonthSessions: 0,
        totalMessages: 0,
        avgMessagesPerSession: 0,
        totalTokens: 0,
        models: {
          gpt4: 0,
          gpt35: 0,
          claude: 0,
        },
        trend: [],
        notice:
          '当前项目未配置AI对话数据表,显示为模拟数据。需要创建 chat_sessions 和 chat_messages 表以支持实际功能。',
      };

      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    if (type === 'list') {
      // 返回空列表
      return NextResponse.json({
        success: true,
        data: {
          records: [],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 0,
            totalPages: 0,
          },
        },
        notice:
          '当前项目未配置AI对话数据表。需要创建 chat_sessions 和 chat_messages 表以支持实际功能。',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('获取AI对话数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取数据失败',
      },
      { status: 500 }
    );
  }
}
