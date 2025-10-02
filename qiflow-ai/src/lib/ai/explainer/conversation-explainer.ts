import type { IntegratedResponse } from '../algorithm-integration-service';
import type { ConversationContext } from '../types/conversation';

export interface ExplanationResult {
  summary: string;
  highlights: string[];
  nextSteps: string[];
}

const DEFAULT_NEXT_STEP = '请继续提供更多信息，以便获得更精准的建议。';

export const buildExplanation = (
  response: IntegratedResponse,
  context?: ConversationContext
): ExplanationResult => {
  const summary =
    response.summary ??
    response.aiResponse?.choices?.[0]?.message?.content ??
    '暂无总结';
  const highlights = response.highlights ?? ['重点依据：算法与上下文决策'];
  const nextSteps = response.nextSteps ?? thisFallbackSteps(context);

  return {
    summary,
    highlights,
    nextSteps,
  };
};

const thisFallbackSteps = (context?: ConversationContext): string[] => {
  if (!context) {
    return [DEFAULT_NEXT_STEP];
  }

  if (!context.userProfile.baziData) {
    return ['请补充出生时间/地点信息，以便完成八字分析。'];
  }

  if ((context.topicTags ?? []).includes('fengshui')) {
    return ['可上传户型图或房屋朝向，帮助我们给出更精细的风水建议。'];
  }

  return [DEFAULT_NEXT_STEP];
};
