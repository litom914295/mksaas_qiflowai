# 错误目录（v5.1）
| code | http | 用户提示 | 处理 | 备注 |
|---|---|---|---|---|
| INVALID_INPUT | 400 | 输入不完整或格式错误 | 高亮字段 | 表单校验 |
| SENSOR_UNAVAILABLE | 400 | 设备不支持或权限被拒绝 | 引导手动输入 | 罗盘降级 |
| INSUFFICIENT_COINS | 402 | 余额不足 | 跳转充值 | 计费口径一致 |
| RATE_LIMITED | 429 | 请求过于频繁 | 指示稍后重试 | 指数退避 |
| TIMEOUT | 504 | 响应超时 | 提示重试 | 流式降级 |
| INTERNAL_ERROR | 500 | 系统异常 | 提交工单 | 记录 traceId |
