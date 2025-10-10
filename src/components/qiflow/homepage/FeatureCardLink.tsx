'use client';

import { LocaleLink } from '@/i18n/navigation';
import { trackFeatureCardClick } from '@/lib/analytics/conversion-tracking';

interface FeatureCardLinkProps {
  href: string;
  feature: 'bazi' | 'xuankong' | 'ai';
  priority: 'primary' | 'secondary' | 'tertiary';
  className: string;
  children: React.ReactNode;
}

export const FeatureCardLink = ({
  href,
  feature,
  priority,
  className,
  children,
}: FeatureCardLinkProps) => {
  const handleClick = () => {
    trackFeatureCardClick({
      feature,
      priority,
      from_section: 'grid',
    });
  };

  return (
    <LocaleLink href={href} className={className} onClick={handleClick}>
      {children}
    </LocaleLink>
  );
};
