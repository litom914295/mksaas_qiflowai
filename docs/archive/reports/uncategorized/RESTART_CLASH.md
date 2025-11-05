# ✅ Clash 配置已更新成功！

## 📝 已添加的规则

Supabase 数据库直连规则已成功添加到 Clash 配置文件：

```yaml
# 数据库直连规则
rules:
  - DOMAIN-SUFFIX,supabase.co,DIRECT
  - DOMAIN-SUFFIX,supabase.net,DIRECT
  - DOMAIN-SUFFIX,supabase.io,DIRECT
  - DOMAIN-KEYWORD,supabase,DIRECT
  - DOMAIN,localhost,DIRECT
  - DOMAIN-SUFFIX,local,DIRECT
  - IP-CIDR,127.0.0.0/8,DIRECT
  - IP-CIDR,192.168.0.0/16,DIRECT
  - GEOIP,CN,DIRECT
  - MATCH,PROXY
```

## 🔄 下一步：重启 Clash

### 方法 1: 完全重启 Clash (推荐)

1. **退出 Clash**
   - 右键点击任务栏 Clash 图标
   - 选择 "Quit" 或 "退出"

2. **重新启动 Clash for Windows**
   - 从开始菜单或桌面快捷方式启动

### 方法 2: 重新加载配置

1. **打开 Clash for Windows**

2. **进入 Profiles (配置)**
   - 点击左侧的 "Profiles" 选项卡

3. **刷新配置**
   - 找到当前激活的配置文件
   - 点击右侧的刷新按钮 🔄

### 方法 3: 使用命令行

```powershell
# 关闭 Clash 进程
Stop-Process -Name "Clash for Windows" -Force -ErrorAction SilentlyContinue

# 等待 2 秒
Start-Sleep -Seconds 2

# 重新启动 (需要修改为你的 Clash 安装路径)
Start-Process "C:\Program Files\Clash for Windows\Clash for Windows.exe"
```

## ✅ 验证配置生效

重启 Clash 后，运行测试脚本：

```powershell
.\test-db-connection.ps1
```

应该看到：
- ✅ DNS 解析成功
- ✅ 所有关键测试通过

## 🚀 启动开发服务器

配置生效后，启动项目：

```bash
npm run dev
```

数据库应该可以正常连接了！

## 📋 备份信息

原配置文件已自动备份到：
```
C:\Users\Administrator\.config\clash\config.yaml.backup_[时间戳]
```

如果需要恢复，可以使用备份文件。

---

**提示**: 如果仍然无法连接，尝试：
1. 检查 Clash 是否处于 Rule 模式（而不是 Global）
2. 确认系统代理已启用
3. 重启电脑（最后手段）
