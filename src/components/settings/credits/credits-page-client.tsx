'use client';

import { CreditsEarningGuide } from '@/components/dashboard/credits/credits-earning-guide';
import { EnhancedBalanceCard } from '@/components/dashboard/credits/enhanced-balance-card';
import { EnhancedCreditPackages } from '@/components/dashboard/credits/enhanced-credit-packages';
import { CreditPackages } from '@/components/settings/credits/credit-packages';
import { CreditTransactions } from '@/components/settings/credits/credit-transactions';
import CreditsBalanceCard from '@/components/settings/credits/credits-balance-card';
import { VouchersList } from '@/components/settings/credits/vouchers-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocaleRouter } from '@/i18n/navigation';
import { Routes } from '@/routes';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Credits page client, show credit balance and transactions
 */
export default function CreditsPageClient() {
  const t = useTranslations('Dashboard.settings.credits');
  const tt = t as unknown as (key: string) => string;
  const searchParams = useSearchParams();
  const localeRouter = useLocaleRouter();

  const [activeTab, setActiveTab] = useQueryState(
    'tab',
    parseAsStringLiteral(['balance', 'transactions']).withDefault('balance')
  );

  const handleTabChange = (value: string) => {
    if (value === 'balance' || value === 'transactions') {
      setActiveTab(value);
    }
  };

  // gift_token 领取
  useEffect(() => {
    const token = searchParams?.get('gift_token');
    if (!token) return;
    (async () => {
      try {
        const res = await fetch('/api/vouchers/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (data?.success) {
          toast.success(tt('vouchers.claimSuccess'));
          const url = new URL(window.location.href);
          url.searchParams.delete('gift_token');
          localeRouter.replace(Routes.SettingsCredits + url.search);
        } else {
          toast.error(data?.error || tt('vouchers.claimFailed'));
        }
      } catch (e) {
        toast.error(tt('vouchers.claimFailed'));
      }
    })();
  }, [searchParams, localeRouter]);

  return (
    <div className="flex flex-col gap-8">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="">
          <TabsTrigger value="balance">{t('tabs.balance')}</TabsTrigger>
          <TabsTrigger value="transactions">
            {t('tabs.transactions')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="balance" className="mt-4 flex flex-col gap-8">
          {/* Enhanced Credits Balance Card */}
          <div className="w-full">
            <EnhancedBalanceCard />
          </div>

          {/* Credits Earning Guide */}
          <div className="w-full">
            <CreditsEarningGuide />
          </div>

          {/* My Vouchers */}
          <div className="w-full space-y-3">
            <h3 className="text-base font-medium">{tt('vouchers.title')}</h3>
            <VouchersList />
          </div>

          {/* Enhanced Credit Packages */}
          <div className="w-full">
            <EnhancedCreditPackages />
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          {/* Credit Transactions */}
          <CreditTransactions />
        </TabsContent>
      </Tabs>
    </div>
  );
}
