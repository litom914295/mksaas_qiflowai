import React from 'react'

interface ConfidenceIndicatorProps {
  confidence: number
  className?: string
}

export function ConfidenceIndicator({ confidence, className }: ConfidenceIndicatorProps) {
  const getColor = (conf: number) => {
    if (conf < 0.4) return 'text-red-600'
    if (conf < 0.7) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-3 h-3 rounded-full ${getColor(confidence).replace('text-', 'bg-')}`} />
      <span className={`text-sm font-medium ${getColor(confidence)}`}>
        {Math.round(confidence * 100)}%
      </span>
    </div>
  )
}

export function ConfidenceBadge({ confidence }: { confidence: number }) {
  return <ConfidenceIndicator confidence={confidence} />
}

export function ConfidenceProgress({ confidence }: { confidence: number }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`h-2 rounded-full ${
          confidence < 0.4 ? 'bg-red-500' : 
          confidence < 0.7 ? 'bg-yellow-500' : 'bg-green-500'
        }`}
        style={{ width: `${confidence * 100}%` }}
      />
    </div>
  )
}

export function ConfidenceIcon({ confidence }: { confidence: number }) {
  const getIcon = (conf: number) => {
    if (conf < 0.4) return '⚠️'
    if (conf < 0.7) return '⚡'
    return '✅'
  }

  return <span className="text-lg">{getIcon(confidence)}</span>
}