/**
 * AI增强分析客户端Hook
 * 用于在React组件中调用AI增强分析API
 */

'use client';

import { useState, useCallback } from 'react';
import type { BaziAnalysisResult } from '@/lib/services/bazi-calculator-service';
import type { AIEnhancedAnalysis } from '@/lib/services/ai-enhanced-analysis';

/**
 * Hook返回类型
 */
interface UseAIEnhancedAnalysisReturn {
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** AI增强分析结果 */
  aiAnalysis: AIEnhancedAnalysis | null;
  /** 八字分析结果 */
  baziResult: BaziAnalysisResult | null;
  /** 生成AI增强分析 */
  generateAnalysis: (params: AnalysisParams) => Promise<void>;
  /** 重置状态 */
  reset: () => void;
}

/**
 * 分析参数
 */
interface AnalysisParams {
  birthDate: string;      // YYYY-MM-DD
  birthTime: string;      // HH:mm
  gender: 'male' | 'female';
  isQuickAnalysis?: boolean;
  userId?: string;
}

/**
 * API响应类型
 */
interface APIResponse {
  success: boolean;
  data?: {
    baziResult: BaziAnalysisResult;
    aiAnalysis: AIEnhancedAnalysis;
    isQuickAnalysis: boolean;
    userId?: string;
  };
  error?: string;
}

/**
 * 使用AI增强分析Hook
 */
export function useAIEnhancedAnalysis(): UseAIEnhancedAnalysisReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIEnhancedAnalysis | null>(null);
  const [baziResult, setBaziResult] = useState<BaziAnalysisResult | null>(null);

  /**
   * 生成AI增强分析
   */
  const generateAnalysis = useCallback(async (params: AnalysisParams) => {
    setIsLoading(true);
    setError(null);
    setAiAnalysis(null);
    setBaziResult(null);

    try {
      // 调用API
      const response = await fetch('/api/analysis/ai-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data: APIResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `请求失败: ${response.status}`);
      }

      if (data.data) {
        setAiAnalysis(data.data.aiAnalysis);
        setBaziResult(data.data.baziResult);
      }

    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : '生成AI分析时发生未知错误';
      
      setError(errorMessage);
      console.error('AI增强分析失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setAiAnalysis(null);
    setBaziResult(null);
  }, []);

  return {
    isLoading,
    error,
    aiAnalysis,
    baziResult,
    generateAnalysis,
    reset,
  };
}

/**
 * 检查AI服务状态Hook
 */
export function useAIServiceStatus() {
  const [isChecking, setIsChecking] = useState(false);
  const [available, setAvailable] = useState(false);
  const [message, setMessage] = useState<string>('');

  const checkStatus = useCallback(async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/analysis/ai-enhanced');
      const data = await response.json();

      if (data.success && data.data) {
        setAvailable(data.data.available);
        setMessage(data.data.message);
      }
    } catch (err) {
      setAvailable(false);
      setMessage('无法连接到AI服务');
      console.error('检查AI服务状态失败:', err);
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    isChecking,
    available,
    message,
    checkStatus,
  };
}
