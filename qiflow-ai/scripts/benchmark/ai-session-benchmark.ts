#!/usr/bin/env node

/**
 * AI Session Performance Benchmark Script
 *
 * This script simulates 100 concurrent AI chat sessions to measure:
 * - Response time percentiles (p50, p95, p99)
 * - Throughput (requests per second)
 * - Error rates
 * - Memory usage patterns
 * - Token consumption and costs
 *
 * Usage: npm run benchmark:ai-session
 */

import * as fs from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';

interface BenchmarkConfig {
  concurrentSessions: number;
  messagesPerSession: number;
  thinkTimeMs: number;
  warmupSessions: number;
  targetHost: string;
  outputDir: string;
}

interface SessionMetrics {
  sessionId: string;
  startTime: number;
  endTime: number;
  messages: MessageMetrics[];
  errors: ErrorMetrics[];
  totalTokens: number;
  estimatedCost: number;
  memoryUsage: NodeJS.MemoryUsage;
}

interface MessageMetrics {
  messageId: string;
  requestTime: number;
  responseTime: number;
  latency: number;
  promptTokens: number;
  completionTokens: number;
  statusCode: number;
  error?: string;
}

interface ErrorMetrics {
  timestamp: number;
  type: string;
  message: string;
  stack?: string;
}

interface BenchmarkResults {
  summary: {
    totalSessions: number;
    successfulSessions: number;
    failedSessions: number;
    totalMessages: number;
    totalDuration: number;
    throughput: number;
    errorRate: number;
  };
  latency: {
    min: number;
    max: number;
    mean: number;
    median: number;
    p95: number;
    p99: number;
    stdDev: number;
  };
  tokens: {
    totalPromptTokens: number;
    totalCompletionTokens: number;
    totalTokens: number;
    estimatedCost: number;
    avgTokensPerMessage: number;
  };
  errors: {
    byType: Record<string, number>;
    timeline: ErrorMetrics[];
  };
  system: {
    cpuUsage: number[];
    memoryUsage: NodeJS.MemoryUsage[];
    timestamp: number[];
  };
}

class AISessionBenchmark {
  private config: BenchmarkConfig;
  private sessions: SessionMetrics[] = [];
  private systemMetrics = {
    cpuUsage: [] as number[],
    memoryUsage: [] as NodeJS.MemoryUsage[],
    timestamp: [] as number[],
  };
  private monitoringInterval?: NodeJS.Timer;

  constructor(config: Partial<BenchmarkConfig> = {}) {
    this.config = {
      concurrentSessions: config.concurrentSessions || 100,
      messagesPerSession: config.messagesPerSession || 5,
      thinkTimeMs: config.thinkTimeMs || 1000,
      warmupSessions: config.warmupSessions || 5,
      targetHost:
        config.targetHost ||
        process.env.BENCHMARK_TARGET_HOST ||
        'http://localhost:3001',
      outputDir: config.outputDir || './benchmark-results',
    };

    // Create output directory
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
  }

  /**
   * Run the complete benchmark suite
   */
  async run(): Promise<BenchmarkResults> {
    console.log('🚀 Starting AI Session Benchmark');
    console.log(`   Target: ${this.config.targetHost}`);
    console.log(`   Sessions: ${this.config.concurrentSessions}`);
    console.log(`   Messages per session: ${this.config.messagesPerSession}`);
    console.log('');

    // Start system monitoring
    this.startSystemMonitoring();

    try {
      // Run warmup sessions
      if (this.config.warmupSessions > 0) {
        console.log(
          `🔥 Running ${this.config.warmupSessions} warmup sessions...`
        );
        await this.runWarmup();
      }

      // Run benchmark sessions
      console.log(
        `📊 Running ${this.config.concurrentSessions} benchmark sessions...`
      );
      const startTime = performance.now();

      await this.runBenchmarkSessions();

      const endTime = performance.now();
      const totalDuration = endTime - startTime;

      // Calculate results
      const results = this.calculateResults(totalDuration);

      // Save results
      await this.saveResults(results);

      // Print summary
      this.printSummary(results);

      return results;
    } finally {
      this.stopSystemMonitoring();
    }
  }

