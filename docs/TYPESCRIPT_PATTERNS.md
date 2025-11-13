# TypeScript类型模式指南

## 📚 文档概述
本文档记录了项目中推荐使用的TypeScript类型模式和最佳实践。

---

## 1. 异步函数返回值处理

### ❌ 问题模式
\\\	ypescript
// 问题：函数可能返回null，但没有处理
async function processData() {
  const data = await fetchData();  // 可能返回null
  return data;  // 类型不安全
}
\\\

### ✅ 推荐模式
\\\	ypescript
// 模式1：显式null检查 + 错误抛出
async function processData() {
  const data = await fetchData();
  if (!data) {
    throw new Error('Failed to fetch data');
  }
  return data;  // 类型安全：确保非null
}

// 模式2：使用类型守卫
function isValidData(data: unknown): data is DataType {
  return data !== null && typeof data === 'object';
}

async function processData() {
  const data = await fetchData();
  if (!isValidData(data)) {
    throw new TypeError('Invalid data format');
  }
  return data;  // 类型收窄为DataType
}
\\\

**应用场景**:
- API路由中的数据获取
- 数据库查询结果处理
- 缓存系统中的数据检索

---

## 2. 错误类构造函数参数

### ❌ 问题模式
\\\	ypescript
// 问题：参数类型不匹配
class ValidationError {
  constructor(message: string, codes: string[]) {
    // ...
  }
}

// ❌ 传入string而非string[]
throw new ValidationError('Invalid', 'CODE_001');
\\\

### ✅ 推荐模式
\\\	ypescript
// 正确：使用数组包装单个值
throw new ValidationError('Invalid', ['CODE_001']);

// 或者：支持多个错误代码
throw new ValidationError('Multiple errors', [
  'CODE_001',
  'CODE_002',
  'CODE_003'
]);
\\\

**设计原则**:
- 错误代码使用数组支持多个错误
- 保持接口一致性
- 便于错误聚合和分类

---

## 3. 可选地理位置字段

### ✅ 推荐模式
\\\	ypescript
// 接口定义
interface BirthInfo {
  // 必填字段
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female';
  
  // 可选地理位置字段
  longitude?: number;
  latitude?: number;
}

// Zod验证
const BirthInfoSchema = z.object({
  birthDate: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}\$/),
  birthTime: z.string().regex(/^\\d{2}:\\d{2}\$/),
  gender: z.enum(['male', 'female']),
  longitude: z.number().min(-180).max(180).optional(),
  latitude: z.number().min(-90).max(90).optional(),
});

// 使用
const birthInfo: BirthInfo = {
  birthDate: '1990-01-01',
  birthTime: '12:00',
  gender: 'male',
  // longitude和latitude可选
};
\\\

**最佳实践**:
- 使用?标记可选字段
- 使用Zod的.optional()进行验证
- 提供合理的默认值或后备方案

---

## 4. 数据库访问模式

### ❌ 旧模式（已废弃）
\\\	ypescript
// ❌ 同步导入，可能未初始化
import { db } from '@/db';

export async function getData() {
  const result = await db.query.users.findFirst();
  return result;
}
\\\

### ✅ 新模式（推荐）
\\\	ypescript
// ✅ 异步获取，确保连接
import { getDb } from '@/db';

export async function getData() {
  const db = await getDb();
  const result = await db.query.users.findFirst();
  return result;
}
\\\

**迁移指南**:
1. 将所有 \import { db }\ 改为 \import { getDb }\
2. 在函数开头添加 \const db = await getDb();\
3. 确保包含函数是async函数

---

## 5. API响应类型定义

### ✅ 推荐模式
\\\	ypescript
// 定义标准响应格式
type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };

// 使用
export async function POST(req: NextRequest): Promise<ApiResponse<BaziResult>> {
  try {
    const result = await calculateBazi(input);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    };
  }
}
\\\

**优势**:
- 类型安全的成功/失败分支
- 一致的错误处理
- 便于前端处理

---

## 6. 类型守卫和类型收窄

### ✅ 推荐模式
\\\	ypescript
// 自定义类型守卫
function isEnhancedBaziResult(value: unknown): value is EnhancedBaziResult {
  return (
    value !== null &&
    typeof value === 'object' &&
    'pillars' in value &&
    'elements' in value
  );
}

// 使用类型守卫
async function processResult(input: unknown) {
  if (!isEnhancedBaziResult(input)) {
    throw new TypeError('Invalid bazi result format');
  }
  
  // 此处input类型被收窄为EnhancedBaziResult
  const { pillars, elements } = input;
  // ...
}
\\\

**应用场景**:
- API响应验证
- 动态数据处理
- 类型安全的运行时检查

---

## 7. Union类型和字面量类型

### ✅ 推荐模式
\\\	ypescript
// 使用字面量类型而非string
type CalendarType = 'solar' | 'lunar';
type Gender = 'male' | 'female';
type SessionStatus = 'none' | 'active' | 'expired';

// 在接口中使用
interface BirthInfo {
  calendarType: CalendarType;
  gender: Gender;
}

// 类型安全的函数
function setSessionStatus(status: SessionStatus) {
  // TypeScript会检查status只能是三个值之一
  switch (status) {
    case 'none':
    case 'active':
    case 'expired':
      // 处理逻辑
      break;
  }
}
\\\

**避免**:
\\\	ypescript
// ❌ 不要使用宽泛的string类型
function setSessionStatus(status: string) {
  // 类型不安全
}
\\\

---

## 8. 泛型约束

### ✅ 推荐模式
\\\	ypescript
// 带约束的泛型函数
function processData<T extends { id: string }>(data: T): T {
  console.log(\Processing: \\);
  return data;
}

// 泛型接口约束
interface Repository<T extends { id: string; createdAt: Date }> {
  findById(id: string): Promise<T | null>;
  create(data: Omit<T, 'id' | 'createdAt'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
\\\

---

## 📋 快速检查清单

在提交代码前，检查以下项目：

- [ ] 所有异步函数返回值都有null检查
- [ ] 错误类构造函数参数类型正确
- [ ] 使用\getDb()\而非直接导入\db\
- [ ] API响应使用统一的类型定义
- [ ] 优先使用字面量联合类型而非string
- [ ] 可选字段使用\?\标记且有Zod验证
- [ ] 复杂类型检查使用类型守卫
- [ ] 避免使用\ny\，优先使用\unknown\

---

## 🔧 工具配置

### TypeScript编译器选项（推荐）
\\\json
{
  \"compilerOptions\": {
    \"strict\": true,
    \"strictNullChecks\": true,
    \"noImplicitAny\": true,
    \"noUnusedLocals\": true,
    \"noUnusedParameters\": true,
    \"noImplicitReturns\": true,
    \"noFallthroughCasesInSwitch\": true
  }
}
\\\

---

## 📚 参考资源

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Zod Documentation](https://zod.dev/)
- [Drizzle ORM TypeScript Guide](https://orm.drizzle.team/docs/typescript)

---

**文档版本**: 1.0.0  
**最后更新**: 2025-11-13  
**维护者**: Development Team
