import { ConversationStateMachine } from '../state-machine';
import type { ConversationContext } from '../types/conversation';
import type {
  StateMachineConfig,
  StateTransition,
} from '../types/state-machine';

type TransitionRule = StateTransition & { description: string };

const hasCollectedBirthInfo = (context: ConversationContext) =>
  Boolean(context.userProfile.baziData);

const hasCompletedAnalysis = (context: ConversationContext) =>
  context.metadata.analysisCount > 0;

const shouldCloseSession = (context: ConversationContext) =>
  context.metadata.sessionDuration > 300 ||
  context.metadata.totalMessages >= 12;

export const baseStateMachineConfig: StateMachineConfig = {
  initialState: 'greeting',
  states: {
    greeting: {
      transitions: ['collecting_info'],
    },
    collecting_info: {
      transitions: ['analyzing', 'greeting'],
      timeout: 180000,
    },
    analyzing: {
      transitions: ['explaining', 'deepdive'],
    },
    explaining: {
      transitions: ['recommending', 'deepdive', 'closure'],
    },
    recommending: {
      transitions: ['closure', 'deepdive'],
    },
    deepdive: {
      transitions: ['explaining', 'recommending', 'expert_handoff'],
    },
    closure: {
      transitions: ['greeting'],
    },
    expert_handoff: {
      transitions: ['closure'],
    },
    error: {
      transitions: ['greeting'],
    },
  },
  transitions: [],
};

const transitionRules: TransitionRule[] = [
  {
    from: 'greeting',
    to: 'collecting_info',
    condition: () => true,
    description: '首次问候后进入信息采集',
  },
  {
    from: 'collecting_info',
    to: 'analyzing',
    condition: hasCollectedBirthInfo,
    description: '采集到完整的八字或风水信息后开始分析',
  },
  {
    from: 'collecting_info',
    to: 'greeting',
    condition: (context) =>
      !hasCollectedBirthInfo(context) && context.metadata.totalMessages > 3,
    description: '信息不足时回到问候环节以调整策略',
  },
  {
    from: 'analyzing',
    to: 'explaining',
    condition: hasCompletedAnalysis,
    description: '生成首轮分析结果后输出解释',
  },
  {
    from: 'explaining',
    to: 'recommending',
    condition: hasCompletedAnalysis,
    description: '解释完成后给出建议与行动项',
  },
  {
    from: 'explaining',
    to: 'deepdive',
    condition: (context) => context.metadata.analysisCount > 1,
    description: '用户对细节追问时进入深度讲解模式',
  },
  {
    from: 'recommending',
    to: 'closure',
    condition: shouldCloseSession,
    description: '满足时长或消息数条件后进入收尾',
  },
  {
    from: 'recommending',
    to: 'deepdive',
    condition: (context) => context.topicTags?.includes('fengshui') ?? false,
    description: '在风水主题下可进入深度推荐',
  },
  {
    from: 'deepdive',
    to: 'expert_handoff',
    condition: (context) => (context.metadata.analysisCount ?? 0) > 2,
    description: '多轮分析后建议转交人工专家',
    action: async () => {
      // TODO: 在后续任务中接入专家预约队列
    },
  },
  {
    from: 'deepdive',
    to: 'explaining',
    condition: () => true,
    description: '深度模式结束后回到解释阶段',
  },
  {
    from: 'expert_handoff',
    to: 'closure',
    condition: () => true,
    description: '完成转接后进入收尾',
  },
  {
    from: 'closure',
    to: 'greeting',
    condition: () => true,
    description: '会话结束后可重新开始',
  },
];

const mapRulesToTransitions = (rules: TransitionRule[]): StateTransition[] =>
  rules.map(({ description, ...transition }) => transition);

export const defaultStateMachineConfig: StateMachineConfig = {
  ...baseStateMachineConfig,
  transitions: mapRulesToTransitions(transitionRules),
};

export const createDefaultStateMachine = (): ConversationStateMachine =>
  new ConversationStateMachine(defaultStateMachineConfig);

export const describeTransitionRules = (): TransitionRule[] => [
  ...transitionRules,
];
