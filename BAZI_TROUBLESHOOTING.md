# 八字分析页面问题排查指南

## 问题：四柱数据不显示

### 已完成的修复 ✅

1. **数据兼容性修复**
   - 文件：`src/lib/bazi/normalize.ts`
   - 修改：`extractPillarInfo` 函数现在同时支持 `gan/zhi` 和 `stem/branch`
   - 行号：328-350

2. **类型错误修复**
   - BaziCacheAdapter.set 方法参数
   - integrate-pro.ts 中的 getCacheStats 调用
   - 神煞对象属性名统一为 description
   - BaziFormData 接口定义

### 排查步骤

#### 1. 检查浏览器控制台

打开浏览器开发者工具（F12），查看 Console 标签：

**应该看到的日志：**
```
[Pro Calculator] 开始专业级八字计算
[Pro Calculator] 四柱计算完成: {year: {...}, month: {...}, ...}
[Pro Calculator] 四柱验证通过: 年=甲子 月=丙寅 日=戊辰 时=庚午
[normalize] 原始四柱数据: {...}
[extractPillarInfo] 提取结果: {heavenlyStem: "甲", earthlyBranch: "子", ...}
```

**如果看到错误：**
- `无法读取 undefined 的属性` → 检查数据传递
- `计算失败` → 查看具体错误信息
- `归一化失败` → 检查 normalize.ts

#### 2. 检查数据传递

在 `src/app/[locale]/(routes)/report/page.tsx` 中：

**验证 formData：**
```javascript
console.log('📊 Form Data:', formData);
console.log('📊 Personal Data:', personalData);
```

**应该包含：**
```javascript
{
  personal: {
    name: "张三",
    gender: "male",
    birthDate: "1990-05-15",
    birthTime: "14:30",
    birthCity: "北京"
  }
}
```

#### 3. 检查八字计算

在 `BaziAnalysisPage` 组件中添加日志：

```javascript
useEffect(() => {
  console.log('🔍 BaziAnalysisPage - birthData:', birthData);
  analyzeBazi();
}, [analyzeBazi]);
```

#### 4. 验证计算结果

在 `normalize.ts` 的 `normalizeBaziResult` 函数开始处：

```javascript
export function normalizeBaziResult(...) {
  console.log('📥 接收到的 result:', result);
  console.log('📥 四柱数据:', result?.pillars);
  // ...
}
```

### 常见问题和解决方案

#### 问题 1：四柱显示为空

**症状：** UI 显示空白的四柱格子

**原因：**
- 数据属性名不匹配（gan/zhi vs stem/branch）
- normalize 函数提取失败

**解决：**
1. 检查 `normalize.ts` 第 328-350 行
2. 确认已应用兼容性修复
3. 查看控制台日志确认数据结构

#### 问题 2：计算失败

**症状：** 显示"八字分析失败"错误

**原因：**
- 日期格式不正确
- 缺少必要的库或模块
- lunar-javascript 未正确加载

**解决：**
1. 确认日期格式为 `YYYY-MM-DDTHH:mm`
2. 检查 `node_modules/lunar-javascript` 是否存在
3. 运行 `npm install` 重新安装依赖

#### 问题 3：数据未传递到组件

**症状：** birthData 为 null 或 undefined

**原因：**
- sessionStorage 数据丢失
- URL 参数未正确解析
- localStorage 历史记录为空

**解决：**
1. 在首页表单填写完整信息
2. 检查 localStorage 是否启用
3. 确认表单提交后正确跳转

### 数据流程图

```
用户输入表单
    ↓
sessionStorage 保存
    ↓
跳转到 /report
    ↓
Report Page 读取数据
    ↓
传递给 BaziAnalysisPage
    ↓
调用 computeBaziSmart
    ↓
ProfessionalBaziCalculator.calculateProfessional
    ↓
FourPillarsCalculator.calculate
    ↓
返回 EnhancedBaziResult (包含 gan/zhi)
    ↓
normalizeBaziResult 转换
    ↓
返回 BaziAnalysisModel
    ↓
UI 组件渲染四柱
```

### 测试命令

```bash
# 类型检查
npm run type-check

# 开发服务器
npm run dev

# 构建检查
npm run build
```

### 关键文件位置

- 四柱计算：`src/lib/bazi-pro/core/calculator/four-pillars.ts`
- 专业计算器：`src/lib/bazi/integrate-pro.ts`
- 数据归一化：`src/lib/bazi/normalize.ts`
- 分析页面：`src/components/bazi/analysis/bazi-analysis-page.tsx`
- 报告页面：`src/app/[locale]/(routes)/report/page.tsx`

### 需要检查的调试日志

启动开发服务器后，在浏览器控制台应该看到：

```
✅ [Pro Calculator] 专业级八字计算
📊 [normalize] 原始四柱数据
✅ [extractPillarInfo] 提取结果
```

如果缺少这些日志，说明某个环节出现问题。

### 联系支持

如果以上步骤都无法解决问题：

1. 截图完整的错误信息
2. 导出浏览器控制台日志
3. 提供测试数据（出生日期、时间、性别）
4. 记录复现步骤
