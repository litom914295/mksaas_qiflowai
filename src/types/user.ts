/**
 * User Type Definitions
 */

export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: boolean;
  role?: 'user' | 'admin';
  customerId?: string | null;
  banned?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  // 扩展属性
  permissions?: string[];
  status?: string;
  credits?: number;
  lastLogin?: Date | string;
  // 安全相关
  hashedPassword?: string;
  // 联系方式
  phone?: string | null;
  avatar?: string | null;
  // 推荐系统
  referralCode?: string | null;
  referredBy?: string | null;
  // 订阅信息
  subscriptionId?: string | null;
  subscriptionStatus?: string | null;
  subscriptionEndDate?: Date | string | null;
}

export interface UserSession {
  user: User;
  expires?: string | Date;
}
