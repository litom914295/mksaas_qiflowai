# 表单国际化翻译完成清单

## 📋 实施摘要

### 已完成项
- ✅ 创建并运行 `update-form-i18n.js` 脚本
- ✅ 为所有 6 种语言添加 `form` 翻译键
- ✅ 更新 `HeroWithForm.tsx` 组件使用 `tForm` 翻译函数
- ✅ 移除所有硬编码的中文文本

### 支持的语言
1. ✅ 简体中文 (zh-CN)
2. ✅ 繁体中文 (zh-TW)
3. ✅ 英语 (en)
4. ✅ 日语 (ja)
5. ✅ 韩语 (ko)
6. ✅ 马来语 (ms)

---

## 🗂️ 翻译键结构

所有翻译键都在 `form` 命名空间下：

```typescript
form: {
  title: string              // 表单标题
  name: string              // 姓名标签
  namePlaceholder: string   // 姓名占位符
  gender: string            // 性别标签
  male: string              // 男性选项
  female: string            // 女性选项
  birthCity: string         // 出生城市标签
  birthCityPlaceholder: string  // 城市占位符
  solarTime: string         // 真太阳时提示
  birthDate: string         // 出生日期标签
  solar: string             // 阳历选项
  lunar: string             // 阴历选项
  birthTime: string         // 出生时间标签
  timeMorning: string       // 上午按钮
  timeAfternoon: string     // 下午按钮
  timeEvening: string       // 晚上按钮
  timeMorningTooltip: string    // 上午工具提示
  timeAfternoonTooltip: string  // 下午工具提示
  timeEveningTooltip: string    // 晚上工具提示
  lunarNote: string         // 阴历转换提示
  submitButton: string      // 提交按钮文本
}
```

---

## 🧪 测试清单

### 1. 语言切换测试

对于**每种语言**，验证以下内容：

#### 中文（zh-CN）
- [ ] 表单标题显示"开始命理之旅 · 免费体验"
- [ ] 姓名字段标签为"姓名"
- [ ] 性别选项为"男"和"女"
- [ ] 出生城市标签为"出生城市"，带"(真太阳时)"提示
- [ ] 日历类型显示"阳历"和"阴历"
- [ ] 时间快捷按钮为"上午"、"下午"、"晚上"
- [ ] 提交按钮显示"开始分析"

#### 繁体中文（zh-TW）
- [ ] 表单标题显示"開始命理之旅 · 免費體驗"
- [ ] 姓名字段标签为"姓名"
- [ ] 性别选项为"男"和"女"
- [ ] 出生城市标签为"出生城市"，带"(真太陽時)"提示
- [ ] 日历类型显示"陽曆"和"陰曆"
- [ ] 时间快捷按钮为"上午"、"下午"、"晚上"
- [ ] 提交按钮显示"開始分析"

#### 英语（en）
- [ ] 表单标题显示"Start Your Journey · Free Experience"
- [ ] 姓名字段标签为"Name"
- [ ] 性别选项为"Male"和"Female"
- [ ] 出生城市标签为"Birth City"，带"(Solar Time)"提示
- [ ] 日历类型显示"Solar"和"Lunar"
- [ ] 时间快捷按钮为"Morning"、"Afternoon"、"Evening"
- [ ] 提交按钮显示"Start Analysis"

#### 日语（ja）
- [ ] 表单标题显示"運命の旅を始めよう · 無料体験"
- [ ] 姓名字段标签为"氏名"
- [ ] 性别选项为"男性"和"女性"
- [ ] 出生城市标签为"出生地"，带"(真太陽時)"提示
- [ ] 日历类型显示"太陽暦"和"太陰暦"
- [ ] 时间快捷按钮为"午前"、"午後"、"夜"
- [ ] 提交按钮显示"分析開始"

#### 韩语（ko）
- [ ] 表单标题显示"운명의 여정 시작 · 무료 체험"
- [ ] 姓名字段标签为"이름"
- [ ] 性别选项为"남성"和"여성"
- [ ] 出生城市标签为"출생 도시"，带"(진태양시)"提示
- [ ] 日历类型显示"양력"和"음력"
- [ ] 时间快捷按钮为"오전"、"오후"、"저녁"
- [ ] 提交按钮显示"분석 시작"

