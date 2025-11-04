// 数据库模块 - 扩展版本
interface Role {
  id: string;
  name: string;
  permissions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  role: Role;
  createdAt: Date;
}

interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar?: string;
  hashedPassword?: string;
  status: 'active' | 'inactive' | 'banned';
  credits: number;
  referralCode?: string;
  referredBy?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  roles?: UserRole[];
  mfa?: any;
  _count?: {
    referrals: number;
    transactions: number;
  };
}

interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  status: string;
  rewardCredits: number;
  createdAt: Date;
}

interface ApiTokenModel {
  id: string;
  userId: string;
  name: string;
  token: string;
  permissions: string | null;
  expiresAt: Date | null;
  lastUsed: Date | null;
  createdAt: Date;
}

interface MFAModel {
  userId: string;
  method: 'totp' | 'sms' | 'email';
  secret: string | null;
  backupCodes: string | null;
  enabled: boolean;
  lastUsed: Date | null;
}

interface VerificationCodeModel {
  id: string;
  userId: string;
  code: string;
  type: string;
  expiresAt: Date;
  used: boolean;
}

interface LoginLogModel {
  id: string;
  userId: string;
  ip: string;
  userAgent: string;
  status: string;
  createdAt: Date;
}

interface SessionModel {
  id: string;
  userId: string;
  sessionToken: string;
  expires: Date;
  createdAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  device?: string | null;
}

interface ActivityLogModel {
  id: string;
  userId: string;
  sessionId?: string | null;
  action: string;
  resource?: string | null;
  metadata?: any;
  timestamp: Date;
}

interface DatabaseClient {
  user: {
    findMany: (params?: any) => Promise<User[]>;
    findUnique: (params: {
      where: { id?: string; email?: string; referralCode?: string };
    }) => Promise<User | null>;
    count: (params?: any) => Promise<number>;
    create: (params: {
      data: any;
      include?: any;
    }) => Promise<User>;
    update: (params: {
      where: { id: string };
      data: any;
    }) => Promise<User>;
    delete: (params: { where: { id: string } }) => Promise<User>;
  };
  role: {
    findUnique: (params: { where: { name: string } }) => Promise<Role | null>;
    findMany: () => Promise<Role[]>;
  };
  referral: {
    create: (params: { data: any }) => Promise<Referral>;
  };
  // 额外表：用于消除类型错误
  apiToken: {
    create: (params: { data: any }) => Promise<ApiTokenModel>;
    findUnique: (params: {
      where: { token?: string; id?: string; userId?: string };
    }) => Promise<ApiTokenModel | null>;
    update: (params: {
      where: { id: string };
      data: Partial<ApiTokenModel>;
    }) => Promise<ApiTokenModel>;
    delete: (params: {
      where: { id: string; userId?: string };
    }) => Promise<ApiTokenModel>;
    deleteMany: (params: {
      where: { expiresAt: { not: null; lt: Date } };
    }) => Promise<{ count: number }>;
    findMany: (params: { where: { userId: string }; orderBy?: any }) => Promise<
      ApiTokenModel[]
    >;
  };
  mfa: {
    findUnique: (params: {
      where: { userId: string; enabled?: boolean };
    }) => Promise<MFAModel | null>;
    update: (params: {
      where: { userId: string };
      data: Partial<MFAModel>;
    }) => Promise<MFAModel>;
    create: (params: {
      data: MFAModel & { userId: string };
    }) => Promise<MFAModel>;
  };
  verificationCode: {
    create: (params: { data: any }) => Promise<VerificationCodeModel>;
    findFirst: (params: {
      where: {
        userId: string;
        code: string;
        type: string;
        expiresAt: { gt: Date };
        used: boolean;
      };
    }) => Promise<VerificationCodeModel | null>;
    update: (params: {
      where: { id: string };
      data: Partial<VerificationCodeModel>;
    }) => Promise<VerificationCodeModel>;
  };
  loginLog: {
    create: (params: { data: any }) => Promise<LoginLogModel>;
  };
  session: {
    findMany: (params: any) => Promise<SessionModel[]>;
    delete: (params: {
      where: { id: string; userId?: string };
    }) => Promise<SessionModel>;
    deleteMany: (params: { where: any }) => Promise<{ count: number }>;
    findUnique: (params: {
      where: { sessionToken: string };
    }) => Promise<SessionModel | null>;
    count: (params: { where: any }) => Promise<number>;
    update: (params: {
      where: { sessionToken: string };
      data: Partial<SessionModel>;
    }) => Promise<SessionModel>;
  };
  activityLog: {
    create: (params: { data: any }) => Promise<ActivityLogModel>;
  };
}

