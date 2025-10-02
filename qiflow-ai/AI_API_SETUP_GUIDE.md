# AI八字风水大师 - API密钥配置指南

## 🚀 快速配置

### 方法1: 使用自动配置脚本 (推荐)

```bash
# 运行配置助手
npm run setup:env

# 按照提示输入配置信息
# 脚本会自动生成 .env.local 文件
```

### 方法2: 手动配置

#### 1. 创建环境变量文件

在项目根目录创建 `.env.local` 文件：

```bash
# 复制示例文件
cp env.local.example .env.local
```

### 2. 配置AI服务提供商

**重要：** AI对话大师功能需要配置多个AI模型以支持智能路由和故障转移。建议配置至少2-3个提供商。

#### 支持的AI模型层级

根据代码分析，系统使用四层处理策略：

1. **缓存层** - 内存缓存，避免重复请求
2. **模板层** - 预定义模板生成响应
3. **精简层** - 低成本模型 (gpt-4o-mini, claude-3-haiku, gemini-1.5-flash, deepseek-chat)
4. **完整层** - 高质量模型 (gpt-4o, claude-3-5-sonnet, gemini-1.5-pro)

#### 必需配置（至少选择一个）

#### OpenAI (推荐 - 支持精简和完整模型)

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
```

**支持的模型：**

- 精简层：`gpt-4o-mini` (低成本，快速响应) - $0.00015/$0.0006 per 1K tokens
- 完整层：`gpt-4o` (高质量，复杂分析) - $0.005/$0.015 per 1K tokens
- 其他：`gpt-4-turbo`, `gpt-3.5-turbo`

**获取方式：**

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册/登录账户
3. 进入 API Keys 页面
4. 点击 "Create new secret key"
5. 复制生成的密钥

#### Anthropic Claude (推荐 - 教育风格首选)

```bash
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
ANTHROPIC_BASE_URL=https://api.anthropic.com/v1
```

**支持的模型：**

- 精简层：`claude-3-haiku-20240307` (快速响应) - $0.00025/$0.00125 per 1K tokens
- 完整层：`claude-3-5-sonnet-20241022` (高质量分析) - $0.003/$0.015 per 1K tokens
- 其他：`claude-3-5-haiku-20241022`, `claude-3-sonnet-20240229`

**获取方式：**

1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 注册/登录账户
3. 进入 API Keys 页面
4. 点击 "Create Key"
5. 复制生成的密钥

#### Google Gemini (推荐 - 多语言支持)

```bash
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
```

**支持的模型：**

- 精简层：`gemini-1.5-flash` (快速响应) - $0.000075/$0.0003 per 1K tokens
- 完整层：`gemini-1.5-pro` (高质量分析) - $0.00125/$0.005 per 1K tokens
- 其他：`gemini-1.0-pro`

**获取方式：**

1. 访问 [Google AI Studio](https://aistudio.google.com/)
2. 使用Google账户登录
3. 进入 API Keys 页面
4. 点击 "Create API Key"
5. 复制生成的密钥

#### DeepSeek (推荐 - 中文优化)

```bash
DEEPSEEK_API_KEY=sk-your-deepseek-key-here
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
```

**支持的模型：**

- 精简层：`deepseek-chat` (中文优化，成本低) - $0.00014/$0.00028 per 1K tokens
- 完整层：`deepseek-chat` (中文理解能力强) - $0.00014/$0.00028 per 1K tokens
- 其他：`deepseek-reasoner`

**获取方式：**

1. 访问 [DeepSeek Platform](https://platform.deepseek.com/)
2. 注册/登录账户
3. 进入 API Keys 页面
4. 点击 "Create API Key"
5. 复制生成的密钥

### 3. 配置Supabase (必需)

Supabase是项目的核心数据库和认证服务，必须正确配置才能使用AI对话功能。

#### 3.1 创建Supabase项目

1. **访问Supabase官网**：https://supabase.com
2. **注册/登录账户**：使用GitHub、Google或邮箱注册
3. **创建新项目**：
   - 点击 "New Project"
   - 选择组织（或创建新组织）
   - 输入项目名称：`qiflow-ai`
   - 设置数据库密码（请记住此密码）
   - 选择地区：`Asia Pacific (Singapore)` 或 `Asia Pacific (Tokyo)`
   - 点击 "Create new project"

#### 3.2 获取API密钥

1. **进入项目设置**：
   - 在项目仪表板中，点击左侧菜单的 "Settings"
   - 选择 "API" 选项卡

2. **复制配置信息**：

   ```bash
   # 项目URL
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

   # 匿名密钥（公开，用于客户端）
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # 服务角色密钥（私有，仅服务端使用）
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

#### 3.3 配置数据库

1. **获取数据库连接字符串**：
   - 在API设置页面，找到 "Database" 部分
   - 复制 "Connection string" 中的URI
   - 替换 `[YOUR-PASSWORD]` 为您设置的数据库密码

2. **配置环境变量**：
   ```bash
   # 数据库连接字符串
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
   ```

#### 3.4 启用必要的数据库功能

1. **启用Row Level Security (RLS)**：
   - 在项目仪表板中，点击 "Authentication" > "Policies"
   - 确保启用了RLS

2. **创建必要的表**：
   - 项目已包含数据库迁移脚本
   - 运行 `npm run db:migrate` 创建表结构

#### 3.5 验证Supabase配置

