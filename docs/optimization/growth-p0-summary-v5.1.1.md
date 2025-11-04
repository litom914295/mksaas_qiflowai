# Growth P0 病毒增长最小闭环（v5.1.1）

本文档面向产品、研发、运营、风控与测试同事，完整说明 Growth P0 的目标、范围、实现、接口、配置、数据结构、风控策略、KPI 看板、运维与回归发布清单。可直接用于二次迭代、排查定位与培训交接。

---

## 目录
- 1. 项目目标与范围
- 2. 总体方案概览（闭环与指标）
- 3. 关键功能说明
  - 3.1 推荐裂变（?ref=、激活后置奖励）
  - 3.2 分享传播（链接、落地页、追踪与发奖）
  - 3.3 每日签到（自动触发、里程碑券）
  - 3.4 KPI 最小看板（K、激活率、7日留存、分享转化/拦截）
  - 3.5 风控与预算（上限/冷却/IP+指纹黑名单）
- 4. 配置项与切换
- 5. 数据结构与数据库对象
- 6. 服务端接口（API）清单
- 7. 前端接入点与路径
- 8. 运维与排障（健康检查、黑名单、迁移检查、回滚）
- 9. 回归与发布（Checklist 与 Notes）
- 10. 安全与合规（最小版）
- 11. 已知限制与后续规划

---

## 1. 项目目标与范围
- 在 7 天内打通“可控、可复用”的病毒增长最小闭环：
  1) 统一积分与激励规则
  2) 推荐裂变（?ref= 捕获 + 激活后置发奖）
  3) 分享传播（点击/停留追踪 + 发奖 + 反作弊）
  4) 自动每日签到与里程碑券
  5) KPI 最小看板与风控策略
  6) 回归与发布最小手册
- 成功标准（首版参考）：K≥0.6、注册→激活≥35%、被邀付费转化≥4%。

不在本期范围内（留待P1+）：
- 高级反作弊（设备指纹服务、图形验证、行为分析）
- 完整化 A/B 实验与多渠道 Attribution
- 深度多语言与模板化营销素材中心

---

## 2. 总体方案概览（闭环与指标）

闭环路径（示例）：
1) 用户A 完成真实使用（八字+风水 或 PDF+3轮AI） → 生成“分享链接” → B 打开链接停留 → A 获得分享奖励
2) B 通过 A 的推荐链接/码注册 → 完成“激活事件” → A 与 B 均获得推荐奖励
3) 每日首次进入即自动签到，连续 7/15/30/60/90 天得到不同“用途券”
4) 看板呈现：K 因子、激活率、7日留存、当日分享有效&拦截

主指标：
- K 因子（近似）
- 激活率（已发放推荐奖励/总推荐）
- 7 日留存（签到近似）
- 当日分享有效转化数、当日分享拦截数

---

## 3. 关键功能说明

### 3.1 推荐裂变（?ref=、激活后置奖励）
- ?ref= 捕获：全局客户端组件自动捕获 URL 参数 ?ref=CODE，先写入 localStorage，用户登录后调用 /api/referral/use 登记 pending 关系。
- 激活定义（任一满足）：
  - 路径A：八字分析 ≥1 + 风水分析 ≥1
  - 路径B：PDF 导出 ≥1 + AI 对话轮数 ≥3
- 奖励发放：满足条件后一次性双向发放（推荐人+15，被推荐人+20，当前为常量，可配置化待后续），幂等防重复。
- 奖励上限：推荐人奖励每日 3 次、每月 40 次（超过不发放，留待后续处理）。

实现要点：
- 客户端：src/components/layout/referral-handler.tsx
- 服务端：
  - 登记推荐码：src/app/api/referral/use/route.ts
  - 激活后置奖励：src/lib/growth/activation.ts（由八字/风水/PDF/对话逻辑处触发）
  - 嵌入触点：
    - 八字完成：src/actions/qiflow/calculate-bazi.ts
    - 风水完成：src/actions/qiflow/xuankong-analysis.ts
    - PDF 导出完成：src/actions/qiflow/pdf-export.ts
    - AI 对话成功：src/app/api/ai/chat/route.ts（累计对话轮数并尝试激活）

### 3.2 分享传播（链接、落地页、追踪与发奖）
- 生成分享：POST /api/share/create → 返回 /[locale]/s/{id}?ref=CODE
- 落地页：/[locale]/s/[id] 展示“今日提醒/指引”简易模板；首屏立即上报 click，停留 6 秒上报 convert。
- 追踪与发奖：POST /api/share/track
  - step=click/convert，服务端保存 IP/UA/指纹并校验：
  - 发奖限制：同日 1 次、冷却 60 分钟、黑名单拦截
  - 入账：SHARE_REWARD

