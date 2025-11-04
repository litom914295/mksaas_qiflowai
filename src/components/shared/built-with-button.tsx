import { MkSaaSLogo } from '@/components/layout/logo-qiflowai';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function BuiltWithButton() {
  return (
    <Link
      target="_blank"
      href="https://qiflowai.com?utm_source=built-with-qiflowai"
      className={cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'border border-border px-4 rounded-md'
      )}
    >
      <span>Powered by QiFlow AI</span>
      <span>
        <MkSaaSLogo className="size-5 rounded-full" />
      </span>
      <span className="font-semibold">QiFlow AI</span>
    </Link>
  );
}
