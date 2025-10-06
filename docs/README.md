# QiFlow AI 项目文档

欢迎来到 QiFlow AI 项目文档中心。这里包含了项目的各种技术文档、指南和参考资料。

---

## 📚 文档索引

### 国际化路由 (i18n Routes)

本项目使用 `next-intl` 实现完整的国际化路由支持。以下文档帮助你正确使用国际化路由：

#### 🚀 [快速参考卡片](./i18n-routes-cheatsheet.md)
- **用途：** 快速查询不同场景下如何使用国际化路由
- **推荐：** 开发时保持打开，随时查阅
- **内容：**
  - 快速决策树（帮你选择正确的工具）
  - 常用代码片段（复制粘贴即用）
  - 常见错误和修复方法
  - Routes 枚举速查表
  - 调试技巧

#### 📖 [完整使用指南](./i18n-routes-guide.md)
- **用途：** 深入理解国际化路由的工作原理和最佳实践
- **推荐：** 新成员加入时必读
- **内容：**
  - 核心问题和解决方案
  - 6 种使用场景的详细说明
  - 常见场景示例（导航菜单、条件跳转、API 重定向等）
  - 特殊情况处理（外部链接、锚点、已有 locale 的路径）
  - 迁移指南（从旧代码迁移到新方案）
  - 代码审查检查清单

#### 📊 [实施总结](./i18n-routes-implementation-summary.md)
- **用途：** 了解已完成的工作和未来优化方向
- **推荐：** 项目维护者和新加入开发者
- **内容：**
  - 已完成工作清单
  - 待优化项目
  - 改进效果评估
  - 未来扩展建议
  - 测试和性能监控指南
  - 更新日志

---

## 🎯 快速开始

### 我是新开发者，应该从哪里开始？

1. **第一步：** 阅读 [快速参考卡片](./i18n-routes-cheatsheet.md)（5分钟）
   - 了解基本概念和快速决策树
   - 收藏常用代码片段

2. **第二步：** 根据需要查阅 [完整使用指南](./i18n-routes-guide.md)（15分钟）
   - 理解不同场景的使用方式
   - 学习最佳实践

3. **第三步：** 开始编码
   - 遇到问题时回查快速参考卡片
   - 使用指南中的检查清单进行代码审查

### 我想了解项目的整体规划？

阅读 [实施总结](./i18n-routes-implementation-summary.md)，了解：
- 已完成的功能
- 待优化项
- 未来扩展方向

---

## 🔧 核心工具

### `@/lib/i18n-routes`

项目的国际化路由工具库，提供以下函数：

| 函数 | 适用场景 | 说明 |
|------|---------|------|
| `getLocalizedRoute(route, locale?)` | 服务端组件、Server Actions | 基础函数，需要显式传入 locale |
| `useLocaleRoute(route)` | 客户端组件（需要 URL 字符串） | Hook，自动检测当前 locale |
| `getLocalizedRouteFromRequest(route, request)` | API 路由 | 从请求中自动检测 locale |
| `createLocalizedRoutes(locale?)` | 批量生成 | 生成指定 locale 下的所有路由 |

### `@/i18n/navigation`

`next-intl` 提供的导航工具：

| 导出 | 说明 |
|------|------|
| `LocaleLink` | 替代 `next/link` 的国际化链接组件 |
| `useLocaleRouter` | 替代 `next/navigation` 的 `useRouter` |
| `useLocalePathname` | 获取当前路径（不含 locale） |
| `localeRedirect` | 服务端重定向 |
| `getLocalePathname` | 获取指定路由的 locale 路径 |

---

## 📋 常见问题 (FAQ)

### Q: 为什么不能直接使用 `<a href="/ai/chat">`？

**A:** 因为项目使用国际化路由，所有路径都需要带上 locale 前缀（如 `/zh-CN/ai/chat`）。直接使用 `/ai/chat` 会导致 404 错误。

**解决方案：** 使用 `<LocaleLink href="/ai/chat">`，它会自动添加正确的 locale 前缀。

---

### Q: 客户端和服务端使用的函数有什么区别？

**A:** 
- **客户端：** 使用 `useLocaleRoute()`，可以自动从浏览器 URL 中检测当前 locale
- **服务端：** 使用 `getLocalizedRoute()`，需要显式传入 `params.locale`

---

### Q: API 路由如何自动检测用户的语言偏好？

**A:** 使用 `getLocalizedRouteFromRequest(route, request)`，它会按以下优先级检测：
1. Cookie 中的 `NEXT_LOCALE`
2. `Accept-Language` header
3. 默认 locale (`zh-CN`)

---

### Q: 外部链接和锚点链接需要特殊处理吗？

**A:** 不需要。工具函数会自动识别：
- 以 `http://` 或 `https://` 开头的外部链接
- 以 `#` 开头的锚点链接

这些链接会被原样返回，不会添加 locale 前缀。

---

### Q: 如何确保我的代码正确使用了国际化路由？

**A:** 参考 [完整使用指南](./i18n-routes-guide.md) 中的"检查清单"章节，包含：
- 链接组件的正确使用
- URL 生成函数的选择
- 硬编码路径的识别
- 测试建议

---

## 🛠️ 开发工具

### VS Code 代码片段

可以将 [快速参考卡片](./i18n-routes-cheatsheet.md) 中的代码片段添加到 VS Code snippets 配置中，提高开发效率。

### ESLint 规则（建议）

添加以下 ESLint 规则，避免错误使用：

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // 禁止直接导入 next/link（除非是外部链接）
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'next/link',
            message: '请使用 @/i18n/navigation 中的 LocaleLink',
          },
        ],
      },
    ],
  },
};
```

---

## 📝 贡献指南

### 添加新文档

1. 在 `docs/` 目录下创建新的 Markdown 文件
2. 更新本 README 的文档索引
3. 提交 Pull Request

### 更新现有文档

1. 确保更新日期和版本号
2. 如果是重大更新，在"更新日志"中记录
3. 提交 Pull Request

---

## 📞 获取帮助

- **查看文档：** 首先查阅相关文档
- **搜索 Issues：** 在 GitHub Issues 中搜索类似问题
- **提问：** 如果找不到答案，创建新 Issue
- **联系团队：** 在团队聊天频道询问

---

## 📚 外部资源

- [Next.js 国际化文档](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [next-intl 官方文档](https://next-intl-docs.vercel.app/)
- [React 国际化最佳实践](https://react.i18next.com/)
- [MDN - Accept-Language](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language)

---

## 🎯 文档路线图

### 即将添加的文档：

- [ ] API 参考手册
- [ ] 组件库文档
- [ ] 部署指南
- [ ] 性能优化指南
- [ ] 安全最佳实践
- [ ] 测试策略文档

### 持续改进：

- [x] 国际化路由文档（v1.0）
- [ ] 增加更多实际案例
- [ ] 添加视频教程
- [ ] 多语言版本（英文）

---

**最后更新：** 2024年（当前日期）  
**维护者：** QiFlow AI 开发团队

**文档版本：** v1.0.0
