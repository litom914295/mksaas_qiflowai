/**
 * AI数据一致性监控器
 * 提供详细的调试日志和数据流追踪
 */

export interface DataFlowTrace {
  timestamp: string;
  stage:
    | 'input'
    | 'algorithm'
    | 'ai_input'
    | 'ai_output'
    | 'validation'
    | 'correction'
    | 'final';
  data: any;
  metadata?: Record<string, any>;
}

export interface ConsistencyReport {
  sessionId: string;
  timestamp: string;
  inputMessage: string;
  algorithmResult: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  aiOriginalOutput?: string;
  aiCorrectedOutput?: string;
  discrepancies: Array<{
    pillar: string;
    expected: string;
    actual: string;
  }>;
  isConsistent: boolean;
  correctionApplied: boolean;
  processingTime: number;
}

export class DataConsistencyMonitor {
  private traces: Map<string, DataFlowTrace[]> = new Map();
  private reports: Map<string, ConsistencyReport> = new Map();
  private enabled: boolean = true;

  /**
   * 记录数据流追踪
   */
  recordTrace(sessionId: string, trace: DataFlowTrace): void {
    if (!this.enabled) return;

    if (!this.traces.has(sessionId)) {
      this.traces.set(sessionId, []);
    }

    this.traces.get(sessionId)!.push(trace);

    // 详细日志输出
    this.logTrace(sessionId, trace);
  }

  /**
   * 记录一致性报告
   */
  recordReport(sessionId: string, report: ConsistencyReport): void {
    if (!this.enabled) return;

    this.reports.set(sessionId, report);
    this.logReport(report);
  }

  /**
   * 获取会话的完整数据流
   */
  getSessionTrace(sessionId: string): DataFlowTrace[] {
    return this.traces.get(sessionId) || [];
  }

  /**
   * 获取会话的一致性报告
   */
  getSessionReport(sessionId: string): ConsistencyReport | undefined {
    return this.reports.get(sessionId);
  }

  /**
   * 输出详细的追踪日志
   */
  private logTrace(sessionId: string, trace: DataFlowTrace): void {
    const prefix = `[数据流追踪][${sessionId.substring(0, 8)}][${trace.stage.toUpperCase()}]`;

    console.log(`\n${prefix} ${trace.timestamp}`);
    console.log('━'.repeat(80));

    switch (trace.stage) {
      case 'input':
        console.log('📥 原始输入:');
        console.log(`   消息: "${trace.data.message}"`);
        if (trace.data.birthInfo) {
          console.log(
            `   出生信息: ${JSON.stringify(trace.data.birthInfo, null, 2)}`
          );
        }
        break;

      case 'algorithm':
        console.log('⚙️ 算法计算结果:');
        if (trace.data.pillars) {
          console.log(
            `   年柱: ${trace.data.pillars.year?.stem}${trace.data.pillars.year?.branch}`
          );
          console.log(
            `   月柱: ${trace.data.pillars.month?.stem}${trace.data.pillars.month?.branch}`
          );
          console.log(
            `   日柱: ${trace.data.pillars.day?.stem}${trace.data.pillars.day?.branch}`
          );
          console.log(
            `   时柱: ${trace.data.pillars.hour?.stem}${trace.data.pillars.hour?.branch}`
          );
        }
        if (trace.data.elements) {
          console.log(`   五行: ${JSON.stringify(trace.data.elements)}`);
        }
        break;

      case 'ai_input':
        console.log('🤖 AI输入提示:');
        console.log(`   模型: ${trace.metadata?.model || 'unknown'}`);
        console.log(`   温度: ${trace.metadata?.temperature || 'default'}`);
        console.log(`   最大令牌: ${trace.metadata?.maxTokens || 'default'}`);
        if (trace.data.formattedResult) {
          console.log('   格式化数据:');
          console.log(
            trace.data.formattedResult
              .split('\n')
              .map((l: string) => '   ' + l)
              .join('\n')
          );
        }
        break;

      case 'ai_output':
        console.log('💬 AI原始输出:');
        const preview = trace.data.substring(0, 300);
        console.log(
          preview
            .split('\n')
            .map((l: string) => '   ' + l)
            .join('\n')
        );
        if (trace.data.length > 300) {
          console.log(`   ... (共 ${trace.data.length} 字符)`);
        }
        break;

      case 'validation':
        console.log('✅ 验证结果:');
        console.log(`   一致性: ${trace.data.isValid ? '✓ 通过' : '✗ 失败'}`);
        if (trace.data.discrepancies && trace.data.discrepancies.length > 0) {
          console.log('   不一致项:');
          trace.data.discrepancies.forEach((d: any) => {
            console.log(
              `     ${d.pillar}: 期望[${d.expected}] 实际[${d.actual}]`
            );
          });
        }
        break;

      case 'correction':
        console.log('🔧 数据修正:');
        console.log(`   修正项数: ${trace.data.corrections?.length || 0}`);
        if (trace.data.corrections) {
          trace.data.corrections.forEach((c: any) => {
            console.log(`     ${c.pillar}: ${c.from} -> ${c.to}`);
          });
        }
        break;

      case 'final':
        console.log('📤 最终输出:');
        console.log(`   数据一致性: ${trace.data.isConsistent ? '✓' : '✗'}`);
        console.log(`   处理时间: ${trace.data.processingTime}ms`);
        console.log(`   质量评级: ${trace.data.quality}`);
        break;
    }

    console.log('━'.repeat(80));
  }

