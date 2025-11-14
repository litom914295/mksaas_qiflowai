'use client';

import React from 'react';

/**
 * VIPBadge - VIP 标记徽章
 *
 * 功能：
 * - 多种样式（专属分析、跟踪服务、稀缺格局等）
 * - 可配置颜色和图标
 * - 支持动画效果
 */

type BadgeType =
  | 'analysis' // 专属分析48小时
  | 'support' // 180天跟踪服务
  | 'rarity' // 稀缺格局
  | 'charts' // 12张专属图表
  | 'custom'; // 自定义

interface VIPBadgeProps {
  type: BadgeType;
  customText?: string;
  showAnimation?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function VIPBadge({
  type,
  customText,
  showAnimation = true,
  size = 'md',
}: VIPBadgeProps) {
  const getBadgeConfig = () => {
    switch (type) {
      case 'analysis':
        return {
          icon: '⏱️',
          text: '专属分析48小时',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/50',
          textColor: 'text-blue-400',
        };
      case 'support':
        return {
          icon: '🛡️',
          text: '180天跟踪服务',
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/50',
          textColor: 'text-purple-400',
        };
      case 'rarity':
        return {
          icon: '🌟',
          text: '您的格局仅占人群15%',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/50',
          textColor: 'text-yellow-400',
        };
      case 'charts':
        return {
          icon: '📊',
          text: '含12张专属图表',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/50',
          textColor: 'text-green-400',
        };
      case 'custom':
        return {
          icon: '✨',
          text: customText || 'VIP专属',
          bgColor: 'bg-indigo-500/10',
          borderColor: 'border-indigo-500/50',
          textColor: 'text-indigo-400',
        };
      default:
        return {
          icon: '✨',
          text: 'VIP',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/50',
          textColor: 'text-gray-400',
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'md':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  const config = getBadgeConfig();
  const sizeClasses = getSizeClasses();

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-full border
        ${config.bgColor} ${config.borderColor} ${sizeClasses}
        backdrop-blur-sm
        ${showAnimation ? 'hover:scale-105 transition-transform' : ''}
      `}
    >
      {/* 动画指示器 */}
      {showAnimation && (
        <div className={`w-1.5 h-1.5 rounded-full ${config.textColor} bg-current animate-pulse`} />
      )}

      {/* 图标 */}
      <span className="text-base">{config.icon}</span>

      {/* 文本 */}
      <span className={`font-semibold ${config.textColor}`}>
        {config.text}
      </span>
    </div>
  );
}

/**
 * VIPBadgeGroup - VIP 标记组（多个徽章组合）
 */
interface VIPBadgeGroupProps {
  badges: BadgeType[];
  layout?: 'horizontal' | 'vertical';
}

export function VIPBadgeGroup({
  badges,
  layout = 'horizontal',
}: VIPBadgeGroupProps) {
  return (
    <div
      className={`
        flex ${layout === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'} gap-2
      `}
    >
      {badges.map((badgeType, index) => (
        <VIPBadge key={index} type={badgeType} />
      ))}
    </div>
  );
}
