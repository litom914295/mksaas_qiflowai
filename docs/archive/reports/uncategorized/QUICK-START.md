# ⚡ 快速启动指南

## 🎯 已完成的优化

### 1. ✅ i18n 缓存优化
- **问题**: i18n 加载耗时 7 秒
- **解决**: 添加内存缓存，避免重复 deepmerge
- **效果**: 7秒 → < 100ms (70倍提升)

### 2. ✅ Webpack 开发环境优化
- 禁用代码分割（`splitChunks: false`）
- 禁用压缩（`minimize: false`）
- 优化文件监听（忽略测试/脚本目录）
- 使用快速 source map (`eval-cheap-module-source-map`)

### 3. ✅ 新增快速启动脚本
- `npm run dev:fast` - 快速启动
- `npm run dev:fast:clean` - 清理缓存后启动

## 🚀 立即使用

### 停止当前服务器
```bash
Ctrl + C
```

### 清理缓存并重启（首次推荐）
```bash
npm run dev:fast:clean
```

### 后续使用
```bash
npm run dev:fast
```

## 📊 预期性能

| 指标 | 优化前 | 预期优化后 |
|-----|--------|-----------|
| 启动时间 | 52秒 | ~20秒 |
| 首次编译 | 115秒 | ~30秒 |
| 页面响应 | 142秒 | ~10秒 |
| i18n 加载 | 7秒 | < 100ms |
| 二次刷新 | - | ~3秒 |

## 💡 性能提示

1. **首次启动会慢** (30-60秒) - 需要构建缓存
2. **后续刷新会快** (~3-10秒) - 利用缓存
3. **避免同时打开过多路由** - 减少编译负担
4. **定期清理缓存** (每周) - `npm run dev:fast:clean`

## 🔧 故障排除

### 如果仍然很慢

#### 方法1: 完整清理
```bash
# PowerShell
Remove-Item -Recurse -Force .next, .turbo, node_modules/.cache
npm run dev:fast
```

#### 方法2: Windows Defender 排除
1. 打开 Windows 安全中心
2. 病毒和威胁防护 → 管理设置
3. 添加排除项：
   - `D:\test\QiFlow AI_qiflowai\node_modules`
   - `D:\test\QiFlow AI_qiflowai\.next`
   - `D:\test\QiFlow AI_qiflowai\.turbo`

#### 方法3: 限制 Node.js 内存
```powershell
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run dev:fast
```

## 🎨 生产环境部署

优化只应用于开发环境，生产环境会自动启用：

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 或部署到 Vercel
vercel --prod
```

## 📚 详细文档

查看完整优化指南：
- [性能优化文档](docs/PERFORMANCE-OPTIMIZATION.md)
- [部署指南](README.md)

---

**下一步**: 
1. 停止当前开发服务器（Ctrl+C）
2. 运行 `npm run dev:fast:clean`
3. 等待首次编译完成（约30-60秒）
4. 享受快速开发体验！ ⚡
