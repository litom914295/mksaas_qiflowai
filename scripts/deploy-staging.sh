#!/bin/bash

# Staging 环境部署脚本
# 用法: ./scripts/deploy-staging.sh

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  QiFlowAI Staging 部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查必要的环境变量
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}错误: DATABASE_URL 未设置${NC}"
    exit 1
fi

# 获取 Git 信息
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
GIT_COMMIT=$(git rev-parse --short HEAD)
DEPLOY_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo -e "${YELLOW}分支: ${GIT_BRANCH}${NC}"
echo -e "${YELLOW}提交: ${GIT_COMMIT}${NC}"
echo -e "${YELLOW}时间: ${DEPLOY_TIMESTAMP}${NC}"

# 1. 安装依赖
echo -e "\n${GREEN}[1/7] 安装依赖...${NC}"
npm ci --only=production

# 2. 生成 Prisma Client
echo -e "\n${GREEN}[2/7] 生成 Prisma Client...${NC}"
npx prisma generate

# 3. 运行数据库迁移
echo -e "\n${GREEN}[3/7] 运行数据库迁移...${NC}"
npx prisma migrate deploy

# 4. 构建应用
echo -e "\n${GREEN}[4/7] 构建应用...${NC}"
npm run build

# 5. 运行健康检查
echo -e "\n${GREEN}[5/7] 运行健康检查...${NC}"
npm run test:health || {
    echo -e "${RED}健康检查失败!${NC}"
    exit 1
}

# 6. 清理旧的备份（保留最近5个）
echo -e "\n${GREEN}[6/7] 清理旧备份...${NC}"
ls -t backups/ | tail -n +6 | xargs -I {} rm -rf backups/{}

# 7. 创建部署记录
echo -e "\n${GREEN}[7/7] 创建部署记录...${NC}"
node scripts/create-deployment-record.js \
    --version="${GIT_COMMIT}" \
    --environment="staging" \
    --branch="${GIT_BRANCH}" \
    --commit="${GIT_COMMIT}" \
    --status="success"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "部署信息已记录"
echo -e "访问: https://staging.qiflowai.com"
