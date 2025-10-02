import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('请输入合法邮箱'),
  password: z.string().min(6, '密码至少6位'),
});

export const registerSchema = z.object({
  displayName: z.string().min(2, '昵称至少2个字符'),
  email: z.string().email('请输入合法邮箱'),
  password: z.string().min(6, '密码至少6位'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;


