# 问题诊断和修复建议

**日期**: 2025-10-31  
**问题严重程度**: 高

---

## 🚨 发现的问题

### 1. 硬编码中文文本（已部分修复）

**问题描述**:  
多个页面包含硬编码的中文文本，未使用国际化(i18n)系统，导致英文等其他语言环境下显示错误。

**影响范围**:
- ✅ `unified-form/page.tsx` - 分析按钮文本（已修复）
- ⚠️ `unified-form/page.tsx` - 其他大量硬编码文本（待修复）
- ⚠️ 多个其他页面组件

**已修复**:
```typescript
// 之前：
正在分析中...
获取生成化专属分析报告

// 现在：
{t('guestAnalysis.analyzing')}
{t('guestAnalysis.analysisReady.startAnalysis')}
```

**待修复位置** (unified-form/page.tsx):
- Line 568: "出生时辰 *"
- Line 587: "出生城市 (可选)"
- Line 607: "房屋风水必填"
- Line 634: "房屋朝向"
- Line 640: "输入度数（0-360）"
- Line 654: "罗盘选择"
- Line 658: "关于：可用罗盘选择或获取更精确的方向"
- Line 664: "房间数量"
- Line 672-680: 房间选项 ("一室", "二室"等)
- Line 686: "标准户型（可选）"
- Line 697-701: 户型选项
- Line 710: "房屋平面图（可选）"
- Line 745: "请填完所需必填的个人必填"
- Line 759-783: 服务亮点列表
- Line 793: "用户反馈"
- Line 834-841: 隐私声明

**修复建议**:
```typescript
// 需要在 messages/zh-CN.json 和 messages/en.json 中添加以下键：
"UnifiedForm": {
  "personal": {
    "birthTime": "出生时辰",
    "birthTimeRequired": "出生时辰 *",
    "birthCity": "出生城市",
    "birthCityOptional": "出生城市 (可选)"
  },
  "house": {
    "title": "房屋风水必填",
    "direction": "房屋朝向",
    "directionPlaceholder": "输入度数（0-360）",
    "compassSelect": "罗盘选择",
    "directionHint": "关于：可用罗盘选择或获取更精确的方向",
    "roomCount": "房间数量",
    "roomCountPlaceholder": "请选择房间数量",
    "rooms": {
      "1": "一室",
      "2": "二室",
      "3": "三室",
      "4": "四室",
      "5+": "五室或更多"
    },
    "standardLayout": "标准户型（可选）",
    "layoutOptions": {
      "type1": "南北通透",
      "type2": "东西朝向",
      "type3": "全朝南方向",
      "type4": "复式结构",
      "custom": "自定义或其它"
    },
    "floorPlan": "房屋平面图（可选）"
  },
  "validation": {
    "fillRequired": "请填完所需必填的个人必填"
  },
  "features": {
    "title": "服务亮点",
    "baziAnalysis": "精准命理四柱分析",
    "fengshuiLayout": "专业玄空风水布局",
    "aiChat": "AI智能24/7在线咨询",
    "privacy": "个人隐私严格保密",
    "report": "专业报告生成即看"
  },
  "testimonials": {
    "title": "用户反馈"
  },
  "privacy": {
    "title": "🔒 隐私保密承诺",
    "content": "您的个人必填将不泄给第三方保留，代表于生成分析报告，不会用于其他目的。",
    "disclaimerTitle": "⚠️ 声明与免责声明",
    "disclaimerContent": "八字命理分析服务的分析结果仅供参考，不构成任何保证或法律承诺。请为慎重。"
  }
}
```

---

### 2. 数据库连接失败（网络问题）

**问题描述**:  
DNS 解析失败，无法连接到 Supabase 数据库。

**错误日志**:
```
❌ DNS resolution failed for db.sibwcdadrsbfkblinezj.supabase.co: getaddrinfo ENOTFOUND
❌ DNS resolution failed for sibwcdadrsbfkblinezj.pooler.supabase.net: getaddrinfo ENOTFOUND
❌ All database connection attempts failed
Error: getaddrinfo ENOTFOUND sibwcdadrsbfkblinezj.pooler.supabase.net
```

**数据库配置** (`.env`):
```env
DATABASE_URL=postgresql://postgres:****@sibwcdadrsbfkblinezj.pooler.supabase.net:5432/postgres?sslmode=require
DIRECT_DATABASE_URL=postgresql://postgres:****@db.sibwcdadrsbfkblinezj.supabase.co:5432/postgres?sslmode=require
```

**可能原因**:
1. **网络连接问题** - 无法解析 Supabase 域名
   - DNS服务器问题
   - 网络防火墙阻止
   - VPN或代理配置
   
