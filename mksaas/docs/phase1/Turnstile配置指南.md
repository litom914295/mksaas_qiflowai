# Phase 1: Cloudflare Turnstile 配置指南

## 🎯 目标
启用 Cloudflare Turnstile 验证码保护注册端点，防止机器人注册。

---

## 📋 配置步骤

### 1. 注册 Cloudflare Turnstile
1. 访问: https://dash.cloudflare.com/
2. 进入 **Turnstile** → **Add Site**
3. 填写信息:
   - **Site Name**: QiFlow AI
   - **Domains**: `localhost` (开发) 和 `qiflowai.com` (生产)
   - **Widget Mode**: Managed (推荐)
4. 点击 **Create** 获取:
   - **Site Key** (公开，前端使用)
   - **Secret Key** (私密，后端验证)

---

### 2. 配置环境变量
编辑 `.env.local`:
```bash
# Cloudflare Turnstile (Phase 1)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAA...  # Site Key
TURNSTILE_SECRET_KEY=0x4AAAAAAA...             # Secret Key
```

---

### 3. 启用 Turnstile
编辑 `src/config/website.ts`:
```typescript
export const websiteConfig = {
  // ...
  features: {
    enableTurnstileCaptcha: true, // ← 改为 true
    // ...
  },
};
```

---

### 4. 前端集成 (已有代码复用)
**无需修改** - 模板已包含 Turnstile 集成逻辑:
- 注册页面自动显示 Turnstile Widget
- 提交时自动携带 Token

---

### 5. 后端验证 (已有代码复用)
**无需修改** - 模板已包含验证逻辑:
- 注册 Action 自动调用 Turnstile API 验证
- 验证失败返回错误提示

---

## 🧪 测试

### 开发环境测试
1. 启动开发服务器: `npm run dev`
2. 访问注册页面
3. 应看到 Turnstile Widget (复选框)
4. 提交注册表单，验证是否正常

### 生产环境配置
1. 在 Cloudflare Dashboard 添加生产域名
2. 更新生产环境变量 (Vercel/Netlify)
3. 部署后验证

---

## ⚠️ 常见问题

### 问题 1: Widget 不显示
**原因**: Site Key 未配置或域名不匹配
**解决**: 检查 `.env.local` 和 Cloudflare Dashboard 域名设置

### 问题 2: 验证失败
**原因**: Secret Key 错误或网络问题
**解决**: 
- 检查 `.env.local` 中的 `TURNSTILE_SECRET_KEY`
- 查看服务器日志

### 问题 3: localhost 开发报错
**解决**: 在 Cloudflare Dashboard 添加 `localhost` 到 Domains

---

## ✅ 验收标准

- [ ] Turnstile Widget 正常显示在注册页面
- [ ] 勾选验证码后可以正常提交
- [ ] 未勾选时提交报错
- [ ] 后端日志显示验证成功/失败信息

---

## 📚 参考资料
- [Cloudflare Turnstile 官方文档](https://developers.cloudflare.com/turnstile/)
- [Turnstile vs reCAPTCHA 对比](https://blog.cloudflare.com/turnstile-private-captcha-alternative/)

---

**预计完成时间**: 2 小时  
**依赖**: 无  
**下一步**: Phase 1.2 - AI Compliance 规则
