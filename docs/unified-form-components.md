# 一页式整合表单组件说明

## 概述

本文档介绍气流AI项目中新增的一页式整合表单及相关组件的使用方法。这些组件旨在提升用户体验，优化转化漏斗，提供流畅的数据填写和分析流程。

## 主要页面

### 统一表单页面 (`/unified-form`)

**文件路径**: `app/(routes)/unified-form/page.tsx`

**功能特点**:
- 个人资料与房屋信息融合在一页
- 智能进度条显示填写进度
- 房屋风水信息可折叠展示
- 实时用户评价轮播
- 侧边栏显示功能亮点和安全提示

**使用方式**:
```typescript
// 访问路径
http://localhost:3000/unified-form

// 或通过导航
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/unified-form');
```

---

## 核心组件

### 1. AI大师悬浮对话按钮 (`AIMasterChatButton`)

**文件路径**: `src/components/qiflow/ai-master-chat-button.tsx`

**功能说明**:
- 全局悬浮在页面右下角
- 点击展开聊天窗口
- 支持智能推荐问题
- 实时AI对话交互
- 可跳转到完整AI聊天页面

**Props**:
```typescript
interface AIMasterChatButtonProps {
  suggestedQuestions?: string[];      // 智能推荐问题列表
  welcomeMessage?: string;            // 欢迎消息
  unreadCount?: number;               // 未读消息数
}
```

**使用示例**:
```tsx
import { AIMasterChatButton } from '@/components/qiflow/ai-master-chat-button';

<AIMasterChatButton
  suggestedQuestions={[
    '我适合什么颜色的装修？',
    '我的财位在哪里？',
  ]}
  welcomeMessage="您好！我是AI风水大师"
  unreadCount={2}
/>
```

**待实现功能**:
- [ ] 接入真实AI API
- [ ] 消息持久化存储
- [ ] 用户会话管理
- [ ] 支付咨询预订功能

---

### 2. 历史快速填充 (`HistoryQuickFill`)

**文件路径**: `src/components/qiflow/history-quick-fill.tsx`

**功能说明**:
- 自动读取用户历史填写记录
- 支持一键快速回填表单
- 显示最近3条历史记录
- 支持删除单条记录

**Props**:
```typescript
interface HistoryQuickFillProps {
  onQuickFill: (data: FormData) => void;  // 快速填充回调
  maxRecords?: number;                     // 最大显示记录数
}
```

**使用示例**:
```tsx
import { HistoryQuickFill } from '@/components/qiflow/history-quick-fill';

const handleQuickFill = (data: FormData) => {
  setFormData(data);
};

<HistoryQuickFill 
  onQuickFill={handleQuickFill}
  maxRecords={3}
/>
```

**数据存储**:
- 使用 localStorage 存储
- 键名: `formHistory`
- 格式: JSON数组，包含timestamp字段
- 最多保存5条历史记录

---

### 3. 城市定位选择器 (`CityLocationPicker`)

**文件路径**: `src/components/qiflow/city-location-picker.tsx`

**功能说明**:
- 支持手动输入城市
- 热门城市快捷选择
- 地理定位自动获取
- 智能城市建议列表

**Props**:
```typescript
interface CityLocationPickerProps {
  value: string;                    // 当前城市值
  onChange: (city: string) => void; // 值变化回调
}
```

**使用示例**:
```tsx
import { CityLocationPicker } from '@/components/qiflow/city-location-picker';

const [city, setCity] = useState('');

<CityLocationPicker 
  value={city}
  onChange={setCity}
/>
```

**待实现功能**:
- [ ] 接入高德地图或百度地图API
- [ ] 真实地理定位反查城市
- [ ] 完善城市数据库

---

### 4. 房屋平面图上传 (`HouseLayoutUpload`)

**文件路径**: `src/components/qiflow/house-layout-upload.tsx`

**功能说明**:
- 支持点击上传
- 支持拖拽上传
- 实时预览图片
- 文件类型和大小验证

**Props**:
```typescript
interface HouseLayoutUploadProps {
  value: string | null;                  // 当前图片（base64）
  onChange: (image: string | null) => void; // 图片变化回调
  maxSize?: number;                       // 最大文件大小（MB）
}
```

**使用示例**:
```tsx
import { HouseLayoutUpload } from '@/components/qiflow/house-layout-upload';

const [layoutImage, setLayoutImage] = useState<string | null>(null);

<HouseLayoutUpload 
  value={layoutImage}
  onChange={setLayoutImage}
  maxSize={5}
/>
```

**支持格式**:
- JPG, JPEG
- PNG
- 默认最大5MB

**待实现功能**:
- [ ] 上传到服务器而非base64
- [ ] 图片压缩优化
- [ ] AI识别房屋结构

---

## 表单数据结构

```typescript
interface PersonalInfo {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female' | '';
  birthCity: string;
  calendarType: 'solar' | 'lunar';
}

interface HouseInfo {
  direction: string;        // 房屋朝向（度数）
  roomCount: string;        // 房间数量
  layoutImage: string | null; // 平面图（base64）
  standardLayout: string;   // 标准户型选择
}

interface FormData {
  personal: PersonalInfo;
  house: HouseInfo;
}
```

---

## 页面流程图

```
用户访问
  ↓
查看历史记录 → 快速填充？ → 是 → 自动填充表单
  ↓                          ↓
  否                         否
  ↓                          ↓
填写个人资料（必填）
  ↓
展开房屋信息（可选）
  ↓
点击提交
  ↓
验证表单 → 失败 → 提示错误
  ↓
  成功
  ↓
保存历史记录
  ↓
跳转到报告页面
```

---

## UI/UX 优化要点

### 进度条
- 实时计算填写进度
- 分段显示（个人信息 → 房屋信息 → 完成）
- 视觉反馈鼓励用户继续填写

### 可折叠区域
- 房屋信息默认折叠，降低视觉压力
- 点击展开获取更多功能
- 状态记忆，填写后保持展开

### 侧边栏
- 功能亮点展示建立信任
- 用户评价轮播提升转化率
- 隐私和免责声明增强安全感

### 智能提示
- 必填项明确标注
- 实时验证错误提示
- 占位符文本引导用户

---

## 下一步工作

### 高优先级
1. 接入真实AI API（聊天功能）
2. 实现后端表单提交接口
3. 创建报告页面并对接
4. 罗盘定位功能实现

### 中优先级
5. 标准户型选择器完善
6. 城市定位API接入
7. 图片上传服务器优化
8. 表单数据持久化（数据库）

### 低优先级
9. 用户注册登录系统
10. 支付集成
11. 高级功能解锁
12. 社交分享功能

---

## 测试建议

### 单元测试
- 表单验证逻辑
- 历史记录存储/读取
- 组件状态管理

### 集成测试
- 完整表单填写流程
- 快速填充功能
- 页面跳转逻辑

### E2E测试
- 用户完整使用路径
- 移动端兼容性
- 浏览器兼容性

---

## 联系与反馈

如有问题或建议，请联系开发团队。

**文档版本**: v1.0  
**最后更新**: 2024-01-XX  
**作者**: 气流AI开发团队
