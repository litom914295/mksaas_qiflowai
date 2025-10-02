'use client';

import { useEffect } from 'react';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LocaleError({ error, reset }: Props) {
  useEffect(() => {
    // 在开发环境输出错误详情
    console.error('[LocaleError]', error);
  }, [error]);

  return (
    <div className="container py-12">
      <h2 className="text-2xl font-semibold mb-2">页面出错了</h2>
      <p className="text-gray-600 mb-6">请稍后重试，或在开发控制台查看详细信息。</p>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => reset()}
      >
        重试
      </button>
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-6 p-4 bg-gray-50 border rounded text-sm overflow-auto">
{error.message}\n{error.stack}
        </pre>
      )}
    </div>
  );
}


