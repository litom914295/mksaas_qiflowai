'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertCircle,
    BarChart3,
    BookOpen,
    Bot,
    Compass,
    Copy,
    Home,
    Lightbulb,
    MessageSquare,
    Mic,
    MicOff,
    MoreVertical,
    Paperclip,
    RefreshCw,
    Send,
    Star,
    ThumbsDown,
    ThumbsUp,
    User,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// 消息类型
interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  attachments?: ChatAttachment[];
  suggestions?: string[];
  analysisData?: any;
  confidence?: number;
  sources?: string[];
}

// 附件类型
interface ChatAttachment {
  id: string;
  type: 'image' | 'document' | 'audio' | 'video';
  name: string;
  url: string;
  size: number;
  thumbnail?: string;
}

// 对话会话
interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
  context: {
    propertyId?: string;
    analysisId?: string;
    userId: string;
    sessionType: 'general' | 'analysis' | 'consultation' | 'troubleshooting';
  };
  settings: {
    model: string;
    temperature: number;
    maxTokens: number;
    language: string;
    includeImages: boolean;
    includeAnalysis: boolean;
  };
}

// 快速操作
interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'analysis' | 'consultation' | 'education' | 'tools';
}

// AI对话界面组件
export const ChatInterface: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(
    null
  );
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedTab, setSelectedTab] = useState('chat');
  const [showSettings] = useState(false);
  const [isConnected] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // 发送消息
  const sendMessage = useCallback(
    async (content: string, attachments: ChatAttachment[] = []) => {
      if (!content.trim() && attachments.length === 0) return;

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: content.trim(),
        timestamp: new Date(),
        attachments,
      };

      // 添加用户消息
      setCurrentSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, userMessage],
          updatedAt: new Date(),
        };
      });

      setInputMessage('');
      setIsTyping(true);

      try {
        // 模拟AI响应
        await new Promise(resolve =>
          setTimeout(resolve, 1000 + Math.random() * 2000)
        );

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: generateAIResponse(content, attachments),
          timestamp: new Date(),
          confidence: 0.85 + Math.random() * 0.1,
          suggestions: generateSuggestions(content),
          analysisData: generateAnalysisData(content),
        };

        setCurrentSession(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [...prev.messages, assistantMessage],
            updatedAt: new Date(),
          };
        });
      } catch (error) {
        console.error('发送消息失败:', error);

        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'system',
          content: '抱歉，我暂时无法处理您的请求。请稍后再试。',
          timestamp: new Date(),
        };

        setCurrentSession(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [...prev.messages, errorMessage],
            updatedAt: new Date(),
          };
        });
      } finally {
        setIsTyping(false);
      }
    },
    []
  );

  // 生成AI响应
  const generateAIResponse = (
    content: string,
    attachments: ChatAttachment[]
  ): string => {
    const responses = [
      '根据您的描述，我建议您考虑以下几个方面...',
      '这是一个很好的问题。让我为您详细分析一下...',
      '基于风水学的原理，我推荐以下解决方案...',
      '您的户型图显示了一些有趣的特征，让我来解释一下...',
      '根据飞星分析的结果，这个位置确实需要注意...',
      '我理解您的担忧。让我为您提供一些专业的建议...',
      '这是一个常见的风水问题，通常可以通过以下方式改善...',
      '基于您的具体情况，我建议您重点关注以下几个方面...',
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  // 生成建议
  const generateSuggestions = (content: string): string[] => {
    const suggestions = [
      '能否详细说明一下您的房屋朝向？',
      '您希望我分析哪个具体的房间？',
      '需要我为您生成详细的分析报告吗？',
      '您对哪个风水理论比较感兴趣？',
      '需要我解释一下飞星分析的结果吗？',
    ];

    return suggestions.slice(0, 3);
  };

  // 生成分析数据
  const generateAnalysisData = (content: string): any => {
    return {
      keywords: ['风水', '朝向', '布局'],
      confidence: 0.85,
      relatedTopics: ['飞星分析', '户型优化', '色彩搭配'],
      nextSteps: ['上传户型图', '进行罗盘测量', '查看详细报告'],
    };
  };

  // 快速操作
  const quickActions: QuickAction[] = [
    {
      id: 'analyze_floor_plan',
      title: '分析户型图',
      description: '上传户型图进行风水分析',
      icon: <Home className='h-5 w-5' />,
      action: () => sendMessage('请帮我分析户型图的风水布局'),
      category: 'analysis',
    },
    {
      id: 'compass_measurement',
      title: '罗盘测量',
      description: '进行精确的方位测量',
      icon: <Compass className='h-5 w-5' />,
      action: () => sendMessage('如何进行罗盘测量？'),
      category: 'tools',
    },
    {
      id: 'flying_star_analysis',
      title: '飞星分析',
      description: '了解九宫飞星的影响',
      icon: <Star className='h-5 w-5' />,
      action: () => sendMessage('请解释一下飞星分析的结果'),
      category: 'analysis',
    },
    {
      id: 'room_optimization',
      title: '房间优化',
      description: '获得房间布局建议',
      icon: <BarChart3 className='h-5 w-5' />,
      action: () => sendMessage('如何优化房间布局？'),
      category: 'consultation',
    },
    {
      id: 'fengshui_education',
      title: '风水知识',
      description: '学习风水基础知识',
      icon: <BookOpen className='h-5 w-5' />,
      action: () => sendMessage('请介绍一下风水的基本原理'),
      category: 'education',
    },
    {
      id: 'color_consultation',
      title: '色彩咨询',
      description: '获得色彩搭配建议',
      icon: <Lightbulb className='h-5 w-5' />,
      action: () => sendMessage('什么颜色适合我的房间？'),
      category: 'consultation',
    },
  ];

  // 处理键盘事件
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(inputMessage);
      }
    },
    [inputMessage, sendMessage]
  );

  // 处理语音录制
  const toggleRecording = useCallback(() => {
    setIsRecording(!isRecording);
    // 这里应该实现实际的语音录制功能
  }, [isRecording]);

  // 处理文件上传
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const attachments: ChatAttachment[] = Array.from(files).map(file => ({
        id: Date.now().toString() + Math.random(),
        type: file.type.startsWith('image/') ? 'image' : 'document',
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
      }));

      sendMessage('', attachments);
    },
    [sendMessage]
  );

  // 复制消息
  const copyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
  }, []);

  // 点赞/点踩
  const rateMessage = useCallback(
    (messageId: string, rating: 'like' | 'dislike') => {
      console.log(`消息 ${messageId} 获得 ${rating} 评价`);
    },
    []
  );

  // 重新生成响应
  const regenerateResponse = useCallback((messageId: string) => {
    console.log(`重新生成消息 ${messageId} 的响应`);
  }, []);

  // 自动滚动
  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, scrollToBottom]);

  // 初始化会话
  useEffect(() => {
    if (!currentSession) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: '新对话',
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
        context: {
          userId: 'user1',
          sessionType: 'general',
        },
        settings: {
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2000,
          language: 'zh-CN',
          includeImages: true,
          includeAnalysis: true,
        },
      };
      setCurrentSession(newSession);
      setSessions([newSession]);
    }
  }, [currentSession]);

  return (
    <div className='w-full max-w-6xl mx-auto p-6 space-y-6'>
      <div className='text-center space-y-2'>
        <h1 className='text-3xl font-bold text-gray-900'>AI风水助手</h1>
        <p className='text-gray-600'>智能风水分析，专业建议，随时为您服务</p>
      </div>

      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className='w-full'
      >
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='chat'>对话</TabsTrigger>
          <TabsTrigger value='quick'>快速操作</TabsTrigger>
          <TabsTrigger value='history'>历史记录</TabsTrigger>
          <TabsTrigger value='settings'>设置</TabsTrigger>
        </TabsList>

        <TabsContent value='chat' className='space-y-6'>
          <Card className='h-[600px] flex flex-col'>
            <CardHeader className='flex-shrink-0'>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center gap-2'>
                  <MessageSquare className='h-5 w-5' />
                  风水助手对话
                </CardTitle>
                <div className='flex items-center gap-2'>
                  <div
                    className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                  ></div>
                  <span className='text-sm text-gray-600'>
                    {isConnected ? '在线' : '离线'}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className='flex-1 flex flex-col p-0'>
              {/* 消息列表 */}
              <div className='flex-1 overflow-y-auto p-6 space-y-4'>
                {currentSession?.messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}
                    >
                      <div
                        className={`flex items-start gap-3 ${
                          message.type === 'user'
                            ? 'flex-row-reverse'
                            : 'flex-row'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.type === 'user'
                              ? 'bg-blue-500 text-white'
                              : message.type === 'assistant'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-500 text-white'
                          }`}
                        >
                          {message.type === 'user' ? (
                            <User className='h-4 w-4' />
                          ) : message.type === 'assistant' ? (
                            <Bot className='h-4 w-4' />
                          ) : (
                            <AlertCircle className='h-4 w-4' />
                          )}
                        </div>

                        <div
                          className={`flex-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}
                        >
                          <div
                            className={`inline-block p-4 rounded-lg ${
                              message.type === 'user'
                                ? 'bg-blue-500 text-white'
                                : message.type === 'assistant'
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'bg-yellow-100 text-yellow-900'
                            }`}
                          >
                            <p className='whitespace-pre-wrap'>
                              {message.content}
                            </p>

                            {message.attachments &&
                              message.attachments.length > 0 && (
                                <div className='mt-2 space-y-2'>
                                  {message.attachments.map(attachment => (
                                    <div
                                      key={attachment.id}
                                      className='flex items-center gap-2 p-2 bg-white bg-opacity-20 rounded'
                                    >
                                      <Paperclip className='h-4 w-4' />
                                      <span className='text-sm'>
                                        {attachment.name}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                            {message.confidence && (
                              <div className='mt-2 text-xs opacity-75'>
                                置信度: {Math.round(message.confidence * 100)}%
                              </div>
                            )}
                          </div>

                          <div className='flex items-center gap-2 mt-2'>
                            <span className='text-xs text-gray-500'>
                              {message.timestamp.toLocaleTimeString('zh-CN')}
                            </span>

                            {message.type === 'assistant' && (
                              <div className='flex items-center gap-1'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => copyMessage(message.content)}
                                >
                                  <Copy className='h-3 w-3' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() =>
                                    rateMessage(message.id, 'like')
                                  }
                                >
                                  <ThumbsUp className='h-3 w-3' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() =>
                                    rateMessage(message.id, 'dislike')
                                  }
                                >
                                  <ThumbsDown className='h-3 w-3' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => regenerateResponse(message.id)}
                                >
                                  <RefreshCw className='h-3 w-3' />
                                </Button>
                              </div>
                            )}
                          </div>

                          {message.suggestions &&
                            message.suggestions.length > 0 && (
                              <div className='mt-2 flex flex-wrap gap-2'>
                                {message.suggestions.map(
                                  (suggestion, index) => (
                                    <Button
                                      key={index}
                                      variant='outline'
                                      size='sm'
                                      onClick={() => sendMessage(suggestion)}
                                      className='text-xs'
                                    >
                                      {suggestion}
                                    </Button>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className='flex justify-start'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center'>
                        <Bot className='h-4 w-4' />
                      </div>
                      <div className='bg-gray-100 p-4 rounded-lg'>
                        <div className='flex items-center gap-1'>
                          <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
                          <div
                            className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                            style={{ animationDelay: '0.1s' }}
                          ></div>
                          <div
                            className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                            style={{ animationDelay: '0.2s' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* 输入区域 */}
              <div className='flex-shrink-0 p-6 border-t'>
                <div className='flex items-end gap-3'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                      <Input
                        ref={inputRef}
                        value={inputMessage}
                        onChange={e => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder='输入您的问题或需求...'
                        className='flex-1'
                      />
                      <input
                        type='file'
                        id='file-upload'
                        className='hidden'
                        multiple
                        accept='image/*,.pdf,.doc,.docx'
                        onChange={handleFileUpload}
                      />
                      <label htmlFor='file-upload'>
                        <Button variant='outline' size='sm' asChild>
                          <span>
                            <Paperclip className='h-4 w-4' />
                          </span>
                        </Button>
                      </label>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={toggleRecording}
                        className={isRecording ? 'bg-red-500 text-white' : ''}
                      >
                        {isRecording ? (
                          <MicOff className='h-4 w-4' />
                        ) : (
                          <Mic className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={() => sendMessage(inputMessage)}
                    disabled={!inputMessage.trim() || isTyping}
                    className='px-6'
                  >
                    <Send className='h-4 w-4 mr-2' />
                    发送
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='quick' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {quickActions.map(action => (
                  <Card
                    key={action.id}
                    className='cursor-pointer hover:shadow-md transition-all'
                    onClick={action.action}
                  >
                    <CardContent className='p-4'>
                      <div className='flex items-center gap-3 mb-2'>
                        {action.icon}
                        <h3 className='font-semibold'>{action.title}</h3>
                      </div>
                      <p className='text-sm text-gray-600'>
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='history' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>对话历史</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {sessions.map(session => (
                  <div
                    key={session.id}
                    className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer'
                    onClick={() => setCurrentSession(session)}
                  >
                    <div>
                      <h3 className='font-semibold'>{session.title}</h3>
                      <p className='text-sm text-gray-600'>
                        {session.messages.length} 条消息 •{' '}
                        {session.updatedAt.toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge variant='outline'>
                        {session.context.sessionType === 'general'
                          ? '一般'
                          : session.context.sessionType === 'analysis'
                            ? '分析'
                            : session.context.sessionType === 'consultation'
                              ? '咨询'
                              : '故障排除'}
                      </Badge>
                      <Button variant='ghost' size='sm'>
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='settings' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>AI助手设置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                <div>
                  <label className='block text-sm font-medium mb-2'>
                    AI模型
                  </label>
                  <select className='w-full p-2 border rounded-md'>
                    <option value='gpt-4'>GPT-4</option>
                    <option value='gpt-3.5-turbo'>GPT-3.5 Turbo</option>
                    <option value='claude-3'>Claude 3</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium mb-2'>
                    回答风格
                  </label>
                  <select className='w-full p-2 border rounded-md'>
                    <option value='professional'>专业严谨</option>
                    <option value='friendly'>友好亲切</option>
                    <option value='detailed'>详细深入</option>
                    <option value='concise'>简洁明了</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium mb-2'>
                    语言偏好
                  </label>
                  <select className='w-full p-2 border rounded-md'>
                    <option value='zh-CN'>简体中文</option>
                    <option value='zh-TW'>繁体中文</option>
                    <option value='en'>English</option>
                  </select>
                </div>

                <div className='space-y-3'>
                  <label className='flex items-center space-x-2'>
                    <input type='checkbox' defaultChecked className='rounded' />
                    <span>包含图像分析</span>
                  </label>
                  <label className='flex items-center space-x-2'>
                    <input type='checkbox' defaultChecked className='rounded' />
                    <span>包含风水分析数据</span>
                  </label>
                  <label className='flex items-center space-x-2'>
                    <input type='checkbox' className='rounded' />
                    <span>启用语音输入</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatInterface;

