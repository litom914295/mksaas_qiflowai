'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Activity {
  id: string;
  city: string;
  action: string;
  timeAgo: string;
}

const activities: Activity[] = [
  { id: '1', city: '北京', action: '刚完成了八字分析', timeAgo: '刚刚' },
  { id: '2', city: '上海', action: '正在咨询AI', timeAgo: '1分钟前' },
  { id: '3', city: '深圳', action: '导出了风水报告', timeAgo: '2分钟前' },
  { id: '4', city: '广州', action: '开始了罗盘分析', timeAgo: '3分钟前' },
  { id: '5', city: '杭州', action: '获取了命理报告', timeAgo: '5分钟前' },
  { id: '6', city: '成都', action: '完成了风水咨询', timeAgo: '7分钟前' },
];

export const LiveActivityFeed = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [todayCount, setTodayCount] = useState(3247);

  useEffect(() => {
    // 每5秒切换一个活动
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
      // 模拟计数器增长
      setTodayCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentActivity = activities[currentIndex];

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <div className="rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-white/10 p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 实时活动流 */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex-shrink-0 relative">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentActivity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm text-slate-300 truncate">
                  <span className="font-medium text-amber-400">
                    {currentActivity.city}的用户
                  </span>{' '}
                  <span>{currentActivity.action}</span>{' '}
                  <span className="text-slate-500 text-xs">
                    · {currentActivity.timeAgo}
                  </span>
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 分隔符 */}
          <div className="hidden md:block h-8 w-px bg-white/20" />

          {/* 今日服务计数 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm text-slate-400">今日已服务</span>
            <motion.span
              key={todayCount}
              initial={{ scale: 1.2, color: '#fbbf24' }}
              animate={{ scale: 1, color: '#ffffff' }}
              className="text-lg font-bold text-white"
            >
              {todayCount.toLocaleString()}
            </motion.span>
            <span className="text-sm text-slate-400">人</span>
          </div>
        </div>
      </div>
    </div>
  );
};
