import { recordUsage } from './cost';
import type { ConversationContext } from './types/conversation';

const DEFAULT_DAILY_BUDGET_USD = 10;

export class CostController {
  constructor(
    private readonly dailyBudgetUsd: number = DEFAULT_DAILY_BUDGET_USD
  ) {}

  async ensureWithinBudget(
    context: ConversationContext,
    estimatedCost: number
  ): Promise<boolean> {
    if (Number.isNaN(estimatedCost) || estimatedCost <= 0) {
      return true;
    }

    const budgetThreshold = this.dailyBudgetUsd * 0.1;
    if (estimatedCost > budgetThreshold) {
      return false;
    }

    const userKey =
      context.userId && context.userId.trim() !== ''
        ? context.userId
        : context.sessionId;
    if (userKey) {
      try {
        await recordUsage(userKey, estimatedCost);
      } catch (error) {
        console.error(
          `[CostController] Failed to record usage for ${userKey}:`,
          error
        );
        // Log the error but do not block the main flow, return true to allow operation
      }
    }

    return true;
  }
}
