# Shadcn UI 接入指南

## 安装步骤
1. 在项目根目录运行：
   ```bash
   cd qiflow-ai
   npx shadcn-ui@latest init
   ```
   
2. 配置选项（推荐）：
   - Style: New York（或 Default）
   - Base color: Zinc（或根据品牌选择）
   - CSS variables: Yes
   - Tailwind config: Yes
   - Components path: `src/components/ui`
   
3. 安装所需组件：
   ```bash
   npx shadcn-ui@latest add button card
   ```

## 组件替换清单

### 已创建示例
- `src/components/ui/button.tsx`（占位示例，需运行 shadcn-ui add button 覆盖）

### 待替换
- **首页 Hero CTA 按钮**：`src/components/home/hero-section.tsx`
  - 替换 `<Link className="..." >` 为 `<Button asChild><Link ...></Link></Button>`
- **功能卡片**：`src/components/home/features-section.tsx`
  - 替换 `<Link className="..." >` 为 `<Card>` 包裹
- **计费页面购买按钮**：`src/app/[locale]/page.tsx`
  - 替换 `<button>` 为 `<Button>`

## 代码示例

### Button 示例（Hero CTA）
```tsx
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// 替换前
<Link href="/..." className="inline-flex items-center ...">立即体验</Link>

// 替换后
<Button asChild variant="default" size="lg">
  <Link href="/...">立即体验</Link>
</Button>
```

### Card 示例（Features）
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// 替换前
<Link href="/..." className="group relative bg-white border...">
  <h3>标题</h3>
  <p>描述</p>
</Link>

// 替换后
<Card className="hover:shadow-xl transition-all hover:-translate-y-2">
  <Link href="/..." className="block">
    <CardHeader>
      <CardTitle>标题</CardTitle>
      <CardDescription>描述</CardDescription>
    </CardHeader>
    <CardContent>
      {/* 其他内容 */}
    </CardContent>
  </Link>
</Card>
```

## 注意事项
- Shadcn UI 会在 `components.json` 中存储配置
- 组件会自动适配 Tailwind dark 模式
- 使用 `asChild` prop 可保持原有 Link 行为
- 所有组件可直接在 `src/components/ui/` 中自定义样式

## 下一步
1. 运行安装命令
2. 逐一替换首页与落地页组件
3. 验证样式与交互无回归
4. 提交代码
