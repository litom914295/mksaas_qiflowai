'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertCircle, Bot, CheckCircle2, Send, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// 消息类型
type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  dataUsed?: string[]; // 使用了哪些数据
};

// 上下文数据类型
type ChatContext = {
  bazi?: {
    year: string;
    month: string;
    day: string;
    hour: string;
    gender: string;
  };
  xuankong?: {
    facing: number;
    period: number;
    address?: string;
  };
  house?: {
    rooms: number;
    layout?: string;
  };
};

type Props = {
  context?: ChatContext;
  onRequestData?: (type: 'bazi' | 'xuankong' | 'house') => void;
};

export function AIChatInterface({ context, onRequestData }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content:
        '您好！我是气流AI助手。\n\n🌟 **核心优势**：所有风水分析都基于您的个人八字定制\n• 财位根据您的日主确定\n• 颜色基于您的用神选择\n• 方位依据您的五行喜忌\n\n请先提供您的出生信息，让我为您提供真正个性化的命理风水建议。',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 分析问题类型和所需数据
  const analyzeQuestion = (question: string) => {
    const baziKeywords = [
      '八字',
      '命理',
      '五行',
      '十神',
      '大运',
      '流年',
      '喜用神',
    ];
    const xuankongKeywords = [
      '风水',
      '飞星',
      '九宫',
      '朝向',
      '坐向',
      '山星',
      '水星',
    ];
    const houseKeywords = ['房间', '卧室', '客厅', '厨房', '户型', '布局'];

    const needsBazi = baziKeywords.some((k) => question.includes(k));
    const needsXuankong = xuankongKeywords.some((k) => question.includes(k));
    const needsHouse = houseKeywords.some((k) => question.includes(k));

    return { needsBazi, needsXuankong, needsHouse };
  };

  // 生成基于数据的回答
  const generateAnswer = (question: string, ctx: ChatContext): string => {
    const analysis = analyzeQuestion(question);
    const usedData: string[] = [];

    let answer = '';

    // 八字相关回答
    if (analysis.needsBazi && ctx.bazi) {
      usedData.push('八字数据');
      answer += `根据您的八字信息（${ctx.bazi.year}年${ctx.bazi.month}月${ctx.bazi.day}日${ctx.bazi.hour}时出生，${ctx.bazi.gender}性），`;
      answer += '您的命局特点是...\n\n';
      answer += '从五行来看，建议注意...\n\n';
    }

    // 风水相关回答 - 必须结合八字
    if (analysis.needsXuankong) {
      if (!ctx.bazi) {
        answer = '🔔 **重要提示**：风水分析必须基于您的八字命理\n\n';
        answer += '我们的风水服务与众不同：\n';
        answer += '• 不是通用的风水建议\n';
        answer += '• 完全基于您的八字定制\n';
        answer += '• 财位、文昌位都因人而异\n\n';
        answer +=
          '请先提供您的出生信息（年月日时、性别），让我为您进行个性化分析。';
        return answer;
      }

      if (ctx.xuankong) {
        usedData.push('八字+风水数据');
        answer += `基于您的八字（日主特质）和房屋朝向（${ctx.xuankong.facing}度），`;
        answer += '我为您定制的风水建议如下...\n\n';
        answer += '您的个人财位：根据日主确定...\n';
        answer += '您的用神方位：最需要加强...\n\n';
      }
    }

    // 房屋相关回答
    if (analysis.needsHouse && ctx.house) {
      usedData.push('房屋数据');
      answer += `您的房屋有${ctx.house.rooms}个房间，`;
      answer += '建议各房间功能布局如下...\n\n';
    }

    return answer || '我需要更多信息才能为您提供准确的建议。';
  };

  // 发送消息
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // 模拟AI响应延迟
    setTimeout(() => {
      const analysis = analyzeQuestion(input);
      const missingData: string[] = [];

      // 检查所需数据是否完整
      if (analysis.needsBazi && !context?.bazi) {
        missingData.push('八字信息');
      }
      if (analysis.needsXuankong && !context?.xuankong) {
        missingData.push('风水数据');
      }
      if (analysis.needsHouse && !context?.house) {
        missingData.push('房屋信息');
      }

      let responseContent: string;
      const dataUsed: string[] = [];

      if (missingData.length > 0) {
        // 缺少数据，请求用户提供
        responseContent = `要回答您的问题，我需要以下信息：\n\n${missingData.map((d) => `• ${d}`).join('\n')}\n\n请您先完成相关的分析，或者告诉我这些信息，我才能为您提供准确的建议。`;
      } else {
        // 有完整数据，生成回答
        responseContent = generateAnswer(input, context || {});
        if (context?.bazi && analysis.needsBazi) dataUsed.push('八字');
        if (context?.xuankong && analysis.needsXuankong) dataUsed.push('风水');
        if (context?.house && analysis.needsHouse) dataUsed.push('房屋');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        dataUsed: dataUsed.length > 0 ? dataUsed : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  // 快捷问题
  const quickQuestions = [
    '我的八字用神是什么？',
    '基于我的八字，家里如何布置风水？',
    '我的命理财位在哪里？',
    '什么颜色最适合我的命理？',
  ];

  return (
    <Card className="flex flex-col h-[600px] max-h-[80vh]">
      {/* 头部 - 上下文状态 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            AI智能助手
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={context?.bazi ? 'default' : 'secondary'}
            className="text-xs"
          >
            {context?.bazi ? (
              <CheckCircle2 className="w-3 h-3 mr-1" />
            ) : (
              <AlertCircle className="w-3 h-3 mr-1" />
            )}
            八字数据
          </Badge>
          <Badge
            variant={context?.xuankong ? 'default' : 'secondary'}
            className="text-xs"
          >
            {context?.xuankong ? (
              <CheckCircle2 className="w-3 h-3 mr-1" />
            ) : (
              <AlertCircle className="w-3 h-3 mr-1" />
            )}
            风水数据
          </Badge>
          <Badge
            variant={context?.house ? 'default' : 'secondary'}
            className="text-xs"
          >
            {context?.house ? (
              <CheckCircle2 className="w-3 h-3 mr-1" />
            ) : (
              <AlertCircle className="w-3 h-3 mr-1" />
            )}
            房屋数据
          </Badge>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role !== 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.role === 'system'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-white border border-gray-200'
              }`}
            >
              {message.dataUsed && message.dataUsed.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {message.dataUsed.map((data) => (
                    <Badge key={data} variant="outline" className="text-xs">
                      {data}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-50 mt-1">
                {message.timestamp.toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 快捷问题 */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 mb-2">快捷问题：</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q) => (
              <Button
                key={q}
                variant="outline"
                size="sm"
                onClick={() => setInput(q)}
                className="text-xs"
              >
                {q}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 输入框 */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="输入您的问题..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 提示：AI会基于您已有的八字、风水数据智能回答
        </p>
      </div>
    </Card>
  );
}
