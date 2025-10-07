# 🚀 快速测试智能解析功能

## ⚡ 立即开始

### 1. 重启开发服务器

**PowerShell执行**:
```powershell
.\restart-dev.ps1
```

或者手动执行：
```powershell
# 停止服务器
Get-Process node | Stop-Process -Force

# 清除缓存
Remove-Item -Recurse -Force .next

# 启动
npm run dev
```

### 2. 等待编译完成

看到以下信息表示成功：
```
✓ Ready in 15s
```

### 3. 打开浏览器测试

访问: **http://localhost:3000/zh-CN/ai-chat**

### 4. 输入测试数据

在聊天框中输入：
```
1973年1月7日2点30分男性岳阳
```

## ✅ 预期结果

应该立即看到：

```
✨ **已为您自动完成八字分析！**

📅 **出生信息**
- 日期：1973-01-07
- 时间：02:30
- 性别：男
- 地点：岳阳

**📊 四柱命盘**
[完整的八字信息]

**🌟 五行分布**
[五行统计]

💡 现在您可以继续询问关于性格、事业、财运等问题！
```

## 🐛 如果还是显示旧消息

### 检查点 1: 确认服务器已重启
```powershell
netstat -ano | findstr ":3000"
```
应该看到新的进程ID

### 检查点 2: 查看控制台日志
应该看到类似的调试日志：
```
📝 [DEBUG] User message: 1973年1月7日2点30分男性岳阳
🎯 [DEBUG] Parsed result: { type: 'bazi', confidence: 0.8, ... }
✅ [DEBUG] 信息完整，开始自动分析...
```

### 检查点 3: 浏览器开发者工具
1. 按 F12 打开开发者工具
2. 切换到 Network 标签
3. 发送消息
4. 查看 `/api/ai/chat` 请求
5. 检查 Response 内容

## 📊 调试模式

如果需要更多日志，编辑 `src/app/api/ai/chat/route.ts`:

```typescript
// 在 line 185 附近添加
console.log('📝 [DEBUG] User message:', message);
console.log('🎯 [DEBUG] Parsed result:', parsed);
console.log('✅ [DEBUG] Birth info:', birthInfo);
```

## 🔍 验证代码是否生效

### 快速验证脚本
```powershell
# 检查文件最后修改时间
(Get-Item "src\app\api\ai\chat\route.ts").LastWriteTime

# 应该是最近几分钟内
```

### 验证内容是否包含智能解析
```powershell
Select-String -Path "src\app\api\ai\chat\route.ts" -Pattern "InputParser" -Context 0,2
```

应该看到：
```
import { InputParser } from '@/lib/qiflow/ai/input-parser';
const parsed = InputParser.parseInput(message);
```

## ✨ 其他测试用例

### 测试 2: 信息不完整
输入：
```
1990年1月1日出生
```

预期：提示需要补充"性别、出生时间"

### 测试 3: ISO格式
输入：
```
1985-03-15 08:00 女
```

预期：正常解析并自动分析

### 测试 4: 口语化
输入：
```
我是1992年5月20日晚上8点出生的女生
```

预期：识别并自动分析

## 📞 需要帮助？

1. 确保所有文件都已保存
2. 确保服务器已完全重启（不是热重载）
3. 清除浏览器缓存（Ctrl+Shift+Delete）
4. 检查控制台是否有错误

---

**更新时间**: 2025-01-06  
**状态**: ✅ 代码已就绪，等待测试
