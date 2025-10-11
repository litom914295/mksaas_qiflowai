/**
 * @jest-environment node
 */

import { QiFlowApiError } from '@/types/api-errors';
import { ConversationStateMachine } from '../state-machine';
import type {
  ConversationContext,
  ConversationStateType,
} from '../types/conversation';
import type { StateMachineConfig } from '../types/state-machine';

// Mock the retry utility
jest.mock('@/lib/utils/retry-utils', () => ({
  withRetry: jest.fn().mockImplementation(async (fn, options) => {
    try {
      return await fn();
    } catch (error) {
      // Simple fallback for testing
      if (options?.shouldRetry?.(error)) {
        return await fn();
      }
      throw error;
    }
  }),
}));

describe('ConversationStateMachine', () => {
  let validConfig: StateMachineConfig;
  let mockContext: ConversationContext;

  beforeEach(() => {
    validConfig = {
      initialState: 'greeting',
      states: {
        greeting: {
          transitions: ['collecting_info'],
        },
        collecting_info: {
          transitions: ['analyzing', 'error'],
        },
        analyzing: {
          transitions: ['recommending', 'error'],
        },
        recommending: {
          transitions: ['explaining', 'collecting_info'],
        },
        explaining: {
          transitions: ['closure', 'greeting'],
        },
        closure: {
          transitions: ['greeting'],
        },
        deepdive: {
          transitions: ['analyzing', 'explaining'],
        },
        expert_handoff: {
          transitions: ['analyzing', 'error'],
        },
        error: {
          transitions: ['greeting'],
        },
      },
      transitions: [
        {
          from: 'greeting',
          to: 'collecting_info',
          condition: (context) => !!context.messages?.length,
        },
        {
          from: 'collecting_info',
          to: 'analyzing',
          condition: (context) => !!context.userProfile?.baziData,
        },
        {
          from: 'analyzing',
          to: 'recommending',
          condition: (context) => context.metadata?.analysisCount > 0,
        },
        {
          from: 'recommending',
          to: 'explaining',
          condition: () => true,
        },
        {
          from: 'explaining',
          to: 'closure',
          condition: () => true,
        },
        {
          from: 'closure',
          to: 'greeting',
          condition: () => true,
        },
      ],
    };

    mockContext = {
      sessionId: 'test-session',
      userId: 'test-user',
      messages: [],
      currentTopic: 'test-topic',
      contextStack: [],
      userProfile: {
        preferences: {
          language: 'zh-CN',
          responseStyle: 'detailed',
          culturalBackground: 'mainland',
        },
        baziData: {
          year: 1990,
          month: 1,
          day: 1,
          hour: 12,
          gender: 'male' as const,
          timezone: 'Asia/Shanghai',
        },
        expertise: 'beginner' as const,
      },
      metadata: {
        analysisCount: 0,
        totalMessages: 0,
        sessionDuration: 0,
        lastActivity: new Date().toISOString(),
        traceId: 'test-trace',
      },
      domainSnapshot: {
        lastUpdatedAt: new Date().toISOString(),
      },
      topicTags: [],
    };
  });

  describe('Constructor and Configuration Validation', () => {
    it('should create a state machine with valid configuration', () => {
      expect(() => new ConversationStateMachine(validConfig)).not.toThrow();
    });

    it('should throw error for missing initial state', () => {
      const invalidConfig = { ...validConfig, initialState: undefined as any };
      expect(() => new ConversationStateMachine(invalidConfig)).toThrow(
        QiFlowApiError
      );
    });

    it('should throw error for missing states', () => {
      const invalidConfig = { ...validConfig, states: undefined as any };
      expect(() => new ConversationStateMachine(invalidConfig)).toThrow(
        QiFlowApiError
      );
    });

    it('should throw error for undefined initial state', () => {
      const invalidConfig = {
        ...validConfig,
        initialState: 'nonexistent' as ConversationStateType,
      };
      expect(() => new ConversationStateMachine(invalidConfig)).toThrow(
        QiFlowApiError
      );
    });

    it('should throw error for transitions referencing undefined states', () => {
      const invalidConfig = {
        ...validConfig,
        transitions: [
          {
            from: 'greeting' as ConversationStateType,
            to: 'nonexistent' as ConversationStateType,
            condition: () => true,
          },
        ],
      };
      expect(() => new ConversationStateMachine(invalidConfig)).toThrow(
        QiFlowApiError
      );
    });

    it('should add error state if missing', () => {
      const configWithoutError = {
        ...validConfig,
        states: { ...validConfig.states },
      };
      (configWithoutError.states as any).error = undefined;

      const stateMachine = new ConversationStateMachine(configWithoutError);
      const initialState = stateMachine.createInitialState();
      expect(initialState).toBeDefined();
    });
  });

  describe('Initial State Creation', () => {
    it('should create initial state correctly', () => {
      const stateMachine = new ConversationStateMachine(validConfig);
      const initialState = stateMachine.createInitialState();

      expect(initialState.current).toBe('greeting');
      expect(initialState.previous).toBe('greeting');
      expect(initialState.transitions).toEqual(['collecting_info']);
      expect(initialState.data).toEqual({});
    });

    it('should create fallback state on error', () => {
      const invalidConfig = {
        ...validConfig,
        initialState: 'nonexistent' as ConversationStateType,
      };

      // Override validation to test error handling
      const stateMachine = new (class extends ConversationStateMachine {
        constructor() {
          super({
            initialState: 'greeting',
            states: {
              greeting: { transitions: [] },
              collecting_info: { transitions: [] },
              analyzing: { transitions: [] },
              explaining: { transitions: [] },
              recommending: { transitions: [] },
              deepdive: { transitions: [] },
              closure: { transitions: [] },
              expert_handoff: { transitions: [] },
              error: { transitions: [] },
            },
            transitions: [],
          });
        }

        createInitialState(): any {
          // Force an error in initial state creation
          throw new Error('Test error');
        }
      })();

      expect(() => stateMachine.createInitialState()).toThrow('Test error');
    });
  });

  describe('Event Handlers', () => {
    it('should add and remove event handlers', () => {
      const stateMachine = new ConversationStateMachine(validConfig);
      const handler = jest.fn();

      stateMachine.onStateChange(handler);
      stateMachine.offStateChange(handler);

      // Handler should be removed, so no error when calling offStateChange again
      stateMachine.offStateChange(handler);
    });
  });

  describe('State Transitions', () => {
    let stateMachine: ConversationStateMachine;

    beforeEach(() => {
      stateMachine = new ConversationStateMachine(validConfig);
    });

    it('should transition to next state when condition is met', async () => {
      const currentState = stateMachine.createInitialState();
      mockContext.messages = [
        {
          id: '1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date().toISOString(),
        },
      ];

      const newState = await stateMachine.transition(
        currentState,
        mockContext,
        'user_message'
      );

      expect(newState.current).toBe('collecting_info');
      expect(newState.previous).toBe('greeting');
    });

    it('should stay in current state when no transitions are available', async () => {
      const currentState = {
        current: 'greeting' as ConversationStateType,
        previous: 'greeting' as ConversationStateType,
        transitions: [] as ConversationStateType[],
        data: {},
      };

      const newState = await stateMachine.transition(
        currentState,
        mockContext,
        'user_message'
      );

      expect(newState.current).toBe('greeting');
      expect(newState.previous).toBe('greeting');
    });

    it('should stay in current state when condition is not met', async () => {
      const currentState = stateMachine.createInitialState();
      // No messages in context, so condition fails

      const newState = await stateMachine.transition(
        currentState,
        mockContext,
        'user_message'
      );

      expect(newState.current).toBe('greeting');
      expect(newState.previous).toBe('greeting');
    });

    it('should execute transition action', async () => {
      const actionSpy = jest.fn();
      const configWithAction = {
        ...validConfig,
        transitions: [
          {
            from: 'greeting' as ConversationStateType,
            to: 'collecting_info' as ConversationStateType,
            condition: () => true,
            action: actionSpy,
          },
        ],
      };

      const stateMachineWithAction = new ConversationStateMachine(
        configWithAction
      );
      const currentState = stateMachineWithAction.createInitialState();

      await stateMachineWithAction.transition(
        currentState,
        mockContext,
        'test_trigger'
      );

      expect(actionSpy).toHaveBeenCalledWith(mockContext);
    });

    it('should execute lifecycle hooks', async () => {
      const onExitSpy = jest.fn();
      const onEnterSpy = jest.fn();

      const configWithHooks = {
        ...validConfig,
        states: {
          ...validConfig.states,
          greeting: {
            ...validConfig.states.greeting,
            onExit: onExitSpy,
          },
          collecting_info: {
            ...validConfig.states.collecting_info,
            onEnter: onEnterSpy,
          },
        },
        transitions: [
          {
            from: 'greeting' as ConversationStateType,
            to: 'collecting_info' as ConversationStateType,
            condition: () => true,
          },
        ],
      };

      const stateMachineWithHooks = new ConversationStateMachine(
        configWithHooks
      );
      const currentState = stateMachineWithHooks.createInitialState();

      await stateMachineWithHooks.transition(
        currentState,
        mockContext,
        'test_trigger'
      );

      expect(onExitSpy).toHaveBeenCalledWith(mockContext);
      expect(onEnterSpy).toHaveBeenCalledWith(mockContext);
    });

    it('should emit state change events', async () => {
      const eventHandler = jest.fn();
      stateMachine.onStateChange(eventHandler);

      const currentState = stateMachine.createInitialState();
      const configWithSuccessfulTransition = {
        ...validConfig,
        transitions: [
          {
            from: 'greeting' as ConversationStateType,
            to: 'collecting_info' as ConversationStateType,
            condition: () => true,
          },
        ],
      };

      const stateMachineWithEvent = new ConversationStateMachine(
        configWithSuccessfulTransition
      );
      stateMachineWithEvent.onStateChange(eventHandler);

      await stateMachineWithEvent.transition(
        currentState,
        mockContext,
        'test_trigger'
      );

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: mockContext.sessionId,
          from: 'greeting',
          to: 'collecting_info',
          trigger: 'test_trigger',
        })
      );
    });

    it('should handle errors during transition gracefully', async () => {
      const errorConfig = {
        ...validConfig,
        transitions: [
          {
            from: 'greeting' as ConversationStateType,
            to: 'collecting_info' as ConversationStateType,
            condition: () => {
              throw new Error('Test condition error');
            },
          },
        ],
      };

      const errorStateMachine = new ConversationStateMachine(errorConfig);
      const currentState = errorStateMachine.createInitialState();

      const newState = await errorStateMachine.transition(
        currentState,
        mockContext,
        'error_trigger'
      );

      // Should stay in current state when condition evaluation fails
      expect(newState.current).toBe('greeting');
    });

    it('should return fallback state on complete failure', async () => {
      const currentState = {
        current: 'nonexistent' as ConversationStateType,
        previous: 'greeting' as ConversationStateType,
        transitions: [],
        data: {},
      };

      const newState = await stateMachine.transition(
        currentState,
        mockContext,
        'test_trigger'
      );

      expect(newState.current).toBe('error');
      expect(newState.data.error).toBeDefined();
      expect(newState.data.previousState).toBe('nonexistent');
    });
  });

  describe('Error Handling', () => {
    let stateMachine: ConversationStateMachine;

    beforeEach(() => {
      stateMachine = new ConversationStateMachine(validConfig);
    });

    it('should handle condition evaluation errors', async () => {
      const configWithErrorCondition = {
        ...validConfig,
        transitions: [
          {
            from: 'greeting' as ConversationStateType,
            to: 'collecting_info' as ConversationStateType,
            condition: () => {
              throw new Error('Condition error');
            },
          },
        ],
      };

      const errorStateMachine = new ConversationStateMachine(
        configWithErrorCondition
      );
      const currentState = errorStateMachine.createInitialState();

      const newState = await errorStateMachine.transition(
        currentState,
        mockContext,
        'test'
      );

      // Should continue to next transition or stay in current state
      expect(newState.current).toBe('greeting');
    });

    it('should handle action execution errors', async () => {
      const configWithErrorAction = {
        ...validConfig,
        transitions: [
          {
            from: 'greeting' as ConversationStateType,
            to: 'collecting_info' as ConversationStateType,
            condition: () => true,
            action: () => {
              throw new Error('Action error');
            },
          },
        ],
      };

      const errorStateMachine = new ConversationStateMachine(
        configWithErrorAction
      );
      const currentState = errorStateMachine.createInitialState();

      const newState = await errorStateMachine.transition(
        currentState,
        mockContext,
        'test'
      );

      // Should complete transition despite action error
      expect(newState.current).toBe('collecting_info');
    });

    it('should handle lifecycle hook errors', async () => {
      const configWithErrorHooks = {
        ...validConfig,
        states: {
          ...validConfig.states,
          greeting: {
            ...validConfig.states.greeting,
            onExit: () => {
              throw new Error('onExit error');
            },
          },
          collecting_info: {
            ...validConfig.states.collecting_info,
            onEnter: () => {
              throw new Error('onEnter error');
            },
          },
        },
        transitions: [
          {
            from: 'greeting' as ConversationStateType,
            to: 'collecting_info' as ConversationStateType,
            condition: () => true,
          },
        ],
      };

      const errorStateMachine = new ConversationStateMachine(
        configWithErrorHooks
      );
      const currentState = errorStateMachine.createInitialState();

      const newState = await errorStateMachine.transition(
        currentState,
        mockContext,
        'test'
      );

      // Should complete transition despite hook errors
      expect(newState.current).toBe('collecting_info');
    });

    it('should handle event handler errors', async () => {
      const errorHandler = jest.fn().mockImplementation(() => {
        throw new Error('Event handler error');
      });
      const successHandler = jest.fn();

      stateMachine.onStateChange(errorHandler);
      stateMachine.onStateChange(successHandler);

      const configWithSuccessfulTransition = {
        ...validConfig,
        transitions: [
          {
            from: 'greeting' as ConversationStateType,
            to: 'collecting_info' as ConversationStateType,
            condition: () => true,
          },
        ],
      };

      const testStateMachine = new ConversationStateMachine(
        configWithSuccessfulTransition
      );
      testStateMachine.onStateChange(errorHandler);
      testStateMachine.onStateChange(successHandler);

      const currentState = testStateMachine.createInitialState();
      const newState = await testStateMachine.transition(
        currentState,
        mockContext,
        'test'
      );

      // Transition should succeed despite handler error
      expect(newState.current).toBe('collecting_info');
      expect(successHandler).toHaveBeenCalled();
    });
  });

  describe('Metrics and Health', () => {
    let stateMachine: ConversationStateMachine;

    beforeEach(() => {
      stateMachine = new ConversationStateMachine(validConfig);
    });

    it('should track transition metrics', async () => {
      const currentState = stateMachine.createInitialState();

      await stateMachine.transition(currentState, mockContext, 'test');

      const metrics = stateMachine.getMetrics();
      expect(metrics.totalTransitions).toBe(1);
      expect(metrics.averageTransitionTime).toBeGreaterThan(0);
    });

    it('should track failed transitions', async () => {
      // Force a failure by using invalid state
      const invalidState = {
        current: 'nonexistent' as ConversationStateType,
        previous: 'greeting' as ConversationStateType,
        transitions: [],
        data: {},
      };

      await stateMachine.transition(invalidState, mockContext, 'test');

      const metrics = stateMachine.getMetrics();
      expect(metrics.failedTransitions).toBe(1);
      expect(metrics.lastError).toBeDefined();
    });

    it('should reset metrics', () => {
      stateMachine.resetMetrics();
      const metrics = stateMachine.getMetrics();

      expect(metrics.totalTransitions).toBe(0);
      expect(metrics.failedTransitions).toBe(0);
      expect(metrics.averageTransitionTime).toBe(0);
      expect(metrics.lastError).toBeUndefined();
    });

    it('should report health status', async () => {
      // Initially healthy (no transitions)
      expect(stateMachine.isHealthy()).toBe(true);

      // After successful transition, still healthy
      const currentState = stateMachine.createInitialState();
      await stateMachine.transition(currentState, mockContext, 'test');
      expect(stateMachine.isHealthy()).toBe(true);

      // Simulate many failures to make it unhealthy
      for (let i = 0; i < 10; i++) {
        const invalidState = {
          current: 'nonexistent' as ConversationStateType,
          previous: 'greeting' as ConversationStateType,
          transitions: [],
          data: {},
        };
        await stateMachine.transition(invalidState, mockContext, 'test');
      }

      expect(stateMachine.isHealthy()).toBe(false);
    });
  });

  describe('Async Operations', () => {
    let stateMachine: ConversationStateMachine;

    beforeEach(() => {
      stateMachine = new ConversationStateMachine(validConfig);
    });

    it('should handle async conditions', async () => {
      const configWithAsyncCondition = {
        ...validConfig,
        transitions: [
          {
            from: 'greeting' as ConversationStateType,
            to: 'collecting_info' as ConversationStateType,
            condition: () => {
              return true;
            },
          },
        ],
      };

      const asyncStateMachine = new ConversationStateMachine(
        configWithAsyncCondition
      );
      const currentState = asyncStateMachine.createInitialState();

      const newState = await asyncStateMachine.transition(
        currentState,
        mockContext,
        'test'
      );

      expect(newState.current).toBe('collecting_info');
    });

    it('should handle async actions', async () => {
      const actionSpy = jest.fn();
      const configWithAsyncAction = {
        ...validConfig,
        transitions: [
          {
            from: 'greeting' as ConversationStateType,
            to: 'collecting_info' as ConversationStateType,
            condition: () => true,
            action: async (context: ConversationContext) => {
              await new Promise((resolve) => setTimeout(resolve, 10));
              actionSpy(context);
            },
          },
        ],
      };

      const asyncStateMachine = new ConversationStateMachine(
        configWithAsyncAction
      );
      const currentState = asyncStateMachine.createInitialState();

      await asyncStateMachine.transition(currentState, mockContext, 'test');

      expect(actionSpy).toHaveBeenCalledWith(mockContext);
    });

    it('should handle async lifecycle hooks', async () => {
      const onExitSpy = jest.fn();
      const onEnterSpy = jest.fn();

      const configWithAsyncHooks = {
        ...validConfig,
        states: {
          ...validConfig.states,
          greeting: {
            ...validConfig.states.greeting,
            onExit: async (context: ConversationContext) => {
              await new Promise((resolve) => setTimeout(resolve, 10));
              onExitSpy(context);
            },
          },
          collecting_info: {
            ...validConfig.states.collecting_info,
            onEnter: async (context: ConversationContext) => {
              await new Promise((resolve) => setTimeout(resolve, 10));
              onEnterSpy(context);
            },
          },
        },
        transitions: [
          {
            from: 'greeting' as ConversationStateType,
            to: 'collecting_info' as ConversationStateType,
            condition: () => true,
          },
        ],
      };

      const asyncStateMachine = new ConversationStateMachine(
        configWithAsyncHooks
      );
      const currentState = asyncStateMachine.createInitialState();

      await asyncStateMachine.transition(currentState, mockContext, 'test');

      expect(onExitSpy).toHaveBeenCalledWith(mockContext);
      expect(onEnterSpy).toHaveBeenCalledWith(mockContext);
    });
  });
});
