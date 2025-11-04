# 综合八字风水表单使用指南

> 首页统一入口，智能分流八字与风水分析

## 🎯 功能概述

综合表单是气流AI的主入口，采用智能分流机制：
- **只填写个人信息** → 八字命理分析
- **个人信息 + 房屋信息** → 八字 + 个性化风水分析

## 📍 页面位置

### 1. 主入口
```
首页: /
路径: src/app/[locale]/page.tsx
组件: src/components/home/unified-analysis-form.tsx
```

### 2. 分析结果页面
- 八字分析: `/zh-CN/bazi-analysis`
- 玄空风水: `/zh-CN/analysis/xuankong`

---

## 📝 表单字段说明

### 第一部分：个人资料（必填⭐）

#### 1. 基本信息
- **姓名**: `name` (string) - 必填
- **性别**: `gender` ('male' | 'female') - 必填
  - 男
  - 女

#### 2. 历法类型
- **历法**: `calendarType` ('solar' | 'lunar')
  - 阳历（默认）
  - 阴历

#### 3. 出生信息
- **出生日期**: `birthDate` (date) - 必填
  - 格式：YYYY-MM-DD
  
- **出生时间**: `birthTime` (time) - 必填
  - 格式：HH:MM
  
- **出生城市**: `birthCity` (string) - 可选
  - 用于经纬度校正

---

### 第二部分：房屋风水信息（可选）

#### 折叠式设计
- 默认：**收起状态**
- 用户点击标题可展开/收起
- 图标：ChevronDown / ChevronUp

#### 房屋字段

**1. 房屋朝向** 🧭
- **字段**: `direction` (number)
- **范围**: 0-360 度
- **说明**:
  - 0° = 正北
  - 90° = 正东
  - 180° = 正南
  - 270° = 正西

**2. 建筑落成年份** 📅
- **字段**: `completionYear` (number)
- **范围**: 1900 - 当前年份
- **默认**: 当前年份
- **用途**: 计算建筑元运

**3. 建筑落成月份** 📅
- **字段**: `completionMonth` (number)
- **范围**: 1-12
- **默认**: 1
- **格式**: 下拉选择

**4. 房间数量** 🏠
- **字段**: `roomCount` (string)
- **选项**:
  - 一室
  - 二室
  - 三室
  - 四室
  - 五室及以上

---

## 🔄 智能路由逻辑

### 判断条件
```typescript
const hasHouseInfo =
  showHouseInfo &&           // 展开了房屋信息面板
  formData.house.direction && // 填写了朝向
  formData.house.roomCount && // 填写了房间数
  formData.house.completionYear && // 填写了年份
  formData.house.completionMonth;  // 填写了月份
```

### 路由规则

#### 情况1：仅八字分析
**条件**: 只填写了个人信息
**路由**: `/zh-CN/bazi-analysis`
**数据**: 存储在 sessionStorage['analysisFormData']

#### 情况2：八字+风水分析
**条件**: 填写了个人信息 + 完整房屋信息
**路由**: `/zh-CN/bazi-analysis?withFengshui=true`
**数据**: 存储在 sessionStorage['analysisFormData']
**后续**: 八字分析页面会显示"查看风水分析"按钮

---

## 💾 数据存储

### SessionStorage 结构
```typescript
sessionStorage.setItem('analysisFormData', JSON.stringify({
  personal: {
    name: string,
    birthDate: string,
    birthTime: string,
    gender: 'male' | 'female',
    birthCity: string,
    calendarType: 'solar' | 'lunar'
  },
  house: {
    direction: string,
    roomCount: string,
    completionYear: number,
    completionMonth: number
  }
}));
```

### 数据读取
八字分析页面和玄空风水页面应该从 sessionStorage 读取数据：
```typescript
const formData = JSON.parse(
  sessionStorage.getItem('analysisFormData') || '{}'
);
```

---

## 🎨 UI 设计特点

### 1. 进度条
- 实时计算填写进度
- 个人信息：6 个字段
- 房屋信息：4 个字段（展开时计算）
- 百分比显示

### 2. 响应式布局
```
Desktop (lg):
┌────────────────────┬──────────┐
│                    │          │
│   主表单区域       │ 侧边栏   │
│   (2/3 宽度)       │ (1/3)    │
│                    │          │
└────────────────────┴──────────┘

Mobile:
┌────────────────────┐
│   主表单区域       │
├────────────────────┤
│   侧边栏           │
└────────────────────┘
```

### 3. 提交按钮动态文案
```typescript
{showHouseInfo && formData.house.direction && formData.house.roomCount
  ? '立即生成八字风水分析'
  : '立即生成八字分析'}
```

### 4. 功能亮点展示
- ✅ 精准八字四柱分析
- ✅ 九宫飞星风水布局
- ✅ 基于八字的个性化风水 ⭐
- ✅ AI大师24/7在线答疑
- ✅ 专业报告导出分享