实现要点：
- 创建/追踪接口：src/app/api/share/create/route.ts、src/app/api/share/track/route.ts
- 落地页模板：src/app/[locale]/s/[id]/page.tsx
- 前端按钮：src/components/growth/share-button.tsx，并集成在分析结果页头部

### 3.3 每日签到（自动触发、里程碑券）
- 自动签到：进入任意页面即尝试 /api/credits/daily-signin（客户端组件 DailySigninHandler 注入在全局布局）
- 积分不过期；幂等一天一次。
- 连续签到里程碑：7/15/30/60/90 天分别发不同用途券（幂等，券不过期）。

实现要点：
- 自动触发：src/components/layout/daily-signin-handler.tsx 注入 src/app/[locale]/layout.tsx
- 接口：src/app/api/credits/daily-signin/route.ts（积分 + 里程碑券发放）

### 3.4 KPI 最小看板（K、激活率、7日留存、分享转化/拦截）
- 路由：/[locale]/(protected)/admin/metrics（仅管理员）
- 展示：
  - K 因子（近似、人均直接推荐数）
  - 激活率（已发放奖励/总推荐）
  - 7日留存（签到近似）
  - 今日分享有效转化（发奖计数）
  - 今日分享拦截（黑名单）

实现要点：src/app/[locale]/(protected)/admin/metrics/page.tsx

### 3.5 风控与预算（上限/冷却/IP+指纹黑名单）
- 推荐奖励上限：每日 3 次、每月 40 次（src/lib/growth/activation.ts 发放前校验）
- 分享奖励限制：日上限 1 次、冷却 60 分钟；黑名单（IP/指纹）拦截
- 点击明细：share_clicks 表记录 IP/UA/指纹
- 拦截事件：fraud_events 表记录被拦截详情（用于看板与审计）
- 管理员黑名单 API：
  - GET /api/admin/fraud-blacklist/list
  - POST /api/admin/fraud-blacklist/add
  - POST /api/admin/fraud-blacklist/remove

---

## 4. 配置项与切换
- 积分/价格/激励（统一配置源）：src/config/website.tsx
  - credits.enableCredits：是否启用积分
  - credits.registerGiftCredits.amount：注册赠送积分（70）
  - credits.dailySignin.enable/amount：每日签到（自动）
  - credits.referral.inviterCredits/inviteeCredits：推荐双向奖励
- 增长配置：websiteConfig.growth.share
  - enable：开关
  - rewardCredits（默认 5）、dailyMaxRewards（默认 1）、cooldownMinutes（默认 60）
  - requireConvert（true）/ minStaySeconds（6）

建议后续：把“推荐奖励上限（每日/月度）”改为配置项（当前在 activation 中为常量）。

---

## 5. 数据结构与数据库对象（核心）
- 推荐关系：referral_relationships（status、activated_at、reward_granted）
- 推荐码：referral_codes（用户唯一）
- 分享记录：share_records（click_count、conversion_count、reward_granted、reward_amount）
- 点击明细：share_clicks（share_id、ip、user_agent、fingerprint、created_at）
- 任务进度：task_progress（ai_chat_rounds 累计轮数）
- 成就：achievements（里程碑券与激活发放标记）
- 风控黑名单：fraud_blacklist（ip、fingerprint、reason、expires_at）
- 风控事件：fraud_events（share_id、ip、fingerprint、reason、step、created_at）

---

## 6. 服务端接口（API）清单
- 推荐裂变
  - POST /api/referral/use（登记 pending）
- 分享传播
  - POST /api/share/create（生成分享链接）
  - POST /api/share/track（click/convert 追踪与发奖）
- 每日签到
  - POST /api/credits/daily-signin（自动触发 + 里程碑券）
- 管理员工具
  - GET /api/admin/health/overview（DB健康 + 24h指标）
  - GET /api/admin/fraud-blacklist/list
  - POST /api/admin/fraud-blacklist/add
  - POST /api/admin/fraud-blacklist/remove
  - GET /api/admin/referral/migration-check
  - POST /api/admin/referral/ensure-codes

---

## 7. 前端接入点与路径
- 全局注入
  - ReferralHandler：src/app/[locale]/layout.tsx（捕获 ?ref=）
  - DailySigninHandler：src/app/[locale]/layout.tsx（进入即自动签到）
