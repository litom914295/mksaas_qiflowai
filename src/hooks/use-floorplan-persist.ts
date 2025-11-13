'use client';

/**
 * 户型图状态持久化 Hook
 * 实现 localStorage 缓存 + 数据库持久化的混合策略
 */

import {
  loadFloorplanState,
  saveFloorplanState,
} from '@/actions/qiflow/floorplan-state';
import { autoCleanIfNeeded } from '@/lib/qiflow/storage-quota';
import { FloorplanStorageKeys } from '@/types/floorplan';
import type { FloorplanState, SaveResult } from '@/types/floorplan';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseFloorplanPersistOptions {
  /** 分析 ID */
  analysisId: string;

  /** 用户 ID（可选，未登录时为空） */
  userId?: string;

  /** 防抖延迟（毫秒） */
  debounceMs?: number;

  /** 自动保存间隔（毫秒，0 表示禁用） */
  autoSaveIntervalMs?: number;

  /** 是否启用持久化（用于灰度开关） */
  enabled?: boolean;
}

interface UseFloorplanPersistReturn {
  /** 当前状态 */
  state: FloorplanState | null;

  /** 更新状态 */
  updateState: (
    updates:
      | Partial<FloorplanState>
      | ((prev: FloorplanState | null) => FloorplanState | null)
  ) => void;

  /** 是否正在加载 */
  isLoading: boolean;

  /** 是否正在保存 */
  isSaving: boolean;

  /** 是否离线 */
  isOffline: boolean;

  /** 保存错误 */
  saveError: string | null;

  /** 手动重试保存 */
  retry: () => void;

  /** 手动刷新（从数据库加载） */
  refresh: () => Promise<void>;

  /** 清除本地缓存 */
  clearLocal: () => void;
}

/**
 * 户型图状态持久化 Hook
 */
