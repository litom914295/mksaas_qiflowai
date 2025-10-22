/**
 * 监控数据库查询服务
 * 提供所有监控相关的数据库操作
 */

// @ts-ignore - Prisma client
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

/**
 * 错误日志查询
 */
export const errorLogQueries = {
  // 获取错误列表
  async getErrors(params: {
    page?: number;
    limit?: number;
    level?: string;
    status?: string;
    search?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const {
      page = 1,
      limit = 20,
      level,
      status,
      search,
      startDate,
      endDate,
    } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(level && { level }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { message: { contains: search, mode: 'insensitive' } },
          { culprit: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(startDate &&
        endDate && {
          lastSeen: {
            gte: startDate,
            lte: endDate,
          },
        }),
    };

    const [errors, total] = await Promise.all([
      prisma.errorLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lastSeen: 'desc' },
      }),
      prisma.errorLog.count({ where }),
    ]);

    return { errors, total, page, limit };
  },

  // 创建或更新错误日志
  async createOrUpdateError(data: {
    message: string;
    level: string;
    culprit?: string;
    stackTrace?: string;
    tags?: any;
    metadata?: any;
  }) {
    // 尝试查找已存在的相同错误
    const existing = await prisma.errorLog.findFirst({
      where: {
        message: data.message,
        culprit: data.culprit,
        status: 'unresolved',
      },
    });

    if (existing) {
      // 更新计数和最后出现时间
      return prisma.errorLog.update({
        where: { id: existing.id },
        data: {
          count: { increment: 1 },
          lastSeen: new Date(),
        },
      });
    }

    // 创建新错误记录
    return prisma.errorLog.create({
      data: {
        ...data,
        firstSeen: new Date(),
        lastSeen: new Date(),
      },
    });
  },

  // 解决错误
  async resolveError(id: string, resolvedBy: string) {
    return prisma.errorLog.update({
      where: { id },
      data: {
        status: 'resolved',
        resolvedBy,
        resolvedAt: new Date(),
      },
    });
  },

  // 获取错误统计
  async getErrorStats(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [byLevel, byStatus, trend] = await Promise.all([
      // 按级别统计
      prisma.errorLog.groupBy({
        by: ['level'],
        _count: true,
        where: {
          lastSeen: { gte: startDate },
        },
      }),
      // 按状态统计
      prisma.errorLog.groupBy({
        by: ['status'],
        _count: true,
      }),
      // 趋势统计（按天）
      prisma.$queryRaw`
        SELECT 
          DATE(last_seen) as date,
          COUNT(*) as count,
          level
        FROM error_logs
        WHERE last_seen >= ${startDate}
        GROUP BY DATE(last_seen), level
        ORDER BY date DESC
      `,
    ]);

    return { byLevel, byStatus, trend };
  },
};

/**
 * 系统日志查询
 */
