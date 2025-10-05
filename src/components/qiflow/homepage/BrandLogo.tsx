import Image from 'next/image';
import Link from 'next/link';

export type BrandLogoProps = {
  href?: string;
  className?: string;
  size?: number;
};

export const BrandLogo = ({
  href = '/',
  className = '',
  size = 160,
}: BrandLogoProps) => {
  const img = (
    <Image
      src="/brand/logo-bazi.svg"
      alt="AI 八字风水 Logo"
      width={size}
      height={Math.round(size / 5)}
      priority
    />
  );
  return href ? (
    <Link href={href} aria-label="返回首页" className={className}>
      {img}
    </Link>
  ) : (
    <div className={className}>{img}</div>
  );
};
