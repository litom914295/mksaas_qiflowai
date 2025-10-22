# localStorage 数据同步修复

## 问题描述

八字分析页面无法读取首页填写的表单数据，导致表单验证失败。

## 根本原因

**localStorage key 不匹配**:
- 首页保存到: `formHistory`
- 分析页面读取: `lastBaziForm` ❌

## 修复方案

### 1. 统一数据存储key

现在两个页面都使用 `formHistory` 存储数据。

### 2. 数据读取优先级

```
1. URL参数
   ↓
2. formHistory (首页保存的数据) ✅
   ↓
3. lastBaziForm (备用)
   ↓
4. analysisContext
```

### 3. 数据保存格式

```typescript
{
  personal: {
    name: "张三",
    birthDate: "1990-01-01",
    birthTime: "08:00",
    gender: "male",
    birthCity: "北京市",
    calendarType: "solar"
  },
  house: {...},
  timestamp: 1234567890
}
```

## 测试步骤

### 方法1: 使用浏览器控制台测试

1. **打开首页**

2. **打开控制台 (F12)**，运行以下代码保存测试数据:

```javascript
const testData = {
  personal: {
    name: '张三',
    birthDate: '1990-01-01',
    birthTime: '08:00',
    gender: 'male',
    birthCity: '北京市',
    calendarType: 'solar'
  },
  house: {
    direction: '',
    roomCount: '',
    layoutImage: null,
    standardLayout: ''
  },
  timestamp: Date.now()
};

const history = [testData];
localStorage.setItem('formHistory', JSON.stringify(history));
console.log('✅ 测试数据已保存!');
```

3. **跳转到八字分析页面** (`/bazi-analysis`)

4. **查看控制台日志**，应该看到:
```
🔍 尝试加载表单数据...
✅ 从 formHistory 加载数据: {...}
```

5. **查看页面**，应该显示绿色的"当前分析信息"卡片

6. **点击"开始分析"**，应该能正常提交

### 方法2: 使用首页正常流程

1. **在首页填写表单**:
   - 姓名: 张三
   - 性别: 男
   - 出生日期: 1990-01-01
   - 出生时间: 08:00

2. **确认数据已保存**:
   - 打开控制台
   - 运行: `console.log(JSON.parse(localStorage.getItem('formHistory')))`
   - 应该看到包含你填写数据的数组

3. **跳转到八字分析页面**:
   - 可以通过"历史快速填充"组件
   - 或直接访问 `/bazi-analysis`

4. **验证数据加载**:
   - 查看控制台日志
   - 查看绿色"当前分析信息"卡片
   - 点击"开始分析"

## 调试命令

### 检查 localStorage 中的数据

在浏览器控制台运行:

```javascript
// 查看 formHistory
console.log('formHistory:', JSON.parse(localStorage.getItem('formHistory')));

// 查看 lastBaziForm
console.log('lastBaziForm:', JSON.parse(localStorage.getItem('lastBaziForm')));

// 清除所有数据重新测试
localStorage.removeItem('formHistory');
localStorage.removeItem('lastBaziForm');
console.log('✅ 已清除所有数据');
```

### 手动保存测试数据

```javascript
const testData = {
  personal: {
    name: '测试用户',
    birthDate: '2000-01-01',
    birthTime: '12:00',
    gender: 'female',
    birthCity: '上海市',
    calendarType: 'solar'
  },
  house: {
    direction: '',
    roomCount: '',
    layoutImage: null,
    standardLayout: ''
  },
  timestamp: Date.now()
};

localStorage.setItem('formHistory', JSON.stringify([testData]));
console.log('✅ 已保存测试数据');
location.reload(); // 刷新页面查看效果
```

## 常见问题

### Q1: 控制台显示"formHistory: null"

**原因**: localStorage 中没有数据

**解决**: 
1. 在首页填写并提交表单
2. 或使用上面的测试代码手动保存数据

### Q2: 数据加载了但按钮还是不能点击

**原因**: 可能是积分不足

**解决**:
1. 检查控制台日志中的"当前积分"
2. 确认积分 ≥ 10
3. 如果积分不足，先签到获取积分

### Q3: 看到"❌ 表单验证失败: {}"

**原因**: 数据完全没有加载

**解决**:
1. 打开控制台查看是否有"🔍 尝试加载表单数据..."
2. 检查是否有数据加载成功的日志
3. 如果没有，运行上面的调试命令检查 localStorage
4. 尝试手动保存测试数据

### Q4: localStorage 被清空了

**原因**: 
- 浏览器设置了隐私模式
- 手动清除了浏览器缓存
- 使用了不同的端口/域名

**解决**:
1. 确保不在无痕/隐私模式下
2. 不要清除浏览器数据
3. 确保 URL 一致（端口和域名都要一致）

## 验证修复成功的标志

### ✅ 成功的日志输出

```
🔍 尝试加载表单数据...
✅ 从 formHistory 加载数据: {
  personal: {
    name: "张三",
    birthDate: "1990-01-01",
    birthTime: "08:00",
    gender: "male",
    birthCity: "北京市",
    calendarType: "solar"
  },
  ...
}
💾 已保存表单数据到 formHistory
🔍 开始分析 - 表单数据: {
  name: "张三",
  gender: "男",
  birthDate: "1990-01-01",
  birthTime: "08:00",
  ...
}
🔍 当前积分: 10
🔍 所需积分: 10
✅ 表单验证通过
📤 发送八字分析请求...
✅ API响应成功
```

### ✅ 成功的页面显示

1. 绿色的"当前分析信息"卡片显示数据
2. "开始分析"按钮可以点击（不灰色）
3. 点击后能正常提交分析请求

## 相关文件

- `src/app/[locale]/(routes)/bazi-analysis/page.tsx` - 分析页面（已修复）
- `src/components/qiflow/history-quick-fill.tsx` - 历史快速填充组件
- localStorage key: `formHistory`
