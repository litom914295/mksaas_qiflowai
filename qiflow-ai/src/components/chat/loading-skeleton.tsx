'use client';

import { cn } from '@/lib/utils';

interface ChatLoadingSkeletonProps {
  className?: string;
}

export const ChatLoadingSkeleton = ({
  className,
}: ChatLoadingSkeletonProps) => (
  <div
    className={cn(
      'chat-panel w-full max-w-5xl mx-auto animate-in fade-in space-y-5 p-6',
      className
    )}
  >
    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
      <div className='space-y-2'>
        <div className='h-5 w-36 animate-pulse rounded-full bg-muted' />
        <div className='h-3 w-56 animate-pulse rounded-full bg-muted/80' />
      </div>
      <div className='flex items-center gap-2'>
        <div className='h-8 w-8 animate-pulse rounded-full bg-muted/70' />
        <div className='h-8 w-20 animate-pulse rounded-full bg-muted/70' />
      </div>
    </div>
    <div className='grid gap-3'>
      <div className='h-16 animate-pulse rounded-xl bg-muted/60' />
      <div className='h-12 animate-pulse rounded-xl bg-muted/50' />
      <div className='grid grid-cols-3 gap-3'>
        <div className='h-9 animate-pulse rounded-full bg-muted/60' />
        <div className='h-9 animate-pulse rounded-full bg-muted/60' />
        <div className='h-9 animate-pulse rounded-full bg-muted/60' />
      </div>
    </div>
    <div className='flex flex-col gap-3 lg:flex-row'>
      <div className='h-32 flex-1 animate-pulse rounded-2xl bg-muted/60' />
      <div className='h-32 w-full animate-pulse rounded-2xl bg-muted/40 lg:w-80' />
    </div>
  </div>
);
