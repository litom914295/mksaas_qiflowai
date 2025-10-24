# Warp 工作流

这个目录包含了用于自动化Git操作的工作流脚本。

## 🚀 推送到主分支工作流

### 文件说明

1. **push-to-main.yml** - 完整的工作流定义文件（YAML格式）
2. **quick-push-main.ps1** - PowerShell脚本实现
3. **push-to-main.bat** - Windows批处理文件（双击运行）

### 使用方法

#### 方法1：双击批处理文件（最简单）
1. 在Windows资源管理器中导航到 `.warp\workflows` 目录
2. 双击 `push-to-main.bat`
3. 输入提交消息（或直接回车使用默认消息）
4. 等待脚本完成

#### 方法2：PowerShell命令行
```powershell
# 在项目根目录运行
.\.warp\workflows\quick-push-main.ps1

# 自定义提交消息
.\.warp\workflows\quick-push-main.ps1 -Message "feat: 添加新功能"

# 跳过验证步骤（更快）
.\.warp\workflows\quick-push-main.ps1 -SkipVerification

# 强制执行（即使没有更改）
.\.warp\workflows\quick-push-main.ps1 -Force
```

#### 方法3：创建快捷方式
1. 右键点击 `push-to-main.bat`
2. 选择"发送到" > "桌面（创建快捷方式）"
3. 现在可以从桌面直接运行

### 工作流功能

这个工作流会自动执行以下操作：

1. ✅ **检查仓库状态** - 确认当前目录是Git仓库
2. ✅ **添加所有更改** - 自动执行 `git add -A`
3. ✅ **提交更改** - 创建新的提交
4. ✅ **切换到主分支** - 如果当前不在main分支
5. ✅ **合并分支** - 将当前分支合并到main
6. ✅ **推送到远程** - 推送到GitHub
7. ✅ **验证推送** - 确认本地和远程同步
8. ✅ **显示摘要** - 提供GitHub链接和状态信息

### 高级选项

#### PowerShell脚本参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `-Message` | string | "feat: 更新代码" | Git提交消息 |
| `-SkipVerification` | switch | false | 跳过推送后的验证 |
| `-Force` | switch | false | 即使没有更改也继续执行 |

#### 示例

```powershell
# 完整示例：自定义消息并跳过验证
.\.warp\workflows\quick-push-main.ps1 -Message "fix: 修复登录问题" -SkipVerification

# 从其他分支合并到main
git checkout feature/new-feature
.\.warp\workflows\quick-push-main.ps1 -Message "feat: 完成新功能开发"
```

### 错误处理

工作流包含以下错误处理机制：

- 🔄 **自动重试** - 推送失败时自动重试3次
- 🔄 **自动拉取** - 如果远程有更新，自动拉取并重新推送
- ⚠️ **冲突检测** - 检测并提示合并冲突
- ❌ **错误恢复** - 提供错误信息和恢复建议

### 安全特性

- 验证本地和远程同步状态
- 检查Git仓库有效性
- 保留完整的提交历史
- 使用 `--no-ff` 合并以保留分支信息

### 输出信息

脚本会提供以下信息：

- 当前分支名称
- 更改的文件列表
- 提交的文件数量
- 推送状态
- GitHub仓库链接
- 提交历史链接
- GitHub Actions链接

### 故障排除

#### 问题：PowerShell执行策略错误
```powershell
# 解决方法：设置执行策略
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 问题：推送权限错误
```bash
# 确保已配置Git凭据
git config --global user.name "你的用户名"
git config --global user.email "你的邮箱"
```

#### 问题：网络连接失败
- 检查网络连接
- 验证GitHub访问
- 检查代理设置

### 自定义工作流

如需修改工作流行为，可以编辑以下文件：

1. **push-to-main.yml** - 修改工作流定义
2. **quick-push-main.ps1** - 修改PowerShell实现
3. **push-to-main.bat** - 修改批处理包装器

### 最佳实践

1. 📝 **使用有意义的提交消息**
   - ✅ 好: "feat: 添加用户认证功能"
   - ❌ 差: "更新"

2. 🔍 **定期验证推送**
   - 不要总是跳过验证步骤
   - 确保远程仓库状态正确

3. 🌿 **保持分支整洁**
   - 定期清理已合并的分支
   - 使用描述性的分支名称

4. 💾 **频繁提交**
   - 小而频繁的提交更容易管理
   - 每个提交应该是一个逻辑单元

### 相关链接

- [Git文档](https://git-scm.com/doc)
- [GitHub Actions文档](https://docs.github.com/actions)
- [PowerShell文档](https://docs.microsoft.com/powershell)

---

💡 **提示**: 建议将此工作流添加到您的日常开发流程中，以确保代码始终同步到远程仓库。