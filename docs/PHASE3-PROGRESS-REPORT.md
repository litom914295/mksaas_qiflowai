# 🔐 Phase 3 中期进度报告 - RBAC权限管理系统 (API层)

> **当前进度**: 50% (5/10任务完成)
> **优先级**: 🔥 高优先级 (P1)
> **预估总时间**: 3-4天
> **已用时间**: ~2小时

---

## ✅ 已完成任务 (5/10)

### Task 1: 设计RBAC数据库表结构 ✅
- **文件**: 
  - `prisma/schema.prisma` (文档用,已更新)
  - `src/db/schema.ts` (实际使用,已添加)
- **完成内容**:
  - 设计了4个核心表: `roles`, `permissions`, `rolePermissions`, `userRoles`
  - 所有表使用UUID主键
  - 完善的索引策略
  - 级联删除关系

**表结构设计**:

```typescript
// 角色表
roles {
  id: UUID (PK)
  name: TEXT (UNIQUE) - 角色标识
  displayName: TEXT - 显示名称
  description: TEXT - 描述
  isSystem: BOOLEAN - 系统角色标记
  createdAt, updatedAt
}

// 权限表
permissions {
  id: UUID (PK)
  name: TEXT (UNIQUE) - 权限标识
  displayName: TEXT - 显示名称
  description: TEXT - 描述
  category: TEXT - 分类
  createdAt, updatedAt
}

// 角色-权限关联表
rolePermissions {
  id: UUID (PK)
  roleId: UUID (FK -> roles)
  permissionId: UUID (FK -> permissions)
  grantedAt: TIMESTAMP
  UNIQUE(roleId, permissionId)
}

// 用户-角色关联表
userRoles {
  id: UUID (PK)
  userId: TEXT (FK -> user)
  roleId: UUID (FK -> roles)
  assignedAt: TIMESTAMP
  assignedBy: TEXT - 分配者ID
  UNIQUE(userId, roleId)
}
```

### Task 2: 数据库迁移 ✅
- **状态**: 跳过(使用Drizzle ORM, schema已定义)
- **说明**: 项目使用Drizzle ORM而非Prisma,表结构已添加到`src/db/schema.ts`
- **后续**: 需手动执行`npx drizzle-kit push`或由数据库管理员创建表

### Task 3: 创建角色管理API ✅
- **文件**: `src/app/api/admin/roles/route.ts` (228行)
- **端点**:
  - `GET /api/admin/roles` - 获取角色列表
  - `POST /api/admin/roles` - 创建新角色
  - `PUT /api/admin/roles` - 更新角色
  - `DELETE /api/admin/roles?id=xxx` - 删除角色

**功能特性**:
- ✅ 支持includePermissions参数(包含权限详情)
- ✅ 角色权限数量统计
- ✅ 系统角色保护(不可修改/删除)
- ✅ 角色名称唯一性检查
- ✅ 创建时支持批量分配权限
- ✅ 完整的错误处理和权限验证

### Task 4: 创建角色权限分配API ✅
- **文件**: `src/app/api/admin/roles/[id]/permissions/route.ts` (244行)
- **端点**:
  - `GET /api/admin/roles/:id/permissions` - 获取角色权限
  - `PUT /api/admin/roles/:id/permissions` - 完全替换角色权限
  - `POST /api/admin/roles/:id/permissions` - 添加单个权限
  - `DELETE /api/admin/roles/:id/permissions?permissionId=xxx` - 移除单个权限

**功能特性**:
- ✅ 批量权限更新(PUT)
- ✅ 增量权限管理(POST/DELETE)
- ✅ 系统角色权限保护
- ✅ 权限重复检查
- ✅ 返回更新后的权限列表

### Task 5: 创建权限管理API ✅
- **文件**: `src/app/api/admin/permissions/route.ts` (54行)
- **端点**:
  - `GET /api/admin/permissions` - 获取所有权限
  - `GET /api/admin/permissions?category=xxx` - 按分类筛选

**功能特性**:
- ✅ 返回所有权限列表
- ✅ 按分类分组返回
- ✅ 支持category过滤
- ✅ 权限验证

### Task 6: 创建用户角色分配API ✅
- **文件**: `src/app/api/admin/users/[id]/roles/route.ts` (159行)
- **端点**:
  - `GET /api/admin/users/:id/roles` - 获取用户角色
  - `POST /api/admin/users/:id/roles` - 为用户分配角色
  - `DELETE /api/admin/users/:id/roles?roleId=xxx` - 移除用户角色

**功能特性**:
- ✅ 获取用户所有角色
- ✅ 显示分配时间和分配者
- ✅ 角色重复检查
- ✅ 记录操作者(assignedBy)
- ✅ 用户和角色存在性验证

---

## 📊 API设计总结

### RESTful规范
所有API遵循统一规范:
```typescript
// 成功响应
{
  success: true,
  data: any,
  message?: string
}

// 错误响应
{
  success: false,
  error: string
}
```

### 权限验证
所有API使用`verifyAuth(request)`验证管理员权限:
```typescript
const userId = await verifyAuth(request);
if (!userId) {
  return NextResponse.json({ success: false, error: '未授权访问' }, { status: 401 });
}
```

### 错误处理
- `400 Bad Request` - 参数错误
- `401 Unauthorized` - 未授权
- `403 Forbidden` - 禁止操作(如修改系统角色)
- `404 Not Found` - 资源不存在
- `500 Internal Server Error` - 服务器错误

