# 🔄 快速重启 Clash 指南

## ⚠️ 重要提示
**Clash 配置已更新，但需要重启才能生效！**

当前 Clash 启动时间: 2025/10/31 7:32:59（12小时前）
配置更新时间: 刚刚

---

## 🎯 方法 1: 右键菜单重启（最简单）

1. **找到 Clash 图标**
   - 查看 Windows 任务栏右下角（系统托盘）
   - 找到 Clash for Windows 图标

2. **退出 Clash**
   - 右键点击 Clash 图标
   - 选择 "退出" 或 "Quit"
   - 等待程序完全关闭

3. **重新启动**
   - 从开始菜单找到 "Clash for Windows"
   - 点击启动

---

## 🎯 方法 2: 刷新配置（更快）

如果不想完全重启：

1. **打开 Clash for Windows 主窗口**
   - 双击任务栏的 Clash 图标

2. **进入配置页面**
   - 点击左侧的 "Profiles"（配置）选项卡

3. **刷新配置**
   - 找到当前激活的配置（通常有绿色标记）
   - 点击该配置右侧的 🔄 刷新按钮

4. **确认规则模式**
   - 点击左侧的 "Proxies"（代理）
   - 确认模式为 "Rule"（规则模式）而不是 "Global"

---

## ✅ 验证配置是否生效

重启后，打开 PowerShell 运行：

```powershell
.\test-db-connection.ps1
```

**预期结果**：
```
✅ DNS 解析成功
✅ 所有关键测试通过
🎉 数据库连接应该可以正常工作
```

---

## 🚀 完成后的操作

1. **如果测试通过**，数据库就可以正常使用了
   - 当前开发服务器虽然有 DNS 警告，但连接已经成功
   - 可以继续使用，或重启服务器消除警告：
   ```bash
   # Ctrl+C 停止当前服务器
   npm run dev
   ```

2. **如果测试仍然失败**
   - 检查 Clash 是否在 Rule 模式
   - 检查系统代理是否启用
   - 查看 Clash 日志是否有错误

---

## 📋 已完成的配置

在 Clash 配置文件中添加了以下规则：

```yaml
rules:
  - DOMAIN-SUFFIX,supabase.co,DIRECT
  - DOMAIN-SUFFIX,supabase.net,DIRECT
  - DOMAIN-SUFFIX,supabase.io,DIRECT
  - DOMAIN-KEYWORD,supabase,DIRECT
  - DOMAIN,localhost,DIRECT
  - IP-CIDR,127.0.0.0/8,DIRECT
  - IP-CIDR,192.168.0.0/16,DIRECT
  - GEOIP,CN,DIRECT
  - MATCH,PROXY
```

配置文件位置：
```
C:\Users\Administrator\.config\clash\config.yaml
```

备份位置：
```
C:\Users\Administrator\.config\clash\config.yaml.backup_[时间戳]
```

---

## 💡 说明

### 为什么需要重启？
- Clash 在启动时加载配置文件
- 修改配置后必须重启或刷新才能生效
- 当前 DNS 仍然失败是因为使用的是旧配置

### 为什么数据库已经能连接？
虽然看到 DNS 失败的错误，但最终显示 `✅ Database connection established`，这是因为：
1. 应用有重试机制
2. 可能使用了 IPv6 连接
3. 或使用了连接池中的旧连接

但为了稳定性和性能，还是应该修复 DNS 解析问题。

---

## ⏰ 现在就做！

**请立即按上述方法重启 Clash，然后运行测试脚本！**

完成后回复 "已重启" 继续。
