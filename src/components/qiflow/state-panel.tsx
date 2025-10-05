'use client';

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export type PanelState = 'empty' | 'error' | 'limited' | 'timeout';

type Props = {
  state: PanelState;
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
};

export function StatePanel({
  state,
  title,
  description,
  className,
  children,
  actions,
}: Props) {
  const t = useTranslations('QiFlow');

  const defaults = {
    empty: {
      title: t('States.empty.title'),
      desc: t('States.empty.desc'),
      icon: 'ⓘ',
    },
    error: {
      title: t('States.error.title'),
      desc: t('States.error.desc'),
      icon: '⚠️',
    },
    limited: {
      title: t('States.limited.title'),
      desc: t('States.limited.desc'),
      icon: '🛈',
    },
    timeout: {
      title: t('States.timeout.title'),
      desc: t('States.timeout.desc'),
      icon: '⏳',
    },
  } as const;

  const data = defaults[state];

  return (
    <div
      className={cn(
        'rounded-lg border bg-muted p-3 text-sm text-muted-foreground',
        className
      )}
      role={state === 'error' ? 'alert' : 'status'}
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 select-none" aria-hidden>
          {data.icon}
        </span>
        <div>
          <div className="font-medium text-foreground">
            {title ?? data.title}
          </div>
          <div className="text-xs text-muted-foreground">
            {description ?? data.desc}
          </div>
          {children}
          {actions && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
