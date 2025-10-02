# 高保真页面清单（计费/分账）v5.1

| Flow | Page Key | 必备状态 | 组件映射 | 关键字段 | 主要动作 | 埋点事件 |
|---|---|---|---|---|---|---|
| 套餐选择 | `billing_plans` | default/promo/limited | `Table`,`Callout` | plan, perks | 选择/跳转支付 | `plan_select` |
| 支付页 | `checkout` | processing/failed | `Dialog`,`Spinner` | amount, currency | 支付/重试 | `checkout_start`,`checkout_result` |
| 余额管理 | `wallet` | low/zero | `Progress`,`Badge` | coins, history | 充值/退款申请 | `wallet_topup` |
| 对账中心 | `reconciliation` | pending/error | `DataTable` | payouts, fees | 导出/对账 | `recon_export` |
| 分账明细 | `payout_detail` | onhold/paid | `Accordion` | split_id, amount | 申诉/补发 | `payout_view` |
