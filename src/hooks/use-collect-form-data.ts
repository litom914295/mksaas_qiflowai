/**
 * 按需收集表单数据 Hook
 *
 * 用于在 AI-Chat 激活时，从表单组件收集数据并保存到上下文
 * 这样可以避免在用户不使用 AI-Chat 时浪费资源
 */

import {
  type UserInputData,
  useAnalysisContextOptional,
} from '@/contexts/analysis-context';
import type { ComprehensiveAnalysisResult } from '@/lib/qiflow/xuankong/comprehensive-engine';
import { useCallback, useEffect } from 'react';

/**
 * 表单数据接口
 */
export interface FormData {
  // 个人信息
  birthYear: string | number;
  birthMonth: string | number;
  birthDay: string | number;
  birthHour?: string | number;
  gender: 'male' | 'female';

  // 房屋信息
  facing: string | number;
  buildYear: string | number;
  floor?: string | number;
  address?: string;
  lat?: string | number;
  lon?: string | number;

  // 分析选项
  depth?: 'basic' | 'standard' | 'comprehensive' | 'expert';
  includeLiunian?: boolean;
  includePersonalization?: boolean;
  includeScoring?: boolean;
  includeWarnings?: boolean;
}

/**
 * Hook 配置
 */
export interface UseCollectFormDataOptions {
  /**
   * 表单数据
   */
  formData: FormData;

  /**
   * 分析结果（可选）
   */
  analysisResult?: ComprehensiveAnalysisResult | null;

  /**
   * 是否启用自动收集
   * 默认为 true
   */
  enabled?: boolean;
}

/**
 * 按需收集表单数据到上下文
 *
 * 只有在 AI-Chat 激活后才会收集数据
 *
 * @example
 * ```tsx
 * const formData = {
 *   birthYear: '1990',
 *   birthMonth: '5',
 *   birthDay: '20',
 *   gender: 'female',
 *   facing: '180',
 *   buildYear: '2015',
 * };
 *
 * useCollectFormData({ formData, analysisResult });
 * ```
 */
export function useCollectFormData(options: UseCollectFormDataOptions) {
  const { formData, analysisResult, enabled = true } = options;

  const analysisContext = useAnalysisContextOptional();

  // 转换表单数据为标准格式
  const convertToUserInput = useCallback((data: FormData): UserInputData => {
    return {
      personal: {
        birthYear:
          typeof data.birthYear === 'string'
            ? Number.parseInt(data.birthYear)
            : data.birthYear,
        birthMonth:
          typeof data.birthMonth === 'string'
            ? Number.parseInt(data.birthMonth)
            : data.birthMonth,
        birthDay:
          typeof data.birthDay === 'string'
            ? Number.parseInt(data.birthDay)
            : data.birthDay,
        birthHour: data.birthHour
          ? typeof data.birthHour === 'string'
            ? Number.parseInt(data.birthHour)
            : data.birthHour
          : undefined,
        gender: data.gender,
      },
      house: {
        facing:
          typeof data.facing === 'string'
            ? Number.parseInt(data.facing)
            : data.facing,
        buildYear:
          typeof data.buildYear === 'string'
            ? Number.parseInt(data.buildYear)
            : data.buildYear,
        floor: data.floor
          ? typeof data.floor === 'string'
            ? Number.parseInt(data.floor)
            : data.floor
          : undefined,
        address: data.address,
        lat: data.lat
          ? typeof data.lat === 'string'
            ? Number.parseFloat(data.lat)
            : data.lat
          : undefined,
        lon: data.lon
          ? typeof data.lon === 'string'
            ? Number.parseFloat(data.lon)
            : data.lon
          : undefined,
      },
      // options 不属于 UserInput 类型，已移除
    };
  }, []);

  // 当 AI-Chat 激活且启用时，收集数据
  useEffect(() => {
    if (!enabled || !analysisContext) return;

    // 检查 AI-Chat 是否已激活
    if (analysisContext.isAIChatActivated) {
      // 收集并保存表单数据
      const userInput = convertToUserInput(formData);
      analysisContext.setUserInput(userInput);

      // 如果有分析结果，也保存
      if (analysisResult) {
        // ComprehensiveAnalysisResult 可以被视为 AnalysisResult，因为后者属性都是 any
        analysisContext.setAnalysisResult(analysisResult as any);
      }

      console.log('📊 表单数据已收集到上下文');
    }
  }, [enabled, analysisContext, formData, analysisResult, convertToUserInput]);

  return {
    /**
     * 是否已激活
     */
    isActivated: analysisContext?.isAIChatActivated ?? false,

    /**
     * 手动触发数据收集
     */
    collectData: useCallback(() => {
      if (!analysisContext) return;

      const userInput = convertToUserInput(formData);
      analysisContext.setUserInput(userInput);

      if (analysisResult) {
        // ComprehensiveAnalysisResult 可以被视为 AnalysisResult
        analysisContext.setAnalysisResult(analysisResult as any);
      }

      console.log('📊 手动收集表单数据完成');
    }, [analysisContext, formData, analysisResult, convertToUserInput]),
  };
}
