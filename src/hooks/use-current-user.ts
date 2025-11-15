import { authClient } from '@/lib/auth-client';

export const useCurrentUser = () => {
  const { data: session, error } = authClient.useSession();
  // console.log('useCurrentUser, session:', session);
  
  // 只有当存在真正的错误信息时才认为是错误
  // 空对象 {} 不算错误，只是 better-auth 的初始状态
  if (error && error.message) {
    console.error('useCurrentUser, error:', error);
    // 即使有错误，也尝试返回 session 中的 user
    // 因为 session 可能仍然有效
  }
  return session?.user || null;
};
