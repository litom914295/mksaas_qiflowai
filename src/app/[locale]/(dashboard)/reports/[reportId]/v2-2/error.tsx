'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function ReportV22Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Report V2-2 Error]', error);
  }, [error]);

  return (
    <div className="container max-w-4xl py-12">
      <div className="text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <span className="text-5xl">⚠️</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-destructive">加载报告出错</h1>
          <p className="text-muted-foreground">
            {error.message || '报告加载过程中发生错误'}
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            重试
          </button>
          <Link
            href="/"
            className="px-6 py-2 border rounded-lg hover:bg-muted transition-colors"
          >
            返回首页
          </Link>
        </div>
        
        {error.digest && (
          <div className="pt-6 text-sm text-muted-foreground">
            <p>错误 ID: {error.digest}</p>
          </div>
        )}
        
        <details className="pt-6 text-left max-w-2xl mx-auto">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            查看详细错误信息
          </summary>
          <pre className="mt-4 p-4 bg-muted rounded-lg text-xs overflow-auto">
            {error.stack}
          </pre>
        </details>
      </div>
    </div>
  );
}
