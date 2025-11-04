import { cn } from '@/lib/utils';
import Image from 'next/image';

export function MkSaaSLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/qiflowai.png"
      alt="Logo of QiFlow AI"
      title="Logo of QiFlow AI"
      width={96}
      height={96}
      className={cn('size-8 rounded-md', className)}
    />
  );
}
