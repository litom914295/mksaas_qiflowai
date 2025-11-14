'use server';

import { consumeCredits } from '@/credits/credits';
import type { User } from '@/lib/auth-types';
import { strictRateLimitedActionClient } from '@/lib/safe-action';
import { z } from 'zod';

// consume credits schema
const consumeSchema = z.object({
  amount: z.number().min(1),
  description: z.string().optional(),
});

/**
 * Consume credits
 * Rate limited: 10 requests/minute (high-risk action)
 */
export const consumeCreditsAction = strictRateLimitedActionClient
  .schema(consumeSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { amount, description } = parsedInput;
    const currentUser = (ctx as { user: User }).user;

    try {
      await consumeCredits({
        userId: currentUser.id,
        amount,
        description: description || `Consume credits: ${amount}`,
      });
      return { success: true };
    } catch (error) {
      console.error('consume credits error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      };
    }
  });
