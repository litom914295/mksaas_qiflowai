/**
 * 置信度指示器组件
 * 根据置信度显示三色联动状态
 */

import { cn } from '@/lib/utils'
import { 
  getConfidenceLevel, 
  CONFIDENCE_STATES, 
  getConfidencePercentage,
  getConfidenceColorClass,
  getConfidenceBgClass,
  getConfidenceBorderClass,
  type ConfidenceLevel 
} from '@/config/qiflow-thresholds'

interface ConfidenceIndicatorProps {
  confidence: number
  showPercentage?: boolean
  showMessage?: boolean
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ConfidenceIndicator({
  confidence,
  showPercentage = true,
  showMessage = false,
  showIcon = true,
  size = 'md',
  className,
}: ConfidenceIndicatorProps) {
  const level = getConfidenceLevel(confidence)
  const state = CONFIDENCE_STATES[level]
  const percentage = getConfidencePercentage(confidence)

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  }

  const iconSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-md border',
        getConfidenceBgClass(confidence),
        getConfidenceBorderClass(confidence),
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        <span className={iconSizes[size]}>{state.icon}</span>
      )}
      
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={cn('font-medium', getConfidenceColorClass(confidence))}>
            {state.label}
          </span>
          {showPercentage && (
            <span className={cn('text-xs opacity-75', getConfidenceColorClass(confidence))}>
              ({percentage})
            </span>
          )}
        </div>
        
        {showMessage && (
          <p className={cn('text-xs mt-1', getConfidenceColorClass(confidence))}>
            {state.message}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * 简化的置信度徽章组件
 */
interface ConfidenceBadgeProps {
  confidence: number
  className?: string
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  return (
    <ConfidenceIndicator
      confidence={confidence}
      showPercentage={true}
      showMessage={false}
      showIcon={true}
      size="sm"
      className={className}
    />
  )
}

/**
 * 置信度进度条组件
 */
interface ConfidenceProgressProps {
  confidence: number
  showLabel?: boolean
  className?: string
}

export function ConfidenceProgress({ 
  confidence, 
  showLabel = true, 
  className 
}: ConfidenceProgressProps) {
  const level = getConfidenceLevel(confidence)
  const state = CONFIDENCE_STATES[level]
  const percentage = Math.round(confidence * 100)

  const progressColors = {
    reject: 'bg-red-500',
    warning: 'bg-yellow-500',
    normal: 'bg-green-500',
  }

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">置信度</span>
          <span className={cn('text-sm font-medium', getConfidenceColorClass(confidence))}>
            {percentage}%
          </span>
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            progressColors[level]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between items-center mt-1">
        <span className={cn('text-xs', getConfidenceColorClass(confidence))}>
          {state.label}
        </span>
        <span className="text-xs text-gray-500">
          {state.icon}
        </span>
      </div>
    </div>
  )
}

/**
 * 置信度状态图标组件
 */
interface ConfidenceIconProps {
  confidence: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ConfidenceIcon({ 
  confidence, 
  size = 'md', 
  className 
}: ConfidenceIconProps) {
  const level = getConfidenceLevel(confidence)
  const state = CONFIDENCE_STATES[level]

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
  }

  return (
    <span
      className={cn(
        iconSizes[size],
        getConfidenceColorClass(confidence),
        className
      )}
      title={`置信度: ${getConfidencePercentage(confidence)}`}
    >
      {state.icon}
    </span>
  )
}

