'use client';

interface AITypingIndicatorProps {
  visible: boolean;
  className?: string;
}

export const AITypingIndicator = ({
  visible,
  className,
}: AITypingIndicatorProps) => (
  <div
    role="status"
    aria-live="polite"
    className={`flex items-center gap-2 text-xs text-muted-foreground transition-opacity ${visible ? 'opacity-100' : 'opacity-0'} ${className ?? ''}`.trim()}
  >
    <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-primary" />
    <span>AI 大师正在思考...</span>
  </div>
);
