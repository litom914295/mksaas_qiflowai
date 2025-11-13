/**
 * Warning System Stub
 *
 * DEPRECATED: This is a compatibility stub.
 * Consider implementing full warning logic or migrating to xuankong
 */

import type { PersonalizedFengshuiInput } from './personalized-engine';

export interface FengshuiIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  urgency: number; // 1-5
  title: string;
  description: string;
  location: string;
  impact: string;
  consequences: string[];
}

/**
 * @deprecated Implement or migrate to xuankong
 */
export class WarningSystem {
  static async identifyIssues(
    input: PersonalizedFengshuiInput
  ): Promise<FengshuiIssue[]> {
    // Stub implementation - returns empty array
    console.warn('[WarningSystem] Using stub implementation');

    // Return empty array for now
    // TODO: Implement proper warning detection logic
    return [];
  }
}
