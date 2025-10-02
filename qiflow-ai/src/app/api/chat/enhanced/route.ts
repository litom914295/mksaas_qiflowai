/**
 * QiFlow AI - å¢žå¼ºç‰ˆèŠå¤©APIè·¯ç”±
 *
 * æä¾›ç®—æ³•é›†æˆçš„AIå¯¹è¯æœåŠ¡API
 */

import { algorithmIntegrationService } from '@/lib/ai/algorithm-integration-service';
import { enhancedAIChatService } from '@/lib/chat/enhanced-ai-chat-service';
import { NextRequest, NextResponse } from 'next/server';

// APIè¯·æ±‚ç±»åž‹
interface ChatRequest {
  message: string;
  sessionId?: string;
  userId: string;
  attachments?: any[];
  config?: {
    enableBaziAnalysis?: boolean;
    enableFengShuiAnalysis?: boolean;
    responseStyle?: 'conversational' | 'analytical' | 'educational';
    explanationLevel?: 'basic' | 'detailed' | 'expert';
  };
}

// APIå“åº”ç±»åž‹
interface ChatResponse {
  success: boolean;
  data?: {
    message: any;
    session: any;
    algorithmResults: any[];
    suggestions: string[];
    followUpQuestions: string[];
    actionItems: string[];
    confidence: number;
    executionTime: number;
  };
  error?: string;
  metadata?: {
    requestId: string;
    timestamp: string;
    version: string;
  };
}