### 5. 用户评价轮播
- 自动轮播，每 5 秒切换
- 3 条用户好评
- 星级评分展示

---

## 🔐 隐私与安全

### 隐私保护承诺
🔒 您的个人信息将被严格加密保存，仅用于生成分析报告，不会用于其他用途。

### 免责声明
⚠️ 本服务提供的分析结果仅供参考，不构成任何决策建议。请理性看待。

---

## 🚀 使用流程

### 标准流程
```
1. 用户访问首页
   ↓
2. 填写个人信息（必填）
   ↓
3. 决定是否需要风水分析
   ├─ 不需要 → 直接提交
   └─ 需要 → 展开房屋信息面板
   ↓
4. 提交表单
   ↓
5. 保存到 sessionStorage
   ↓
6. 智能路由
   ├─ 仅八字 → /bazi-analysis
   └─ 八字+风水 → /bazi-analysis?withFengshui=true
   ↓
7. 显示分析结果
   ↓
8. (如有风水) 提供"查看风水分析"按钮
   ↓
9. 跳转到 /analysis/xuankong
```

---

## 🔧 技术实现

### 状态管理
```typescript
const [formData, setFormData] = useState<FormData>({
  personal: { /* ... */ },
  house: { /* ... */ }
});

const [showHouseInfo, setShowHouseInfo] = useState(false);
const [progress, setProgress] = useState(0);
const [isSubmitting, setIsSubmitting] = useState(false);
```

### 表单验证
```typescript
const canSubmit =
  formData.personal.name &&
  formData.personal.birthDate &&
  formData.personal.birthTime &&
  formData.personal.gender;
```

### 进度计算
```typescript
useEffect(() => {
  const personalFields = Object.values(formData.personal)
    .filter((v) => v !== '').length;
  const houseFields = showHouseInfo
    ? Object.values(formData.house)
        .filter((v) => v !== '' && v !== 0).length
    : 0;
  
  const completedFields = personalFields + houseFields;
  const totalFields = 6 + (showHouseInfo ? 4 : 0);
  const progress = Math.round((completedFields / totalFields) * 100);
  
  setProgress(progress);
}, [formData, showHouseInfo]);
```

---

## 📊 分析页面集成

### 八字分析页面需要做的改动

#### 1. 读取表单数据
```typescript
useEffect(() => {
  const storedData = sessionStorage.getItem('analysisFormData');
  if (storedData) {
    const formData = JSON.parse(storedData);
    // 使用 formData.personal 进行八字分析
  }
}, []);
```

#### 2. 检查是否需要风水分析
```typescript
const searchParams = useSearchParams();
const withFengshui = searchParams.get('withFengshui') === 'true';
```

#### 3. 显示风水分析入口
```typescript
{withFengshui && (
  <Button onClick={() => router.push('/zh-CN/analysis/xuankong')}>
    <Compass className="w-4 h-4 mr-2" />
    查看个性化风水分析
  </Button>
)}
```

### 玄空风水页面需要做的改动

#### 1. 读取表单数据
```typescript
useEffect(() => {
  const storedData = sessionStorage.getItem('analysisFormData');
  if (storedData) {
    const formData = JSON.parse(storedData);
    // 使用 formData.house 进行风水分析
    // 使用 formData.personal 关联八字命理
  }
}, []);
```

#### 2. 自动填充玄空表单
```typescript
if (formData.house.direction) {
  setXuankongData({
    facingDirection: parseInt(formData.house.direction),
    completionYear: formData.house.completionYear,
    completionMonth: formData.house.completionMonth,
    // 其他字段...
  });
}
```

---

## 🎯 用户体验优化

### 1. 即时反馈
- ✅ 填写进度实时显示
- ✅ 必填项标红提示
- ✅ 提交按钮动态文案

### 2. 智能引导
- ✅ 提示"基于八字的个性化风水"
- ✅ 折叠面板默认隐藏，减少干扰
- ✅ 展开时显示详细说明

### 3. 数据持久化
- ✅ SessionStorage 保存数据
- ✅ 页面跳转不丢失
- ✅ 支持返回重填

---

## 📱 响应式设计

### 断点
- **Mobile**: < 1024px (lg)
- **Tablet**: 1024px - 1280px
- **Desktop**: > 1280px

### 布局适配
- Mobile: 单列布局
- Tablet/Desktop: 主内容 2/3 + 侧边栏 1/3

---

## 🔮 未来扩展

### 计划功能
- [ ] 表单数据本地存储（localStorage）
- [ ] 历史记录快速填充
- [ ] GPS 自动获取城市
- [ ] 罗盘工具集成
- [ ] 实时验证反馈
- [ ] 多语言支持
- [ ] 分步式表单向导

---

最后更新: 2025-01-12  
维护者: 开发团队
