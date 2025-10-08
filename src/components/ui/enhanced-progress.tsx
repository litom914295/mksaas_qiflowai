import React from 'react'
import { cn } from '@/lib/utils'

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  variant?: 'default' | 'feng-shui' | 'element'
  element?: 'wood' | 'fire' | 'earth' | 'metal' | 'water'
  showValue?: boolean
  animated?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4'
}

const elementColors = {
  wood: 'bg-green-500',
  fire: 'bg-red-500',
  earth: 'bg-yellow-500', 
  metal: 'bg-gray-500',
  water: 'bg-blue-500'
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'default',
  element,
  showValue = false,
  animated = true,
  size = 'md',
  className,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  let progressClasses = 'bg-primary'
  let containerClasses = 'bg-muted'
  
  if (variant === 'feng-shui') {
    progressClasses = 'bg-gradient-to-r from-primary to-accent'
    containerClasses = 'bg-gradient-to-r from-muted to-secondary'
  }
  
  if (variant === 'element' && element) {
    progressClasses = elementColors[element]
  }
  
  const animationClasses = animated ? 'transition-all duration-500 ease-out' : ''
  
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {showValue && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      
      <div className={cn(
        'w-full rounded-full overflow-hidden',
        sizeClasses[size],
        containerClasses
      )}>
        <div
          className={cn(
            'h-full rounded-full',
            progressClasses,
            animationClasses,
            variant === 'feng-shui' && 'shadow-sm'
          )}
          style={{ width: `${percentage}%` }}
        >
          {variant === 'feng-shui' && (
            <div className="h-full w-full bg-gradient-to-r from-white/20 to-transparent" />
          )}
        </div>
      </div>
    </div>
  )
}

export default ProgressBar