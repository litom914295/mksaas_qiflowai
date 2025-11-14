/**
 * Credit transaction type enum
 */
export enum CREDIT_TRANSACTION_TYPE {
  // 获取积分
  MONTHLY_REFRESH = 'MONTHLY_REFRESH',        // Credits earned by monthly refresh (free users)
  REGISTER_GIFT = 'REGISTER_GIFT',            // Credits earned by register gift
  PURCHASE_PACKAGE = 'PURCHASE_PACKAGE',      // Credits earned by purchase package
  SUBSCRIPTION_RENEWAL = 'SUBSCRIPTION_RENEWAL', // Credits earned by subscription renewal
  LIFETIME_MONTHLY = 'LIFETIME_MONTHLY',      // Credits earned by lifetime plan monthly distribution
  DAILY_SIGNIN = 'DAILY_SIGNIN',              // Credits earned by daily sign-in
  REFERRAL_REWARD = 'REFERRAL_REWARD',        // Credits earned by referral activation reward
  SHARE_REWARD = 'SHARE_REWARD',              // Credits earned by share conversion
  TASK_REWARD = 'TASK_REWARD',                // Credits earned by completing tasks (newbie missions, etc.)
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',    // Credits manually adjusted by admin
  REFUND = 'REFUND',                          // Credits refunded due to failed operations
  
  // 消耗积分
  USAGE = 'USAGE',                            // Credits spent by usage
  
  // Phase 2 新增: 报告产品购买
  REPORT_PURCHASE = 'REPORT_PURCHASE',        // Credits spent on report purchase
  
  // Phase 6 新增: Chat 会话
  CHAT_SESSION_START = 'CHAT_SESSION_START',  // Credits spent on starting chat session
  CHAT_SESSION_RENEW = 'CHAT_SESSION_RENEW',  // Credits spent on renewing chat session
  
  // Phase 5 新增: A/B 测试奖励
  AB_TEST_BONUS = 'AB_TEST_BONUS',            // Credits earned from A/B test participation
  
  // 积分过期
  EXPIRE = 'EXPIRE',                          // Credits expired
}

/**
 * Credit package price
 */
export interface CreditPackagePrice {
  priceId: string;                   // Stripe price ID (not product id)
  amount: number;                    // Price amount in currency units (dollars, euros, etc.)
  currency: string;                  // Currency code (e.g., USD)
  allowPromotionCode?: boolean;      // Whether to allow promotion code for this price
}

/**
 * Credit package
 */
export interface CreditPackage {
  id: string;                          // Unique identifier for the package
  amount: number;                      // Amount of credits in the package
  price: CreditPackagePrice;           // Price of the package
  popular: boolean;                    // Whether the package is popular
  name?: string;                       // Display name of the package
  description?: string;                // Description of the package
  expireDays?: number;                 // Number of days to expire the credits, undefined means no expire
  disabled?: boolean;                  // Whether the package is disabled in the UI
}
