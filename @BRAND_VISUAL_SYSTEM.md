# QiFlow AI 品牌视觉系统

生成时间: 2025-01-31  
版本: 1.0  
设计理念: 东方智慧 × 现代科技

---

## 🎨 Logo 设计

### 核心创意

QiFlow AI 的 Logo 融合了三个核心元素：

1. **Q 字母** - 代表 QiFlow 品牌名称
2. **罗盘/指南针** - 象征方位、方向、风水定位
3. **能量波浪** - 表达气流（Qi Flow）、能量流动

### Logo 构成

```
┌─────────────────────────────────┐
│   罗盘外圈（刻度）                 │
│     ↓                            │
│   能量波浪（4层渐变）               │
│     ↓                            │
│   Q字母圆环                       │
│     ↓                            │
│   指南针指针（Q的尾巴）             │
│     ↓                            │
│   中心点                          │
└─────────────────────────────────┘
```

### 设计细节

#### 1. 罗盘元素
- **外圈刻度**: 8个方位标记（东南西北 + 4个次方向）
- **圆环**: 双层圆环，营造立体感
- **中心点**: 三层同心圆（渐变 → 白色 → 紫色核心）

#### 2. 能量波浪（4层）
- **第1层（外层）**: 紫色 `#9333EA` - 代表灵性、智慧
- **第2层**: 粉色 `#EC4899` - 代表情感、人际
- **第3层**: 蓝色 `#3B82F6` - 代表理性、分析
- **第4层（内层）**: 青色 `#06B6D4` - 代表清晰、流动

#### 3. 动画效果
- 能量波浪呼吸效果（透明度 0.6 ↔ 0.9）
- 3秒循环，交错动画营造流动感
- 指针中心点脉动效果（半径 3px ↔ 4px）

---

## 🎨 品牌色彩系统

### 主色调（Primary Colors）

#### 1. 紫色系 - Purple
```css
--qi-purple-50:  #FAF5FF
--qi-purple-100: #F3E8FF
--qi-purple-200: #E9D5FF
--qi-purple-300: #D8B4FE
--qi-purple-400: #C084FC
--qi-purple-500: #A855F7  /* 主紫色 */
--qi-purple-600: #9333EA  ★ 品牌主色
--qi-purple-700: #7E22CE
--qi-purple-800: #6B21A8
--qi-purple-900: #581C87
```

**用途**:
- 主要 CTA 按钮
- Logo 主体
- 重要标题
- 高亮元素

#### 2. 粉色系 - Pink
```css
--qi-pink-50:  #FDF2F8
--qi-pink-100: #FCE7F3
--qi-pink-200: #FBCFE8
--qi-pink-300: #F9A8D4
--qi-pink-400: #F472B6
--qi-pink-500: #EC4899  ★ 品牌辅色
--qi-pink-600: #DB2777
--qi-pink-700: #BE185D
--qi-pink-800: #9F1239
--qi-pink-900: #831843
```

**用途**:
- 次要 CTA
- 悬停状态
- 情感化提示
- 女性化元素

#### 3. 蓝色系 - Blue
```css
--qi-blue-50:  #EFF6FF
--qi-blue-100: #DBEAFE
--qi-blue-200: #BFDBFE
--qi-blue-300: #93C5FD
--qi-blue-400: #60A5FA
--qi-blue-500: #3B82F6  ★ 品牌支撑色
--qi-blue-600: #2563EB
--qi-blue-700: #1D4ED8
--qi-blue-800: #1E40AF
--qi-blue-900: #1E3A8A
```

**用途**:
- 信息提示
- 链接
- 图表
- 理性化内容

#### 4. 青色系 - Cyan
```css
--qi-cyan-50:  #ECFEFF
--qi-cyan-100: #CFFAFE
--qi-cyan-200: #A5F3FC
--qi-cyan-300: #67E8F9
--qi-cyan-400: #22D3EE
--qi-cyan-500: #06B6D4  ★ 品牌点缀色
--qi-cyan-600: #0891B2
--qi-cyan-700: #0E7490
--qi-cyan-800: #155E75
--qi-cyan-900: #164E63
```

**用途**:
- 成功状态
- 清新元素
- 水元素相关
- 流动效果

### 功能色彩（Functional Colors）

#### 成功 - Success
```css
--qi-success: #10B981  /* Green 500 */
```

#### 警告 - Warning
```css
--qi-warning: #F59E0B  /* Amber 500 */
```

#### 错误 - Error
```css
--qi-error: #EF4444  /* Red 500 */
```

#### 信息 - Info
```css
--qi-info: #3B82F6  /* Blue 500 */
```

### 中性色彩（Neutral Colors）

