import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { AuditLog } from '@/lib/qiflow/ai/guardrails';

// 审计日志Schema
const AuditLogSchema = z.object({
  timestamp: z.string(),
  userId: z.string().optional(),
  sessionId: z.string(),
  questionType: z.enum(['bazi', 'fengshui', 'general', 'unknown']),
  hasValidData: z.boolean(),
  dataVersion: z.string().optional(),
  dataHash: z.string().optional(),
  responseType: z.enum(['ANALYSIS', 'GUIDANCE', 'SENSITIVE_FILTER', 'ERROR']),
  confidenceLevel: z.number().optional(),
  error: z.string().optional(),
});

// 内存存储（实际项目应该使用数据库）
const auditLogs: AuditLog[] = [];
const MAX_LOGS = 1000;

/**
 * 处理审计日志记录
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证日志数据
    const validationResult = AuditLogSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid log format',
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }
    
    const logEntry = validationResult.data as AuditLog;
    
    // 添加服务器端信息
    const enrichedLog: AuditLog = {
      ...logEntry,
      timestamp: new Date().toISOString(),
    };
    
    // 存储日志（内存存储，实际应该写入数据库）
    auditLogs.push(enrichedLog);
    
    // 限制内存中的日志数量
    if (auditLogs.length > MAX_LOGS) {
      auditLogs.shift();
    }
    
    // 在生产环境中，这里应该：
    // 1. 写入数据库
    // 2. 发送到日志分析服务（如 DataDog, CloudWatch等）
    // 3. 触发异常检测和告警
    
    // 控制台输出用于调试
    console.log('[AUDIT LOG]', JSON.stringify(enrichedLog, null, 2));
    
    // 检测异常模式
    checkAnomalies(enrichedLog);
    
    return NextResponse.json({
      success: true,
      message: 'Log recorded successfully',
    });
    
  } catch (error) {
    console.error('Audit log error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to record audit log' 
      },
      { status: 500 }
    );
  }
}

/**
 * 获取审计日志（仅用于开发/调试）
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const responseType = searchParams.get('responseType');
  const limit = parseInt(searchParams.get('limit') || '100');
  
  let filteredLogs = [...auditLogs];
  
  // 过滤条件
  if (sessionId) {
    filteredLogs = filteredLogs.filter(log => log.sessionId === sessionId);
  }
  
  if (responseType) {
    filteredLogs = filteredLogs.filter(log => log.responseType === responseType);
  }
  
  // 限制返回数量
  filteredLogs = filteredLogs.slice(-limit);
  
  // 统计信息
  const stats = {
    total: auditLogs.length,
    filtered: filteredLogs.length,
    sensitiveFiltered: filteredLogs.filter(l => l.responseType === 'SENSITIVE_FILTER').length,
    guidanceProvided: filteredLogs.filter(l => l.responseType === 'GUIDANCE').length,
    analysisCompleted: filteredLogs.filter(l => l.responseType === 'ANALYSIS').length,
    errors: filteredLogs.filter(l => l.responseType === 'ERROR').length,
  };
  
  return NextResponse.json({
    success: true,
    logs: filteredLogs,
    stats,
  });
}

/**
 * 检测异常模式
 */
function checkAnomalies(log: AuditLog) {
  // 检测敏感话题频繁触发
  const recentSensitiveLogs = auditLogs
    .filter(l => l.responseType === 'SENSITIVE_FILTER')
    .filter(l => {
      const logTime = new Date(l.timestamp).getTime();
      const now = Date.now();
      return now - logTime < 5 * 60 * 1000; // 5分钟内
    });
  
  if (recentSensitiveLogs.length > 5) {
    console.warn('[ANOMALY DETECTED] High frequency of sensitive topic attempts:', {
      count: recentSensitiveLogs.length,
      sessionIds: [...new Set(recentSensitiveLogs.map(l => l.sessionId))],
    });
  }
  
  // 检测同一会话的错误率
  const sessionLogs = auditLogs.filter(l => l.sessionId === log.sessionId);
  const errorRate = sessionLogs.filter(l => l.responseType === 'ERROR').length / sessionLogs.length;
  
  if (errorRate > 0.5 && sessionLogs.length > 5) {
    console.warn('[ANOMALY DETECTED] High error rate for session:', {
      sessionId: log.sessionId,
      errorRate,
      totalRequests: sessionLogs.length,
    });
  }
  
  // 检测未授权访问模式（无数据却频繁请求分析）
  const noDataRequests = auditLogs
    .filter(l => l.sessionId === log.sessionId)
    .filter(l => !l.hasValidData && l.responseType === 'GUIDANCE');
  
  if (noDataRequests.length > 10) {
    console.warn('[ANOMALY DETECTED] Frequent requests without data:', {
      sessionId: log.sessionId,
      requestCount: noDataRequests.length,
    });
  }
}

/**
 * OPTIONS请求处理（CORS）
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}