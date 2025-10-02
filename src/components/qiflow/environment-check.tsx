/**
 * 环境检查组件
 * 检查测量环境是否符合要求
 */

'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface EnvironmentCheckProps {
  algorithm: 'bazi' | 'xuankong' | 'compass'
  onCheckComplete?: (passed: boolean, issues: string[]) => void
  className?: string
}

interface CheckItem {
  id: string
  name: string
  description: string
  status: 'pending' | 'checking' | 'passed' | 'warning' | 'failed'
  message?: string
  severity: 'info' | 'warning' | 'error'
}

export function EnvironmentCheck({
  algorithm,
  onCheckComplete,
  className,
}: EnvironmentCheckProps) {
  const [checks, setChecks] = useState<CheckItem[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [overallStatus, setOverallStatus] = useState<'idle' | 'checking' | 'complete'>('idle')

  useEffect(() => {
    setChecks(getEnvironmentChecks(algorithm))
  }, [algorithm])

  const handleStartCheck = async () => {
    setIsChecking(true)
    setOverallStatus('checking')

    // 逐个执行检查
    for (let i = 0; i < checks.length; i++) {
      setChecks(prev => prev.map((check, index) => 
        index === i ? { ...check, status: 'checking' as const } : check
      ))

      // 模拟检查过程
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 模拟检查结果（实际应该调用真实的检查函数）
      const result = await performCheck(checks[i], algorithm)
      
      setChecks(prev => prev.map((check, index) => 
        index === i ? { ...check, ...result } : check
      ))
    }

    setIsChecking(false)
    setOverallStatus('complete')

    // 收集问题
    const issues = checks
      .filter(check => check.status === 'warning' || check.status === 'failed')
      .map(check => check.message || check.name)

    const passed = checks.every(check => check.status === 'passed' || check.status === 'warning')
    onCheckComplete?.(passed, issues)
  }

  const getStatusIcon = (status: CheckItem['status']) => {
    switch (status) {
      case 'pending':
        return '⏸️'
      case 'checking':
        return '🔄'
      case 'passed':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'failed':
        return '❌'
    }
  }

  const getStatusColor = (status: CheckItem['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-500'
      case 'checking':
        return 'text-blue-500'
      case 'passed':
        return 'text-green-500'
      case 'warning':
        return 'text-yellow-500'
      case 'failed':
        return 'text-red-500'
    }
  }

  const passedCount = checks.filter(check => check.status === 'passed').length
  const warningCount = checks.filter(check => check.status === 'warning').length
  const failedCount = checks.filter(check => check.status === 'failed').length

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🔍</span>
          环境检查
        </CardTitle>
        <CardDescription>
          检查测量环境是否符合要求，确保获得准确的分析结果
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 检查列表 */}
        <div className="space-y-3">
          {checks.map((check) => (
            <div
              key={check.id}
              className={cn(
                'p-4 rounded-lg border transition-all',
                check.status === 'passed' && 'border-green-200 bg-green-50',
                check.status === 'warning' && 'border-yellow-200 bg-yellow-50',
                check.status === 'failed' && 'border-red-200 bg-red-50',
                check.status === 'checking' && 'border-blue-200 bg-blue-50',
                check.status === 'pending' && 'border-gray-200 bg-gray-50'
              )}
            >
              <div className="flex items-start gap-3">
                <span className={cn('text-xl', getStatusColor(check.status))}>
                  {getStatusIcon(check.status)}
                </span>
                
                <div className="flex-1">
                  <div className="font-medium">{check.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{check.description}</div>
                  
                  {check.message && check.status !== 'pending' && (
                    <Alert className="mt-2">
                      <AlertDescription className="text-sm">
                        {check.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {check.status !== 'pending' && check.status !== 'checking' && (
                  <Badge
                    variant={
                      check.status === 'passed' ? 'default' :
                      check.status === 'warning' ? 'secondary' :
                      'destructive'
                    }
                  >
                    {check.status === 'passed' ? '通过' :
                     check.status === 'warning' ? '警告' :
                     '失败'}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 检查结果摘要 */}
        {overallStatus === 'complete' && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="font-medium mb-2">检查结果摘要</div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-2 bg-green-100 rounded">
                <div className="text-2xl font-bold text-green-700">{passedCount}</div>
                <div className="text-sm text-green-600">通过</div>
              </div>
              <div className="p-2 bg-yellow-100 rounded">
                <div className="text-2xl font-bold text-yellow-700">{warningCount}</div>
                <div className="text-sm text-yellow-600">警告</div>
              </div>
              <div className="p-2 bg-red-100 rounded">
                <div className="text-2xl font-bold text-red-700">{failedCount}</div>
                <div className="text-sm text-red-600">失败</div>
              </div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2">
          {overallStatus === 'idle' && (
            <Button onClick={handleStartCheck} className="flex-1">
              开始检查
            </Button>
          )}
          
          {overallStatus === 'checking' && (
            <Button disabled className="flex-1">
              检查中...
            </Button>
          )}
          
          {overallStatus === 'complete' && (
            <Button onClick={handleStartCheck} variant="outline" className="flex-1">
              重新检查
            </Button>
          )}
        </div>

        {/* 建议 */}
        {overallStatus === 'complete' && (warningCount > 0 || failedCount > 0) && (
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium">建议：</div>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {failedCount > 0 && (
                    <li>请先解决失败的检查项，这些问题会严重影响结果准确性</li>
                  )}
                  {warningCount > 0 && (
                    <li>建议关注警告项，改善这些条件可以提高结果质量</li>
                  )}
                  <li>所有检查项通过后再进行测量，可获得最佳结果</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * 获取算法特定的环境检查项
 */
function getEnvironmentChecks(algorithm: 'bazi' | 'xuankong' | 'compass'): CheckItem[] {
  switch (algorithm) {
    case 'bazi':
      return [
        {
          id: 'time-accuracy',
          name: '出生时间准确性',
          description: '确认出生时间的准确性',
          status: 'pending',
          severity: 'error',
        },
        {
          id: 'timezone-check',
          name: '时区设置',
          description: '检查时区设置是否正确',
          status: 'pending',
          severity: 'warning',
        },
        {
          id: 'input-completeness',
          name: '信息完整性',
          description: '确认所有必要信息已填写',
          status: 'pending',
          severity: 'error',
        },
      ]

    case 'xuankong':
      return [
        {
          id: 'location-check',
          name: '测量位置',
          description: '检查是否在房屋中心位置',
          status: 'pending',
          severity: 'error',
        },
        {
          id: 'metal-interference',
          name: '金属干扰',
          description: '检查周围是否有大型金属物体',
          status: 'pending',
          severity: 'warning',
        },
        {
          id: 'device-level',
          name: '设备水平',
          description: '检查设备是否保持水平',
          status: 'pending',
          severity: 'error',
        },
        {
          id: 'facing-accuracy',
          name: '朝向准确性',
          description: '验证朝向测量的准确性',
          status: 'pending',
          severity: 'error',
        },
      ]

    case 'compass':
      return [
        {
          id: 'sensor-check',
          name: '传感器状态',
          description: '检查设备传感器是否正常工作',
          status: 'pending',
          severity: 'error',
        },
        {
          id: 'magnetic-field',
          name: '磁场环境',
          description: '检查周围磁场干扰情况',
          status: 'pending',
          severity: 'error',
        },
        {
          id: 'device-position',
          name: '设备姿态',
          description: '检查设备是否水平放置',
          status: 'pending',
          severity: 'warning',
        },
        {
          id: 'calibration-status',
          name: '校准状态',
          description: '检查罗盘校准状态',
          status: 'pending',
          severity: 'error',
        },
        {
          id: 'environmental-noise',
          name: '环境干扰',
          description: '检查电磁干扰和环境噪声',
          status: 'pending',
          severity: 'warning',
        },
      ]
  }
}

/**
 * 执行实际的环境检查
 */
async function performCheck(
  check: CheckItem,
  algorithm: 'bazi' | 'xuankong' | 'compass'
): Promise<Partial<CheckItem>> {
  // 模拟检查逻辑（实际应该调用真实的检查函数）
  const random = Math.random()
  
  if (random > 0.8) {
    return {
      status: 'passed',
      message: '检查通过，环境条件良好',
    }
  } else if (random > 0.5) {
    return {
      status: 'warning',
      message: '检测到轻微问题，建议改善环境条件',
    }
  } else {
    return {
      status: 'failed',
      message: '检测到严重问题，请先解决后再继续',
    }
  }
}
