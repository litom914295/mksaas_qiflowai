'use client';

interface ConversationContextPanelProps {
  bazi?: Record<string, string | number>;
  fengshui?: Record<string, string | number>;
  className?: string;
}

const renderSection = (
  title: string,
  data: Record<string, string | number>
) => (
  <section>
    <h4 className='text-sm font-semibold text-muted-foreground'>{title}</h4>
    <div className='mt-2 space-y-1 rounded-md bg-background p-3 text-xs'>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className='flex items-start justify-between gap-4'>
          <span className='text-muted-foreground'>{key}</span>
          <span className='text-foreground'>{value}</span>
        </div>
      ))}
    </div>
  </section>
);

export const ConversationContextPanel = ({
  bazi,
  fengshui,
  className,
}: ConversationContextPanelProps) => {
  if (!bazi && !fengshui) {
    return (
      <aside
        className={`rounded-xl border bg-card p-4 text-sm text-muted-foreground ${className ?? ''}`.trim()}
      >
        当前暂无上下文信息，等待用户提供更多资料。
      </aside>
    );
  }

  return (
    <aside
      className={`space-y-4 rounded-xl border bg-card p-4 ${className ?? ''}`.trim()}
    >
      {bazi ? renderSection('八字信息', bazi) : null}
      {fengshui ? renderSection('风水记录', fengshui) : null}
    </aside>
  );
};
