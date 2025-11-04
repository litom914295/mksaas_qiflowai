'use client';

import { websiteConfig } from '@/config/website';
import { Crisp } from 'crisp-sdk-web';
import { useEffect, useState } from 'react';

/**
 * Crisp chat component
 * https://crisp.chat/en/
 * https://help.crisp.chat/en/article/how-do-i-install-crisp-live-chat-on-nextjs-xh9yse/
 * 优化：延迟5秒加载，避免影响首屏性能
 */
const CrispChat = () => {
  const [shouldLoad, setShouldLoad] = useState(false);

  // 延迟5秒加载
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;
    if (!websiteConfig.features.enableCrispChat) {
      console.log('Crisp chat is disabled');
      return;
    }

    const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
    if (!websiteId) {
      console.warn('Crisp website ID is not configured.');
      return;
    }

    try {
      Crisp.configure(websiteId);
      console.log('Crisp chat initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Crisp chat:', error);
    }
  }, []);

  return null;
};

export default CrispChat;