```css
--qi-gray-50:  #F9FAFB
--qi-gray-100: #F3F4F6
--qi-gray-200: #E5E7EB
--qi-gray-300: #D1D5DB
--qi-gray-400: #9CA3AF
--qi-gray-500: #6B7280
--qi-gray-600: #4B5563
--qi-gray-700: #374151
--qi-gray-800: #1F2937
--qi-gray-900: #111827
```

---

## 🌈 渐变系统（Gradients）

### 1. 主渐变 - Primary Gradient
```css
background: linear-gradient(
  135deg,
  #9333EA 0%,   /* Purple 600 */
  #EC4899 50%,  /* Pink 500 */
  #3B82F6 100%  /* Blue 500 */
);
```

**用途**: Logo、主要背景、Hero Section

### 2. 能量渐变 - Energy Gradient
```css
background: linear-gradient(
  to right,
  #9333EA,  /* Purple */
  #EC4899,  /* Pink */
  #3B82F6,  /* Blue */
  #06B6D4   /* Cyan */
);
```

**用途**: 分析报告、能量可视化

### 3. 柔和渐变 - Soft Gradient
```css
background: linear-gradient(
  135deg,
  #FAF5FF 0%,   /* Purple 50 */
  #FDF2F8 50%,  /* Pink 50 */
  #EFF6FF 100%  /* Blue 50 */
);
```

**用途**: 卡片背景、轻量元素

### 4. 深色渐变 - Dark Gradient
```css
background: linear-gradient(
  135deg,
  #581C87 0%,   /* Purple 900 */
  #831843 50%,  /* Pink 900 */
  #1E3A8A 100%  /* Blue 900 */
);
```

**用途**: 深色模式、Footer

---

## ✏️ 字体系统（Typography）

### 字体族（Font Families）

#### 主字体 - 中文
```css
font-family: 
  "Noto Sans SC",      /* 思源黑体 */
  "PingFang SC",       /* 苹方 */
  "Microsoft YaHei",   /* 微软雅黑 */
  sans-serif;
```

#### 主字体 - 英文
```css
font-family:
  "Inter",
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

#### 标题字体
```css
font-family:
  "Noto Serif SC",     /* 思源宋体 - 典雅 */
  "Georgia",
  serif;
```

#### 代码字体
```css
font-family:
  "JetBrains Mono",
  "Fira Code",
  "Consolas",
  monospace;
```

### 字号系统（Font Sizes）

```css
--qi-text-xs:   0.75rem   /* 12px */
--qi-text-sm:   0.875rem  /* 14px */
--qi-text-base: 1rem      /* 16px */
--qi-text-lg:   1.125rem  /* 18px */
--qi-text-xl:   1.25rem   /* 20px */
--qi-text-2xl:  1.5rem    /* 24px */
--qi-text-3xl:  1.875rem  /* 30px */
--qi-text-4xl:  2.25rem   /* 36px */
--qi-text-5xl:  3rem      /* 48px */
--qi-text-6xl:  3.75rem   /* 60px */
```

### 字重系统（Font Weights）

```css
--qi-font-light:    300
--qi-font-normal:   400
--qi-font-medium:   500
--qi-font-semibold: 600
--qi-font-bold:     700
--qi-font-black:    900
```

### 行高系统（Line Heights）

```css
--qi-leading-tight:  1.25
--qi-leading-snug:   1.375
--qi-leading-normal: 1.5
--qi-leading-relaxed: 1.625
--qi-leading-loose:  2
```

---

## 📐 间距系统（Spacing）

基于 4px 网格系统：

```css
--qi-space-0:  0
--qi-space-1:  0.25rem  /* 4px */
--qi-space-2:  0.5rem   /* 8px */
--qi-space-3:  0.75rem  /* 12px */
--qi-space-4:  1rem     /* 16px */
--qi-space-5:  1.25rem  /* 20px */
--qi-space-6:  1.5rem   /* 24px */
--qi-space-8:  2rem     /* 32px */
--qi-space-10: 2.5rem   /* 40px */
--qi-space-12: 3rem     /* 48px */
--qi-space-16: 4rem     /* 64px */
--qi-space-20: 5rem     /* 80px */
--qi-space-24: 6rem     /* 96px */
```

---

## 🎭 阴影系统（Shadows）

```css
/* 轻阴影 */
--qi-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

/* 标准阴影 */
--qi-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
             0 1px 2px 0 rgba(0, 0, 0, 0.06);

/* 中阴影 */
--qi-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                0 2px 4px -1px rgba(0, 0, 0, 0.06);

/* 大阴影 */
--qi-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                0 4px 6px -2px rgba(0, 0, 0, 0.05);

/* 超大阴影 */
--qi-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
                0 10px 10px -5px rgba(0, 0, 0, 0.04);

/* 内阴影 */
--qi-shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);