  /**
   * 输出一致性报告
   */
  private logReport(report: ConsistencyReport): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 数据一致性报告');
    console.log('='.repeat(80));
    console.log(`会话ID: ${report.sessionId}`);
    console.log(`时间戳: ${report.timestamp}`);
    console.log(`输入消息: "${report.inputMessage}"`);
    console.log('\n算法计算四柱:');
    console.log(`  年柱: ${report.algorithmResult.year}`);
    console.log(`  月柱: ${report.algorithmResult.month}`);
    console.log(`  日柱: ${report.algorithmResult.day}`);
    console.log(`  时柱: ${report.algorithmResult.hour}`);

    if (report.discrepancies.length > 0) {
      console.log('\n❌ 检测到不一致:');
      report.discrepancies.forEach(d => {
        console.log(`  ${d.pillar}: 期望[${d.expected}] vs 实际[${d.actual}]`);
      });
      console.log(`\n修正应用: ${report.correctionApplied ? '是' : '否'}`);
    } else {
      console.log('\n✅ 数据完全一致');
    }

    console.log(`\n处理时间: ${report.processingTime}ms`);
    console.log('='.repeat(80));
  }

  /**
   * 生成会话摘要
   */
  generateSessionSummary(sessionId: string): string {
    const traces = this.getSessionTrace(sessionId);
    const report = this.getSessionReport(sessionId);

    let summary = `\n📋 会话摘要 [${sessionId}]\n`;
    summary += '─'.repeat(50) + '\n';

    if (traces.length > 0) {
      summary += `数据流阶段: ${traces.map(t => t.stage).join(' → ')}\n`;

      const inputTrace = traces.find(t => t.stage === 'input');
      if (inputTrace) {
        summary += `输入: "${inputTrace.data.message?.substring(0, 50)}..."\n`;
      }

      const algorithmTrace = traces.find(t => t.stage === 'algorithm');
      if (algorithmTrace?.data?.pillars) {
        const p = algorithmTrace.data.pillars;
        summary += `算法四柱: ${p.year?.stem}${p.year?.branch} ${p.month?.stem}${p.month?.branch} ${p.day?.stem}${p.day?.branch} ${p.hour?.stem}${p.hour?.branch}\n`;
      }
    }

    if (report) {
      summary += `一致性: ${report.isConsistent ? '✓' : '✗'}\n`;
      summary += `修正: ${report.correctionApplied ? '已应用' : '未需要'}\n`;
      summary += `耗时: ${report.processingTime}ms\n`;
    }

    summary += '─'.repeat(50) + '\n';
    return summary;
  }

  /**
   * 清理旧的追踪数据
   */
  cleanup(olderThanMs: number = 3600000): void {
    const now = Date.now();
    const cutoff = new Date(now - olderThanMs).toISOString();

    // 清理追踪数据
    for (const [sessionId, traces] of this.traces.entries()) {
      if (traces.length > 0 && traces[0].timestamp < cutoff) {
        this.traces.delete(sessionId);
      }
    }

    // 清理报告
    for (const [sessionId, report] of this.reports.entries()) {
      if (report.timestamp < cutoff) {
        this.reports.delete(sessionId);
      }
    }
  }

  /**
   * 获取统计信息
   */
  getStatistics(): {
    totalSessions: number;
    consistentSessions: number;
    correctedSessions: number;
    averageProcessingTime: number;
  } {
    const reports = Array.from(this.reports.values());

    return {
      totalSessions: reports.length,
      consistentSessions: reports.filter(r => r.isConsistent).length,
      correctedSessions: reports.filter(r => r.correctionApplied).length,
      averageProcessingTime:
        reports.length > 0
          ? reports.reduce((sum, r) => sum + r.processingTime, 0) /
            reports.length
          : 0,
    };
  }

  /**
   * 导出报告
   */
  exportReports(): string {
    const stats = this.getStatistics();
    const reports = Array.from(this.reports.values());

    let output = '# QiFlow AI 数据一致性报告\n\n';
    output += `生成时间: ${new Date().toISOString()}\n\n`;
    output += '## 统计摘要\n\n';
    output += `- 总会话数: ${stats.totalSessions}\n`;
    output += `- 一致会话: ${stats.consistentSessions} (${((stats.consistentSessions / stats.totalSessions) * 100).toFixed(1)}%)\n`;
    output += `- 修正会话: ${stats.correctedSessions} (${((stats.correctedSessions / stats.totalSessions) * 100).toFixed(1)}%)\n`;
    output += `- 平均处理时间: ${stats.averageProcessingTime.toFixed(0)}ms\n\n`;

    output += '## 详细报告\n\n';
    reports.forEach((report, index) => {
      output += `### 会话 ${index + 1}\n`;
      output += `- ID: ${report.sessionId}\n`;
      output += `- 时间: ${report.timestamp}\n`;
      output += `- 一致性: ${report.isConsistent ? '✓' : '✗'}\n`;
      if (!report.isConsistent) {
        output += `- 不一致项: ${report.discrepancies.map(d => d.pillar).join(', ')}\n`;
        output += `- 修正: ${report.correctionApplied ? '已应用' : '未应用'}\n`;
      }
      output += '\n';
    });

    return output;
  }
}

// 导出单例
export const dataConsistencyMonitor = new DataConsistencyMonitor();
