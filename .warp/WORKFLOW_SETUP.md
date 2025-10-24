# Warp 工作流集成指南

## 🎯 配置完成！

您的工作流已经配置完成，现在应该可以在Warp界面中看到了。

## 📍 如何在Warp中访问工作流

### 方法1：Starter Workflows（推荐）
1. 打开Warp终端
2. 查看左侧边栏的 **"Starter Workflows"** 或 **"Workflows"** 栏目
3. 您应该能看到以下工作流：
   - 🚀 **Push to Main** - 一键推送到主分支
   - 💾 **Quick Commit** - 快速提交
   - 🔄 **Sync with Remote** - 同步远程仓库
   - 📊 **Check Status** - 查看状态

### 方法2：使用快捷键
- `Ctrl+Shift+P` - Push to Main（推送到主分支）
- `Ctrl+Shift+C` - Quick Commit（快速提交）
- `Ctrl+Shift+S` - Sync with Remote（同步远程）
- `Ctrl+Shift+G` - Git Status（查看状态）

### 方法3：命令面板
1. 在Warp中按 `Ctrl+Shift+P`（或 `Cmd+Shift+P` on Mac）
2. 输入 "workflow" 或工作流名称
3. 选择要运行的工作流

## 🔧 如果工作流没有显示

请尝试以下步骤：

1. **重启Warp**
   - 完全关闭Warp
   - 重新打开Warp

2. **刷新工作流**
   - 在Warp中运行：`warp workflows refresh`
   - 或点击工作流面板的刷新按钮

3. **手动加载**
   - 在Warp设置中找到 "Workflows"
   - 添加项目路径：`D:\test\mksaas_qiflowai\.warp`

4. **检查Warp版本**
   - 确保您使用的是最新版本的Warp
   - 工作流功能需要Warp v0.2022.08.01或更高版本

## 📁 配置文件结构

```
.warp/
├── config.yaml                    # 主配置文件
├── .warp-workflows                # 工作流注册文件
├── launch_configurations/
│   ├── git_workflows.json        # Git工作流配置
│   └── push_to_main.yaml         # 推送工作流详细配置
└── workflows/
    ├── push.ps1                  # 简单推送脚本 ✅
    ├── push-to-main.bat          # Windows批处理
    └── README.md                 # 工作流文档
```

## 🚀 使用示例

### 推送代码到主分支
1. 在Warp左侧栏找到 "🚀 Push to Main"
2. 点击运行
3. 输入提交消息（可选）
4. 确认推送

### 使用自定义命令
在Warp终端中直接输入：
```bash
# 推送到主分支
push

# 部署应用
deploy

# 运行测试
test
```

## 💡 高级功能

### 自定义工作流
编辑 `.warp/.warp-workflows` 文件添加新的工作流。

### 修改快捷键
在 `.warp/config.yaml` 中修改 `hotkey` 值。

### 添加参数
工作流支持动态参数，可以在运行时提示用户输入。

## 📝 注意事项

1. **Git凭据**：确保已配置Git凭据
2. **网络连接**：推送功能需要网络连接
3. **权限**：确保有仓库的推送权限

## 🆘 故障排除

如果遇到问题：

1. 检查 `.warp` 目录权限
2. 确认脚本文件存在且可执行
3. 查看Warp日志：`~/.warp/logs/`
4. 尝试手动运行脚本测试

## 📞 获取帮助

- Warp文档：https://docs.warp.dev/
- GitHub仓库：https://github.com/litom914295/mksaas_qiflowai
- 问题反馈：在项目中创建Issue

---

✨ **提示**：工作流会自动保存您的使用历史和偏好设置！