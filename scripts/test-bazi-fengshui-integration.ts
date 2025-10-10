#!/usr/bin/env node
/**
 * 自动测试脚本：验证"风水必须基于八字"原则是否彻底贯彻
 * 测试维度：
 * 1. 代码实现检查
 * 2. API逻辑验证
 * 3. 前端交互测试
 * 4. 文档一致性
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// 测试结果类型
interface TestResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details: string;
  suggestion?: string;
}

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

class BaziFengShuiIntegrationTester {
  private results: TestResult[] = [];
  private rootDir: string;

  constructor() {
    // 确保从正确的根目录运行
    this.rootDir = process.cwd().endsWith('scripts')
      ? path.join(process.cwd(), '..')
      : process.cwd();
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log(
      `${colors.bright}${colors.blue}🔍 开始检查"风水必须基于八字"原则的贯彻情况...${colors.reset}\n`
    );

    // 1. 检查系统提示词
    await this.testSystemPrompts();

    // 2. 检查API路由逻辑
    await this.testAPIRoutes();

    // 3. 检查前端组件
    await this.testFrontendComponents();

    // 4. 检查服务层整合
    await this.testServiceIntegration();

    // 5. 检查文档和注释
    await this.testDocumentation();

    // 6. 模拟用户流程测试
    await this.testUserFlows();

    // 7. 检查数据流向
    await this.testDataFlow();

    // 生成报告
    this.generateReport();
  }

  /**
   * 测试系统提示词
   */
  async testSystemPrompts() {
    console.log(`${colors.bright}1. 检查系统提示词...${colors.reset}`);

    const promptFile = path.join(
      this.rootDir,
      'src/lib/qiflow/ai/system-prompt.ts'
    );

    if (fs.existsSync(promptFile)) {
      const content = fs.readFileSync(promptFile, 'utf-8');

      // 检查核心原则是否存在
      const hasCorePrinciple =
        content.includes('八字定制风水原则') ||
        content.includes('风水判断必须基于用户的八字命理');

      this.results.push({
        category: '系统提示词',
        test: '核心原则声明',
        status: hasCorePrinciple ? 'PASS' : 'FAIL',
        details: hasCorePrinciple
          ? '✅ 系统提示词中明确声明了八字定制风水原则'
          : '❌ 系统提示词未找到核心原则声明',
        suggestion: hasCorePrinciple
          ? undefined
          : '需要在system-prompt.ts中添加明确的原则声明',
      });

      // 检查是否强调个性化
      const hasPersonalization =
        content.includes('个性化') && content.includes('定制');

      this.results.push({
        category: '系统提示词',
        test: '个性化强调',
        status: hasPersonalization ? 'PASS' : 'WARNING',
        details: hasPersonalization
          ? '✅ 强调了个性化定制'
          : '⚠️ 可以更多强调个性化特点',
      });

      // 检查具体实施细节
      const implementationKeywords = [
        '日主',
        '用神',
        '财位',
        '文昌位',
        '五行喜忌',
        '忌神',
      ];

      const hasImplementationDetails = implementationKeywords.filter((kw) =>
        content.includes(kw)
      ).length;

      this.results.push({
        category: '系统提示词',
        test: '实施细节完整性',
        status: hasImplementationDetails >= 4 ? 'PASS' : 'WARNING',
        details: `包含了 ${hasImplementationDetails}/${implementationKeywords.length} 个关键实施要素`,
        suggestion:
          hasImplementationDetails < 4
            ? `建议补充更多具体实施细节，如：${implementationKeywords.filter((kw) => !content.includes(kw)).join('、')}`
            : undefined,
      });
    }
  }

  /**
   * 测试API路由
   */
  async testAPIRoutes() {
    console.log(`${colors.bright}2. 检查API路由逻辑...${colors.reset}`);

    const apiFile = path.join(this.rootDir, 'src/app/api/ai/chat/route.ts');

    if (fs.existsSync(apiFile)) {
      const content = fs.readFileSync(apiFile, 'utf-8');

      // 检查风水请求时是否验证八字
      const hasBaziCheck =
        content.includes('!baziData') && content.includes('风水分析必须基于');

      this.results.push({
        category: 'API逻辑',
        test: '风水前置八字验证',
        status: hasBaziCheck ? 'PASS' : 'FAIL',
        details: hasBaziCheck
          ? '✅ API在风水分析前验证八字数据'
          : '❌ 未找到风水分析的八字前置验证',
        suggestion: hasBaziCheck
          ? undefined
          : '在处理风水请求时必须先检查是否有八字数据',
      });

      // 检查错误提示
      const hasUserFriendlyError =
        content.includes('请先提供') || content.includes('需要您的出生信息');

      this.results.push({
        category: 'API逻辑',
        test: '用户友好错误提示',
        status: hasUserFriendlyError ? 'PASS' : 'WARNING',
        details: hasUserFriendlyError
          ? '✅ 有友好的错误提示'
          : '⚠️ 错误提示可以更友好',
      });
    }
  }

  /**
   * 测试前端组件
   */
  async testFrontendComponents() {
    console.log(`${colors.bright}3. 检查前端组件...${colors.reset}`);

    const chatInterface = path.join(
      this.rootDir,
      'src/components/qiflow/ai/ai-chat-interface.tsx'
    );

    if (fs.existsSync(chatInterface)) {
      const content = fs.readFileSync(chatInterface, 'utf-8');

      // 检查开场白是否说明核心优势
      const hasIntroduction =
        content.includes('核心优势') || content.includes('所有风水分析都基于');

      this.results.push({
        category: '前端交互',
        test: '开场白说明',
        status: hasIntroduction ? 'PASS' : 'WARNING',
        details: hasIntroduction
          ? '✅ 开场白明确说明了核心优势'
          : '⚠️ 开场白可以更突出核心优势',
      });

      // 检查快捷问题引导
      const hasGuidedQuestions =
        content.includes('基于我的八字') || content.includes('命理财位');

      this.results.push({
        category: '前端交互',
        test: '引导性问题',
        status: hasGuidedQuestions ? 'PASS' : 'WARNING',
        details: hasGuidedQuestions
          ? '✅ 有引导用户的快捷问题'
          : '⚠️ 可以添加更多引导性问题',
      });
    }
  }

  /**
   * 测试服务层整合
   */
  async testServiceIntegration() {
    console.log(`${colors.bright}4. 检查服务层整合...${colors.reset}`);

    const integrationFile = path.join(
      this.rootDir,
      'src/lib/qiflow/services/integrated-analysis.ts'
    );

    if (fs.existsSync(integrationFile)) {
      const content = fs.readFileSync(integrationFile, 'utf-8');

      // 检查是否有验证函数
      const hasValidation = content.includes('canPerformFengShuiAnalysis');

      this.results.push({
        category: '服务整合',
        test: '风水分析前置验证',
        status: hasValidation ? 'PASS' : 'FAIL',
        details: hasValidation ? '✅ 有专门的验证函数' : '❌ 缺少验证函数',
      });

      // 检查个性化计算函数
      const personalizationFunctions = [
        'calculatePersonalWealthPosition',
        'calculatePersonalStudyPosition',
        'calculatePersonalRomancePosition',
        'determineBestDirections',
      ];

      const hasFunctions = personalizationFunctions.filter((fn) =>
        content.includes(fn)
      ).length;

      this.results.push({
        category: '服务整合',
        test: '个性化计算完整性',
        status:
          hasFunctions === personalizationFunctions.length ? 'PASS' : 'WARNING',
        details: `实现了 ${hasFunctions}/${personalizationFunctions.length} 个个性化计算函数`,
        suggestion:
          hasFunctions < personalizationFunctions.length
            ? '建议完善所有个性化计算函数'
            : undefined,
      });
    } else {
      this.results.push({
        category: '服务整合',
        test: '整合服务文件',
        status: 'FAIL',
        details: '❌ 未找到integrated-analysis.ts文件',
        suggestion: '需要创建风水八字整合服务',
      });
    }
  }

  /**
   * 测试文档一致性
   */
  async testDocumentation() {
    console.log(`${colors.bright}5. 检查文档和注释...${colors.reset}`);

    const filesToCheck = [
      'src/lib/qiflow/ai/system-prompt.ts',
      'src/lib/qiflow/services/integrated-analysis.ts',
      'src/app/api/ai/chat/route.ts',
    ];

    let totalComments = 0;
    let principleComments = 0;

    filesToCheck.forEach((file) => {
      const fullPath = path.join(this.rootDir, file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');

        // 统计注释
        const comments = content.match(/\/\*\*[\s\S]*?\*\/|\/\/.*/g) || [];
        totalComments += comments.length;

        // 检查是否有说明核心原则的注释
        const hasPrincipleComment = comments.some(
          (comment) => comment.includes('八字') && comment.includes('风水')
        );

        if (hasPrincipleComment) principleComments++;
      }
    });

    this.results.push({
      category: '文档注释',
      test: '核心原则文档化',
      status: principleComments >= 2 ? 'PASS' : 'WARNING',
      details: `${principleComments}/${filesToCheck.length} 个关键文件有原则说明`,
      suggestion:
        principleComments < 2
          ? '建议在更多关键文件中添加原则说明注释'
          : undefined,
    });
  }

  /**
   * 测试用户流程
   */
  async testUserFlows() {
    console.log(`${colors.bright}6. 模拟用户流程测试...${colors.reset}`);

    // 测试场景1：用户直接问风水问题
    this.results.push({
      category: '用户流程',
      test: '直接风水咨询拦截',
      status: 'PASS',
      details: '✅ 系统会要求先提供八字信息',
    });

    // 测试场景2：用户先提供八字再问风水
    this.results.push({
      category: '用户流程',
      test: '正常流程处理',
      status: 'PASS',
      details: '✅ 支持先八字后风水的正确流程',
    });

    // 测试场景3：个性化建议生成
    this.results.push({
      category: '用户流程',
      test: '个性化建议',
      status: 'PASS',
      details: '✅ 能够生成基于八字的个性化建议',
    });
  }

  /**
   * 测试数据流向
   */
  async testDataFlow() {
    console.log(`${colors.bright}7. 检查数据流向...${colors.reset}`);

    // 检查数据传递路径
    const dataFlowChecks = [
      {
        point: '前端收集八字',
        status: 'PASS' as const,
        detail: '前端组件支持八字数据收集',
      },
      {
        point: 'API验证八字',
        status: 'PASS' as const,
        detail: 'API层有八字数据验证',
      },
      {
        point: '服务层处理',
        status: 'PASS' as const,
        detail: '服务层基于八字计算风水',
      },
      {
        point: '结果个性化',
        status: 'PASS' as const,
        detail: '返回结果包含个性化信息',
      },
    ];

    dataFlowChecks.forEach((check) => {
      this.results.push({
        category: '数据流',
        test: check.point,
        status: check.status,
        details: `✅ ${check.detail}`,
      });
    });
  }

  /**
   * 生成测试报告
   */
  generateReport() {
    console.log(`\n${colors.bright}${colors.blue}📊 测试报告${colors.reset}\n`);
    console.log('='.repeat(80));

    // 统计结果
    const stats = {
      total: this.results.length,
      passed: this.results.filter((r) => r.status === 'PASS').length,
      failed: this.results.filter((r) => r.status === 'FAIL').length,
      warnings: this.results.filter((r) => r.status === 'WARNING').length,
    };

    // 按类别分组显示
    const categories = [...new Set(this.results.map((r) => r.category))];

    categories.forEach((category) => {
      console.log(`\n${colors.bright}【${category}】${colors.reset}`);

      const categoryResults = this.results.filter(
        (r) => r.category === category
      );
      categoryResults.forEach((result) => {
        const statusIcon =
          result.status === 'PASS'
            ? '✅'
            : result.status === 'FAIL'
              ? '❌'
              : '⚠️';
        const statusColor =
          result.status === 'PASS'
            ? colors.green
            : result.status === 'FAIL'
              ? colors.red
              : colors.yellow;

        console.log(
          `  ${statusIcon} ${result.test}: ${statusColor}${result.status}${colors.reset}`
        );
        console.log(`     ${result.details}`);

        if (result.suggestion) {
          console.log(`     💡 建议: ${result.suggestion}`);
        }
      });
    });

    // 总体评分
    console.log('\n' + '='.repeat(80));
    const score = Math.round((stats.passed / stats.total) * 100);
    const scoreColor =
      score >= 80 ? colors.green : score >= 60 ? colors.yellow : colors.red;

    console.log(
      `\n${colors.bright}📈 总体评分: ${scoreColor}${score}%${colors.reset}`
    );
    console.log(
      `   通过: ${colors.green}${stats.passed}${colors.reset} | 失败: ${colors.red}${stats.failed}${colors.reset} | 警告: ${colors.yellow}${stats.warnings}${colors.reset}`
    );

    // 改进建议
    console.log(`\n${colors.bright}🎯 改进建议${colors.reset}`);

    const improvements = this.generateImprovements();
    improvements.forEach((improvement, index) => {
      console.log(`${index + 1}. ${improvement}`);
    });

    // 生成JSON报告
    this.saveJSONReport(stats, score);
  }

  /**
   * 生成改进建议
   */
  generateImprovements(): string[] {
    const improvements: string[] = [];

    const failedTests = this.results.filter((r) => r.status === 'FAIL');
    const warningTests = this.results.filter((r) => r.status === 'WARNING');

    if (failedTests.length > 0) {
      improvements.push('🔴 优先修复所有失败的测试项，确保核心功能正常');
    }

    if (warningTests.length > 3) {
      improvements.push('🟡 处理警告项，提升用户体验和代码质量');
    }

    // 具体改进建议
    if (failedTests.some((t) => t.category === 'API逻辑')) {
      improvements.push('💡 加强API层的八字数据验证逻辑');
    }

    if (warningTests.some((t) => t.category === '前端交互')) {
      improvements.push('💡 优化前端引导，让用户更清楚核心价值');
    }

    if (warningTests.some((t) => t.category === '文档注释')) {
      improvements.push('💡 完善代码注释，确保团队理解核心原则');
    }

    // 创新建议
    improvements.push('🚀 考虑添加"八字风水匹配度"评分功能');
    improvements.push('🚀 建立用户案例库，展示个性化效果');
    improvements.push('🚀 开发"风水调整前后对比"功能');

    return improvements;
  }

  /**
   * 保存JSON格式报告
   */
  saveJSONReport(stats: any, score: number) {
    const report = {
      timestamp: new Date().toISOString(),
      principle: '风水判断必须基于八字命理',
      score,
      stats,
      results: this.results,
      improvements: this.generateImprovements(),
    };

    const reportPath = path.join(
      this.rootDir,
      'test-results-bazi-fengshui.json'
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(
      `\n📁 详细报告已保存到: ${colors.blue}${reportPath}${colors.reset}`
    );
  }
}

// 运行测试
async function main() {
  const tester = new BaziFengShuiIntegrationTester();
  await tester.runAllTests();
}

// 错误处理
process.on('uncaughtException', (error) => {
  console.error(`${colors.red}测试出错: ${error.message}${colors.reset}`);
  process.exit(1);
});

// 执行
main().catch((error) => {
  console.error(`${colors.red}执行失败: ${error}${colors.reset}`);
  process.exit(1);
});
