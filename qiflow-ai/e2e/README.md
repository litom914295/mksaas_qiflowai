# QiFlow AI 端到端测试套件

本测试套件为 QiFlow AI 八字风水对话系统提供全面的端到端测试覆盖。

## 测试结构

### 📁 e2e/ - 端到端测试

- `chat-system.spec.ts` - 对话系统核心功能测试
- `compass-chat-integration.spec.ts` - 罗盘与对话联动测试
- `state-machine-transitions.spec.ts` - 状态机转换测试
- `error-handling-boundary.spec.ts` - 错误处理和边界条件测试

### 📁 fixtures/ - 测试框架

- `index.ts` - 测试数据和页面对象模型

### 📁 helpers/ - 测试工具

- `test-utils.ts` - 通用测试助手函数

### 📁 src/lib/**tests**/ - 集成测试

- `master-orchestrator-integration.test.ts` - MasterOrchestrator 集成测试
- `database-integration.test.ts` - 数据库和缓存集成测试

## 测试覆盖范围

### 🎯 核心功能测试

- ✅ 嘉宾会话创建和管理
- ✅ 八字信息收集和验证
- ✅ AI 对话流程和响应质量
- ✅ 状态机转换（greeting → collecting_info → analyzing → explaining → recommending）
- ✅ 推荐卡片交互
- ✅ 多语言切换（中文简繁体、英语、日语、韩语）

### 🧭 罗盘集成测试

- ✅ 罗盘读数更新对话上下文
- ✅ 2D/3D 罗盘视图切换
- ✅ 设备方向权限处理
- ✅ 罗盘校准流程
- ✅ 移动设备适配
- ✅ 传感器降级和手动输入

### 🔄 状态管理测试

- ✅ 完整状态机流程
- ✅ 状态转换错误处理和回滚
- ✅ 并发状态转换处理
- ✅ 状态持久化和恢复
- ✅ 多用户状态隔离

### 🏗️ 系统集成测试

- ✅ MasterOrchestrator 与各组件集成
- ✅ 知识图谱查询和应用
- ✅ 成本控制和预算检查
- ✅ 策略引擎决策应用
- ✅ 置信度评估
- ✅ 使用情况跟踪

### 💾 数据层测试

- ✅ Supabase 数据库操作
- ✅ Redis 缓存管理
- ✅ 数据一致性验证
- ✅ 缓存失效和重建
- ✅ 性能基准测试

### 🚨 错误处理测试

- ✅ 网络错误和重试机制
- ✅ API 服务不可用处理
- ✅ 数据验证和边界条件
- ✅ 并发和竞争条件
- ✅ 浏览器兼容性问题
- ✅ 安全防护（XSS、文件上传限制）
- ✅ 异常数据处理

## 运行测试

### 前提条件

```bash
# 安装依赖
npm install

# 安装 Playwright 浏览器
npx playwright install
```

### 环境变量

```bash
# 必需的环境变量
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
GUEST_SESSION_SECRET=your_session_secret

# 可选的测试环境变量
TEST_REDIS_URL=redis://localhost:6379
TEST_SUPABASE_URL=your_test_supabase_url
TEST_SUPABASE_ANON_KEY=your_test_anon_key
TEST_SUPABASE_SERVICE_KEY=your_test_service_key
```

### 运行测试命令

```bash
# 运行所有端到端测试
npm run test:e2e

# 运行特定测试文件
npx playwright test chat-system.spec.ts
npx playwright test compass-chat-integration.spec.ts
npx playwright test state-machine-transitions.spec.ts
npx playwright test error-handling-boundary.spec.ts

# 运行集成测试
npm test -- master-orchestrator-integration.test.ts
npm test -- database-integration.test.ts

# 使用 UI 模式运行测试
npm run test:e2e:ui

# 运行特定浏览器
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# 运行移动设备测试
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"

# 调试模式
npx playwright test --debug
npx playwright test --headed

# 生成测试报告
npx playwright show-report
```

### 并行测试

```bash
# 控制并行度
npx playwright test --workers=4

# CI 环境中运行
npx playwright test --reporter=json
```

## 测试数据

### 测试用户数据

```typescript
const testUser = {
  birthDate: '1990-01-01',
  birthTime: '12:00',
  gender: 'male',
  timezone: 'Asia/Shanghai',
  isLunar: false,
};
```

### 测试房屋数据

```typescript
const testHouse = {
  address: '上海市黄浦区南京东路100号',
  buildYear: 2010,
  orientation: 180, // 南向
  floorPlan: {
    rooms: [
      { id: 'living-room', name: '客厅', type: 'living' },
      { id: 'bedroom', name: '主卧', type: 'bedroom' },
      { id: 'kitchen', name: '厨房', type: 'kitchen' },
    ],
  },
};
```

### 测试罗盘数据

```typescript
const compassReadings = {
  magnetic: 185,
  true: 180,
  declination: -5,
  accuracy: 'high',
};
```

## 性能基准

### 响应时间期望

- 状态转换: < 3秒
- AI 分析: < 25秒
- 数据库操作: < 2秒
- 缓存操作: < 1秒

### 并发处理

- 支持多个嘉宾会话并行
- 状态隔离验证
- 资源竞争处理

## 错误处理验证

### 网络层

- ✅ 完全断网处理
- ✅ 间歇性网络故障
- ✅ 慢速网络适配
- ✅ API 服务降级

### 数据层

- ✅ 数据库连接失败
- ✅ 缓存服务不可用
- ✅ 数据格式异常
- ✅ 存储空间不足

### 浏览器层

- ✅ 本地存储不可用
- ✅ 设备传感器不支持
- ✅ 浏览器权限拒绝
- ✅ 内存不足处理

### 安全层

- ✅ XSS 攻击防护
- ✅ 输入数据验证
- ✅ 文件上传安全
- ✅ 会话劫持防护

## 持续集成

### GitHub Actions 配置

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## 调试技巧

### 调试失败的测试

```bash
# 保存失败时的截图
npx playwright test --screenshot=only-on-failure

# 录制测试过程
npx playwright test --video=retain-on-failure

# 启用详细日志
DEBUG=pw:api npx playwright test

# 检查网络请求
npx playwright test --trace=on
```

### 常见问题排查

1. **测试超时**: 检查网络连接和服务可用性
2. **元素找不到**: 验证 `data-testid` 属性
3. **状态不一致**: 检查异步操作完成
4. **随机失败**: 增加等待时间和重试机制

## 维护指南

### 添加新测试

1. 确定测试类别（E2E、集成、单元）
2. 使用现有的 fixtures 和 helpers
3. 遵循 AAA 模式（Arrange-Act-Assert）
4. 添加适当的清理逻辑

### 更新测试数据

1. 保持测试数据的现实性
2. 避免硬编码敏感信息
3. 使用工厂模式生成测试数据
4. 定期清理测试垃圾数据

### 测试环境管理

1. 使用独立的测试数据库
2. 隔离测试环境和生产环境
3. 定期备份和恢复测试数据
4. 监控测试环境资源使用

---

这个测试套件确保 QiFlow AI 系统的可靠性、性能和用户体验质量。通过全面的测试覆盖，我们可以自信地部署和维护这个复杂的 AI 风水分析平台。
