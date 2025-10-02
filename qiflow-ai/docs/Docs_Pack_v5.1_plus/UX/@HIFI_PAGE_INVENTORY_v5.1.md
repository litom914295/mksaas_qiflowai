# 高保真页面清单（用户流程）v5.1
> 目标：把“用户流程”落到页面级别，逐页列出 **状态/组件/数据/动作/埋点**，便于 Figma & 前端对齐。组件优先使用 Radix UI + shadcn。

| Flow | Page Key | 必备状态 | 组件映射（Radix/shadcn） | 关键数据 | 主要动作 | 埋点事件 |
|---|---|---|---|---|---|---|
| 首次访问 | `auth_login` | default/loading/error | `Card`, `Input`, `Button`, `Toast` | email, plan | 登录/注册/第三方登录 | `auth_login_submit` |
| 首页 | `home_hub` | empty/history/error | `Tabs`, `Card`, `Badge` | coins, history | 开始分析/充值 | `home_start_click` |
| 罗盘校准 | `compass_wizard` | default/limited/timeout | `Stepper`,`Progress`,`Alert` | sigma, confidence | 读取/校准/手动输入 | `compass_calibration_*` |
| 八字输入 | `bazi_form` | default/invalid | `Form`,`Select`,`DatePicker` | dob, tz, calendar | 提交/校正 | `bazi_submit` |
| 玄空结果 | `xuankong_result` | default/low_confidence | `Grid`,`Tooltip`,`Accordion` | stars, 24山, 兼线 | 展开引用/导出 | `xuankong_view`,`rag_citation_open` |
| 充值订阅 | `billing_plans` | unpaid/paid | `Table`,`Dialog` | plan, price | 购买/发票 | `checkout_start` |
| 预约大师 | `booking_flow` | vacant/locked | `Calendar`,`Sheet` | master_id, slot | 下单/退款 | `booking_submit` |
| 历史与报告 | `history_list` | empty/paginated | `DataTable`,`Pagination` | reports | 复盘/再购买 | `history_open` |

> 交互原则：**空/错误/限流/超时** 四态必须落地；页面首部提供“余额提示 + 预计消耗”。
