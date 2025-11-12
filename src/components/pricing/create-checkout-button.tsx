'use client';

import { createCheckoutAction } from '@/actions/create-checkout-session';
import { Button } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { Loader2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

interface CheckoutButtonProps {
  userId: string;
  planId: string;
  priceId: string;
  metadata?: Record<string, string>;
  variant?:
    | 'default'
    | 'outline'
    | 'destructive'
    | 'secondary'
    | 'ghost'
    | 'link'
    | null;
  size?: 'default' | 'sm' | 'lg' | 'icon' | null;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Checkout Button
 *
 * This client component creates a Stripe checkout session and redirects to it
 * It's used to initiate the checkout process for a specific plan and price.
 *
 * NOTICE: Login is required when using this button.
 */
export function CheckoutButton({
  userId,
  planId,
  priceId,
  metadata,
  variant = 'default',
  size = 'default',
  className,
  children,
}: CheckoutButtonProps) {
  const t = useTranslations('PricingPage.CheckoutButton');
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);

      const mergedMetadata = metadata ? { ...metadata } : {};

      // add promotekit_referral to metadata if enabled promotekit affiliate
      if (websiteConfig.features.enablePromotekitAffiliate) {
        const promotekitReferral =
          typeof window !== 'undefined'
            ? (window as any).promotekit_referral
            : undefined;
        if (promotekitReferral) {
          console.log(
            'create checkout button, promotekitReferral:',
            promotekitReferral
          );
          mergedMetadata.promotekit_referral = promotekitReferral;
        }
      }

      // add affonso_referral to metadata if enabled affonso affiliate
      if (websiteConfig.features.enableAffonsoAffiliate) {
        const affonsoReferral =
          typeof document !== 'undefined'
            ? (() => {
                const match = document.cookie.match(
                  /(?:^|; )affonso_referral=([^;]*)/
                );
                return match ? decodeURIComponent(match[1]) : null;
              })()
            : null;
        if (affonsoReferral) {
          console.log(
            'create checkout button, affonsoReferral:',
            affonsoReferral
          );
          mergedMetadata.affonso_referral = affonsoReferral;
        }
      }

      // 输出详细参数方便调试
      console.log('[Checkout] Creating session with params:', {
        userId,
        planId,
        priceId,
        metadata: mergedMetadata,
      });

      // Create checkout session using server action
      const result = await createCheckoutAction({
        userId,
        planId,
        priceId,
        metadata:
          Object.keys(mergedMetadata).length > 0 ? mergedMetadata : undefined,
      });

      console.log('[Checkout] Result:', JSON.stringify(result, null, 2));

      // Check if result is undefined or null
      if (!result) {
        console.error('[Checkout] Result is null or undefined');
        toast.error(t('checkoutFailed') + ': No response from server');
        return;
      }

      // Check for server error
      if (result.serverError) {
        console.error('[Checkout] Server error:', result.serverError);
        toast.error(`${t('checkoutFailed')}: ${result.serverError}`);
        return;
      }

      // Check for validation errors
      if (result.validationErrors) {
        console.error('[Checkout] Validation errors:', result.validationErrors);
        const firstError = Object.values(result.validationErrors)[0];
        toast.error(`${t('checkoutFailed')}: ${firstError}`);
        return;
      }

      // Check for data and success
      if (result.data?.success && result.data.data?.url) {
        console.log('[Checkout] Redirecting to:', result.data.data.url);
        window.location.href = result.data.data.url;
      } else {
        const errorMsg =
          result.data?.error || 'Unknown error';
        console.error('[Checkout] Failed:', {
          hasData: !!result.data,
          success: result.data?.success,
          hasUrl: !!result.data?.data?.url,
          error: errorMsg,
          fullResult: result,
        });
        toast.error(`${t('checkoutFailed')}: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Create checkout session error:', error);
      toast.error(t('checkoutFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2Icon className="mr-2 size-4 animate-spin" />
          {t('loading')}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
