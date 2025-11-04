# 国际化完成总结与后续指南

## ✅ 已完成的工作

### 1. 翻译键添加（100%完成）
已为以下模块在 6 种语言中添加完整翻译键：
- ✅ **Hero 区域** (`form` 命名空间) - 表单所有字段
- ✅ **Features 区域** (`home.features`) - 功能展示卡片
- ✅ **FAQ 区域** (`faqs`) - 常见问题与答案
- ✅ **Pricing 区域** (`pricing`) - 定价套餐与功能列表
- ✅ **CTA 区域** (`cta`) - 行动召唤文本
- ✅ **Testimonials 区域** (`testimonials`) - 用户评价
- ✅ **Footer 区域** (`footer`) - 页脚链接与版权信息

### 2. 组件代码更新（部分完成）
已完成国际化的组件：
- ✅ `src/components/home/HeroWithForm.tsx` - 表单区域 + Hero 标题
- ✅ `src/components/home/FeatureShowcase.tsx` - 已有翻译键占位符

---

## 📋 待完成的组件更新

以下组件需要将硬编码文本替换为翻译函数调用。

### 优先级 1：首页核心组件
这些组件用户访问频率最高，优先完成：

#### 1. `src/components/home/PricingSection.tsx`
```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('pricing');

// 替换示例：
// 硬编码：<h2>选择适合您的套餐</h2>
// 翻译后：<h2>{t('title')}</h2>
```

#### 2. `src/components/blocks/faqs/faqs.tsx`
```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('faqs');

// 替换示例：
// 硬编码：<h2>常见问题</h2>
// 翻译后：<h2>{t('title')}</h2>

// 动态数组：
{t.raw('items').map((item: any, index: number) => (
  <div key={index}>
    <h3>{item.question}</h3>
    <p>{item.answer}</p>
  </div>
))}
```

#### 3. `src/components/blocks/calltoaction/calltoaction.tsx`
```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('cta');
```

#### 4. `src/components/blocks/testimonials/testimonials.tsx`
```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('testimonials');

// 使用 t.raw() 获取数组数据
const items = t.raw('items');
```

#### 5. `src/components/layout/footer.tsx`
```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('footer');

// 嵌套结构示例：
<span>{t('company.title')}</span>
<Link href="/about">{t('company.about')}</Link>
```

---

### 优先级 2：认证相关组件
登录/注册表单需要国际化支持多语言用户：

需要为以下组件添加翻译键：
- `src/components/auth/login-form.tsx`
- `src/components/auth/register-form.tsx`
- `src/components/auth/forgot-password-form.tsx`
- `src/components/auth/reset-password-form.tsx`

**建议翻译键结构：**
```json
{
  "auth": {
    "login": {
      "title": "登录",
      "email": "邮箱",
      "password": "密码",
      "submit": "登录",
      "forgotPassword": "忘记密码？",
      "noAccount": "还没有账号？",
      "register": "注册"
    },
    "register": {
      "title": "注册",
      "name": "姓名",
      "email": "邮箱",
      "password": "密码",
      "confirmPassword": "确认密码",
      "submit": "注册",
      "hasAccount": "已有账号？",
      "login": "登录"
    },
    // ... 更多认证相关翻译
  }
}
```

---

### 优先级 3：仪表板与设置
用户登录后的界面：

#### Dashboard 组件
- `src/components/dashboard/dashboard-header.tsx`
- `src/components/dashboard/dashboard-sidebar.tsx`
- `src/components/dashboard/sidebar-main.tsx`
- `src/components/dashboard/upgrade-card.tsx`

#### Settings 组件
- `src/components/settings/profile/update-name-card.tsx`
- `src/components/settings/profile/update-avatar-card.tsx`
- `src/components/settings/security/update-password-card.tsx`
- `src/components/settings/security/delete-account-card.tsx`
- `src/components/settings/credits/credit-packages.tsx`
- `src/components/settings/credits/credit-transactions.tsx`

**建议翻译键结构：**
```json
{
  "dashboard": {
    "welcome": "欢迎回来",
    "overview": "概览",
    "analytics": "分析",
    "settings": "设置"
  },
  "settings": {
    "profile": {
      "title": "个人资料",
      "name": "姓名",
      "email": "邮箱",
      "avatar": "头像",
      "updateSuccess": "更新成功"
    },
    "security": {
      "title": "安全设置",
      "currentPassword": "当前密码",
      "newPassword": "新密码",
      "confirmPassword": "确认密码",
      "changePassword": "修改密码"
    },
    "credits": {
      "title": "积分管理",
      "balance": "当前余额",
      "transactions": "交易记录",
      "buyCredits": "购买积分"
    }
  }
}
```

---

### 优先级 4：QiFlow 业务组件
核心业务逻辑相关：

