/**
 * API 压力测试脚本
 * 使用 autocannon 进行高性能负载测试
 *
 * 安装: npm install --save-dev autocannon
 * 运行: node tests/performance/api-load-test.js
 */

const autocannon = require('autocannon');
const fs = require('fs');
const path = require('path');

// 测试配置
const config = {
  baseUrl: process.env.TEST_API_URL || 'http://localhost:3000',
  duration: 60, // 测试持续时间（秒）
  connections: 10, // 并发连接数
  pipelining: 1, // 每个连接的并发请求数
};

// 测试场景
const testScenarios = [
  {
    name: '错误监控 API',
    url: '/api/monitoring/errors',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // 添加认证 token
      Authorization: `Bearer ${process.env.TEST_AUTH_TOKEN}`,
    },
  },
  {
    name: '日志查询 API',
    url: '/api/monitoring/logs?page=1&limit=50',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TEST_AUTH_TOKEN}`,
    },
  },
  {
    name: '性能监控 API',
    url: '/api/monitoring/performance',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TEST_AUTH_TOKEN}`,
    },
  },
];

// 运行单个测试场景
async function runTest(scenario) {
  console.log('\n========================================');
  console.log(`测试场景: ${scenario.name}`);
  console.log('========================================\n');

  return new Promise((resolve, reject) => {
    const instance = autocannon(
      {
        url: `${config.baseUrl}${scenario.url}`,
        method: scenario.method,
        headers: scenario.headers,
        duration: config.duration,
        connections: config.connections,
        pipelining: config.pipelining,
      },
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );

    // 实时输出进度
    autocannon.track(instance, { renderProgressBar: true });
  });
}

// 生成测试报告
function generateReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    config,
    results: results.map((r) => ({
      name: r.name,
      summary: {
        requests: {
          total: r.result.requests.total,
          average: r.result.requests.average,
          p50: r.result.latency.p50,
          p95: r.result.latency.p95,
          p99: r.result.latency.p99,
        },
        throughput: {
          total: r.result.throughput.total,
          average: r.result.throughput.average,
        },
        errors: r.result.errors,
        timeouts: r.result.timeouts,
      },
    })),
  };

  // 保存报告
  const reportPath = path.join(
    __dirname,
    'reports',
    `load-test-${Date.now()}.json`
  );
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  return { report, reportPath };
}

// 主测试函数
async function main() {
  console.log('========================================');
  console.log('API 压力测试');
  console.log('========================================');
  console.log(`基础 URL: ${config.baseUrl}`);
  console.log(`持续时间: ${config.duration}秒`);
  console.log(`并发连接数: ${config.connections}`);
  console.log('========================================\n');

  const results = [];

  try {
    for (const scenario of testScenarios) {
      const result = await runTest(scenario);
      results.push({ name: scenario.name, result });

      // 等待一段时间再运行下一个测试
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    // 生成报告
    const { report, reportPath } = generateReport(results);

    console.log('\n========================================');
    console.log('测试完成！');
    console.log('========================================\n');

    // 输出摘要
    results.forEach((r) => {
      console.log(`\n${r.name}:`);
      console.log(`  请求总数: ${r.result.requests.total}`);
      console.log(`  平均请求/秒: ${r.result.requests.average.toFixed(2)}`);
      console.log(`  平均延迟: ${r.result.latency.mean.toFixed(2)}ms`);
      console.log(`  P50 延迟: ${r.result.latency.p50}ms`);
      console.log(`  P95 延迟: ${r.result.latency.p95}ms`);
      console.log(`  P99 延迟: ${r.result.latency.p99}ms`);
      console.log(`  错误数: ${r.result.errors}`);
      console.log(`  超时数: ${r.result.timeouts}`);
    });

    console.log(`\n报告已保存: ${reportPath}`);

    // 判断是否通过
    const hasFailures = results.some(
      (r) =>
        r.result.errors > 0 ||
        r.result.timeouts > 0 ||
        r.result.latency.p95 > 2000 // P95 延迟超过 2 秒
    );

    process.exit(hasFailures ? 1 : 0);
  } catch (error) {
    console.error('\n测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  main();
}

module.exports = { runTest, generateReport };
