# 🚀 快速开始 - 性能优化版

## 立即开始

### 1️⃣ 清理旧缓存

```powershell
# PowerShell
if (Test-Path .next) { Remove-Item -Recurse -Force .next }
if (Test-Path .turbo) { Remove-Item -Recurse -Force .turbo }
```

### 2️⃣ 配置环境变量（可选但推荐）

```powershell
# 复制示例文件
Copy-Item .env.development.local.example .env.development.local
```

然后编辑 `.env.development.local`：

```env
NEXT_TELEMETRY_DISABLED=1
NODE_OPTIONS=--max-old-space-size=8192
DISABLE_IMAGE_OPTIMIZATION=true
```

### 3️⃣ 启动开发服务器

```bash
npm run dev
```

现在会自动使用 **Turbopack**！🎉

## 📊 预期效果

| 指标 | 优化前 | 优化后 | 改善 |
|------|--------|--------|------|
| 启动时间 | 157秒 | 15-30秒 | **80-90%** ↓ |
| 中间件编译 | 850ms | <300ms | **65%** ↓ |
| 首页编译 | 157.2秒 | <20秒 | **87%** ↓ |
| 热重载 | - | <1秒 | ⚡ 快速 |

## 🛠️ 可用命令

```bash
# 日常开发（Turbopack 模式）
npm run dev

# 使用传统 Webpack（如果 Turbopack 有问题）
npm run dev:webpack

# 清理缓存后启动
npm run dev:clean

# 完全重置（包括重装依赖）
npm run dev:reinstall
```

## ⚡ 关键优化点

1. ✅ **Turbopack 已启用** - 比 Webpack 快 700 倍
2. ✅ **文件系统缓存** - 后续启动更快
3. ✅ **优化包导入** - 自动优化大型库
4. ✅ **排除不必要目录** - 减少文件监听
5. ✅ **禁用开发环境 CSS 优化** - 更快编译

## 🔧 问题排查

### 问题：启动仍然很慢

**解决方案 1**: 确认 Turbopack 已启用

```bash
# 启动时应该看到 --turbopack 标志
npm run dev
```

**解决方案 2**: 清理缓存

```powershell
if (Test-Path .next) { Remove-Item -Recurse -Force .next }
npm run dev
```

**解决方案 3**: 检查 Windows Defender

将项目目录添加到 Windows Defender 排除项：

1. 打开 Windows 安全中心
2. 病毒和威胁防护 → 管理设置
3. 排除项 → 添加排除项
4. 添加 `D:\test\mksaas_qiflowai`

### 问题：Turbopack 报错

**解决方案**: 降级到 Webpack

```bash
npm run dev:webpack
```

### 问题：内存不足

**解决方案**: 调整内存限制

在 `.env.development.local` 中：

```env
NODE_OPTIONS=--max-old-space-size=4096
```

## 📚 更多信息

详细文档请查看 [PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md)

## 🎯 首次使用检查清单

- [ ] 已清理 `.next` 和 `.turbo` 缓存
- [ ] 已创建 `.env.development.local` 文件
- [ ] 已确认使用 `npm run dev` 启动（默认 Turbopack）
- [ ] 启动日志显示使用 Turbopack
- [ ] 编译时间显著减少

---

**开始享受飞快的开发体验吧！** 🚀✨
