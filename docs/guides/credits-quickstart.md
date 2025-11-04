# 积分系统快速开始指南

## 1. 访问管理后台

### 超级管理员登录
1. 访问 `/superadmin` 路径
2. 使用管理员邮箱登录(默认: `admin@qiflowai.com`)
3. 跳转到管理后台首页

### 进入积分管理
1. 在侧边栏导航至: **运营管理 → 增长运营 → 积分管理**
2. 或直接访问: `/zh-CN/admin/operations/growth/credits`

## 2. 查看积分数据

### 查看实时统计
页面顶部显示4个核心指标卡片:
- **总积分发放**: 累计发放的积分总量
- **平均余额**: 所有用户的平均积分余额
- **今日签到**: 今天签到的用户数
- **7日活跃**: 近7天有积分交易的活跃用户数

### 查看交易记录
切换到"交易记录"标签页:
1. 使用搜索框搜索用户或交易说明
2. 使用类型筛选器过滤特定类型交易
3. 点击"导出"按钮下载CSV文件

### 查看用户积分
切换到"用户积分"标签页:
- 查看所有用户的积分余额
- 按余额从高到低排序
- 查看累计获得/消费统计
- 查看连续签到天数

## 3. 调整用户积分

### 单个用户调整
1. 在"用户积分"标签页找到目标用户
2. 点击该用户行的"调整积分"按钮
3. 在弹出窗口中:
   - 选择"增加"或"扣除"
   - 输入积分数量
   - 填写调整原因(可选)
4. 点击"确认调整"

### 批量调整
通过API批量调整多个用户积分:
```bash
curl -X PATCH http://localhost:3000/api/admin/growth/credits \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": ["user-id-1", "user-id-2"],
    "amount": 100,
    "reason": "新年活动奖励"
  }'
```

## 4. 配置奖励规则

切换到"奖励配置"标签页:

### 签到奖励配置
- **每日签到奖励**: 修改每次签到获得的积分
- **连续7天额外奖励**: 连续签到7天的额外奖励
- **连续30天额外奖励**: 连续签到30天的额外奖励

### 里程碑奖励配置
为每个里程碑设置奖励积分:
- 7天、15天、30天、60天、90天

### 任务奖励配置
设置首次完成任务的奖励:
- 首次八字分析
- 首次风水分析
- 首次PDF导出
- 首次分享

配置完成后点击底部"保存配置"按钮。

## 5. 导出数据

### 导出交易记录
1. 在"交易记录"标签页
2. 点击"导出"按钮
3. 自动下载 `credit_transactions_YYYY-MM-DD.csv`

### 导出用户积分
1. 在"用户积分"标签页
2. 点击"导出"按钮
3. 自动下载 `credit_users_YYYY-MM-DD.csv`

CSV文件包含UTF-8 BOM,可直接在Excel中打开。

## 6. API调用示例

### 获取交易记录
```javascript
const response = await fetch('/api/admin/growth/credits/transactions?page=1&limit=20');
const data = await response.json();
console.log(data.transactions);
console.log(data.stats);
```

### 获取用户积分
```javascript
const response = await fetch('/api/admin/growth/credits/users?page=1&limit=50');
const data = await response.json();
console.log(data.users);
```

### 调整用户积分
```javascript
const response = await fetch('/api/admin/growth/credits/adjust', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 'user-uuid',
    amount: 100, // 正数为增加,负数为扣除
    reason: '活动奖励',
  }),
});

const result = await response.json();
console.log(result.data.user.newBalance);
```

### 更新配置
```javascript
const response = await fetch('/api/admin/growth/config/credits', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    signin: {
      daily: 3, // 修改每日签到奖励为3积分
      consecutive7: 10,
      consecutive30: 30,
    },
  }),
});

const result = await response.json();
console.log(result.config);
```

## 7. 数据库操作

### 查询用户积分
```sql
SELECT 
  u.id,
  u.name,
  u.email,
  u.credits as balance,
  COUNT(ct.id) as transaction_count
FROM users u
LEFT JOIN credit_transactions ct ON ct.user_id = u.id
GROUP BY u.id
ORDER BY u.credits DESC
LIMIT 10;
```

### 查询交易记录
```sql
SELECT 
  ct.*,
  u.name as user_name,
  u.email as user_email
FROM credit_transactions ct
JOIN users u ON u.id = ct.user_id
WHERE ct.created_at >= NOW() - INTERVAL '7 days'
ORDER BY ct.created_at DESC;
```

### 统计数据
```sql
-- 总发放积分
SELECT SUM(amount) as total_issued
FROM credit_transactions
WHERE amount > 0;

-- 平均余额
SELECT AVG(credits) as avg_balance
FROM users;

-- 今日签到数
SELECT COUNT(*) as today_signins
FROM check_ins
WHERE check_in_date = CURRENT_DATE;
```

## 8. 常见问题

### Q: 如何给新用户初始积分?
A: 在用户注册时自动创建一笔交易记录:
```typescript
await prisma.creditTransaction.create({
  data: {
    userId: newUser.id,
    amount: 100,
    type: 'signup',
    description: '新用户注册奖励',
  },
});

await prisma.user.update({
  where: { id: newUser.id },
  data: { credits: 100 },
});
```

### Q: 如何实现积分过期?
A: 在交易记录中添加 `expiresAt` 字段,定时任务扫描过期积分并扣除。

### Q: 如何防止积分刷单?
A: 
1. 限制每日操作次数(签到1次/天,分享3次/天)
2. IP地址风控
3. 设备指纹识别
4. 异常行为检测和告警

### Q: 积分能否为负数?
A: 当前设计不允许余额为负,调整时会检查余额是否足够。

## 9. 下一步

- [ ] 集成积分兑换商城
- [ ] 实现推荐排行榜
- [ ] 添加积分等级体系
- [ ] 配置自动化营销活动
- [ ] 接入数据分析平台

## 10. 获取帮助

- 技术文档: `/docs/features/credits-system.md`
- API参考: `/docs/api/credits-api.md`
- 问题反馈: GitHub Issues
