/**
 * 新用户积分奖励与激励配置
 * 匿名试用 → 注册奖励 → 首充优惠 → 邀请裂变
 */

export const WELCOME_BONUSES = {
  // 匿名用户（首次访问）
  anonymous: {
    freeTrials: 3, // 3次本地分析（无需注册）
    features: ['local'], // 仅本地模式
    expireHours: 24, // 24小时内有效
    prompt: '注册立得200积分，解锁全部功能',
    storageKey: 'qiflow_anonymous_trials', // localStorage key
  },

  // 注册用户
  registered: {
    credits: 70, // 注册送70积分（与 websiteConfig 保持一致）
    source: 'REGISTER_GIFT',
    features: ['all'],
    bonus: [
      '✅ 70积分 = 基础体验所需',
      '✅ 解锁核心功能体验',
      '✅ 每日签到送积分',
      '✅ 分享得积分奖励',
    ],
    welcomeMessage: '🎉 恭喜！您已获得70积分新人礼包',
  },

  // 首次充值奖励
  firstPurchase: {
    bonusRate: 0.5, // 额外送50%
    example: '充值100积分，实得150积分',
    limit: '仅限首次充值',
    badge: '🔥 首充50%优惠',
  },

  // 邀请奖励
  referral: {
    inviter: 15, // 推荐人 15 积分
    invitee: 20, // 被推荐人 20 积分
    condition: '被邀请人完成激活任务后发放',
    shareMessage: '快来体验气流AI！注册送新人积分，每日签到有奖励~',
  },
};

/**
 * 每日签到奖励配置
 */
export const DAILY_CHECKIN_REWARDS = {
  day1: 5,
  day2: 5,
  day3: 10,
  day4: 5,
  day5: 5,
  day6: 5,
  day7: 20, // 连续7天额外奖励

  // 连续签到递增奖励
  streakBonus: {
    week2: 30, // 连续14天
    week3: 50, // 连续21天
    month: 100, // 连续30天
  },

  // 签到提醒
  reminderMessage: '今日签到可得 {credits} 积分，已连续签到 {streak} 天',
};

/**
 * 新手任务配置
 */
export const GROWTH_TASKS = {
  beginner: [
    {
      id: 'complete-profile',
      name: '完善个人资料',
      credits: 20,
      description: '填写出生日期、时间、性别等信息',
      icon: '📝',
    },
    {
      id: 'first-analysis',
      name: '完成首次分析',
      credits: 30,
      description: '体验玄空风水分析功能',
      icon: '🔮',
    },
    {
      id: 'share-result',
      name: '分享分析结果',
      credits: 15,
      description: '分享到微信或朋友圈',
      icon: '📤',
    },
    {
      id: 'enable-notification',
      name: '开启消息提醒',
      credits: 10,
      description: '开启流年提醒与节气推送',
      icon: '🔔',
    },
  ],

  intermediate: [
    {
      id: 'try-3-scenarios',
      name: '体验3个不同场景',
      credits: 50,
      description: '尝试居家、事业、财运等不同场景',
      icon: '🎯',
    },
    {
      id: 'continuous-checkin-7',
      name: '连续签到7天',
      credits: 30,
      description: '养成每日签到习惯',
      icon: '📅',
    },
    {
      id: 'invite-friend',
      name: '邀请1位好友',
      credits: 50,
      description: '邀请好友注册并使用',
      icon: '👥',
    },
    {
      id: 'rate-app',
      name: '给应用评分',
      credits: 20,
      description: '在应用商店给5星好评',
      icon: '⭐',
    },
  ],

  advanced: [
    {
      id: 'monthly-active',
      name: '月活跃用户',
      credits: 100,
      description: '每月至少使用5次分析功能',
      icon: '🏆',
    },
    {
      id: 'purchase-first',
      name: '完成首次充值',
      credits: 50,
      description: '首充享50%额外奖励',
      bonus: '50%额外',
      icon: '💎',
    },
    {
      id: 'invite-5-friends',
      name: '邀请5位好友',
      credits: 200,
      description: '成为气流AI推广大使',
      icon: '🎖️',
    },
  ],
};

/**
 * 获取签到奖励积分
 */
export function getCheckinReward(day: number, streak: number): number {
  const dailyRewards = [
    DAILY_CHECKIN_REWARDS.day1,
    DAILY_CHECKIN_REWARDS.day2,
    DAILY_CHECKIN_REWARDS.day3,
    DAILY_CHECKIN_REWARDS.day4,
    DAILY_CHECKIN_REWARDS.day5,
    DAILY_CHECKIN_REWARDS.day6,
    DAILY_CHECKIN_REWARDS.day7,
  ];

  let baseReward = dailyRewards[(day - 1) % 7];

  // 连续签到额外奖励
  if (streak === 14) {
    baseReward += DAILY_CHECKIN_REWARDS.streakBonus.week2;
  } else if (streak === 21) {
    baseReward += DAILY_CHECKIN_REWARDS.streakBonus.week3;
  } else if (streak === 30) {
    baseReward += DAILY_CHECKIN_REWARDS.streakBonus.month;
  }

  return baseReward;
}

/**
 * 获取所有新手任务
 */
export function getAllGrowthTasks() {
  return [
    ...GROWTH_TASKS.beginner,
    ...GROWTH_TASKS.intermediate,
    ...GROWTH_TASKS.advanced,
  ];
}

/**
 * 根据ID获取任务
 */
export function getTaskById(id: string) {
  return getAllGrowthTasks().find((task) => task.id === id);
}
