"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="mx-auto max-w-xl p-6">
      <div className="rounded-lg border bg-card p-4">
        <h2 className="text-lg font-semibold text-destructive">页面加载失败</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-4 flex gap-2">
          <button className="rounded bg-primary px-3 py-1.5 text-primary-foreground" onClick={() => reset()}>
            重试
          </button>
          <a className="rounded border px-3 py-1.5 text-sm" href="/zh-CN/analysis/bazi">去八字</a>
          <a className="rounded border px-3 py-1.5 text-sm" href="/zh-CN/analysis/xuankong">去风水</a>
        </div>
      </div>
    </div>
  );
}
