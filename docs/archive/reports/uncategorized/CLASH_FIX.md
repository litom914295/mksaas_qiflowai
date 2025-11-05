# Clash 代理配置修复指南

**问题**: 使用 Clash 时无法连接 Supabase 数据库

## 🔧 快速修复步骤

### 方案 1: 配置 Supabase 域名直连（推荐）

1. **打开 Clash 配置文件**
   - 打开 Clash for Windows
   - 点击 `Profiles` (配置)
   - 点击当前配置右侧的 `Edit` (编辑)

2. **添加规则**
   在 `rules:` 部分最上方添加：
   ```yaml
   rules:
     # Supabase 直连规则（添加在最前面）
     - DOMAIN-SUFFIX,supabase.co,DIRECT
     - DOMAIN-SUFFIX,supabase.net,DIRECT
     - DOMAIN-KEYWORD,supabase,DIRECT
     
     # 其他现有规则...
   ```

3. **保存并重新加载配置**
   - 保存文件
   - 返回 Clash，点击配置右侧的刷新按钮
   - 或重启 Clash

### 方案 2: 使用 TUN 模式

1. 打开 Clash for Windows
2. 点击 `General` (常规)
3. 找到 `TUN Mode` 
4. 开启 `TUN Mode`
5. 重启应用

### 方案 3: 检查代理设置

1. **打开 Clash**
2. **检查模式**:
   - 点击 `Proxies` (代理)
   - 确认模式为 `Rule` (规则模式)，而不是 `Global` (全局模式)

3. **检查系统代理**:
   - 确认 Clash 的系统代理已启用
   - 端口通常是 7890

### 方案 4: 临时关闭 Clash 测试

```bash
# 1. 关闭 Clash
# 2. 测试连接
ping db.sibwcdadrsbfkblinezj.supabase.co

# 3. 如果成功，说明是 Clash 配置问题
# 4. 使用方案1添加直连规则
```

## 📋 验证步骤

修复后验证：

```bash
# 1. 测试 DNS 解析
nslookup db.sibwcdadrsbfkblinezj.supabase.co

# 2. 测试连接
ping -n 4 db.sibwcdadrsbfkblinezj.supabase.co

# 3. 重启开发服务器
npm run dev
```

## 🎯 推荐的 Clash 规则配置

完整的规则示例：

```yaml
rules:
  # 数据库和API直连
  - DOMAIN-SUFFIX,supabase.co,DIRECT
  - DOMAIN-SUFFIX,supabase.net,DIRECT
  - DOMAIN-SUFFIX,supabase.io,DIRECT
  
  # 开发相关直连
  - DOMAIN,localhost,DIRECT
  - DOMAIN-SUFFIX,local,DIRECT
  - IP-CIDR,127.0.0.0/8,DIRECT
  - IP-CIDR,192.168.0.0/16,DIRECT
  
  # npm/yarn 镜像直连（可选）
  - DOMAIN-SUFFIX,npmmirror.com,DIRECT
  - DOMAIN-SUFFIX,npm.taobao.org,DIRECT
  
  # 其他规则...
  - GEOIP,CN,DIRECT
  - MATCH,PROXY
```

## ⚡ 立即修复

**最快的方法**：

1. 打开 Clash for Windows
2. 右键点击任务栏 Clash 图标
3. 选择 `System Proxy` (系统代理) → 暂时关闭
4. 测试数据库连接
5. 如果成功，按方案1添加直连规则
6. 重新启用系统代理

## 🔍 故障排查

如果仍然无法连接：

### 检查 1: Clash 日志
```
Clash → Logs → 查看是否有 supabase 相关错误
```

### 检查 2: DNS 设置
```
Clash → General → DNS → 
确认启用了 DNS 功能
```

### 检查 3: 防火墙
```
Windows 防火墙 → 
允许 Clash 和 Node.js 通过防火墙
```

## 📝 完成后

修复成功后，记得移除 `.env` 中的临时配置：

```env
# 删除或注释这行
# ENABLE_CREDITS_DB=false
```

然后重启开发服务器。

---

**提示**: 添加 Supabase 直连规则是最佳方案，既不影响代理功能，又能确保数据库连接稳定。
