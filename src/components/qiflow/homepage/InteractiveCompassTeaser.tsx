'use client';

import { useState } from 'react';

export type InteractiveCompassTeaserProps = {
  title: string;
  clockwise: string;
  counterClockwise: string;
  currentDegreeLabel: string;
  variant?: 'A' | 'B';
};

export const InteractiveCompassTeaser = ({
  title,
  clockwise,
  counterClockwise,
  currentDegreeLabel,
  variant = 'A',
}: InteractiveCompassTeaserProps) => {
  const [deg, setDeg] = useState(0);
  const border = variant === 'B' ? 'border-white/15' : 'border-white/10';
  const bg = variant === 'B' ? 'bg-white/6' : 'bg-white/5';
  const duration = variant === 'B' ? '.3s' : '.2s';
  return (
    <section className="mx-auto max-w-screen-xl px-4 py-12">
      <div className={`rounded-lg border ${border} ${bg} p-6`}>
        <div className="mb-3 text-base font-medium text-white/90">{title}</div>
        <div
          className="relative h-40 w-40 select-none"
          role="img"
          aria-label={title}
        >
          <div
            className="absolute inset-0 rounded-full border border-amber-400/50"
            style={{
              transform: `rotate(${deg}deg)`,
              transition: `transform ${duration} ease`,
            }}
          />
          <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400" />
          <div className="absolute left-1/2 top-0 h-4 w-[1px] -translate-x-1/2 bg-amber-400/80" />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className="rounded border border-white/10 px-3 py-1 text-xs text-white/90 hover:bg-white/5"
            onClick={() => setDeg((d) => (d + 15) % 360)}
          >
            {clockwise}
          </button>
          <button
            type="button"
            className="rounded border border-white/10 px-3 py-1 text-xs text-white/90 hover:bg-white/5"
            onClick={() => setDeg((d) => (d - 15 + 360) % 360)}
          >
            {counterClockwise}
          </button>
          <div className="text-xs text-slate-400">
            {currentDegreeLabel}
            {deg}°
          </div>
        </div>
      </div>
    </section>
  );
};
