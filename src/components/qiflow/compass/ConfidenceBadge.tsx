'use client'

import { getConfidenceLevel } from '@/config/qiflow-thresholds'

interface ConfidenceBadgeProps {
  value: number
}

export function ConfidenceBadge({ value }: ConfidenceBadgeProps) {
  const level = getConfidenceLevel(value)
  
  const styles = {
    reject: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    normal: 'bg-green-100 text-green-800 border-green-200'
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[level]}`}>
      {level === 'reject' && '❌'}
      {level === 'warning' && '⚠️'}
      {level === 'normal' && '✅'}
      <span className="ml-1">{(value * 100).toFixed(0)}%</span>
    </span>
  )
}