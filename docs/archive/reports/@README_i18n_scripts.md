# 国际化脚本使用说明

## 📁 新增文件清单

### 脚本文件
- `update-form-i18n.js` - 批量更新所有语言的表单翻译
- `verify-translations.js` - 验证翻译文件的完整性

### 文档文件
- `@SUMMARY_i18n_implementation.md` - 国际化实施总结
- `@DOCS_i18n_form_translation_checklist.md` - 详细测试清单
- `@README_i18n_scripts.md` - 本文档

---

## 🚀 快速开始

### 1. 验证翻译完整性

检查所有语言文件是否包含正确的翻译：

```bash
node verify-translations.js
```

**预期输出：**
```
🔍 验证表单翻译...

✅ zh-CN: 21 个翻译键
   标题示例: "开始命理之旅 · 免费体验"
   提交按钮: "开始分析"

✅ zh-TW: 21 个翻译键
...

🎉 所有语言翻译验证通过！
```

### 2. 更新表单翻译

如果需要修改或添加新的翻译：

1. 编辑 `update-form-i18n.js` 中的 `formTranslations` 对象
2. 运行更新脚本：

```bash
node update-form-i18n.js
```

**预期输出：**
```
✅ 已更新 zh-CN.json
✅ 已更新 zh-TW.json
✅ 已更新 en.json
✅ 已更新 ja.json
✅ 已更新 ko.json
✅ 已更新 ms.json

🎉 所有语言文件更新完成！
```

---

## 📖 文档说明

### @SUMMARY_i18n_implementation.md
**用途：** 国际化实施的完整总结
- 任务完成情况
- 实施细节
- 验证结果
- 使用方法
- 技术亮点

**适合：** 
- 项目经理了解进度
- 开发者快速上手
- 代码审查参考

### @DOCS_i18n_form_translation_checklist.md
**用途：** 详细的测试清单
- 每种语言的测试项
- 交互测试
- 响应式测试
- 验收标准

**适合：**
- QA 测试人员
- 手动测试验证
- 验收检查

---

## 🔧 修改翻译

### 添加新的翻译键

1. **编辑 update-form-i18n.js**：

```javascript
const formTranslations = {
  'zh-CN': {
    form: {
      // 现有键...
      newField: '新字段',          // 添加新键
      newFieldPlaceholder: '请输入新字段'
    }
  },
  'zh-TW': {
    form: {
      // 现有键...
      newField: '新欄位',
      newFieldPlaceholder: '請輸入新欄位'
    }
  },
  'en': {
    form: {
      // 现有键...
      newField: 'New Field',
      newFieldPlaceholder: 'Enter new field'
    }
  },
  // ... 其他语言
};
```

2. **运行更新脚本**：
```bash
node update-form-i18n.js
```

3. **验证更新**：
```bash
node verify-translations.js
```

4. **在组件中使用**：
```tsx
const tForm = useTranslations('form');

<Label>{tForm('newField')}</Label>
<Input placeholder={tForm('newFieldPlaceholder')} />
```

### 修改现有翻译

1. 直接编辑对应语言的 JSON 文件：`src/locales/{locale}.json`
2. 找到 `form` 对象
3. 修改对应的键值
4. 保存并验证

---

## 🧪 测试流程

### 自动验证
```bash
# 验证所有翻译文件
node verify-translations.js

# 应该看到所有语言都有 21 个翻译键
```

### 手动测试
1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 访问首页表单

3. 切换语言（使用语言选择器）

4. 验证以下内容是否正确翻译：
   - 表单标题
   - 输入框标签
   - 占位符文本
   - 按钮文本
   - 工具提示（hover）

---

## 🛠️ 故障排查

### 问题：翻译键未显示，显示为 `form.xxx`

**原因：** 翻译文件中缺少该键

**解决方案：**
1. 运行 `node verify-translations.js` 检查
2. 确认所有语言文件都包含该键
3. 重启开发服务器

### 问题：某个语言翻译不正确

**解决方案：**
1. 打开对应的语言文件：`src/locales/{locale}.json`
2. 找到 `form` 对象
3. 修改对应键的值
4. 保存文件
5. 刷新浏览器

### 问题：运行脚本报错

**解决方案：**
1. 确认 Node.js 已安装（推荐 v18+）
2. 确认在项目根目录运行
3. 检查文件路径是否正确

---

## 📋 支持的语言列表

| 语言 | 代码 | 文件路径 |
|------|------|----------|
| 简体中文 | zh-CN | `src/locales/zh-CN.json` |
| 繁体中文 | zh-TW | `src/locales/zh-TW.json` |
| 英语 | en | `src/locales/en.json` |
| 日语 | ja | `src/locales/ja.json` |
| 韩语 | ko | `src/locales/ko.json` |
| 马来语 | ms | `src/locales/ms.json` |

---

## 💡 最佳实践

1. **修改前先验证**
   ```bash
   node verify-translations.js
   ```

2. **批量修改使用脚本**
   - 不要手动编辑6个文件
   - 使用 `update-form-i18n.js` 批量更新

3. **测试所有语言**
   - 不要只测试中文
   - 确保每种语言都显示正确

4. **保持翻译键同步**
   - 所有语言应有相同的键
   - 使用验证脚本检查

5. **翻译质量**
   - 避免机器翻译痕迹
   - 邀请母语者审核

---

## 🎯 下一步

如果需要添加更多表单字段的国际化：

1. 参考 `@DOCS_i18n_form_translation_checklist.md`
2. 修改 `update-form-i18n.js` 添加新键
3. 运行更新脚本
4. 在组件中使用新的翻译键
5. 运行验证脚本
6. 手动测试所有语言

---

**维护者：** 开发团队  
**最后更新：** 2025-01-XX  
**脚本版本：** 1.0.0
