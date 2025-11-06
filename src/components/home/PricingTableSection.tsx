'use client';

import { PricingTable } from '@/components/pricing/pricing-table';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function PricingTableSection() {
  const t = useTranslations('home');

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
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
              {t('pricing.title') || '选择适合你的套餐'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('pricing.subtitle') ||
                '灵活的定价方案，满足不同需求'}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              {t('pricing.firstTimeOffer') || '限时优惠中'}
            </div>
          </motion.div>

          {/* 使用 PricingTable 组件 */}
          <PricingTable className="max-w-6xl mx-auto" />

          {/* 底部说明 */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 text-center space-y-4"
          >
            <p className="text-muted-foreground">
              {t('pricing.hint') ||
                '💡 所有套餐均支持 支付宝、微信支付、信用卡等多种支付方式'}
            </p>
            <p className="text-sm text-muted-foreground/70">
              {t('pricing.refund') ||
                '7 天无理由退款 · 数据加密保护 · 安全可靠'}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}