# AI八字风水大师修复指南

## 问题描述

AI八字风水大师无法正常回答用户问题，总是返回通用的错误信息。

## 问题根源

1. **缺少环境变量配置**：没有配置AI服务提供商的API密钥
2. **AI路由器调用错误**：使用了错误的方法名调用AI路由器
3. **错误处理不完善**：当AI服务不可用时，回退机制不够智能

## 修复方案

### 1. 配置环境变量

运行以下命令创建环境变量文件：

```bash
npm run setup:env
```

然后编辑 `.env.local` 文件，至少配置一个AI服务提供商的API密钥：

```bash
# 至少配置一个AI服务提供商
OPENAI_API_KEY=sk-your-openai-api-key-here
# 或者
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
# 或者
GEMINI_API_KEY=your-gemini-api-key-here
# 或者
DEEPSEEK_API_KEY=sk-your-deepseek-key-here
```

### 2. 配置Supabase

在 `.env.local` 文件中配置Supabase相关变量：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
```

### 3. 验证配置

运行以下命令检查配置状态：

```bash
npm run setup:env check
```

### 4. 启动开发服务器

```bash
npm run dev
```

## 修复内容

### 1. 修复AI路由器调用

- 将 `aiRouter.route()` 改为 `aiRouter.chat()`
- 修复AI响应数据结构访问

### 2. 改进错误处理

- 添加智能回退响应机制
- 基于用户意图生成不同的回退内容
- 提供更友好的错误提示

### 3. 优化响应生成

- 修复AI响应格式问题
- 改进置信度计算
- 增强类型安全性

## 测试修复结果

1. 访问 `http://localhost:3000/zh-CN/chat`
2. 输入测试消息，如：
   - "你好，我是谁"
   - "你能干什么"
   - "帮我分析八字"
3. 检查AI是否能够正常回复

## 预期结果

修复后，AI八字风水大师应该能够：

1. **正常回复**：不再返回通用的错误信息
2. **智能回退**：当AI服务不可用时，提供基于传统理论的回退响应
3. **专业回答**：根据用户意图提供相应的八字或风水分析建议
4. **友好提示**：引导用户提供必要的信息进行分析

## 故障排除

如果修复后仍有问题：

1. **检查控制台错误**：查看浏览器控制台和终端是否有错误信息
2. **验证API密钥**：确认API密钥格式正确且有效
3. **检查网络连接**：确保能够访问AI服务提供商的API
4. **查看日志**：检查服务器日志中的详细错误信息

## 配置说明

详细的API密钥获取和配置说明请参考：

- `AI_API_SETUP_GUIDE.md` - 完整的API配置指南
- `env.local.example` - 环境变量配置示例

## 技术细节

修复涉及的主要文件：

- `src/lib/ai/algorithm-integration-service.ts` - 算法集成服务
- `src/lib/ai/router.ts` - AI路由器
- `src/app/api/chat/route.ts` - 聊天API接口
- `scripts/setup-env.js` - 环境配置脚本
