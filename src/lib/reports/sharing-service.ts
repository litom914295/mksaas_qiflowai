/**
 * Report Sharing Service
 * 报告分享服务
 */

import { useCallback, useState } from 'react';
import type { ShareLink, ShareOptions } from './types';

export function useReportSharing() {
  const [isSharing, setIsSharing] = useState(false);
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createShareLink = useCallback(
    async (
      reportId: string,
      options?: ShareOptions
    ): Promise<ShareLink | null> => {
      setIsSharing(true);
      setError(null);

      try {
        const response = await fetch('/api/reports/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportId, ...options }),
        });

        if (!response.ok) {
          throw new Error('Failed to create share link');
        }

        const data = await response.json();
        setShareLink(data);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return null;
      } finally {
        setIsSharing(false);
      }
    },
    []
  );

  const revokeShareLink = useCallback(
    async (linkId: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/reports/share/${linkId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to revoke share link');
        }

        setShareLink(null);
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return false;
      }
    },
    []
  );

  return {
    isSharing,
    shareLink,
    error,
    createShareLink,
    revokeShareLink,
  };
}
