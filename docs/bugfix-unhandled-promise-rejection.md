# 修复：未处理的 Promise 拒绝错误

## 问题描述
开发环境中出现 `Error: [object Event]` 错误，这是由于未处理的 Promise 拒绝（unhandled promise rejection）导致的。

## 根本原因
1. **API 路由缺少错误处理**：`/api/chat/route.ts` 中的 `streamText` 调用没有 try-catch 包裹
2. **客户端组件缺少错误处理**：`ChatBot.tsx` 没有正确处理 API 调用失败的情况
3. **缺少全局错误捕获器**：没有全局处理未捕获的 Promise 拒绝

## 已实施的修复

### 1. API 路由错误处理 (`src/app/api/chat/route.ts`)
```typescript
export async function POST(req: Request) {
  try {
    // ... existing code
    return result.toUIMessageStreamResponse({
      sendSources: true,
      sendReasoning: true,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
```

### 2. ChatBot 组件错误处理 (`src/ai/chat/components/ChatBot.tsx`)
- 添加了 `error` 状态从 `useChat` hook
- 在 UI 中显示错误消息
- 为 `sendMessage` 添加了 try-catch
- 添加了 `onError` 回调

### 3. 全局错误处理器 (`src/components/error-handlers/global-error-handler.tsx`)
创建了一个新的全局错误处理组件：
- 捕获所有未处理的 Promise 拒绝
- 捕获所有未捕获的错误
- 防止浏览器默认的错误日志行为
- 可以扩展以支持错误报告服务（如 Sentry）

组件已集成到 `src/app/providers.tsx` 中，确保在整个应用中生效。

## 测试建议
1. 测试聊天功能在 API 密钥无效时的表现
2. 测试网络断开时的错误处理
3. 测试模型配置错误时的用户反馈
4. 检查浏览器控制台确认错误被正确捕获和记录

## 预防措施
- 所有 API 路由都应该有 try-catch 错误处理
- 所有异步操作都应该有错误处理
- 客户端组件应该优雅地处理和显示错误
- 使用 TypeScript 的严格模式来捕获潜在的类型错误

## 相关文件
- `src/app/api/chat/route.ts` - API 路由错误处理
- `src/ai/chat/components/ChatBot.tsx` - 客户端错误处理
- `src/components/error-handlers/global-error-handler.tsx` - 全局错误捕获器
- `src/app/providers.tsx` - 全局错误处理器集成点
