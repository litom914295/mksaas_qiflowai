import type {
  ConversationContext,
  ConversationStateType,
} from './conversation';

type TransitionCondition = (context: ConversationContext) => boolean;
type TransitionAction = (context: ConversationContext) => Promise<void> | void;
type LifecycleHook = (context: ConversationContext) => Promise<void> | void;

export interface StateTransition {
  from: ConversationStateType;
  to: ConversationStateType;
  condition: TransitionCondition;
  action?: TransitionAction;
  description?: string;
}

export interface StateMachineStateConfig {
  onEnter?: LifecycleHook;
  onExit?: LifecycleHook;
  transitions: ConversationStateType[];
  timeout?: number;
}

export interface StateMachineConfig {
  initialState: ConversationStateType;
  states: Record<ConversationStateType, StateMachineStateConfig>;
  transitions: StateTransition[];
}

export interface StateChangeEvent {
  sessionId: string;
  from: ConversationStateType;
  to: ConversationStateType;
  timestamp: Date;
  trigger: string;
  context: Partial<ConversationContext>;
}

export type StateChangeHandler = (
  event: StateChangeEvent
) => void | Promise<void>;
