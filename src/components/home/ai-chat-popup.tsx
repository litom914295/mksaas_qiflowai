'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles,
  Bot,
  User,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIChatPopupProps {
  isOpen?: boolean;
  onClose?: () => void;
  baziData?: any;
  fengshuiData?: any;
}

export function AIChatPopup({ 
  isOpen = false, 
  onClose,
  baziData,
  fengshuiData 
}: AIChatPopupProps) {
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
  }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const [chatOpen, setChatOpen] = useState(isOpen);

  // 自动弹出提示（提高转化率）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!chatOpen && messages.length === 0) {
        // 添加欢迎消息
        setMessages([{
          id: '1',
          role: 'assistant',
          content: '👋 您好！我是您的AI风水大师。我看到您的分析结果了，有什么想深入了解的吗？比如：\n\n• 2024年哪个月份最适合创业？\n• 如何改善家中风水提升财运？\n• 感情运势什么时候会好转？\n\n💝 限时优惠：现在咨询享8折优惠！'
        }]);
        // 显示聊天窗口
        setShowFloatingButton(true);
      }
    }, 5000); // 5秒后自动显示

    return () => clearTimeout(timer);
  }, []);

  // 快速问题按钮（降低使用门槛）
  const quickQuestions = [
    '我的财运如何提升？',
    '感情什么时候会有转机？',
    '事业发展关键点在哪？',
    '家中风水如何调整？'
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // 模拟AI回复
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `根据您的八字分析，${input.includes('财') ? 
          '您的财运在农历三月和八月会有明显提升，建议在这两个月份把握投资机会。同时，您的财位在东南方向，可以在家中东南角摆放绿色植物或水晶来增强财运。' :
          input.includes('感情') ?
          '您的感情运在下半年会有好转，特别是农历七月份，桃花运旺盛。建议您多参加社交活动，注意打扮，增加异性缘。' :
          input.includes('事业') ?
          '您的事业运势整体向好，特别适合在技术和创意领域发展。今年下半年有贵人相助，要把握好人脉资源。' :
          '这是一个很好的问题！基于您的命理分析，我建议您重点关注东南方位的能量调整，这对您的整体运势提升很有帮助。'
        }\n\n💡 想要更详细的个性化建议吗？升级到专业版可以获得完整的风水布局图和每月运势指导。`
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <>
      {/* 悬浮按钮 */}
      <AnimatePresence>
        {showFloatingButton && !chatOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setChatOpen(true)}
              className="relative w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl"
            >
              <MessageCircle className="w-8 h-8 text-white" />
              {messages.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white animate-pulse">
                  {messages.length}
                </Badge>
              )}
            </Button>
            
            {/* 提示气泡 */}
            {messages.length === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute bottom-2 right-20 bg-white rounded-lg shadow-lg p-3 w-48"
              >
                <p className="text-sm font-semibold">有问题想问AI大师？</p>
                <p className="text-xs text-gray-600">点击开始对话</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 聊天窗口 */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] max-h-[80vh]"
          >
            <Card variant="elevated" className="h-full flex flex-col shadow-2xl">
              {/* 头部 */}
              <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold">AI风水大师</h3>
                      <p className="text-xs text-white/80 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        在线咨询中
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setChatOpen(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* 消息区域 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' ? 'bg-blue-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}>
                        {message.role === 'user' ? 
                          <User className="w-5 h-5 text-white" /> : 
                          <Sparkles className="w-5 h-5 text-white" />
                        }
                      </div>
                      <div className={`px-4 py-2 rounded-2xl ${
                        message.role === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 快速问题 */}
              {messages.length <= 1 && (
                <div className="px-4 py-2 border-t">
                  <p className="text-xs text-gray-500 mb-2">快速提问：</p>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((q, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setInput(q);
                          handleSend();
                        }}
                        className="text-xs"
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* 输入区域 */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="输入您的问题..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  每次咨询消耗5积分 · 首次免费
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}