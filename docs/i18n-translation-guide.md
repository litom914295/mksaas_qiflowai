# i18n 翻译指南

## 📊 当前状态

已完成 i18n 结构优化和简体中文翻译。

### 翻译进度

| 语言 | 文件 | 待翻译项 | 状态 |
|------|------|---------|------|
| 简体中文 | zh-CN.json | ~50 | ✅ 主要完成 |
| 繁体中文 | zh-TW.json | ~1600 | ⚠️ 待翻译 |
| 日语 | ja.json | ~1679 | ⚠️ 待翻译 |
| 韩语 | ko.json | ~1420 | ⚠️ 待翻译 |
| 马来语 | ms-MY.json | ~2123 | ⚠️ 待翻译 |

## 🚀 快速翻译方案

### 方案 1: 使用 AI 翻译工具（推荐）

1. **提取需要翻译的内容**:
   ```bash
   npx tsx scripts/extract-placeholders.ts
   ```

2. **查看提取的文件**:
   ```
   .taskmaster/i18n-translations/to-translate-{locale}.json
   ```

3. **使用 AI 工具翻译**:
   - 将 JSON 文件内容复制到 ChatGPT/Claude
   - 使用以下提示词：

```
请将以下 JSON 文件中的英文翻译为{目标语言}，保持 JSON 格式不变，只翻译 "value" 字段的内容。

注意：
1. 保留所有占位符（如 {userId}, {count} 等）
2. 保留技术术语（如 ID, API, URL 等）
3. 保持专有名词（如 QiFlow AI, Bazi 等）
4. 确保翻译自然流畅

[粘贴 JSON 内容]
```

4. **应用翻译结果**:
   - 将翻译后的内容保存为 `translated-{locale}.json`
   - 运行应用脚本（需要创建）

### 方案 2: 使用自动化脚本

参考 `scripts/apply-translations-zh-CN.ts` 创建其他语言的翻译脚本。

## 📝 简体中文翻译示例

已翻译的关键术语：

### 通用术语
- `Precise Algorithm` → `精准算法`
- `Privacy Protected` → `隐私保护`
- `Instant Analysis` → `即时分析`
- `Get Started` → `开始使用`
- `Dark` → `深色`
- `Light` → `浅色`
- `System` → `跟随系统`

### 八字相关
- `male` → `男`
- `female` → `女`
- `Bazi` → `八字`

### 罗盘相关
- `Calibrating...` → `校准中...`
- `Compass` → `罗盘`
- `direction` → `方向`
- `degree` → `度数`
- `measurement_history` → `测量历史`

### 报告相关
- `Overview` → `概览`
- `Details` → `详情`
- `Analysis` → `分析`
- `Recommendations` → `建议`
- `Export Report` → `导出报告`
- `Share Report` → `分享报告`

## 🛠️ 创建翻译脚本模板

### 繁体中文 (zh-TW)

```typescript
// scripts/apply-translations-zh-TW.ts
const translations = {
  'Precise Algorithm': '精準算法',
  'Privacy Protected': '隱私保護',
  'Instant Analysis': '即時分析',
  // ... 更多翻译
};
```

### 日语 (ja)

```typescript
// scripts/apply-translations-ja.ts
const translations = {
  'Precise Algorithm': '正確なアルゴリズム',
  'Privacy Protected': 'プライバシー保護',
  'Instant Analysis': '即時分析',
  // ... 更多翻译
};
```

### 韩语 (ko)

```typescript
// scripts/apply-translations-ko.ts
const translations = {
  'Precise Algorithm': '정밀한 알고리즘',
  'Privacy Protected': '개인 정보 보호',
  'Instant Analysis': '즉시 분석',
  // ... 更多翻译
};
```

### 马来语 (ms-MY)

```typescript
// scripts/apply-translations-ms-MY.ts
const translations = {
  'Precise Algorithm': 'Algoritma Tepat',
  'Privacy Protected': 'Privasi Dilindungi',
  'Instant Analysis': 'Analisis Segera',
  // ... 更多翻译
};
```

## 💡 翻译最佳实践

### 1. 保持一致性
- 同样的英文术语在整个应用中使用相同的翻译
- 参考已有的翻译作为标准

### 2. 上下文适配
- 根据使用场景调整翻译
- 按钮文字要简短有力
- 说明文字要清晰详细

### 3. 文化适应
- 考虑目标语言的文化习惯
- 避免直译，注重意译
- 数字和日期格式要符合本地习惯

### 4. 技术术语
- 常见技术术语保持原文（如 API, URL, ID）
- 品牌名称保持原文（如 QiFlow AI, GitHub, Google）

### 5. 占位符处理
- 保留所有占位符：`{userId}`, `{count}`, `{date}` 等
- 确保占位符在翻译后的文本中位置合理

### 6. 质量检查
- 使用母语者审查
- 在实际界面中测试
- 检查是否有文字溢出或布局问题

## 🔍 验证流程

### 1. 结构验证
```bash
npm run validate:i18n
```

### 2. 人工审查
- 在浏览器中切换语言
- 检查关键页面（首页、功能页、支付页）
- 确认文本显示正确

### 3. 功能测试
- 测试所有交互元素
- 确认表单验证信息
- 检查错误提示

## 📦 批量翻译工具推荐

### 在线工具
1. **ChatGPT/Claude**: 高质量AI翻译，适合大批量
2. **DeepL**: 专业翻译质量
3. **Google Translate API**: 自动化集成

### 本地工具
1. **i18n-ally** (VS Code 扩展): 可视化管理翻译
2. **localazy**: 翻译管理平台
3. **POEditor**: 协作翻译平台

## 🎯 优先级建议

### 高优先级（建议优先翻译）
1. ✅ 简体中文 (zh-CN) - 已完成
2. ⚠️ 繁体中文 (zh-TW) - 主要受众
3. ⚠️ 日语 (ja) - 相似文化背景

### 中优先级
4. ⚠️ 韩语 (ko) - 相似文化背景

### 低优先级
5. ⚠️ 马来语 (ms-MY) - 可根据需求决定

## 📞 获取帮助

如需翻译协助：
1. 查看 `scripts/extract-placeholders.ts` 提取待翻译内容
2. 参考 `scripts/apply-translations-zh-CN.ts` 创建新的翻译脚本
3. 使用 AI 工具进行批量翻译
4. 运行 `npm run validate:i18n` 验证

---

**文档版本**: v1.0.0  
**最后更新**: 2025-10-05
