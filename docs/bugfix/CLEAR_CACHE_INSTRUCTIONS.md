# 大运显示问题 - 缓存清除指南

## 问题描述
修复了大运年龄计算bug后，前端可能仍然显示错误的年龄范围（如"24-33岁"），这是因为旧数据被缓存了。

## 清除缓存方法

### 方法1：清除浏览器缓存
1. **Chrome/Edge**: 
   - 按 `Ctrl+Shift+Del` 打开清除数据
   - 勾选"缓存的图片和文件"
   - 点击"清除数据"
   
2. **或者强制刷新**：
   - 按 `Ctrl+F5` 强制刷新页面

### 方法2：清除应用缓存（推荐）
打开浏览器开发者工具（F12），在控制台运行：

```javascript
// 清除所有localStorage
localStorage.clear();

// 清除所有sessionStorage
sessionStorage.clear();

// 清除IndexedDB（如果使用）
indexedDB.databases().then(dbs => {
  dbs.forEach(db => indexedDB.deleteDatabase(db.name));
});

// 重新加载页面
location.reload();
```

### 方法3：后端缓存清除
如果使用了服务端缓存（Redis等），需要清除相关缓存：

```bash
# 如果使用Redis
redis-cli FLUSHDB

# 或者只清除特定的key
redis-cli KEYS "bazi:*" | xargs redis-cli DEL
```

### 方法4：重启开发服务器
```bash
# 停止当前服务
# 然后重新启动
npm run dev
```

## 验证修复
清除缓存后，重新输入生日`2024-03-04 11:03`，应该看到：
- ✅ 当前大运：丙寅 **0-9岁** (2024-2033年)
- ❌ 不再显示：24-33岁 或其他错误年龄

## 问题依然存在？
如果清除缓存后仍然有问题，请检查：

1. **确认修改已部署**：
   ```bash
   git pull
   npm install
   npm run build
   ```

2. **检查代码版本**：
   确认以下文件包含最新修复：
   - `src/lib/bazi/enhanced-calculator.ts` (第344-420行)
   - `src/lib/bazi/normalize.ts` (第880-912行)
   - `src/lib/bazi-pro/core/calculator/dayun-liunian.ts` (第131-143行)

3. **运行测试验证**：
   ```bash
   npx tsx scripts/testing/debug-dayun-full.ts
   ```

4. **检查前端数据绑定**：
   查看前端组件是否正确绑定了`ageRange`或`startAge`/`endAge`字段

## 技术细节
修复的核心逻辑：
```typescript
// ✅ 正确：每个大运持续10年，从起运年龄开始依次递增
const startAge = startAgeYears + index * 10;
const endAge = startAge + 9;

// ❌ 错误（已修复）：所有大运都只是 ageStart + 9
endAge: (pillar.ageStart || 0) + 9
```
