'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface WelcomeBannerProps {
  userName: string;
  userAvatar?: string;
  userLevel: string;
  greeting: string;
}

export default function WelcomeBanner({
  userName,
  userAvatar,
  userLevel,
  greeting,
}: WelcomeBannerProps) {
  // 获取用户名的首字母作为头像备用显示
  const initials = userName
    .split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 border-2 border-white">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback className="bg-white text-purple-600 text-lg font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">
              {greeting}，{userName}！
            </h2>
            <p className="mt-1 text-sm opacity-90">
              欢迎回到 QiFlow AI 个人中心
            </p>
          </div>
        </div>
        <Badge className="bg-white text-purple-600 hover:bg-white/90">
          {userLevel}
        </Badge>
      </div>

      {/* 添加一些装饰性元素 */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm opacity-90">
          今天是个好日子，继续探索您的命理之旅吧！
        </p>
        <div className="flex space-x-2">
          <div className="h-2 w-2 rounded-full bg-white/60" />
          <div className="h-2 w-2 rounded-full bg-white/80" />
          <div className="h-2 w-2 rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
}
