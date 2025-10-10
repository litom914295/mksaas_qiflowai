'use client';

import { useEffect, useState } from 'react';

// 试用次数Key
const TRIAL_KEY_BAZI = 'qiflow_bazi_trial_count';
const TRIAL_KEY_COMPLETE = 'qiflow_complete_trial_count';
const MAX_TRIALS = 3;

export type TrialType = 'bazi' | 'complete';

interface UseAnonymousTrialReturn {
  canTrial: () => boolean;
  remainingTrials: () => number;
  incrementTrial: () => void;
  resetTrials: () => void;
  trialCount: number;
}

/**
 * 匿名用户试用跟踪Hook
 *
 * @param type - 试用类型：'bazi' 八字分析 或 'complete' 完整分析
 * @returns 试用状态和操作方法
 *
 * @example
 * ```tsx
 * const { canTrial, remainingTrials, incrementTrial } = useAnonymousTrial('bazi');
 *
 * if (!canTrial()) {
 *   showSignupPrompt();
 *   return;
 * }
 *
 * // 执行分析
 * await analyze();
 * incrementTrial();
 * ```
 */
export function useAnonymousTrial(
  type: TrialType = 'bazi'
): UseAnonymousTrialReturn {
  const key = type === 'bazi' ? TRIAL_KEY_BAZI : TRIAL_KEY_COMPLETE;
  const [trialCount, setTrialCount] = useState(0);

  // 初始化时从localStorage读取
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const count = getTrialCountInternal();
      setTrialCount(count);
    }
  }, [key]);

  /**
   * 获取当前试用次数（内部方法）
   */
  const getTrialCountInternal = (): number => {
    if (typeof window === 'undefined') return 0;

    try {
      const count = localStorage.getItem(key);
      return count ? Number.parseInt(count, 10) : 0;
    } catch (error) {
      console.warn('读取试用次数失败:', error);
      return 0;
    }
  };

  /**
   * 增加试用次数
   */
  const incrementTrial = () => {
    if (typeof window === 'undefined') return;

    try {
      const count = getTrialCountInternal();
      const newCount = count + 1;
      localStorage.setItem(key, String(newCount));
      setTrialCount(newCount);

      console.log(`[试用跟踪] ${type} 试用次数: ${count} → ${newCount}`);
    } catch (error) {
      console.error('更新试用次数失败:', error);
    }
  };

  /**
   * 检查是否还能试用
   */
  const canTrial = (): boolean => {
    const count = getTrialCountInternal();
    return count < MAX_TRIALS;
  };

  /**
   * 获取剩余试用次数
   */
  const remainingTrials = (): number => {
    const count = getTrialCountInternal();
    return Math.max(0, MAX_TRIALS - count);
  };

  /**
   * 重置试用次数（注册后调用）
   */
  const resetTrials = () => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(key);
      setTrialCount(0);
      console.log(`[试用跟踪] ${type} 试用次数已重置`);
    } catch (error) {
      console.error('重置试用次数失败:', error);
    }
  };

  return {
    canTrial,
    remainingTrials,
    incrementTrial,
    resetTrials,
    trialCount,
  };
}

/**
 * 重置所有试用次数（注册成功后调用）
 */
export function resetAllTrials() {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(TRIAL_KEY_BAZI);
    localStorage.removeItem(TRIAL_KEY_COMPLETE);
    console.log('[试用跟踪] 所有试用次数已重置');
  } catch (error) {
    console.error('重置所有试用次数失败:', error);
  }
}

/**
 * 获取所有试用统计信息
 */
export function getTrialStats() {
  if (typeof window === 'undefined') {
    return {
      bazi: { count: 0, remaining: MAX_TRIALS },
      complete: { count: 0, remaining: MAX_TRIALS },
    };
  }

  try {
    const baziCount = Number.parseInt(
      localStorage.getItem(TRIAL_KEY_BAZI) || '0',
      10
    );
    const completeCount = Number.parseInt(
      localStorage.getItem(TRIAL_KEY_COMPLETE) || '0',
      10
    );

    return {
      bazi: {
        count: baziCount,
        remaining: Math.max(0, MAX_TRIALS - baziCount),
      },
      complete: {
        count: completeCount,
        remaining: Math.max(0, MAX_TRIALS - completeCount),
      },
    };
  } catch (error) {
    console.error('获取试用统计失败:', error);
    return {
      bazi: { count: 0, remaining: MAX_TRIALS },
      complete: { count: 0, remaining: MAX_TRIALS },
    };
  }
}
