import { getTranslations } from 'next-intl/server';

export type FourState = 'empty' | 'error' | 'limited' | 'timeout';

export type FourStatesProps = {
  state?: FourState;
  variant?: 'A' | 'B';
};

export const FourStates = async ({
  state = 'empty',
  variant = 'A',
}: FourStatesProps) => {
  const t = await getTranslations('BaziHome');
  const map: Record<FourState, { title: string; desc: string; tone: string }> =
    {
      empty: {
        title: t('states.empty.title'),
        desc: t('states.empty.desc'),
        tone: 'text-slate-300',
      },
      error: {
        title: t('states.error.title'),
        desc: t('states.error.desc'),
        tone: 'text-red-300',
      },
      limited: {
        title: t('states.limited.title'),
        desc: t('states.limited.desc'),
        tone: 'text-amber-300',
      },
      timeout: {
        title: t('states.timeout.title'),
        desc: t('states.timeout.desc'),
        tone: 'text-sky-300',
      },
    };
  const v = map[state];
  const border = variant === 'B' ? 'border-white/15' : 'border-white/10';
  const bg = variant === 'B' ? 'bg-white/6' : 'bg-white/5';
  return (
    <section
      aria-label="系统状态"
      className="mx-auto max-w-screen-xl px-4 py-6"
    >
      <div className={`rounded-md border ${border} ${bg} p-4 ${v.tone}`}>
        <div className="text-sm font-medium">{v.title}</div>
        <div className="text-xs opacity-90">{v.desc}</div>
      </div>
    </section>
  );
};