#### 马来语（ms）
- [ ] 表单标题显示"Mulakan Perjalanan · Percubaan Percuma"
- [ ] 姓名字段标签为"Nama"
- [ ] 性别选项为"Lelaki"和"Perempuan"
- [ ] 出生城市标签为"Bandar Lahir"，带"(Masa Suria)"提示
- [ ] 日历类型显示"Solar"和"Lunar"
- [ ] 时间快捷按钮为"Pagi"、"Petang"、"Malam"
- [ ] 提交按钮显示"Mula Analisis"

### 2. 交互测试

- [ ] 切换语言时，表单中所有文本立即更新
- [ ] 占位符文本使用正确的语言
- [ ] 工具提示（hover）显示正确的语言
- [ ] 选择阴历时，提示文本使用正确的语言
- [ ] 表单验证消息（如有）使用正确的语言

### 3. 时间选择器测试

对于每种语言：
- [ ] 时间快捷按钮显示正确翻译
- [ ] Hover 提示显示时辰范围（如"卯辰巳午 (05:00-13:00)"）
- [ ] 点击按钮后，正确设置时间默认值

### 4. 响应式测试

- [ ] 桌面端：所有翻译文本正确显示且不溢出
- [ ] 平板端：布局保持完整，翻译文本适配良好
- [ ] 移动端：文本正确换行，无截断

---

## 🔧 文件修改记录

### 新建文件
1. `update-form-i18n.js` - 批量更新翻译脚本

### 修改文件
1. `src/locales/zh-CN.json` - 添加 `form` 翻译键
2. `src/locales/zh-TW.json` - 添加 `form` 翻译键
3. `src/locales/en.json` - 添加 `form` 翻译键
4. `src/locales/ja.json` - 添加 `form` 翻译键
5. `src/locales/ko.json` - 添加 `form` 翻译键
6. `src/locales/ms.json` - 添加 `form` 翻译键
7. `src/components/home/HeroWithForm.tsx` - 使用 `tForm` 替换硬编码文本

---

## 📝 使用说明

### 开发者指南

1. **添加新的表单翻译**：
   ```typescript
   // 在所有语言文件的 form 对象中添加新键
   form: {
     ...existingKeys,
     newKey: 'translated text'
   }
   ```

2. **在组件中使用翻译**：
   ```tsx
   const tForm = useTranslations('form');
   
   // 使用翻译键
   <Label>{tForm('newKey')}</Label>
   ```

3. **动态构建翻译键**（用于时间按钮）：
   ```tsx
   {tForm(`time${period.value.charAt(0).toUpperCase() + period.value.slice(1)}Tooltip`)}
   ```

---

## ✅ 验收标准

### 必须通过项
1. ✅ 所有6种语言的翻译文件包含完整的 `form` 翻译键
2. ✅ `HeroWithForm.tsx` 中不存在硬编码的中文字符串
3. ✅ 切换语言后，表单中所有UI元素正确更新
4. ✅ 占位符、工具提示、提示文本全部国际化
5. ✅ 翻译内容准确、自然，无机翻痕迹

### 建议优化项
- [ ] 考虑为不同地区定制示例（如出生城市占位符）
- [ ] 添加语言切换时的平滑过渡动画
- [ ] 为长文本语言（如德语、俄语）预留更多空间

---

## 🚀 后续优化建议

1. **翻译质量改进**
   - 邀请母语者审核翻译
   - 调整专业术语的本地化表达
   - 优化时辰术语的外语翻译

2. **性能优化**
   - 实现翻译文件的懒加载
   - 添加翻译缓存机制

3. **用户体验提升**
   - 添加语言自动检测
   - 记住用户的语言偏好
   - 提供更多地区特定的默认值

---

**最后更新**: 2025-01-XX  
**测试负责人**: [待填写]  
**审核状态**: ⏳ 待验收