1. **测试连接**：
   ```bash
   npm run dev
   ```
2. **检查控制台**：
   - 如果配置正确，应该看到 "Supabase connected successfully"
   - 如果出现错误，请检查API密钥是否正确

### 4. 配置数据库 (必需)

#### 4.1 数据库迁移

项目包含完整的数据库迁移脚本，会自动创建所需的表结构：

```bash
# 运行数据库迁移
npm run db:migrate

# 或者手动执行SQL脚本
psql $DATABASE_URL -f database/schema.sql
```

#### 4.2 验证数据库表

登录Supabase仪表板，在 "Table Editor" 中应该看到以下表：

- `conversation_states` - 对话状态管理
- `knowledge_graph` - 知识图谱
- `confidence_scores` - 置信度评分
- `ai_usage_metrics` - AI使用监控
- `chat_sessions` - 聊天会话
- `users` - 用户信息

### 5. 配置应用 (必需)

#### 5.1 认证配置

```bash
# 认证密钥（生成32位随机字符串）
NEXTAUTH_SECRET=your-random-secret-key-here-minimum-32-characters

# 应用URL
NEXTAUTH_URL=http://localhost:3000

# 游客会话密钥（生成32位随机字符串）
GUEST_SESSION_SECRET=your-guest-session-secret-key-here-minimum-32-characters
```

#### 5.2 生成随机密钥

**方法1：使用OpenSSL**

```bash
# 生成NEXTAUTH_SECRET
openssl rand -base64 32

# 生成GUEST_SESSION_SECRET
openssl rand -base64 32
```

**方法2：使用Node.js**

```bash
# 在项目根目录运行
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**方法3：在线生成**

- 访问：https://generate-secret.vercel.app/32
- 生成两个不同的32位密钥

#### 5.3 应用URL配置

```bash
# 开发环境
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 生产环境（部署后更新）
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🔧 验证配置

### 1. 检查环境变量

运行以下命令检查配置：

```bash
npm run dev
```

### 2. 测试AI对话功能

1. 访问 `http://localhost:3000/zh-CN/chat`
2. 在聊天界面输入测试消息
3. 检查是否收到AI回复

### 3. 查看控制台日志

如果AI功能不工作，请检查：

- 浏览器控制台是否有错误
- 终端是否有API密钥相关错误
- 网络请求是否成功

## 🚨 常见问题

### 问题1：AI不回复消息

**解决方案：**

- 检查API密钥是否正确配置
- 确认API密钥有足够的额度
- 检查网络连接

### 问题2：提示"API密钥未配置"

**解决方案：**

- 确认 `.env.local` 文件存在
- 检查环境变量名称是否正确
- 重启开发服务器

### 问题3：聊天界面无法加载

**解决方案：**

- 检查Supabase配置是否正确
- 确认数据库连接正常
- 查看浏览器控制台错误信息

## 💡 推荐配置

### 开发环境（最低配置）

```bash
# 主要使用OpenAI（支持精简和完整模型）
OPENAI_API_KEY=sk-your-openai-key
OPENAI_BASE_URL=https://api.openai.com/v1

# 备用使用DeepSeek（中文优化）
DEEPSEEK_API_KEY=sk-your-deepseek-key
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
```

### 生产环境（完整配置）

```bash
# 配置多个AI提供商以提高可用性和智能路由
OPENAI_API_KEY=sk-your-openai-key
OPENAI_BASE_URL=https://api.openai.com/v1

ANTHROPIC_API_KEY=sk-ant-your-claude-key
ANTHROPIC_BASE_URL=https://api.anthropic.com/v1

GEMINI_API_KEY=your-gemini-key
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta

DEEPSEEK_API_KEY=sk-your-deepseek-key
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
```

### 智能路由策略

系统会根据以下条件自动选择最佳模型：

1. **教育风格用户** → Claude-3.5-Sonnet (详细解释)
2. **风水主题** → DeepSeek (中文优化)
3. **西方用户** → GPT-4o-mini (英文友好)
4. **复杂分析** → 完整层模型 (GPT-4o, Claude-3.5-Sonnet)
5. **简单查询** → 精简层模型 (GPT-4o-mini, Claude-3-Haiku)

### 自定义模型选择

您可以通过环境变量自定义模型选择策略：

```bash
# 精简层模型列表 (用逗号分隔)
AI_LIGHTWEIGHT_MODELS=gpt-4o-mini,claude-3-haiku-20240307,gemini-1.5-flash,deepseek-chat

# 完整层模型列表 (用逗号分隔)
AI_FULL_MODELS=gpt-4o,claude-3-5-sonnet-20241022,gemini-1.5-pro

# 提供商优先级 (用逗号分隔，按优先级排序)
AI_PROVIDER_PRIORITY=deepseek,openai,anthropic,gemini

# 成本控制
AI_MAX_COST_PER_REQUEST=0.1
AI_ENABLE_COST_OPTIMIZATION=true
```

### 成本优化建议

- **开发阶段**：只配置1-2个提供商
- **测试阶段**：配置2-3个提供商验证路由
- **生产阶段**：配置全部4个提供商确保高可用性

## 📞 获取帮助

如果遇到问题，请：

1. 查看项目文档
2. 检查GitHub Issues
3. 联系开发团队

---

**注意：** 请妥善保管您的API密钥，不要将其提交到版本控制系统中。
