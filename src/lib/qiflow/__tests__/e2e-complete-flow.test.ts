/**
 * 端到端测试 - 完整业务流程
 *
 * 测试从报告生成到支付完成的完整流程
 */

import { beforeEach, describe, expect, test } from '@jest/globals';
import { PAYWALL_EXPERIMENT, globalABTest } from '../ab-testing/ab-test';
import { getReportDisclaimers } from '../compliance/disclaimer';
import { globalCostGuard } from '../monitoring/cost-guard';
import { dualAudit } from '../quality/dual-audit-system';
import { generateEssentialReport } from '../reports/essential-report';
import { globalTracker, track } from '../tracking/conversion-tracker';

describe('E2E: 完整业务流程测试', () => {
  const testUserId = 'test_user_e2e';

  beforeEach(() => {
    // 重置状态
    globalCostGuard.reset();
    globalTracker.reset();
  });

  test('流程1: 免费报告生成 → Paywall展示 → 支付跳转', async () => {
    console.log('\n=== 测试流程1: 免费用户转化流程 ===\n');

    // 步骤1: 用户访问页面
    track.pageView({ page: 'reports', userId: testUserId });

    // 步骤2: 生成基础报告（不含风水数据）
    const basicInput = {
      year: 1990,
      month: 6,
      day: 15,
      hour: 14,
      minute: 30,
      gender: 'male' as const,
      location: '北京',
      timezone: 8,
    };

    // 检查成本
    const costCheck = globalCostGuard.canExecute(0.02, testUserId);
    expect(costCheck.allowed).toBe(true);

    // 生成报告
    const report = await generateEssentialReport(basicInput);
    expect(report).toBeDefined();
    expect(report.themes.length).toBeGreaterThan(0);

    // 记录成本
    globalCostGuard.recordUsage(0.015, testUserId);

    // 追踪报告生成
    track.reportGenerated('basic', { userId: testUserId, cost: 0.015 });

    // 步骤3: 质量审核
    const audit = await dualAudit(report, { strictMode: false });
    console.log('审核结果:', {
      passed: audit.passed,
      score: audit.ruleAudit.score,
      decision: audit.decision,
    });

    // 步骤4: 获取A/B测试变体
    const variant = globalABTest.getVariant(
      PAYWALL_EXPERIMENT.id,
      testUserId,
      'session_123'
    );
    expect(variant).toBeDefined();
    console.log('分配变体:', variant?.name);

    // 步骤5: 展示Paywall
    track.paywallShown(variant!.id, { userId: testUserId });

    // 步骤6: 用户点击支付
    track.paymentInitiated(9.9, { userId: testUserId, variant: variant!.id });

    // 验证转化漏斗
    const funnel = globalTracker.getFunnel();
    console.log('转化漏斗:', funnel);

    expect(funnel.totalViews).toBe(1);
    expect(funnel.reportsGenerated).toBe(1);
    expect(funnel.paywallShown).toBe(1);
    expect(funnel.paymentInitiated).toBe(1);

    // 步骤7: 获取免责声明
    const disclaimer = getReportDisclaimers(false);
    expect(disclaimer).toContain('重要声明');
    expect(disclaimer).toContain('18周岁及以上');

    console.log('✅ 流程1测试通过');
  });

  test('流程2: 付费报告完整流程', async () => {
    console.log('\n=== 测试流程2: 付费用户完整流程 ===\n');

    // 步骤1: 用户直接购买精华报告
    const premiumInput = {
      year: 1990,
      month: 6,
      day: 15,
      hour: 14,
      minute: 30,
      gender: 'male' as const,
      location: '北京',
      timezone: 8,
      // 包含风水数据
      fengshuiData: {
        mountain: 180,
        facing: 0,
        buildYear: 2010,
      },
    };

    // 成本检查
    const costCheck = globalCostGuard.canExecute(0.5, testUserId);
    expect(costCheck.allowed).toBe(true);

    // 生成精华报告
    const report = await generateEssentialReport(premiumInput);
    expect(report).toBeDefined();
    expect(report.synthesis).toBeDefined();

    // 记录成本
    globalCostGuard.recordUsage(0.35, testUserId);
    track.reportGenerated('essential', { userId: testUserId, cost: 0.35 });

    // 步骤2: 严格模式审核
    const audit = await dualAudit(report, {
      isPremium: true,
      strictMode: true,
      aiAuditEnabled: true,
    });

    console.log('严格审核结果:', {
      passed: audit.passed,
      score: audit.ruleAudit.score,
      aiConfidence: audit.aiAudit.confidence,
    });

    // 步骤3: 模拟支付完成
    const orderId = `order_${Date.now()}`;
    track.paymentCompleted(orderId, 9.9, {
      userId: testUserId,
      reportId: 'report_123',
    });

    // 步骤4: 报告解锁
    track.reportUnlocked('report_123', { orderId, userId: testUserId });

    // 步骤5: PDF下载
    track.pdfDownloaded('report_123', { userId: testUserId });

    // 验证用户旅程
    const journey = globalTracker.getUserJourney(testUserId);
    console.log(
      '用户旅程:',
      journey.map((e) => e.eventType)
    );

    expect(journey.length).toBeGreaterThan(0);
    expect(journey[journey.length - 1].eventType).toBe('pdf_downloaded');

    // 获取付费免责声明
    const disclaimer = getReportDisclaimers(true);
    expect(disclaimer).toContain('精华报告特别声明');
    expect(disclaimer).toContain('人宅合一');

    console.log('✅ 流程2测试通过');
  });

  test('流程3: 成本控制与降级', async () => {
    console.log('\n=== 测试流程3: 成本控制与降级 ===\n');

    // 模拟接近成本限制
    for (let i = 0; i < 18; i++) {
      globalCostGuard.recordUsage(0.5, `user_${i}`);
    }

    const usage = globalCostGuard.getCurrentUsage();
    console.log('当前成本使用:', {
      hourly: usage.hourly,
      hourlyLimit: usage.limits.hourly,
      percentage: ((usage.hourly / usage.limits.hourly) * 100).toFixed(1) + '%',
    });

    // 应该接近限制
    expect(usage.hourly).toBeGreaterThan(8.0);

    // 尝试新请求，应该被拦截或降级
    const costCheck = globalCostGuard.canExecute(0.5, 'new_user');

    if (!costCheck.allowed) {
      console.log('请求被拦截:', costCheck.reason);
      console.log('建议降级策略:', costCheck.suggestedStrategy);

      expect(costCheck.suggestedStrategy).toBeDefined();
      expect(['use_cache', 'reduce_quality', 'reject']).toContain(
        costCheck.suggestedStrategy
      );
    }

    console.log('✅ 流程3测试通过');
  });

  test('流程4: A/B测试稳定性', async () => {
    console.log('\n=== 测试流程4: A/B测试稳定性 ===\n');

    const userId = 'stable_user';

    // 获取10次变体，应该保持一致
    const variants: string[] = [];
    for (let i = 0; i < 10; i++) {
      const variant = globalABTest.getVariant(
        PAYWALL_EXPERIMENT.id,
        userId,
        'session_stable'
      );
      variants.push(variant!.id);
    }

    // 所有变体应该相同
    const allSame = variants.every((v) => v === variants[0]);
    expect(allSame).toBe(true);

    console.log('用户稳定分配到变体:', variants[0]);

    // 测试不同用户分配
    const userVariants = new Map<string, string>();
    for (let i = 0; i < 100; i++) {
      const variant = globalABTest.getVariant(
        PAYWALL_EXPERIMENT.id,
        `user_${i}`,
        `session_${i}`
      );
      userVariants.set(`user_${i}`, variant!.id);
    }

    // 统计分布
    const distribution: Record<string, number> = {};
    for (const variantId of userVariants.values()) {
      distribution[variantId] = (distribution[variantId] || 0) + 1;
    }

    console.log('100个用户的变体分布:', distribution);

    // 每个变体应该有大约25个用户（允许±10的误差）
    for (const count of Object.values(distribution)) {
      expect(count).toBeGreaterThan(15);
      expect(count).toBeLessThan(35);
    }

    console.log('✅ 流程4测试通过');
  });

  test('流程5: 转化漏斗完整性', async () => {
    console.log('\n=== 测试流程5: 转化漏斗完整性 ===\n');

    // 模拟100个用户的完整流程
    for (let i = 0; i < 100; i++) {
      const userId = `funnel_user_${i}`;

      // 所有人访问
      track.pageView({ userId });

      // 80%生成报告
      if (i < 80) {
        track.reportGenerated('basic', { userId });

        // 70%看到Paywall
        if (i < 70) {
          track.paywallShown('default', { userId });

          // 15%发起支付
          if (i < 15) {
            track.paymentInitiated(9.9, { userId });

            // 90%完成支付
            if (i < 13) {
              track.paymentCompleted(`order_${i}`, 9.9, { userId });
            }
          }
        }
      }
    }

    const funnel = globalTracker.getFunnel();

    console.log('转化漏斗统计:');
    console.log(`  总访问: ${funnel.totalViews}`);
    console.log(
      `  报告生成: ${funnel.reportsGenerated} (${funnel.viewToPaywall}%)`
    );
    console.log(`  Paywall展示: ${funnel.paywallShown}`);
    console.log(
      `  发起支付: ${funnel.paymentInitiated} (${funnel.paywallToPayment}%)`
    );
    console.log(
      `  完成支付: ${funnel.paymentCompleted} (${funnel.paymentToComplete}%)`
    );
    console.log(`  总体转化率: ${funnel.overallConversion}%`);

    expect(funnel.totalViews).toBe(100);
    expect(funnel.reportsGenerated).toBe(80);
    expect(funnel.paywallShown).toBe(70);
    expect(funnel.paymentInitiated).toBe(15);
    expect(funnel.paymentCompleted).toBe(13);

    // 转化率应该合理
    expect(funnel.overallConversion).toBeGreaterThan(10);
    expect(funnel.overallConversion).toBeLessThan(20);

    console.log('✅ 流程5测试通过');
  });
});

