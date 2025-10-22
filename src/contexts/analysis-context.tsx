'use client';

import { type ReactNode, createContext, useContext, useState } from 'react';

// 用户输入数据类型
export interface UserInput {
  personal?: {
    name?: string;
    birthDate?: string;
    birthTime?: string;
    birthYear?: number;
    birthMonth?: number;
    birthDay?: number;
    birthHour?: number;
    gender?: 'male' | 'female';
  };
  house?: {
    direction?: string;
    facing?: number;
    buildYear?: number;
    floor?: number;
    address?: string;
    lat?: number;
    lon?: number;
  };
  options?: {
    depth?: 'basic' | 'standard' | 'comprehensive' | 'expert';
    includeLiunian?: boolean;
    includePersonalization?: boolean;
    includeScoring?: boolean;
    includeWarnings?: boolean;
  };
}

// UserInputData 是 UserInput 的别名（为了向后兼容）
export type UserInputData = UserInput;

// 分析结果类型
interface AnalysisResult {
  basic?: any;
  pillars?: any;
  elements?: any;
  yongshen?: any;
  pattern?: any;
  scoring?: any;
  insights?: any;
  warnings?: any;
}

// 上下文类型
interface AnalysisContextType {
  userInput: UserInput | null;
  analysisResult: AnalysisResult | null;
  isAIChatActive: boolean;
  isAIChatActivated: boolean;
  setUserInput: (input: UserInput | null) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  activateAIChat: () => void;
  deactivateAIChat: () => void;
  getAIContextSummary: () => string;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(
  undefined
);

/**
 * 分析上下文 Provider
 * 用于在应用中共享分析数据，特别是给 AI 聊天使用
 */
export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [isAIChatActive, setIsAIChatActive] = useState(false);

  const activateAIChat = () => setIsAIChatActive(true);
  const deactivateAIChat = () => setIsAIChatActive(false);

  // 生成 AI 上下文摘要
  const getAIContextSummary = (): string => {
    const parts: string[] = [];

    // 添加用户输入信息
    if (userInput?.personal) {
      const p = userInput.personal;
      parts.push('用户信息：');
      if (p.name) parts.push(`姓名：${p.name}`);
      if (p.gender) parts.push(`性别：${p.gender === 'male' ? '男' : '女'}`);
      if (p.birthDate) parts.push(`出生日期：${p.birthDate}`);
      if (p.birthTime) parts.push(`出生时间：${p.birthTime}`);
    }

    // 添加房屋信息
    if (userInput?.house) {
      const h = userInput.house;
      parts.push('\n房屋信息：');
      if (h.direction) parts.push(`朝向：${h.direction}`);
      if (h.facing) parts.push(`坐向：${h.facing}度`);
      if (h.buildYear) parts.push(`建造年份：${h.buildYear}`);
    }

    // 添加分析结果摘要
    if (analysisResult) {
      parts.push('\n八字分析结果：');

      if (analysisResult.pillars) {
        const pillars = analysisResult.pillars;
        parts.push('四柱：');
        if (pillars.year)
          parts.push(
            `年柱 ${pillars.year.stem || pillars.year.heavenlyStem || ''}${pillars.year.branch || pillars.year.earthlyBranch || ''}`
          );
        if (pillars.month)
          parts.push(
            `月柱 ${pillars.month.stem || pillars.month.heavenlyStem || ''}${pillars.month.branch || pillars.month.earthlyBranch || ''}`
          );
        if (pillars.day)
          parts.push(
            `日柱 ${pillars.day.stem || pillars.day.heavenlyStem || ''}${pillars.day.branch || pillars.day.earthlyBranch || ''}`
          );
        if (pillars.hour)
          parts.push(
            `时柱 ${pillars.hour.stem || pillars.hour.heavenlyStem || ''}${pillars.hour.branch || pillars.hour.earthlyBranch || ''}`
          );
      }

      if (analysisResult.elements) {
        parts.push('\n五行强弱：');
        Object.entries(analysisResult.elements).forEach(
          ([element, strength]) => {
            const elementNames: Record<string, string> = {
              WOOD: '木',
              FIRE: '火',
              EARTH: '土',
              METAL: '金',
              WATER: '水',
            };
            parts.push(`${elementNames[element] || element}：${strength}`);
          }
        );
      }

      if (analysisResult.yongshen) {
        const yongshenMap: Record<string, string> = {
          WOOD: '木',
          FIRE: '火',
          EARTH: '土',
          METAL: '金',
          WATER: '水',
        };
        parts.push(
          `\n用神：${yongshenMap[analysisResult.yongshen] || analysisResult.yongshen}`
        );
      }

      if (analysisResult.pattern) {
        parts.push(`格局：${analysisResult.pattern}`);
      }

      if (analysisResult.scoring) {
        parts.push('\n运势评分：');
        if (analysisResult.scoring.overall) {
          const overall = analysisResult.scoring.overall;
          if (overall.score) parts.push(`总分：${overall.score}`);
          if (overall.dimensions) {
            overall.dimensions.forEach((dim: any) => {
              const dimNames: Record<string, string> = {
                health: '健康',
                wealth: '财运',
                career: '事业',
                relationship: '感情',
              };
              parts.push(
                `${dimNames[dim.dimension] || dim.dimension}：${dim.score}分`
              );
            });
          }
        }
      }

      if (analysisResult.insights && analysisResult.insights.length > 0) {
        parts.push('\n关键洞察：');
        analysisResult.insights.slice(0, 3).forEach((insight: any) => {
          parts.push(`- ${insight.message || insight}`);
        });
      }

      if (analysisResult.warnings && analysisResult.warnings.length > 0) {
        parts.push('\n重要提醒：');
        analysisResult.warnings.slice(0, 3).forEach((warning: any) => {
          parts.push(`⚠️ ${warning.message || warning}`);
        });
      }
    }

    return parts.join('\n');
  };

  return (
    <AnalysisContext.Provider
      value={{
        userInput,
        analysisResult,
        isAIChatActive,
        isAIChatActivated: isAIChatActive,
        setUserInput,
        setAnalysisResult,
        activateAIChat,
        deactivateAIChat,
        getAIContextSummary,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

/**
 * 使用分析上下文的 Hook
 */
export function useAnalysisContext() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysisContext must be used within AnalysisProvider');
  }
  return context;
}

/**
 * 可选的使用分析上下文的 Hook（不抛出错误）
 */
export function useAnalysisContextOptional() {
  return useContext(AnalysisContext);
}
