'use client';

/**
 * 上下文感知的 AI-Chat 悬浮球
 *
 * 能够自动获取用户输入的信息和生成的分析结果，
 * 无需用户重复输入，提供更智能的对话体验
 */

import { createChatSessionAction } from '@/actions/chat/create-chat-session';
import { getChatSessionStatusAction } from '@/actions/chat/get-chat-session-status';
import { renewChatSessionAction } from '@/actions/chat/renew-chat-session';
import { ragChatAction } from '@/actions/rag-actions';
import { KnowledgeReferenceMini } from '@/components/rag/knowledge-reference';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAnalysisContextOptional } from '@/contexts/analysis-context';
import type { SearchResult } from '@/lib/rag';
import type { Message } from '@/types/ai';
import { streamChat } from '@/utils/chat-stream';
import {
  Clock,
  Copy,
  ExternalLink,
  Info,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

interface AIChatWithContextProps {
  /** 智能推荐的问题 */
  suggestedQuestions?: string[];
  /** 初始欢迎消息 */
  welcomeMessage?: string;
  /** 是否显示未读消息数 */
  unreadCount?: number;
  /** 是否启用会话计费模式 */
  enableSessionBilling?: boolean;
  /** 会话费用（积分） */
  sessionCost?: number;
  /** 会话时长（分钟） */
  sessionDuration?: number;
  /** 是否启用 RAG 知识增强 */
  enableRAG?: boolean;
  /** RAG 文档类别 */
  ragCategory?: 'bazi' | 'fengshui' | 'faq' | 'case';
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
  enableSessionBilling = false,
  sessionCost = 40,
  sessionDuration = 15,
  enableRAG = false,
  ragCategory,
}: AIChatWithContextProps) {
  const router = useRouter();
  const analysisContext = useAnalysisContextOptional();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [contextEnabled, setContextEnabled] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showRelatedTopics, setShowRelatedTopics] = useState<
    Record<string, boolean>
  >({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 新增: 标记是否已激活（用于避免重复激活）
  const hasActivated = useRef(false);

  // 会话计费状态
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<
    'none' | 'active' | 'expired'
  >('none');
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 根据八字信息生成个性化欢迎消息
  const getWelcomeMessage = (): string => {
    if (welcomeMessage) return welcomeMessage;

    console.log('🔍 [Welcome] 生成欢迎语 - analysisContext:', analysisContext);
    console.log('🔍 [Welcome] userInput:', analysisContext?.userInput);
    console.log(
      '🔍 [Welcome] analysisResult:',
      !!analysisContext?.analysisResult
    );

    if (analysisContext?.userInput) {
      const { personal } = analysisContext.userInput;
      if (!personal) {
        return '您好！我是AI风水大师，有什么可以帮您的吗？';
      }
      // 根据年龄调整称呼方式
      const name = personal.name || '';
      const birthYear =
        personal.birthYear ||
        (personal.birthDate
          ? new Date(personal.birthDate).getFullYear()
          : null);
      const currentYear = new Date().getFullYear();
      const age = birthYear ? currentYear - birthYear : null;

      let title = '';
      if (age !== null && age < 3) {
        // 婴幼儿 - 直接称呼姓名（家长视角）
        title = name ? `${name}宝宝的家长` : '这位家长';
      } else if (age !== null && age < 12) {
        // 儿童 - 称呼家长
        const gender = personal.gender === 'male' ? '先生' : '女士';
        title = name ? `${name}的家长` : `这位${gender}`;
      } else if (age !== null && age < 18) {
        // 青少年 - 直接称呼姓名
        title = name || '这位同学';
      } else {
        // 成年人 - 使用正式称呼
        const gender = personal.gender === 'male' ? '先生' : '女士';
        title = name ? `${name}${gender}` : `这位${gender}`;
      }

      console.log('🔍 [Welcome] name:', name, 'age:', age, 'title:', title);

      // 如果有分析结果，生成基于八字的个性化欢迎语
      if (analysisContext.analysisResult) {
        const result = analysisContext.analysisResult;
        let personalizedGreeting = '';

        console.log('🔍 [Welcome] 分析结果:', result);

        // 基于八字四柱生成个性化内容
        if (result.pillars) {
          const dayMaster =
            result.pillars.day?.heavenlyStem || result.pillars.day?.stem;
          const elements = result.elements;

          console.log(
            '🔍 [Welcome] dayMaster:',
            dayMaster,
            'elements:',
            elements
          );

          if (dayMaster) {
            const elementNames: Record<string, string> = {
              甲: '甲木',
              乙: '乙木',
              丙: '丙火',
              丁: '丁火',
              戊: '戊土',
              己: '己土',
              庚: '庚金',
              辛: '辛金',
              壬: '壬水',
              癸: '癸水',
            };

            const dayMasterName = elementNames[dayMaster] || dayMaster;
            personalizedGreeting += `您的日主是${dayMasterName}，`;
          }

          // 根据五行强弱生成个性化描述
          if (elements) {
            const strongElements = Object.entries(elements)
              .filter(
                ([, strength]) => typeof strength === 'number' && strength > 2
              )
              .map(([element]) => element);

            if (strongElements.length > 0) {
              const elementMap: Record<string, string> = {
                WOOD: '木',
                FIRE: '火',
                EARTH: '土',
                METAL: '金',
                WATER: '水',
              };
              const strongElementNames = strongElements
                .map((e) => elementMap[e] || e)
                .join('、');
              personalizedGreeting += `${strongElementNames}较旺，`;
            }
          }
        }

        // 基于用神生成建议
        if (result.yongshen) {
          const yongshenMap: Record<string, string> = {
            WOOD: '木',
            FIRE: '火',
            EARTH: '土',
            METAL: '金',
            WATER: '水',
          };
          const yongshenName = yongshenMap[result.yongshen] || result.yongshen;
          personalizedGreeting += `建议多用${yongshenName}行来调和。`;
        }

        // 基于格局生成描述
        if (result.pattern) {
          personalizedGreeting += `您的命格为${result.pattern}。`;
        }

        // 生成更吸引人的欢迎语
        let coreInsight = '';
        const currentYear = new Date().getFullYear();
        const birthYear =
          personal?.birthYear ||
          (personal?.birthDate
            ? new Date(personal.birthDate).getFullYear()
            : 1973);
        const age = currentYear - birthYear;

        // 根据年龄调整欢迎语
        if (age < 3) {
          // 婴幼儿（父母查看）
          coreInsight = `您的宝宝还在褥褴中，这份分析可以帮助您了解孩子的天赋特质，从小培养`;
        } else if (age < 12) {
          // 儿童
          coreInsight = `孩子正处于成长关键期，这份分析可以帮助发掘天赋、引导教育方向`;
        } else if (age < 18) {
          // 青少年
          coreInsight = `青少年时期是性格塑造的关键阶段，这份分析可以帮助了解自己、规划未来`;
        } else {
          // 成年人（保留原有逻辑）
          if (result.pillars?.day?.stem) {
            const dayMaster = result.pillars.day.stem;
            const insightMap: Record<string, string> = {
              甲: '您天生具备领导气质，但需防止过于强势',
              乙: '您性情温和包容，但要注意增强决断力',
              丙: '您热情阳光，但需控制情绪波动',
              丁: '您心思细腻敏感，善于洞察人心',
              戊: '您稳重可靠，是天生的组织管理者',
              己: '您包容力强，但要避免过度牺牲自己',
              庚: '您意志坚定果断，但需平衡刚柔并济',
              辛: '您追求完美精致，具有很强的审美能力',
              壬: '您智慧如海，善于谋略但要防止多虑',
              癸: '您如甘露般滋润他人，直觉力极强但需增强自信',
            };
            coreInsight = insightMap[dayMaster] || '';
          }
        }

        // 检查是否有风水分析结果（不仅仅是输入）
        const hasFengshuiAnalysis = !!(
          result.fengshui ||
          result.xuankong ||
          result.rooms
        );
        const hasHouseInput = !!analysisContext.userInput.house?.direction;
        let fengshuiHint = '';

        if (hasFengshuiAnalysis) {
          // 已有风水分析结果
          fengshuiHint =
            '\n\n✨ 完美！您的八字和风水信息已经齐全，我可以为您提供最全面的个性化建议。';
        } else if (!hasHouseInput) {
          // 没有输入风水信息 - 根据年龄调整提示
          if (age < 12) {
            // 婴儿和儿童 - 父母视角
            fengshuiHint =
              '\n\n🏠 风水提示：我看到您已完成八字分析，如果您想了解：';
            fengshuiHint += '\n• 孩子的房间应该布置在哪个方位？';
            fengshuiHint += '\n• 如何布置家居环境帮助孩子成长？';
            fengshuiHint += '\n• 哪个方位最适合孩子学习和玩耕？';
            fengshuiHint +=
              '\n\n可以补充填写房屋朝向、房间数量，获得八字+风水的全面分析。';
          } else if (age < 18) {
            // 青少年
            fengshuiHint =
              '\n\n🏠 风水提示：我看到您已完成八字分析，如果您想了解：';
            fengshuiHint += '\n• 您的学业方位在哪里？';
            fengshuiHint += '\n• 卧室应该布置在哪个方位？';
            fengshuiHint += '\n• 如何通过风水提升学业运？';
            fengshuiHint +=
              '\n\n可以补充填写房屋朝向、房间数量，获得八字+风水的全面分析。';
          } else {
            // 成年人
            fengshuiHint =
              '\n\n🏠 风水提示：我看到您已完成八字分析，如果您想了解：';
            fengshuiHint += '\n• 您的财位在哪个方位？';
            fengshuiHint += '\n• 家居如何与八字配合提升运势？';
            fengshuiHint += '\n• 卧室、书房应该布置在哪里？';
            fengshuiHint +=
              '\n\n可以补充填写房屋朝向、房间数量，获得八字+风水的全面分析。';
          }
        } else {
          // 有输入但没有分析结果（可能还在生成中）
          fengshuiHint = '\n\n💫 正在为您生成风水分析，请稍等片刻...';
        }

        // 根据年龄生成不同风格的欢迎语
        let finalWelcome = '';
        if (age < 18) {
          // 未成年人 - 简化表述，更贴近父母视角
          const ageGroup = age < 3 ? '宝宝' : age < 12 ? '孩子' : '您';
          finalWelcome = `您好${title}！\n\n🔮 ${ageGroup}的日主是${result.pillars?.day?.heavenlyStem || result.pillars?.day?.stem || '未知'}，`;

          // 简化五行描述
          if (result.yongshen) {
            const yongshenMap: Record<string, string> = {
              WOOD: '木',
              FIRE: '火',
              EARTH: '土',
              METAL: '金',
              WATER: '水',
            };
            const yongshenName =
              yongshenMap[result.yongshen] || result.yongshen;
            finalWelcome += `适合多接触${yongshenName}属性的事物（如${yongshenName === '木' ? '绿色植物、木制玩具' : yongshenName === '火' ? '红色衣物、阳光活动' : yongshenName === '土' ? '黄色装饰、陶土手工' : yongshenName === '金' ? '白色物品、金属玩具' : '蓝色物品、水景装饰'}）。\n\n`;
          } else {
            finalWelcome += '\n\n';
          }

          finalWelcome += `💡 ${coreInsight}${fengshuiHint}`;
        } else {
          // 成年人 - 保留完整专业表述
          finalWelcome = `您好${title}！\n\n🔮 ${personalizedGreeting}${coreInsight}\n\n✨ 结合您的八字与${currentYear}年九运能量，我发现了几个关键运势转折点。${fengshuiHint}`;
        }
        console.log('👋 [Welcome] 最终欢迎语:', finalWelcome);
        return finalWelcome;
      }

      // 只有用户输入，没有分析结果
      const birthInfo = personal?.birthDate
        ? `出生于${new Date(personal.birthDate).getFullYear()}年`
        : '';

      const noResultWelcome = `您好${title}！${birthInfo ? `我看到您${birthInfo}，` : ''}已经填写了基本信息。正在为您准备八字分析，请稍等片刻。在此期间，我可以先为您解答一些命理问题。`;
      console.log('👋 [Welcome] 无结果欢迎语:', noResultWelcome);
      return noResultWelcome;
    }

    // 检查是否有八字但没有风水信息
    const hasPersonal = !!analysisContext?.userInput?.personal;
    const hasHouse = !!analysisContext?.userInput?.house?.direction;

    let defaultWelcome = '您好！我是AI风水大师，有什么可以帮您的吗？';

    if (hasPersonal && !hasHouse) {
      // 有八字信息但没有风水信息
      defaultWelcome +=
        '\n\n🏠 提示：我注意到您已填写了八字信息，但还没有填写房屋风水信息。';
      defaultWelcome += '\n\n如果您想获得更全面的建议，包括：';
      defaultWelcome += '\n• 🏡 财位在哪里？如何激活？';
      defaultWelcome += '\n• 🛏️ 卧室应该布置在哪个方位？';
      defaultWelcome += '\n• 🚺 家居风水如何与八字配合？';
      defaultWelcome +=
        '\n\n可以补充填写房屋朝向、房间数量等信息，让我为您提供八字+风水的综合分析。';
    } else if (hasPersonal && hasHouse) {
      // 同时有八字和风水信息
      defaultWelcome +=
        '\n\n✨ 棒！我已加载您的八字和风水信息，可以为您提供综合的个性化建议。';
    } else {
      // 没有任何信息
      defaultWelcome +=
        '\n\n💡 提示：如果您已经填写了个人信息和房屋信息，我会自动了解这些内容，为您提供更精准的建议。';
    }

    console.log('👋 [Welcome] 默认欢迎语:', defaultWelcome);
    return defaultWelcome;
  };

  // 初始化欢迎消息
  useEffect(() => {
    // 延迟初始化，确保上下文数据已加载
    const timer = setTimeout(() => {
      if (messages.length === 0) {
        const welcomeMsg = getWelcomeMessage();
        console.log('🎭 [Welcome] 设置欢迎消息:', welcomeMsg);
        setMessages([
          {
            id: '1',
            role: 'assistant',
            content: welcomeMsg,
            timestamp: Date.now(),
          },
        ]);
      }
    }, 500); // 延迟500ms确保上下文数据加载完成

    return () => clearTimeout(timer);
  }, [analysisContext?.userInput, analysisContext?.analysisResult]);

  // 当上下文数据发生变化时，更新欢迎消息
  useEffect(() => {
    if (messages.length > 0 && messages[0].id === '1') {
      const newWelcomeMsg = getWelcomeMessage();
      if (newWelcomeMsg !== messages[0].content) {
        console.log('🔄 [Welcome] 更新欢迎消息:', newWelcomeMsg);
        setMessages((prev) => [
          { ...prev[0], content: newWelcomeMsg },
          ...prev.slice(1),
        ]);
      }
    }
  }, [analysisContext?.userInput, analysisContext?.analysisResult]);

  // 组件卸载或关闭时，取消正在进行的请求
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        console.log('🚨 [Cleanup] 取消正在进行的请求');
      }
    };
  }, []);

  // 关闭悬浮球时，取消正在进行的请求
  useEffect(() => {
    if (!isOpen && abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log('🚨 [Close] 关闭悬浮球，取消请求');
    }
  }, [isOpen]);

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

  // ======== 会话计费相关函数 ========

  // 创建会话
  const handleCreateSession = async () => {
    setIsCreatingSession(true);
    try {
      const result = await createChatSessionAction();
      if (result.success && result.data) {
        setSessionId(result.data.sessionId);
        setSessionStatus('active');
        setRemainingMs(result.data.remainingMs);
        toast({
          title: '会话开启成功',
          description: `已扣除 ${sessionCost} 积分，会话时长 ${sessionDuration} 分钟`,
        });
      } else {
        if (result.errorCode === 'INSUFFICIENT_CREDITS') {
          toast({
            title: '积分不足',
            description: `需要 ${sessionCost} 积分，当前余额 ${result.current}`,
            variant: 'destructive',
          });
          // 跳转到积分购买页
          router.push('/credits/buy');
        } else {
          toast({
            title: '创建失败',
            description: result.error || '请稍后重试',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Create session error:', error);
      toast({
        title: '创建失败',
        description: '系统错误，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingSession(false);
    }
  };

  // 续费会话
  const handleRenewSession = async () => {
    if (!sessionId) return;

    try {
      const result = await renewChatSessionAction(sessionId);
      if (result.success && result.data) {
        setSessionStatus('active');
        setRemainingMs(result.data.remainingMs);
        toast({
          title: '续费成功',
          description: `已扣除 ${sessionCost} 积分，会话延长 ${sessionDuration} 分钟`,
        });
      } else {
        if (result.errorCode === 'INSUFFICIENT_CREDITS') {
          toast({
            title: '积分不足',
            description: `需要 ${sessionCost} 积分，请充值后重试`,
            variant: 'destructive',
          });
          router.push('/credits/buy');
        } else {
          toast({
            title: '续费失败',
            description: result.error || '请稍后重试',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Renew session error:', error);
      toast({
        title: '续费失败',
        description: '系统错误，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  // 检查会话状态
  const checkSessionStatus = useCallback(async () => {
    if (!sessionId) return;

    try {
      const result = await getChatSessionStatusAction(sessionId);
      if (result.success && result.data) {
        setSessionStatus(result.data.status);
        setRemainingMs(result.data.remainingMs);
      }
    } catch (error) {
      console.error('Check session status error:', error);
    }
  }, [sessionId]);

  // 实时更新倒计时
  useEffect(() => {
    if (!enableSessionBilling || sessionStatus !== 'active') {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    // 每秒更新剩余时间
    timerIntervalRef.current = setInterval(() => {
      setRemainingMs((prev) => {
        const newRemaining = Math.max(0, prev - 1000);

        // 5 分钟警告
        if (prev > 5 * 60 * 1000 && newRemaining <= 5 * 60 * 1000) {
          toast({
            title: '会话即将过期',
            description: '剩余 5 分钟，请及时续费',
          });
        }

        // 1 分钟危险警告
        if (prev > 60 * 1000 && newRemaining <= 60 * 1000) {
          toast({
            title: '会话即将过期！',
            description: '仅剩 1 分钟，请立即续费',
            variant: 'destructive',
          });
        }

        // 过期
        if (newRemaining === 0) {
          setSessionStatus('expired');
          toast({
            title: '会话已过期',
            description: '请续费后继续对话',
            variant: 'destructive',
          });
        }

        return newRemaining;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [enableSessionBilling, sessionStatus, toast]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // 格式化剩余时间
  const formatRemainingTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 智能滚动：只在用户发送消息后自动滚动一次
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 检测用户是否手动滚动过
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 监听用户滚动事件
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px 容差

    // 如果用户往上滚动了（不在底部），标记为手动滚动
    if (!isAtBottom && !userHasScrolled) {
      setUserHasScrolled(true);
    }
    // 如果用户滚动回底部，重置标记
    if (isAtBottom && userHasScrolled) {
      setUserHasScrolled(false);
    }
  };

  // 只在特定情况下自动滚动
  useEffect(() => {
    // 1. 用户手动滚动过，不再自动滚动
    if (userHasScrolled) return;

    // 2. 只在最后一条消息是用户消息时自动滚动（用户刚发送消息）
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'user') {
      scrollToBottom();
    }
  }, [messages, userHasScrolled]);

  // 生成基于八字信息的个性化建议问题
  const getContextualSuggestions = (): string[] => {
    const suggestions: string[] = [];

    // 如果没有分析结果，但有用户输入，生成基础个性化问题
    if (!analysisContext?.analysisResult && analysisContext?.userInput) {
      const { personal } = analysisContext.userInput;
      if (!personal) return suggestedQuestions.slice(0, 3);
      const currentYear = new Date().getFullYear();
      const birthYear = personal.birthDate
        ? new Date(personal.birthDate).getFullYear()
        : null;

      if (birthYear) {
        const age = currentYear - birthYear;
        if (age >= 25 && age <= 35) {
          suggestions.push('我这个年龄段事业发展如何？');
          suggestions.push('什么时候适合结婚生子？');
        } else if (age >= 36 && age <= 50) {
          suggestions.push('中年阶段有什么运势变化？');
          suggestions.push('如何在事业上更进一步？');
        } else if (age > 50) {
          suggestions.push('晚年运势怎么样？');
          suggestions.push('如何保持健康长寿？');
        }
      }

      if (personal?.gender === 'male') {
        suggestions.push('男性在风水上有什么特别讲究？');
      } else if (personal?.gender) {
        suggestions.push('女性如何通过风水提升运势？');
      }

      return suggestions.slice(0, 3);
    }

    if (!analysisContext?.analysisResult) {
      return suggestedQuestions.slice(0, 3);
    }

    const result = analysisContext.analysisResult;
    const personal = analysisContext.userInput?.personal;

    // 基于八字和当前时间生成高关注度问题
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // 提前计算年龄，用于过滤不合适的问题
    const birthYear =
      personal?.birthYear ||
      (personal?.birthDate ? new Date(personal.birthDate).getFullYear() : null);
    const userAge = birthYear ? currentYear - birthYear : null;

    // 如果是未成年人，直接使用之前修复好的逻辑（第618-648行）
    if (userAge !== null && userAge < 18) {
      // 跳过所有复杂的成人问题生成，直接跳到第682行后的年龄分段逻辑
      // 这里不做任何处理，让代码继续往下执行到年龄判断部分
    }

    if (result.pillars && userAge !== null && userAge >= 18) {
      const dayMaster =
        result.pillars.day?.heavenlyStem || result.pillars.day?.stem;
      const birthYear =
        personal?.birthYear ||
        (personal?.birthDate
          ? new Date(personal.birthDate).getFullYear()
          : 2000);
      const age = currentYear - birthYear;

      if (dayMaster) {
        // 基于具体八字特征的超精准问题生成
        const isMiddleAge = age > 45;
        const currentSeason =
          currentMonth <= 3
            ? '春'
            : currentMonth <= 6
              ? '夏'
              : currentMonth <= 9
                ? '秋'
                : '冬';

        const urgentQuestions: Record<string, string[]> = {
          癸: [
            // 针对癸水日主的超精准问题
            `作为1973年癸水命，我在${currentYear}年的最大财运爆发期是几月？`,
            `${age}岁的我如何利用癸水的直觉天赋在投资中获利？`,
          ],
          壬: [
            `壬水日主的我，在${isMiddleAge ? '知命之年' : '不惑之年'}如何发挥最大谋略优势？`,
            `${currentSeason}季我的智慧运势最旺时，应该在哪些领域发力？`,
          ],
          丁: [
            `${birthYear}年生的丁火命，今年最适合在哪个方向发展创意事业？`,
            `我的丁火精细特质在${age > 40 ? '中年' : '壮年'}阶段如何变现金？`,
          ],
          丙: [
            `丙火日主的我，在${currentYear}年如何避免热情过度导致的投资失误？`,
            `${age}岁的丙火命最需要在哪个时间段冷静思考？`,
          ],
          戊: [
            `${birthYear}年戊土命的我，在今年如何利用稳重特质在房产上获利？`,
            `作为戊土日主，我的领导才能在${age > 50 ? '知命后' : '不惑后'}如何再上层楼？`,
          ],
          己: [
            `己土日主${age}岁了，如何在不伤害关系的前提下获得应有回报？`,
            `我的己土包容特质在${currentSeason}季如何转化为事业优势？`,
          ],
          庚: [
            `${birthYear}年庚金命的我，在${currentYear}年最需要避开哪些刚易折的大坑？`,
            `庚金日主${age}岁的意志力峠峰期，应该在哪个领域全力出击？`,
          ],
          辛: [
            `辛金日主的我，在${isMiddleAge ? '人生下半场' : '壮年时期'}如何精雕细琢？`,
            `${age}岁的辛金命最适合在哪个精细领域成为专家？`,
          ],
          甲: [
            `${birthYear}年甲木命的我，在${currentYear}年如何利用领导天赋获得突破？`,
            `甲木日主${age}岁了，该在哪个领域发挥开拓者的优势？`,
          ],
          乙: [
            `乙木日主的我，${age}岁后如何让温和性格成为最大竞争力？`,
            `${currentSeason}季我的乙木特质最适合在哪些行业发光发热？`,
          ],
        };

        const urgentSuggestions = urgentQuestions[dayMaster];
        if (urgentSuggestions) {
          // 选择最紧迫的问题
          suggestions.push(urgentSuggestions[0]);
        }
      }
    }

    // 基于用神生成超精准开运问题（结合具体八字和时间）- 仅成年人
    if (
      result.yongshen &&
      suggestions.length < 3 &&
      userAge !== null &&
      userAge >= 18
    ) {
      const birthYear =
        personal?.birthYear ||
        (personal?.birthDate
          ? new Date(personal.birthDate).getFullYear()
          : 2000);
      const age = currentYear - birthYear;
      const currentSeason =
        currentMonth <= 3
          ? '春'
          : currentMonth <= 6
            ? '夏'
            : currentMonth <= 9
              ? '秋'
              : '冬';
      const yongshenUrgentQuestions: Record<string, string> = {
        WOOD: `${age > 45 ? '知命之年' : '不惑之年'}的我，在${currentMonth}月穿绿衣在东方办公能立即提升财运吗？`,
        FIRE: `作为${result.pillars?.day?.stem || ''}日主，我在家中南方放红色物品能在${currentYear}年激活事业运吗？`,
        EARTH: `${age}岁的我穿黄色在中宫位放紫水晶，能否在${currentSeason}季引来意外之财？`,
        METAL: `我的${result.pillars?.day?.stem || ''}金命在西北方佩戴金饰，能在今年提升权威和地位吗？`,
        WATER: `${birthYear || 1973}年生的我穿蓝黑色在北方学习，能否激发最强直觉力？`,
      };

      const yongshenQuestion = yongshenUrgentQuestions[result.yongshen];
      if (yongshenQuestion) {
        suggestions.push(yongshenQuestion);
      }
    }

    // 基于当前流年大运和具体八字的紧迫问题 - 仅成年人
    if (
      suggestions.length < 3 &&
      personal &&
      userAge !== null &&
      userAge >= 18
    ) {
      const birthYear = personal.birthYear || 2000;
      const age = currentYear - birthYear;
      const dayMaster = result.pillars?.day?.stem || '未知';
      const currentDayunAge = Math.floor((age - 8) / 10) * 10 + 8; // 简化大运计算

      // 结合日主、年龄、流年的超精准问题
      const timelyUrgentQuestions = {
        10: `作为${dayMaster}日主，我在${currentYear}年${currentMonth}月的财库开启日期是什么时候？`,
        11: `${age}岁${dayMaster}日主的我，在近期需要特别关注哪些健康隐患？`,
        12: `我的${dayMaster}日主，下个月哪天是最佳谈判日期？`,
        1: `${birthYear || 1973}年${dayMaster}日主在${currentYear + 1}年的最大机遇和挑战各是什么？`,
        2: `我的${dayMaster}日主在春季前后需要做哪些重要决定？`,
        3: `${age}岁${dayMaster}日主的我，最适合在哪个领域成为意见领袖？`,
        4: `作为${dayMaster}日主，我在夏季前的运势变化详细分析？`,
        5: `${currentYear}年我这个${dayMaster}日主的贵人在哪个方位？`,
        6: `${dayMaster}日主${age}岁，在今年下半年最大的转机在哪里？`,
        7: `我的${dayMaster}日主在秋季需要特别防范哪些风险？`,
        8: `${birthYear || 1973}年生的${dayMaster}日主，在中秋后的事业走向如何？`,
        9: `${age}岁的${dayMaster}日主，在国庆后的重大机遇在哪里？`,
      };

      const monthlyQuestion =
        timelyUrgentQuestions[
          currentMonth as keyof typeof timelyUrgentQuestions
        ] ||
        `${dayMaster}日主的我，在${currentMonth}月份最需要关注什么运势变化？`;

      suggestions.push(monthlyQuestion);
    }

    // 基于评分生成建议 - 仅成年人
    if (result.scoring && userAge !== null && userAge >= 18) {
      const dimensions = result.scoring.overall.dimensions;
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

    // 基于年龄和性别生成问题
    if (personal) {
      const currentYear = new Date().getFullYear();
      const birthYear = personal.birthDate
        ? new Date(personal.birthDate).getFullYear()
        : null;

      if (birthYear) {
        const age = currentYear - birthYear;

        // 根据年龄段 + 实际分析结果动态生成话题
        const dayMaster =
          result.pillars?.day?.heavenlyStem ||
          result.pillars?.day?.stem ||
          '未知';
        const yongshen = result.yongshen;
        const hasFengshui = !!(
          result.fengshui ||
          result.xuankong ||
          result.rooms
        );
        const pattern = result.pattern; // 格局
        const warnings = result.warnings || [];
        const scoring = result.scoring?.overall?.dimensions || [];

        // 找出最弱的维度（需要关注的方面）
        const weakestDimensions = scoring
          .filter((d: any) => d.score < 7)
          .sort((a: any, b: any) => a.score - b.score)
          .slice(0, 2)
          .map((d: any) => d.dimension);

        // 五行强弱
        const elements = result.elements || {};
        const strongestElement = Object.entries(elements).sort(
          ([, a]: any, [, b]: any) => b - a
        )[0]?.[0];
        const weakestElement = Object.entries(elements).sort(
          ([, a]: any, [, b]: any) => a - b
        )[0]?.[0];

        if (age < 3) {
          // 婴幼儿 - 基于实际八字生成
          const babyQuestions = [
            `${dayMaster}日主的宝宝，适合从小接触哪些颜色和物品？`,
            `如何根据宝宝的${dayMaster}日主特质引导性格发展？`,
            `宝宝的房间应该在哪个方位才能助长${yongshen ? yongshen + '运' : '运势'}？`,
            `${personal?.gender === 'male' ? '男宝' : '女宝'}的睡眠方位和房间布置有什么讲究？`,
            `如何为${dayMaster}日主的孩子选择幸运物和玩具？`,
            `宝宝的天赋才能在哪些方面？应该怎么培养？`,
            strongestElement
              ? `宝宝${strongestElement}属性特别强，适合哪些颜色和玩具？`
              : null,
            yongshen ? `如何通过${yongshen}属性的引导开发宝宝天赋？` : null,
          ].filter((q): q is string => typeof q === 'string');
          if (hasFengshui) {
            babyQuestions.push(`根据家居风水，宝宝最常待的区域应该在哪？`);
            if (result.xuankong) {
              babyQuestions.push(`根据飞星风水，宝宝的房间应该选哪个方位？`);
            }
          }
          // 随机选择3个
          const shuffled = babyQuestions.sort(() => 0.5 - Math.random());
          suggestions.push(...shuffled.slice(0, 3));
        } else if (age < 12) {
          // 儿童 - 基于实际八字生成
          const childQuestions = [
            `${dayMaster}日主的孩子，最适合发展哪些兴趣特长？`,
            `如何布置书房和学习区提升${dayMaster}日主孩子的学业？`,
            `${personal?.gender === 'male' ? '男孩' : '女孩'}的${dayMaster}日主，性格有哪些优势和需要注意的地方？`,
            `孩子的贵人方位在哪里？如何布置才能带来贵人运？`,
            `${age}岁${dayMaster}日主的孩子，现在最适合学习哪类课程？`,
            yongshen
              ? `如何通过${yongshen}属性的活动和物品提升孩子运势？`
              : null,
            strongestElement
              ? `孩子${strongestElement}属性强，适合发展哪方面的才能？`
              : null,
            weakestElement
              ? `孩子${weakestElement}属性较弱，如何补救提升？`
              : null,
            pattern ? `${pattern}格局的孩子，应该重点培养哪些能力？` : null,
          ].filter((q): q is string => typeof q === 'string');
          if (hasFengshui) {
            childQuestions.push(`根据风水分析，孩子的文昌位在哪里？`);
            if (result.rooms?.study) {
              childQuestions.push(`学习区应该如何布置才能提升专注力？`);
            }
          }
          const shuffled = childQuestions.sort(() => 0.5 - Math.random());
          suggestions.push(...shuffled.slice(0, 3));
        } else if (age < 18) {
          // 青少年 - 基于实际八字生成
          const teenQuestions = [
            `${dayMaster}日主的我，未来适合从事哪个领域的工作？`,
            `${age}岁${dayMaster}日主的${personal?.gender === 'male' ? '男生' : '女生'}，如何提升学业运？`,
            `我的${dayMaster}性格有哪些优势？应该注意哪些短板？`,
            `${dayMaster}日主的人，高中阶段最需要关注哪些方面？`,
            yongshen ? `如何利用${yongshen}属性提升我的学业和人际关系？` : null,
            pattern ? `${pattern}格局的我，适合读理科还是文科？` : null,
            strongestElement
              ? `我${strongestElement}属性特别突出，这对升学有什么影响？`
              : null,
            weakestDimensions[0]
              ? `如何改善我的${weakestDimensions[0]}方面？`
              : null,
          ].filter((q): q is string => typeof q === 'string');
          if (hasFengshui) {
            teenQuestions.push(`我的房间应该如何布置才能助力学业？`);
            if (result.xuankong) {
              teenQuestions.push(`根据飞星风水，我的书桌应该放在哪个方位？`);
            }
          }
          const shuffled = teenQuestions.sort(() => 0.5 - Math.random());
          suggestions.push(...shuffled.slice(0, 3));
        } else if (age >= 18 && age < 30) {
          // 青年 - 基于实际八字生成
          const youthQuestions = [
            `${age}岁${dayMaster}日主的我，现阶段适合创业还是打工？`,
            `${dayMaster}日主的人，在职场上如何发挥优势？`,
            `今年${currentYear}年，我的桃花运和感情运如何？`,
            `${dayMaster}日主的${personal?.gender === 'male' ? '男性' : '女性'}，如何快速积累第一桶金？`,
            yongshen
              ? `如何通过${yongshen}方位和${yongshen}属性提升事业运？`
              : null,
            pattern ? `我的${pattern}格局在职业选择上有什么指导意义？` : null,
            strongestElement
              ? `我${strongestElement}属性较强，应该选择哪些行业？`
              : null,
            weakestDimensions[0]
              ? `我的${weakestDimensions[0]}方面较弱，如何通过风水改善？`
              : null,
          ].filter((q): q is string => typeof q === 'string');
          if (hasFengshui) {
            youthQuestions.push(`根据我的风水格局，工作位应该在哪个方位？`);
          }
          if (warnings.length > 0 && warnings[0].category) {
            youthQuestions.push(`如何防范${warnings[0].category}方面的问题？`);
          }
          const shuffled = youthQuestions.sort(() => 0.5 - Math.random());
          suggestions.push(...shuffled.slice(0, 3));
        } else if (age >= 30 && age <= 45) {
          // 中青年 - 基于实际八字生成
          const middleAgeQuestions = [
            `${age}岁${dayMaster}日主的我，大运什么时候转换？`,
            `${dayMaster}日主在中年阶段，如何突破财运瓶颈？`,
            `我的${dayMaster}日主，${currentYear}年有哪些重大机遇？`,
            `${personal?.gender === 'male' ? '男性' : '女性'}${dayMaster}日主，如何平衡事业和家庭？`,
            yongshen
              ? `${yongshen}为用神，如何布置家居和办公室提升财运？`
              : null,
            pattern
              ? `我的${pattern}格局在中年阶段如何布局才能大展宏图？`
              : null,
            weakestElement
              ? `我${weakestElement}属性较弱，如何补救提升运势？`
              : null,
            weakestDimensions[0]
              ? `如何改善我的${weakestDimensions[0]}运势？`
              : null,
            weakestDimensions[1]
              ? `${weakestDimensions[1]}方面需要重点关注什么？`
              : null,
          ].filter((q): q is string => typeof q === 'string');
          if (hasFengshui) {
            middleAgeQuestions.push(`根据风水分析，我的财位和事业位在哪？`);
            if (result.rooms?.office) {
              middleAgeQuestions.push(`我的办公室应该如何布置才能提升事业运？`);
            }
          }
          if (warnings.length > 0) {
            warnings.slice(0, 2).forEach((w: any) => {
              if (w.category && w.severity === 'critical') {
                middleAgeQuestions.push(
                  `如何解决${w.category}方面的重大隐患？`
                );
              }
            });
          }
          const shuffled = middleAgeQuestions.sort(() => 0.5 - Math.random());
          suggestions.push(...shuffled.slice(0, 3));
        } else {
          // 中老年 - 基于实际八字生成
          const seniorQuestions = [
            `${dayMaster}日主的我，如何保持身心健康和长寿？`,
            `${age}岁${dayMaster}日主，晚年运势如何？需要注意什么？`,
            `如何为子女布局，让家族运势更加兴旺？`,
            yongshen
              ? `${yongshen}为用神，晚年如何通过风水调整提升健康？`
              : null,
            pattern ? `我的${pattern}格局，晚年阶段如何安享天年？` : null,
            weakestElement
              ? `${weakestElement}属性较弱，如何补救保持健康？`
              : null,
            weakestDimensions.find((d: string) => d === 'health')
              ? `如何通过风水改善健康运势？`
              : null,
          ].filter((q): q is string => typeof q === 'string');
          if (hasFengshui) {
            seniorQuestions.push(`根据家居风水，卧室应该如何布置才利于健康？`);
            if (result.rooms?.bedroom) {
              seniorQuestions.push(`卧室的床位应该朝向哪个方位才利于休息？`);
            }
          }
          if (warnings.length > 0) {
            warnings.slice(0, 2).forEach((w: any) => {
              if (
                w.category &&
                ['health', '健康', '疾病'].includes(w.category)
              ) {
                seniorQuestions.push(`如何预防${w.category}方面的风险？`);
              }
            });
          }
          const shuffled = seniorQuestions.sort(() => 0.5 - Math.random());
          suggestions.push(...shuffled.slice(0, 3));
        }
      }

      if (personal?.gender === 'female' && suggestions.length < 3) {
        suggestions.push('女性如何旺夫益子？');
      }
    }

    // 基于预警生成建议
    if (result.warnings && result.warnings.length > 0) {
      const criticalWarning = result.warnings.find(
        (w: any) => w.severity === 'critical'
      );
      if (criticalWarning && suggestions.length < 3) {
        suggestions.push(`如何化解${criticalWarning.category}方面的问题？`);
      }
    }

    // 确保至少有3个问题
    if (suggestions.length < 3) {
      const fallbackQuestions = [
        '今年流年运势如何？',
        '有什么需要特别注意的吗？',
        '我的贵人方位在哪里？',
      ];

      fallbackQuestions.forEach((q) => {
        if (suggestions.length < 3 && !suggestions.includes(q)) {
          suggestions.push(q);
        }
      });
    }

    return suggestions.slice(0, 3);
  };

  // 发送消息（支持上下文 + 流式渲染 + RAG）
  const handleSend = async (content: string) => {
    if (!content.trim()) return;

    // 会话计费模式: 检查状态
    if (enableSessionBilling) {
      if (sessionStatus === 'none') {
        // 未创建会话
        toast({
          title: '请先开启会话',
          description: `需要 ${sessionCost} 积分开启 ${sessionDuration} 分钟会话`,
        });
        return;
      }
      if (sessionStatus === 'expired') {
        // 会话已过期
        toast({
          title: '会话已过期',
          description: '请续费后继续对话',
          variant: 'destructive',
        });
        return;
      }
    }

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // 创建 AI 消息占位符（"正在思考..."）
    const aiMessageId = `${Date.now()}-ai`;
    const aiPlaceholder: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isThinking: true,
    };

    setMessages((prev) => [...prev, aiPlaceholder]);
    setIsTyping(true);

    // 创建 AbortController 用于取消请求
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // 如果启用了 RAG，使用 RAG Action
      if (enableRAG) {
        const response = await ragChatAction({
          query: content.trim(),
          sessionId: sessionId || undefined,
          enableRAG: true,
          category: ragCategory,
          topK: 5,
          temperature: 0.7,
        });

        if (!response.success || !response.answer) {
          throw new Error(response.error || '生成失败');
        }

        // 更新 AI 消息
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content: response.answer,
                  references: response.references as any,
                  ragEnabled: true,
                  isThinking: false,
                }
              : msg
          )
        );
      } else {
        // 原有流式聊天逻辑
        // 构建带上下文的消息历史
        const messagesWithContext = [...messages, userMessage].map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        // 如果启用了上下文且有可用的上下文数据，添加上下文信息
        let contextSummary = '';
        if (contextEnabled && analysisContext) {
          contextSummary = analysisContext.getAIContextSummary();
          console.log('📤 [AI-Chat] 发送流式请求:');
          console.log('  - 消息数:', messages.length + 1);
          console.log('  - 上下文长度:', contextSummary.length);
        }

        // 使用流式聊天
        await streamChat(messagesWithContext, contextSummary, {
          signal: controller.signal,
          onStart: () => {
            console.log('🚀 [Stream] 开始接收数据');
            // 移除 "正在思考..." 状态
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId ? { ...msg, isThinking: false } : msg
              )
            );
          },
          onUpdate: (content) => {
            // 实时更新 AI 消息内容（逐字显示）
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? { ...msg, content, isThinking: false }
                  : msg
              )
            );
          },
          onFinish: () => {
            console.log('✅ [Stream] 接收完成');
            setIsTyping(false);
          },
          onError: (error) => {
            console.error('❌ [Stream] 错误:', error);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? {
                      ...msg,
                      content: `抱歉，${error.message || '服务暂时不可用，请稍后再试。'}`,
                      isThinking: false,
                    }
                  : msg
              )
            );
          },
        });
      }
    } catch (error) {
      console.error('AI chat error:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: '抱歉，服务暂时不可用，请稍后再试。',
                isThinking: false,
              }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  // 点击推荐问题
  const handleSuggestedClick = (question: string) => {
    handleSend(question);
  };

  // 复制消息
  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 分享消息
  const handleShareMessage = async (content: string) => {
    const shareText = `AI风水大师回答：\n\n${content}\n\n✨ 来自气流AI智能分析`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI风水大师回答',
          text: shareText,
        });
      } catch (error) {
        console.error('分享失败:', error);
        // 备用方案：复制到剪切板
        handleCopyMessage('share', shareText);
      }
    } else {
      // 备用方案：复制到剪切板
      handleCopyMessage('share', shareText);
    }
  };

  // 生成关联话题
  const getRelatedTopics = (messageContent: string): string[] => {
    // 基于消息内容智能生成关联话题
    const topics = [
      '我的财位在哪个方向？如何激活？',
      '什么样的风水布局能提升我的事业运？',
      '我需要避开哪些风水禁忌？',
      '如何通过风水改善我的人际关系？',
      '下个月我的最佳出行时间和方向？',
    ];

    // 根据当前消息内容智能选择相关话题
    if (messageContent.includes('财')) {
      return [
        '我的偏财运什么时候最旺？',
        '如何通过风水布局增加被动收入？',
        '投资理财需要注意哪些时间节点？',
      ];
    }

    if (messageContent.includes('健康') || messageContent.includes('身体')) {
      return [
        '我的健康运势在哪个季节需要特别关注？',
        '家中哪个位置对我的健康最有利？',
        '我需要佩戴什么属性的长寿物品？',
      ];
    }

    return topics.slice(0, 3);
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
                  {enableSessionBilling ? (
                    sessionStatus === 'active' ? (
                      <>
                        <Clock className="w-3 h-3" />
                        <span
                          className={
                            remainingMs <= 60000
                              ? 'text-red-300 font-bold'
                              : remainingMs <= 5 * 60000
                                ? 'text-yellow-300'
                                : ''
                          }
                        >
                          {formatRemainingTime(remainingMs)}
                        </span>
                      </>
                    ) : sessionStatus === 'expired' ? (
                      <span className="text-red-300">会话已过期</span>
                    ) : (
                      <span>未开启会话</span>
                    )
                  ) : (
                    <>
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
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {enableSessionBilling &&
                (sessionStatus === 'active' || sessionStatus === 'expired') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRenewSession}
                    className="text-white hover:bg-white/20"
                    title="续费会话"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                )}
              {hasContext && !enableSessionBilling && (
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
              {!enableSessionBilling && (
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
              )}
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
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
          >
            {messages.map((message, index) => (
              <div key={message.id}>
                <div
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-white border border-gray-200 rounded-bl-sm'
                    }`}
                  >
                    {message.isThinking ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                        <span className="text-sm text-gray-600">
                          AI 正在思考...
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content || '​'}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p
                        className={`text-xs ${message.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString(
                          'zh-CN',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </p>

                      {/* 消息操作按钮 */}
                      {message.role === 'assistant' &&
                        !message.isThinking &&
                        message.content && (
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() =>
                                handleCopyMessage(message.id, message.content)
                              }
                              className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
                              title="复制回答"
                            >
                              {copiedMessageId === message.id ? (
                                <span className="text-xs text-green-600">
                                  ✓
                                </span>
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                handleShareMessage(message.content)
                              }
                              className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
                              title="分享回答"
                            >
                              <Share2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() =>
                                setShowRelatedTopics((prev) => ({
                                  ...prev,
                                  [message.id]: !prev[message.id],
                                }))
                              }
                              className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
                              title="相关话题"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                {/* RAG 知识引用 */}
                {message.role === 'assistant' &&
                  message.references &&
                  message.references.length > 0 && (
                    <div className="ml-4 mt-2">
                      <KnowledgeReferenceMini
                        references={message.references}
                        onReferenceClick={(ref) => {
                          console.log('📚 [RAG] 点击引用:', ref);
                          // 可以添加点击引用的处理逻辑
                        }}
                      />
                    </div>
                  )}

                {/* 关联话题推荐 */}
                {message.role === 'assistant' &&
                  showRelatedTopics[message.id] && (
                    <div className="ml-4 mt-2 p-3 bg-white rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-600 mb-2">
                        🔗 您可能还想知道：
                      </p>
                      <div className="space-y-1">
                        {getRelatedTopics(message.content).map(
                          (topic, topicIndex) => (
                            <button
                              key={topicIndex}
                              onClick={() => {
                                handleSend(topic);
                                setShowRelatedTopics((prev) => ({
                                  ...prev,
                                  [message.id]: false,
                                }));
                              }}
                              className="block w-full text-left text-xs text-purple-700 hover:text-purple-900 hover:bg-purple-50 p-2 rounded transition-colors"
                            >
                              • {topic}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
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
            {enableSessionBilling && sessionStatus === 'none' ? (
              <div className="text-center">
                <Button
                  onClick={handleCreateSession}
                  disabled={isCreatingSession}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  {isCreatingSession ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      创建中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      开启会话 ({sessionCost} 积分 / {sessionDuration}分钟)
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-2">开启后即可开始对话</p>
              </div>
            ) : enableSessionBilling && sessionStatus === 'expired' ? (
              <div className="text-center">
                <p className="text-sm text-red-600 mb-2">会话已过期</p>
                <Button
                  onClick={handleRenewSession}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  续费会话 ({sessionCost} 积分 / {sessionDuration}分钟)
                </Button>
              </div>
            ) : (
              <>
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
                    disabled={
                      enableSessionBilling && sessionStatus !== 'active'
                    }
                  />
                  <Button
                    onClick={() => handleSend(inputValue)}
                    disabled={
                      !inputValue.trim() ||
                      (enableSessionBilling && sessionStatus !== 'active')
                    }
                    className="rounded-full w-10 h-10 p-0 bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                {(hasContext || enableRAG) && !enableSessionBilling && (
                  <p className="text-xs text-center text-gray-500 mt-2">
                    {enableRAG
                      ? '📚 知识增强模式'
                      : contextEnabled
                        ? '✨ 智能模式已启用'
                        : '普通对话模式'}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
