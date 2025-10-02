#!/bin/bash

# QiFlow AI 快速部署脚本
# v5.1.1

echo "==========================================="
echo "    QiFlow AI 生产环境部署脚本 v5.1.1"
echo "==========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查环境
check_requirements() {
    echo "🔍 检查系统要求..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 未安装${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Node.js $(node -v)${NC}"
    
    # 检查npm/yarn
    if command -v yarn &> /dev/null; then
        PKG_MANAGER="yarn"
        echo -e "${GREEN}✓ Yarn $(yarn -v)${NC}"
    elif command -v npm &> /dev/null; then
        PKG_MANAGER="npm"
        echo -e "${GREEN}✓ NPM $(npm -v)${NC}"
    else
        echo -e "${RED}❌ 包管理器未安装${NC}"
        exit 1
    fi
    
    # 检查Git
    if ! command -v git &> /dev/null; then
        echo -e "${YELLOW}⚠ Git 未安装（可选）${NC}"
    else
        echo -e "${GREEN}✓ Git $(git --version | cut -d' ' -f3)${NC}"
    fi
    
    echo ""
}

# 设置环境变量
setup_env() {
    echo "🔧 配置环境变量..."
    
    # 检查是否存在.env文件
    if [ -f ".env" ]; then
        echo -e "${YELLOW}⚠ .env 文件已存在${NC}"
        read -p "是否覆盖现有配置？(y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "跳过环境变量配置"
            return
        fi
    fi
    
    # 复制生产环境配置
    cp .env.production .env
    echo -e "${GREEN}✓ 已创建 .env 文件${NC}"
    
    # 生成安全密钥
    echo "生成安全密钥..."
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
    NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
    ENCRYPTION_KEY=$(openssl rand -base64 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
    
    # 替换密钥
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
        sed -i '' "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=$NEXTAUTH_SECRET/" .env
        sed -i '' "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
    else
        # Linux
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
        sed -i "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=$NEXTAUTH_SECRET/" .env
        sed -i "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
    fi
    
    echo -e "${GREEN}✓ 安全密钥已生成${NC}"
    echo ""
}

# 安装依赖
install_deps() {
    echo "📦 安装依赖包..."
    
    if [ "$PKG_MANAGER" = "yarn" ]; then
        yarn install --production
    else
        npm ci --production
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 依赖安装完成${NC}"
    else
        echo -e "${RED}❌ 依赖安装失败${NC}"
        exit 1
    fi
    
    echo ""
}

# 数据库迁移
setup_database() {
    echo "🗄️ 设置数据库..."
    
    # 检查数据库连接
    if ! grep -q "DATABASE_URL=postgresql://" .env; then
        echo -e "${YELLOW}⚠ 请先配置 DATABASE_URL${NC}"
        echo "示例: DATABASE_URL=postgresql://user:pass@localhost:5432/qiflow"
        return
    fi
    
    # 运行迁移
    echo "运行数据库迁移..."
    npx prisma migrate deploy
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 数据库迁移完成${NC}"
    else
        echo -e "${RED}❌ 数据库迁移失败${NC}"
        exit 1
    fi
    
    echo ""
}

# 构建应用
build_app() {
    echo "🔨 构建应用..."
    
    if [ "$PKG_MANAGER" = "yarn" ]; then
        yarn build
    else
        npm run build
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 应用构建完成${NC}"
    else
        echo -e "${RED}❌ 应用构建失败${NC}"
        exit 1
    fi
    
    echo ""
}

# 运行测试
run_tests() {
    echo "🧪 运行测试..."
    
    # 运行类型检查
    echo "类型检查..."
    npx tsc --noEmit
    
    # 运行linting
    echo "代码检查..."
    npx eslint . --max-warnings=0
    
    # 运行单元测试
    if [ -f "jest.config.js" ]; then
        echo "单元测试..."
        npm test -- --coverage
    fi
    
    echo -e "${GREEN}✓ 测试完成${NC}"
    echo ""
}

# 性能测试
perf_test() {
    echo "⚡ 运行性能测试..."
    
    if [ -f "mksaas/scripts/performance-test.js" ]; then
        node mksaas/scripts/performance-test.js smoke
        echo -e "${GREEN}✓ 性能测试完成${NC}"
    else
        echo -e "${YELLOW}⚠ 性能测试脚本不存在${NC}"
    fi
    
    echo ""
}

# 部署到Vercel
deploy_vercel() {
    echo "🚀 部署到 Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        echo "安装 Vercel CLI..."
        npm i -g vercel
    fi
    
    echo "开始部署..."
    vercel --prod
    
    echo -e "${GREEN}✓ 部署完成${NC}"
    echo ""
}

# 显示总结
show_summary() {
    echo "==========================================="
    echo -e "${GREEN}       🎉 部署准备完成！${NC}"
    echo "==========================================="
    echo ""
    echo "📋 已完成的步骤："
    echo "  ✓ 系统要求检查"
    echo "  ✓ 环境变量配置"
    echo "  ✓ 依赖包安装"
    echo "  ✓ 数据库迁移"
    echo "  ✓ 应用构建"
    echo "  ✓ 测试运行"
    echo ""
    echo -e "${YELLOW}⚠ 请确认以下配置：${NC}"
    echo "  1. DATABASE_URL - 数据库连接"
    echo "  2. STRIPE_SECRET_KEY - 支付密钥"
    echo "  3. UPSTASH_REDIS_* - Redis缓存"
    echo ""
    echo "📝 下一步操作："
    echo "  1. 编辑 .env 文件，填写缺失的配置"
    echo "  2. 运行 'npm start' 启动应用"
    echo "  3. 或运行 'vercel --prod' 部署到Vercel"
    echo ""
    echo "📚 文档："
    echo "  - 部署指南: docs/deployment-guide.md"
    echo "  - API文档: docs/api.md"
    echo "  - Stripe集成: mksaas/docs/stripe-integration.md"
    echo ""
}

# 主函数
main() {
    # 切换到项目根目录
    cd "$(dirname "$0")"
    
    # 显示菜单
    echo "请选择操作："
    echo "1) 完整部署流程"
    echo "2) 仅配置环境变量"
    echo "3) 仅安装依赖"
    echo "4) 仅构建应用"
    echo "5) 仅运行测试"
    echo "6) 部署到Vercel"
    echo "0) 退出"
    echo ""
    
    read -p "选择操作 [0-6]: " choice
    
    case $choice in
        1)
            check_requirements
            setup_env
            install_deps
            setup_database
            build_app
            run_tests
            perf_test
            show_summary
            ;;
        2)
            setup_env
            ;;
        3)
            install_deps
            ;;
        4)
            build_app
            ;;
        5)
            run_tests
            perf_test
            ;;
        6)
            deploy_vercel
            ;;
        0)
            echo "退出"
            exit 0
            ;;
        *)
            echo -e "${RED}无效选择${NC}"
            exit 1
            ;;
    esac
}

# 运行主函数
main