# 🌍 QiFlow AI - 国际化快速参考卡

**最后更新：** 2025-01-23  
**状态：** ✅ 生产就绪

---

## 📊 当前状态一览

| 指标 | 状态 |
|------|------|
| 支持语言 | 6 种 ✅ |
| 翻译覆盖率 | 100% ✅ |
| 占位符 | 0 个 ✅ |
| 定价页面 | 全部翻译 ✅ |
| 生产就绪 | 是 ✅ |

---

## 🌐 支持的语言

| 代码 | 语言 | 状态 |
|------|------|------|
| zh-CN | 简体中文 🇨🇳 | ✅ 默认 |
| zh-TW | 繁体中文 🇹🇼 | ✅ |
| en | English 🇺🇸 | ✅ |
| ja | 日本語 🇯🇵 | ✅ |
| ko | 한국어 🇰🇷 | ✅ |
| ms-MY | Bahasa Melayu 🇲🇾 | ✅ **新修复** |

---

## 🛠️ 常用命令

### 审计翻译
```bash
node scripts/i18n-audit-fix.js
```

### 自动修复
```bash
node scripts/i18n-audit-fix.js --fix
```

### 修复马来语占位符
```bash
node scripts/fix-ms-my-translations.js
```

---

## 📁 文件位置

### 翻译文件
```
src/locales/
├── zh-CN/common.json  (简体中文)
├── zh-TW/common.json  (繁体中文)
├── en/common.json     (英文)
├── ja/common.json     (日语)
├── ko/common.json     (韩语)
└── ms-MY/common.json  (马来语)
```

### 配置文件
```
src/
├── i18n/routing.ts           (路由配置)
├── middleware.ts             (语言中间件)
└── config/website.ts         (语言定义)
```

### 文档
```
docs/i18n-implementation-guide.md  (实施指南)
qiflowai/dashboards/
├── translation-fix-complete-report.md
├── i18n-integration-report.md
└── i18n-audit-report.json
```

---

## 🎯 关键翻译键（定价页面）

```json
{
  "PricingPage": {
    "monthly": "月付/Bulanan/Monthly...",
    "yearly": "年付/Tahunan/Yearly...",
    "mostPopular": "最受欢迎/Paling Popular...",
    "currentPlan": "当前套餐/Pelan Semasa...",
    "upgradeTo": "升级到/Naik Taraf ke..."
  }
}
```

---

## ✅ 验证检查清单

- [x] 所有6种语言翻译完整
- [x] 占位符全部清除
- [x] JSON 格式正确
- [x] 定价页面翻译验证
- [x] 关键页面抽查
- [x] 审计脚本验证通过
- [ ] 生产环境部署
- [ ] 用户测试

---

## 🚨 故障排查

### 问题：翻译未显示
**解决：**
1. 检查翻译键是否存在
2. 确认语言代码正确
3. 验证 JSON 文件格式

### 问题：占位符显示
**解决：**
```bash
node scripts/i18n-audit-fix.js --fix
```

### 问题：语言切换失败
**解决：**
1. 检查中间件配置
2. 验证路由前缀
3. 清除浏览器缓存

---

## 📞 联系信息

**项目：** QiFlow AI  
**文档：** `docs/i18n-implementation-guide.md`  
**报告：** `TRANSLATION_FIX_SUMMARY.md`

---

**© 2025 QiFlow AI**
