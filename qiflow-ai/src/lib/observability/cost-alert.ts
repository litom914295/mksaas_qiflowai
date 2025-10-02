/**
 * Cost Alert Integration Service
 *
 * Monitors cumulative AI usage costs and triggers alerts when thresholds are exceeded.
 * Supports multiple notification channels (Slack, Discord, custom webhooks).
 */

import { getUserUsage, getUserBudgetStatus, type CostRecord } from '../ai/cost';
import type { CostBudget } from '../ai/types';

export interface AlertThreshold {
  /** Percentage of budget consumed (0-100) */
  percentage: number;
  /** Type of alert */
  type: 'warning' | 'critical' | 'emergency';
  /** Whether this threshold should trigger notifications */
  enabled: boolean;
}

export interface AlertChannel {
  /** Channel type */
  type: 'slack' | 'discord' | 'webhook' | 'email';
  /** Webhook URL for notifications */
  url: string;
  /** Channel-specific configuration */
  config?: {
    /** Slack channel name (without #) */
    channel?: string;
    /** Bot token for authenticated requests */
    token?: string;
    /** Custom headers for webhook requests */
    headers?: Record<string, string>;
    /** Message format template */
    template?: string;
  };
  /** Whether this channel is enabled */
  enabled: boolean;
}

export interface CostAlertConfig {
  /** Alert thresholds */
  thresholds: AlertThreshold[];
  /** Notification channels */
  channels: AlertChannel[];
  /** Cooldown period in minutes to prevent spam */
  cooldownMinutes: number;
  /** Whether to include detailed usage breakdown in alerts */
  includeDetails: boolean;
  /** Custom alert message prefix */
  messagePrefix?: string;
}

export interface AlertContext {
  userId: string;
  username?: string;
  userEmail?: string;
  currentUsage: {
    daily: number;
    monthly: number;
  };
  budgetStatus: {
    daily: { used: number; limit: number; percentage: number };
    monthly: { used: number; limit: number; percentage: number };
  };
  threshold: AlertThreshold;
  triggeredAt: Date;
  environment: string;
}

export interface AlertRecord {
  userId: string;
  thresholdType: 'warning' | 'critical' | 'emergency';
  thresholdPercentage: number;
  alertedAt: Date;
  channel: string;
  success: boolean;
  errorMessage?: string;
}

// Default configuration
const DEFAULT_CONFIG: CostAlertConfig = {
  thresholds: [
    { percentage: 70, type: 'warning', enabled: true },
    { percentage: 90, type: 'critical', enabled: true },
    { percentage: 100, type: 'emergency', enabled: true },
  ],
  channels: [],
  cooldownMinutes: 60,
  includeDetails: true,
  messagePrefix: '🚨 QiFlow AI Cost Alert',
};

// In-memory cooldown tracking (in production, use Redis)
const alertCooldowns = new Map<string, Date>();

class CostAlertService {
  private config: CostAlertConfig;
  private readonly alertHistory: AlertRecord[] = [];

