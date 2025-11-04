# Admin用户积分限制修复

## 问题描述

超级管理员（admin）从前端登录测试各项功能时，遇到了积分限制。这是不应该发生的情况，因为管理员应该有无限制的访问权限。

## 问题原因

积分管理系统（`src/lib/credits/manager.ts`）在检查和扣除积分时，没有考虑用户的角色（role）。即使是admin用户，也会被当作普通用户一样检查积分余额和扣除积分。

## 解决方案

在 `CreditsManager` 类中添加了以下修改：

### 1. 添加管理员角色检查方法

```typescript
// 检查用户是否为管理员
async isAdmin(userId: string): Promise<boolean> {
  try {
    const db = await getDb();
    const users = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    
    return users[0]?.role === 'admin';
  } catch (error) {
    console.error('[积分管理] 检查管理员角色失败:', error);
    return false;
  }
}
```

### 2. 修改 `getBalance()` 方法

管理员用户返回无限积分（`Number.MAX_SAFE_INTEGER`）：

```typescript
// 管理员返回无限积分
if (await this.isAdmin(userId)) {
  console.log(`[积分管理] 管理员用户，返回无限积分`);
  return Number.MAX_SAFE_INTEGER;
}
```

### 3. 修改 `deduct()` 方法

管理员用户不扣除积分：

```typescript
// 管理员不扣除积分
if (await this.isAdmin(userId)) {
  console.log(`[积分管理] 管理员用户，跳过积分扣除`);
  return true;
}
```

## 影响范围

此修复会影响所有使用积分系统的功能：

- ✅ AI聊天（aiChat）
- ✅ 深度解读（deepInterpretation）
- ✅ 八字分析（bazi）
- ✅ 玄空风水分析（xuankong）
- ✅ PDF导出（pdfExport）
- ✅ 所有统一引擎分级功能

## 测试验证

### 使用测试脚本

运行测试脚本验证修复：

```bash
npm run tsx scripts/test-admin-credits.ts
```

测试脚本会验证：
1. Admin用户角色检测
2. Admin用户拥有无限积分
3. Admin用户可以使用所有功能
4. 积分扣除对admin无效
5. 普通用户仍受积分限制

### 手动测试

1. **登录admin账户**
   ```
   访问: /admin/login
   使用admin账号登录
   ```

2. **测试功能访问**
   - 测试AI聊天功能（需要5积分）
   - 测试八字分析功能（需要10积分）
   - 测试玄空风水分析（需要20-120积分）
   - 测试PDF导出功能（需要5积分）

3. **验证结果**
   - ✅ 所有功能应该可以正常使用
   - ✅ 不应该看到"积分不足"的提示
   - ✅ 积分余额显示为极大值或不受限制

## 相关文件

### 修改的文件
- `src/lib/credits/manager.ts` - 积分管理核心逻辑

### 相关文件
- `src/lib/auth/session.ts` - 会话和权限管理
- `src/db/schema/auth.ts` - 用户表定义（包含role字段）
- `src/types/auth.d.ts` - 用户类型定义

### 新增文件
- `scripts/test-admin-credits.ts` - 测试脚本
- `docs/fixes/admin-credits-fix.md` - 本文档

## 注意事项

1. **数据库role字段**
   - 确保admin用户在数据库中的 `role` 字段值为 `'admin'`
   - 可以通过以下SQL查询验证：
     ```sql
     SELECT id, email, role FROM "user" WHERE role = 'admin';
     ```

2. **缓存问题**
   - 修改后可能需要重启服务器
   - 清除浏览器缓存和cookies
   - 重新登录admin账户

3. **安全考虑**
   - 此修复仅针对 `role = 'admin'` 的用户
   - 普通用户（`role = 'user'`）仍然受积分限制
   - 不会影响积分系统的正常运作

## 后续优化建议

1. **添加配置选项**
   - 在配置文件中添加开关，控制admin是否免除积分限制
   - 支持为不同管理员设置不同的积分配额

2. **审计日志**
   - 记录admin用户的功能使用情况
   - 添加统计报表，监控admin用户的活动

3. **角色细分**
   - 考虑增加更多角色类型（如 `operator`, `analyst` 等）
   - 为不同角色设置不同的积分政策

## 版本历史

- **v1.0** (2025-10-19) - 初始修复，admin用户免除积分限制
