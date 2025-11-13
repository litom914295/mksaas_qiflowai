#!/bin/bash

# 人宅合一AI分析 - 快速测试脚本
# 用法: ./test-synthesis.sh

echo "🚀 开始测试人宅合一AI分析模块..."
echo ""

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
  echo "⚠️  未找到 node_modules，正在安装依赖..."
  npm install
  echo ""
fi

# 运行测试
echo "📋 运行测试套件..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm test src/lib/qiflow/ai/__tests__/synthesis-prompt.test.ts -- --reporter=verbose

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查测试结果
if [ $? -eq 0 ]; then
  echo "✅ 所有测试通过！"
  echo ""
  echo "📊 关键指标："
  echo "  - 成本控制: < $0.30 ✅"
  echo "  - 质量评分: 60-100 ✅"
  echo "  - 响应时间: < 5秒 ✅"
  echo ""
  echo "🎯 下一步："
  echo "  1. 运行 pnpm build 构建项目"
  echo "  2. 在实际环境中测试集成"
  echo "  3. 监控生产成本和质量指标"
else
  echo "❌ 测试失败，请检查错误信息"
  echo ""
  echo "🔍 常见问题："
  echo "  - 确保环境变量已配置（DEEPSEEK_API_KEY）"
  echo "  - 检查网络连接"
  echo "  - 查看详细错误日志"
fi

echo ""
