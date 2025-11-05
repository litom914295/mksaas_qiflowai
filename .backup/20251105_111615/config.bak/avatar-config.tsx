'use client';

import { Routes } from '@/routes';
import type { MenuItem } from '@/types';
import {
  CoinsIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  Settings2Icon,
  SparklesIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Get avatar config with translations
 *
 * NOTICE: used in client components only
 *
 * docs:
 * https://qiflowai.com/docs/config/avatar
 *
 * @returns The avatar config with translated titles
 */
export function getAvatarLinks(): MenuItem[] {
  const t = useTranslations('Marketing.avatar');

  return [
    {
      title: t('dashboard'),
      href: Routes.Dashboard,
      icon: <LayoutDashboardIcon className="size-4 shrink-0" />,
    },
    {
      title: '积分充值', // 明确的充值入口
      href: Routes.SettingsCredits,
      icon: <CoinsIcon className="size-4 shrink-0" />,
    },
    {
      title: '升级会员', // 明确的升级入口
      href: Routes.SettingsBilling,
      icon: <SparklesIcon className="size-4 shrink-0" />,
    },
    {
      title: t('settings'),
      href: Routes.SettingsProfile,
      icon: <Settings2Icon className="size-4 shrink-0" />,
    },
  ];
}
