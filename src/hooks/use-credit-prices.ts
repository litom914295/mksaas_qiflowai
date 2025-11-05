'use client';

import { useEffect, useState } from 'react';

export type StripePrices = Record<string, { amount: number; currency: string }>;

/**
 * Hook to fetch credit prices from Stripe API
 * 从 Stripe API 获取积分包实时价格
 *
 * @returns { prices, isLoading, error }
 */
export function useCreditPrices() {
  const [prices, setPrices] = useState<StripePrices | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrices() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/stripe/prices');

        if (!response.ok) {
          throw new Error('Failed to fetch prices');
        }

        const data = await response.json();
        setPrices(data.prices);
        setError(null);
      } catch (err) {
        console.error('Error fetching Stripe prices:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPrices();
  }, []);

  return { prices, isLoading, error };
}
