'use client';

/**
 * 分析上下文提供器
 *
 * 用于在整个应用中共享用户的八字信息、房屋信息和分析结果
 * 让 AI-Chat 悬浮球能够感知并使用这些数据
 */

import type { ComprehensiveAnalysisResult } from '@/lib/qiflow/xuankong/comprehensive-engine';
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

// 用户输入数据类型
export interface UserInputData {
  // 个人信息
  personal: {
    birthYear: number;
    birthMonth: number;
    birthDay: number;
    birthHour?: number;
    gender: 'male' | 'female';
  };

  // 房屋信息
  house: {
    facing: number;
    buildYear: number;
    floor?: number;
    address?: string;
    lat?: number;
    lon?: number;
  };

  // 分析选项
  options?: {
    depth?: 'basic' | 'standard' | 'comprehensive' | 'expert';
    includeLiunian?: boolean;
    includePersonalization?: boolean;
    includeScoring?: boolean;
    includeWarnings?: boolean;
  };
}

// 上下文状态类型
interface AnalysisContextState {
  // 用户输入数据
  userInput: UserInputData | null;

  // 分析结果
  analysisResult: ComprehensiveAnalysisResult | null;

  // 更新用户输入
  setUserInput: (input: UserInputData | null) => void;

  // 更新分析结果
  setAnalysisResult: (result: ComprehensiveAnalysisResult | null) => void;

  // 清除所有数据
  clearAll: () => void;

  // 获取用于 AI 对话的上下文摘要
  getAIContextSummary: () => string;

  // 新增: AI-Chat 是否已激活
  isAIChatActivated: boolean;

  // 新增: 激活 AI-Chat
  activateAIChat: () => void;
}

// 创建上下文
const AnalysisContext = createContext<AnalysisContextState | undefined>(
  undefined
);

// 提供器组件
export function AnalysisContextProvider({ children }: { children: ReactNode }) {
  const [userInput, setUserInput] = useState<UserInputData | null>(null);
  const [analysisResult, setAnalysisResult] =
    useState<ComprehensiveAnalysisResult | null>(null);

  // 新增: 跟踪 AI-Chat 是否被激活
  const [isAIChatActivated, setIsAIChatActivated] = useState(false);

  // 激活 AI-Chat（用户第一次点击时调用）
  const activateAIChat = useCallback(() => {
    setIsAIChatActivated(true);
  }, []);

  // 清除所有数据
  const clearAll = useCallback(() => {
    setUserInput(null);
    setAnalysisResult(null);
    setIsAIChatActivated(false);
  }, []);

  // 生成 AI 对话上下文摘要
  const getAIContextSummary = useCallback((): string => {
    if (!userInput && !analysisResult) {
      return '';
    }

    const parts: string[] = [];

    // 添加用户基本信息
    if (userInput) {
      const { personal, house } = userInput;

      parts.push('【用户信息】');
      parts.push(
        `出生日期: ${personal.birthYear}年${personal.birthMonth}月${personal.birthDay}日${personal.birthHour ? ` ${personal.birthHour}时` : ''}`
      );
      parts.push(`性别: ${personal.gender === 'male' ? '男' : '女'}`);
      parts.push('');

      parts.push('【房屋信息】');
      const facingMap: Record<number, string> = {
        0: '正北',
        90: '正东',
        180: '正南',
        270: '正西',
        45: '东北',
        135: '东南',
        225: '西南',
        315: '西北',
      };
      const facingDesc = facingMap[house.facing] || `${house.facing}度`;
      parts.push(`朝向: ${facingDesc}`);
      parts.push(`建造年份: ${house.buildYear}年`);
      if (house.floor) parts.push(`楼层: ${house.floor}层`);
      if (house.address) parts.push(`地址: ${house.address}`);
      parts.push('');
    }

    // 添加关键分析结果摘要
    if (analysisResult) {
      parts.push('【已生成的分析结果】');

      // 基础信息
      if (analysisResult.basic) {
        const { yuanPan, liunianPan } = analysisResult.basic;
        parts.push(`元运: 第${yuanPan.period}运 (${yuanPan.years})`);
        parts.push(`山向: 坐${yuanPan.sitting}向${yuanPan.facing}`);
        if (liunianPan) {
          parts.push(`流年: ${liunianPan.year}年`);
        }
      }

      // 综合评分
      if (analysisResult.scoring) {
        const { overall } = analysisResult.scoring;
        parts.push(`\n综合评分: ${overall.score}分 (${overall.level})`);

        // 各维度评分
        const dimensions = [
          { key: 'health', name: '健康' },
          { key: 'wealth', name: '财运' },
          { key: 'relationship', name: '感情' },
          { key: 'career', name: '事业' },
        ];

        const scores = dimensions.map((d) => {
          const dim = overall.dimensions.find(
            (dim: any) => dim.dimension === d.key
          );
          return `${d.name}${dim ? dim.score : 0}分`;
        });
        parts.push(`分项评分: ${scores.join(', ')}`);
      }

      // 关键发现
      if (
        analysisResult.insights?.keyFindings &&
        analysisResult.insights.keyFindings.length > 0
      ) {
        parts.push('\n【关键发现】');
        analysisResult.insights.keyFindings
          .slice(0, 3)
          .forEach((finding: any) => {
            parts.push(`• ${finding.title}: ${finding.description}`);
          });
      }

      // 关键位置
      if (
        analysisResult.insights?.criticalLocations &&
        analysisResult.insights.criticalLocations.length > 0
      ) {
        parts.push('\n【关键位置】');
        analysisResult.insights.criticalLocations
          .slice(0, 3)
          .forEach((location: any) => {
            parts.push(
              `• ${location.palace}宫 (${location.direction}): ${location.stars.join('/')}`
            );
          });
      }

      // 智能预警
      if (analysisResult.warnings && analysisResult.warnings.length > 0) {
        parts.push('\n【智能预警】');
        analysisResult.warnings.slice(0, 2).forEach((warning: any) => {
          parts.push(`• [${warning.severity}] ${warning.title}`);
        });
      }
    }

    return parts.join('\n');
  }, [userInput, analysisResult]);

  const value: AnalysisContextState = {
    userInput,
    analysisResult,
    setUserInput,
    setAnalysisResult,
    clearAll,
    getAIContextSummary,
    // 新增
    isAIChatActivated,
    activateAIChat,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

// Hook 用于访问上下文
export function useAnalysisContext() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error(
      'useAnalysisContext must be used within AnalysisContextProvider'
    );
  }
  return context;
}

// 可选的 Hook - 不强制要求在 Provider 内使用
export function useAnalysisContextOptional() {
  return useContext(AnalysisContext);
}
