import { withRetry } from '@/lib/utils/retry-utils';
import { ErrorCode, QiFlowApiError } from '@/types/api-errors';
import type {
  ConversationContext,
  ConversationStateType,
} from './types/conversation';
import type {
  StateChangeEvent,
  StateChangeHandler,
  StateMachineConfig,
  StateMachineStateConfig,
  StateTransition,
} from './types/state-machine';

interface ConversationState {
  current: ConversationStateType;
  previous: ConversationStateType;
  transitions: ConversationStateType[];
  data: Record<string, unknown>;
}

interface StateMachineMetrics {
  totalTransitions: number;
  failedTransitions: number;
  lastError?: {
    timestamp: Date;
    error: string;
    context: Partial<ConversationContext>;
  };
  averageTransitionTime: number;
}

class ConversationStateMachine {
  private readonly config: StateMachineConfig;
  private readonly eventHandlers: StateChangeHandler[] = [];
  private readonly metrics: StateMachineMetrics = {
    totalTransitions: 0,
    failedTransitions: 0,
    averageTransitionTime: 0,
  };
  private readonly maxRetries = 3;
  private readonly fallbackState: ConversationStateType = 'error';

  constructor(config: StateMachineConfig) {
    this.config = this.validateConfig(config);
  }

  /**
   * 验证状态机配置
   */
  private validateConfig(config: StateMachineConfig): StateMachineConfig {
    if (!config.initialState || !config.states || !config.transitions) {
      throw new QiFlowApiError(
        ErrorCode.CONVERSATION_STATE_ERROR,
        '状态机配置不完整'
      );
    }

    // 检查初始状态是否存在
    if (!config.states[config.initialState]) {
      throw new QiFlowApiError(
        ErrorCode.CONVERSATION_STATE_ERROR,
        `初始状态 "${config.initialState}" 未定义`
      );
    }

    // 检查所有转换的目标状态是否存在
    for (const transition of config.transitions) {
      if (!config.states[transition.from] || !config.states[transition.to]) {
        throw new QiFlowApiError(
          ErrorCode.CONVERSATION_STATE_ERROR,
          `转换中引用了未定义的状态: ${transition.from} -> ${transition.to}`
        );
      }
    }

    // 确保有错误状态作为备用
    if (!config.states[this.fallbackState]) {
      config.states[this.fallbackState] = {
        transitions: [],
      };
    }

    return config;
  }

  createInitialState(): ConversationState {
    try {
      const { initialState, states } = this.config;
      const stateConfig = states[initialState];

      return {
        current: initialState,
        previous: initialState,
        transitions: stateConfig.transitions || [],
        data: {},
      };
    } catch (error) {
      console.error('[StateMachine] Failed to create initial state:', error);

      // 返回备用状态
      return {
        current: this.fallbackState,
        previous: this.fallbackState,
        transitions: [],
        data: { error: 'Failed to initialize state machine' },
      };
    }
  }

  onStateChange(handler: StateChangeHandler): void {
    this.eventHandlers.push(handler);
  }