export const systemLogQueries = {
  // 获取日志列表
  async getLogs(params: {
    page?: number;
    limit?: number;
    level?: string;
    source?: string;
    search?: string;
    startTime?: Date;
    endTime?: Date;
  }) {
    const {
      page = 1,
      limit = 50,
      level,
      source,
      search,
      startTime,
      endTime,
    } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(level && level !== 'all' && { level: level.toUpperCase() }),
      ...(source && source !== 'all' && { source: { startsWith: source } }),
      ...(search && {
        OR: [
          { message: { contains: search, mode: 'insensitive' } },
          { source: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(startTime &&
        endTime && {
          timestamp: {
            gte: startTime,
            lte: endTime,
          },
        }),
    };

    const [logs, total] = await Promise.all([
      prisma.systemLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.systemLog.count({ where }),
    ]);

    return { logs, total, page, limit };
  },

  // 创建日志
  async createLog(data: {
    level: string;
    source: string;
    message: string;
    metadata?: any;
    userId?: string;
    ip?: string;
    userAgent?: string;
  }) {
    return prisma.systemLog.create({
      data: {
        ...data,
        timestamp: new Date(),
      },
    });
  },

  // 清理旧日志
  async cleanOldLogs(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return prisma.systemLog.deleteMany({
      where: {
        timestamp: { lt: cutoffDate },
      },
    });
  },
};

/**
 * 性能指标查询
 */
export const performanceQueries = {
  // 获取性能指标
  async getMetrics(params: {
    metricType?: string;
    startTime?: Date;
    endTime?: Date;
    endpoint?: string;
  }) {
    const { metricType, startTime, endTime, endpoint } = params;

    const where: any = {
      ...(metricType && { metricType }),
      ...(endpoint && { endpoint }),
      ...(startTime &&
        endTime && {
          timestamp: {
            gte: startTime,
            lte: endTime,
          },
        }),
    };

    return prisma.performanceMetric.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 1000, // 限制返回数量
    });
  },

  // 记录性能指标
  async recordMetric(data: {
    metricType: string;
    value: number;
    unit?: string;
    endpoint?: string;
    query?: string;
    duration?: number;
    metadata?: any;
  }) {
    return prisma.performanceMetric.create({
      data: {
        ...data,
        timestamp: new Date(),
      },
    });
  },

  // 获取API性能统计
  async getApiPerformance(hours = 24) {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - hours);

    const metrics = await prisma.performanceMetric.findMany({
      where: {
        metricType: 'api_call',
        timestamp: { gte: startTime },
      },
      orderBy: { timestamp: 'desc' },
    });

    // 按端点分组计算统计
    const byEndpoint = metrics.reduce(
      (acc: any, metric: any) => {
        const endpoint = metric.endpoint || 'unknown';
        if (!acc[endpoint]) {
          acc[endpoint] = {
            endpoint,
            calls: 0,
            totalTime: 0,
            times: [] as number[],
          };
        }
        acc[endpoint].calls++;
        if (metric.duration) {
          acc[endpoint].totalTime += metric.duration;
          acc[endpoint].times.push(metric.duration);
        }
        return acc;
      },
      {} as Record<string, any>
    );

    // 计算统计值
    return Object.values(byEndpoint).map((stat: any) => {
      stat.times.sort((a: number, b: number) => a - b);
      const avgTime =
        stat.times.length > 0 ? stat.totalTime / stat.times.length : 0;
      const p95Index = Math.floor(stat.times.length * 0.95);
      const p99Index = Math.floor(stat.times.length * 0.99);

      return {
        endpoint: stat.endpoint,
        calls: stat.calls,
        avgTime: Math.round(avgTime),
        p95: stat.times[p95Index] || 0,
        p99: stat.times[p99Index] || 0,
      };
    });
  },
};

/**
 * 审计日志查询
 */
export const auditLogQueries = {
  // 创建审计日志
  async createAuditLog(data: {
    action: string;
    level: string;
    userId: string;
    userEmail: string;
    userRole: string;
    description: string;
    metadata?: any;
    ip?: string;
    userAgent?: string;
  }) {
    return prisma.auditLog.create({
      data: {
        ...data,
        timestamp: new Date(),
      },
    });
  },

  // 查询审计日志
  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    level?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const {
      page = 1,
      limit = 50,
      userId,
      action,
      level,
      startDate,
      endDate,
    } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(userId && { userId }),
      ...(action && { action }),
      ...(level && { level }),
      ...(startDate &&
        endDate && {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        }),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total, page, limit };
  },
};

/**
 * 配置管理查询
 */
export const configQueries = {
  // 获取配置
  async getConfig(key: string) {
    const config = await prisma.monitoringConfig.findUnique({
      where: { key },
    });

    if (!config) return null;

    // 如果是加密的，需要解密（这里简化处理）
    return config.encrypted
      ? JSON.parse(decrypt(config.value))
      : JSON.parse(config.value);
  },

  // 设置配置
  async setConfig(
    key: string,
    value: any,
    updatedBy: string,
    encrypted = false
  ) {
    const valueStr = encrypted
      ? encrypt(JSON.stringify(value))
      : JSON.stringify(value);

    return prisma.monitoringConfig.upsert({
      where: { key },
      create: {
        key,
        value: valueStr,
        encrypted,
        updatedBy,
      },
      update: {
        value: valueStr,
        encrypted,
        updatedBy,
        updatedAt: new Date(),
      },
    });
  },
};

// 简单的加密/解密函数（实际项目中应使用更安全的方法）
function encrypt(text: string): string {
  // TODO: 实现真实的加密
  return Buffer.from(text).toString('base64');
}

function decrypt(text: string): string {
  // TODO: 实现真实的解密
  return Buffer.from(text, 'base64').toString('utf-8');
}