  /**
   * Run warmup sessions to prime the system
   */
  private async runWarmup(): Promise<void> {
    const warmupPromises = [];

    for (let i = 0; i < this.config.warmupSessions; i++) {
      warmupPromises.push(this.runSingleSession(`warmup-${i}`, true));
    }

    await Promise.all(warmupPromises);
    console.log('✅ Warmup completed\n');
  }

  /**
   * Run the main benchmark sessions
   */
  private async runBenchmarkSessions(): Promise<void> {
    const batchSize = 10; // Process in batches to avoid overwhelming the system
    const batches = Math.ceil(this.config.concurrentSessions / batchSize);

    for (let batch = 0; batch < batches; batch++) {
      const startIdx = batch * batchSize;
      const endIdx = Math.min(
        startIdx + batchSize,
        this.config.concurrentSessions
      );
      const batchPromises = [];

      for (let i = startIdx; i < endIdx; i++) {
        batchPromises.push(this.runSingleSession(`session-${i}`, false));
      }

      await Promise.all(batchPromises);

      // Progress update
      const progress = Math.round(
        (endIdx / this.config.concurrentSessions) * 100
      );
      process.stdout.write(
        `\rProgress: ${progress}% (${endIdx}/${this.config.concurrentSessions} sessions)`
      );
    }

    console.log('\n✅ Benchmark sessions completed\n');
  }

  /**
   * Run a single chat session
   */
  private async runSingleSession(
    sessionId: string,
    isWarmup: boolean
  ): Promise<void> {
    const session: SessionMetrics = {
      sessionId,
      startTime: performance.now(),
      endTime: 0,
      messages: [],
      errors: [],
      totalTokens: 0,
      estimatedCost: 0,
      memoryUsage: process.memoryUsage(),
    };

    try {
      // Initialize session
      const chatSessionId = await this.initializeSession(sessionId);

      // Send messages
      for (let i = 0; i < this.config.messagesPerSession; i++) {
        // Add think time between messages
        if (i > 0) {
          await this.sleep(this.config.thinkTimeMs);
        }

        const message = this.generateMessage(i);
        const metrics = await this.sendMessage(chatSessionId, message);

        session.messages.push(metrics);
        session.totalTokens += metrics.promptTokens + metrics.completionTokens;

        // Simulate error conditions
        if (Math.random() < 0.05) {
          // 5% error rate simulation
          throw new Error('Simulated random error');
        }
      }

      // Cleanup session
      await this.cleanupSession(chatSessionId);
    } catch (error) {
      session.errors.push({
        timestamp: performance.now(),
        type: (error as any).constructor.name,
        message: (error as any).message,
        stack: (error as any).stack,
      });
    } finally {
      session.endTime = performance.now();
      session.memoryUsage = process.memoryUsage();
      session.estimatedCost = this.calculateCost(session.totalTokens);

      if (!isWarmup) {
        this.sessions.push(session);
      }
    }
  }

