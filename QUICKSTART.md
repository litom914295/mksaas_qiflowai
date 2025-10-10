# 🚀 气流AI - 一页式表单快速开始指南

欢迎使用气流AI一页式整合表单系统！本指南将帮助您快速上手。

---

## 📋 目录

1. [快速访问](#快速访问)
2. [核心组件](#核心组件)
3. [开发文档](#开发文档)
4. [启动项目](#启动项目)
5. [功能演示](#功能演示)

---

## 🔗 快速访问

### 主要页面
- **首页**: `/`
  - 访问地址: `http://localhost:3000/` (自动重定向到 `http://localhost:3000/zh-CN`)
- **一页式表单页面**: `/unified-form`
  - 访问地址: `http://localhost:3000/zh-CN/unified-form`

### 核心组件路径
```
src/components/qiflow/
├── ai-master-chat-button.tsx      # AI大师悬浮对话
├── history-quick-fill.tsx         # 历史快速填充
├── city-location-picker.tsx       # 城市定位选择
└── house-layout-upload.tsx        # 平面图上传
```

---

## 🧩 核心组件

### 1️⃣ AI大师悬浮对话按钮
```tsx
import { AIMasterChatButton } from '@/components/qiflow/ai-master-chat-button';

<AIMasterChatButton />
```
**功能**: 24/7 AI智能客服，随时解答用户疑问

---

### 2️⃣ 历史快速填充
```tsx
import { HistoryQuickFill } from '@/components/qiflow/history-quick-fill';

<HistoryQuickFill onQuickFill={handleFill} />
```
**功能**: 一键回填上次填写的数据，提升复访用户体验

---

### 3️⃣ 城市定位选择器
```tsx
import { CityLocationPicker } from '@/components/qiflow/city-location-picker';

<CityLocationPicker value={city} onChange={setCity} />
```
**功能**: 智能城市搜索 + 地理定位 + 热门快选

---

### 4️⃣ 房屋平面图上传
```tsx
import { HouseLayoutUpload } from '@/components/qiflow/house-layout-upload';

<HouseLayoutUpload value={image} onChange={setImage} />
```
**功能**: 点击/拖拽上传，实时预览，精准风水分析

---

## 📖 开发文档

| 文档名称 | 路径 | 说明 |
|---------|------|------|
| **组件使用文档** | `docs/unified-form-components.md` | 详细的组件API和使用示例 |
| **开发总结** | `docs/development-summary.md` | 功能清单、技术栈、工作计划 |
| **快速开始** | `QUICKSTART.md` | 本文件 |

---

## 🎯 启动项目

### 开发模式
```bash
# 1. 进入项目目录
cd D:\test\mksaas_qiflowai

# 2. 安装依赖（首次运行）
npm install

# 3. 启动开发服务器
npm run dev

# 4. 在浏览器中访问
# http://localhost:3000/ (首页)
# http://localhost:3000/zh-CN/unified-form (表单页面)
```

### 生产模式
```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

---

## 🎬 功能演示

### 用户流程
```
1. 访问表单页面
   ↓
2. 查看历史记录（如有）
   ↓
3. 填写个人资料（必填）
   - 姓名、性别
   - 出生日期、时间
   - 出生城市（可选）
   ↓
4. 展开房屋信息（可选）
   - 房屋朝向
   - 房间数量
   - 标准户型
   - 平面图上传
   ↓
5. 提交表单
   ↓
6. 保存到历史记录
   ↓
7. 跳转到分析报告
```

### 交互亮点
- ✨ **进度条**: 实时显示填写进度，激励用户完成
- 🔄 **快速填充**: 老用户秒填，新用户友好引导
- 🤖 **AI助手**: 右下角悬浮按钮，随时提供帮助
- 🎨 **渐进式**: 必填内容优先，高级功能折叠
- 📱 **响应式**: 移动端和桌面端完美适配

---

## 🎨 视觉设计

### 配色方案
- **主色调**: 紫色渐变 (`purple-600` → `blue-600`)
- **辅助色**: 橙色 (`orange-500`)、绿色 (`green-500`)
- **状态色**:
  - 成功: 绿色 (`green-500`)
  - 警告: 橙色 (`orange-500`)
  - 错误: 红色 (`red-500`)
  - 信息: 蓝色 (`blue-500`)

### 间距规范
- 卡片间距: `gap-6`
- 内边距: `p-4` / `p-6`
- 圆角: `rounded-lg` / `rounded-2xl`
- 阴影: `shadow-lg`

---

## 🧪 测试检查清单

### 基础功能
- [ ] 表单所有字段可正常填写
- [ ] 必填项验证提示正确
- [ ] 历史记录保存和读取正常
- [ ] 快速填充一键回填成功

### 高级功能
- [ ] 城市搜索和定位工作正常
- [ ] 平面图上传、预览、删除正常
- [ ] AI对话窗口交互流畅
- [ ] 进度条计算准确

### 用户体验
- [ ] 移动端布局正常
- [ ] 加载状态反馈清晰
- [ ] 错误提示友好
- [ ] 动画过渡流畅

---

## 🐛 常见问题

### Q1: 页面访问404
**A**: 确保Next.js开发服务器已启动，并访问 `http://localhost:3000/` 或 `http://localhost:3000/zh-CN/unified-form`

**注意**: 项目使用了国际化路由，所有页面都需要locale前缀（如 `/zh-CN/`）

### Q2: 历史记录不显示
**A**: 首次使用没有历史，填写并提交一次后即可看到

### Q3: 城市定位失败
**A**: 需要浏览器允许地理定位权限，目前为模拟功能

### Q4: 平面图上传后看不到
**A**: 检查文件大小是否超过5MB，格式是否为JPG/PNG

### Q5: AI对话没有回复
**A**: 目前为UI展示，真实AI API接入待完成

---

## 📞 获取帮助

### 开发团队
- **技术咨询**: 查看 `docs/unified-form-components.md`
- **问题反馈**: 联系项目负责人
- **贡献代码**: 遵循TypeScript严格模式和代码规范

### 相关链接
- [Next.js文档](https://nextjs.org/docs)
- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

---

## 🎉 下一步

1. ✅ **启动项目**: 按照上述步骤启动开发服务器
2. 🔍 **查看表单**: 访问 `/unified-form` 页面
3. 🧪 **测试功能**: 逐项测试各个组件
4. 📖 **阅读文档**: 深入了解组件API和使用方法
5. 🚀 **开始开发**: 基于现有组件继续扩展功能

---

## 💡 提示

- 使用Chrome DevTools调试
- 查看浏览器控制台日志
- 使用React DevTools查看组件状态
- 测试移动端用Chrome的设备模拟

---

**祝您使用愉快！** 🎊

如有任何问题，请查看详细文档或联系开发团队。
