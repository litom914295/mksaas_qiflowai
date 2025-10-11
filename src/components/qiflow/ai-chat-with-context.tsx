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
import { Copy, ExternalLink, Info, MessageCircle, Send, Share2, Sparkles, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showRelatedTopics, setShowRelatedTopics] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 新增: 标记是否已激活（用于避免重复激活）
  const hasActivated = useRef(false);

  // 根据八字信息生成个性化欢迎消息
  const getWelcomeMessage = (): string => {
    if (welcomeMessage) return welcomeMessage;

    console.log('🔍 [Welcome] 生成欢迎语 - analysisContext:', analysisContext);
    console.log('🔍 [Welcome] userInput:', analysisContext?.userInput);
    console.log('🔍 [Welcome] analysisResult:', !!analysisContext?.analysisResult);

    if (analysisContext?.userInput) {
      const { personal } = analysisContext.userInput;
      // 获取姓名和性别
      const name = personal.name || '';
      const gender = personal.gender === 'male' ? '先生' : '女士';
      const title = name ? `${name}${gender}` : `这位${gender}`;
      
      console.log('🔍 [Welcome] name:', name, 'gender:', gender, 'title:', title);

      // 如果有分析结果，生成基于八字的个性化欢迎语
      if (analysisContext.analysisResult) {
        const result = analysisContext.analysisResult;
        let personalizedGreeting = '';
        
        console.log('🔍 [Welcome] 分析结果:', result);
        
        // 基于八字四柱生成个性化内容
        if (result.pillars) {
          const dayMaster = result.pillars.day?.heavenlyStem || result.pillars.day?.stem;
          const elements = result.elements;
          
          console.log('🔍 [Welcome] dayMaster:', dayMaster, 'elements:', elements);
          
          if (dayMaster) {
            const elementNames: Record<string, string> = {
              '甲': '甲木', '乙': '乙木',
              '丙': '丙火', '丁': '丁火', 
              '戊': '戊土', '己': '己土',
              '庚': '庚金', '辛': '辛金',
              '壬': '壬水', '癸': '癸水'
            };
            
            const dayMasterName = elementNames[dayMaster] || dayMaster;
            personalizedGreeting += `您的日主是${dayMasterName}，`;
          }
          
          // 根据五行强弱生成个性化描述
          if (elements) {
            const strongElements = Object.entries(elements)
              .filter(([, strength]) => typeof strength === 'number' && strength > 2)
              .map(([element]) => element);
              
            if (strongElements.length > 0) {
              const elementMap: Record<string, string> = {
                'WOOD': '木', 'FIRE': '火', 'EARTH': '土', 'METAL': '金', 'WATER': '水'
              };
              const strongElementNames = strongElements.map(e => elementMap[e] || e).join('、');
              personalizedGreeting += `${strongElementNames}较旺，`;
            }
          }
        }
        
        // 基于用神生成建议
        if (result.yongshen) {
          const yongshenMap: Record<string, string> = {
            'WOOD': '木', 'FIRE': '火', 'EARTH': '土', 'METAL': '金', 'WATER': '水'
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
        const birthYear = personal?.birthYear || (personal?.birthDate ? new Date(personal.birthDate).getFullYear() : 1973);
        const age = currentYear - birthYear;
        
        // 基于日主特征的核心洞察
        if (result.pillars?.day?.stem) {
          const dayMaster = result.pillars.day.stem;
          const insightMap: Record<string, string> = {
            '甲': '您天生具备领导气质，但需防止过于强势',
            '乙': '您性情温和包容，但要注意增强决断力',
            '丙': '您热情阳光，但需控制情绪波动',
            '丁': '您心思细腻敏感，善于洞察人心',
            '戊': '您稳重可靠，是天生的组织管理者',
            '己': '您包容力强，但要避免过度牺牲自己',
            '庚': '您意志坚定果断，但需平衡刚柔并济',
            '辛': '您追求完美精致，具有很强的审美能力',
            '壬': '您智慧如海，善于谋略但要防止多虑',
            '癸': '您如甘露般滋润他人，直觉力极强但需增强自信'
          };
          coreInsight = insightMap[dayMaster] || '';
        }
        
        const finalWelcome = `您好${title}！\n\n🔮 ${personalizedGreeting}${coreInsight}\n\n✨ 结合您的八字与${currentYear}年九运能量，我发现了几个关键运势转折点。准备好深入了解您的命运密码了吗？`;
        console.log('👋 [Welcome] 最终欢迎语:', finalWelcome);
        return finalWelcome;
      }
      
      // 只有用户输入，没有分析结果
      const birthInfo = personal.birthDate ? 
        `出生于${new Date(personal.birthDate).getFullYear()}年` : '';
      
      const noResultWelcome = `您好${title}！${birthInfo ? `我看到您${birthInfo}，` : ''}已经填写了基本信息。正在为您准备八字分析，请稍等片刻。在此期间，我可以先为您解答一些命理问题。`;
      console.log('👋 [Welcome] 无结果欢迎语:', noResultWelcome);
      return noResultWelcome;
    }

    const defaultWelcome = '您好！我是AI风水大师，有什么可以帮您的吗？\n\n💡 提示：如果您已经填写了个人信息和房屋信息，我会自动了解这些内容，为您提供更精准的建议。';
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
        setMessages(prev => [
          { ...prev[0], content: newWelcomeMsg },
          ...prev.slice(1)
        ]);
      }
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

  // 生成基于八字信息的个性化建议问题
  const getContextualSuggestions = (): string[] => {
    const suggestions: string[] = [];
    
    // 如果没有分析结果，但有用户输入，生成基础个性化问题
    if (!analysisContext?.analysisResult && analysisContext?.userInput) {
      const { personal } = analysisContext.userInput;
      const currentYear = new Date().getFullYear();
      const birthYear = personal.birthDate ? new Date(personal.birthDate).getFullYear() : null;
      
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
      
      if (personal.gender === 'male') {
        suggestions.push('男性在风水上有什么特别讲究？');
      } else {
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
    
    if (result.pillars) {
      const dayMaster = result.pillars.day?.heavenlyStem || result.pillars.day?.stem;
      const birthYear = personal?.birthYear || personal?.birthDate ? new Date(personal.birthDate).getFullYear() : 2000;
      const age = currentYear - birthYear;
      
      if (dayMaster) {
        // 基于具体八字特征的超精准问题生成
        const isMiddleAge = age > 45;
        const currentSeason = currentMonth <= 3 ? '春' : currentMonth <= 6 ? '夏' : currentMonth <= 9 ? '秋' : '冬';
        
        const urgentQuestions: Record<string, string[]> = {
          '癸': [ // 针对癸水日主的超精准问题
            `作为1973年癸水命，我在${currentYear}年的最大财运爆发期是几月？`,
            `${age}岁的我如何利用癸水的直觉天赋在投资中获利？`
          ],
          '壬': [
            `壬水日主的我，在${isMiddleAge ? '知命之年' : '不惑之年'}如何发挥最大谋略优势？`,
            `${currentSeason}季我的智慧运势最旺时，应该在哪些领域发力？`
          ],
          '丁': [
            `${birthYear}年生的丁火命，今年最适合在哪个方向发展创意事业？`,
            `我的丁火精细特质在${age > 40 ? '中年' : '壮年'}阶段如何变现金？`
          ],
          '丙': [
            `丙火日主的我，在${currentYear}年如何避免热情过度导致的投资失误？`,
            `${age}岁的丙火命最需要在哪个时间段冷静思考？`
          ],
          '戊': [
            `${birthYear}年戊土命的我，在今年如何利用稳重特质在房产上获利？`,
            `作为戊土日主，我的领导才能在${age > 50 ? '知命后' : '不惑后'}如何再上层楼？`
          ],
          '己': [
            `己土日主${age}岁了，如何在不伤害关系的前提下获得应有回报？`,
            `我的己土包容特质在${currentSeason}季如何转化为事业优势？`
          ],
          '庚': [
            `${birthYear}年庚金命的我，在${currentYear}年最需要避开哪些刚易折的大坑？`,
            `庚金日主${age}岁的意志力峠峰期，应该在哪个领域全力出击？`
          ],
          '辛': [
            `辛金日主的我，在${isMiddleAge ? '人生下半场' : '壮年时期'}如何精雕细琢？`,
            `${age}岁的辛金命最适合在哪个精细领域成为专家？`
          ],
          '甲': [
            `${birthYear}年甲木命的我，在${currentYear}年如何利用领导天赋获得突破？`,
            `甲木日主${age}岁了，该在哪个领域发挥开拓者的优势？`
          ],
          '乙': [
            `乙木日主的我，${age}岁后如何让温和性格成为最大竞争力？`,
            `${currentSeason}季我的乙木特质最适合在哪些行业发光发热？`
          ]
        };
        
        const urgentSuggestions = urgentQuestions[dayMaster];
        if (urgentSuggestions) {
          // 选择最紧迫的问题
          suggestions.push(urgentSuggestions[0]);
        }
      }
    }
    
    // 基于用神生成超精准开运问题（结合具体八字和时间）
    if (result.yongshen && suggestions.length < 3) {
      const birthYear = personal?.birthYear || personal?.birthDate ? new Date(personal.birthDate).getFullYear() : 2000;
      const age = currentYear - birthYear;
      const currentSeason = currentMonth <= 3 ? '春' : currentMonth <= 6 ? '夏' : currentMonth <= 9 ? '秋' : '冬';
      const yongshenUrgentQuestions: Record<string, string> = {
        'WOOD': `${age > 45 ? '知命之年' : '不惑之年'}的我，在${currentMonth}月穿绿衣在东方办公能立即提升财运吗？`,
        'FIRE': `作为${result.pillars?.day?.stem || ''}日主，我在家中南方放红色物品能在${currentYear}年激活事业运吗？`,
        'EARTH': `${age}岁的我穿黄色在中宫位放紫水晶，能否在${currentSeason}季引来意外之财？`,
        'METAL': `我的${result.pillars?.day?.stem || ''}金命在西北方佩戴金饰，能在今年提升权威和地位吗？`,
        'WATER': `${birthYear || 1973}年生的我穿蓝黑色在北方学习，能否激发最强直觉力？`
      };
      
      const yongshenQuestion = yongshenUrgentQuestions[result.yongshen];
      if (yongshenQuestion) {
        suggestions.push(yongshenQuestion);
      }
    }
    
    // 基于当前流年大运和具体八字的紧迫问题
    if (suggestions.length < 3 && personal) {
      const birthYear = personal.birthYear || 2000;
      const age = currentYear - birthYear;
      const dayMaster = result.pillars?.day?.stem || '未知';
      const currentDayunAge = Math.floor((age - 8) / 10) * 10 + 8; // 简化大运计算
      
      // 结合日主、年龄、流年的超精准问题
      const timelyUrgentQuestions = {
        10: `作为${dayMaster}日主，我在${currentYear}年${currentMonth}月的财库开启日期是什么时候？`,
        11: `${age}岁的${dayMaster}命人，在近期需要特别关注哪些健康隐患？`,
        12: `我的${dayMaster}${personal.gender === 'male' ? '男' : '女'}命，下个月哪天是最佳谈判日期？`,
        1: `${birthYear || 1973}年${dayMaster}命在${currentYear + 1}年的最大机遇和挑战各是什么？`,
        2: `我的${dayMaster}日主在春季前后需要做哪些重要决定？`,
        3: `${age}岁了，我这个${dayMaster}命最适合在哪个领域成为意见领袖？`,
        4: `作为${dayMaster}命人，我在夏季前的运势变化详细分析？`,
        5: `${currentYear}年我这个${dayMaster}${personal.gender === 'male' ? '男' : '女'}命的贵人在哪个方位？`,
        6: `${dayMaster}日主${age}岁，在今年下半年最大的转机在哪里？`,
        7: `我的${dayMaster}命格在秋季需要特别防范哪些风险？`,
        8: `${birthYear || 1973}年生的${dayMaster}命，在中秋后的事业走向如何？`,
        9: `${age}岁的${dayMaster}日主，在国庆后的重大机遇在哪里？`
      };
      
      const monthlyQuestion = timelyUrgentQuestions[currentMonth as keyof typeof timelyUrgentQuestions] || 
        `${dayMaster}日主的我，在${currentMonth}月份最需要关注什么运势变化？`;
      
      suggestions.push(monthlyQuestion);
    }

    // 基于评分生成建议
    if (result.scoring) {
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
      const birthYear = personal.birthDate ? new Date(personal.birthDate).getFullYear() : null;
      
      if (birthYear) {
        const age = currentYear - birthYear;
        if (age >= 30 && age <= 45) {
          suggestions.push('我的大运什么时候转换？');
        }
      }
      
      if (personal.gender === 'female' && suggestions.length < 3) {
        suggestions.push('女性如何旺夫益子？');
      }
    }

    // 基于预警生成建议
    if (result.warnings && result.warnings.length > 0) {
      const criticalWarning = result.warnings.find(
        (w) => w.severity === 'critical'
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
        '我的贵人方位在哪里？'
      ];
      
      fallbackQuestions.forEach(q => {
        if (suggestions.length < 3 && !suggestions.includes(q)) {
          suggestions.push(q);
        }
      });
    }

    return suggestions.slice(0, 3);
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
        console.log('  - 上下文预览:', contextSummary.substring(0, 300));
        console.log('🔍 [DEBUG] 完整上下文内容:', contextSummary);
        console.log('🔍 [DEBUG] analysisContext对象:', {
          userInput: analysisContext.userInput,
          analysisResult: analysisContext.analysisResult,
          isActivated: analysisContext.isAIChatActivated
        });
      } else {
        console.log('⚠️ [AI-Chat] 未启用上下文');
        console.log('  - contextEnabled:', contextEnabled);
        console.log('  - analysisContext存在:', !!analysisContext);
        if (analysisContext) {
          console.log('  - userInput:', analysisContext.userInput);
          console.log('  - analysisResult:', analysisContext.analysisResult);
        }
      }

      // 调用 AI API
      const requestPayload = {
        messages: messagesWithContext,
        context: contextSummary || undefined,
        enableContext: contextEnabled && !!contextSummary,
      };
      
      console.log('🚀 [AI-Chat] 完整请求载荷:', JSON.stringify(requestPayload, null, 2));
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      }).catch(error => {
        console.error('🌐 [AI-Chat] 网络请求失败:', error);
        throw new Error(`网络请求失败: ${error.message}`);
      });

      console.log('📨 [AI-Chat] 响应状态:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [AI-Chat] API响应错误:', response.status, errorText);
        throw new Error(`API请求失败 (${response.status}): ${errorText}`);
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
          text: shareText
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
      '下个月我的最佳出行时间和方向？'
    ];
    
    // 根据当前消息内容智能选择相关话题
    if (messageContent.includes('财')) {
      return [
        '我的偏财运什么时候最旺？',
        '如何通过风水布局增加被动收入？',
        '投资理财需要注意哪些时间节点？'
      ];
    }
    
    if (messageContent.includes('健康') || messageContent.includes('身体')) {
      return [
        '我的健康运势在哪个季节需要特别关注？',
        '家中哪个位置对我的健康最有利？',
        '我需要佩戴什么属性的长寿物品？'
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
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p
                        className={`text-xs ${message.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      
                      {/* 消息操作按钮 */}
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => handleCopyMessage(message.id, message.content)}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
                            title="复制回答"
                          >
                            {copiedMessageId === message.id ? (
                              <span className="text-xs text-green-600">✓</span>
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          <button
                            onClick={() => handleShareMessage(message.content)}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
                            title="分享回答"
                          >
                            <Share2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setShowRelatedTopics(prev => ({
                              ...prev,
                              [message.id]: !prev[message.id]
                            }))}
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
                
                {/* 关联话题推荐 */}
                {message.role === 'assistant' && showRelatedTopics[message.id] && (
                  <div className="ml-4 mt-2 p-3 bg-white rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-600 mb-2">🔗 您可能还想知道：</p>
                    <div className="space-y-1">
                      {getRelatedTopics(message.content).map((topic, topicIndex) => (
                        <button
                          key={topicIndex}
                          onClick={() => {
                            handleSend(topic);
                            setShowRelatedTopics(prev => ({ ...prev, [message.id]: false }));
                          }}
                          className="block w-full text-left text-xs text-purple-700 hover:text-purple-900 hover:bg-purple-50 p-2 rounded transition-colors"
                        >
                          • {topic}
                        </button>
                      ))}
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
