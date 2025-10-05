import { getTranslations } from 'next-intl/server';

export type TestimonialsProps = { variant?: 'A' | 'B' };

export const Testimonials = async ({ variant = 'A' }: TestimonialsProps) => {
  const card =
    variant === 'B'
      ? 'bg-white/6 border-white/15'
      : 'bg-white/5 border-white/10';
  const items = [
    {
      quote: '使用QiFlow后，我终于理解了自己的八字命格。AI解读非常专业，帮助我做出了更好的职业选择。',
      author: '张先生',
      role: '互联网从业者',
    },
    {
      quote: '玄空风水分析非常准确，特别是飞星图表和方位建议。让我的家居布置更加合理。',
      author: '李女士',
      role: '室内设计师',
    },
    {
      quote: 'AI咨询功能太棒了！可以随时提问，答案专业而且易懂。积分计费也很透明，物超所值。',
      author: '王先生',
      role: '企业管理者',
    },
  ];

  return (
    <section
      aria-label="用户评价"
      className="mx-auto max-w-screen-xl px-4 py-12"
    >
      <h2 className="text-xl font-semibold text-white/90">
        用户评价
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {items.map((it, idx) => (
          <figure
            key={idx}
            className={`rounded-lg border ${card} p-6 backdrop-blur-sm`}
          >
            <blockquote className="text-sm text-slate-200 leading-6">
              “{it.quote}”
            </blockquote>
            <figcaption className="mt-4 text-xs text-slate-400">
              <span className="font-medium text-white/90">{it.author}</span>
              <span className="mx-1">·</span>
              <span>{it.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
};
