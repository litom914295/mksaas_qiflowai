'use client';

import React from 'react';

export function PillarsChart({
  pillars,
  className = '',
}: {
  pillars?: {
    year?: { heavenly?: string; earthly?: string };
    month?: { heavenly?: string; earthly?: string };
    day?: { heavenly?: string; earthly?: string };
    hour?: { heavenly?: string; earthly?: string };
  };
  className?: string;
}) {
  const items = [
    {
      label: '年柱',
      v: `${pillars?.year?.heavenly ?? ''}${pillars?.year?.earthly ?? ''}`,
    },
    {
      label: '月柱',
      v: `${pillars?.month?.heavenly ?? ''}${pillars?.month?.earthly ?? ''}`,
    },
    {
      label: '日柱',
      v: `${pillars?.day?.heavenly ?? ''}${pillars?.day?.earthly ?? ''}`,
    },
    {
      label: '时柱',
      v: `${pillars?.hour?.heavenly ?? ''}${pillars?.hour?.earthly ?? ''}`,
    },
  ];
  return (
    <div
      className={`grid grid-cols-4 gap-2 text-center ${className}`}
      data-testid="pillars-chart"
    >
      {items.map((it, idx) => (
        <div key={idx} className="rounded border bg-card p-2">
          <div className="text-xs text-muted-foreground">{it.label}</div>
          <div className="font-mono">{it.v}</div>
        </div>
      ))}
    </div>
  );
}
