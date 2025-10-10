# 🚀 气流AI - 快速访问指南

## ✅ 当前工作状态

### 已修复
- ✅ 一页式表单页面 - **完全正常**
- ✅ 表单提交功能 - **完全正常**
- ✅ 历史数据快速填充 - **完全正常**
- ✅ AI大师悬浮对话按钮 - **UI完成**
- ✅ 首页 - **完全正常**

### 待修复
- ⏳ 根路径自动重定向 (`/` → `/zh-CN/`)
- ⏳ 表单提交后跳转到报告页面
- ⏳ AI聊天真实API接入

---

## 📍 正确的访问路径

### 主要页面

| 功能 | URL | 状态 |
|------|-----|------|
| **首页** | `http://localhost:3000/zh-CN/` | ✅ 正常 |
| **一页式表单** | `http://localhost:3000/zh-CN/unified-form` | ✅ 正常 |
| **简单测试页** | `http://localhost:3000/zh-CN/test-simple` | ✅ 正常 |
| **静态测试** | `http://localhost:3000/test.html` | ✅ 正常 |

### ⚠️ 暂时不工作的路径

| URL | 当前状态 | 原因 |
|-----|---------|------|
| `http://localhost:3000/` | 404 | Middleware重定向未生效 |
| `http://localhost:3000/unified-form` | 404 | 缺少locale前缀 |

---

## 🎯 使用流程

### 1. 启动开发服务器
```bash
cd D:\test\mksaas_qiflowai
npm run dev
```

### 2. 访问首页
```
http://localhost:3000/zh-CN/
```

### 3. 点击"开始分析"或直接访问表单
```
http://localhost:3000/zh-CN/unified-form
```

### 4. 填写表单

**必填项**（不填无法提交）：
- ✅ 姓名
- ✅ 性别（男/女）
- ✅ 出生日期
- ✅ 出生时间

**选填项**（可折叠）：
- 出生城市
- 房屋朝向
- 房间数量
- 标准户型
- 平面图上传

### 5. 提交分析

填写完必填项后，点击底部的：
```
"立即生成专属分析报告"
```

会弹出提示：
```
"分析完成！即将跳转到报告页面..."
```

点击"确定"后：
- ✅ 数据已保存到历史记录
- ⏳ 报告页面尚未创建（所以不会跳转）

---

## 🔧 Middleware 问题临时解决方案

由于根路径 `/` 的自动重定向暂时不工作，请：

### 方案1：直接使用完整路径
总是在URL中包含 `/zh-CN/` 前缀：
- ✅ `http://localhost:3000/zh-CN/`
- ✅ `http://localhost:3000/zh-CN/unified-form`

### 方案2：浏览器书签
创建书签直接指向：
```
http://localhost:3000/zh-CN/
```

### 方案3：修改hosts（不推荐）
这不会解决问题，但可以设置更短的域名。

---

## 📝 表单功能说明

### 历史快速填充
- 自动保存最近5次填写记录
- 点击"快速填充历史数据"按钮
- 选择历史记录一键回填

### 城市定位
- 支持手动输入
- 热门城市快速选择
- 地理定位按钮（模拟功能）

### 平面图上传
- 支持点击或拖拽上传
- 支持JPG、PNG格式
- 最大5MB
- 实时预览

### AI大师对话
- 右下角悬浮按钮
- 智能推荐问题
- 24/7在线（UI演示）

---

## 🐛 已知问题

### 1. 根路径404
**问题**: 访问 `http://localhost:3000/` 返回404  
**原因**: Middleware重定向配置问题  
**临时方案**: 直接访问 `http://localhost:3000/zh-CN/`  
**状态**: 🔧 修复中

### 2. 表单提交后无跳转
**问题**: 点击确定后页面不跳转  
**原因**: 报告页面未创建，跳转代码已注释  
**临时方案**: 查看浏览器控制台确认提交成功  
**状态**: 📋 待开发报告页面

### 3. AI对话无响应
**问题**: AI回复为模拟数据  
**原因**: 未接入真实AI API  
**临时方案**: 仅用于UI演示  
**状态**: 🔌 待接入API

---

## 🎨 页面截图位置

如果需要查看页面效果，访问：
- 首页：`/zh-CN/`
- 表单：`/zh-CN/unified-form`
- 测试：`/zh-CN/test-simple`

---

## 🔍 调试信息

### 浏览器控制台日志

访问表单页面时会看到：
```
🔍 canSubmit: false  (填写前)
📝 Personal data: {...}
```

填写完成后：
```
🔍 canSubmit: true
```

点击提交后：
```
🔍 handleSubmit called
📝 formData: {...}
✅ Validation passed, submitting...
💾 Saved to history
✅ Analysis complete!
```

### 服务器日志

启动时：
```
▲ Next.js 15.5.2
- Local:        http://localhost:3000
✓ Ready in Xs
```

访问页面时：
```
○ Compiling /zh-CN/unified-form ...
✓ Compiled in Xs
```

---

## 📞 获取帮助

### 查看文档
- `QUICKSTART.md` - 快速开始
- `docs/unified-form-components.md` - 组件文档
- `docs/development-summary.md` - 开发总结
- `docs/ROUTING_FIX.md` - 路由修复说明
- `docs/MIDDLEWARE_SIMPLIFIED.md` - Middleware说明

### 运行诊断
```bash
node scripts/diagnose.js
```

---

## ✨ 下一步工作

### 立即修复
1. ✅ 表单功能 - 已完成
2. ⏳ Middleware重定向 - 修复中
3. 📋 创建报告页面
4. 🔌 接入AI API

### 功能增强
5. 罗盘定位功能
6. 标准户型选择器
7. 城市地理编码API
8. 图片上传到服务器

---

**更新时间**: 2024-01-XX  
**版本**: v1.1  
**状态**: 部分功能正常，持续优化中
