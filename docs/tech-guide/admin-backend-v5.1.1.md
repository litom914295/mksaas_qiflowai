# @TECH_GUIDE_ADMIN_v5.1.1.md

## 文档元信息
- 文档版本：v5.1.1
- 创建时间：2025-10-11
- 文档类型：技术架构设计文档
- 产品名称：QiFlow AI_qiflowai 综合管理后台
- 技术栈：Next.js + TypeScript + Prisma + PostgreSQL

## 1. 技术架构概述

### 1.1 架构原则
- **单体优先**：采用模块化单体架构，预留微服务拆分能力
- **RSC优先**：充分利用React Server Components减少客户端负载
- **类型安全**：全栈TypeScript，端到端类型安全
- **性能优先**：缓存策略、懒加载、代码分割
- **安全内建**：安全设计内置，而非事后补充

### 1.2 技术决策记录(ADR)
| 决策编号 | 决策内容 | 理由 | 影响 |
|---------|---------|------|------|
| ADR-001 | 采用Next.js App Router | RSC支持、性能优越、生态完善 | 学习曲线、版本锁定 |
| ADR-002 | 使用Prisma作为ORM | 类型安全、迁移管理、多数据库支持 | 性能开销、学习成本 |
| ADR-003 | PostgreSQL作为主数据库 | 稳定、功能丰富、JSONB支持 | 运维成本 |
| ADR-004 | Shadcn UI组件库 | 可定制、轻量、无运行时依赖 | 需要自行维护 |
| ADR-005 | JWT + Session混合认证 | 灵活、安全、支持多端 | 复杂度增加 |

## 2. 系统架构设计

### 2.1 分层架构
```
┌──────────────────────────────────────┐
│        Presentation Layer            │
│     (Next.js Pages & Components)     │
├──────────────────────────────────────┤
│         Application Layer            │
│        (API Routes & Actions)        │
├──────────────────────────────────────┤
│          Business Layer              │
│        (Services & Use Cases)        │
├──────────────────────────────────────┤
│         Infrastructure Layer         │
│      (Database, Cache, External)     │
└──────────────────────────────────────┘
```

### 2.2 目录结构
```
QiFlow AI_qiflowai/
├── app/                           # Next.js App Router
│   ├── (admin)/                  # 管理后台路由组
│   │   ├── dashboard/            # 仪表板
│   │   ├── users/               # 用户管理
│   │   ├── content/             # 内容管理
│   │   ├── orders/              # 订单管理
│   │   ├── analytics/           # 数据分析
│   │   └── settings/            # 系统设置
│   ├── api/                     # API路由
│   │   └── admin/
│   │       └── v1/
│   │           ├── auth/        # 认证接口
│   │           ├── users/       # 用户接口
│   │           └── [...]/       # 其他接口
│   └── layout.tsx               # 根布局
├── components/                   # 共享组件
│   ├── ui/                     # UI基础组件
│   ├── forms/                  # 表单组件
│   ├── charts/                 # 图表组件
│   └── layouts/                # 布局组件
├── lib/                        # 核心库
│   ├── auth/                  # 认证逻辑
│   ├── db/                    # 数据库配置
│   ├── api/                   # API客户端
│   ├── utils/                 # 工具函数
│   └── validations/           # 验证schema
├── services/                   # 业务服务
│   ├── user.service.ts        # 用户服务
│   ├── content.service.ts     # 内容服务
│   ├── order.service.ts       # 订单服务
│   └── analytics.service.ts   # 分析服务
├── prisma/                    # Prisma配置
│   ├── schema.prisma         # 数据模型
│   ├── migrations/           # 数据库迁移
│   └── seed.ts              # 种子数据
├── hooks/                    # React Hooks
├── types/                    # TypeScript类型
├── styles/                   # 全局样式
├── public/                   # 静态资源
├── tests/                    # 测试文件
│   ├── unit/                # 单元测试
│   ├── integration/         # 集成测试
│   └── e2e/                # E2E测试
└── docs/                    # 项目文档
```

## 3. 数据库设计

