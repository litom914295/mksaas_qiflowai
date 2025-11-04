'use client';

import type { CSSProperties } from 'react';
import { memo, useMemo } from 'react';

export type CompassDialProps = {
  angle: number; // 当前角度（0-360，北为0，顺时针）
  size?: number; // 直径
  className?: string;
  style?: CSSProperties;
};

const MOUNTAINS: { name: string; degree: number }[] = [
  { name: '子', degree: 0 },
  { name: '癸', degree: 15 },
  { name: '丑', degree: 30 },
  { name: '艮', degree: 45 },
  { name: '寅', degree: 60 },
  { name: '甲', degree: 75 },
  { name: '卯', degree: 90 },
  { name: '乙', degree: 105 },
  { name: '辰', degree: 120 },
  { name: '巽', degree: 135 },
  { name: '巳', degree: 150 },
  { name: '丙', degree: 165 },
  { name: '午', degree: 180 },
  { name: '丁', degree: 195 },
  { name: '未', degree: 210 },
  { name: '坤', degree: 225 },
  { name: '申', degree: 240 },
  { name: '庚', degree: 255 },
  { name: '酉', degree: 270 },
  { name: '辛', degree: 285 },
  { name: '戌', degree: 300 },
  { name: '乾', degree: 315 },
  { name: '亥', degree: 330 },
  { name: '壬', degree: 345 },
];

function normalizeDeg(d: number) {
  return ((d % 360) + 360) % 360;
}

export const CompassDial = memo(function CompassDial({
  angle,
  size = 224,
  className,
  style,
}: CompassDialProps) {
  const radius = size / 2;
  const center = radius;

  const ticks = useMemo(() => {
    const arr: { deg: number; len: number; stroke: string }[] = [];
    for (let d = 0; d < 360; d += 5) {
      const is90 = d % 90 === 0;
      const is45 = d % 45 === 0;
      const is15 = d % 15 === 0;
      const len = is90 ? 16 : is45 ? 12 : is15 ? 8 : 4;
      arr.push({
        deg: d,
        len,
        stroke: is90 ? '#ef4444' : is45 ? '#0ea5e9' : 'rgba(0,0,0,0.35)',
      });
    }
    return arr;
  }, []);

  const rotate = -normalizeDeg(angle);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={style}
      aria-label="罗盘盘面"
    >
      {/* 背景与外圈 */}
      <defs>
        <radialGradient id="luopan-bg" cx="50%" cy="50%" r="50%">
          <stop
            offset="0%"
            stopColor="var(--luopan-bg-inner, rgba(255,255,255,0.92))"
          />
          <stop
            offset="100%"
            stopColor="var(--luopan-bg-outer, rgba(240,240,240,1))"
          />
        </radialGradient>
      </defs>
      <circle
        cx={center}
        cy={center}
        r={radius - 2}
        fill="url(#luopan-bg)"
        stroke="var(--luopan-border, rgba(0,0,0,0.08))"
      />
      <circle
        cx={center}
        cy={center}
        r={radius - 10}
        fill="none"
        stroke="var(--luopan-ring, rgba(0,0,0,0.15))"
        strokeWidth={2}
      />

      {/* 刻度（随盘旋转） */}
      <g transform={`rotate(${rotate} ${center} ${center})`}>
        {ticks.map((t, i) => {
          const rad = (t.deg * Math.PI) / 180;
          const rOuter = radius - 10;
          const rInner = rOuter - t.len;
          const x1 = center + rOuter * Math.sin(rad);
          const y1 = center - rOuter * Math.cos(rad);
          const x2 = center + rInner * Math.sin(rad);
          const y2 = center - rInner * Math.cos(rad);
          const color =
            t.deg % 90 === 0
              ? 'var(--luopan-tick-major, #ef4444)'
              : t.deg % 45 === 0
                ? 'var(--luopan-tick-mid, #0ea5e9)'
                : 'var(--luopan-tick-minor, rgba(0,0,0,0.35))';
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth={t.deg % 90 === 0 ? 2 : 1}
            />
          );
        })}

        {/* 24山标签 */}
        {MOUNTAINS.map((m, i) => {
          const rad = (m.degree * Math.PI) / 180;
          const rText = radius - 34;
          const x = center + rText * Math.sin(rad);
          const y = center - rText * Math.cos(rad);
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={12}
              fill="var(--luopan-text, #111827)"
            >
              {m.name}
            </text>
          );
        })}
      </g>

      {/* 固定红色十字经纬线（相对屏幕固定，不随盘面旋转） */}
      <line
        x1={center}
        y1={center - (radius - 8)}
        x2={center}
        y2={center + (radius - 8)}
        stroke="var(--luopan-cross, #ef4444)"
        strokeWidth={2.5}
      />
      <line
        x1={center - (radius - 8)}
        y1={center}
        x2={center + (radius - 8)}
        y2={center}
        stroke="var(--luopan-cross, #ef4444)"
        strokeWidth={2}
      />
      <circle
        cx={center}
        cy={center}
        r={4}
        fill="var(--luopan-axis, #38bdf8)"
      />
    </svg>
  );
});
