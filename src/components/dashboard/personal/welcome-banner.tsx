'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

type WelcomeBannerProps = {
  userName: string;
  userAvatar?: string | null;
  userLevel?: string;
  greeting?: string;
};

export default function WelcomeBanner({
  userName,
  userAvatar,
  userLevel = '普通会员',
  greeting = '早上好',
}: WelcomeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 p-6 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20"
    >
      {/* 装饰性背景圆圈 */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl" />
      <div className="absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl" />

      <div className="relative flex items-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-white/50 shadow-lg">
          <AvatarImage src={userAvatar || undefined} alt={userName} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-lg text-white">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            {greeting}, {userName}! 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-1 text-gray-600 dark:text-gray-400"
          >
            今天想要探索什么？让我们开始今天的精彩旅程吧！ · {userLevel}
          </motion.p>
        </div>

        {/* 右侧装饰性元素 */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          className="hidden md:block"
        >
          <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-md dark:bg-gray-800/80">
            <span className="text-2xl">✨</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              探索无限可能
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