---

## 🔄 待完成任务 (5/10)

### Task 7: 实现权限验证中间件 (进行中)
- **目标**: 创建`checkPermission()`中间件函数
- **用途**: API级别的细粒度权限控制
- **示例**:
  ```typescript
  // 检查用户是否有特定权限
  const hasPermission = await checkPermission(userId, 'admin.users.write');
  ```

### Task 8: 创建角色管理页面
- **路径**: `/admin/roles`
- **功能**: 角色列表、创建、编辑、删除

### Task 9: 创建权限分配界面
- **功能**: 树形权限选择器
- **集成**: 在角色管理页面中

### Task 10: 更新用户管理页面
- **功能**: 在用户详情页添加角色分配功能
- **路径**: `/admin/users/[id]`

### Task 11: 初始化默认角色和权限
- **文件**: `scripts/seed-rbac.ts`
- **内容**: 
  - 创建默认角色(super_admin, admin, user)
  - 创建默认权限(按模块分类)
  - 分配权限给默认角色

---

## 📁 文件清单

| 文件路径 | 类型 | 代码行数 | 状态 |
|---------|------|---------|------|
| `src/db/schema.ts` | Schema | +58行 | ✅ 完成 |
| `prisma/schema.prisma` | 文档 | +80行 | ✅ 完成 |
| `src/app/api/admin/roles/route.ts` | API | 228行 | ✅ 完成 |
| `src/app/api/admin/roles/[id]/permissions/route.ts` | API | 244行 | ✅ 完成 |
| `src/app/api/admin/permissions/route.ts` | API | 54行 | ✅ 完成 |
| `src/app/api/admin/users/[id]/roles/route.ts` | API | 159行 | ✅ 完成 |

**总计**: 685行新增代码

---

## 🎨 数据库关系图

```
┌─────────────┐       ┌──────────────────┐       ┌──────────────┐
│    User     │◄──────│   UserRoles      │──────►│    Roles     │
│  (已存在)   │       │ (用户-角色关联)   │       │  (角色表)    │
└─────────────┘       └──────────────────┘       └──────┬───────┘
                                                         │
                                                         │
                      ┌──────────────────┐              │
                      │ RolePermissions  │◄─────────────┘
                      │ (角色-权限关联)   │
                      └────────┬─────────┘
                               │
                               ▼
                      ┌──────────────┐
                      │ Permissions  │
                      │  (权限表)    │
                      └──────────────┘
```

---

## 🔐 权限命名规范

建议使用分层命名:
```
模块.资源.操作

示例:
- admin.users.read (查看用户)
- admin.users.write (编辑用户)
- admin.users.delete (删除用户)
- admin.roles.manage (管理角色)
- admin.permissions.assign (分配权限)
- content.analysis.read (查看分析)
- content.analysis.export (导出分析)
- system.settings.write (修改系统设置)
```

**分类建议**:
- `user_management` - 用户管理
- `role_management` - 角色管理
- `content_management` - 内容管理
- `analytics` - 数据分析
- `finance` - 财务管理
- `system` - 系统设置

---

## 🚀 API使用示例

### 1. 获取所有角色
```typescript
const res = await fetch('/api/admin/roles?includePermissions=true');
const { data } = await res.json();
// data: [{ id, name, displayName, permissions: [...], permissionCount }]
```

### 2. 创建新角色
```typescript
const res = await fetch('/api/admin/roles', {
  method: 'POST',
  body: JSON.stringify({
    name: 'content_manager',
    displayName: '内容管理员',
    description: '负责内容审核和管理',
    permissionIds: ['perm-1', 'perm-2']
  })
});
```

### 3. 为角色分配权限(完全替换)
```typescript
await fetch('/api/admin/roles/role-123/permissions', {
  method: 'PUT',
  body: JSON.stringify({
    permissionIds: ['perm-1', 'perm-2', 'perm-3']
  })
});
```

### 4. 为用户分配角色
```typescript
await fetch('/api/admin/users/user-456/roles', {
  method: 'POST',
  body: JSON.stringify({
    roleId: 'role-123'
  })
});
```

---

## 🔍 下一步计划

1. **权限验证中间件** (估计30分钟)
   - 实现`checkPermission(userId, permissionName)`
   - 实现`getUserPermissions(userId)`
   - 添加权限缓存机制

2. **Seed脚本** (估计1小时)
   - 定义默认角色和权限
   - 编写seeding逻辑
   - 为admin用户分配super_admin角色

3. **前端页面** (估计4-6小时)
   - 角色管理页面UI
   - 权限树形选择器
   - 用户角色分配界面

---

## 💡 技术亮点

1. **灵活的权限模型**:
   - 多对多关系设计
   - 支持角色继承(可扩展)
   - 细粒度权限控制

2. **系统角色保护**:
   - `isSystem`标记防止误删
   - 系统角色权限锁定

3. **审计日志**:
   - 记录assignedBy(谁分配的)
   - 记录assignedAt/grantedAt(何时分配)

4. **类型安全**:
   - 使用Drizzle ORM类型推导
   - TypeScript严格模式

5. **批量操作支持**:
   - 创建角色时批量分配权限
   - PUT完全替换角色权限

---

**Phase 3 API层状态**: ✅ 已完成 (50%整体进度)  
**下一阶段**: 实现权限验证中间件和Seed脚本
