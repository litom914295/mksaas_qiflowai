import { NextRequest, NextResponse } from 'next/server';
import { withGuestSession, getGuestSession } from '@/lib/auth/guest-middleware';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  return withGuestSession(request, async (req) => {
    const session = getGuestSession(req);
    
    if (!session) {
      return NextResponse.json({
        isValid: false,
        isGuest: false,
        message: 'No guest session found',
      });
    }

    return NextResponse.json({
      isValid: true,
      isGuest: true,
      session: {
        id: session.id,
        expiresAt: session.expiresAt.toISOString(),
        analysisCount: session.analysisCount,
        maxAnalyses: session.maxAnalyses,
        aiQueriesCount: session.aiQueriesCount,
        maxAiQueries: session.maxAiQueries,
        renewalCount: session.renewalCount,
        isActive: session.isActive,
        mergedToUserId: session.mergedToUserId,
      },
    });
  });
}

export async function POST(request: NextRequest) {
  return withGuestSession(request, async (req) => {
    const session = getGuestSession(req);
    
    if (!session) {
      return NextResponse.json({
        error: 'No guest session found',
      }, { status: 404 });
    }

    // 检查使用限制
    const { data: usageData, error } = await supabase
      .from('guest_sessions')
      .select('analysis_count, max_analyses, ai_queries_count, max_ai_queries')
      .eq('id', session.id)
      .single();

    if (error) {
      return NextResponse.json({
        error: 'Failed to fetch usage data',
      }, { status: 500 });
    }

    return NextResponse.json({
      sessionId: session.id,
      usage: {
        analysis: {
          count: usageData.analysis_count,
          max: usageData.max_analyses,
          remaining: Math.max(0, usageData.max_analyses - usageData.analysis_count),
        },
        aiQueries: {
          count: usageData.ai_queries_count,
          max: usageData.max_ai_queries,
          remaining: Math.max(0, usageData.max_ai_queries - usageData.ai_queries_count),
        },
      },
      limits: {
        canAnalyze: usageData.analysis_count < usageData.max_analyses,
        canQueryAI: usageData.ai_queries_count < usageData.max_ai_queries,
      },
    });
  });
}