  offStateChange(handler: StateChangeHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index >= 0) {
      this.eventHandlers.splice(index, 1);
    }
  }

  async transition(
    current: ConversationState,
    context: ConversationContext,
    trigger: string
  ): Promise<ConversationState> {
    const startTime = Date.now();
    const traceId = context.metadata?.traceId;

    try {
      this.metrics.totalTransitions++;

      return await withRetry(
        () => this.executeTransition(current, context, trigger),
        {
          retries: this.maxRetries,
          delay: 500,
          backoff: 'exponential',
          shouldRetry: (error: any) => {
            // 只重试系统级错误，不重试业务逻辑错误
            return error instanceof QiFlowApiError ? error.retryable : false;
          },
          onError: (error: any, attempt: any) => {
            console.warn(`[StateMachine] Transition retry ${attempt}:`, {
              from: current.current,
              trigger,
              error: error.message,
              traceId,
            });
          },
        } as any
      );
    } catch (error) {
      this.metrics.failedTransitions++;
      this.metrics.lastError = {
        timestamp: new Date(),
        error: error instanceof Error ? error.message : String(error),
        context: {
          sessionId: context.sessionId,
          currentTopic: context.currentTopic,
          userId: context.userId,
        },
      };

      console.error('[StateMachine] Transition failed completely:', {
        from: current.current,
        trigger,
        error: error instanceof Error ? error.message : error,
        traceId,
        metrics: this.metrics,
      });

      // 返回备用状态
      return this.createFallbackState(current, error);
    } finally {
      const executionTime = Date.now() - startTime;
      this.updateAverageTransitionTime(executionTime);
    }
  }

  /**
   * 执行具体的状态转换
   */
  private async executeTransition(
    current: ConversationState,
    context: ConversationContext,
    trigger: string
  ): Promise<ConversationState> {
    const stateConfig = this.getStateConfig(current.current);
    const transitions = this.getMatchingTransitions(
      current.current,
      stateConfig.transitions
    );

    // 如果没有可用转换，保持当前状态
    if (transitions.length === 0) {
      console.warn(
        '[StateMachine] No transitions available from state:',
        current.current
      );
      return current;
    }

    for (const transition of transitions) {
      try {
        // 检查转换条件
        const conditionMet = await this.evaluateCondition(
          transition.condition,
          context
        );
        if (!conditionMet) {
          continue;
        }

        // 执行状态退出钩子
        await this.executeLifecycleHook(stateConfig.onExit, context, 'onExit');

        // 执行转换动作
        if (transition.action) {
          await this.executeTransitionAction(transition.action, context);
        }

        // 执行状态进入钩子
        const targetConfig = this.getStateConfig(transition.to);
        await this.executeLifecycleHook(
          targetConfig.onEnter,
          context,
          'onEnter'
        );

        // 创建新状态
        const newState: ConversationState = {
          current: transition.to,
          previous: current.current,
          transitions: targetConfig.transitions || [],
          data: { ...current.data },
        };

        // 发送状态变化事件
        await this.emitStateChange({
          sessionId: context.sessionId,
          from: current.current,
          to: transition.to,
          timestamp: new Date(),
          trigger,
          context: {
            sessionId: context.sessionId,
            currentTopic: context.currentTopic,
            metadata: context.metadata,
          },
        });

        return newState;
      } catch (error) {
        console.error('[StateMachine] Transition execution failed:', {
          from: current.current,
          to: transition.to,
          error: error instanceof Error ? error.message : error,
        });
      }
    }

    // 没有成功的转换，返回当前状态
    console.warn(
      '[StateMachine] No successful transitions found, staying in current state'
    );
    return current;
  }

  /**
   * 创建备用状态
   */
  private createFallbackState(
    current: ConversationState,
    error: unknown
  ): ConversationState {
    return {
      current: this.fallbackState,
      previous: current.current,
      transitions: [],
      data: {
        ...current.data,
        error: error instanceof Error ? error.message : String(error),
        errorTimestamp: new Date().toISOString(),
        previousState: current.current,
      },
    };
  }

  /**
   * 安全地求值转换条件
   */
  private async evaluateCondition(
    condition: (context: ConversationContext) => boolean | Promise<boolean>,
    context: ConversationContext
  ): Promise<boolean> {
    try {
      return await Promise.resolve(condition(context));
    } catch (error) {
      console.error('[StateMachine] Condition evaluation failed:', error);
      return false;
    }
  }

  /**
   * 安全地执行转换动作
   */
  private async executeTransitionAction(
    action: (context: ConversationContext) => void | Promise<void>,
    context: ConversationContext
  ): Promise<void> {
    try {
      await Promise.resolve(action(context));
    } catch (error) {
      console.error('[StateMachine] Transition action failed:', error);
      // 转换动作失败不应该阻止状态转换
    }
  }

  /**
   * 安全地执行生命周期钩子
   */
  private async executeLifecycleHook(
    hook:
      | StateMachineStateConfig['onEnter']
      | StateMachineStateConfig['onExit'],
    context: ConversationContext,
    hookType: 'onEnter' | 'onExit'
  ): Promise<void> {
    if (!hook) {
      return;
    }

    try {
      await Promise.resolve(hook(context));
    } catch (error) {
      console.error(`[StateMachine] ${hookType} hook failed:`, error);
      // 生命周期钩子失败不应该阻止状态转换
    }
  }

  private getStateConfig(
    state: ConversationStateType
  ): StateMachineStateConfig {
    const config = this.config.states[state];
    if (!config) {
      console.error(
        `[StateMachine] State "${state}" is not defined, using fallback`
      );
      return this.config.states[this.fallbackState] || { transitions: [] };
    }
    return config;
  }

  private getMatchingTransitions(
    currentState: ConversationStateType,
    allowedTransitions: ConversationStateType[]
  ): StateTransition[] {
    try {
      return this.config.transitions.filter(
        (transition) =>
          transition.from === currentState &&
          allowedTransitions.includes(transition.to)
      );
    } catch (error) {
      console.error(
        '[StateMachine] Failed to get matching transitions:',
        error
      );
      return [];
    }
  }

  /**
   * 安全地发送状态变化事件
   */
  private async emitStateChange(event: StateChangeEvent): Promise<void> {
    const failedHandlers: Array<{
      handler: StateChangeHandler;
      error: unknown;
    }> = [];

    await Promise.allSettled(
      this.eventHandlers.map(async (handler) => {
        try {
          await Promise.resolve(handler(event));
        } catch (error) {
          failedHandlers.push({ handler, error });
          console.error('[StateMachine] Event handler failed:', error);
        }
      })
    );

    if (failedHandlers.length > 0) {
      console.warn(
        `[StateMachine] ${failedHandlers.length}/${this.eventHandlers.length} event handlers failed`
      );
    }
  }

  /**
   * 更新平均转换时间
   */
  private updateAverageTransitionTime(executionTime: number): void {
    const alpha = 0.1; // 指数加权平均参数
    this.metrics.averageTransitionTime =
      this.metrics.averageTransitionTime * (1 - alpha) + executionTime * alpha;
  }

  /**
   * 获取状态机指标
   */
  getMetrics(): StateMachineMetrics {
    return { ...this.metrics };
  }

  /**
   * 重置指标
   */
  resetMetrics(): void {
    this.metrics.totalTransitions = 0;
    this.metrics.failedTransitions = 0;
    this.metrics.averageTransitionTime = 0;
    this.metrics.lastError = undefined;
  }

  /**
   * 检查状态机健康状态
   */
  isHealthy(): boolean {
    const failureRate =
      this.metrics.totalTransitions > 0
        ? this.metrics.failedTransitions / this.metrics.totalTransitions
        : 0;

    return failureRate < 0.1; // 失败率低于10%认为健康
  }
}

export { ConversationStateMachine };
export type { ConversationState };
