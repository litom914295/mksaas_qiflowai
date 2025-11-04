'use client';

// P1-003: 八字四柱展示组件
// 功能：展示年柱、月柱、日柱、时柱（如有）

type Props = {
  pillars: {
    year: string;
    month: string;
    day: string;
    hour?: string;
  };
};

export function BaziPillarDisplay({ pillars }: Props) {
  const pillarData = [
    { label: '年柱', value: pillars.year, bg: 'from-red-500 to-red-600' },
    {
      label: '月柱',
      value: pillars.month,
      bg: 'from-orange-500 to-orange-600',
    },
    { label: '日柱', value: pillars.day, bg: 'from-blue-500 to-blue-600' },
    ...(pillars.hour
      ? [
          {
            label: '时柱',
            value: pillars.hour,
            bg: 'from-purple-500 to-purple-600',
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {pillarData.map((pillar, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
        >
          {/* 顶部标签 */}
          <div
            className={`bg-gradient-to-r ${pillar.bg} py-2 px-4 text-center`}
          >
            <span className="text-sm font-bold text-white">{pillar.label}</span>
          </div>

          {/* 柱字展示 */}
          <div className="py-6 px-4 text-center">
            <div className="text-3xl font-bold text-foreground tracking-wider">
              {pillar.value}
            </div>
          </div>

          {/* 装饰元素 */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full pointer-events-none" />
        </div>
      ))}
    </div>
  );
}