  constructor(config?: Partial<CostAlertConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadConfigFromEnv();
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfigFromEnv(): void {
    // Slack configuration
    const slackWebhookUrl = process.env.COST_ALERT_SLACK_WEBHOOK_URL;
    const slackChannel = process.env.COST_ALERT_SLACK_CHANNEL;
    const slackToken = process.env.COST_ALERT_SLACK_TOKEN;

    if (slackWebhookUrl) {
      this.config.channels.push({
        type: 'slack',
        url: slackWebhookUrl,
        config: {
          channel: slackChannel,
          token: slackToken,
        },
        enabled: true,
      });
    }

    // Discord configuration
    const discordWebhookUrl = process.env.COST_ALERT_DISCORD_WEBHOOK_URL;
    if (discordWebhookUrl) {
      this.config.channels.push({
        type: 'discord',
        url: discordWebhookUrl,
        enabled: true,
      });
    }

    // Generic webhook configuration
    const webhookUrl = process.env.COST_ALERT_WEBHOOK_URL;
    const webhookHeaders = process.env.COST_ALERT_WEBHOOK_HEADERS;
    if (webhookUrl) {
      this.config.channels.push({
        type: 'webhook',
        url: webhookUrl,
        config: {
          headers: webhookHeaders ? JSON.parse(webhookHeaders) : undefined,
        },
        enabled: true,
      });
    }

    // Override cooldown if specified
    const cooldownMinutes = process.env.COST_ALERT_COOLDOWN_MINUTES;
    if (cooldownMinutes) {
      this.config.cooldownMinutes = parseInt(cooldownMinutes, 10);
    }
  }

  /**
   * Check if user should receive alerts based on their usage
   */
  async checkUserCostAlerts(
    userId: string,
    budget: CostBudget,
    userInfo?: {
      username?: string;
      email?: string;
    }
  ): Promise<boolean> {
    try {
      const budgetStatus = await getUserBudgetStatus(userId, budget);
      const triggeredThresholds = this.getTriggeredThresholds(budgetStatus);

      for (const threshold of triggeredThresholds) {
        const shouldAlert = await this.shouldSendAlert(userId, threshold);
        if (shouldAlert) {
          const context: AlertContext = {
            userId,
            username: userInfo?.username,
            userEmail: userInfo?.email,
            currentUsage: {
              daily: budgetStatus.daily.used,
              monthly: budgetStatus.monthly.used,
            },
            budgetStatus: {
              daily: {
                used: budgetStatus.daily.used,
                limit: budgetStatus.daily.limit,
                percentage: budgetStatus.daily.percentage,
              },
              monthly: {
                used: budgetStatus.monthly.used,
                limit: budgetStatus.monthly.limit,
                percentage: budgetStatus.monthly.percentage,
              },
            },
            threshold,
            triggeredAt: new Date(),
            environment: process.env.NODE_ENV || 'development',
          };

          await this.sendAlert(context);
          this.setCooldown(userId, threshold);
        }
      }

      return triggeredThresholds.length > 0;
    } catch (error) {
      console.error('[CostAlert] Error checking user cost alerts:', error);
      return false;
    }
  }

  /**
   * Get thresholds that have been triggered
   */
  private getTriggeredThresholds(budgetStatus: any): AlertThreshold[] {
    const maxPercentage = Math.max(
      budgetStatus.daily.percentage,
      budgetStatus.monthly.percentage
    );

    return this.config.thresholds.filter(
      threshold => threshold.enabled && maxPercentage >= threshold.percentage
    );
  }

  /**
   * Check if we should send alert (respecting cooldown)
   */
  private async shouldSendAlert(
    userId: string,
    threshold: AlertThreshold
  ): Promise<boolean> {
    const cooldownKey = `${userId}-${threshold.type}`;
    const lastAlert = alertCooldowns.get(cooldownKey);

    if (!lastAlert) return true;

    const cooldownMs = this.config.cooldownMinutes * 60 * 1000;
    const timeSinceLastAlert = Date.now() - lastAlert.getTime();

    return timeSinceLastAlert > cooldownMs;
  }

  /**
   * Set cooldown for user-threshold combination
   */
  private setCooldown(userId: string, threshold: AlertThreshold): void {
    const cooldownKey = `${userId}-${threshold.type}`;
    alertCooldowns.set(cooldownKey, new Date());
  }

  /**
   * Send alert to all configured channels
   */
  private async sendAlert(context: AlertContext): Promise<void> {
    const promises = this.config.channels
      .filter(channel => channel.enabled)
      .map(channel => this.sendToChannel(channel, context));

    await Promise.allSettled(promises);
  }

  /**
   * Send alert to specific channel
   */
  private async sendToChannel(
    channel: AlertChannel,
    context: AlertContext
  ): Promise<void> {
    const alertRecord: AlertRecord = {
      userId: context.userId,
      thresholdType: context.threshold.type,
      thresholdPercentage: context.threshold.percentage,
      alertedAt: context.triggeredAt,
      channel: channel.type,
      success: false,
    };

    try {
      const message = this.formatMessage(channel, context);
      const payload = this.buildPayload(channel, message, context);

      const response = await fetch(channel.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...channel.config?.headers,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      alertRecord.success = true;
      console.log(
        `[CostAlert] Alert sent successfully to ${channel.type} for user ${context.userId}`
      );
    } catch (error) {
      alertRecord.success = false;
      alertRecord.errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(
        `[CostAlert] Failed to send alert to ${channel.type}:`,
        error
      );
    }

    this.alertHistory.push(alertRecord);
  }

  /**
   * Format alert message for specific channel
   */
  private formatMessage(channel: AlertChannel, context: AlertContext): string {
    const prefix = this.config.messagePrefix || '🚨 QiFlow AI Cost Alert';
    const emoji = this.getAlertEmoji(context.threshold.type);
    const env =
      context.environment !== 'production'
        ? ` [${context.environment.toUpperCase()}]`
        : '';

    let message = `${prefix}${env}\n\n`;
    message += `${emoji} **${context.threshold.type.toUpperCase()} THRESHOLD REACHED**\n\n`;

    if (context.username) {
      message += `**User:** ${context.username}`;
      if (context.userEmail) {
        message += ` (${context.userEmail})`;
      }
      message += '\n';
    }

    message += `**User ID:** ${context.userId}\n`;
    message += `**Threshold:** ${context.threshold.percentage}%\n`;
    message += `**Time:** ${context.triggeredAt.toISOString()}\n\n`;

    if (this.config.includeDetails) {
      message += '**Usage Details:**\n';
      message += `• Daily: $${context.currentUsage.daily.toFixed(4)} / $${context.budgetStatus.daily.limit.toFixed(2)} `;
      message += `(${context.budgetStatus.daily.percentage.toFixed(1)}%)\n`;
      message += `• Monthly: $${context.currentUsage.monthly.toFixed(4)} / $${context.budgetStatus.monthly.limit.toFixed(2)} `;
      message += `(${context.budgetStatus.monthly.percentage.toFixed(1)}%)\n`;
    }

    return message;
  }

  /**
   * Get emoji for alert type
   */
  private getAlertEmoji(type: 'warning' | 'critical' | 'emergency'): string {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'critical':
        return '🚨';
      case 'emergency':
        return '🔥';
      default:
        return '⚠️';
    }
  }

  /**
   * Build payload for specific channel type
   */
  private buildPayload(
    channel: AlertChannel,
    message: string,
    context: AlertContext
  ): any {
    switch (channel.type) {
      case 'slack':
        return {
          text: message,
          channel: channel.config?.channel,
          username: 'QiFlow AI Cost Monitor',
          icon_emoji: this.getAlertEmoji(context.threshold.type),
          attachments: [
            {
              color: this.getAlertColor(context.threshold.type),
              fields: [
                {
                  title: 'User ID',
                  value: context.userId,
                  short: true,
                },
                {
                  title: 'Threshold',
                  value: `${context.threshold.percentage}%`,
                  short: true,
                },
                {
                  title: 'Daily Usage',
                  value: `$${context.currentUsage.daily.toFixed(4)} (${context.budgetStatus.daily.percentage.toFixed(1)}%)`,
                  short: true,
                },
                {
                  title: 'Monthly Usage',
                  value: `$${context.currentUsage.monthly.toFixed(4)} (${context.budgetStatus.monthly.percentage.toFixed(1)}%)`,
                  short: true,
                },
              ],
            },
          ],
        };

      case 'discord':
        return {
          content: message,
          embeds: [
            {
              title: `${this.getAlertEmoji(context.threshold.type)} Cost Alert`,
              description: `User ${context.userId} has exceeded ${context.threshold.percentage}% of their budget`,
              color: parseInt(
                this.getAlertColor(context.threshold.type).replace('#', ''),
                16
              ),
              fields: [
                {
                  name: 'Daily Usage',
                  value: `$${context.currentUsage.daily.toFixed(4)} (${context.budgetStatus.daily.percentage.toFixed(1)}%)`,
                  inline: true,
                },
                {
                  name: 'Monthly Usage',
                  value: `$${context.currentUsage.monthly.toFixed(4)} (${context.budgetStatus.monthly.percentage.toFixed(1)}%)`,
                  inline: true,
                },
              ],
              timestamp: context.triggeredAt.toISOString(),
            },
          ],
        };

      case 'webhook':
      default:
        return {
          alertType: context.threshold.type,
          userId: context.userId,
          username: context.username,
          userEmail: context.userEmail,
          threshold: context.threshold.percentage,
          currentUsage: context.currentUsage,
          budgetStatus: context.budgetStatus,
          triggeredAt: context.triggeredAt.toISOString(),
          environment: context.environment,
          message,
        };
    }
  }

  /**
   * Get color for alert type
   */
  private getAlertColor(type: 'warning' | 'critical' | 'emergency'): string {
    switch (type) {
      case 'warning':
        return '#ffcc00';
      case 'critical':
        return '#ff6600';
      case 'emergency':
        return '#ff0000';
      default:
        return '#ffcc00';
    }
  }

  /**
   * Manual trigger for testing
   */
  async triggerTestAlert(userId: string = 'test-user'): Promise<boolean> {
    const testContext: AlertContext = {
      userId,
      username: 'Test User',
      userEmail: 'test@example.com',
      currentUsage: {
        daily: 0.85,
        monthly: 12.5,
      },
      budgetStatus: {
        daily: { used: 0.85, limit: 1.0, percentage: 85 },
        monthly: { used: 12.5, limit: 15.0, percentage: 83.3 },
      },
      threshold: { percentage: 80, type: 'warning', enabled: true },
      triggeredAt: new Date(),
      environment: process.env.NODE_ENV || 'development',
    };

    try {
      await this.sendAlert(testContext);
      console.log('[CostAlert] Test alert sent successfully');
      return true;
    } catch (error) {
      console.error('[CostAlert] Failed to send test alert:', error);
      return false;
    }
  }

  /**
   * Get alert history for monitoring
   */
  getAlertHistory(limit?: number): AlertRecord[] {
    return limit ? this.alertHistory.slice(-limit) : this.alertHistory;
  }

  /**
   * Get current configuration
   */
  getConfig(): CostAlertConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<CostAlertConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Clear alert cooldowns (useful for testing)
   */
  clearCooldowns(): void {
    alertCooldowns.clear();
  }
}

// Export singleton instance
export const costAlertService = new CostAlertService();

// Export classes for testing
export { CostAlertService };
