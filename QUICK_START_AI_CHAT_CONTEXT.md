# 🚀 AI-Chat 上下文感知功能 - 快速集成清单

> 用时: 10-15 分钟 | 难度: ⭐⭐☆☆☆

## ✅ 集成步骤

### 步骤 1: 添加 AnalysisContextProvider (2分钟)

找到应用的根布局文件，添加 Context Provider：

```tsx
// app/[locale]/layout.tsx

import { AnalysisContextProvider } from '@/contexts/analysis-context';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AnalysisContextProvider>
          {/* 你的现有内容 */}
          {children}
        </AnalysisContextProvider>
      </body>
    </html>
  );
}
```

**检查点**: 
- ✅ 文件编译无错误
- ✅ 应用可以正常运行

---

### 步骤 2: 在 unified-form 页面使用新组件 (3分钟)

#### 选项 A: 使用示例模板（推荐）

```bash
# 复制示例文件
cp app/[locale]/unified-form/page.example.tsx app/[locale]/unified-form/page.tsx
```

#### 选项 B: 手动修改现有页面

```tsx
// app/[locale]/unified-form/page.tsx

import { AIChatWithContext } from '@/components/qiflow/ai-chat-with-context';
import { UnifiedAnalysisForm } from './components/UnifiedAnalysisForm';

export default function UnifiedFormPage() {
  return (
    <div>
      {/* 你的页面内容 */}
      <UnifiedAnalysisForm />
      
      {/* 添加这一行 - 上下文感知的 AI-Chat */}
      <AIChatWithContext />
    </div>
  );
}
```

**检查点**:
- ✅ 页面可以正常访问
- ✅ 右下角出现聊天悬浮球

---

### 步骤 3: 验证功能 (5分钟)

1. **访问页面**: 打开 `http://localhost:3000/zh-CN/unified-form`

2. **填写表单**: 输入个人信息和房屋信息
   - 出生日期
   - 性别
   - 房屋朝向
   - 建造年份

3. **观察悬浮球**: 
   - ✅ 悬浮球上应该出现绿色 Sparkles 徽章
   - ✅ 鼠标悬停时显示 "已加载您的信息"

4. **生成分析**: 点击"开始分析"按钮

5. **测试 AI 对话**:
   - 点击聊天悬浮球
   - ✅ 欢迎消息应该包含您的称呼（先生/女士）
   - ✅ 推荐问题应该与您的分析结果相关
   - 询问: "我的财位在哪里？"
   - ✅ AI 应该基于您的具体信息回答，而不是要求您提供生日等信息

---

### 步骤 4: 测试智能模式切换 (2分钟)

1. 在聊天窗口，点击头部的 **Info 图标** (ℹ️)
2. ✅ 底部提示应该从 "✨ 智能模式已启用" 变为 "普通对话模式"
3. 询问同样的问题
4. ✅ AI 应该会要求您提供更多信息
5. 再次点击 Info 图标切换回智能模式

---

## 🎉 完成！

现在你的应用已经集成了上下文感知的 AI-Chat 功能！

## 🔍 常见问题排查

### Q1: 悬浮球没有绿色徽章？

**原因**: 上下文数据未保存

**解决**:
1. 检查是否添加了 `AnalysisContextProvider`
2. 检查 `UnifiedAnalysisForm` 是否使用了 `useAnalysisContextOptional()`
3. 打开浏览器控制台，输入:
   ```js
   // 检查 Context 状态
   React.getContext()
   ```

### Q2: AI 还是在询问我的生日？

**原因**: 上下文未传递到 API

**解决**:
1. 打开浏览器开发者工具 → Network 面板
2. 查找 `/api/ai/chat` 请求
3. 检查请求体是否包含 `context` 和 `enableContext` 字段
4. 检查控制台日志是否有: `[AI Chat] Context-enhanced mode enabled`

### Q3: 组件报错 "Cannot read property of undefined"

**原因**: Context Provider 未正确设置

**解决**:
1. 确认 `AnalysisContextProvider` 在组件树的最外层
2. 确认使用的是 `useAnalysisContextOptional()` 而不是 `useAnalysisContext()`
3. 检查导入路径是否正确

### Q4: 编译错误 "Module not found"

**原因**: 新文件未被识别

**解决**:
```bash
# 重启开发服务器
npm run dev
```

---

## 📊 性能检查

运行以下命令检查组件性能:

```tsx
// 在任意组件中
import { useAnalysisContextOptional } from '@/contexts/analysis-context';

function DebugComponent() {
  const context = useAnalysisContextOptional();
  
  console.group('🔍 Context Debug Info');
  console.log('Context exists:', !!context);
  console.log('Has user input:', !!context?.userInput);
  console.log('Has analysis result:', !!context?.analysisResult);
  console.log('Context summary length:', context?.getAIContextSummary().length);
  console.groupEnd();
  
  return null;
}
```

**预期输出**:
```
🔍 Context Debug Info
  Context exists: true
  Has user input: true
  Has analysis result: true
  Context summary length: 456
```

---

## 🎯 下一步

完成集成后，你可以:

1. **自定义欢迎消息**
   ```tsx
   <AIChatWithContext 
     welcomeMessage="自定义欢迎语"
   />
   ```

2. **调整推荐问题**
   ```tsx
   <AIChatWithContext 
     suggestedQuestions={[
       '我的运势如何？',
       '如何改善风水？',
     ]}
   />
   ```

3. **扩展上下文数据**
   - 参考 `docs/ai-chat-context-integration.md`
   - 修改 `UserInputData` 类型
   - 自定义 `getAIContextSummary()` 方法

4. **集成到其他页面**
   - 在分析结果页
   - 在用户个人中心
   - 在任何需要 AI 助手的地方

---

## 📚 完整文档

详细文档请查看: `docs/ai-chat-context-integration.md`

包含:
- 架构设计
- API 详细说明
- 高级配置
- 性能优化
- 最佳实践

---

## 💬 需要帮助？

- 📖 查看完整文档: `docs/ai-chat-context-integration.md`
- 🐛 提交 Issue
- 💡 查看示例: `app/[locale]/unified-form/page.example.tsx`

---

**祝集成顺利！** 🎊