### 3.1 Prisma Schema
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 用户模型
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  phone         String?
  passwordHash  String
  name          String?
  avatarUrl     String?
  status        UserStatus @default(ACTIVE)
  mfaEnabled    Boolean   @default(false)
  mfaSecret     String?
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // 关系
  roles         UserRole[]
  posts         Post[]
  auditLogs     AuditLog[]
  sessions      Session[]
  tokens        ApiToken[]
}

// 角色模型
model Role {
  id            String    @id @default(cuid())
  code          String    @unique
  name          String
  description   String?
  permissions   Json      // JSONB存储权限数组
  isSystem      Boolean   @default(false)
  createdAt     DateTime  @default(now())
  
  // 关系
  users         UserRole[]
}

// 用户角色关联
model UserRole {
  userId        String
  roleId        String
  assignedAt    DateTime  @default(now())
  assignedBy    String?
  
  user          User      @relation(fields: [userId], references: [id])
  role          Role      @relation(fields: [roleId], references: [id])
  assignor      User?     @relation("AssignedRoles", fields: [assignedBy], references: [id])
  
  @@id([userId, roleId])
}

// 文章模型
model Post {
  id            String    @id @default(cuid())
  title         String
  slug          String    @unique
  content       String?   @db.Text
  summary       String?
  coverImage    String?
  status        PostStatus @default(DRAFT)
  authorId      String
  categoryId    String?
  tags          Json?     // JSONB存储标签数组
  meta          Json?     // JSONB存储元数据
  publishedAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // 关系
  author        User      @relation(fields: [authorId], references: [id])
  category      Category? @relation(fields: [categoryId], references: [id])
  versions      PostVersion[]
}

// 文章版本
model PostVersion {
  id            String    @id @default(cuid())
  postId        String
  versionNumber Int
  content       String?   @db.Text
  meta          Json?
  createdBy     String
  createdAt     DateTime  @default(now())
  
  post          Post      @relation(fields: [postId], references: [id])
  creator       User      @relation(fields: [createdBy], references: [id])
}

// 分类模型
model Category {
  id            String    @id @default(cuid())
  name          String
  slug          String    @unique
  parentId      String?
  sort          Int       @default(0)
  createdAt     DateTime  @default(now())
  
  parent        Category? @relation("CategoryTree", fields: [parentId], references: [id])
  children      Category[] @relation("CategoryTree")
  posts         Post[]
}

// 订单模型
model Order {
  id            String    @id @default(cuid())
  orderNo       String    @unique
  userId        String
  amount        Decimal   @db.Decimal(10, 2)
  currency      String    @default("CNY")
  status        OrderStatus @default(PENDING)
  items         Json      // JSONB存储订单项
  paidAt        DateTime?
  refundedAt    DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  user          User      @relation(fields: [userId], references: [id])
  refunds       Refund[]
}

// 退款模型
model Refund {
  id            String    @id @default(cuid())
  orderId       String
  amount        Decimal   @db.Decimal(10, 2)
  reason        String?
  status        RefundStatus @default(PENDING)
  requestedBy   String
  approvedBy    String?
  createdAt     DateTime  @default(now())
  processedAt   DateTime?
  
  order         Order     @relation(fields: [orderId], references: [id])
  requester     User      @relation("RequestedRefunds", fields: [requestedBy], references: [id])
  approver      User?     @relation("ApprovedRefunds", fields: [approvedBy], references: [id])
}

// 审计日志
model AuditLog {
  id            String    @id @default(cuid())
  userId        String?
  action        String
  resourceType  String?
  resourceId    String?
  oldValue      Json?
  newValue      Json?
  ipAddress     String?
  userAgent     String?   @db.Text
  traceId       String?
  createdAt     DateTime  @default(now())
  
  user          User?     @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([createdAt])
  @@index([action])
}

// 会话模型
model Session {
  id            String    @id @default(cuid())
  sessionToken  String    @unique
  userId        String
  expires       DateTime
  createdAt     DateTime  @default(now())
  
  user          User      @relation(fields: [userId], references: [id])
}

// API Token
model ApiToken {
  id            String    @id @default(cuid())
  name          String
  token         String    @unique
  userId        String
  scopes        Json      // JSONB存储权限范围
  expiresAt     DateTime?
  lastUsedAt    DateTime?
  createdAt     DateTime  @default(now())
  
  user          User      @relation(fields: [userId], references: [id])
}

