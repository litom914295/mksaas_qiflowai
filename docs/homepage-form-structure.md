# 首页表单架构说明

## 当前正在使用的组件（✅ 正确配置）

### 1. 首页入口
**文件**: `src/app/[locale]/page.tsx`
- 使用组件: `HeroWithForm`
- 功能: 展示 Hero 区域 + 表单（含房屋风水信息折叠区）
- 导航: `<Navbar>` + `<Footer>` 包裹

### 2. 主表单组件
**文件**: `src/components/home/HeroWithForm.tsx`
- ✅ 已使用国际化路由 (`useLocaleRouter`)
- ✅ 表单提交跳转: `/report`（自动添加 locale 前缀，如 `/zh-CN/report`）
- ✅ 房屋风水信息: 可折叠区域，包含罗盘定位功能
- ✅ 数据存储: `sessionStorage.setItem('analysisFormData', ...)`

### 3. 配套组件
**文件**: `src/components/home/`
- `FeatureShowcase.tsx` - 功能展示区块
- `PricingSection.tsx` - 定价区块
- `social-proof.tsx` - 社会证明
- `ai-chat-popup.tsx` - AI 聊天弹窗

## 路由配置

### 表单提交流程
1. 用户访问: `http://localhost:3000/zh-CN`
2. 填写表单: 个人信息（姓名、性别、生日、时间）+ 可选房屋信息（朝向、罗盘度数、24山）
3. 点击"开始分析"
4. **跳转到**: `http://localhost:3000/zh-CN/report`
5. 报告页读取: `sessionStorage.getItem('analysisFormData')`

### 关键代码片段
```tsx
// HeroWithForm.tsx 第 272 行
router.push('/report'); // 使用 useLocaleRouter，自动添加 locale 前缀
```

## 已删除的冗余组件（❌ 避免混淆）

以下组件已被删除，避免未来维护时搞错：

1. ~~`src/components/home/unified-analysis-form.tsx`~~ - 独立表单（未使用）
2. ~~`src/components/home/HeroWithBaziAnalysis.tsx`~~ - 直接显示结果不跳转（未使用）
3. ~~`src/components/home/EnhancedHero.tsx`~~ - 增强版 Hero（未使用）
4. ~~`src/app/[locale]/homepage-new.tsx`~~ - 未知用途（未使用）

## 数据流

### 表单数据结构
```typescript
interface FormData {
  personal: {
    name: string;
    birthDate: string;        // YYYY-MM-DD
    birthTime: string;        // HH:mm
    gender: 'male' | 'female';
    birthCity: string;
    calendarType: 'solar' | 'lunar';
  };
  house: {
    direction: string;             // 八方位（北、东北、东、等）
    directionDegree?: number;      // 精确度数（0-360）
    sittingMountain?: Mountain;    // 24山坐山（如"子"）
    facingMountain?: Mountain;     // 24山朝向（如"午"）
    sittingFacingLabel?: string;   // 组合标签（如"子山午向"）
    roomCount: string;
    completionYear: string;
    completionMonth: string;
    northRef?: 'magnetic' | 'true'; // 磁北/真北
    declination?: number;          // 磁偏角
  };
}
```

### 存储位置
- **sessionStorage**: `analysisFormData` - 当前分析数据（临时）
- **localStorage**: `formHistory` - 历史记录（最近5条）

## 路由定义

### Routes 枚举（已修正）
```typescript
// src/routes.ts
export enum Routes {
  Root = '/',
  QiflowBazi = '/bazi-analysis',        // ✅ 已修正路径
  QiflowXuankong = '/analysis/xuankong',
  AnalysisHistory = '/analysis/history',
}
```

## 维护注意事项

1. **表单提交必须使用国际化路由**
   - ✅ 正确: `useLocaleRouter()` + `router.push('/report')`
   - ❌ 错误: `useRouter()` + `router.push('/zh-CN/report')`

2. **不要创建新的重复表单组件**
   - 所有首页表单逻辑应在 `HeroWithForm.tsx` 中统一维护
   - 如需新功能，扩展现有组件而不是新建

3. **房屋信息区域是可选的**
   - 用户可以折叠该区域
   - 不填写房屋信息时，只进行八字分析
   - 填写房屋信息时，进行八字 + 风水分析

4. **罗盘功能**
   - 组件: `CompassPickerDialog` (动态导入)
   - 支持磁北/真北切换
   - 自动计算24山坐山朝向
   - 可手动输入度数或使用罗盘选择

## 测试清单

- [ ] 访问 `/zh-CN` 显示表单
- [ ] 填写个人信息后可提交
- [ ] 点击"开始分析"跳转到 `/zh-CN/report`
- [ ] sessionStorage 中包含 `analysisFormData`
- [ ] 切换语言（如 `/en`）后表单正常工作
- [ ] 房屋信息区域可折叠展开
- [ ] 罗盘按钮打开罗盘选择器
- [ ] 24山坐山朝向自动计算正确

## 最后更新
2025-01-27 - 清理冗余组件，统一表单入口
