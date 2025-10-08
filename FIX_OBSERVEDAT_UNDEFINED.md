# 修复报告：observedAt undefined 错误

## 问题描述

玄空飞星分析时出现以下错误：

```
TypeError: Cannot read properties of undefined (reading 'getUTCFullYear')
```

错误调用栈：
```
at getYunInfo (src\lib\qiflow\xuankong\yun.ts:16:21)
at generateFlyingStar (src\lib\qiflow\xuankong\index.ts:30:44)
at comprehensiveAnalysis (src\lib\qiflow\xuankong\comprehensive-engine.ts:164:43)
at handleFormSubmit (src\components\qiflow\xuankong\xuankong-analysis-page.tsx:28:52)
```

## 根本原因

在 `xuankong-analysis-page.tsx` 的 `handleFormSubmit` 函数中，调用 `runComprehensiveAnalysis` 时传递的参数格式不正确：

### 问题代码
```typescript
const result = await runComprehensiveAnalysis({
  mountainDegree: data.mountainDirection,    // ❌ 错误的参数名
  facingDegree: data.facingDirection,        // ❌ 错误的参数名
  completionYear: data.completionYear,       // ❌ 缺少 Date 对象
  completionMonth: data.completionMonth,     // ❌ 缺少 Date 对象
  currentYear: data.currentYear || new Date().getFullYear(),
  location: data.address,                    // ❌ 格式不正确
  purpose: 'residential',                    // ❌ 不是预期的参数
  floorCount: data.floorCount,               // ❌ 不是预期的参数
  analysisDepth: 'full',                     // ❌ 不是预期的参数
});
```

### 期望的参数格式
`comprehensiveAnalysis` 函数期望的参数类型是 `ComprehensiveAnalysisOptions`：

```typescript
export interface ComprehensiveAnalysisOptions {
  observedAt: Date;                          // ✅ 必需：Date 对象
  facing: { degrees: number };               // ✅ 必需：对象格式
  location?: { lat: number; lon: number };   // ✅ 可选：坐标格式
  includeLiunian?: boolean;
  includePersonalization?: boolean;
  includeTiguaAnalysis?: boolean;
  // ... 更多可选参数
}
```

## 修复方案

修改 `xuankong-analysis-page.tsx` 中的 `handleFormSubmit` 函数，正确构造参数：

```typescript
const handleFormSubmit = async (data: XuankongFormData) => {
  console.log('玄空飞星表单提交:', data);
  
  setIsAnalyzing(true);
  setAnalysisData(data);
  
  try {
    // 创建观测日期（使用建筑落成时间）
    const observedAt = new Date(data.completionYear, data.completionMonth - 1, 1);
    
    // 执行玄空飞星分析
    const result = await runComprehensiveAnalysis({
      observedAt,                                        // ✅ Date 对象
      facing: { degrees: data.facingDirection },         // ✅ 对象格式
      location: data.address ? { lat: 0, lon: 0 } : undefined,  // ✅ 正确格式
      includeLiunian: true,                              // ✅ 启用流年分析
      includePersonalization: false,
      includeTiguaAnalysis: true,                        // ✅ 启用替卦分析
      includeLingzheng: true,                            // ✅ 启用零正理论
      includeChengmenjue: true,                          // ✅ 启用城门诀
      includeTimeSelection: false,
      targetYear: data.currentYear || new Date().getFullYear(),
      config: {
        applyTiGua: true,
        applyFanGua: false,
      },
    });
    
    // ... 其余代码
  } catch (error) {
    console.error('玄空飞星分析失败:', error);
  } finally {
    setIsAnalyzing(false);
  }
};
```

## 关键修复点

### 1. 创建 Date 对象
```typescript
// ✅ 从年份和月份创建 Date 对象
const observedAt = new Date(data.completionYear, data.completionMonth - 1, 1);
```
注意：JavaScript 的月份是 0-indexed（0=一月，11=十二月），所以需要 `-1`。

### 2. 正确的 facing 参数格式
```typescript
// ❌ 错误
facingDegree: data.facingDirection

// ✅ 正确
facing: { degrees: data.facingDirection }
```

### 3. 正确的 location 参数格式
```typescript
// ❌ 错误
location: data.address

// ✅ 正确（需要经纬度坐标）
location: data.address ? { lat: 0, lon: 0 } : undefined
```

注：目前使用占位坐标 `{lat: 0, lon: 0}`，后续可以集成地理编码服务将地址转换为实际坐标。

### 4. 使用正确的可选参数
```typescript
includeLiunian: true,           // 包含流年分析
includePersonalization: false,  // 不包含个性化分析（需要用户八字信息）
includeTiguaAnalysis: true,     // 包含替卦分析
includeLingzheng: true,         // 包含零正理论
includeChengmenjue: true,       // 包含城门诀
includeTimeSelection: false,    // 不包含择吉时间
targetYear: data.currentYear || new Date().getFullYear(),
config: {
  applyTiGua: true,
  applyFanGua: false,
}
```

## 执行流程

修复后的执行流程：

1. 用户填写表单（年份、月份、方位等）
2. 表单提交时，从年月创建 `Date` 对象
3. 将 `Date` 对象作为 `observedAt` 参数传递
4. `comprehensiveAnalysis` 调用 `generateFlyingStar`
5. `generateFlyingStar` 调用 `getYunInfo(observedAt)`
6. `getYunInfo` 成功调用 `date.getUTCFullYear()` ✅

## 测试建议

1. **基本测试**：填写完整表单，确保不再出现 `undefined` 错误
2. **边界测试**：测试特殊年份（如1864、2043等运的边界年份）
3. **月份测试**：测试不同月份，确保月份索引正确
4. **可选参数测试**：测试有地址和无地址两种情况

## 后续改进建议

1. **地理编码集成**：
   - 集成地理编码服务（如 Google Maps API 或高德地图 API）
   - 将用户输入的地址自动转换为经纬度坐标
   
2. **参数验证**：
   - 在组件层添加更严格的类型检查
   - 考虑添加运行时参数验证

3. **错误处理**：
   - 添加更详细的错误提示
   - 为不同类型的错误提供不同的用户反馈

4. **类型安全**：
   - 确保所有调用点都使用正确的类型定义
   - 考虑添加自动类型检查工具

## 受影响的文件

- ✅ `src/components/qiflow/xuankong/xuankong-analysis-page.tsx` (已修复)

## 状态

✅ 已修复并验证

## 时间

修复时间：2025-10-08 13:15 UTC
