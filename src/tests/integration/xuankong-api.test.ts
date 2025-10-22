/**
 * 玄空风水API集成测试套件
 *
 * 测试范围：
 * 1. 诊断分析API (/api/xuankong/diagnose)
 * 2. 化解方案API (/api/xuankong/remedy-plans)
 * 3. 综合分析API (/api/xuankong/comprehensive-analysis)
 */

import type { DiagnosticAlert } from '@/components/qiflow/xuankong/diagnostic-alert-card';
import type { RemedyPlan } from '@/components/qiflow/xuankong/remedy-plan-selector';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

// 测试配置
const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';
const TIMEOUT = 30000; // 30秒超时

// 测试数据
const validDiagnosePayload = {
  facing: 180,
  buildYear: 2020,
  location: {
    lat: 39.9042,
    lng: 116.4074,
  },
  includeSafeAreas: true,
  severityThreshold: 'low',
};

const validRemedyPayload = {
  issue: '五黄煞气',
  palace: '中宫',
  severity: 'high',
  budget: {
    min: 500,
    max: 5000,
  },
};

const validComprehensivePayload = {
  facing: 180,
  buildYear: 2020,
  location: {
    lat: 39.9042,
    lng: 116.4074,
  },
  userProfile: {
    bazi: {
      year: { stem: '甲', branch: '子' },
      month: { stem: '丙', branch: '寅' },
      day: { stem: '戊', branch: '午' },
      hour: { stem: '庚', branch: '申' },
    },
    priorities: ['wealth', 'health'],
  },
};