// 模拟数据库客户端
const mockDB: DatabaseClient = {
  user: {
    findMany: async (params?: any) => {
      // 返回模拟用户数据
      const users: User[] = [
        {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          phone: '1234567890',
          status: 'active',
          credits: 100,
          referralCode: 'ADMIN1',
          createdAt: new Date(),
          updatedAt: new Date(),
          roles: [
            {
              id: '1',
              userId: '1',
              roleId: '1',
              role: {
                id: '1',
                name: 'admin',
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              createdAt: new Date(),
            },
          ],
          _count: {
            referrals: 5,
            transactions: 10,
          },
        },
      ];

      // 简单的分页逻辑
      if (params?.skip !== undefined && params?.take !== undefined) {
        return users.slice(params.skip, params.skip + params.take);
      }
      return users;
    },
    findUnique: async (params) => {
      // 返回模拟用户
      if (params.where.email === 'existing@example.com') {
        return {
          id: '1',
          email: 'existing@example.com',
          name: 'Existing User',
          status: 'active',
          credits: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return null;
    },
    count: async (params?: any) => {
      // 返回模拟计数
      return 1;
    },
    create: async (params) => ({
      id: Math.random().toString(36),
      email: params.data.email || 'test@example.com',
      name: params.data.name,
      phone: params.data.phone,
      hashedPassword: params.data.hashedPassword,
      status: params.data.status || 'active',
      credits: params.data.credits || 0,
      referralCode: params.data.referralCode || 'TEST123',
      referredBy: params.data.referredBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: params.include?.roles
        ? [
            {
              id: '1',
              userId: '1',
              roleId: '1',
              role: {
                id: '1',
                name: 'user',
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              createdAt: new Date(),
            },
          ]
        : undefined,
      _count: {
        referrals: 0,
        transactions: 0,
      },
    }),
    update: async (params) => ({
      id: params.where.id,
      email: params.data.email || 'test@example.com',
      name: params.data.name || 'Test User',
      status: params.data.status || 'active',
      credits: params.data.credits?.increment
        ? 100 + params.data.credits.increment
        : params.data.credits || 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    delete: async (params) => ({
      id: params.where.id,
      email: 'deleted@example.com',
      name: 'Deleted User',
      status: 'inactive',
      credits: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  },
  role: {
    findUnique: async (params) => {
      // 返回模拟角色
      if (params.where.name) {
        return {
          id: '1',
          name: params.where.name,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return null;
    },
    findMany: async () => [
      {
        id: '1',
        name: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
  referral: {
    create: async (params) => ({
      id: Math.random().toString(36),
      referrerId: params.data.referrerId,
      referredId: params.data.referredId,
      status: params.data.status || 'pending',
      rewardCredits: params.data.rewardCredits || 10,
      createdAt: new Date(),
    }),
  },
  apiToken: {
    create: async (params) => ({
      id: Math.random().toString(36),
      userId: params.data.userId,
      name: params.data.name,
      token: params.data.token,
      permissions: params.data.permissions,
      expiresAt: params.data.expiresAt || null,
      lastUsed: null,
      createdAt: new Date(),
    }),
    findUnique: async (params) => null,
    update: async (params) => ({
      id: params.where.id,
      userId: '1',
      name: 'token',
      token: params.data.token || 'hash',
      permissions: null,
      expiresAt: null,
      lastUsed: params.data.lastUsed || null,
      createdAt: new Date(),
    }),
    delete: async (params) => ({
      id: params.where.id,
      userId: '1',
      name: 'token',
      token: 'hash',
      permissions: null,
      expiresAt: null,
      lastUsed: null,
      createdAt: new Date(),
    }),
    deleteMany: async () => ({ count: 0 }),
    findMany: async () => [],
  },
  mfa: {
    findUnique: async (params) => null,
    update: async (params) => ({
      userId: params.where.userId,
      method: 'totp',
      secret: null,
      backupCodes: null,
      enabled: true,
      lastUsed: new Date(),
    }),
    create: async (params) => ({
      userId: params.data.userId,
      method: params.data.method,
      secret: params.data.secret,
      backupCodes: params.data.backupCodes,
      enabled: params.data.enabled,
      lastUsed: params.data.lastUsed,
    }),
  },
  verificationCode: {
    create: async (params) => ({
      id: Math.random().toString(36),
      userId: params.data.userId,
      code: params.data.code,
      type: params.data.type,
      expiresAt: params.data.expiresAt,
      used: false,
    }),
    findFirst: async () => null,
    update: async (params) => ({
      id: params.where.id,
      userId: '1',
      code: '000000',
      type: 'sms_mfa',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      used: true,
    }),
  },
  loginLog: {
    create: async (params) => ({
      id: Math.random().toString(36),
      userId: params.data.userId,
      ip: params.data.ip,
      userAgent: params.data.userAgent,
      status: params.data.status,
      createdAt: new Date(),
    }),
  },
  session: {
    findMany: async (params) => [],
    delete: async (params) => ({
      id: params.where.id,
      userId: '1',
      sessionToken: 'token',
      expires: new Date(Date.now() + 1000),
      createdAt: new Date(),
      ipAddress: '127.0.0.1',
      userAgent: 'Agent',
      device: 'Device',
    }),
    deleteMany: async () => ({ count: 0 }),
    findUnique: async () => null,
    count: async () => 0,
    update: async (params) => ({
      id: '1',
      userId: '1',
      sessionToken: params.where.sessionToken,
      expires: params.data.expires || new Date(),
      createdAt: new Date(),
      ipAddress: null,
      userAgent: null,
      device: null,
    }),
  },
  activityLog: {
    create: async (params) => ({
      id: Math.random().toString(36),
      userId: params.data.userId,
      sessionId: params.data.sessionId,
      action: params.data.action,
      resource: params.data.resource,
      metadata: params.data.metadata,
      timestamp: new Date(),
    }),
  },
};

export const db = mockDB;
export const prisma = mockDB; // 导出prisma别名以兼容现有代码
export type {
  User,
  Role,
  UserRole,
  Referral,
  DatabaseClient,
  ApiTokenModel as ApiToken,
  MFAModel as MFA,
  VerificationCodeModel as VerificationCode,
  LoginLogModel as LoginLog,
  SessionModel as SessionRecord,
  ActivityLogModel as ActivityLog,
};
