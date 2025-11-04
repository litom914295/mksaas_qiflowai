import {
  getCacheStats,
  getPerformanceStats,
} from '@/lib/performance/optimization';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/performance/stats
 *
 * 性能监控仪表板API
 * 返回所有端点的性能统计和缓存状态
 */
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const format = searchParams.get('format') || 'json';

    // 获取性能统计
    const performanceStats = getPerformanceStats(endpoint || undefined);

    // 获取缓存统计
    const cacheStats = getCacheStats();

    // 系统资源信息
    const memoryUsage = process.memoryUsage();
    const systemStats = {
      uptime: process.uptime(),
      memory: {
        heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
        heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
        external: (memoryUsage.external / 1024 / 1024).toFixed(2) + ' MB',
        rss: (memoryUsage.rss / 1024 / 1024).toFixed(2) + ' MB',
        heapUsagePercent:
          ((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(2) +
          '%',
      },
      platform: process.platform,
      nodeVersion: process.version,
    };

    // 计算总体健康状态
    const healthScore = calculateHealthScore(performanceStats, cacheStats);

    const response = {
      success: true,
      data: {
        performance: performanceStats,
        cache: cacheStats,
        system: systemStats,
        health: {
          score: healthScore,
          status: getHealthStatus(healthScore),
          recommendations: generateRecommendations(
            performanceStats,
            cacheStats,
            systemStats
          ),
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        endpoint: endpoint || 'all',
      },
    };

    // 如果请求HTML格式，返回可视化仪表板
    if (format === 'html') {
      return new NextResponse(generateHTMLDashboard(response.data), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Performance stats error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '获取性能统计失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * 计算健康评分 (0-100)
 */
function calculateHealthScore(performanceStats: any, cacheStats: any): number {
  let score = 100;

  // 性能因素 (40分)
  if (Array.isArray(performanceStats) && performanceStats.length > 0) {
    const avgP95 =
      performanceStats.reduce((sum, stat) => sum + (stat?.p95 || 0), 0) /
      performanceStats.length;

    if (avgP95 > 10000)
      score -= 20; // P95 > 10秒
    else if (avgP95 > 5000)
      score -= 10; // P95 > 5秒
    else if (avgP95 > 3000) score -= 5; // P95 > 3秒

    const avgSuccessRate =
      performanceStats.reduce(
        (sum, stat) => sum + (stat?.successRate || 100),
        0
      ) / performanceStats.length;

    if (avgSuccessRate < 90)
      score -= 20; // 成功率 < 90%
    else if (avgSuccessRate < 95)
      score -= 10; // 成功率 < 95%
    else if (avgSuccessRate < 98) score -= 5; // 成功率 < 98%
  }

  // 缓存效率 (30分)
  if (cacheStats) {
    const hitRate = Number.parseFloat(cacheStats.hitRate);

    if (hitRate < 30)
      score -= 20; // 命中率 < 30%
    else if (hitRate < 50)
      score -= 10; // 命中率 < 50%
    else if (hitRate < 70) score -= 5; // 命中率 < 70%
  }

  // 内存使用 (30分)
  const memoryUsage = process.memoryUsage();
  const heapUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

  if (heapUsagePercent > 90)
    score -= 20; // 内存使用 > 90%
  else if (heapUsagePercent > 80)
    score -= 10; // 内存使用 > 80%
  else if (heapUsagePercent > 70) score -= 5; // 内存使用 > 70%

  return Math.max(0, Math.min(100, score));
}

/**
 * 获取健康状态描述
 */
function getHealthStatus(score: number): string {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  if (score >= 40) return 'poor';
  return 'critical';
}

/**
 * 生成优化建议
 */
function generateRecommendations(
  performanceStats: any,
  cacheStats: any,
  systemStats: any
): string[] {
  const recommendations: string[] = [];

  // 性能建议
  if (Array.isArray(performanceStats)) {
    performanceStats.forEach((stat) => {
      if (stat && stat.p95 > 5000) {
        recommendations.push(
          `${stat.endpoint} 的 P95 响应时间过长 (${stat.p95.toFixed(0)}ms)，建议优化查询或增加缓存`
        );
      }

      if (stat && stat.successRate < 95) {
        recommendations.push(
          `${stat.endpoint} 的成功率偏低 (${stat.successRate.toFixed(1)}%)，建议检查错误日志`
        );
      }
    });
  }

  // 缓存建议
  if (cacheStats) {
    const hitRate = Number.parseFloat(cacheStats.hitRate);

    if (hitRate < 50) {
      recommendations.push(
        `缓存命中率较低 (${cacheStats.hitRate})，建议增加缓存时间或扩大缓存容量`
      );
    }

    if (cacheStats.size > 180) {
      recommendations.push(
        `缓存接近容量上限 (${cacheStats.size}/200)，考虑增加缓存大小`
      );
    }
  }

  // 内存建议
  if (systemStats?.memory) {
    const heapUsagePercent = Number.parseFloat(
      systemStats.memory.heapUsagePercent
    );

    if (heapUsagePercent > 80) {
      recommendations.push(
        `内存使用率过高 (${systemStats.memory.heapUsagePercent})，建议检查内存泄漏或增加服务器内存`
      );
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('系统运行状态良好，继续保持！');
  }

  return recommendations;
}

/**
 * 生成HTML仪表板
 */
function generateHTMLDashboard(data: any): string {
  const healthColor =
    data.health.score >= 90
      ? '#10b981'
      : data.health.score >= 75
        ? '#22c55e'
        : data.health.score >= 60
          ? '#f59e0b'
          : data.health.score >= 40
            ? '#ef4444'
            : '#dc2626';

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>玄空风水API - 性能监控仪表板</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      color: #333;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 20px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 10px;
      color: #667eea;
    }
    .health-score {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-top: 20px;
    }
    .score-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: ${healthColor};
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 32px;
      font-weight: bold;
    }
    .score-info {
      flex: 1;
    }
    .score-info h2 {
      font-size: 20px;
      margin-bottom: 8px;
    }
    .score-info p {
      color: #666;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .card h3 {
      font-size: 18px;
      margin-bottom: 16px;
      color: #667eea;
      border-bottom: 2px solid #667eea;
      padding-bottom: 8px;
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .stat-label {
      color: #666;
      font-weight: 500;
    }
    .stat-value {
      color: #333;
      font-weight: 600;
    }
    .recommendations {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 16px;
      border-radius: 8px;
      margin-top: 20px;
    }
    .recommendations h4 {
      margin-bottom: 12px;
      color: #856404;
    }
    .recommendations ul {
      list-style: none;
      padding-left: 0;
    }
    .recommendations li {
      padding: 6px 0;
      color: #856404;
    }
    .recommendations li:before {
      content: "→ ";
      font-weight: bold;
    }
    .refresh-button {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 50px;
      padding: 16px 24px;
      font-size: 16px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(102,126,234,0.4);
      transition: all 0.3s;
    }
    .refresh-button:hover {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102,126,234,0.5);
    }
    .timestamp {
      text-align: center;
      color: white;
      margin-top: 20px;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔥 玄空风水API - 性能监控</h1>
      <div class="health-score">
        <div class="score-circle">${data.health.score}</div>
        <div class="score-info">
          <h2>系统健康评分</h2>
          <p>状态: ${data.health.status.toUpperCase()} | 运行时间: ${Math.floor((data.system.uptime || 0) / 60)} 分钟</p>
        </div>
      </div>
    </div>

    <div class="grid">
      ${generatePerformanceCards(data.performance)}
      
      <div class="card">
        <h3>📦 缓存统计</h3>
        <div class="stat-row">
          <span class="stat-label">命中次数</span>
          <span class="stat-value">${data.cache.hits || 0}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">未命中次数</span>
          <span class="stat-value">${data.cache.misses || 0}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">命中率</span>
          <span class="stat-value">${data.cache.hitRate || '0%'}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">缓存大小</span>
          <span class="stat-value">${data.cache.size || 0}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">驱逐次数</span>
          <span class="stat-value">${data.cache.evictions || 0}</span>
        </div>
      </div>

      <div class="card">
        <h3>💾 系统资源</h3>
        <div class="stat-row">
          <span class="stat-label">堆内存使用</span>
          <span class="stat-value">${data.system.memory.heapUsed}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">堆内存总量</span>
          <span class="stat-value">${data.system.memory.heapTotal}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">使用率</span>
          <span class="stat-value">${data.system.memory.heapUsagePercent}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">RSS</span>
          <span class="stat-value">${data.system.memory.rss}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Node版本</span>
          <span class="stat-value">${data.system.nodeVersion}</span>
        </div>
      </div>
    </div>

    ${generateRecommendationsSection(data.health.recommendations)}

    <button class="refresh-button" onclick="location.reload()">🔄 刷新数据</button>
    
    <div class="timestamp">
      最后更新: ${new Date().toLocaleString('zh-CN')}
    </div>
  </div>
</body>
</html>
  `;
}

function generatePerformanceCards(performanceStats: any): string {
  if (!Array.isArray(performanceStats) || performanceStats.length === 0) {
    return `
      <div class="card">
        <h3>⚡ 性能统计</h3>
        <p style="color: #666; padding: 20px; text-align: center;">暂无性能数据</p>
      </div>
    `;
  }

  return performanceStats
    .map((stat) => {
      if (!stat) return '';

      const endpointName = stat.endpoint.split('/').pop() || stat.endpoint;

      return `
        <div class="card">
          <h3>⚡ ${endpointName}</h3>
          <div class="stat-row">
            <span class="stat-label">请求总数</span>
            <span class="stat-value">${stat.count}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">成功率</span>
            <span class="stat-value">${stat.successRate.toFixed(1)}%</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">平均响应</span>
            <span class="stat-value">${stat.avgDuration.toFixed(0)}ms</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">P95</span>
            <span class="stat-value">${stat.p95.toFixed(0)}ms</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">最大响应</span>
            <span class="stat-value">${stat.maxDuration.toFixed(0)}ms</span>
          </div>
        </div>
      `;
    })
    .join('');
}

function generateRecommendationsSection(recommendations: string[]): string {
  return `
    <div class="recommendations">
      <h4>💡 优化建议</h4>
      <ul>
        ${recommendations.map((rec) => `<li>${rec}</li>`).join('')}
      </ul>
    </div>
  `;
}
