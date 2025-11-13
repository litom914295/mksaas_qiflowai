/**
 * Flying Star Calculator Stub
 *
 * DEPRECATED: This is a compatibility stub.
 * Consider migrating to @/lib/qiflow/xuankong for full functionality
 */

import { generateFlyingStar } from '@/lib/qiflow/xuankong';

/**
 * @deprecated Use xuankong module directly
 */
export class FlyingStarCalculator {
  /**
   * Calculate year star configuration
   */
  calculateYearStar(year: number) {
    // Simple stub implementation - delegates to xuankong
    const now = new Date(year, 0, 1);

    try {
      const result = generateFlyingStar({
        facing: { degrees: 0 }, // Default facing
        observedAt: now,
      });

      return {
        period: result.period,
        plates: result.plates,
        year,
      };
    } catch (error) {
      console.error('[FlyingStarCalculator] Error:', error);
      // Return minimal data structure
      return {
        period: 9,
        plates: {},
        year,
      };
    }
  }
}