2. **Supabase项目状态**
   - 项目已暂停/删除
   - 区域网络限制

**修复步骤**:

#### 方案A: 检查网络连接
```bash
# 1. 测试 DNS 解析
nslookup db.sibwcdadrsbfkblinezj.supabase.co
nslookup sibwcdadrsbfkblinezj.pooler.supabase.net

# 2. 测试网络连接
ping db.sibwcdadrsbfkblinezj.supabase.co
telnet sibwcdadrsbfkblinezj.pooler.supabase.net 5432

# 3. 检查 hosts 文件 (Windows)
notepad C:\Windows\System32\drivers\etc\hosts

# 4. 刷新 DNS 缓存
ipconfig /flushdns
```

#### 方案B: 修改 DNS 服务器
```
1. 打开网络设置
2. 修改DNS服务器为：
   - 首选: 8.8.8.8 (Google DNS)
   - 备用: 1.1.1.1 (Cloudflare DNS)
3. 重启网络适配器
4. 重新测试连接
```

#### 方案C: 使用本地数据库(开发环境)
```env
# 在 .env 文件中添加
ENABLE_CREDITS_DB=false

# 或使用本地 PostgreSQL
DATABASE_URL=postgresql://localhost:5432/qiflow_dev
DIRECT_DATABASE_URL=postgresql://localhost:5432/qiflow_dev
```

#### 方案D: 检查 Supabase 项目状态
1. 登录 Supabase Dashboard: https://supabase.com/dashboard
2. 检查项目是否正常运行
3. 确认项目ID: `sibwcdadrsbfkblinezj`
4. 检查数据库连接信息是否正确
5. 查看项目是否有区域限制

---

### 3. 页面加载缓慢

**问题描述**:  
"正在分析" 按钮转很久才出现分析报告页面。

**时间统计**:
```
✓ Compiled /[locale]/report in 87.8s (5817 modules)
GET /en/report 200 in 105774ms (105秒!)
```

**性能问题**:
1. **首次编译耗时**: 87.8秒
2. **页面响应时间**: 105秒
3. **模块数量**: 5817个模块

**优化建议**:

#### 1. 启用 Next.js 缓存
```javascript
// next.config.ts
const nextConfig = {
  webpack: (config) => {
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    };
    return config;
  },
};
```

#### 2. 代码分割和懒加载
```typescript
// 使用动态导入
const ReportView = dynamic(() => import('@/components/report/ReportView'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
```

#### 3. 减少模块依赖
```bash
# 分析包大小
npm run build
npx @next/bundle-analyzer

# 检查重复依赖
npm dedupe
```

#### 4. 优化数据库查询
```typescript
// 添加查询缓存
import { unstable_cache } from 'next/cache';

const getCachedAnalysis = unstable_cache(
  async (id) => await getAnalysis(id),
  ['analysis'],
  { revalidate: 3600 }
);
```

---

## 🔧 立即修复步骤

### 优先级1: 解决数据库连接（阻塞性问题）

```bash
# 1. 测试网络
ping db.sibwcdadrsbfkblinezj.supabase.co

# 2. 如果 ping 失败，尝试更改 DNS
# Windows: 控制面板 > 网络和 Internet > 网络连接 > 适配器设置

# 3. 刷新 DNS 缓存
ipconfig /flushdns

# 4. 重启开发服务器
# Ctrl+C (停止服务器)
npm run dev
```

### 优先级2: 完成国际化修复

```bash
# 1. 添加缺失的翻译键到 messages/zh-CN.json 和 messages/en.json
# 2. 更新 unified-form/page.tsx 使用 t() 函数
# 3. 测试不同语言环境
```

### 优先级3: 性能优化

```bash
# 1. 清理 .next 缓存
rm -rf .next

# 2. 重新安装依赖
npm install

# 3. 构建生产版本测试
npm run build
npm run start
```

---

## 📋 测试清单

### 数据库连接测试
- [ ] DNS 解析成功
- [ ] 网络连接通畅
- [ ] 数据库认证成功
- [ ] 查询可以执行

### 国际化测试
- [ ] 中文环境显示正确
- [ ] 英文环境显示正确
- [ ] 无硬编码中文
- [ ] 切换语言无报错

### 性能测试
- [ ] 页面加载 < 3秒
- [ ] API 响应 < 1秒
- [ ] 无内存泄漏
- [ ] 生产构建成功

---

## 📞 需要帮助？

如果问题持续，请提供以下信息：
1. 网络测试结果 (`ping`, `nslookup`)
2. Supabase 项目状态截图
3. 完整的错误日志
4. 网络环境（是否使用VPN/代理）

---

**更新时间**: 2025-10-31  
**下次检查**: 问题解决后
