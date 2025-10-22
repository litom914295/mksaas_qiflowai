import { check, sleep } from 'k6';
import http from 'k6/http';
import { Rate, Trend } from 'k6/metrics';

// 自定义指标
const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');
const growthApiDuration = new Trend('growth_api_duration');

// 测试配置
export const options = {
  stages: [
    { duration: '2m', target: 50 }, // 缓慢增加到50个用户
    { duration: '5m', target: 50 }, // 保持50个用户5分钟
    { duration: '2m', target: 100 }, // 增加到100个用户
    { duration: '5m', target: 100 }, // 保持100个用户5分钟
    { duration: '2m', target: 200 }, // 增加到200个用户（压力测试）
    { duration: '5m', target: 200 }, // 保持200个用户5分钟
    { duration: '2m', target: 0 }, // 缩减到0个用户
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95%的请求应在2秒内完成
    http_req_failed: ['rate<0.05'], // 错误率应低于5%
    errors: ['rate<0.05'], // 自定义错误率低于5%
    api_duration: ['p(95)<1500'], // API响应95%在1.5秒内
    growth_api_duration: ['p(95)<2000'], // 增长API响应95%在2秒内
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';

// 辅助函数：生成随机数据
function generateRandomEmail() {
  return `test_${Math.random().toString(36).substring(7)}@example.com`;
}

function generateRandomCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// 测试场景1：基础API健康检查
export function healthCheck() {
  const res = http.get(`${BASE_URL}/api/health`);
  check(res, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 500ms': (r) => r.timings.duration < 500,
  });
  errorRate.add(res.status !== 200);
  apiDuration.add(res.timings.duration);
}

// 测试场景2：增长指标API
export function testGrowthMetrics() {
  const params = {
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  const res = http.get(
    `${BASE_URL}/api/admin/growth/metrics?type=summary`,
    params
  );
  check(res, {
    'growth metrics status is 200': (r) => r.status === 200,
    'growth metrics has K factor': (r) => {
      const body = JSON.parse(r.body);
      return body.data && body.data.kFactor !== undefined;
    },
  });
  errorRate.add(res.status !== 200);
  growthApiDuration.add(res.timings.duration);
}

// 测试场景3：推荐系统API
export function testReferralSystem() {
  const params = {
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  // 获取推荐列表
  let res = http.get(
    `${BASE_URL}/api/admin/growth/referrals?page=1&limit=10`,
    params
  );
  check(res, {
    'referral list status is 200': (r) => r.status === 200,
  });

  // 创建新推荐链接
  const referralData = {
    userId: `user_${Math.floor(Math.random() * 100)}`,
    customCode: generateRandomCode(),
    rewardAmount: 50,
  };

  res = http.post(
    `${BASE_URL}/api/admin/growth/referrals`,
    JSON.stringify(referralData),
    params
  );
  check(res, {
    'create referral status is 201': (r) => r.status === 201,
    'referral has code': (r) => {
      const body = JSON.parse(r.body);
      return body.data && body.data.code !== undefined;
    },
  });
  errorRate.add(res.status !== 201);
  growthApiDuration.add(res.timings.duration);
}

// 测试场景4：积分系统API
export function testCreditSystem() {
  const params = {
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  // 获取积分交易记录
  let res = http.get(
    `${BASE_URL}/api/admin/growth/credits?type=transactions`,
    params
  );
  check(res, {
    'credit transactions status is 200': (r) => r.status === 200,
  });

  // 创建积分交易
  const transactionData = {
    userId: `user_${Math.floor(Math.random() * 100)}`,
    amount: Math.floor(Math.random() * 100) + 10,
    type: 'earn',
    reason: 'Performance test transaction',
  };

  res = http.post(
    `${BASE_URL}/api/admin/growth/credits`,
    JSON.stringify(transactionData),
    params
  );
  check(res, {
    'create transaction status is 201': (r) => r.status === 201,
  });
  errorRate.add(res.status !== 201);
  growthApiDuration.add(res.timings.duration);
}

// 测试场景5：并发推荐创建（压力测试）
export function stressTestReferralCreation() {
  const params = {
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  const batch = [];
  for (let i = 0; i < 10; i++) {
    const referralData = {
      userId: `user_${Math.floor(Math.random() * 1000)}`,
      customCode: generateRandomCode(),
      rewardAmount: Math.floor(Math.random() * 100) + 10,
    };
    batch.push([
      'POST',
      `${BASE_URL}/api/admin/growth/referrals`,
      JSON.stringify(referralData),
      params,
    ]);
  }

  const responses = http.batch(batch);
  responses.forEach((res) => {
    check(res, {
      'batch referral creation successful': (r) =>
        r.status === 201 || r.status === 200,
    });
    errorRate.add(res.status !== 201 && res.status !== 200);
  });
}

// 测试场景6：数据库查询性能
export function testDatabasePerformance() {
  const params = {
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  // 复杂查询：获取详细的增长指标
  const res = http.get(
    `${BASE_URL}/api/admin/growth/metrics?type=detailed&dateRange=30d`,
    params
  );
  check(res, {
    'detailed metrics status is 200': (r) => r.status === 200,
    'detailed metrics response time < 3s': (r) => r.timings.duration < 3000,
  });
  errorRate.add(res.status !== 200);
  apiDuration.add(res.timings.duration);
}

// 主测试函数
export default function () {
  // 随机选择一个测试场景执行
  const scenarios = [
    healthCheck,
    testGrowthMetrics,
    testReferralSystem,
    testCreditSystem,
    testDatabasePerformance,
  ];

  // 80%的流量执行常规测试
  if (Math.random() < 0.8) {
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    scenario();
  } else {
    // 20%的流量执行压力测试
    stressTestReferralCreation();
  }

  sleep(1); // 每个虚拟用户请求之间休眠1秒
}

// 测试生命周期钩子
export function setup() {
  // 测试开始前的准备工作
  console.log('Starting performance test...');
  console.log(`Testing against: ${BASE_URL}`);

  // 验证服务是否可用
  const res = http.get(`${BASE_URL}/api/health`);
  if (res.status !== 200) {
    throw new Error(`Service is not available. Status: ${res.status}`);
  }

  return { startTime: new Date().toISOString() };
}

export function teardown(data) {
  // 测试结束后的清理工作
  console.log('Performance test completed.');
  console.log(`Test started at: ${data.startTime}`);
  console.log(`Test ended at: ${new Date().toISOString()}`);
}
