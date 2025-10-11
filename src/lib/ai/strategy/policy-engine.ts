import type {
  ConversationContext,
  ConversationStateType,
} from '../types/conversation';

export interface PolicyDecision {
  nextState: ConversationStateType;
  reasoning: string;
  confidence: number;
  actions: Array<'ask_more' | 'analyze' | 'summarize' | 'handoff'>;
}

export interface PolicyEngine {
  evaluate(context: ConversationContext): Promise<PolicyDecision>;
}

const clampConfidence = (value: number): number => {
  if (Number.isNaN(value)) {
    return 0.5;
  }
  return Math.max(0, Math.min(1, value));
};

export class RuleBasedPolicyEngine implements PolicyEngine {
  async evaluate(context: ConversationContext): Promise<PolicyDecision> {
    // Ensure metadata and baziData are safely accessed
    const baziData = context.userProfile?.baziData;
    const analysisCount = context.metadata?.analysisCount ?? 0; // Default to 0 if undefined

    if (
      !baziData ||
      typeof baziData !== 'object' ||
      Object.keys(baziData).length === 0
    ) {
      return {
        nextState: 'collecting_info',
        reasoning: '尚未收集出生或房屋信息，需要继续提问。',
        confidence: 0.6,
        actions: ['ask_more'],
      };
    }

    // 检查必要的八字字段是否存在
    const requiredFields = ['year', 'month', 'day', 'hour', 'gender'];
    const hasRequiredFields = requiredFields.every(
      (field) =>
        baziData[field] !== undefined &&
        baziData[field] !== null &&
        baziData[field] !== ''
    );

    if (!hasRequiredFields) {
      return {
        nextState: 'collecting_info',
        reasoning: '八字信息不完整，需要补充必要信息。',
        confidence: 0.6,
        actions: ['ask_more'],
      };
    }

    if (analysisCount <= 0) {
      // Treat negative counts as 0
      return {
        nextState: 'analyzing',
        reasoning: '具备分析输入，准备执行八字/风水算法。',
        confidence: 0.8,
        actions: ['analyze'],
      };
    }

    const shouldEscalate = (context?.topicTags ?? []).includes(
      'expert-handoff'
    );
    if (shouldEscalate) {
      return {
        nextState: 'expert_handoff',
        reasoning: '用户需求较为复杂，建议转交人工专家。',
        confidence: 0.7,
        actions: ['handoff'],
      };
    }

    return {
      nextState: 'recommending',
      reasoning: '已有分析结果，可进入建议阶段。',
      confidence: clampConfidence(0.7 + Math.min(analysisCount, 3) * 0.05),
      actions: ['summarize'],
    };
  }
}
