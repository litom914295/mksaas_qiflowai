'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'qiflow_anonymous_trials';
const MAX_TRIALS_PER_TYPE = 3;

type AnalysisType = 'bazi-only' | 'unified-full';

interface TrialRecord {
  count: number;
  lastUsed: number;
}

interface TrialsData {
  [key: string]: TrialRecord;
}

/**
 * 匿名用户免费试用管理 Hook
 * 使用 localStorage 存储试用次数
 * 每种分析类型独立计数，各提供 3 次免费试用
 */
export function useAnonymousTrials() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  /**
   * 从 localStorage 读取试用数据
   */
  const getTrialsData = useCallback((): TrialsData => {
    if (typeof window === 'undefined') return {};

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to read trials data:', error);
      return {};
    }
  }, []);

  /**
   * 保存试用数据到 localStorage
   */
  const saveTrialsData = useCallback((data: TrialsData) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save trials data:', error);
    }
  }, []);

  /**
   * 获取指定分析类型的剩余试用次数
   */
  const getRemainingTrials = useCallback(
    (analysisType: AnalysisType): number => {
      if (!isClient) return 0;

      const data = getTrialsData();
      const record = data[analysisType];

      if (!record) {
        return MAX_TRIALS_PER_TYPE;
      }

      return Math.max(0, MAX_TRIALS_PER_TYPE - record.count);
    },
    [isClient, getTrialsData]
  );

  /**
   * 消耗一次试用机会
   * @returns 是否成功消耗（false 表示已无剩余次数）
   */
  const consumeTrial = useCallback(
    (analysisType: AnalysisType): boolean => {
      if (!isClient) return false;

      const remaining = getRemainingTrials(analysisType);

      if (remaining <= 0) {
        return false;
      }

      const data = getTrialsData();
      const currentRecord = data[analysisType] || { count: 0, lastUsed: 0 };

      data[analysisType] = {
        count: currentRecord.count + 1,
        lastUsed: Date.now(),
      };

      saveTrialsData(data);
      return true;
    },
    [isClient, getRemainingTrials, getTrialsData, saveTrialsData]
  );

  /**
   * 检查是否还有试用机会
   */
  const hasTrialsLeft = useCallback(
    (analysisType: AnalysisType): boolean => {
      return getRemainingTrials(analysisType) > 0;
    },
    [getRemainingTrials]
  );

  /**
   * 重置试用次数（仅用于测试）
   */
  const resetTrials = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset trials:', error);
    }
  }, []);

  return {
    getRemainingTrials,
    consumeTrial,
    hasTrialsLeft,
    resetTrials,
    isClient,
  };
}
