# 八字分析API路由修复

## 问题描述

点击"八字分析"按钮时，出现错误：
```
Error Type: Console SyntaxError
Error Message: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

## 问题分析

### 根本原因

页面调用的API路由不存在，服务器返回了404 HTML错误页面，而不是JSON响应。

**错误的API调用**:
```typescript
// ❌ 这个API路由不存在
fetch('/api/bazi/analyze', {
  method: 'POST',
  body: JSON.stringify(formData),
})
```

**实际存在的API路由**:
- `/api/qiflow/bazi` - 基础八字计算（不扣积分）
- `/api/qiflow/bazi-unified` - 统一八字分析（会验证登录、检查并扣除积分）✅

## 修复方案

### 1. 修复API调用路径

**文件**: `src/app/[locale]/(routes)/bazi-analysis/page.tsx`

**修改内容**:
- 将API调用从 `/api/bazi/analyze` 改为 `/api/qiflow/bazi-unified`
- 调整请求参数格式，匹配API要求
- 添加错误处理和日志

**修改前**:
```typescript
const response = await fetch('/api/bazi/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(formData),
});

const result = await response.json();
```

**修改后**:
```typescript
console.log('📤 发送八字分析请求...');

// 🔥 修复：调用正确的API路由
const response = await fetch('/api/qiflow/bazi-unified', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: formData.name,
    birthDate: formData.birthDate,
    birthTime: formData.birthTime,
    gender: formData.gender === '男' ? 'male' : 'female',
    birthCity: formData.birthPlace.city || '',
    calendarType: 'solar',
  }),
});

if (!response.ok) {
  const errorData = await response.json();
  console.error('❌ API响应错误:', errorData);
  throw new Error(errorData.error || '分析失败');
}

const result = await response.json();
console.log('✅ API响应成功:', result);
```

### 2. 暂时禁用历史记录功能

因为 `/api/bazi/history` 路由也不存在，暂时禁用历史记录调用：

```typescript
// 🔥 暂时禁用历史记录功能，因为API路由不存在
// useEffect(() => {
//   if (session?.user) {
//     fetchHistory();
//   }
// }, [session]);

const fetchHistory = async () => {
  // 🔥 暂时禁用，待API实现后再启用
  console.log('历史记录功能暂未实现');
};
```

## API参数对比

### bazi-unified API要求

**请求格式**:
```typescript
{
  name: string;          // 姓名
  birthDate: string;     // 出生日期 (YYYY-MM-DD)
  birthTime: string;     // 出生时间 (HH:mm)
  gender: 'male' | 'female'; // 性别
  birthCity?: string;    // 出生城市（可选）
  calendarType: 'solar' | 'lunar'; // 日历类型
}
```

**响应格式**:
```typescript
{
  success: boolean;
  data: {
    bazi: {...},           // 八字四柱
    wuxing: {...},         // 五行分析
    personality: {...},    // 性格分析
    career: {...},         // 事业分析
    wealth: {...},         // 财运分析
    health: {...},         // 健康分析
    relationships: {...},  // 人际关系
    creditsUsed: number,   // 消耗的积分
    analysisDate: string,  // 分析时间
    inputData: {...}       // 输入数据
  },
  message: string;
}
```

## 修复后的流程

```
用户填写表单
    ↓
点击"开始分析"按钮
    ↓
前端验证必填字段 ✅
    ↓
前端检查登录状态 ✅
    ↓
前端检查积分余额 ✅
    ↓
调用 /api/qiflow/bazi-unified
    ↓
API验证登录 ✅
    ↓
API检查积分 ✅
    ↓
API扣除积分 ✅
    ↓
API执行八字分析 ✅
    ↓
返回分析结果
    ↓
前端显示结果 ✅
    ↓
刷新积分缓存 ✅
```

## 测试步骤

1. **登录测试**
   - 登录系统
   - 确认积分余额 ≥ 10

2. **填写表单**
   - 姓名: 张三
   - 性别: 男
   - 出生日期: 1990-01-01
   - 出生时间: 08:00

3. **提交分析**
   - 点击"开始分析"按钮
   - ✅ 不再出现 JSON 解析错误
   - ✅ 显示"分析成功，消耗10积分"
   - ✅ 切换到"分析结果"选项卡
   - ✅ 显示分析结果

4. **验证积分扣除**
   - ✅ 顶部导航栏积分余额减少10
   - ✅ 页面积分显示同步更新

## 相关文件

- `src/app/[locale]/(routes)/bazi-analysis/page.tsx` - 八字分析页面（已修复）
- `src/app/api/qiflow/bazi-unified/route.ts` - 统一八字分析API
- `src/app/api/qiflow/bazi/route.ts` - 基础八字计算API

## 待实现功能

1. **历史记录API** (`/api/bazi/history`)
   - 需要创建历史记录查询端点
   - 需要在数据库中保存分析历史

2. **用户资料API** (`/api/user/credits`)
   - 可能需要创建或修复此端点
   - 或使用现有的积分查询方式

## 注意事项

1. 所有八字分析相关的API都应该使用 `/api/qiflow/*` 路由
2. API调用时需要正确转换性别字段（"男"/"女" → "male"/"female"）
3. 日期格式必须是 YYYY-MM-DD
4. 时间格式必须是 HH:mm
5. API会自动验证登录状态和积分余额
