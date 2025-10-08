'use client';

export function YunBreakdown({
  yun,
  className = '',
}: {
  yun?: { period?: number; periods?: { name: string; note?: string }[] };
  className?: string;
}) {
  const list = yun?.periods ?? [];
  if (!list.length) return null;
  return (
    <div
      className={`rounded-lg border bg-card p-4 ${className}`}
      data-testid="xuankong-yun-list"
    >
      <h3 className="mb-2 font-semibold">运期分解</h3>
      <ul className="list-inside list-disc text-sm">
        {list.map((p, idx) => (
          <li key={idx}>
            <span className="font-medium">{p.name}</span>
            {p.note ? ` - ${p.note}` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}