export function useFloorplanPersist(
  options: UseFloorplanPersistOptions
): UseFloorplanPersistReturn {
  const {
    analysisId,
    userId,
    debounceMs = 300,
    autoSaveIntervalMs = 10000,
    enabled = true,
  } = options;

  // 状态
  const [state, setState] = useState<FloorplanState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Refs
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveRef = useRef<FloorplanState | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const isMountedRef = useRef(true);

  /**
   * 生成 localStorage 键名
   */
  const getStorageKey = useCallback(() => {
    if (userId) {
      return FloorplanStorageKeys.user(userId, analysisId);
    }
    return FloorplanStorageKeys.anonymous(analysisId);
  }, [userId, analysisId]);

  /**
   * 从 localStorage 加载
   */
  const loadFromLocal = useCallback((): FloorplanState | null => {
    if (!enabled) return null;

    try {
      const key = getStorageKey();
      const stored = localStorage.getItem(key);

      if (stored) {
        const parsed = JSON.parse(stored) as FloorplanState;
        console.log('[Floorplan Persist] 从 localStorage 加载:', analysisId);
        return parsed;
      }
    } catch (error) {
      console.error('[Floorplan Persist] localStorage 加载失败:', error);
    }

    return null;
  }, [enabled, getStorageKey, analysisId]);

  /**
   * 保存到 localStorage
   */
  const saveToLocal = useCallback(
    (data: FloorplanState) => {
      if (!enabled) return;

      try {
        const key = getStorageKey();
        localStorage.setItem(key, JSON.stringify(data));
        console.log('[Floorplan Persist] 已保存到 localStorage:', analysisId);

        // 检查并自动清理过期缓存
        autoCleanIfNeeded();
      } catch (error) {
        console.error('[Floorplan Persist] localStorage 保存失败:', error);

        // 如果是配额错误，尝试清理
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          autoCleanIfNeeded();
          // 重试一次
          try {
            localStorage.setItem(getStorageKey(), JSON.stringify(data));
          } catch (retryError) {
            console.error('[Floorplan Persist] 重试保存失败:', retryError);
          }
        }
      }
    },
    [enabled, getStorageKey, analysisId]
  );

  /**
   * 从数据库加载
   */
  const loadFromDatabase =
    useCallback(async (): Promise<FloorplanState | null> => {
      if (!enabled || !userId) return null;

      try {
        console.log('[Floorplan Persist] 从数据库加载:', analysisId);
        const data = await loadFloorplanState(analysisId);
        return data;
      } catch (error) {
        console.error('[Floorplan Persist] 数据库加载失败:', error);
        return null;
      }
    }, [enabled, userId, analysisId]);

  /**
   * 保存到数据库
   */
  const saveToDatabase = useCallback(
    async (data: FloorplanState): Promise<SaveResult> => {
      if (!enabled || !userId) {
        return { success: false, error: '未登录' };
      }

      try {
        console.log('[Floorplan Persist] 保存到数据库:', analysisId);
        const result = await saveFloorplanState(analysisId, data);

        if (result.success) {
          lastSaveTimeRef.current = Date.now();
          setSaveError(null);
        }

        return result;
      } catch (error) {
        console.error('[Floorplan Persist] 数据库保存失败:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : '保存失败',
        };
      }
    },
    [enabled, userId, analysisId]
  );

  /**
   * 执行实际保存（防抖后调用）
   */
  const performSave = useCallback(async () => {
    const dataToSave = pendingSaveRef.current;
    if (!dataToSave) return;

    setIsSaving(true);
    pendingSaveRef.current = null;

    // 1. 立即保存到 localStorage
    saveToLocal(dataToSave);

    // 2. 如果在线且已登录，保存到数据库
    if (!isOffline && userId) {
      const result = await saveToDatabase(dataToSave);

      if (!result.success) {
        setSaveError(result.error || '保存失败');
        // 保存失败时，标记为待保存（稍后重试）
        pendingSaveRef.current = dataToSave;
      }
    }

    if (isMountedRef.current) {
      setIsSaving(false);
    }
  }, [isOffline, userId, saveToLocal, saveToDatabase]);

  /**
   * 更新状态
   */
  const updateState = useCallback(
    (
      updates:
        | Partial<FloorplanState>
        | ((prev: FloorplanState | null) => FloorplanState | null)
    ) => {
      setState((prev) => {
        let newState: FloorplanState | null;

        if (typeof updates === 'function') {
          newState = updates(prev);
        } else if (prev) {
          newState = {
            ...prev,
            ...updates,
            updatedAt: Date.now(),
          };
        } else {
          return prev;
        }

        if (newState) {
          // 标记为待保存
          pendingSaveRef.current = newState;

          // 清除旧的防抖计时器
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }

          // 设置新的防抖计时器
          debounceTimerRef.current = setTimeout(() => {
            performSave();
          }, debounceMs);
        }

        return newState;
      });
    },
    [debounceMs, performSave]
  );

  /**
   * 手动重试保存
   */
  const retry = useCallback(() => {
    if (state) {
      pendingSaveRef.current = state;
      performSave();
    }
  }, [state, performSave]);

  /**
   * 手动刷新（从数据库加载）
   */
  const refresh = useCallback(async () => {
    setIsLoading(true);
    const dbData = await loadFromDatabase();

    if (dbData && isMountedRef.current) {
      setState(dbData);
      saveToLocal(dbData);
    }

    if (isMountedRef.current) {
      setIsLoading(false);
    }
  }, [loadFromDatabase, saveToLocal]);

  /**
   * 清除本地缓存
   */
  const clearLocal = useCallback(() => {
    try {
      const key = getStorageKey();
      localStorage.removeItem(key);
      console.log('[Floorplan Persist] 已清除本地缓存:', analysisId);
    } catch (error) {
      console.error('[Floorplan Persist] 清除缓存失败:', error);
    }
  }, [getStorageKey, analysisId]);

  /**
   * 初始化：加载数据
   */
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      // 1. 优先从 localStorage 快速加载
      const localData = loadFromLocal();
      if (localData && !cancelled) {
        setState(localData);
        setIsLoading(false);
      }

      // 2. 后台从数据库加载（如果已登录）
      if (userId) {
        const dbData = await loadFromDatabase();

        if (!cancelled && dbData) {
          // 比较时间戳，使用较新的数据
          if (!localData || dbData.updatedAt > localData.updatedAt) {
            setState(dbData);
            saveToLocal(dbData);
          }
        }
      }

      if (!cancelled) {
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    userId,
    analysisId,
    loadFromLocal,
    loadFromDatabase,
    saveToLocal,
  ]);

  /**
   * 自动保存定时器
   */
  useEffect(() => {
    if (!enabled || autoSaveIntervalMs <= 0) return;

    autoSaveTimerRef.current = setInterval(() => {
      if (pendingSaveRef.current) {
        performSave();
      }
    }, autoSaveIntervalMs);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [enabled, autoSaveIntervalMs, performSave]);

  /**
   * 监听在线/离线状态
   */
  useEffect(() => {
    const handleOnline = () => {
      console.log('[Floorplan Persist] 网络恢复');
      setIsOffline(false);

      // 网络恢复后，立即保存待保存的数据
      if (pendingSaveRef.current) {
        performSave();
      }
    };

    const handleOffline = () => {
      console.log('[Floorplan Persist] 网络断开');
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [performSave]);

  /**
   * 页面卸载前强制保存
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 清除防抖计时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // 立即保存到 localStorage
      if (pendingSaveRef.current) {
        saveToLocal(pendingSaveRef.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveToLocal]);

  /**
   * 组件卸载时清理
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;

      // 清除计时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }

      // 最后一次保存到 localStorage
      if (pendingSaveRef.current) {
        saveToLocal(pendingSaveRef.current);
      }
    };
  }, [saveToLocal]);

  return {
    state,
    updateState,
    isLoading,
    isSaving,
    isOffline,
    saveError,
    retry,
    refresh,
    clearLocal,
  };
}
