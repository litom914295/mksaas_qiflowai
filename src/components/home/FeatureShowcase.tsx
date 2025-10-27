'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LocaleLink } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Box,
  Compass,
  Home,
  Image as ImageIcon,
  MessageCircle,
  Star,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

const features = [
  {
    icon: Star,
    title: '八字分析',
    titleKey: 'features.bazi.title',
    description: '30秒生成命理报告',
    descKey: 'features.bazi.description',
    href: '/unified-form',
    color: 'from-purple-500 to-pink-500',
    gradient: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10',
  },
  {
    icon: Compass,
    title: '玄空风水',
    titleKey: 'features.xuankong.title',
    description: '智能飞星布局分析',
    descKey: 'features.xuankong.description',
    href: '/unified-form',
    color: 'from-blue-500 to-cyan-500',
    gradient: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10',
  },
  {
    icon: Compass,
    title: '罗盘算法',
    titleKey: 'features.compass.title',
    description: 'AI 智能方位识别',
    descKey: 'features.compass.description',
    href: '/tools/compass',
    color: 'from-green-500 to-emerald-500',
    gradient: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10',
  },
  {
    icon: Home,
    title: '户型图分析',
    titleKey: 'features.floorPlan.title',
    description: '上传户型图即可分析',
    descKey: 'features.floorPlan.description',
    href: '/tools/floor-plan',
    color: 'from-orange-500 to-red-500',
    gradient: 'bg-gradient-to-br from-orange-500/10 to-red-500/10',
  },
  {
    icon: Box,
    title: '3D 可视化',
    titleKey: 'features.visualization3d.title',
    description: '立体风水布局展示',
    descKey: 'features.visualization3d.description',
    href: '/tools/3d-visualization',
    color: 'from-indigo-500 to-purple-500',
    gradient: 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10',
  },
  {
    icon: MessageCircle,
    title: 'AI 助手',
    titleKey: 'features.aiAssistant.title',
    description: '24/7 智能问答',
    descKey: 'features.aiAssistant.description',
    href: '/ai-chat',
    color: 'from-pink-500 to-rose-500',
    gradient: 'bg-gradient-to-br from-pink-500/10 to-rose-500/10',
  },
];

export function FeatureShowcase() {
  const t = useTranslations('home');

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* 标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-3">
              {t('features.title') || '强大的功能，简单的操作'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('features.subtitle') ||
                '从八字命理到风水布局，从数据分析到AI咨询，一站式解决所有需求'}
            </p>
          </motion.div>

          {/* 功能卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <LocaleLink href={feature.href}>
                  <Card className="group h-full hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg">
                    <CardHeader>
                      <div
                        className={
                          'w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300'
                        }
                      >
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors">
                        {t(feature.titleKey as any) || feature.title}
                      </CardTitle>
                      <CardDescription>
                        {t(feature.descKey as any) || feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-primary font-medium text-sm group-hover:translate-x-2 transition-transform duration-300">
                        <span>{t('features.learnMore') || '了解更多'}</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </LocaleLink>
              </motion.div>
            ))}
          </div>

          {/* 底部提示 */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 text-center"
          >
            <p className="text-muted-foreground text-sm">
              {t('features.hint') ||
                '💡 所有功能均采用先进的AI算法，确保准确性和专业性'}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
