'use client';

import { LocaleLink } from '@/i18n/navigation';
import { trackHeroCTAClick } from '@/lib/analytics/conversion-tracking';

interface HeroCTAButtonProps {
  href: string;
  variant: 'A' | 'B';
  ctaType: 'primary' | 'secondary' | 'tertiary';
  ctaText: string;
  className: string;
  children: React.ReactNode;
}

export const HeroCTAButton = ({
  href,
  variant,
  ctaType,
  ctaText,
  className,
  children,
}: HeroCTAButtonProps) => {
  const handleClick = () => {
    trackHeroCTAClick({
      variant,
      position: 'above_fold',
      cta_text: ctaText,
      cta_type: ctaType,
    });
  };

  return (
    <LocaleLink href={href} className={className} onClick={handleClick}>
      {children}
    </LocaleLink>
  );
};