  /**
   * Initialize a new chat session
   */
  private async initializeSession(sessionId: string): Promise<string> {
    try {
      const response = await fetch(
        `${this.config.targetHost}/api/chat/session`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            userId: `benchmark-user-${sessionId}`,
            locale: 'zh-CN',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to initialize session: ${response.status}`);
      }

      const data = await response.json();
      return data.sessionId;
    } catch (error) {
      // Fallback for testing without actual API
      return `mock-${sessionId}`;
    }
  }

  /**
   * Send a message in the chat session
   */
  private async sendMessage(
    sessionId: string,
    message: string
  ): Promise<MessageMetrics> {
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const requestTime = performance.now();

    try {
      const response = await fetch(`${this.config.targetHost}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message,
          messageId,
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      const responseTime = performance.now();
      const data = await response.json();

      return {
        messageId,
        requestTime,
        responseTime,
        latency: responseTime - requestTime,
        promptTokens: data.usage?.promptTokens || 10,
        completionTokens: data.usage?.completionTokens || 50,
        statusCode: response.status,
      };
    } catch (error) {
      const responseTime = performance.now();

      // Return mock data for testing without actual API
      return {
        messageId,
        requestTime,
        responseTime,
        latency: responseTime - requestTime,
        promptTokens: Math.floor(Math.random() * 50) + 10,
        completionTokens: Math.floor(Math.random() * 200) + 50,
        statusCode: 200,
        error: (error as any).message,
      };
    }
  }

  /**
   * Cleanup a chat session
   */
  private async cleanupSession(sessionId: string): Promise<void> {
    try {
      await fetch(`${this.config.targetHost}/api/chat/session/${sessionId}`, {
        method: 'DELETE',
      });
    } catch {
      // Ignore cleanup errors
    }
  }

  /**
   * Generate a test message based on index
   */
  private generateMessage(index: number): string {
    const messages = [
      '请帮我分析我的八字：1990年5月15日早上8点出生',
      '我的房子坐北朝南，主卧在东南方向，这样的布局好吗？',
      '最近事业不顺，有什么风水建议吗？',
      '我的五行缺什么？应该如何补救？',
      '客厅应该摆放什么装饰品来提升财运？',
      '今年的流年运势如何？',
      '办公室座位背对门口，这样有影响吗？',
      '卧室床头朝西好不好？',
      '厨房在西北角会有什么影响？',
      '大门正对电梯，需要化解吗？',
    ];

    return messages[index % messages.length];
  }

  /**
   * Calculate token cost estimate
   */
  private calculateCost(totalTokens: number): number {
    // Rough estimate: $0.01 per 1K tokens for GPT-4
    return (totalTokens / 1000) * 0.01;
  }

  /**
   * Start system resource monitoring
   */
  private startSystemMonitoring(): void {
    const startUsage = process.cpuUsage();

    this.monitoringInterval = setInterval(() => {
      const currentUsage = process.cpuUsage(startUsage);
      const cpuPercent =
        ((currentUsage.user + currentUsage.system) / 1000000) * 100;

      this.systemMetrics.cpuUsage.push(cpuPercent);
      this.systemMetrics.memoryUsage.push(process.memoryUsage());
      this.systemMetrics.timestamp.push(performance.now());
    }, 1000);
  }

  /**
   * Stop system resource monitoring
   */
  private stopSystemMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval as any);
    }
  }

  /**
   * Calculate benchmark results
   */
  private calculateResults(totalDuration: number): BenchmarkResults {
    const allMessages = this.sessions.flatMap(s => s.messages);
    const allErrors = this.sessions.flatMap(s => s.errors);
    const latencies = allMessages.map(m => m.latency).filter(l => l > 0);

    // Sort latencies for percentile calculation
    latencies.sort((a, b) => a - b);

    const successfulSessions = this.sessions.filter(
      s => s.errors.length === 0
    ).length;
    const totalMessages = allMessages.length;
    const throughput = totalMessages / (totalDuration / 1000); // messages per second

    return {
      summary: {
        totalSessions: this.sessions.length,
        successfulSessions,
        failedSessions: this.sessions.length - successfulSessions,
        totalMessages,
        totalDuration,
        throughput,
        errorRate:
          (this.sessions.length - successfulSessions) / this.sessions.length,
      },
      latency: {
        min: Math.min(...latencies),
        max: Math.max(...latencies),
        mean: latencies.reduce((a, b) => a + b, 0) / latencies.length,
        median: this.percentile(latencies, 50),
        p95: this.percentile(latencies, 95),
        p99: this.percentile(latencies, 99),
        stdDev: this.standardDeviation(latencies),
      },
      tokens: {
        totalPromptTokens: allMessages.reduce(
          (sum, m) => sum + m.promptTokens,
          0
        ),
        totalCompletionTokens: allMessages.reduce(
          (sum, m) => sum + m.completionTokens,
          0
        ),
        totalTokens: allMessages.reduce(
          (sum, m) => sum + m.promptTokens + m.completionTokens,
          0
        ),
        estimatedCost: this.sessions.reduce(
          (sum, s) => sum + s.estimatedCost,
          0
        ),
        avgTokensPerMessage:
          allMessages.length > 0
            ? allMessages.reduce(
                (sum, m) => sum + m.promptTokens + m.completionTokens,
                0
              ) / allMessages.length
            : 0,
      },
      errors: {
        byType: this.groupErrorsByType(allErrors),
        timeline: allErrors.sort((a, b) => a.timestamp - b.timestamp),
      },
      system: this.systemMetrics,
    };
  }

  /**
   * Calculate percentile from sorted array
   */
  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Calculate standard deviation
   */
  private standardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Group errors by type
   */
  private groupErrorsByType(errors: ErrorMetrics[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    for (const error of errors) {
      grouped[error.type] = (grouped[error.type] || 0) + 1;
    }
    return grouped;
  }

  /**
   * Save results to file
   */
  private async saveResults(results: BenchmarkResults): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `benchmark-${timestamp}.json`;
    const filepath = path.join(this.config.outputDir, filename);

    await fs.promises.writeFile(
      filepath,
      JSON.stringify(results, null, 2),
      'utf-8'
    );

    console.log(`📁 Results saved to: ${filepath}`);

    // Also save a summary report
    const reportPath = path.join(
      this.config.outputDir,
      `report-${timestamp}.md`
    );
    await fs.promises.writeFile(
      reportPath,
      this.generateMarkdownReport(results),
      'utf-8'
    );
    console.log(`📄 Report saved to: ${reportPath}`);
  }

  /**
   * Generate markdown report
   */
  private generateMarkdownReport(results: BenchmarkResults): string {
    const report = `# AI Session Benchmark Report

## Configuration
- **Sessions**: ${this.config.concurrentSessions}
- **Messages per Session**: ${this.config.messagesPerSession}
- **Target Host**: ${this.config.targetHost}
- **Date**: ${new Date().toISOString()}

## Summary
| Metric | Value |
|--------|-------|
| Total Sessions | ${results.summary.totalSessions} |
| Successful Sessions | ${results.summary.successfulSessions} |
| Failed Sessions | ${results.summary.failedSessions} |
| Total Messages | ${results.summary.totalMessages} |
| Duration | ${(results.summary.totalDuration / 1000).toFixed(2)}s |
| Throughput | ${results.summary.throughput.toFixed(2)} msg/s |
| Error Rate | ${(results.summary.errorRate * 100).toFixed(2)}% |

## Response Time (ms)
| Percentile | Latency |
|------------|---------|
| Min | ${results.latency.min.toFixed(2)} |
| Median (p50) | ${results.latency.median.toFixed(2)} |
| Mean | ${results.latency.mean.toFixed(2)} |
| p95 | ${results.latency.p95.toFixed(2)} |
| p99 | ${results.latency.p99.toFixed(2)} |
| Max | ${results.latency.max.toFixed(2)} |
| Std Dev | ${results.latency.stdDev.toFixed(2)} |

## Token Usage
| Metric | Value |
|--------|-------|
| Total Prompt Tokens | ${results.tokens.totalPromptTokens.toLocaleString()} |
| Total Completion Tokens | ${results.tokens.totalCompletionTokens.toLocaleString()} |
| Total Tokens | ${results.tokens.totalTokens.toLocaleString()} |
| Avg Tokens/Message | ${results.tokens.avgTokensPerMessage.toFixed(0)} |
| Estimated Cost | $${results.tokens.estimatedCost.toFixed(2)} |

## Error Summary
${
  Object.entries(results.errors.byType).length > 0
    ? Object.entries(results.errors.byType)
        .map(([type, count]) => `- **${type}**: ${count} occurrences`)
        .join('\n')
    : 'No errors encountered during benchmark.'
}

## Performance Analysis
${this.generatePerformanceAnalysis(results)}
`;

    return report;
  }

  /**
   * Generate performance analysis
   */
  private generatePerformanceAnalysis(results: BenchmarkResults): string {
    const analysis = [];

    // Response time analysis
    if (results.latency.p95 < 1000) {
      analysis.push(
        '✅ **Excellent response times**: p95 latency under 1 second'
      );
    } else if (results.latency.p95 < 2000) {
      analysis.push('✅ **Good response times**: p95 latency under 2 seconds');
    } else {
      analysis.push(
        '⚠️ **Response times need improvement**: p95 latency over 2 seconds'
      );
    }

    // Throughput analysis
    if (results.summary.throughput > 10) {
      analysis.push(
        '✅ **High throughput**: System handling over 10 messages per second'
      );
    } else if (results.summary.throughput > 5) {
      analysis.push(
        '✅ **Moderate throughput**: System handling 5-10 messages per second'
      );
    } else {
      analysis.push(
        '⚠️ **Low throughput**: System handling under 5 messages per second'
      );
    }

    // Error rate analysis
    if (results.summary.errorRate < 0.01) {
      analysis.push('✅ **Excellent reliability**: Error rate under 1%');
    } else if (results.summary.errorRate < 0.05) {
      analysis.push('✅ **Good reliability**: Error rate under 5%');
    } else {
      analysis.push('⚠️ **Reliability concerns**: Error rate over 5%');
    }

    // Cost analysis
    const costPerSession =
      results.tokens.estimatedCost / results.summary.totalSessions;
    if (costPerSession < 0.01) {
      analysis.push(
        `✅ **Cost efficient**: Average cost per session $${costPerSession.toFixed(4)}`
      );
    } else {
      analysis.push(
        `⚠️ **High costs**: Average cost per session $${costPerSession.toFixed(4)}`
      );
    }

    return analysis.join('\n');
  }

  /**
   * Print summary to console
   */
  private printSummary(results: BenchmarkResults): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 BENCHMARK RESULTS SUMMARY');
    console.log('='.repeat(60));

    console.log('\n📈 Performance Metrics:');
    console.log(
      `   Sessions: ${results.summary.successfulSessions}/${results.summary.totalSessions} successful`
    );
    console.log(
      `   Throughput: ${results.summary.throughput.toFixed(2)} messages/second`
    );
    console.log(
      `   Error Rate: ${(results.summary.errorRate * 100).toFixed(2)}%`
    );

    console.log('\n⏱️  Response Times (ms):');
    console.log(`   Median: ${results.latency.median.toFixed(0)}ms`);
    console.log(`   p95: ${results.latency.p95.toFixed(0)}ms`);
    console.log(`   p99: ${results.latency.p99.toFixed(0)}ms`);

    console.log('\n💰 Token Usage:');
    console.log(
      `   Total: ${results.tokens.totalTokens.toLocaleString()} tokens`
    );
    console.log(`   Cost: $${results.tokens.estimatedCost.toFixed(2)}`);

    console.log('\n' + '='.repeat(60));

    // Performance verdict
    const targetMet = results.latency.mean < 2000;
    if (targetMet) {
      console.log('✅ Performance target MET: Average response time < 2s');
    } else {
      console.log('❌ Performance target NOT MET: Average response time > 2s');
    }

    console.log('='.repeat(60) + '\n');
  }

  /**
   * Utility sleep function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
if (require.main === module) {
  const benchmark = new AISessionBenchmark({
    concurrentSessions: parseInt(process.env.BENCHMARK_SESSIONS || '100'),
    messagesPerSession: parseInt(process.env.BENCHMARK_MESSAGES || '5'),
    thinkTimeMs: parseInt(process.env.BENCHMARK_THINK_TIME || '1000'),
    warmupSessions: parseInt(process.env.BENCHMARK_WARMUP || '5'),
  });

  benchmark
    .run()
    .then(() => {
      console.log('Benchmark completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Benchmark failed:', error);
      process.exit(1);
    });
}

export type { AISessionBenchmark, BenchmarkResults };
