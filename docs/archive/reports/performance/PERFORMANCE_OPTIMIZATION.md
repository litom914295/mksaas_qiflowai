# Next.js 开发服务器性能优化指南

## 🎯 优化目标

将开发服务器启动时间从 **157秒** 降低到 **30秒以内**，模块数量从 **2876个** 优化到合理范围。

## ✅ 已实施的优化

### 1. 启用 Turbopack（最重要！）

Turbopack 是 Next.js 15 的下一代打包工具，比 Webpack 快 **700倍**。

```bash
# 现在默认使用 Turbopack
npm run dev

# 如果需要使用传统 Webpack
npm run dev:webpack
```

**预期效果**: 启动时间减少 60-80%

### 2. 优化的 Next.js 配置

在 `next.config.ts` 中添加了：

- **文件监听优化**: 排除不必要的目录（node_modules, .git, backup_* 等）
- **缓存优化**: 启用文件系统缓存，禁用压缩以加快缓存速度
- **开发环境禁用 CSS 优化**: 生产环境才启用
- **优化包导入**: 自动优化大型图标库和组件库的导入
- **Turbopack 别名配置**: 加速模块解析

**预期效果**: 启动时间减少 10-20%

### 3. TypeScript 配置优化

在 `tsconfig.json` 中：

- 升级 target 到 ES2020
- 启用 `assumeChangesOnlyAffectDirectDependencies` 以加快增量编译

**预期效果**: 类型检查速度提升 15-30%

### 4. SWC 编译器配置

创建了 `.swcrc` 文件优化编译：

- 禁用开发环境的代码压缩和混淆
- 优化 React 转换选项
- 使用 ES2020 目标以获得更好的性能

**预期效果**: 编译速度提升 10-15%

### 5. 环境变量优化

创建 `.env.development.local`（从 `.env.development.local.example` 复制）：

```bash
# 复制示例文件
cp .env.development.local.example .env.development.local
```

关键配置：
- `NEXT_TELEMETRY_DISABLED=1`: 禁用遥测
- `NODE_OPTIONS=--max-old-space-size=8192`: 增加 Node.js 内存限制
- `DISABLE_IMAGE_OPTIMIZATION=true`: 开发环境禁用图片优化

## 🚀 使用方法

### 日常开发

```bash
# 启动开发服务器（已启用 Turbopack）
npm run dev
```

### 首次启动或缓存问题

```bash
# 方法 1: 使用清理脚本
npm run dev:clean

# 方法 2: 使用 PowerShell 脚本（更快）
.\clean-cache.ps1
npm run dev

# 方法 3: 深度清理
node scripts/dev-optimize.js --deep-clean
npm run dev

# 方法 4: 完全重置（包括重新安装依赖）
npm run dev:reinstall
```

## 📊 性能对比

### 优化前
- 启动时间: **157秒**
- 模块数量: **2876个**
- 中间件编译: 850ms
- 首页编译: 157.2s

### 优化后（预期）
- 启动时间: **15-30秒** （减少 80-90%）
- 模块数量: **优化的模块加载**
- 中间件编译: **<300ms**
- 首页编译: **<20秒**

## 🛠️ 额外优化建议

### 1. 增加系统内存

如果你的机器内存充足（16GB+），可以增加 Node.js 内存限制：

```bash
# 在 .env.development.local 中
NODE_OPTIONS=--max-old-space-size=16384
```

### 2. 使用 SSD

确保项目在 SSD 上，HDD 会严重影响性能。

### 3. 关闭不必要的进程

开发时关闭其他占用大量资源的应用。

### 4. 使用 Windows Terminal

Windows Terminal 比传统的 PowerShell/CMD 性能更好。

### 5. 定期清理缓存

每周运行一次：

```bash
.\clean-cache.ps1
```

### 6. 优化 MDX 处理

如果你有大量 MDX 文件，考虑：

- 使用增量编译
- 按需加载文档内容
- 减少文档数量或拆分为多个小文件

### 7. 减少依赖

审查并移除不必要的依赖：

```bash
# 分析依赖大小
npm run analyze

# 检查未使用的依赖
npm run knip
```

## 🐛 故障排查

### 问题 1: 仍然很慢

**解决方案**:
1. 确认已清理所有缓存：`.\clean-cache.ps1`
2. 重新安装依赖：`npm run dev:reinstall`
3. 检查 Windows Defender 是否在扫描项目目录（添加排除项）
4. 确认使用的是 Turbopack：启动日志应显示 `--turbopack`

### 问题 2: Turbopack 报错

**解决方案**:
```bash
# 降级到 Webpack
npm run dev:webpack
```

### 问题 3: 内存不足

**解决方案**:
```bash
# 减少内存限制
# 在 .env.development.local 中
NODE_OPTIONS=--max-old-space-size=4096
```

### 问题 4: 模块找不到

**解决方案**:
```bash
# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

## 📈 监控性能

### 查看编译统计

启动开发服务器时注意：

```
✓ Ready in X.Xs
○ Compiling /middleware ...
✓ Compiled /middleware in XXms
○ Compiling /[locale] ...
✓ Compiled /[locale] in XXs (XXXX modules)
```

### 理想指标

- Ready time: < 15s
- Middleware: < 300ms
- First page: < 20s
- Hot reload: < 1s

## 🔄 更新日志

### v1.0.0 (2025-01-13)
- ✅ 启用 Turbopack
- ✅ 优化 Next.js 配置
- ✅ 优化 TypeScript 配置
- ✅ 创建 SWC 配置
- ✅ 添加环境变量优化
- ✅ 创建清理脚本

## 📚 参考资料

- [Next.js Turbopack 文档](https://nextjs.org/docs/architecture/turbopack)
- [Next.js 性能优化](https://nextjs.org/docs/app/building-your-application/optimizing)
- [SWC 配置](https://swc.rs/docs/configuration/swcrc)

---

**提示**: 如果这些优化后效果仍不理想，请检查：
1. Windows Defender 实时保护（添加项目目录到排除项）
2. 防病毒软件（可能会扫描 node_modules）
3. 系统资源使用情况（CPU/内存/磁盘）
4. 网络代理或 VPN 设置
