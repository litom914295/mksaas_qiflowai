'use client';

import { PaymentMethodSelector } from '@/components/settings/credits/payment-method-selector';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getCreditPackages } from '@/config/credits-config';
import { websiteConfig } from '@/config/website';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useCurrentPlan } from '@/hooks/use-payment';
import { authClient } from '@/lib/auth-client';
import { formatPrice } from '@/lib/formatter';
import { cn } from '@/lib/utils';
import {
  CircleCheckBigIcon,
  CoinsIcon,
  CrownIcon,
  SparklesIcon,
  TagIcon,
  TrendingUpIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface EnhancedCreditPackagesProps {
  className?: string;
}

/**
 * Enhanced credit packages component with better UI and recommendations
 */
export function EnhancedCreditPackages({
  className,
}: EnhancedCreditPackagesProps) {
  const t = useTranslations('Dashboard.settings.credits.packages');

  // Get current user and payment info
  const currentUser = useCurrentUser();
  const { data: session } = authClient.useSession();
  const { data: paymentData } = useCurrentPlan(session?.user?.id);
  const currentPlan = paymentData?.currentPlan;

  // Check if credits are enabled
  if (!websiteConfig.credits.enableCredits) {
    return null;
  }

  // Get credit packages with translations
  const creditPackages = Object.values(getCreditPackages()).filter(
    (pkg) => !pkg.disabled && pkg.price.priceId
  );

  // Check if user is on free plan and enablePackagesForFreePlan is false
  const isFreePlan = currentPlan?.isFree === true;

  if (isFreePlan && !websiteConfig.credits.enablePackagesForFreePlan) {
    return null;
  }

  // If no available packages, show a graceful placeholder instead of crashing
  if (creditPackages.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CoinsIcon className="h-5 w-5 text-primary" />
            积分套餐
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            暂无可购买的积分套餐，请稍后再试或联系管理员配置价格ID。
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Sort packages: popular first, then by amount
  const sortedPackages = [...creditPackages].sort((a, b) => {
    if (a.popular && !b.popular) return -1;
    if (!a.popular && b.popular) return 1;
    return a.amount - b.amount;
  });

  // Calculate value scores for packages
  const packagesWithValue = sortedPackages.map((pkg) => {
    const valuePerDollar = pkg.amount / pkg.price.amount;
    return { ...pkg, valuePerDollar };
  });

  const bestValuePackage =
    packagesWithValue.length > 0
      ? packagesWithValue.reduce((best, current) =>
          current.valuePerDollar > best.valuePerDollar ? current : best
        )
      : null;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CoinsIcon className="h-5 w-5 text-primary" />
          积分套餐
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          选择适合您的积分套餐，享受更多服务
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {packagesWithValue.map((creditPackage) => {
            const isBestValue =
              bestValuePackage?.id === creditPackage.id &&
              packagesWithValue.length > 1;
            const isPopular = creditPackage.popular;

            return (
              <Card
                key={creditPackage.id}
                className={cn(
                  'relative overflow-hidden transition-all duration-200 hover:shadow-lg',
                  {
                    'border-primary border-2 shadow-lg': isPopular,
                    'border-orange-500 border-2 shadow-md':
                      isBestValue && !isPopular,
                    'hover:border-primary/50': !isPopular && !isBestValue,
                  }
                )}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1 flex items-center gap-1">
                      <CrownIcon className="h-3 w-3" />
                      {t('popular')}
                    </Badge>
                  </div>
                )}

                {/* Best Value Badge */}
                {isBestValue && !isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-orange-500 text-white px-3 py-1 flex items-center gap-1">
                      <TagIcon className="h-3 w-3" />
                      超值推荐
                    </Badge>
                  </div>
                )}

                {/* Header gradient for special packages */}
                {(isPopular || isBestValue) && (
                  <div
                    className={cn(
                      'absolute top-0 left-0 right-0 h-24 opacity-10',
                      isPopular
                        ? 'bg-gradient-to-b from-primary'
                        : 'bg-gradient-to-b from-orange-500'
                    )}
                  />
                )}

                <CardContent className="space-y-4 p-6">
                  {/* Credits Amount */}
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className={cn(
                          'p-2 rounded-full',
                          isPopular
                            ? 'bg-primary/10'
                            : isBestValue
                              ? 'bg-orange-100'
                              : 'bg-muted'
                        )}
                      >
                        <CoinsIcon
                          className={cn(
                            'h-6 w-6',
                            isPopular
                              ? 'text-primary'
                              : isBestValue
                                ? 'text-orange-600'
                                : 'text-muted-foreground'
                          )}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold">
                        {creditPackage.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">积分</div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-center space-y-1">
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(
                        creditPackage.price.amount,
                        creditPackage.price.currency
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ≈{' '}
                      {(
                        (creditPackage.price.amount / creditPackage.amount) *
                        1000
                      ).toFixed(2)}
                      元/千积分
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CircleCheckBigIcon className="h-4 w-4 text-green-500" />
                      {creditPackage.description ||
                        creditPackage.name ||
                        `${creditPackage.amount}积分`}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CircleCheckBigIcon className="h-4 w-4 text-green-500" />
                      <span>立即到账</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CircleCheckBigIcon className="h-4 w-4 text-green-500" />
                      <span>365天有效期</span>
                    </div>
                    {(isPopular || isBestValue) && (
                      <div className="flex items-center gap-2 text-sm">
                        <SparklesIcon className="h-4 w-4 text-yellow-500" />
                        <span>赠送额外10%积分</span>
                      </div>
                    )}
                  </div>

                  {/* Value indicator */}
                  {isBestValue && !isPopular && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-orange-800 text-sm">
                        <TrendingUpIcon className="h-4 w-4" />
                        <span className="font-medium">性价比最高</span>
                      </div>
                      <div className="text-xs text-orange-600 mt-1">
                        比其他套餐节省{' '}
                        {Math.round(
                          (1 -
                            creditPackage.valuePerDollar /
                              Math.max(
                                ...packagesWithValue.map(
                                  (p) => p.valuePerDollar
                                )
                              )) *
                            100
                        )}
                        %
                      </div>
                    </div>
                  )}

                  {/* Purchase Button */}
                  <PaymentMethodSelector
                    userId={currentUser?.id ?? ''}
                    packageId={creditPackage.id}
                    priceId={creditPackage.price.priceId}
                    packageName={
                      (creditPackage.description ||
                        creditPackage.name ||
                        `${creditPackage.amount}积分套餐`) as string
                    }
                    packageAmount={creditPackage.amount}
                    packagePrice={formatPrice(
                      creditPackage.price.amount,
                      creditPackage.price.currency
                    )}
                    className="w-full mt-4"
                    variant={isPopular || isBestValue ? 'default' : 'outline'}
                    disabled={!creditPackage.price.priceId}
                  >
                    {isPopular || isBestValue ? '立即购买' : t('purchase')}
                  </PaymentMethodSelector>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-muted/30 rounded-lg p-4">
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <SparklesIcon className="h-4 w-4 text-primary" />
              购买说明
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CircleCheckBigIcon className="h-3 w-3 text-green-500" />
                  积分购买后立即到账
                </div>
                <div className="flex items-center gap-2">
                  <CircleCheckBigIcon className="h-3 w-3 text-green-500" />
                  支持多种支付方式
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CircleCheckBigIcon className="h-3 w-3 text-green-500" />
                  365天有效期保障
                </div>
                <div className="flex items-center gap-2">
                  <CircleCheckBigIcon className="h-3 w-3 text-green-500" />
                  7天无理由退款
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