describe('E2E: 异常场景测试', () => {
  test('异常1: 成本超限拦截', () => {
    console.log('\n=== 测试异常1: 成本超限拦截 ===\n');

    // 模拟大量请求直到超限
    const userId = 'heavy_user';

    for (let i = 0; i < 25; i++) {
      globalCostGuard.recordUsage(0.5, userId);
    }

    // 应该被拦截
    const check = globalCostGuard.canExecute(0.5, userId);
    expect(check.allowed).toBe(false);

    console.log('超限拦截:', check.reason);
    console.log('✅ 异常1测试通过');
  });

  test('异常2: 质量审核失败', async () => {
    console.log('\n=== 测试异常2: 质量审核失败 ===\n');

    // 创建一个质量差的报告
    const poorReport: any = {
      themes: [
        {
          title: '性格',
          story: '短', // 太短
          synthesis: '重复重复重复重复', // 重复内容
        },
      ],
      metadata: {},
    };

    const audit = await dualAudit(poorReport, { strictMode: true });

    console.log('审核结果:', {
      passed: audit.passed,
      score: audit.ruleAudit.score,
      decision: audit.decision,
    });

    expect(audit.passed).toBe(false);
    console.log('✅ 异常2测试通过');
  });
});

console.log('\n=== 所有E2E测试完成 ===\n');
