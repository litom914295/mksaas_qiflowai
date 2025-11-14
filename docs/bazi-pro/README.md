# BaZi-Pro 八字分析系统文档

> 企业级八字(四柱)计算和五行分析系统，提供高精度真太阳时计算、灵活配置和缓存优化。

## 📚 文档导航

### 🚀 快速开始

新用户建议按以下顺序阅读：

1. **[5分钟快速入门](getting-started/quick-start.md)** 📚  
   最简单的使用示例，5分钟上手

2. **[安装配置指南](getting-started/installation.md)** 📖  
   详细的安装步骤和环境配置

3. **[基础概念](getting-started/basic-concepts.md)** 📖  
   八字系统的核心概念和术语

### 📖 使用指南

深入了解各个功能模块：

- **[配置系统](guides/configuration.md)** 🔧  
  完整的配置系统说明，包括3种预设配置和自定义配置

- **[四柱计算](guides/four-pillars.md)** 📖  
  年月日时四柱的精确计算，包含真太阳时和节气处理

- **[五行分析](guides/wuxing-analysis.md)** 📖  
  五行旺衰分析和得分计算方法

- **[纳音系统](guides/nayin.md)** 📖  
  六十甲子纳音五行的查询和应用

- **[性能优化](guides/performance.md)** 💡  
  缓存策略和性能调优建议

### 🔧 API参考

详细的API文档和参数说明：

- **[BaziCalculator](api/calculator.md)** 🔧  
  四柱计算器核心API

- **[WuxingStrengthAnalyzer](api/analyzer.md)** 🔧  
  五行旺衰分析器API

- **[BaziConfigManager](api/config-manager.md)** 🔧  
  配置管理器API

- **[类型定义](api/types.md)** 🔧  
  TypeScript类型定义完整参考

### 💡 最佳实践

生产环境使用建议：

- **[配置选择](best-practices/configuration.md)** 💡  
  如何选择合适的配置预设

- **[错误处理](best-practices/error-handling.md)** 💡  
  优雅的错误处理和异常恢复

- **[性能优化](best-practices/performance.md)** 💡  
  缓存、并发和性能调优

- **[测试实践](best-practices/testing.md)** 💡  
  单元测试和集成测试建议

### 🚨 故障排查

遇到问题？查看这里：

- **[常见问题](troubleshooting/common-issues.md)** 🚨  
  最常见的问题和解决方案

- **[调试技巧](troubleshooting/debugging.md)** 🚨  
  如何定位和解决问题

- **[FAQ](troubleshooting/faq.md)** 🚨  
  常见问答集合

### 🏗️ 架构设计

了解系统内部：

- **[架构概览](architecture/overview.md)** 🏗️  
  系统整体架构和设计思想

- **[模块设计](architecture/modules.md)** 🏗️  
  各模块职责和交互方式

- **[算法说明](architecture/algorithms.md)** 🏗️  
  核心算法的实现原理

## 📊 功能特性

### ✨ 核心功能

- ✅ **高精度计算** - 真太阳时精度±30秒（行业领先75%）
- ✅ **灵活配置** - 3种预设配置+无限自定义（子平/现代/传统）
- ✅ **智能缓存** - LRU缓存机制，性能提升50%+
- ✅ **完整验证** - 217+测试用例，95%+覆盖率
- ✅ **类型安全** - 100% TypeScript，运行时Zod验证
- ✅ **权威数据** - 所有常量表均经传统典籍验证

### 📦 技术栈

- **语言**: TypeScript 5.x
- **框架**: Next.js 15.x
- **运行时验证**: Zod
- **日期处理**: date-fns, date-fns-tz
- **农历**: lunar-javascript
- **测试**: Vitest

## 🎯 快速示例

```typescript
import { BaziCalculator } from '@/lib/bazi-pro/core/calculator/bazi-calculator';
import { WuxingStrengthAnalyzer } from '@/lib/bazi-pro/core/analyzer/wuxing-strength';

// 1. 计算四柱
const calculator = new BaziCalculator();
const result = calculator.calculate({
  date: '1990-06-15',
  time: '14:30',
  longitude: 120.15,  // 杭州经度
  isLunar: false,
  gender: 'male'
});

console.log(result.fourPillars);
// { year: {gan: '庚', zhi: '午'}, month: {gan: '壬', zhi: '午'}, ... }

// 2. 分析五行旺衰
const analyzer = new WuxingStrengthAnalyzer();
const analysis = analyzer.analyzeFull(result);

console.log(analysis.dayMasterStrength);
// { element: '壬', strength: 6.5, status: 'weak', ... }
```

## 🔗 相关资源

### 开发文档
- [开发者指南](../bazi-pro-internals/README.md) - 面向维护者的内部文档
- [进展报告归档](../bazi-pro-internals/development/progress/) - 历史开发记录

### 外部资源
- [项目GitHub](https://github.com/litom914295/qiflowai)
- [项目主页](https://qiflow.ai)
- [问题反馈](https://github.com/litom914295/qiflowai/issues)

### 传统典籍参考
- 《渊海子平》 - 宋代徐子平
- 《三命通会》 - 明代万民英
- 《滴天髓》 - 清代刘伯温
- 《穷通宝鉴》 - 清代余春台

## 📝 贡献指南

欢迎贡献代码、文档或反馈问题！

1. Fork项目仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](../../LICENSE) 文件

## 💬 获取帮助

- 📧 **邮件**: support@qiflow.ai
- 💬 **问题**: [GitHub Issues](https://github.com/litom914295/qiflowai/issues)
- 📖 **文档**: 您正在阅读的内容
- 🚨 **FAQ**: [常见问题解答](troubleshooting/faq.md)

---

**最后更新**: 2025-11-13  
**文档版本**: 1.0.0  
**系统版本**: BaZi-Pro v1.0.0 (Mid-Term Complete)
