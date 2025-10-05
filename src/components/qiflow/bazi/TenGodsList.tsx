'use client';

export function TenGodsList({
  tenGods,
  className = '',
}: { tenGods?: Record<string, string | number>; className?: string }) {
  const entries = tenGods ? Object.entries(tenGods) : [];
  if (!entries.length) return null;
  return (
    <div
      className={`rounded-lg border bg-card p-4 ${className}`}
      data-testid="bazi-ten-gods"
    >
      <h3 className="mb-2 font-semibold">十神</h3>
      <ul className="grid grid-cols-2 gap-2 text-sm">
        {entries.map(([k, v]) => (
          <li key={k} className="flex items-center gap-2">
            <span className="text-muted-foreground">{k}</span>
            <span className="font-mono">{String(v)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
