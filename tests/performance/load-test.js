/**
 * k6 性能压力测试脚本
 * 使用方法: k6 run tests/performance/load-test.js
 * 安装k6: https://k6.io/docs/getting-started/installation/
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// 自定义指标
const errorRate = new Rate('errors');
const apiResponseTime = new Trend('api_response_time');
const pageLoadTime = new Trend('page_load_time');

// 测试配置
export const options = {
  // 测试阶段
  stages: [
    { duration: '1m', target: 10 },   // 1分钟内增加到10个用户
    { duration: '3m', target: 50 },   // 3分钟内增加到50个用户
    { duration: '5m', target: 100 },  // 5分钟内增加到100个用户
    { duration: '2m', target: 50 },   // 2分钟内减少到50个用户
    { duration: '1m', target: 0 },    // 1分钟内减少到0个用户
  ],
  
  // 阈值设置（性能要求）
  thresholds: {
    'http_req_duration': ['p(95)<3000'],  // 95%的请求在3秒内完成
    'http_req_failed': ['rate<0.1'],      // 错误率小于10%
    'errors': ['rate<0.1'],                // 自定义错误率小于10%
    'api_response_time': ['p(90)<2000'],  // 90%的API响应在2秒内
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// 用户场景1：访问首页
export function visitHomepage() {
  const startTime = Date.now();
  const response = http.get(`${BASE_URL}/zh`);
  const loadTime = Date.now() - startTime;
  
  pageLoadTime.add(loadTime);
  
  const success = check(response, {
    '首页状态码200': (r) => r.status === 200,
    '首页加载时间<3s': () => loadTime < 3000,
    '包含关键内容': (r) => r.body.includes('AI八字风水'),
  });
  
  errorRate.add(!success);
  sleep(1);
}

// 用户场景2：访问八字分析页面
export function visitBaziAnalysis() {
  const startTime = Date.now();
  const response = http.get(`${BASE_URL}/zh/analysis/bazi`);
  const loadTime = Date.now() - startTime;
  
  pageLoadTime.add(loadTime);
  
  const success = check(response, {
    '八字页面状态码200': (r) => r.status === 200,
    '八字页面加载时间<3s': () => loadTime < 3000,
  });
  
  errorRate.add(!success);
  sleep(1);
}

// 用户场景3：API请求测试
export function testAPIEndpoint() {
  const startTime = Date.now();
  
  // 测试八字计算API
  const payload = JSON.stringify({
    name: '测试用户',
    birthDate: '1990-01-01 08:30',
    gender: 'male',
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = http.post(`${BASE_URL}/api/qiflow/bazi`, payload, params);
  const responseTime = Date.now() - startTime;
  
  apiResponseTime.add(responseTime);
  
  const success = check(response, {
    'API状态码200': (r) => r.status === 200 || r.status === 201,
    'API响应时间<2s': () => responseTime < 2000,
    'API返回JSON': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('application/json'),
  });
  
  errorRate.add(!success);
  sleep(1);
}

// 用户场景4：并发测试AI聊天
export function testAIChat() {
  const startTime = Date.now();
  
  const payload = JSON.stringify({
    message: '什么是八字命理？',
    context: {},
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = http.post(`${BASE_URL}/api/qiflow/chat`, payload, params);
  const responseTime = Date.now() - startTime;
  
  apiResponseTime.add(responseTime);
  
  const success = check(response, {
    'AI聊天API响应': (r) => r.status === 200 || r.status === 201,
    'AI响应时间<5s': () => responseTime < 5000,
  });
  
  errorRate.add(!success);
  sleep(2);
}

// 主测试场景（模拟真实用户行为）
export default function () {
  // 随机选择用户行为
  const scenario = Math.random();
  
  if (scenario < 0.4) {
    // 40% 用户访问首页
    visitHomepage();
  } else if (scenario < 0.7) {
    // 30% 用户访问八字分析
    visitBaziAnalysis();
  } else if (scenario < 0.9) {
    // 20% 用户调用API
    testAPIEndpoint();
  } else {
    // 10% 用户使用AI聊天
    testAIChat();
  }
}

// 测试结束后的处理
export function handleSummary(data) {
  return {
    'test-results/performance-summary.json': JSON.stringify(data, null, 2),
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

// 文本摘要函数
function textSummary(data, options) {
  const { indent = '', enableColors = false } = options;
  
  const summary = [];
  summary.push('=== 性能测试摘要 ===\n');
  
  // 请求统计
  const metrics = data.metrics;
  if (metrics) {
    summary.push(`${indent}总请求数: ${metrics.http_reqs?.values?.count || 0}\n`);
    summary.push(`${indent}失败请求: ${metrics.http_req_failed?.values?.passes || 0}\n`);
    summary.push(`${indent}平均响应时间: ${Math.round(metrics.http_req_duration?.values?.avg || 0)}ms\n`);
    summary.push(`${indent}P95响应时间: ${Math.round(metrics.http_req_duration?.values?.p95 || 0)}ms\n`);
  }
  
  // 自定义指标
  summary.push(`\n${indent}=== 自定义指标 ===\n`);
  summary.push(`${indent}错误率: ${Math.round((metrics.errors?.values?.rate || 0) * 100)}%\n`);
  summary.push(`${indent}API平均响应: ${Math.round(metrics.api_response_time?.values?.avg || 0)}ms\n`);
  summary.push(`${indent}页面平均加载: ${Math.round(metrics.page_load_time?.values?.avg || 0)}ms\n`);
  
  return summary.join('');
}