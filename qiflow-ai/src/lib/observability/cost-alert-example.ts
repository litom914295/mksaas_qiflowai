/**
 * Cost Alert Integration Example
 *
 * Demonstrates how to integrate the cost alert service with the AI system.
 */

import { costAlertService } from '../observability/cost-alert';
import { recordUsage, type CostRecord } from '../ai/cost';
import type { CostBudget } from '../ai/types';

/**
 * Example integration in AI request handler
 */
export async function handleAIRequestWithCostAlert(
  userId: string,
  userBudget: CostBudget,
  costRecord: CostRecord,
  userInfo?: { username?: string; email?: string }
): Promise<void> {
  // Record the usage first
  await recordUsage(userId, costRecord.estimatedCostUsd);

  // Check if we should send cost alerts
  await costAlertService.checkUserCostAlerts(userId, userBudget, userInfo);
}

/**
 * Example: Trigger test alert (useful for development/testing)
 */
export async function testCostAlert(): Promise<boolean> {
  console.log('Triggering test cost alert...');
  const success = await costAlertService.triggerTestAlert('test-user-123');
  console.log('Test alert result:', success ? 'SUCCESS' : 'FAILED');
  return success;
}

/**
 * Example: Monitor specific user cost thresholds
 */
export async function monitorUserCosts(
  userId: string,
  userBudget: CostBudget,
  userInfo?: { username?: string; email?: string }
): Promise<{
  alertTriggered: boolean;
  alertHistory: any[];
}> {
  const alertTriggered = await costAlertService.checkUserCostAlerts(
    userId,
    userBudget,
    userInfo
  );

  const alertHistory = costAlertService.getAlertHistory(10);

  return {
    alertTriggered,
    alertHistory: alertHistory.filter(record => record.userId === userId),
  };
}

/**
 * Example: Configure custom alert thresholds for enterprise users
 */
export function configureEnterpriseAlerts(): void {
  costAlertService.updateConfig({
    thresholds: [
      { percentage: 50, type: 'warning', enabled: true },
      { percentage: 75, type: 'critical', enabled: true },
      { percentage: 95, type: 'emergency', enabled: true },
    ],
    cooldownMinutes: 30, // More frequent alerts for enterprise
    includeDetails: true,
    messagePrefix: '🏢 Enterprise Cost Alert',
  });
}

/**
 * Example environment variables for cost alerts:
 *
 * # Slack integration
 * COST_ALERT_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
 * COST_ALERT_SLACK_CHANNEL=cost-alerts
 * COST_ALERT_SLACK_TOKEN=xoxb-your-slack-bot-token
 *
 * # Discord integration
 * COST_ALERT_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK
 *
 * # Generic webhook
 * COST_ALERT_WEBHOOK_URL=https://your-monitoring-system.com/webhooks/cost-alerts
 * COST_ALERT_WEBHOOK_HEADERS={"Authorization":"Bearer your-token","X-Source":"qiflow"}
 *
 * # Configuration
 * COST_ALERT_COOLDOWN_MINUTES=60
 */