/* 品牌渐变阴影 */
--qi-shadow-brand: 0 10px 40px -10px rgba(147, 51, 234, 0.3);
```

---

## 🔘 圆角系统（Border Radius）

```css
--qi-radius-none: 0
--qi-radius-sm:   0.125rem  /* 2px */
--qi-radius:      0.25rem   /* 4px */
--qi-radius-md:   0.375rem  /* 6px */
--qi-radius-lg:   0.5rem    /* 8px */
--qi-radius-xl:   0.75rem   /* 12px */
--qi-radius-2xl:  1rem      /* 16px */
--qi-radius-3xl:  1.5rem    /* 24px */
--qi-radius-full: 9999px    /* 完全圆形 */
```

---

## 🎬 动画系统（Animations）

### 缓动函数（Easing）

```css
--qi-ease-linear:     cubic-bezier(0, 0, 1, 1)
--qi-ease-in:         cubic-bezier(0.4, 0, 1, 1)
--qi-ease-out:        cubic-bezier(0, 0, 0.2, 1)
--qi-ease-in-out:     cubic-bezier(0.4, 0, 0.2, 1)
--qi-ease-bounce:     cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### 持续时间（Duration）

```css
--qi-duration-fast:    150ms
--qi-duration-base:    300ms
--qi-duration-slow:    500ms
--qi-duration-slower:  700ms
```

### 常用动画

#### 1. 淡入淡出
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

#### 2. 能量脉动
```css
@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.9; }
}
```

#### 3. 流动效果
```css
@keyframes flow {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

---

## 🖼️ Logo 使用规范

### Logo 尺寸

| 用途 | 尺寸 | 文件 |
|------|------|------|
| 网站 Header | 40-48px 高度 | `logo.svg` |
| Favicon | 32x32px, 64x64px | `icon.svg` |
| 社交媒体头像 | 400x400px | `logo.svg` |
| 名片 | 最小 20mm 宽度 | `logo.svg` |

### 最小尺寸

- **最小宽度**: 32px（保证细节可见）
- **最小高度**: 32px

### 安全区域

Logo 周围至少保留 Logo 高度 1/4 的空白区域

```
┌──────────────────────┐
│                      │
│   ┌────────────┐    │
│   │   LOGO     │    │  ← 1/4 高度间距
│   └────────────┘    │
│                      │
└──────────────────────┘
```

### 颜色变体

#### 1. 彩色版（推荐）
- 用于白色或浅色背景
- 完整渐变色彩

#### 2. 白色版
```css
filter: brightness(0) invert(1);
```
- 用于深色背景
- 保留所有细节

#### 3. 单色版（紫色）
```css
filter: grayscale(100%) sepia(100%) hue-rotate(250deg) saturate(500%);
```
- 用于单色印刷
- 保持品牌识别度

### 禁止事项

❌ 不要拉伸或压缩 Logo  
❌ 不要改变 Logo 颜色（除非使用规定变体）  
❌ 不要添加边框或阴影（除非设计系统规定）  
❌ 不要旋转 Logo  
❌ 不要将 Logo 放在复杂背景上  

---

## 📱 响应式设计

### 断点系统（Breakpoints）

```css
/* Mobile First */
--qi-screen-sm:  640px   /* 手机横屏 */
--qi-screen-md:  768px   /* 平板竖屏 */
--qi-screen-lg:  1024px  /* 平板横屏 / 小笔记本 */
--qi-screen-xl:  1280px  /* 桌面 */
--qi-screen-2xl: 1536px  /* 大屏 */
```

### Logo 响应式规则

```css
/* Mobile: 36px */
@media (max-width: 640px) {
  .logo { height: 36px; }
}

/* Tablet: 40px */
@media (min-width: 641px) and (max-width: 1024px) {
  .logo { height: 40px; }
}

/* Desktop: 48px */
@media (min-width: 1025px) {
  .logo { height: 48px; }
}
```

---

## 🎯 应用示例

### 按钮样式

#### 主按钮（Primary）
```css
.btn-primary {
  background: linear-gradient(135deg, #9333EA 0%, #EC4899 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(147, 51, 234, 0.4);
}
```

#### 次按钮（Secondary）
```css
.btn-secondary {
  background: transparent;
  color: #9333EA;
  border: 2px solid #9333EA;
  padding: 10px 22px;
  border-radius: 8px;
}
```

### 卡片样式

```css
.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 300ms ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

---

## 📂 资源文件

| 文件 | 路径 | 用途 |
|------|------|------|
| 主 Logo SVG | `/public/logo.svg` | 网站、文档 |
| 图标 SVG | `/public/icon.svg` | Favicon、小图标 |
| 品牌指南 | `@BRAND_VISUAL_SYSTEM.md` | 设计参考 |

---

## 🔄 版本历史

- **v1.0** (2025-01-31): 初始版本，创建完整品牌视觉系统

---

**品牌所有权**: QiFlow AI  
**设计团队**: AI Agent  
**状态**: ✅ 生产就绪
