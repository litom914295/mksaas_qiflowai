'use client';

import React from 'react';

export type LoShuCell = {
  row: number;
  col: number;
  value: string | number;
};

export function LoShuGrid({
  grid,
  className = '',
}: {
  grid?: (string | number)[][];
  className?: string;
}) {
  // 期望 3x3，容错为空时渲染空格局
  const data: (string | number)[][] =
    grid && grid.length === 3
      ? grid
      : [
          ['', '', ''],
          ['', '', ''],
          ['', '', ''],
        ];

  return (
    <div
      className={`grid grid-cols-3 gap-1 ${className}`}
      data-testid="loshu-grid"
    >
      {data.flatMap((row, rIdx) =>
        row.map((cell, cIdx) => (
          <div
            key={`${rIdx}-${cIdx}`}
            className="flex h-16 items-center justify-center rounded border bg-card text-sm"
          >
            <span className="font-mono">{String(cell)}</span>
          </div>
        ))
      )}
    </div>
  );
}
