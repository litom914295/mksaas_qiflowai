/**
 * 历史数据管理工具
 * 用于保存和恢复用户的表单输入历史
 */

export interface AnalysisHistory {
  id: string;
  timestamp: number;
  personalData: {
    name: string;
    birthDate: string;
    birthTime: string;
    gender: 'male' | 'female';
    location?: string;
    isLunar?: boolean;
  };
  houseData?: {
    orientation?: number;
    address?: string;
    roomCount?: number;
  };
}

const STORAGE_KEY = 'qiflow_analysis_history';
const MAX_HISTORY = 3;

/**
 * 保存分析历史
 */
export function saveAnalysisHistory(
  data: Omit<AnalysisHistory, 'id' | 'timestamp'>
): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getAnalysisHistory();
    const newEntry: AnalysisHistory = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ...data,
    };

    // 添加到历史记录开头
    const updatedHistory = [newEntry, ...history].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to save history:', error);
  }
}

/**
 * 获取所有历史记录
 */
export function getAnalysisHistory(): AnalysisHistory[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
}

/**
 * 获取最近一次的历史记录
 */
export function getLatestHistory(): AnalysisHistory | null {
  const history = getAnalysisHistory();
  return history[0] || null;
}

/**
 * 清除所有历史记录
 */
export function clearAnalysisHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
}

/**
 * 格式化历史记录显示
 */
export function formatHistoryDisplay(history: AnalysisHistory): string {
  const date = new Date(history.timestamp);
  const timeStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  return `${history.personalData.name} - ${timeStr}`;
}