// 辅助函数
async function makeRequest(endpoint: string, method = 'POST', body?: any) {
  const url = `${BASE_URL}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  return { response, data };
}

describe('玄空风水API集成测试', () => {
  // ===== 1. 诊断分析API测试 =====
  describe('POST /api/xuankong/diagnose', () => {
    it(
      '应该返回有效的诊断结果',
      async () => {
        const { response, data } = await makeRequest(
          '/api/xuankong/diagnose',
          'POST',
          validDiagnosePayload
        );

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toBeDefined();
        expect(data.data.alerts).toBeInstanceOf(Array);
        expect(data.data.stats).toBeDefined();
        expect(data.meta.version).toBe('6.0');
      },
      TIMEOUT
    );

    it(
      '诊断结果应该包含完整的预警信息',
      async () => {
        const { data } = await makeRequest(
          '/api/xuankong/diagnose',
          'POST',
          validDiagnosePayload
        );

        const firstAlert: DiagnosticAlert = data.data.alerts[0];

        expect(firstAlert).toHaveProperty('id');
        expect(firstAlert).toHaveProperty('severity');
        expect(firstAlert).toHaveProperty('title');
        expect(firstAlert).toHaveProperty('description');
        expect(firstAlert).toHaveProperty('affectedArea');
        expect(firstAlert).toHaveProperty('score');
        expect(firstAlert).toHaveProperty('recommendations');
        expect(firstAlert).toHaveProperty('urgency');
        expect(firstAlert.impact).toHaveProperty('health');
        expect(firstAlert.impact).toHaveProperty('wealth');
        expect(firstAlert.impact).toHaveProperty('career');
        expect(firstAlert.impact).toHaveProperty('relationship');
      },
      TIMEOUT
    );

    it(
      '统计信息应该准确',
      async () => {
        const { data } = await makeRequest(
          '/api/xuankong/diagnose',
          'POST',
          validDiagnosePayload
        );

        const { alerts, stats } = data.data;
        const manualTotal = alerts.length;
        const manualCritical = alerts.filter(
          (a: DiagnosticAlert) => a.severity === 'critical'
        ).length;

        expect(stats.total).toBe(manualTotal);
        expect(stats.critical).toBe(manualCritical);
        expect(stats.avgScore).toBeGreaterThanOrEqual(0);
        expect(stats.avgScore).toBeLessThanOrEqual(100);
      },
      TIMEOUT
    );

    it(
      '缺少必需参数应该返回400错误',
      async () => {
        const { response, data } = await makeRequest(
          '/api/xuankong/diagnose',
          'POST',
          { buildYear: 2020 } // 缺少facing
        );

        expect(response.status).toBe(400);
        expect(data.error).toBeDefined();
      },
      TIMEOUT
    );

    it(
      '无效参数类型应该返回400错误',
      async () => {
        const { response, data } = await makeRequest(
          '/api/xuankong/diagnose',
          'POST',
          { facing: '180', buildYear: 2020 } // facing应该是number
        );

        expect(response.status).toBe(400);
      },
      TIMEOUT
    );

    it(
      '应该支持不同的严重程度阈值',
      async () => {
        const thresholds = ['critical', 'high', 'medium', 'low'];

        for (const threshold of thresholds) {
          const { response } = await makeRequest(
            '/api/xuankong/diagnose',
            'POST',
            { ...validDiagnosePayload, severityThreshold: threshold }
          );

          expect(response.status).toBe(200);
        }
      },
      TIMEOUT * 4
    );
  });

  // ===== 2. 化解方案API测试 =====
  describe('POST /api/xuankong/remedy-plans', () => {
    it(
      '应该返回有效的化解方案',
      async () => {
        const { response, data } = await makeRequest(
          '/api/xuankong/remedy-plans',
          'POST',
          validRemedyPayload
        );

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.plans).toBeInstanceOf(Array);
        expect(data.data.plans.length).toBeGreaterThan(0);
        expect(data.data.comparison).toBeDefined();
      },
      TIMEOUT
    );

    it(
      '方案应该包含完整的信息',
      async () => {
        const { data } = await makeRequest(
          '/api/xuankong/remedy-plans',
          'POST',
          validRemedyPayload
        );

        const firstPlan: RemedyPlan = data.data.plans[0];

        expect(firstPlan).toHaveProperty('id');
        expect(firstPlan).toHaveProperty('level');
        expect(firstPlan).toHaveProperty('name');
        expect(firstPlan).toHaveProperty('description');
        expect(firstPlan.cost).toHaveProperty('min');
        expect(firstPlan.cost).toHaveProperty('max');
        expect(firstPlan.timeline).toHaveProperty('total');
        expect(firstPlan).toHaveProperty('steps');
        expect(firstPlan.steps).toBeInstanceOf(Array);
      },
      TIMEOUT
    );

    it(
      '方案成本应该递增',
      async () => {
        const { data } = await makeRequest(
          '/api/xuankong/remedy-plans',
          'POST',
          validRemedyPayload
        );

        const plans: RemedyPlan[] = data.data.plans;

        for (let i = 1; i < plans.length; i++) {
          const prevAvg = (plans[i - 1].cost.min + plans[i - 1].cost.max) / 2;
          const currAvg = (plans[i].cost.min + plans[i].cost.max) / 2;
          expect(currAvg).toBeGreaterThanOrEqual(prevAvg);
        }
      },
      TIMEOUT
    );

    it(
      '缺少必需参数应该返回400错误',
      async () => {
        const { response, data } = await makeRequest(
          '/api/xuankong/remedy-plans',
          'POST',
          { palace: '中宫' } // 缺少issue
        );

        expect(response.status).toBe(400);
        expect(data.error).toBeDefined();
      },
      TIMEOUT
    );

    it(
      '应该支持预算限制',
      async () => {
        const { response, data } = await makeRequest(
          '/api/xuankong/remedy-plans',
          'POST',
          validRemedyPayload
        );

        expect(response.status).toBe(200);

        const plans: RemedyPlan[] = data.data.plans;
        const maxBudget = validRemedyPayload.budget.max;

        // 至少应该有一个方案在预算内
        const affordablePlans = plans.filter(
          (p) => (p.cost.min + p.cost.max) / 2 <= maxBudget
        );
        expect(affordablePlans.length).toBeGreaterThan(0);
      },
      TIMEOUT
    );
  });

  // ===== 3. 综合分析API测试 =====
  describe('POST /api/xuankong/comprehensive-analysis', () => {
    it(
      '应该返回完整的综合分析结果',
      async () => {
        const { response, data } = await makeRequest(
          '/api/xuankong/comprehensive-analysis',
          'POST',
          validComprehensivePayload
        );

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.plate).toBeDefined();
        expect(data.data.diagnosis).toBeDefined();
        expect(data.data.remedies).toBeDefined();
        expect(data.data.priorities).toBeDefined();
        expect(data.data.overallScore).toBeDefined();
        expect(data.data.recommendation).toBeDefined();
      },
      TIMEOUT
    );

    it(
      '应该包含关键方位分析（当提供用户信息时）',
      async () => {
        const { data } = await makeRequest(
          '/api/xuankong/comprehensive-analysis',
          'POST',
          validComprehensivePayload
        );

        expect(data.data.keyPositions).toBeDefined();
        expect(data.data.keyPositions).not.toBeNull();
      },
      TIMEOUT
    );

    it(
      '没有用户信息时不应包含关键方位分析',
      async () => {
        const payloadWithoutUser = {
          facing: 180,
          buildYear: 2020,
        };

        const { data } = await makeRequest(
          '/api/xuankong/comprehensive-analysis',
          'POST',
          payloadWithoutUser
        );

        expect(data.data.keyPositions).toBeNull();
      },
      TIMEOUT
    );

    it(
      '综合评分应该在有效范围内',
      async () => {
        const { data } = await makeRequest(
          '/api/xuankong/comprehensive-analysis',
          'POST',
          validComprehensivePayload
        );

        expect(data.data.overallScore).toBeGreaterThanOrEqual(0);
        expect(data.data.overallScore).toBeLessThanOrEqual(100);
      },
      TIMEOUT
    );

    it(
      '应该只为高危问题生成化解方案',
      async () => {
        const { data } = await makeRequest(
          '/api/xuankong/comprehensive-analysis',
          'POST',
          validComprehensivePayload
        );

        const { diagnosis, remedies } = data.data;
        const criticalAndHighCount =
          diagnosis.stats.critical + diagnosis.stats.high;

        expect(remedies.stats.totalIssues).toBeLessThanOrEqual(
          criticalAndHighCount
        );
      },
      TIMEOUT
    );

    it(
      '优先级建议应该按紧急程度排序',
      async () => {
        const { data } = await makeRequest(
          '/api/xuankong/comprehensive-analysis',
          'POST',
          validComprehensivePayload
        );

        const priorities = data.data.priorities;

        if (priorities.length > 1) {
          const urgencyOrder = ['immediate', 'soon', 'planned'];

          for (let i = 1; i < priorities.length; i++) {
            const prevIndex = urgencyOrder.indexOf(priorities[i - 1].urgency);
            const currIndex = urgencyOrder.indexOf(priorities[i].urgency);
            expect(currIndex).toBeGreaterThanOrEqual(prevIndex);
          }
        }
      },
      TIMEOUT
    );

    it(
      '缺少必需参数应该返回400错误',
      async () => {
        const { response, data } = await makeRequest(
          '/api/xuankong/comprehensive-analysis',
          'POST',
          { buildYear: 2020 } // 缺少facing
        );

        expect(response.status).toBe(400);
        expect(data.error).toBeDefined();
      },
      TIMEOUT
    );
  });

  // ===== 4. GET文档端点测试 =====
  describe('GET文档端点', () => {
    const endpoints = [
      '/api/xuankong/diagnose',
      '/api/xuankong/remedy-plans',
      '/api/xuankong/comprehensive-analysis',
    ];

    endpoints.forEach((endpoint) => {
      it(
        `${endpoint} 应该返回文档`,
        async () => {
          const { response, data } = await makeRequest(endpoint, 'GET');

          expect(response.status).toBe(200);
          expect(data.endpoint).toBe(endpoint);
          expect(data.method).toBe('POST');
          expect(data.description).toBeDefined();
          expect(data.parameters).toBeDefined();
        },
        TIMEOUT
      );
    });
  });

  // ===== 5. 错误处理测试 =====
  describe('错误处理', () => {
    it(
      '应该处理无效的JSON',
      async () => {
        const url = `${BASE_URL}/api/xuankong/diagnose`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: 'invalid json',
        });

        expect(response.status).toBeGreaterThanOrEqual(400);
      },
      TIMEOUT
    );

    it(
      '应该处理空请求体',
      async () => {
        const { response } = await makeRequest(
          '/api/xuankong/diagnose',
          'POST',
          {}
        );

        expect(response.status).toBe(400);
      },
      TIMEOUT
    );

    it(
      '服务器错误应该返回500',
      async () => {
        // 模拟触发服务器错误的极端参数
        const { response } = await makeRequest(
          '/api/xuankong/diagnose',
          'POST',
          { facing: 999999, buildYear: -1 }
        );

        // 应该返回错误（400或500）
        expect(response.status).toBeGreaterThanOrEqual(400);
      },
      TIMEOUT
    );
  });

  // ===== 6. 性能基准测试 =====
  describe('性能基准', () => {
    it(
      '诊断API应该在合理时间内响应',
      async () => {
        const startTime = Date.now();

        await makeRequest(
          '/api/xuankong/diagnose',
          'POST',
          validDiagnosePayload
        );

        const duration = Date.now() - startTime;

        expect(duration).toBeLessThan(5000); // 5秒内
      },
      TIMEOUT
    );

    it(
      '化解方案API应该在合理时间内响应',
      async () => {
        const startTime = Date.now();

        await makeRequest(
          '/api/xuankong/remedy-plans',
          'POST',
          validRemedyPayload
        );

        const duration = Date.now() - startTime;

        expect(duration).toBeLessThan(5000); // 5秒内
      },
      TIMEOUT
    );

    it(
      '综合分析API应该在合理时间内响应',
      async () => {
        const startTime = Date.now();

        await makeRequest(
          '/api/xuankong/comprehensive-analysis',
          'POST',
          validComprehensivePayload
        );

        const duration = Date.now() - startTime;

        expect(duration).toBeLessThan(10000); // 10秒内
      },
      TIMEOUT
    );
  });
});
