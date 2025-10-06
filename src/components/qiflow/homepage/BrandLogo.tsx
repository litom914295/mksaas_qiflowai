import Image from 'next/image';
import Link from 'next/link';

export type BrandLogoProps = {
  href?: string;
  className?: string;
  size?: number;
  asLink?: boolean; // 新增参数控制是否渲染为链接
};

export const BrandLogo = ({
  href = '/',
  className = '',
  size = 160,
  asLink = true, // 默认渲染为链接
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
  // 只有当 asLink 为 true 且 href 存在时才生成链接
  return asLink && href && href !== '' ? (
    <Link href={href} aria-label="返回首页" className={className}>
      {img}
    </Link>
  ) : (
    <div className={className}>{img}</div>
  );
};