// 枚举定义
enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  DELETED
}

enum PostStatus {
  DRAFT
  REVIEW
  SCHEDULED
  PUBLISHED
  ARCHIVED
}

enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  COMPLETED
  CANCELLED
  REFUNDED
}

enum RefundStatus {
  PENDING
  APPROVED
  REJECTED
  PROCESSING
  COMPLETED
}
```

### 3.2 数据库索引策略
```sql
-- 性能优化索引
CREATE INDEX idx_users_email_status ON users(email, status);
CREATE INDEX idx_posts_status_published ON posts(status, published_at);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_audit_logs_date_user ON audit_logs(created_at DESC, user_id);

-- 全文搜索索引
CREATE INDEX idx_posts_fulltext ON posts USING GIN (to_tsvector('chinese', title || ' ' || content));

-- JSONB索引
CREATE INDEX idx_posts_tags ON posts USING GIN (tags);
CREATE INDEX idx_roles_permissions ON roles USING GIN (permissions);
```

## 4. API设计

### 4.1 认证与授权

#### 认证流程
```typescript
// lib/auth/auth.service.ts
export class AuthService {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    // 1. 验证用户凭据
    const user = await this.validateUser(credentials);
    
    // 2. 生成会话/Token
    const session = await this.createSession(user);
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    
    // 3. 记录登录日志
    await this.logLogin(user, credentials.ip);
    
    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
      expiresIn: 3600
    };
  }
  
  async validateToken(token: string): Promise<TokenPayload> {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      return payload as TokenPayload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
  
  async checkPermission(
    userId: string, 
    permission: string
  ): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return userRoles.some(role => 
      role.permissions.includes(permission)
    );
  }
}
```

#### 中间件实现
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // 管理后台路由保护
  if (pathname.startsWith('/admin')) {
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // 权限检查
    const hasPermission = await checkRoutePermission(
      session.user.id,
      pathname
    );
    
    if (!hasPermission) {
      return NextResponse.redirect(new URL('/403', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};
```

### 4.2 API路由实现

#### RESTful API示例
```typescript
// app/api/admin/v1/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { authenticate, authorize } from '@/lib/auth';
import { auditLog } from '@/lib/audit';

// 验证schema
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  roleId: z.string().cuid(),
  password: z.string().min(8)
});

// GET /api/admin/v1/users
export async function GET(request: NextRequest) {
  try {
    // 认证与授权
    const user = await authenticate(request);
    await authorize(user, 'user.read');
    
    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const size = parseInt(searchParams.get('size') || '20');
    const search = searchParams.get('q') || '';
    
    // 构建查询
    const where = search ? {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    } : {};
    
    // 执行查询
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * size,
        take: size,
        include: {
          roles: {
            include: {
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);
    
    // 返回响应
    return NextResponse.json({
      code: 0,
      message: 'success',
      data: users.map(sanitizeUser),
      meta: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size)
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/admin/v1/users
export async function POST(request: NextRequest) {
  try {
    // 认证与授权
    const user = await authenticate(request);
    await authorize(user, 'user.create');
    
    // 验证请求体
    const body = await request.json();
    const data = CreateUserSchema.parse(body);
    
    // 创建用户
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: await hashPassword(data.password),
        roles: {
          create: {
            roleId: data.roleId,
            assignedBy: user.id
          }
        }
      },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });
    
    // 记录审计日志
    await auditLog({
      userId: user.id,
      action: 'user.create',
      resourceType: 'user',
      resourceId: newUser.id,
      newValue: sanitizeUser(newUser)
    });
    
    // 返回响应
    return NextResponse.json({
      code: 0,
      message: 'User created successfully',
      data: sanitizeUser(newUser)
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### 4.3 Server Actions实现
```typescript
// app/actions/user.actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getServerSession } from '@/lib/auth';

