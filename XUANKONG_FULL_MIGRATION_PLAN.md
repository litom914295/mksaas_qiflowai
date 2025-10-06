# 玄空风水功能完整移植计划 🏠🧭

## 执行时间
2025-01-06

## 完整流程分析

### 源项目完整功能流程

1. **用户资料输入** → 八字分析（已完成）
2. **罗盘定位** → 风水方位测量
3. **房屋模板选择** → 3种模板
4. **平面图上传** → 图片/文件上传
5. **玄空飞星分析** → 综合分析报告

---

## 需要移植的组件清单

### 1. 罗盘组件 (Compass Components)
```
源目录: D:\test\qiflow-ai\src\components\compass\
目标目录: D:\test\mksaas_qiflowai\src\components\compass\

需移植文件:
├── feng-shui-compass.tsx           ✨ 核心罗盘组件
├── compass-theme-selector.tsx      ✨ 主题选择器
├── compass-calibration.tsx         ✨ 校准组件
├── compass-measurement.tsx         ✨ 测量组件
├── compass-ui.tsx                  ✨ UI组件
├── compass-error-boundary.tsx      ✨ 错误边界
├── simple-compass.tsx              ✨ 简单罗盘
├── standard-compass.tsx            ✨ 标准罗盘
├── compass-demo.tsx                ✨ 演示组件
├── theme-selector.tsx              ✨ 主题选择
├── with-chat-context.tsx           ✨ 聊天上下文
└── index.ts                        ✨ 统一导出
```

### 2. 罗盘核心库 (Compass Library)
```
源目录: D:\test\qiflow-ai\src\lib\compass\
目标目录: D:\test\mksaas_qiflowai\src\lib\compass\

需要检查和移植的文件
```

### 3. 分析页面组件
```
源目录: D:\test\qiflow-ai\src\components\analysis\
目标目录: D:\test\mksaas_qiflowai\src\components\qiflow\analysis\

需移植文件:
├── enhanced-guest-analysis-page.tsx       ✨ 增强访客分析页面
├── guest-analysis-page.tsx                ✨ 访客分析页面
├── compass-analysis-result-page.tsx       ✨ 罗盘分析结果页
├── enhanced-fengshui-analysis-result.tsx  ✅ 已移植
└── 其他风水相关组件                        🔍 需检查
```

### 4. 表单组件
```
源目录: D:\test\qiflow-ai\src\components\forms\
目标目录: D:\test\mksaas_qiflowai\src\components\qiflow\forms\

需检查的表单:
├── user-profile-form*.tsx          🔍 用户资料表单
├── house-template-form*.tsx        🔍 房屋模板表单
├── floorplan-upload-form*.tsx      🔍 平面图上传表单
└── 其他相关表单                     🔍 需检查
```

### 5. 路由页面
```
源目录: D:\test\qiflow-ai\src\app\
目标目录: D:\test\mksaas_qiflowai\src\app\

需移植的页面路由:
├── test-guest/                     ✨ 访客测试入口
├── compass-analysis-result/         ✨ 罗盘分析结果
└── 其他风水相关路由                  🔍 需检查
```

---

## 移植执行步骤

### 第一阶段：核心罗盘组件
- [ ] 复制 compass 库文件
- [ ] 复制 compass 组件文件
- [ ] 更新导入路径
- [ ] 添加暗黑模式支持

### 第二阶段：分析页面
- [ ] 复制访客分析页面
- [ ] 复制罗盘分析结果页
- [ ] 更新路由配置
- [ ] 添加暗黑模式支持

### 第三阶段：表单系统
- [ ] 检查并复制用户资料表单
- [ ] 检查并复制房屋模板选择
- [ ] 检查并复制平面图上传
- [ ] 添加暗黑模式支持

### 第四阶段：集成测试
- [ ] 测试完整流程
- [ ] 修复导入错误
- [ ] 验证功能完整性
- [ ] 优化用户体验

---

## 批量复制命令

### 复制罗盘组件
```powershell
# 创建目标目录
New-Item -Path "D:\test\mksaas_qiflowai\src\components\compass" -ItemType Directory -Force

# 复制所有罗盘组件
Copy-Item -Path "D:\test\qiflow-ai\src\components\compass\*" -Destination "D:\test\mksaas_qiflowai\src\components\compass\" -Recurse -Force
```

### 复制罗盘库
```powershell
# 创建目标目录
New-Item -Path "D:\test\mksaas_qiflowai\src\lib\compass" -ItemType Directory -Force

# 复制罗盘库文件
Copy-Item -Path "D:\test\qiflow-ai\src\lib\compass\*" -Destination "D:\test\mksaas_qiflowai\src\lib\compass\" -Recurse -Force
```

### 复制分析页面
```powershell
# 复制访客分析页面
Copy-Item -Path "D:\test\qiflow-ai\src\components\analysis\enhanced-guest-analysis-page.tsx" -Destination "D:\test\mksaas_qiflowai\src\components\qiflow\analysis\" -Force

Copy-Item -Path "D:\test\qiflow-ai\src\components\analysis\guest-analysis-page.tsx" -Destination "D:\test\mksaas_qiflowai\src\components\qiflow\analysis\" -Force

Copy-Item -Path "D:\test\qiflow-ai\src\components\analysis\compass-analysis-result-page.tsx" -Destination "D:\test\mksaas_qiflowai\src\components\qiflow\analysis\" -Force
```

### 创建路由页面
```powershell
# 创建访客测试路由
New-Item -Path "D:\test\mksaas_qiflowai\src\app\[locale]\(marketing)\test-guest" -ItemType Directory -Force

# 创建罗盘分析结果路由
New-Item -Path "D:\test\mksaas_qiflowai\src\app\[locale]\(marketing)\compass-analysis-result" -ItemType Directory -Force
```

---

## 需要注意的问题

### 1. 导入路径更新
所有从 `@/components/compass/` 导入的需要保持不变
所有从 `@/lib/compass/` 导入的需要保持不变
所有从 `@/components/analysis/` 导入的需要改为 `@/components/qiflow/analysis/`

### 2. 暗黑模式适配
所有新移植的组件需要添加 `dark:` 前缀来支持暗黑模式

### 3. 依赖检查
- 罗盘组件可能依赖特定的库（如 Konva, Canvas API）
- 需要检查 package.json 是否包含所需依赖
- 可能需要安装额外的包

### 4. API端点
- 检查是否有 API 路由需要移植
- 确保所有 API 调用路径正确

---

## 预估工作量

| 任务 | 文件数量 | 预估时间 |
|------|----------|----------|
| 罗盘组件 | 12个 | 30分钟 |
| 罗盘库 | 待查 | 20分钟 |
| 分析页面 | 3个 | 15分钟 |
| 表单组件 | 待查 | 20分钟 |
| 路由配置 | 2个 | 10分钟 |
| 测试修复 | N/A | 30分钟 |
| **总计** | **17+** | **2小时** |

---

## 下一步行动

1. ✅ 执行批量复制命令
2. ✅ 更新导入路径
3. ✅ 添加暗黑模式支持
4. ✅ 创建路由页面
5. ✅ 测试完整流程
6. ✅ 修复所有错误
7. ✅ 生成最终报告

---

生成时间: 2025-01-06  
状态: 📝 计划中
