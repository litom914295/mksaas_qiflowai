# QiFlow-AI 到 MKSaaS 迁移映射文档

## 项目状态分析

### QiFlow-AI 现有结构
```
qiflow-ai/
├── src/
│   ├── app/            # Next.js App Router
│   ├── components/     # UI组件
│   ├── lib/           # 核心逻辑库
│   │   ├── bazi/      # 八字算法
│   │   ├── fengshui/  # 风水算法
│   │   ├── compass/   # 罗盘功能
│   │   ├── ai/        # AI集成
│   │   └── ...
│   ├── i18n/          # 国际化配置
│   └── types/         # TypeScript类型定义
```

### MKSaaS 目标结构
```
mksaas/
├── src/
│   ├── app/[locale]/   # 国际化路由（待创建具体页面）
│   ├── components/     # 共享组件
│   ├── lib/           # 核心逻辑库
│   │   └── qiflow/    # QiFlow专用命名空间（待创建）
│   ├── actions/       # Server Actions
│   │   └── qiflow/    # QiFlow Server Actions（待创建）
│   ├── config/        # 配置文件
│   ├── db/           # 数据库
│   ├── i18n/         # 国际化
│   ├── payment/      # 支付系统
│   └── credits/      # 积分系统
```

## 详细迁移映射

### 1. 核心算法库迁移
| 源路径 | 目标路径 | 状态 | 说明 |
|--------|----------|------|------|
| `qiflow-ai/src/lib/bazi/` | `src/lib/qiflow/bazi/` | 待迁移 | 八字算法核心 |
| `qiflow-ai/src/lib/fengshui/` | `src/lib/qiflow/xuankong/` | 待迁移 | 玄空风水算法 |
| `qiflow-ai/src/lib/compass/` | `src/lib/qiflow/compass/` | 待迁移 | 罗盘置信度计算 |
| `qiflow-ai/src/lib/ai/` | `src/lib/qiflow/ai/` | 待迁移 | AI解读集成 |

### 2. UI组件迁移
| 源路径 | 目标路径 | 状态 | 说明 |
|--------|----------|------|------|
| `qiflow-ai/src/components/bazi/` | `src/components/qiflow/bazi/` | 待迁移 | 八字输入表单、结果展示 |
| `qiflow-ai/src/components/fengshui/` | `src/components/qiflow/xuankong/` | 待迁移 | 玄空风水表单、可视化 |
| `qiflow-ai/src/components/compass/` | `src/components/qiflow/compass/` | 待迁移 | 罗盘UI组件 |
| `qiflow-ai/src/components/reports/` | `src/components/qiflow/reports/` | 待迁移 | PDF报告生成 |

### 3. 页面路由迁移
| 源路径 | 目标路径 | 状态 | 说明 |
|--------|----------|------|------|
| `qiflow-ai/src/app/bazi` | `src/app/[locale]/analysis/bazi/` | 待创建 | 八字分析页面 |
| `qiflow-ai/src/app/fengshui` | `src/app/[locale]/analysis/xuankong/` | 待创建 | 玄空风水页面 |
| `qiflow-ai/src/app/compass` | `src/app/[locale]/tools/compass/` | 待创建 | 罗盘工具页面 |
| `qiflow-ai/src/app/reports` | `src/app/[locale]/reports/` | 待创建 | 报告查看页面 |

### 4. Server Actions迁移
| 功能 | 目标路径 | 状态 | 说明 |
|------|----------|------|------|
| 八字计算 | `src/actions/qiflow/calculate-bazi.ts` | 待创建 | 八字计算服务 |
| 风水分析 | `src/actions/qiflow/xuankong-analysis.ts` | 待创建 | 玄空风水分析 |
| 罗盘读取 | `src/actions/qiflow/compass-reading.ts` | 待创建 | 罗盘置信度计算 |
| AI解读 | `src/actions/qiflow/ai-interpretation.ts` | 待创建 | AI深度解读 |
| PDF导出 | `src/actions/qiflow/pdf-export.ts` | 待创建 | 报告生成导出 |

### 5. 数据库模型扩展
| 模型 | 文件位置 | 状态 | 说明 |
|------|----------|------|------|
| BaziCalculation | `src/db/schema-qiflow.ts` | 待创建 | 八字计算记录 |
| FengshuiAnalysis | `src/db/schema-qiflow.ts` | 待创建 | 风水分析记录 |
| CompassReading | `src/db/schema-qiflow.ts` | 待创建 | 罗盘读数记录 |
| PDFAudit | `src/db/schema-qiflow.ts` | 待创建 | PDF导出审计 |
| UserPreference | `src/db/schema-qiflow.ts` | 待创建 | 用户偏好设置 |

### 6. 配置文件
| 配置项 | 目标路径 | 状态 | 说明 |
|--------|----------|------|------|
| 定价配置 | `src/config/qiflow-pricing.ts` | 待创建 | 功能积分消耗配置 |
| 阈值配置 | `src/config/qiflow-thresholds.ts` | 待创建 | 罗盘置信度阈值 |
| AI模型配置 | `src/config/qiflow-ai.ts` | 待创建 | AI提供商配置 |
| 合规配置 | `src/config/qiflow-compliance.ts` | 待创建 | 年龄验证、免责声明 |

### 7. 关键集成点
| 集成项 | 文件位置 | 状态 | 说明 |
|--------|----------|------|------|
| 认证钩子 | `src/lib/qiflow/auth-hooks.ts` | 待创建 | Better Auth集成 |
| 支付集成 | `src/lib/qiflow/payment-integration.ts` | 待创建 | Stripe Credits集成 |
| i18n资源 | `src/locales/[locale]/qiflow.json` | 待创建 | 多语言文案 |
| 营销埋点 | `src/lib/qiflow/analytics.ts` | 待创建 | 事件追踪集成 |

## 迁移优先级

### 高优先级（Phase 1）
1. 数据库模型创建 `schema-qiflow.ts`
2. 核心算法库迁移（bazi、xuankong）
3. 基础配置文件（pricing、thresholds）
4. 认证集成钩子

### 中优先级（Phase 2）
1. UI组件迁移适配
2. Server Actions实现
3. 页面路由创建
4. i18n资源文件

### 低优先级（Phase 3）
1. 营销埋点集成
2. PDF导出功能
3. 罗盘高级功能
4. 性能优化

## 注意事项

### 依赖管理
- MKSaaS已包含`@aharris02/bazi-calculator-by-alvamind`依赖
- 需要验证其他特殊依赖兼容性
- 避免覆盖MKSaaS核心依赖版本

### 命名空间
- 所有QiFlow相关代码使用`qiflow`命名空间
- 避免与MKSaaS现有代码冲突
- 数据库表使用`qiflow_`前缀

### 路由规范
- 所有页面必须在`[locale]`目录下
- 使用next-intl进行国际化
- 遵循MKSaaS的路由命名规范

### 样式系统
- 统一使用Tailwind CSS
- 组件使用Shadcn UI和Radix UI
- 移动端优先响应式设计

## 验收标准
- [ ] 所有核心算法正常运行
- [ ] UI组件正确渲染无错误
- [ ] 认证流程完整对接
- [ ] 支付扣费正确执行
- [ ] i18n中英文切换正常
- [ ] 营销埋点正确触发
- [ ] 性能指标达标（LCP<2.5s）