export async function createUser(formData: FormData) {
  try {
    const session = await getServerSession();
    if (!session) throw new Error('Unauthorized');
    
    const schema = z.object({
      email: z.string().email(),
      name: z.string().min(2),
      roleId: z.string()
    });
    
    const data = schema.parse({
      email: formData.get('email'),
      name: formData.get('name'),
      roleId: formData.get('roleId')
    });
    
    const user = await prisma.user.create({
      data: {
        ...data,
        passwordHash: await hashPassword('temp123456')
      }
    });
    
    revalidatePath('/admin/users');
    
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## 5. 前端实现

### 5.1 组件架构

#### 数据表格组件
```typescript
// components/ui/data-table.tsx
'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  pageSize?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  pageSize = 10,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      {searchKey && (
        <Input
          placeholder={`搜索...`}
          value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn(searchKey)?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      )}

      {/* 数据表格 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      <DataTablePagination table={table} />
    </div>
  );
}
```

#### 表单组件示例
```typescript
// components/forms/user-form.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createUser } from '@/app/actions/user.actions';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  name: z.string().min(2, '姓名至少2个字符'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号'),
  roleId: z.string().min(1, '请选择角色'),
});

export function UserForm({ roles }: { roles: Role[] }) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
      phone: '',
      roleId: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await createUser(values);
      
      if (result.success) {
        toast({
          title: '创建成功',
          description: '用户已成功创建',
        });
        form.reset();
      } else {
        toast({
          title: '创建失败',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '系统错误',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input placeholder="user@example.com" {...field} />
              </FormControl>
              <FormDescription>
                用户的登录邮箱地址
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>姓名</FormLabel>
              <FormControl>
                <Input placeholder="张三" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="roleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>角色</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择角色" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? '创建中...' : '创建用户'}
        </Button>
      </form>
    </Form>
  );
}
```

## 6. 性能优化

### 6.1 缓存策略

#### Redis缓存实现
```typescript
// lib/cache/redis.ts
import { Redis } from 'ioredis';

class CacheService {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });
  }
  
  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }
  
  async set<T>(
    key: string, 
    value: T, 
    ttl?: number
  ): Promise<void> {
    const data = JSON.stringify(value);
    if (ttl) {
      await this.redis.setex(key, ttl, data);
    } else {
      await this.redis.set(key, data);
    }
  }
  
  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
  
  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

export const cache = new CacheService();
```

#### Next.js缓存配置
```typescript
// next.config.js
module.exports = {
  experimental: {
    // 启用增量静态再生
    isrMemoryCacheSize: 0,
  },
  
  // 图片优化
  images: {
    domains: ['cdn.example.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // 静态资源缓存
  async headers() {
    return [
      {
        source: '/(.*).js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};
```

### 6.2 数据库优化

#### 查询优化
```typescript
// services/user.service.ts
export class UserService {
  // 使用选择性查询
  async getUserList(params: GetUsersParams) {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        createdAt: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
      },
      where: params.where,
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy,
    });
  }
  
  // 使用事务
  async createUserWithRole(data: CreateUserData) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          passwordHash: data.passwordHash,
        },
      });
      
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: data.roleId,
        },
      });
      
      return user;
    });
  }
  
  // 批量操作
  async bulkUpdateStatus(userIds: string[], status: UserStatus) {
    return prisma.user.updateMany({
      where: {
        id: { in: userIds },
      },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }
}
```

## 7. 安全实现

### 7.1 输入验证
```typescript
// lib/validations/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

// XSS防护
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
}

// SQL注入防护（使用Prisma自动处理）
// CSRF防护（使用Next.js内置）

// 输入验证示例
export const UserInputSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9\u4e00-\u9fa5\s]+$/),
  phone: z.string().regex(/^1[3-9]\d{9}$/).optional(),
  password: z.string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/),
});
```

### 7.2 审计日志
```typescript
// lib/audit/audit.service.ts
export class AuditService {
  async log(params: AuditLogParams): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: params.userId,
          action: params.action,
          resourceType: params.resourceType,
          resourceId: params.resourceId,
          oldValue: params.oldValue,
          newValue: params.newValue,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          traceId: params.traceId || generateTraceId(),
          createdAt: new Date(),
        },
      });
    } catch (error) {
      // 审计日志失败不应影响主流程
      console.error('Audit log failed:', error);
    }
  }
  
  async query(filters: AuditLogFilters): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: {
        userId: filters.userId,
        action: filters.action,
        resourceType: filters.resourceType,
        createdAt: {
          gte: filters.startDate,
          lte: filters.endDate,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 100,
    });
  }
}
```

## 8. 测试策略

### 8.1 单元测试
```typescript
// tests/unit/services/user.service.test.ts
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { UserService } from '@/services/user.service';
import { prisma } from '@/lib/db';

jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe('getUserList', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        { id: '1', email: 'test@example.com', name: 'Test User' },
      ];
      
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      
      const result = await userService.getUserList({
        page: 1,
        size: 10,
      });
      
      expect(result).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });
  });
});
```

### 8.2 集成测试
```typescript
// tests/integration/api/users.test.ts
import { describe, it, expect } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/admin/v1/users/route';

describe('/api/admin/v1/users', () => {
  describe('GET', () => {
    it('should return users list', async () => {
      const { req } = createMocks({
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-token',
        },
      });
      
      const response = await GET(req as any);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('meta');
    });
  });
});
```

### 8.3 E2E测试
```typescript
// tests/e2e/user-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('[type="submit"]');
    await page.waitForURL('/admin/dashboard');
  });

  test('should create new user', async ({ page }) => {
    await page.goto('/admin/users');
    await page.click('text=新建用户');
    
    await page.fill('[name="email"]', 'newuser@example.com');
    await page.fill('[name="name"]', '新用户');
    await page.selectOption('[name="roleId"]', 'operator');
    
    await page.click('text=创建');
    
    await expect(page.locator('text=创建成功')).toBeVisible();
    await expect(page.locator('text=newuser@example.com')).toBeVisible();
  });
});
```

## 9. 部署配置

### 9.1 Docker配置
```dockerfile
# Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next/cache ./.next/cache

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 9.2 环境变量配置
```bash
# .env.production
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/QiFlow AI_admin"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# 认证
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://admin.example.com"
JWT_SECRET="your-jwt-secret"

# 第三方服务
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="noreply@example.com"
SMTP_PASSWORD=""

# 存储
S3_BUCKET="qiflowai-assets"
S3_REGION="us-east-1"
S3_ACCESS_KEY=""
S3_SECRET_KEY=""

# 监控
SENTRY_DSN=""
```

## 10. 监控与运维

### 10.1 日志配置
```typescript
// lib/logger/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'qiflowai-admin' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

### 10.2 性能监控
```typescript
// lib/monitoring/performance.ts
export function measurePerformance(name: string) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      
      try {
        const result = await method.apply(this, args);
        const duration = performance.now() - start;
        
        // 记录性能指标
        logger.info('Performance metric', {
          method: `${target.constructor.name}.${propertyName}`,
          duration: Math.round(duration),
          timestamp: new Date().toISOString(),
        });
        
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        
        logger.error('Performance metric with error', {
          method: `${target.constructor.name}.${propertyName}`,
          duration: Math.round(duration),
          error: error.message,
        });
        
        throw error;
      }
    };
  };
}
```

## 11. 开发规范

### 11.1 代码规范
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react/display-name": "off",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### 11.2 Git提交规范
```bash
# .gitmessage
# <type>(<scope>): <subject>
#
# <body>
#
# <footer>
#
# Type: feat, fix, docs, style, refactor, test, chore
# Scope: auth, user, cms, order, data, sys
# Subject: 简短描述
# Body: 详细说明
# Footer: Breaking changes, Issues closed
```

## 12. 文档说明

### 12.1 API文档生成
```typescript
// lib/swagger/swagger.ts
import { createSwaggerSpec } from 'next-swagger-doc';

const apiDocumentation = createSwaggerSpec({
  apiFolder: 'app/api',
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'qiflowai Admin API',
      version: '1.0.0',
      description: '综合管理后台API文档',
    },
    servers: [
      {
        url: 'http://localhost:3000/api/admin/v1',
        description: 'Development server',
      },
      {
        url: 'https://admin.example.com/api/admin/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
});

export default apiDocumentation;
```

---
*本文档为QiFlow AI_qiflowai综合管理后台的技术设计文档，包含完整的架构设计、实现方案和最佳实践。*