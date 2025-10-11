import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

// CSV行数据验证
const csvRowSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  role: z.string().optional().default('user'),
  status: z.enum(['active', 'inactive', 'banned']).optional().default('active'),
  credits: z.string().transform(val => parseInt(val) || 0).optional(),
  referredBy: z.string().optional(),
});

export type ImportUser = z.infer<typeof csvRowSchema>;

export interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    email: string;
    error: string;
  }>;
  users: Array<{
    email: string;
    name: string | null;
    status: string;
  }>;
}

/**
 * 解析CSV内容
 */
export function parseCSV(content: string): string[][] {
  const lines = content.split('\n').filter(line => line.trim());
  return lines.map(line => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  });
}

/**
 * 批量导入用户
 */
export async function importUsers(
  csvContent: string,
  options: {
    skipHeader?: boolean;
    generatePasswords?: boolean;
    sendEmails?: boolean;
  } = {}
): Promise<ImportResult> {
  const result: ImportResult = {
    success: 0,
    failed: 0,
    errors: [],
    users: [],
  };

  try {
    // 解析CSV
    const rows = parseCSV(csvContent);
    
    // 跳过表头
    const startIndex = options.skipHeader ? 1 : 0;
    
    // 获取表头（用于映射字段）
    const headers = options.skipHeader ? rows[0].map(h => h.toLowerCase()) : 
      ['email', 'password', 'name', 'phone', 'role', 'status', 'credits', 'referredBy'];

    // 查找默认角色
    const defaultRole = await prisma.role.findUnique({
      where: { name: 'user' }
    });

    if (!defaultRole) {
      throw new Error('默认角色不存在');
    }

    // 处理每一行
    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 1;
      
      try {
        // 映射数据到对象
        const data: any = {};
        headers.forEach((header, index) => {
          if (row[index]) {
            data[header] = row[index];
          }
        });

        // 验证数据
        const validatedData = csvRowSchema.parse(data);

        // 检查邮箱是否已存在
        const existingUser = await prisma.user.findUnique({
          where: { email: validatedData.email }
        });

        if (existingUser) {
          result.errors.push({
            row: rowNumber,
            email: validatedData.email,
            error: '邮箱已存在',
          });
          result.failed++;
          continue;
        }

        // 生成或使用提供的密码
        let password = validatedData.password;
        if (!password && options.generatePasswords) {
          password = generateRandomPassword();
        }

        if (!password) {
          result.errors.push({
            row: rowNumber,
            email: validatedData.email,
            error: '密码不能为空',
          });
          result.failed++;
          continue;
        }

        // 哈希密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 查找角色
        const role = validatedData.role ? 
          await prisma.role.findUnique({ where: { name: validatedData.role } }) :
          defaultRole;

        if (!role) {
          result.errors.push({
            row: rowNumber,
            email: validatedData.email,
            error: `角色 ${validatedData.role} 不存在`,
          });
          result.failed++;
          continue;
        }

        // 生成推荐码
        const referralCode = generateReferralCode();

        // 创建用户
        const user = await prisma.user.create({
          data: {
            email: validatedData.email,
            hashedPassword,
            name: validatedData.name,
            phone: validatedData.phone,
            status: validatedData.status,
            credits: validatedData.credits || 0,
            referralCode,
            referredBy: validatedData.referredBy,
            roles: {
              create: {
                roleId: role.id
              }
            }
          }
        });

        result.users.push({
          email: user.email,
          name: user.name,
          status: user.status,
        });

        // 处理推荐关系
        if (validatedData.referredBy) {
          const referrer = await prisma.user.findUnique({
            where: { referralCode: validatedData.referredBy }
          });

          if (referrer) {
            await prisma.referral.create({
              data: {
                referrerId: referrer.id,
                referredId: user.id,
                status: 'completed',
                rewardCredits: 10,
              }
            });

            await prisma.user.update({
              where: { id: referrer.id },
              data: { credits: { increment: 10 } }
            });
          }
        }

        // 发送邮件通知（如果需要）
        if (options.sendEmails) {
          await sendWelcomeEmail(user.email, password);
        }

        result.success++;
      } catch (error) {
        result.errors.push({
          row: rowNumber,
          email: row[0] || 'unknown',
          error: error instanceof Error ? error.message : '未知错误',
        });
        result.failed++;
      }
    }

    return result;
  } catch (error) {
    throw new Error(`导入失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 生成随机密码
 */
function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

/**
 * 生成推荐码
 */
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

/**
 * 发送欢迎邮件（示例）
 */
async function sendWelcomeEmail(email: string, password: string): Promise<void> {
  // TODO: 实现邮件发送逻辑
  console.log(`发送欢迎邮件到 ${email}，临时密码: ${password}`);
}

/**
 * 生成CSV模板
 */
export function generateCSVTemplate(): string {
  const headers = ['email', 'password', 'name', 'phone', 'role', 'status', 'credits', 'referredBy'];
  const examples = [
    ['user1@example.com', 'password123', '张三', '13800138000', 'user', 'active', '100', ''],
    ['user2@example.com', 'password456', '李四', '13900139000', 'admin', 'active', '200', 'ABC123'],
    ['user3@example.com', '', '王五', '', 'operator', 'inactive', '0', ''],
  ];

  const rows = [headers, ...examples];
  return rows.map(row => row.join(',')).join('\n');
}

/**
 * 导出用户为CSV
 */
export async function exportUsersToCSV(
  filters: {
    search?: string;
    role?: string;
    status?: string;
    from?: Date;
    to?: Date;
  } = {}
): Promise<string> {
  // 构建查询条件
  const where: any = {};

  if (filters.search) {
    where.OR = [
      { email: { contains: filters.search, mode: 'insensitive' } },
      { name: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.role && filters.role !== 'all') {
    where.roles = {
      some: {
        role: {
          name: filters.role
        }
      }
    };
  }

  if (filters.status && filters.status !== 'all') {
    where.status = filters.status;
  }

  if (filters.from || filters.to) {
    where.createdAt = {};
    if (filters.from) where.createdAt.gte = filters.from;
    if (filters.to) where.createdAt.lte = filters.to;
  }

  // 查询用户
  const users = await prisma.user.findMany({
    where,
    include: {
      roles: {
        include: {
          role: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // 构建CSV内容
  const headers = ['ID', '邮箱', '姓名', '手机', '角色', '状态', '积分', '推荐码', '推荐人', '最后登录', '注册时间'];
  const rows = users.map(user => [
    user.id,
    user.email,
    user.name || '',
    user.phone || '',
    user.roles[0]?.role.name || 'user',
    user.status,
    user.credits.toString(),
    user.referralCode,
    user.referredBy || '',
    user.lastLogin?.toISOString() || '',
    user.createdAt.toISOString(),
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return csvContent;
}