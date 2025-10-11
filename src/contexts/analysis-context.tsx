'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// 用户输入数据类型
interface UserInput {
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
  };
}

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
  setUserInput: (input: UserInput | null) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  activateAIChat: () => void;
  deactivateAIChat: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

/**
 * 分析上下文 Provider
 * 用于在应用中共享分析数据，特别是给 AI 聊天使用
 */
export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAIChatActive, setIsAIChatActive] = useState(false);

  const activateAIChat = () => setIsAIChatActive(true);
  const deactivateAIChat = () => setIsAIChatActive(false);

  return (
    <AnalysisContext.Provider
      value={{
        userInput,
        analysisResult,
        isAIChatActive,
        setUserInput,
        setAnalysisResult,
        activateAIChat,
        deactivateAIChat,
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
  return context;
}
