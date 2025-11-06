'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LocaleLink } from '@/i18n/navigation';
import { Routes } from '@/routes';
import { motion } from 'framer-motion';
import { ChevronRight, LayoutDashboard, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface LoggedInUserBarProps {
  userName?: string;
  userAvatar?: string;
  userEmail?: string;
}

/**
 * 首页顶部用户信息栏
 * 当用户已登录时显示，提供快速访问仪表盘的入口
 */
export function LoggedInUserBar({
  userName,
  userAvatar,
  userEmail,
}: LoggedInUserBarProps) {
  const t = useTranslations('BaziHome');

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6"
    >
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-primary/3 to-background">
        <div className="flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center">
          {/* 用户信息 */}
          <div className="flex items-center gap-3">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName || '用户'}
                className="h-10 w-10 rounded-full border-2 border-primary/20"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                {userName || userEmail || '用户'}
              </span>
              <span className="text-xs text-muted-foreground">
                欢迎回来！继续使用 QiFlow AI
              </span>
            </div>
          </div>

          {/* 快捷按钮 */}
          <div className="flex w-full gap-2 sm:w-auto">
            <LocaleLink href={Routes.Dashboard} className="flex-1 sm:flex-none">
              <Button
                variant="default"
                size="sm"
                className="w-full gap-2 sm:w-auto"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>前往仪表盘</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </LocaleLink>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
