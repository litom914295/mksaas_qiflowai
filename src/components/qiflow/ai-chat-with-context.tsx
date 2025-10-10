'use client';

/**
 * 上下文感知的 AI-Chat 悬浮球
 *
 * 能够自动获取用户输入的信息和生成的分析结果，
 * 无需用户重复输入，提供更智能的对话体验
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAnalysisContextOptional } from '@/contexts/analysis-context';
import { Info, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AIChatWithContextProps {
  /** 智能推荐的问题 */
  suggestedQuestions?: string[];
  /** 初始欢迎消息 */
  welcomeMessage?: string;
  /** 是否显示未读消息数 */
  unreadCount?: number;
}

/**
 * AI大师悬浮对话按钮（上下文增强版）
 *
 * 相比基础版本，这个组件能够：
 * 1. 自动感知用户已输入的信息
 * 2. 访问已生成的分析结果
 * 3. 在对话中智能引用这些上下文
 * 4. 提供更个性化的回答
 */
export function AIChatWithContext({
  suggestedQuestions = [
    '我适合什么颜色的装修？',
    '我的财位在哪里？',
    '今年运势如何？',
    '如何提升事业运？',
  ],
  welcomeMessage,
  unreadCount = 0,
}: AIChatWithContextProps) {
  const router = useRouter();
  const analysisContext = useAnalysisContextOptional();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [contextEnabled, setContextEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 新增: 标记是否已激活（用于避免重复激活）
  const hasActivated = useRef(false);

  // 根据上下文生成个性化欢迎消息
  const getWelcomeMessage = (): string => {
    if (welcomeMessage) return welcomeMessage;

    if (analysisContext?.userInput) {
      const { personal } = analysisContext.userInput;
      const gender = personal.gender === 'male' ? '先生' : '女士';

      if (analysisContext.analysisResult) {
        return `您好${gender}！我已经了解了您的信息和分析结果。我可以根据您的八字和房屋风水，为您提供更深入的个性化建议。有什么想问的吗？`;
      }
      return `您好${gender}！我看到您已经填写了基本信息，正在等待分析结果。在此期间，我可以先为您解答一些常见问题。`;
    }

    return '您好！我是AI风水大师，有什么可以帮您的吗？\n\n💡 提示：如果您已经填写了个人信息和房屋信息，我会自动了解这些内容，为您提供更精准的建议。';
  };

  // 初始化欢迎消息
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: getWelcomeMessage(),
          timestamp: Date.now(),
        },
      ]);
    }
  }, [analysisContext?.userInput, analysisContext?.analysisResult]);

  // 新增: 当用户首次打开对话窗口时，激活 AI-Chat 并收集数据
  useEffect(() => {
    if (isOpen && !hasActivated.current && analysisContext) {
      // 激活 AI-Chat
      analysisContext.activateAIChat();
      hasActivated.current = true;

      console.log('🚀 AI-Chat 已激活，开始收集上下文数据');

      // 延迟一下，确保表单数据已经保存
      setTimeout(() => {
        console.log('🔍 [DEBUG] Context 检查:');
        console.log(
          '  - isAIChatActivated:',
          analysisContext.isAIChatActivated
        );
        console.log('  - userInput:', analysisContext.userInput);
        console.log('  - analysisResult:', analysisContext.analysisResult);

        const summary = analysisContext.getAIContextSummary();
        console.log('📊 上下文摘要长度:', summary.length);

        if (summary.length === 0) {
          console.warn('⚠️ 警告: 上下文为空，可能需要填写表单并生成分析结果');
        } else {
          console.log('✅ 上下文数据正常，预览:');
          console.log(summary.substring(0, 300) + '...');
        }
      }, 100);
    }
  }, [isOpen, analysisContext]);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 生成上下文感知的建议问题
  const getContextualSuggestions = (): string[] => {
    if (!analysisContext?.analysisResult) {
      return suggestedQuestions;
    }

    const suggestions: string[] = [];
    const result = analysisContext.analysisResult;

    // 基于评分生成建议
    if (result.scoring) {
      const dimensions = result.scoring.overall.dimensions;

      // 找出得分最低的维度
      const sortedDims = [...dimensions].sort((a, b) => a.score - b.score);
      const weakestDim = sortedDims[0];

      const dimQuestions: Record<string, string> = {
        health: '如何改善我的健康运势？',
        wealth: '如何提升我的财运？',
        relationship: '如何改善我的感情运势？',
        career: '如何提升我的事业运？',
      };

      if (weakestDim && dimQuestions[weakestDim.dimension]) {
        suggestions.push(dimQuestions[weakestDim.dimension]);
      }
    }

    // 基于预警生成建议
    if (result.warnings && result.warnings.length > 0) {
      const criticalWarning = result.warnings.find(
        (w) => w.severity === 'critical'
      );
      if (criticalWarning) {
        suggestions.push(`如何化解${criticalWarning.category}方面的问题？`);
      }
    }

    // 基于关键位置生成建议
    if (
      result.insights?.criticalLocations &&
      result.insights.criticalLocations.length > 0
    ) {
      const bestLocation = result.insights.criticalLocations[0];
      suggestions.push(`${bestLocation.direction}方位应该如何布置？`);
    }

    // 补充通用问题
    suggestions.push('今年流年运势如何？');
    suggestions.push('有什么需要特别注意的吗？');

    return suggestions.slice(0, 4);
  };

  // 发送消息（支持上下文）
  const handleSend = async (content: string) => {
    if (!content.trim()) return;

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // 构建带上下文的消息历史
      const messagesWithContext = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // 如果启用了上下文且有可用的上下文数据，添加上下文信息
      let contextSummary = '';
      if (contextEnabled && analysisContext) {
        contextSummary = analysisContext.getAIContextSummary();
        console.log('📤 [AI-Chat] 发送请求:');
        console.log('  - 消息数:', messages.length + 1);
        console.log('  - 上下文长度:', contextSummary.length);
        console.log('  - 上下文预览:', contextSummary.substring(0, 200));
      } else {
        console.log('⚠️ [AI-Chat] 未启用上下文');
      }

      // 调用 AI API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesWithContext,
          context: contextSummary || undefined,
          enableContext: contextEnabled && !!contextSummary,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || '抱歉，我暂时无法回答您的问题。',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，服务暂时不可用，请稍后再试。',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // 点击推荐问题
  const handleSuggestedClick = (question: string) => {
    handleSend(question);
  };

  // 跳转到完整AI聊天页面
  const handleGoToFullChat = () => {
    router.push('/ai-chat');
  };

  // 检查是否有可用的上下文
  const hasContext = !!(
    analysisContext?.userInput || analysisContext?.analysisResult
  );

  return (
    <>
      {/* 悬浮按钮 */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <div className="relative">
            <Button
              onClick={() => setIsOpen(true)}
              className="relative h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-110"
            >
              <MessageCircle className="w-7 h-7 text-white" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 p-0 flex items-center justify-center">
                  {unreadCount}
                </Badge>
              )}
              {hasContext && (
                <Badge className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 p-0 flex items-center justify-center border-2 border-white">
                  <Sparkles className="w-3 h-3 text-white" />
                </Badge>
              )}
            </Button>
            {hasContext && (
              <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg p-2 text-xs whitespace-nowrap">
                <div className="flex items-center gap-1 text-green-600">
                  <Sparkles className="w-3 h-3" />
                  <span>已加载您的信息</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 对话窗口 */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 border-purple-200">
          {/* 头部 */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <h3 className="font-bold">AI风水大师</h3>
                <p className="text-xs opacity-90 flex items-center gap-1">
                  在线
                  {hasContext && contextEnabled && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        智能模式
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasContext && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setContextEnabled(!contextEnabled)}
                  className={`text-white hover:bg-white/20 ${!contextEnabled ? 'opacity-50' : ''}`}
                  title={contextEnabled ? '关闭智能模式' : '开启智能模式'}
                >
                  <Info className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoToFullChat}
                className="text-white hover:bg-white/20"
                title="打开完整对话"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* 消息区域 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white border border-gray-200 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 推荐问题 */}
          {messages.length <= 2 && (
            <div className="p-3 bg-white border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2">💡 试试问我：</p>
              <div className="flex flex-wrap gap-2">
                {getContextualSuggestions()
                  .slice(0, 3)
                  .map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestedClick(question)}
                      className="text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* 输入区域 */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(inputValue);
                  }
                }}
                placeholder="输入您的问题..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Button
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim()}
                className="rounded-full w-10 h-10 p-0 bg-gradient-to-r from-purple-600 to-blue-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {hasContext && (
              <p className="text-xs text-center text-gray-500 mt-2">
                {contextEnabled ? '✨ 智能模式已启用' : '普通对话模式'}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
