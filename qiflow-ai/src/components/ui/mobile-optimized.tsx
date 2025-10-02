import React from 'react'
import { cn } from '@/lib/utils'

export interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  center?: boolean
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg', 
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full'
}

const paddingClasses = {
  none: '',
  sm: 'px-3 sm:px-4',
  md: 'px-4 sm:px-6 lg:px-8',
  lg: 'px-6 sm:px-8 lg:px-12'
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  maxWidth = 'lg',
  padding = 'md',
  center = true,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        center && 'mx-auto',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface MobileOptimizedFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  spacing?: 'compact' | 'comfortable' | 'spacious'
}

const spacingClasses = {
  compact: 'space-y-3',
  comfortable: 'space-y-4',
  spacious: 'space-y-6'
}

export const MobileOptimizedForm: React.FC<MobileOptimizedFormProps> = ({
  spacing = 'comfortable',
  className,
  children,
  ...props
}) => {
  return (
    <form
      className={cn(
        'w-full',
        spacingClasses[spacing],
        // Touch-friendly spacing on mobile
        'touch-manipulation',
        className
      )}
      {...props}
    >
      {children}
    </form>
  )
}

export interface TouchOptimizedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg' | 'touch'
  fullWidth?: boolean
  loading?: boolean
}

export const TouchOptimizedButton: React.FC<TouchOptimizedButtonProps> = ({
  size = 'md',
  fullWidth = false,
  loading = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-2.5 text-base min-h-[42px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]',
    touch: 'px-6 py-4 text-base min-h-[52px]' // Optimized for touch
  }

  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center',
        'rounded-lg font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-95', // Touch feedback
        
        // Size classes
        sizeClasses[size],
        
        // Full width on mobile
        fullWidth && 'w-full',
        
        // Background and text
        'bg-primary text-primary-foreground',
        'hover:bg-primary/90',
        
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/>
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
      )}
      {children}
    </button>
  )
}

export interface MobileGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: {
    mobile: number
    tablet?: number
    desktop?: number
  }
  gap?: 'sm' | 'md' | 'lg'
}

export const MobileGrid: React.FC<MobileGridProps> = ({
  cols = { mobile: 1 },
  gap = 'md',
  className,
  children,
  ...props
}) => {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4 md:gap-6',
    lg: 'gap-6 md:gap-8'
  }

  const gridClasses = cn(
    'grid',
    `grid-cols-${cols.mobile}`,
    cols.tablet && `md:grid-cols-${cols.tablet}`,
    cols.desktop && `lg:grid-cols-${cols.desktop}`,
    gapClasses[gap]
  )

  return (
    <div className={cn(gridClasses, className)} {...props}>
      {children}
    </div>
  )
}

export interface MobileStackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'tight' | 'normal' | 'loose'
  dividers?: boolean
}

export const MobileStack: React.FC<MobileStackProps> = ({
  spacing = 'normal',
  dividers = false,
  className,
  children,
  ...props
}) => {
  const spacingClasses = {
    tight: 'space-y-2',
    normal: 'space-y-4',
    loose: 'space-y-6'
  }

  return (
    <div
      className={cn(
        'flex flex-col',
        spacingClasses[spacing],
        dividers && 'divide-y divide-border',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default ResponsiveContainer