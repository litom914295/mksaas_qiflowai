import { getTranslations } from 'next-intl/server';

export type FAQProps = { variant?: 'A' | 'B' };

export const FAQ = async ({ variant = 'A' }: FAQProps) => {
  const border = variant === 'B' ? 'border-white/15' : 'border-white/10';
  const bg = variant === 'B' ? 'bg-white/6' : 'bg-white/5';
  const items = [
    {
      q: '八字分析需要什么信息？',
      a: '只需要提供出生年月日时和性别，系统将自动计算八字命盘，并给出专业的分析结果。',
    },
    {
      q: '玄空风水如何测量朝向？',
      a: '可以使用手机罗盘功能，站在门内面向外测量。系统也支持手动输入度数，确保精准度。',
    },
    {
      q: 'AI咨询和算法分析有什么区别？',
      a: '算法分析基于传统命理学规则，结果固定且专业。AI咨询可以回答个性化问题，提供更灵活的建议。',
    },
    {
      q: '积分如何计费？',
      a: '八字分10积分，玄空分20积分，深度解读30积分，AI问答5积分。积分不足时会自动降级到简版结果。',
    },
  ];

  return (
    <section
      aria-label="常见问题"
      className="mx-auto max-w-screen-xl px-4 py-12"
    >
      <h2 className="text-xl font-semibold text-white/90">常见问题</h2>
      <div className="mt-6 divide-y divide-white/10 rounded-lg border p-2 sm:p-4 md:p-6 lg:p-8">
        {items.map((it, idx) => (
          <details
            key={idx}
            className={`group ${bg} rounded-md p-4 sm:p-5 md:p-6 my-3 border ${border}`}
            aria-label={it.q}
          >
            <summary className="cursor-pointer list-none text-base font-medium text-white/90 flex items-center justify-between">
              <span>{it.q}</span>
              <span className="ml-4 text-slate-400 group-open:rotate-45 transition">
                +
              </span>
            </summary>
            <div className="mt-2 text-sm text-slate-300 leading-6">{it.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
};
