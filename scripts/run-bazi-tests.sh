#!/bin/bash
# 八字模块测试执行脚本

echo "========================================="
echo "八字模块测试套件"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 运行Nayin表验证
echo -e "${BLUE}[1/4] 运行Nayin表验证测试...${NC}"
npm test -- src/lib/bazi/constants/__tests__/nayin.test.ts
echo ""

# 2. 运行真太阳时计算测试
echo -e "${BLUE}[2/4] 运行真太阳时计算测试...${NC}"
npm test -- src/lib/bazi-pro/core/calculator/__tests__/true-solar-time.test.ts
echo ""

# 3. 运行输入验证测试
echo -e "${BLUE}[3/4] 运行输入验证测试...${NC}"
npm test -- src/lib/bazi/validators/__tests__/validators.test.ts
echo ""

# 4. 运行四柱计算集成测试
echo -e "${BLUE}[4/4] 运行四柱计算集成测试...${NC}"
npm test -- src/lib/bazi-pro/core/calculator/__tests__/four-pillars.test.ts
echo ""

# 5. 生成覆盖率报告
echo -e "${YELLOW}生成测试覆盖率报告...${NC}"
npm test -- --config=jest.config.bazi.js --coverage
echo ""

# 6. 总结
echo "========================================="
echo -e "${GREEN}测试完成!${NC}"
echo "========================================="
echo ""
echo "测试覆盖率报告: coverage/bazi/index.html"
echo ""
