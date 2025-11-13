/**
 * 端到端测试套件 - 完整报告生成流程
 *
 * 目标: 测试覆盖率 > 80%
 * 覆盖: 基础报告、精华报告、人宅合一、PDF、错误处理
 */

import type { BirthInfo } from '@/lib/bazi-pro/core/calculator/four-pillars';
import { beforeAll, describe, expect, it } from 'vitest';
import { generateSynthesisAnalysis } from '../ai/synthesis-prompt';
import { generateReportPDF } from '../pdf/report-pdf-generator';
import { auditReport } from '../quality/report-auditor';
import { generateEssentialReport } from '../reports/essential-report';

/**
 * 测试数据
 */
const mockBirthInfo: BirthInfo = {
  year: 1990,
  month: 3,
  day: 15,
  hour: 14,
  minute: 30,
  gender: 'male',
  timezone: 'Asia/Shanghai',
  location: {
    lat: 39.9042,
    lon: 116.4074,
    name: '北京',
  },
};

const mockFengshuiData = {
  mountain: '子',
  facing: '午',
  buildYear: 2015,
};

describe('端到端测试：完整报告生成流程', () => {
  describe('1. 精华报告生成测试', () => {
    it('应该成功生成不包含人宅合一分析的基础精华报告', async () => {
      const report = await generateEssentialReport({
        birthInfo: mockBirthInfo,
        selectedThemes: ['career', 'relationship', 'health'],
      });

      // 验证基本结构
      expect(report).toBeDefined();
      expect(report.baziData).toBeDefined();
      expect(report.flyingStarData).toBeDefined();

      // 验证主题内容
      expect(report.themes).toHaveLength(3);
      report.themes.forEach((theme) => {
        expect(theme.id).toBeDefined();
        expect(theme.title).toBeDefined();
        expect(theme.story).toBeDefined();
        expect(theme.synthesis).toBeDefined();
        expect(theme.recommendations).toBeInstanceOf(Array);
        expect(theme.recommendations.length).toBeGreaterThan(0);
      });

      // 验证质量分数
      expect(report.qualityScore).toBeGreaterThan(0);
      expect(report.qualityScore).toBeLessThanOrEqual(100);

      // 验证元数据
      expect(report.metadata.aiModel).toBeDefined();
      expect(report.metadata.generationTimeMs).toBeGreaterThan(0);
      expect(report.metadata.aiCostUSD).toBeGreaterThan(0);

      // 验证无人宅合一分析
      expect(report.synthesis).toBeUndefined();

      console.log(`\n✅ 基础精华报告生成成功`);
      console.log(`   - 主题数: ${report.themes.length}`);
      console.log(`   - 质量分: ${report.qualityScore}/100`);
      console.log(`   - 成本: $${report.metadata.aiCostUSD.toFixed(4)}`);
      console.log(`   - 耗时: ${report.metadata.generationTimeMs}ms`);
    }, 60000); // 60秒超时

    it('应该成功生成包含人宅合一分析的完整精华报告', async () => {
      const report = await generateEssentialReport({
        birthInfo: mockBirthInfo,
        selectedThemes: ['career', 'relationship', 'health'],
        fengshuiData: mockFengshuiData,
      });

      // 验证基本结构
      expect(report).toBeDefined();
      expect(report.themes).toHaveLength(3);

      // 验证人宅合一分析存在
      expect(report.synthesis).toBeDefined();

      if (report.synthesis) {
        // 验证超级吉位
        expect(report.synthesis.superLuckySpots).toBeInstanceOf(Array);
        expect(report.synthesis.superLuckySpots.length).toBeGreaterThanOrEqual(
          0
        );
        expect(report.synthesis.superLuckySpots.length).toBeLessThanOrEqual(3);

        // 验证风险区域
        expect(report.synthesis.riskZones).toBeInstanceOf(Array);
        expect(report.synthesis.riskZones.length).toBeLessThanOrEqual(2);

        // 验证布局建议
        expect(report.synthesis.layoutAdvice).toBeInstanceOf(Array);
        expect(report.synthesis.layoutAdvice.length).toBeGreaterThanOrEqual(3);
        expect(report.synthesis.layoutAdvice.length).toBeLessThanOrEqual(5);

        // 验证摘要
        expect(report.synthesis.summary).toBeDefined();
        expect(report.synthesis.summary.length).toBeGreaterThan(0);

        // 验证成本控制
        expect(report.synthesis.metadata.estimatedCost).toBeLessThan(0.3);

        console.log(`\n✅ 完整精华报告（含人宅合一）生成成功`);
        console.log(
          `   - 超级吉位: ${report.synthesis.superLuckySpots.length} 个`
        );
        console.log(`   - 风险区域: ${report.synthesis.riskZones.length} 个`);
        console.log(
          `   - 布局建议: ${report.synthesis.layoutAdvice.length} 条`
        );
        console.log(
          `   - 人宅合一成本: $${report.synthesis.metadata.estimatedCost.toFixed(4)}`
        );
        console.log(`   - 总成本: $${report.metadata.aiCostUSD.toFixed(4)}`);
      }
    }, 60000);
  });

  describe('2. PDF生成测试', () => {
    it('应该成功将报告转换为PDF', async () => {
      // 先生成报告
      const report = await generateEssentialReport({
        birthInfo: mockBirthInfo,
        selectedThemes: ['career', 'health'],
        fengshuiData: mockFengshuiData,
      });

      // 生成PDF
      const pdfBuffer = await generateReportPDF({
        report,
        userInfo: {
          name: '测试用户',
          birthDate: '1990年3月15日',
          birthTime: '14:30',
          birthPlace: '北京',
        },
        houseInfo: {
          facing: '午',
          mountain: '子',
        },
      });

      // 验证PDF
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);

      // 验证文件大小 < 2MB
      const sizeKB = pdfBuffer.length / 1024;
      expect(sizeKB).toBeLessThan(2048);

      // 验证PDF魔数（%PDF-）
      const pdfHeader = pdfBuffer.toString('utf8', 0, 5);
      expect(pdfHeader).toBe('%PDF-');

      console.log(`\n✅ PDF生成成功`);
      console.log(`   - 文件大小: ${sizeKB.toFixed(2)}KB`);
    }, 30000);
  });

  describe('3. 质量审核测试', () => {
    it('应该通过基础报告的质量审核', async () => {
      const report = await generateEssentialReport({
        birthInfo: mockBirthInfo,
        selectedThemes: ['career', 'relationship', 'health'],
      });

      const auditResult = await auditReport(report, {
        isPremium: false,
        strictMode: false,
      });

      // 验证审核结果
      expect(auditResult).toBeDefined();
      expect(auditResult.passed).toBe(true);
      expect(auditResult.score).toBeGreaterThanOrEqual(70);

      // 验证审核详情
      expect(auditResult.details.completeness.passed).toBe(true);
      expect(auditResult.details.quality.passed).toBe(true);
      expect(auditResult.details.compliance.passed).toBe(true);

      // 验证无严重问题
      const criticalIssues = auditResult.issues.filter(
        (i) => i.severity === 'critical'
      );
      expect(criticalIssues.length).toBe(0);

      console.log(`\n✅ 质量审核通过`);
      console.log(`   - 总分: ${auditResult.score}/100`);
      console.log(`   - 完整性: ${auditResult.details.completeness.score}/100`);
      console.log(`   - 质量: ${auditResult.details.quality.score}/100`);
      console.log(`   - 合规性: ${auditResult.details.compliance.score}/100`);
      console.log(`   - 问题数: ${auditResult.issues.length}`);
    }, 60000);

    it('应该通过付费版报告的质量审核', async () => {
      const report = await generateEssentialReport({
        birthInfo: mockBirthInfo,
        selectedThemes: ['career', 'relationship', 'health'],
        fengshuiData: mockFengshuiData,
      });

      const auditResult = await auditReport(report, {
        isPremium: true,
        strictMode: false,
      });

      // 验证审核结果
      expect(auditResult.passed).toBe(true);
      expect(auditResult.score).toBeGreaterThanOrEqual(70);

      // 付费版必须有人宅合一分析
      expect(report.synthesis).toBeDefined();

      console.log(`\n✅ 付费版质量审核通过`);
      console.log(`   - 总分: ${auditResult.score}/100`);
    }, 60000);
  });

  describe('4. 错误处理测试', () => {
    it('应该正确处理无效的出生信息', async () => {
      const invalidBirthInfo = {
        ...mockBirthInfo,
        year: 1800, // 无效年份
      };

      await expect(async () => {
        await generateEssentialReport({
          birthInfo: invalidBirthInfo as any,
        });
      }).rejects.toThrow();

      console.log(`\n✅ 无效数据错误处理正确`);
    });

    it('应该在缺少风水数据时跳过人宅合一分析', async () => {
      const report = await generateEssentialReport({
        birthInfo: mockBirthInfo,
        // 不提供 fengshuiData
      });

      // 应该成功生成，但没有人宅合一分析
      expect(report).toBeDefined();
      expect(report.synthesis).toBeUndefined();

      console.log(`\n✅ 缺失风水数据降级处理正确`);
    }, 60000);
  });

  describe('5. 性能测试', () => {
    it('精华报告生成应在合理时间内完成', async () => {
      const startTime = Date.now();

      const report = await generateEssentialReport({
        birthInfo: mockBirthInfo,
        selectedThemes: ['career'],
        fengshuiData: mockFengshuiData,
      });

      const timeTaken = Date.now() - startTime;

      // 期望在30秒内完成
      expect(timeTaken).toBeLessThan(30000);

      console.log(`\n✅ 性能测试通过`);
      console.log(`   - 生成时间: ${timeTaken}ms`);
      console.log(`   - 目标: < 30000ms`);
    }, 60000);

    it('PDF生成应在5秒内完成', async () => {
      const report = await generateEssentialReport({
        birthInfo: mockBirthInfo,
        selectedThemes: ['career'],
      });

      const startTime = Date.now();

      await generateReportPDF({
        report,
        userInfo: {
          birthDate: '1990年3月15日',
          birthTime: '14:30',
        },
      });

      const timeTaken = Date.now() - startTime;

      // 期望在5秒内完成
      expect(timeTaken).toBeLessThan(5000);

      console.log(`\n✅ PDF生成性能达标`);
      console.log(`   - 生成时间: ${timeTaken}ms`);
      console.log(`   - 目标: < 5000ms`);
    }, 30000);
  });

  describe('6. 成本控制测试', () => {
    it('基础报告成本应在预算内', async () => {
      const report = await generateEssentialReport({
        birthInfo: mockBirthInfo,
        selectedThemes: ['career', 'relationship', 'health'],
      });

      // 基础报告（3主题）：预算约 $0.10
      expect(report.metadata.aiCostUSD).toBeLessThan(0.15);

      console.log(`\n✅ 基础报告成本控制达标`);
      console.log(`   - 实际成本: $${report.metadata.aiCostUSD.toFixed(4)}`);
      console.log(`   - 预算: < $0.15`);
    }, 60000);

    it('完整报告（含人宅合一）成本应在预算内', async () => {
      const report = await generateEssentialReport({
        birthInfo: mockBirthInfo,
        selectedThemes: ['career', 'relationship', 'health'],
        fengshuiData: mockFengshuiData,
      });

      // 完整报告（3主题 + 人宅合一）：预算约 $0.50
      expect(report.metadata.aiCostUSD).toBeLessThan(0.5);

      console.log(`\n✅ 完整报告成本控制达标`);
      console.log(`   - 实际成本: $${report.metadata.aiCostUSD.toFixed(4)}`);
      console.log(`   - 预算: < $0.50`);
    }, 60000);
  });

  describe('7. 集成测试：完整流程', () => {
    it('应该成功完成从生成到PDF导出的完整流程', async () => {
      console.log(`\n🚀 开始完整流程测试...`);

      // 1. 生成报告
      console.log(`   [1/4] 生成精华报告...`);
      const report = await generateEssentialReport({
        birthInfo: mockBirthInfo,
        selectedThemes: ['career', 'relationship'],
        fengshuiData: mockFengshuiData,
      });
      expect(report).toBeDefined();
      expect(report.synthesis).toBeDefined();
      console.log(`   ✓ 报告生成完成`);

      // 2. 质量审核
      console.log(`   [2/4] 执行质量审核...`);
      const auditResult = await auditReport(report, { isPremium: true });
      expect(auditResult.passed).toBe(true);
      console.log(`   ✓ 质量审核通过 (${auditResult.score}/100)`);

      // 3. 生成PDF
      console.log(`   [3/4] 生成PDF文件...`);
      const pdfBuffer = await generateReportPDF({
        report,
        userInfo: {
          name: '完整测试用户',
          birthDate: '1990年3月15日',
          birthTime: '14:30',
          birthPlace: '北京',
        },
        houseInfo: mockFengshuiData,
      });
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      console.log(
        `   ✓ PDF生成完成 (${(pdfBuffer.length / 1024).toFixed(2)}KB)`
      );

      // 4. 最终验证
      console.log(`   [4/4] 最终验证...`);
      expect(report.metadata.aiCostUSD).toBeLessThan(0.5);
      expect(
        auditResult.issues.filter((i) => i.severity === 'critical').length
      ).toBe(0);
      expect(pdfBuffer.length / 1024).toBeLessThan(2048);

      console.log(`\n🎉 完整流程测试成功！`);
      console.log(`   - 报告质量: ${auditResult.score}/100`);
      console.log(`   - 总成本: $${report.metadata.aiCostUSD.toFixed(4)}`);
      console.log(`   - PDF大小: ${(pdfBuffer.length / 1024).toFixed(2)}KB`);
      console.log(`   - 问题数: ${auditResult.issues.length}`);
    }, 120000); // 2分钟超时
  });
});

/**
 * 压力测试（可选）
 */
describe('压力测试', () => {
  it.skip('应该能连续生成多份报告', async () => {
    const count = 5;
    const results = [];

    for (let i = 0; i < count; i++) {
      const report = await generateEssentialReport({
        birthInfo: {
          ...mockBirthInfo,
          minute: i * 10, // 稍微改变数据
        },
        selectedThemes: ['career'],
      });

      results.push({
        index: i,
        cost: report.metadata.aiCostUSD,
        time: report.metadata.generationTimeMs,
        quality: report.qualityScore,
      });
    }

    const avgCost = results.reduce((sum, r) => sum + r.cost, 0) / count;
    const avgTime = results.reduce((sum, r) => sum + r.time, 0) / count;

    expect(avgCost).toBeLessThan(0.1);

    console.log(`\n✅ 压力测试完成`);
    console.log(`   - 生成数量: ${count}`);
    console.log(`   - 平均成本: $${avgCost.toFixed(4)}`);
    console.log(`   - 平均时间: ${avgTime.toFixed(0)}ms`);
  });
});
