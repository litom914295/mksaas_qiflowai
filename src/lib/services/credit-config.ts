import { prisma } from '@/lib/prisma';

/**
 * 默认积分配置
 */
const DEFAULT_CONFIG = {
  signin: {
    daily: 2,
    consecutive7: 5,
    consecutive30: 20,
  },
  milestones: [
    { days: 7, reward: 10, enabled: true },
    { days: 15, reward: 20, enabled: true },
    { days: 30, reward: 50, enabled: true },
    { days: 60, reward: 100, enabled: true },
    { days: 90, reward: 200, enabled: true },
  ],
  tasks: {
    firstBazi: 10,
    firstFengshui: 10,
    firstPdfExport: 5,
    firstShare: 3,
  },
  referral: {
    inviterBonus: 50,
    inviteeBonus: 20,
    milestoneBonus: {
      3: 100,
      10: 500,
      50: 2000,
    },
  },
};

/**
 * 获取配置值
 */
export async function getConfig(key: string): Promise<any> {
  try {
    const config = await prisma.creditConfig.findUnique({
      where: { key },
    });

    if (config) {
      return config.value;
    }

    // 如果数据库中没有,返回默认值
    const keys = key.split('.');
    let value: any = DEFAULT_CONFIG;
    for (const k of keys) {
      value = value?.[k];
    }
    return value;
  } catch (error) {
    console.error('Error getting config:', error);
    // 出错时返回默认值
    const keys = key.split('.');
    let value: any = DEFAULT_CONFIG;
    for (const k of keys) {
      value = value?.[k];
    }
    return value;
  }
}

/**
 * 获取所有配置
 */
export async function getAllConfig(): Promise<typeof DEFAULT_CONFIG> {
  try {
    const configs = await prisma.creditConfig.findMany();

    // 从默认配置开始
    const result = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

    // 用数据库配置覆盖
    for (const config of configs) {
      const keys = config.key.split('.');
      let obj: any = result;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = config.value;
    }

    return result;
  } catch (error) {
    console.error('Error getting all config:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * 设置配置值
 */
export async function setConfig(
  key: string,
  value: any,
  description?: string
): Promise<void> {
  await prisma.creditConfig.upsert({
    where: { key },
    update: {
      value,
      description,
    },
    create: {
      key,
      value,
      description,
    },
  });
}

/**
 * 批量更新配置
 */
export async function updateConfigs(
  configs: Record<string, any>
): Promise<void> {
  const operations = [];

  for (const [key, value] of Object.entries(configs)) {
    operations.push(
      prisma.creditConfig.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    );
  }

  await prisma.$transaction(operations);
}

/**
 * 初始化配置(如果数据库为空)
 */
export async function initializeConfig(): Promise<void> {
  const count = await prisma.creditConfig.count();
  if (count > 0) {
    console.log('Config already initialized');
    return;
  }

  console.log('Initializing credit config...');

  const configs = [
    {
      key: 'signin',
      value: DEFAULT_CONFIG.signin,
      description: '签到奖励配置',
    },
    {
      key: 'milestones',
      value: DEFAULT_CONFIG.milestones,
      description: '里程碑奖励配置',
    },
    {
      key: 'tasks',
      value: DEFAULT_CONFIG.tasks,
      description: '任务奖励配置',
    },
    {
      key: 'referral',
      value: DEFAULT_CONFIG.referral,
      description: '推荐奖励配置',
    },
  ];

  await prisma.creditConfig.createMany({
    data: configs,
  });

  console.log('Config initialized successfully');
}
