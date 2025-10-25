# 🚀 Warp 快捷访问指南

## 📍 三种快捷访问方式

您现在有**三种方式**可以一键调用工作流：

### 1️⃣ **Starter Workflows**（工作流面板）
📍 **位置**：Warp 界面左侧边栏
🎯 **使用**：点击工作流名称即可执行

**可用工作流**：
- 🚀 **Push to Main** - 完整推送流程
- 💾 **Quick Commit** - 快速提交
- 🔄 **Sync with Remote** - 同步远程
- 📊 **Check Status** - 查看状态
- 📦 **Squash & Push** - 压缩并推送
- ↩️ **Undo & Recommit** - 撤销并重新提交

---

### 2️⃣ **Quick Bar**（快捷按钮栏）
📍 **位置**：Warp 窗口顶部（可配置）
🎯 **使用**：点击彩色按钮直接执行

**按钮列表**：
```
[🚀 Push] [💾 Commit] [🔄 Sync] [📊 Status] | [↩️ Undo] [📦 Squash] | [🏗️ Build] [▶️ Dev] [🧪 Test]
```

**配置**：`.warp/quickbar.yaml`

---

### 3️⃣ **Launcher**（快速启动器）
📍 **触发**：按 `Ctrl+Space`
🎯 **使用**：搜索或选择命令执行

**分类**：
- **Git Operations** - 8个Git操作命令
- **Development** - 5个开发命令
- **Database** - 3个数据库命令

**特性**：
- ✅ 模糊搜索
- ✅ 标签过滤
- ✅ 收藏功能
- ✅ 使用频率统计

**配置**：`.warp/launcher.json`

---

## ⌨️ 快捷键一览

| 快捷键 | 功能 | 说明 |
|--------|------|------|
| `Ctrl+Shift+P` | Push to Main | 推送所有更改到主分支 |
| `Ctrl+Shift+C` | Quick Commit | 快速提交更改 |
| `Ctrl+Shift+S` | Sync Remote | 同步远程仓库 |
| `Ctrl+Shift+G` | Git Status | 查看Git状态 |
| `Ctrl+Shift+D` | Dev Server | 启动开发服务器 |
| `Ctrl+Space` | Launcher | 打开快速启动器 |

---

## 🎨 自定义配置

### 修改快捷键

编辑 `.warp/commands.json`：
```json
{
  "shortcut": "ctrl+shift+p",  // 修改为您想要的快捷键
}
```

### 添加新按钮到Quick Bar

编辑 `.warp/quickbar.yaml`：
```yaml
buttons:
  - id: "my_command"
    label: "🎯 My Command"
    tooltip: "My custom command"
    command: "echo 'Hello World'"
    hotkey: "ctrl+shift+m"
```

### 添加新命令到Launcher

编辑 `.warp/launcher.json`：
```json
{
  "id": "my_workflow",
  "name": "🎯 My Workflow",
  "description": "My custom workflow",
  "command": "npm run my-script",
  "hotkey": "ctrl+shift+m",
  "favorite": true
}
```

---

## 📂 配置文件位置

```
.warp/
├── config.yaml                 # 主配置（注册所有功能）
├── commands.json               # 命令定义
├── quickbar.yaml              # 快捷按钮栏
├── launcher.json              # 快速启动器
├── launch_configurations/     # 工作流配置
│   ├── git_workflows.json
│   ├── push_to_main.yaml
│   └── enhanced_git_workflows.json
└── workflows/                  # 工作流脚本
    ├── push.ps1
    └── ...
```

---

## 🔧 启用/禁用功能

在 `.warp/config.yaml` 中配置：

```yaml
quick_access:
  enabled: true              # 总开关
  quickbar: ".warp/quickbar.yaml"
  commands: ".warp/commands.json"
  launcher: ".warp/launcher.json"
  show_in_ui: true          # 在UI中显示
  pin_to_top: true          # 固定到顶部
```

---

## 💡 使用技巧

### 1. 快速推送工作流
```bash
# 方法1：点击Quick Bar的 [🚀 Push] 按钮
# 方法2：按 Ctrl+Shift+P
# 方法3：左侧面板点击 "🚀 Push to Main"
# 方法4：按 Ctrl+Space 搜索 "push"
```

### 2. 组合使用
```bash
# 开发流程
1. Ctrl+Shift+D  → 启动开发服务器
2. [编写代码]
3. Ctrl+Shift+C  → 快速提交
4. Ctrl+Shift+P  → 推送到主分支
```

### 3. Git历史清理
```bash
# 使用Launcher (Ctrl+Space)
1. 搜索 "squash"
2. 输入要压缩的提交数量
3. 输入新的提交消息
4. 自动执行并推送
```

---

## 🆘 故障排除

### 工作流没有显示？
1. 重启Warp终端
2. 检查 `.warp/config.yaml` 配置
3. 确认文件权限正确

### 快捷键不工作？
1. 检查是否与系统快捷键冲突
2. 修改 `commands.json` 中的快捷键
3. 重启Warp使更改生效

### 按钮没有显示？
1. 确认 `show_in_ui: true` 已启用
2. 检查 `quickbar.yaml` 配置
3. 查看Warp设置中的UI选项

---

## 📞 获取帮助

- 配置文档：查看各配置文件中的注释
- GitHub仓库：https://github.com/litom914295/mksaas_qiflowai
- 问题反馈：创建GitHub Issue

---

✨ **提示**：所有工作流都会保存执行历史，下次使用更快捷！