- 分析结果页顶部操作（分享按钮）
  - 八字、风水：
    - src/components/qiflow/analysis/enhanced-bazi-analysis-result.tsx
    - src/components/qiflow/xuankong/enhanced-fengshui-analysis-result.tsx
    - src/components/analysis/enhanced-bazi-analysis-result.tsx
    - src/components/analysis/enhanced-fengshui-analysis-result.tsx
- KPI 看板（管理员）：/[locale]/(protected)/admin/metrics
- 落地页（访客）：/[locale]/s/[id]

---

## 8. 运维与排障（健康检查、黑名单、迁移检查、回滚）
- 健康检查与24h指标：GET /api/admin/health/overview（管理员）
- 黑名单管理：
  - 列表：GET /api/admin/fraud-blacklist/list
  - 新增：POST /api/admin/fraud-blacklist/add { ip | fingerprint }
  - 删除：POST /api/admin/fraud-blacklist/remove { id | ip | fingerprint }
- 迁移检查与回填：
  - GET /api/admin/referral/migration-check（表/视图存在性 + 计数）
  - POST /api/admin/referral/ensure-codes（为无推荐码用户回填唯一推荐码）
- 回滚建议（最小）：
  - 暂停分享奖励：将 websiteConfig.growth.share.enable 置为 false
  - 黑名单快速拦截异常源（IP/指纹）
  - 通过 git revert 回退风险提交

---

## 9. 回归与发布（Checklist 与 Notes）
- 回归清单文档：qiflowai/checklists/growth-p0-regression.md
- 发布记录模板：qiflowai/artifacts/RELEASE_NOTES_growp0.md
- 推荐手动抽测：
  - ?ref= 捕获 → 注册登录 → 完成激活路径 → 双向积分入账
  - 超过当日/当月上限验证不再发放
- 分享手动抽测：
  - 生成分享链接 → 访客浏览 → 6秒停留 → 发奖一次，同日第二次不发
  - 黑名单策略命中（拦截 + 事件记录）
- 看板联动检查：
  - KPI 指标实时刷新，黑名单拦截有计数

---

## 10. 安全与合规（最小版）
- 拒答敏感主题逻辑已在 Chat 侧（参考既有规范），增强合规模块待后续任务（P1/合规专项）。
- 黑名单/上限/冷却降低滥用风险，减少财务损失与口碑风险。
- 不回显任何用户敏感信息；管理接口仅管理员可用。

---

## 11. 已知限制与后续规划
- 推荐上限（每日/月度）当前在 activation.ts 为常量（3/40），建议配置化：
  - 方案：websiteConfig.credits.referral 内增 dailyCap/monthlyCap；或分层策略（渠道/信誉/灰度）
- 分享模板目前为简易版，建议：
  - 多语言与个性化（基于用户八字/风水上下文生成简短文案，不含敏感信息）
  - 素材中心 + A/B 实验
- 反作弊：
  - 结合设备指纹服务/风控模型/行为特征，支持阈值自动黑名单 + 申诉流程
- 指标体系：
  - 完整漏斗、渠道归因、DAU/WAU、Cohort 留存、LTV/CAC 盘点

---

## 附录：代码地图（按功能）
- 推荐裂变
  - 客户端：src/components/layout/referral-handler.tsx
  - 登记接口：src/app/api/referral/use/route.ts
  - 激活与发放：src/lib/growth/activation.ts；触点：
    - src/actions/qiflow/calculate-bazi.ts
    - src/actions/qiflow/xuankong-analysis.ts
    - src/actions/qiflow/pdf-export.ts
    - src/app/api/ai/chat/route.ts
- 分享传播
  - 创建：src/app/api/share/create/route.ts
  - 追踪：src/app/api/share/track/route.ts
  - 落地页：src/app/[locale]/s/[id]/page.tsx
  - 按钮：src/components/growth/share-button.tsx
- 每日签到
  - 注入：src/app/[locale]/layout.tsx（DailySigninHandler）
  - 接口：src/app/api/credits/daily-signin/route.ts
- KPI 看板
  - 页面：src/app/[locale]/(protected)/admin/metrics/page.tsx
- 黑名单/风控
  - 数据表：fraud_blacklist、fraud_events、share_clicks（见 src/db/schema.ts）
  - 管理接口：/api/admin/fraud-blacklist/*
- 运维
  - 健康检查：/api/admin/health/overview
  - 迁移/回填：/api/admin/referral/migration-check、/api/admin/referral/ensure-codes

---

如需“将推荐奖励上限配置化、模板多语言化、或提供图形化的运营工具页”，可在此文档基础上快速推进下一期迭代。
