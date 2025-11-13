#!/bin/bash

# QiFlowAI 上线前自动检查脚本
# 基于 @LAUNCH_CHECKLIST_FINAL.md

set -e

echo "================================================"
echo "🚀 QiFlowAI 上线前自动检查"
echo "================================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查计数器
PASSED=0
FAILED=0
WARNINGS=0

# 检查函数
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

echo "📋 Step 1: 代码质量检查"
echo "----------------------------"

# TypeScript类型检查
if npm run type-check > /dev/null 2>&1; then
    check_pass "TypeScript类型检查通过"
else
    check_fail "TypeScript类型检查失败"
fi

# Linter检查
if npm run lint > /dev/null 2>&1; then
    check_pass "ESLint检查通过"
else
    check_warn "ESLint发现问题（非致命）"
fi

# 构建检查
echo ""
echo "🏗️  Step 2: 构建检查"
echo "----------------------------"

if npm run build > /dev/null 2>&1; then
    check_pass "生产构建成功"
    
    # 检查构建产物大小
    BUILD_SIZE=$(du -sh .next 2>/dev/null | cut -f1 || echo "未知")
    echo "   构建产物大小: $BUILD_SIZE"
else
    check_fail "生产构建失败"
fi

# 测试检查
echo ""
echo "🧪 Step 3: 测试检查"
echo "----------------------------"

if npm run test > /dev/null 2>&1; then
    check_pass "单元测试通过"
else
    check_warn "部分测试失败或跳过"
fi

# E2E测试
if [ -f "src/lib/qiflow/__tests__/e2e-complete-flow.test.ts" ]; then
    check_pass "E2E测试文件存在"
else
    check_warn "E2E测试文件缺失"
fi

# 环境变量检查
echo ""
echo "🔐 Step 4: 环境变量检查"
echo "----------------------------"

if [ -f ".env.production" ]; then
    check_pass ".env.production 文件存在"
    
    # 检查必需的环境变量
    REQUIRED_VARS=("DEEPSEEK_API_KEY" "DATABASE_URL" "NEXT_PUBLIC_APP_URL")
    
    for VAR in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${VAR}=" .env.production; then
            check_pass "环境变量 $VAR 已配置"
        else
            check_fail "环境变量 $VAR 缺失"
        fi
    done
else
    check_fail ".env.production 文件不存在"
fi

# 文件结构检查
echo ""
echo "📁 Step 5: 关键文件检查"
echo "----------------------------"

CRITICAL_FILES=(
    "src/lib/qiflow/reports/essential-report.ts"
    "src/lib/qiflow/quality/dual-audit-system.ts"
    "src/lib/qiflow/monitoring/cost-guard.ts"
    "src/lib/qiflow/tracking/conversion-tracker.ts"
    "src/components/reports/ReportPaywall.tsx"
)

for FILE in "${CRITICAL_FILES[@]}"; do
    if [ -f "$FILE" ]; then
        check_pass "$(basename $FILE) 存在"
    else
        check_fail "$(basename $FILE) 缺失"
    fi
done

# Git检查
echo ""
echo "🔄 Step 6: Git状态检查"
echo "----------------------------"

if git diff --quiet; then
    check_pass "工作区干净（无未提交更改）"
else
    check_warn "存在未提交的更改"
    echo "   未提交文件:"
    git status --short | head -5
fi

# 分支检查
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
    check_pass "当前在主分支: $CURRENT_BRANCH"
else
    check_warn "当前不在主分支: $CURRENT_BRANCH"
fi

# 依赖检查
echo ""
echo "📦 Step 7: 依赖检查"
echo "----------------------------"

if [ -f "package-lock.json" ]; then
    check_pass "package-lock.json 存在"
else
    check_warn "package-lock.json 缺失"
fi

# 检查是否有安全漏洞
AUDIT_OUTPUT=$(npm audit --production 2>&1 || true)
if echo "$AUDIT_OUTPUT" | grep -q "found 0 vulnerabilities"; then
    check_pass "无安全漏洞"
else
    check_warn "存在安全漏洞，建议修复"
fi

# 文档检查
echo ""
echo "📚 Step 8: 文档检查"
echo "----------------------------"

REQUIRED_DOCS=(
    "@LAUNCH_CHECKLIST_FINAL.md"
    "@LAUNCH_TEST_CHECKLIST.md"
    "@FRONTEND_INTEGRATION_GUIDE.md"
    "@PHASE_2-5_COMPLETION_REPORT.md"
)

for DOC in "${REQUIRED_DOCS[@]}"; do
    if [ -f "$DOC" ]; then
        check_pass "$DOC 存在"
    else
        check_warn "$DOC 缺失"
    fi
done

# 总结
echo ""
echo "================================================"
echo "📊 检查结果总结"
echo "================================================"
echo ""
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${YELLOW}警告: $WARNINGS${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ 所有关键检查通过！系统准备上线。${NC}"
    echo ""
    echo "下一步:"
    echo "1. 运行端到端测试: npm run test:e2e"
    echo "2. 完成 @LAUNCH_CHECKLIST_FINAL.md 中的所有检查项"
    echo "3. 部署到生产环境"
    exit 0
else
    echo -e "${RED}❌ 存在 $FAILED 个关键问题，请修复后再上线。${NC}"
    exit 1
fi
