import type { auth } from './auth';

// https://www.better-auth.com/docs/concepts/typescript#additional-fields
// 暂时使用宽松类型占位，避免 $Infer 类型错误
export type Session = any;
export type User = any;