/**
 * POST /api/chat/enhanced
 * å¤„ç†å¢žå¼ºç‰ˆèŠå¤©è¯·æ±‚
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ChatResponse>> {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    console.log(`[èŠå¤©API] æ”¶åˆ°è¯·æ±‚: ${requestId}`);

    // è§£æžè¯·æ±‚ä½“
    const body: ChatRequest = await request.json();

    // éªŒè¯è¯·æ±‚å‚æ•°
    if (!body.message || !body.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ç¼ºå°‘å¿…è¦å‚æ•°: message å’Œ userId',
          metadata: {
            requestId,
            timestamp: new Date().toISOString(),
            version: '1.0.0',
          },
        },
        { status: 400 }
      );
    }

    // ç”Ÿæˆæˆ–ä½¿ç”¨çŽ°æœ‰ä¼šè¯ID
    const sessionId = body.sessionId || `session_${body.userId}_${Date.now()}`;

    // æ›´æ–°ç®—æ³•é›†æˆæœåŠ¡é…ç½®
    if (body.config) {
      algorithmIntegrationService.updateConfig(body.config);
    }

    // å¤„ç†æ¶ˆæ¯
    const result = await enhancedAIChatService.processMessage({
      sessionId,
      userId: body.userId,
      message: body.message,
      attachments: body.attachments || [],
      locale: request.headers.get('x-qiflow-locale') ?? undefined,
      metadata: { requestId, config: body.config },
    });

    const executionTime = Date.now() - startTime;

    console.log(
      `[èŠå¤©API] è¯·æ±‚å¤„ç†å®Œæˆ: ${requestId}, è€—æ—¶: ${executionTime}ms`
    );

    // è¿”å›žæˆåŠŸå“åº”
    return NextResponse.json({
      success: true,
      data: {
        message: result.message,
        session: {
          id: result.session.id,
          title: result.session.title,
          messageCount: result.session.messages.length,
          userProfile: result.session.userProfile,
          updatedAt: result.session.updatedAt,
        },
        algorithmResults: result.integratedResponse.algorithmResults,
        suggestions: result.normalized.suggestions,
        followUpQuestions: result.normalized.followUpQuestions,
        actionItems: result.normalized.actionItems,
        confidence:
          result.integratedResponse.aiResponse.confidence?.overall || 0,
        orchestratorState: result.orchestratorState,
        executionTime,
      },
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;

    console.error(`[èŠå¤©API] è¯·æ±‚å¤„ç†å¤±è´¥: ${requestId}`, error);

    // è¿”å›žé”™è¯¯å“åº”
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'æœåŠ¡å™¨å†…éƒ¨é”™è¯¯',
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat/enhanced?sessionId=xxx
 * èŽ·å–ä¼šè¯ä¿¡æ¯
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ç¼ºå°‘ sessionId å‚æ•°',
          metadata: {
            requestId,
            timestamp: new Date().toISOString(),
            version: '1.0.0',
          },
        },
        { status: 400 }
      );
    }

    // èŽ·å–ä¼šè¯ä¿¡æ¯
    const session = enhancedAIChatService.getEnhancedSession(sessionId);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'ä¼šè¯ä¸å­˜åœ¨',
          metadata: {
            requestId,
            timestamp: new Date().toISOString(),
            version: '1.0.0',
          },
        },
        { status: 404 }
      );
    }

    // èŽ·å–ä¼šè¯ç»Ÿè®¡
    const stats = enhancedAIChatService.getSessionStats(sessionId);

    return NextResponse.json({
      success: true,
      data: {
        session: {
          id: session.id,
          title: session.title,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          messageCount: session.messages.length,
          userProfile: session.userProfile,
          context: (session as any).context,
        },
        stats,
        messages: session.messages.slice(-10), // æœ€è¿‘10æ¡æ¶ˆæ¯
        algorithmHistory: session.algorithmHistory.slice(-5), // æœ€è¿‘5æ¬¡ç®—æ³•ç»“æžœ
      },
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    console.error(`[èŠå¤©API] èŽ·å–ä¼šè¯å¤±è´¥: ${requestId}`, error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'æœåŠ¡å™¨å†…éƒ¨é”™è¯¯',
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chat/enhanced?sessionId=xxx
 * åˆ é™¤ä¼šè¯
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ç¼ºå°‘ sessionId å‚æ•°',
          metadata: {
            requestId,
            timestamp: new Date().toISOString(),
            version: '1.0.0',
          },
        },
        { status: 400 }
      );
    }

    // æ¸…ç†ä¼šè¯æ•°æ®
    const success = enhancedAIChatService.cleanupSession(sessionId, 0);

    return NextResponse.json({
      success,
      data: {
        sessionId,
        deleted: success,
      },
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    console.error(`[èŠå¤©API] åˆ é™¤ä¼šè¯å¤±è´¥: ${requestId}`, error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'æœåŠ¡å™¨å†…éƒ¨é”™è¯¯',
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/chat/enhanced
 * æ›´æ–°ä¼šè¯é…ç½®
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const body = await request.json();
    const { sessionId, config } = body;

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ç¼ºå°‘ sessionId å‚æ•°',
          metadata: {
            requestId,
            timestamp: new Date().toISOString(),
            version: '1.0.0',
          },
        },
        { status: 400 }
      );
    }

    // èŽ·å–ä¼šè¯
    const session = enhancedAIChatService.getEnhancedSession(sessionId);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'ä¼šè¯ä¸å­˜åœ¨',
          metadata: {
            requestId,
            timestamp: new Date().toISOString(),
            version: '1.0.0',
          },
        },
        { status: 404 }
      );
    }

    // æ›´æ–°ä¼šè¯é…ç½®
    if (config) {
      if (config.userProfile) {
        session.userProfile = { ...session.userProfile, ...config.userProfile };
      }
      if (config.settings) {
        session.settings = { ...session.settings, ...config.settings };
      }
      session.updatedAt = new Date();
    }

    return NextResponse.json({
      success: true,
      data: {
        session: {
          id: session.id,
          title: session.title,
          userProfile: session.userProfile,
          settings: session.settings,
          updatedAt: session.updatedAt,
        },
      },
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (error) {
    console.error(`[èŠå¤©API] æ›´æ–°ä¼šè¯å¤±è´¥: ${requestId}`, error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'æœåŠ¡å™¨å†…éƒ¨é”™è¯¯',
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      },
      { status: 500 }
    );
  }
}
