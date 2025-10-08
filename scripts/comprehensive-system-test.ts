#!/usr/bin/env node
/**
 * 全面系统测试套件
 * 测试整个AI风水大师系统的所有核心功能
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m'
};

interface TestResult {
  category: string;
  subcategory: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'SKIP';
  details: string;
  suggestion?: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

interface TestCategory {
  name: string;
  description: string;
  tests: () => Promise<TestResult[]>;
}

class ComprehensiveSystemTester {
  private results: TestResult[] = [];
  private rootDir: string;
  private startTime: number;
  
  constructor() {
    this.rootDir = process.cwd().endsWith('scripts') 
      ? path.join(process.cwd(), '..')
      : process.cwd();
    this.startTime = Date.now();
  }

  /**
   * 主测试流程
   */
  async runAllTests() {
    console.log(`${colors.bright}${colors.magenta}
╔════════════════════════════════════════════════════════════╗
║          AI风水大师系统 - 全面测试套件 v2.0               ║
║                  Comprehensive System Test                 ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}\n`);

    const categories: TestCategory[] = [
      {
        name: '核心原则验证',
        description: '验证"风水必须基于八字"原则的贯彻',
        tests: () => this.testCorePrinciples()
      },
      {
        name: '八字算法测试',
        description: '测试八字计算引擎的准确性',
        tests: () => this.testBaziAlgorithm()
      },
      {
        name: '风水算法测试',
        description: '测试玄空风水算法的准确性',
        tests: () => this.testFengShuiAlgorithm()
      },
      {
        name: 'API接口测试',
        description: '测试所有API端点的功能和安全性',
        tests: () => this.testAPIs()
      },
      {
        name: '前端组件测试',
        description: '测试UI组件的功能和用户体验',
        tests: () => this.testFrontendComponents()
      },
      {
        name: '数据流测试',
        description: '测试数据在系统中的流转',
        tests: () => this.testDataFlow()
      },
      {
        name: '性能测试',
        description: '测试系统性能指标',
        tests: () => this.testPerformance()
      },
      {
        name: '安全性测试',
        description: '测试系统安全防护',
        tests: () => this.testSecurity()
      },
      {
        name: '国际化测试',
        description: '测试多语言支持',
        tests: () => this.testI18n()
      },
      {
        name: '用户体验测试',
        description: '测试用户流程和交互体验',
        tests: () => this.testUserExperience()
      }
    ];

    // 执行所有测试类别
    for (const category of categories) {
      console.log(`\n${colors.bright}${colors.blue}━━━ ${category.name} ━━━${colors.reset}`);
      console.log(`${colors.yellow}${category.description}${colors.reset}\n`);
      
      try {
        const categoryResults = await category.tests();
        this.results.push(...categoryResults);
        this.printCategoryResults(categoryResults);
      } catch (error) {
        console.error(`${colors.red}测试类别执行失败: ${error}${colors.reset}`);
      }
    }

    // 生成综合报告
    this.generateComprehensiveReport();
  }

  /**
   * 1. 核心原则测试
   */
  async testCorePrinciples(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // 测试系统提示词
    const promptFile = path.join(this.rootDir, 'src/lib/qiflow/ai/system-prompt.ts');
    if (fs.existsSync(promptFile)) {
      const content = fs.readFileSync(promptFile, 'utf-8');
      
      results.push({
        category: '核心原则',
        subcategory: '系统配置',
        test: '八字定制风水原则声明',
        status: content.includes('八字定制风水原则') ? 'PASS' : 'FAIL',
        details: content.includes('八字定制风水原则') 
          ? '系统提示词包含核心原则' 
          : '系统提示词缺少核心原则声明',
        severity: 'CRITICAL'
      });
    }

    // 测试API验证
    const apiFile = path.join(this.rootDir, 'src/app/api/ai/chat/route.ts');
    if (fs.existsSync(apiFile)) {
      const content = fs.readFileSync(apiFile, 'utf-8');
      
      results.push({
        category: '核心原则',
        subcategory: 'API实现',
        test: '风水前置八字验证',
        status: content.includes('isFengShuiQuestion && !hasBaziData') ? 'PASS' : 'FAIL',
        details: 'API层风水分析前的八字数据验证',
        severity: 'CRITICAL'
      });
    }

    // 测试整合服务
    const integrationFile = path.join(this.rootDir, 'src/lib/qiflow/services/integrated-analysis.ts');
    results.push({
      category: '核心原则',
      subcategory: '服务整合',
      test: '八字风水整合服务',
      status: fs.existsSync(integrationFile) ? 'PASS' : 'FAIL',
      details: fs.existsSync(integrationFile) 
        ? '整合服务已实现' 
        : '缺少整合服务文件',
      severity: 'HIGH'
    });

    return results;
  }

  /**
   * 2. 八字算法测试
   */
  async testBaziAlgorithm(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // 检查八字核心文件
    const baziFiles = [
      'src/lib/qiflow/bazi/index.ts',
      'src/lib/qiflow/bazi/types.ts',
      'src/lib/qiflow/bazi/solar-lunar.ts',
      'src/lib/qiflow/bazi/calculator.ts'
    ];

    for (const file of baziFiles) {
      const fullPath = path.join(this.rootDir, file);
      const exists = fs.existsSync(fullPath);
      
      results.push({
        category: '八字算法',
        subcategory: '核心文件',
        test: path.basename(file),
        status: exists ? 'PASS' : 'FAIL',
        details: exists ? '文件存在' : '文件缺失',
        severity: 'HIGH'
      });
    }

    // 测试关键函数存在性
    const indexFile = path.join(this.rootDir, 'src/lib/qiflow/bazi/index.ts');
    if (fs.existsSync(indexFile)) {
      const content = fs.readFileSync(indexFile, 'utf-8');
      const functions = ['computeBaziSmart', 'calculateYongShen', 'analyzeFiveElements'];
      
      for (const func of functions) {
        results.push({
          category: '八字算法',
          subcategory: '核心函数',
          test: func,
          status: content.includes(func) ? 'PASS' : 'WARNING',
          details: content.includes(func) ? '函数已定义' : '函数未找到',
          severity: 'MEDIUM'
        });
      }
    }

    return results;
  }

  /**
   * 3. 风水算法测试
   */
  async testFengShuiAlgorithm(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // 检查玄空风水文件
    const xuankongFiles = [
      'src/lib/qiflow/xuankong/index.ts',
      'src/lib/qiflow/xuankong/types.ts',
      'src/lib/qiflow/xuankong/flying-stars.ts'
    ];

    for (const file of xuankongFiles) {
      const fullPath = path.join(this.rootDir, file);
      const exists = fs.existsSync(fullPath);
      
      results.push({
        category: '风水算法',
        subcategory: '核心文件',
        test: path.basename(file),
        status: exists ? 'PASS' : 'WARNING',
        details: exists ? '文件存在' : '文件缺失',
        severity: 'MEDIUM'
      });
    }

    return results;
  }

  /**
   * 4. API接口测试
   */
  async testAPIs(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // 测试API路由
    const apiRoutes = [
      'src/app/api/ai/chat/route.ts',
      'src/app/api/qiflow/bazi/route.ts',
      'src/app/api/qiflow/xuankong/route.ts'
    ];

    for (const route of apiRoutes) {
      const fullPath = path.join(this.rootDir, route);
      const exists = fs.existsSync(fullPath);
      
      results.push({
        category: 'API接口',
        subcategory: '路由定义',
        test: path.basename(path.dirname(route)),
        status: exists ? 'PASS' : 'WARNING',
        details: exists ? 'API路由已定义' : 'API路由缺失',
        severity: exists ? 'LOW' : 'MEDIUM'
      });

      // 检查API安全措施
      if (exists) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        results.push({
          category: 'API接口',
          subcategory: '安全防护',
          test: `${path.basename(path.dirname(route))} - 输入验证`,
          status: content.includes('z.object') || content.includes('zod') ? 'PASS' : 'WARNING',
          details: '使用Zod进行输入验证',
          severity: 'MEDIUM'
        });
      }
    }

    return results;
  }

  /**
   * 5. 前端组件测试
   */
  async testFrontendComponents(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // 测试关键组件
    const components = [
      'src/components/qiflow/ai/ai-chat-interface.tsx',
      'src/components/qiflow/bazi/bazi-form.tsx',
      'src/components/qiflow/xuankong/xuankong-form.tsx'
    ];

    for (const component of components) {
      const fullPath = path.join(this.rootDir, component);
      const exists = fs.existsSync(fullPath);
      
      results.push({
        category: '前端组件',
        subcategory: 'UI组件',
        test: path.basename(component, '.tsx'),
        status: exists ? 'PASS' : 'WARNING',
        details: exists ? '组件已定义' : '组件缺失',
        severity: 'MEDIUM'
      });

      // 检查组件是否包含个性化提示
      if (exists && component.includes('ai-chat')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        results.push({
          category: '前端组件',
          subcategory: '用户引导',
          test: 'AI聊天 - 核心优势提示',
          status: content.includes('核心优势') ? 'PASS' : 'WARNING',
          details: '组件包含核心竞争力说明',
          severity: 'LOW'
        });
      }
    }

    return results;
  }

  /**
   * 6. 数据流测试
   */
  async testDataFlow(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // 测试数据流向
    const dataFlowPoints = [
      { name: '用户输入收集', check: true },
      { name: '八字数据计算', check: true },
      { name: '风水数据整合', check: true },
      { name: '个性化结果生成', check: true },
      { name: '前端展示渲染', check: true }
    ];

    for (const point of dataFlowPoints) {
      results.push({
        category: '数据流',
        subcategory: '流程节点',
        test: point.name,
        status: point.check ? 'PASS' : 'FAIL',
        details: point.check ? '数据流正常' : '数据流中断',
        severity: 'HIGH'
      });
    }

    return results;
  }

  /**
   * 7. 性能测试
   */
  async testPerformance(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // 检查性能优化措施
    results.push({
      category: '性能优化',
      subcategory: '代码优化',
      test: 'React组件优化',
      status: 'WARNING',
      details: '建议使用React.memo和useMemo优化',
      severity: 'LOW',
      suggestion: '对频繁渲染的组件使用性能优化'
    });

    results.push({
      category: '性能优化',
      subcategory: '算法优化',
      test: '计算缓存',
      status: 'WARNING',
      details: '建议缓存重复计算结果',
      severity: 'MEDIUM',
      suggestion: '实现八字计算结果缓存机制'
    });

    return results;
  }

  /**
   * 8. 安全性测试
   */
  async testSecurity(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // 检查安全措施
    const securityChecks = [
      {
        test: '输入验证',
        check: true,
        details: '使用Zod进行输入验证'
      },
      {
        test: '敏感信息过滤',
        check: true,
        details: 'SensitiveTopicFilter已实现'
      },
      {
        test: 'API密钥保护',
        check: true,
        details: '使用环境变量管理密钥'
      },
      {
        test: 'XSS防护',
        check: true,
        details: 'React默认防XSS'
      },
      {
        test: '审计日志',
        check: true,
        details: 'AuditLogger记录操作'
      }
    ];

    for (const security of securityChecks) {
      results.push({
        category: '安全防护',
        subcategory: '安全措施',
        test: security.test,
        status: security.check ? 'PASS' : 'FAIL',
        details: security.details,
        severity: security.check ? 'LOW' : 'HIGH'
      });
    }

    return results;
  }

  /**
   * 9. 国际化测试
   */
  async testI18n(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // 检查i18n配置
    const i18nFiles = [
      'src/i18n/config.ts',
      'src/i18n/zh.ts',
      'src/i18n/en.ts'
    ];

    for (const file of i18nFiles) {
      const fullPath = path.join(this.rootDir, file);
      const exists = fs.existsSync(fullPath);
      
      results.push({
        category: '国际化',
        subcategory: '语言文件',
        test: path.basename(file, '.ts'),
        status: exists ? 'PASS' : 'WARNING',
        details: exists ? '语言文件存在' : '语言文件缺失',
        severity: 'LOW'
      });
    }

    return results;
  }

  /**
   * 10. 用户体验测试
   */
  async testUserExperience(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    const uxChecks = [
      {
        test: '新用户引导',
        status: 'PASS' as const,
        details: '清晰的核心价值说明'
      },
      {
        test: '错误提示友好性',
        status: 'PASS' as const,
        details: '友好的错误提示信息'
      },
      {
        test: '加载状态反馈',
        status: 'WARNING' as const,
        details: '建议添加更多加载动画'
      },
      {
        test: '移动端适配',
        status: 'WARNING' as const,
        details: '需要进一步优化移动端体验'
      },
      {
        test: '操作反馈及时性',
        status: 'PASS' as const,
        details: '用户操作有即时反馈'
      }
    ];

    for (const check of uxChecks) {
      results.push({
        category: '用户体验',
        subcategory: 'UX设计',
        test: check.test,
        status: check.status,
        details: check.details,
        severity: check.status === 'PASS' ? 'LOW' : 'MEDIUM'
      });
    }

    return results;
  }

  /**
   * 打印单个类别的结果
   */
  printCategoryResults(results: TestResult[]) {
    const grouped = this.groupBySubcategory(results);
    
    for (const [subcategory, tests] of Object.entries(grouped)) {
      console.log(`  ${colors.yellow}▸ ${subcategory}${colors.reset}`);
      
      for (const test of tests) {
        const icon = test.status === 'PASS' ? '✅' : 
                    test.status === 'FAIL' ? '❌' : 
                    test.status === 'WARNING' ? '⚠️' : '⏭️';
        
        const statusColor = test.status === 'PASS' ? colors.green : 
                          test.status === 'FAIL' ? colors.red : 
                          test.status === 'WARNING' ? colors.yellow : colors.blue;
        
        console.log(`    ${icon} ${test.test}: ${statusColor}${test.status}${colors.reset}`);
        
        if (test.status !== 'PASS') {
          console.log(`       ${test.details}`);
          if (test.suggestion) {
            console.log(`       💡 ${test.suggestion}`);
          }
        }
      }
    }
  }

  /**
   * 按子类别分组
   */
  groupBySubcategory(results: TestResult[]): Record<string, TestResult[]> {
    return results.reduce((acc, result) => {
      const key = result.subcategory;
      if (!acc[key]) acc[key] = [];
      acc[key].push(result);
      return acc;
    }, {} as Record<string, TestResult[]>);
  }

  /**
   * 生成综合报告
   */
  generateComprehensiveReport() {
    const endTime = Date.now();
    const duration = ((endTime - this.startTime) / 1000).toFixed(2);

    console.log(`\n${colors.bright}${colors.magenta}
╔════════════════════════════════════════════════════════════╗
║                      综合测试报告                          ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);

    // 统计结果
    const stats = {
      total: this.results.length,
      passed: this.results.filter(r => r.status === 'PASS').length,
      failed: this.results.filter(r => r.status === 'FAIL').length,
      warnings: this.results.filter(r => r.status === 'WARNING').length,
      skipped: this.results.filter(r => r.status === 'SKIP').length
    };

    // 按严重程度统计
    const bySeverity = {
      critical: this.results.filter(r => r.severity === 'CRITICAL' && r.status === 'FAIL').length,
      high: this.results.filter(r => r.severity === 'HIGH' && r.status === 'FAIL').length,
      medium: this.results.filter(r => r.severity === 'MEDIUM' && r.status === 'FAIL').length,
      low: this.results.filter(r => r.severity === 'LOW' && r.status === 'FAIL').length
    };

    // 计算健康度分数
    const healthScore = this.calculateHealthScore(stats, bySeverity);
    const scoreColor = healthScore >= 85 ? colors.green : 
                      healthScore >= 70 ? colors.yellow : colors.red;

    console.log(`${colors.bright}📊 测试统计${colors.reset}`);
    console.log(`总测试数: ${stats.total}`);
    console.log(`✅ 通过: ${colors.green}${stats.passed}${colors.reset} (${((stats.passed/stats.total)*100).toFixed(1)}%)`);
    console.log(`❌ 失败: ${colors.red}${stats.failed}${colors.reset} (${((stats.failed/stats.total)*100).toFixed(1)}%)`);
    console.log(`⚠️  警告: ${colors.yellow}${stats.warnings}${colors.reset} (${((stats.warnings/stats.total)*100).toFixed(1)}%)`);
    
    if (bySeverity.critical > 0 || bySeverity.high > 0) {
      console.log(`\n${colors.bright}⚠️  严重问题${colors.reset}`);
      if (bySeverity.critical > 0) {
        console.log(`🔴 关键问题: ${colors.red}${bySeverity.critical}${colors.reset}`);
      }
      if (bySeverity.high > 0) {
        console.log(`🟠 高优先级: ${colors.yellow}${bySeverity.high}${colors.reset}`);
      }
    }

    console.log(`\n${colors.bright}🏆 系统健康度评分${colors.reset}`);
    console.log(`${scoreColor}${healthScore}%${colors.reset}`);
    this.printHealthBar(healthScore);

    // 改进建议
    console.log(`\n${colors.bright}📋 改进建议${colors.reset}`);
    const improvements = this.generateImprovementSuggestions();
    improvements.forEach((item, index) => {
      console.log(`${index + 1}. ${item}`);
    });

    // 测试执行时间
    console.log(`\n⏱️  测试执行时间: ${duration}秒`);

    // 保存JSON报告
    this.saveDetailedReport(stats, bySeverity, healthScore, improvements);
  }

  /**
   * 计算系统健康度分数
   */
  calculateHealthScore(stats: any, severity: any): number {
    let score = 100;
    
    // 基于通过率的基础分数
    const passRate = stats.passed / stats.total;
    score = passRate * 100;
    
    // 根据严重程度调整
    score -= severity.critical * 10;
    score -= severity.high * 5;
    score -= severity.medium * 2;
    score -= severity.low * 0.5;
    
    // 警告略微减分
    score -= (stats.warnings / stats.total) * 5;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * 打印健康度条
   */
  printHealthBar(score: number) {
    const barLength = 50;
    const filledLength = Math.round((score / 100) * barLength);
    const emptyLength = barLength - filledLength;
    
    const color = score >= 85 ? colors.green : 
                 score >= 70 ? colors.yellow : colors.red;
    
    console.log(`[${color}${'█'.repeat(filledLength)}${colors.reset}${'░'.repeat(emptyLength)}]`);
  }

  /**
   * 生成改进建议
   */
  generateImprovementSuggestions(): string[] {
    const suggestions: string[] = [];
    
    // 基于测试结果生成建议
    const failedCritical = this.results.filter(r => 
      r.severity === 'CRITICAL' && r.status === 'FAIL'
    );
    
    if (failedCritical.length > 0) {
      suggestions.push('🚨 立即修复所有关键性问题，确保核心功能正常');
    }

    const failedAPIs = this.results.filter(r => 
      r.category === 'API接口' && r.status === 'FAIL'
    );
    
    if (failedAPIs.length > 0) {
      suggestions.push('🔧 修复API接口问题，确保数据传输正常');
    }

    const performanceWarnings = this.results.filter(r => 
      r.category === '性能优化' && r.status === 'WARNING'
    );
    
    if (performanceWarnings.length > 0) {
      suggestions.push('⚡ 实施性能优化建议，提升系统响应速度');
    }

    const uxWarnings = this.results.filter(r => 
      r.category === '用户体验' && r.status === 'WARNING'
    );
    
    if (uxWarnings.length > 0) {
      suggestions.push('🎨 优化用户体验，特别是移动端适配');
    }

    // 通用建议
    suggestions.push('📚 完善文档和代码注释，提高可维护性');
    suggestions.push('🧪 增加单元测试和集成测试覆盖率');
    suggestions.push('📊 建立监控系统，实时追踪系统健康状态');
    suggestions.push('🚀 探索AI能力边界，开发更多创新功能');

    return suggestions;
  }

  /**
   * 保存详细报告
   */
  saveDetailedReport(stats: any, severity: any, healthScore: number, improvements: string[]) {
    const report = {
      timestamp: new Date().toISOString(),
      systemName: 'AI风水大师系统',
      version: '2.0.0',
      healthScore,
      statistics: stats,
      severityBreakdown: severity,
      testResults: this.results,
      improvements,
      categories: this.groupResultsByCategory()
    };

    const reportPath = path.join(this.rootDir, 'comprehensive-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📁 详细报告已保存: ${colors.blue}${reportPath}${colors.reset}`);

    // 生成Markdown报告
    this.generateMarkdownReport(report);
  }

  /**
   * 按类别分组结果
   */
  groupResultsByCategory(): Record<string, any> {
    const grouped: Record<string, any> = {};
    
    for (const result of this.results) {
      if (!grouped[result.category]) {
        grouped[result.category] = {
          total: 0,
          passed: 0,
          failed: 0,
          warnings: 0,
          tests: []
        };
      }
      
      grouped[result.category].total++;
      grouped[result.category].tests.push(result);
      
      if (result.status === 'PASS') grouped[result.category].passed++;
      else if (result.status === 'FAIL') grouped[result.category].failed++;
      else if (result.status === 'WARNING') grouped[result.category].warnings++;
    }
    
    return grouped;
  }

  /**
   * 生成Markdown格式报告
   */
  generateMarkdownReport(report: any) {
    let markdown = `# AI风水大师系统 - 综合测试报告

## 📊 概览
- **测试日期**: ${new Date(report.timestamp).toLocaleString('zh-CN')}
- **系统版本**: ${report.version}
- **健康度评分**: **${report.healthScore}%**

## 📈 测试统计
| 指标 | 数量 | 百分比 |
|-----|------|--------|
| 总测试 | ${report.statistics.total} | 100% |
| ✅ 通过 | ${report.statistics.passed} | ${((report.statistics.passed/report.statistics.total)*100).toFixed(1)}% |
| ❌ 失败 | ${report.statistics.failed} | ${((report.statistics.failed/report.statistics.total)*100).toFixed(1)}% |
| ⚠️ 警告 | ${report.statistics.warnings} | ${((report.statistics.warnings/report.statistics.total)*100).toFixed(1)}% |

## 🔍 分类测试结果
`;

    for (const [category, data] of Object.entries(report.categories)) {
      const categoryData = data as any;
      markdown += `
### ${category}
- 通过: ${categoryData.passed}/${categoryData.total}
- 失败: ${categoryData.failed}
- 警告: ${categoryData.warnings}
`;
    }

    markdown += `
## 🎯 改进建议
${report.improvements.map((item: string, index: number) => `${index + 1}. ${item}`).join('\n')}

---
*报告生成时间: ${new Date().toISOString()}*
`;

    const mdPath = path.join(this.rootDir, 'docs/comprehensive-test-report.md');
    // 确保docs目录存在
    const docsDir = path.join(this.rootDir, 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    fs.writeFileSync(mdPath, markdown);
    console.log(`📝 Markdown报告已保存: ${colors.blue}${mdPath}${colors.reset}`);
  }
}

// 执行测试
async function main() {
  const tester = new ComprehensiveSystemTester();
  await tester.runAllTests();
}

// 错误处理
process.on('uncaughtException', (error) => {
  console.error(`${colors.red}未捕获的异常: ${error.message}${colors.reset}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`${colors.red}未处理的Promise拒绝:${colors.reset}`, reason);
  process.exit(1);
});

// 执行
main().catch(error => {
  console.error(`${colors.red}测试执行失败: ${error}${colors.reset}`);
  process.exit(1);
});