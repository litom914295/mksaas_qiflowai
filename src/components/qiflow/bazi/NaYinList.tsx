'use client';

export function NaYinList({
  items,
  className = '',
}: { items?: { pillar: string; nayin: string }[]; className?: string }) {
  if (!items || !items.length) return null;
  return (
    <div
      className={`rounded-lg border bg-card p-4 ${className}`}
      data-testid="bazi-nayin"
    >
      <h3 className="mb-2 font-semibold">纳音</h3>
      <ul className="grid grid-cols-2 gap-2 text-sm">
        {items.map((it, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <span className="text-muted-foreground">{it.pillar}</span>
            <span className="font-mono">{it.nayin}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
