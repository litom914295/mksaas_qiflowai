import React from 'react'
import { cn } from '@/lib/utils'

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse' | 'feng-shui'
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'spinner',
  className,
  ...props 
}) => {
  if (variant === 'dots') {
    return (
      <div className={cn('flex space-x-1', className)} {...props}>
        <div className={cn('rounded-full bg-primary animate-bounce', sizes[size])} />
        <div className={cn('rounded-full bg-primary animate-bounce', sizes[size])} style={{ animationDelay: '0.1s' }} />
        <div className={cn('rounded-full bg-primary animate-bounce', sizes[size])} style={{ animationDelay: '0.2s' }} />
      </div>
    )
  }
  
  if (variant === 'pulse') {
    return (
      <div className={cn('rounded-full bg-primary animate-pulse', sizes[size], className)} {...props} />
    )
  }
  
  if (variant === 'feng-shui') {
    return (
      <div className={cn('relative', sizes[size], className)} {...props}>
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        <div className="absolute inset-2 rounded-full border border-accent/40 animate-pulse" />
        <div className="absolute inset-3 rounded-full bg-gradient-to-r from-primary to-accent opacity-20" />
      </div>
    )
  }
  
  // Default spinner
  return (
    <div 
      className={cn(
        'animate-spin rounded-full border-2 border-primary/30 border-t-primary',
        sizes[size],
        className
      )}
      {...props}
    />
  )
}

export interface ButtonSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md'
}

export const ButtonSpinner: React.FC<ButtonSpinnerProps> = ({ 
  size = 'sm',
  className,
  ...props 
}) => (
  <LoadingSpinner 
    size={size}
    className={cn('mr-2', className)}
    {...props}
  />
)

export default LoadingSpinner