- `src/components/qiflow/homepage/Hero.tsx`
- `src/components/qiflow/homepage/HowItWorks.tsx`
- `src/components/qiflow/homepage/FAQ.tsx`
- `src/components/qiflow/homepage/Testimonials.tsx`
- `src/components/qiflow/homepage/CTASection.tsx`

**建议翻译键结构：**
```json
{
  "qiflow": {
    "hero": {
      "title": "AI驱动的命理分析",
      "subtitle": "精准、快速、专业",
      "cta": "立即体验"
    },
    "howItWorks": {
      "title": "如何使用",
      "step1": {
        "title": "输入信息",
        "description": "填写出生日期和时间"
      },
      "step2": {
        "title": "AI分析",
        "description": "系统自动生成报告"
      },
      "step3": {
        "title": "查看结果",
        "description": "获得专业命理解读"
      }
    }
  }
}
```

---

## 🛠️ 实施步骤

### 步骤 1：为每个组件添加翻译 Hook
```tsx
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('namespaceHere');
  
  // 使用 t() 函数
  return <h1>{t('keyHere')}</h1>;
}
```

### 步骤 2：替换硬编码文本
在组件中查找所有中文字符串，替换为 `t('key')` 调用。

**查找中文文本的正则表达式：**
```regex
['"`][\u4e00-\u9fa5]+.*?['"`]
```

### 步骤 3：动态数据处理
对于列表/数组数据，使用 `t.raw()`：
```tsx
const items = t.raw('items') as Array<{title: string; description: string}>;

items.map((item, index) => (
  <div key={index}>
    <h3>{item.title}</h3>
    <p>{item.description}</p>
  </div>
))
```

### 步骤 4：条件渲染
```tsx
{isLoggedIn ? t('welcome', {name: userName}) : t('login')}
```

---

## 📝 翻译键命名规范

1. **命名空间按功能模块划分**：
   - `home` - 首页
   - `auth` - 认证
   - `dashboard` - 仪表板
   - `settings` - 设置
   - `qiflow` - 业务功能
   - `common` - 通用文本

2. **键名使用驼峰命名法**：
   - `title`, `subtitle`, `description`
   - `submitButton`, `cancelButton`
   - `errorMessage`, `successMessage`

3. **嵌套结构不超过3层**：
   - ✅ 好：`settings.profile.title`
   - ❌ 差：`settings.profile.personal.basic.title`

---

## 🧪 测试清单

完成组件更新后，请逐一测试：

- [ ] 切换到中文（简体），检查所有文本显示正常
- [ ] 切换到中文（繁体），检查所有文本显示正常
- [ ] 切换到英文，检查所有文本显示正常
- [ ] 切换到日文，检查所有文本显示正常
- [ ] 切换到韩文，检查所有文本显示正常
- [ ] 切换到马来文，检查所有文本显示正常
- [ ] 检查表单验证消息是否国际化
- [ ] 检查错误提示消息是否国际化
- [ ] 检查成功提示消息是否国际化
- [ ] 检查日期/时间格式是否本地化
- [ ] 检查数字/货币格式是否本地化

---

## 🚀 快速命令

### 查找所有包含硬编码中文的文件
```bash
# PowerShell
Get-ChildItem -Path "src/components" -Filter "*.tsx" -Recurse | Select-String -Pattern "[\u4e00-\u9fa5]+"
```

### 统计未国际化的组件数量
```bash
# PowerShell
(Get-ChildItem -Path "src/components" -Filter "*.tsx" -Recurse | Select-String -Pattern "[\u4e00-\u9fa5]+" | Select-Object -Property Path -Unique).Count
```

---

## 📚 参考资源

- Next-intl 官方文档: https://next-intl-docs.vercel.app/
- 项目翻译文件目录: `messages/`
- 已完成的示例组件: `src/components/home/HeroWithForm.tsx`

---

## ⚡ 加速建议

为了快速完成剩余组件的国际化，建议：

1. **批量处理同类组件**：一次性处理所有 auth 组件、所有 dashboard 组件等
2. **使用 VSCode 扩展**：安装 i18n Ally 扩展，可视化管理翻译键
3. **复用翻译键**：通用文本（如"确认"、"取消"）放在 `common` 命名空间复用
4. **分阶段测试**：完成一个模块后立即测试，避免积累问题

---

**当前进度：约 15% 完成**

已完成核心表单和 Features 区域，建议按优先级顺序逐步完成剩余组件。

预计全部完成需要：
- 优先级 1：2-3 小时
- 优先级 2：3-4 小时
- 优先级 3：4-5 小时
- 优先级 4：5-6 小时

**总计：约 14-18 小时工作量**

需要我帮你继续完成特定组件的国际化吗？请告诉我你想优先处理哪个区域！
