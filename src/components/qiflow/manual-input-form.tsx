/**
 * 手动输入表单组件
 * 提供低置信度情况下的手动输入兜底机制
 */

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  getDegradationResult, 
  type FallbackOption, 
  type DegradationResult 
} from '@/lib/qiflow/degradation'

interface ManualInputFormProps {
  algorithm: 'bazi' | 'xuankong' | 'compass'
  confidence: number
  input: Record<string, any>
  onManualInput: (data: Record<string, any>) => void
  onFallbackSelect: (option: FallbackOption) => void
  className?: string
}

export function ManualInputForm({
  algorithm,
  confidence,
  input,
  onManualInput,
  onFallbackSelect,
  className,
}: ManualInputFormProps) {
  const [selectedOption, setSelectedOption] = useState<FallbackOption | null>(null)
  const [manualData, setManualData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const degradationResult = getDegradationResult(confidence, algorithm, input)

  const handleOptionSelect = (option: FallbackOption) => {
    setSelectedOption(option)
    setErrors({})
    
    if (!option.requiresManualInput) {
      onFallbackSelect(option)
    }
  }

  const handleManualSubmit = () => {
    if (!selectedOption) return

    const validationErrors = validateManualInput(selectedOption.id, manualData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    onManualInput(manualData)
  }

  const validateManualInput = (optionId: string, data: Record<string, any>): Record<string, string> => {
    const errors: Record<string, string> = {}

    switch (optionId) {
      case 'manual-bazi':
        if (!data.yearPillar) errors.yearPillar = '请输入年柱'
        if (!data.monthPillar) errors.monthPillar = '请输入月柱'
        if (!data.dayPillar) errors.dayPillar = '请输入日柱'
        if (!data.hourPillar) errors.hourPillar = '请输入时柱'
        break

      case 'manual-xuankong':
        if (!data.facing || data.facing < 0 || data.facing > 359) {
          errors.facing = '请输入0-359度之间的朝向角度'
        }
        break

      case 'manual-compass':
        if (!data.magnetic || data.magnetic < 0 || data.magnetic > 360) {
          errors.magnetic = '请输入0-360度之间的磁北角度'
        }
        if (!data.trueNorth || data.trueNorth < 0 || data.trueNorth > 360) {
          errors.trueNorth = '请输入0-360度之间的真北角度'
        }
        break
    }

    return errors
  }

  if (!degradationResult.shouldReject) {
    return null
  }

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-red-500">⚠️</span>
          分析结果置信度过低
        </CardTitle>
        <CardDescription>
          当前分析结果置信度为 {Math.round(confidence * 100)}%，低于安全阈值。
          请选择以下替代方案：
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 降级原因 */}
        {degradationResult.reason && (
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium">{degradationResult.reason.message}</div>
                <div className="text-sm">
                  <div className="font-medium mb-1">建议：</div>
                  <ul className="list-disc list-inside space-y-1">
                    {degradationResult.reason.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* 降级选项 */}
        <div className="space-y-3">
          <h3 className="font-medium">替代方案：</h3>
          {degradationResult.fallbackOptions.map((option) => (
            <div
              key={option.id}
              className={cn(
                'p-4 border rounded-lg cursor-pointer transition-colors',
                selectedOption?.id === option.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
              onClick={() => handleOptionSelect(option)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{option.name}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    置信度 {Math.round(option.confidence * 100)}%
                  </Badge>
                  {option.requiresManualInput && (
                    <Badge variant="secondary">需要手动输入</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 手动输入表单 */}
        {selectedOption?.requiresManualInput && (
          <div className="space-y-4">
            <h3 className="font-medium">手动输入信息：</h3>
            
            {selectedOption.id === 'manual-bazi' && (
              <BaziManualInput
                data={manualData}
                onChange={setManualData}
                errors={errors}
              />
            )}

            {selectedOption.id === 'manual-xuankong' && (
              <XuankongManualInput
                data={manualData}
                onChange={setManualData}
                errors={errors}
              />
            )}

            {selectedOption.id === 'manual-compass' && (
              <CompassManualInput
                data={manualData}
                onChange={setManualData}
                errors={errors}
              />
            )}

            <div className="flex gap-2">
              <Button onClick={handleManualSubmit} className="flex-1">
                提交手动输入
              </Button>
              <Button variant="outline" onClick={() => setSelectedOption(null)}>
                取消
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * 八字手动输入组件
 */
function BaziManualInput({
  data,
  onChange,
  errors,
}: {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  errors: Record<string, string>
}) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="yearPillar">年柱</Label>
        <Input
          id="yearPillar"
          placeholder="如：甲子"
          value={data.yearPillar || ''}
          onChange={(e) => handleChange('yearPillar', e.target.value)}
          className={errors.yearPillar ? 'border-red-500' : ''}
        />
        {errors.yearPillar && (
          <p className="text-sm text-red-500 mt-1">{errors.yearPillar}</p>
        )}
      </div>

      <div>
        <Label htmlFor="monthPillar">月柱</Label>
        <Input
          id="monthPillar"
          placeholder="如：乙丑"
          value={data.monthPillar || ''}
          onChange={(e) => handleChange('monthPillar', e.target.value)}
          className={errors.monthPillar ? 'border-red-500' : ''}
        />
        {errors.monthPillar && (
          <p className="text-sm text-red-500 mt-1">{errors.monthPillar}</p>
        )}
      </div>

      <div>
        <Label htmlFor="dayPillar">日柱</Label>
        <Input
          id="dayPillar"
          placeholder="如：丙寅"
          value={data.dayPillar || ''}
          onChange={(e) => handleChange('dayPillar', e.target.value)}
          className={errors.dayPillar ? 'border-red-500' : ''}
        />
        {errors.dayPillar && (
          <p className="text-sm text-red-500 mt-1">{errors.dayPillar}</p>
        )}
      </div>

      <div>
        <Label htmlFor="hourPillar">时柱</Label>
        <Input
          id="hourPillar"
          placeholder="如：丁卯"
          value={data.hourPillar || ''}
          onChange={(e) => handleChange('hourPillar', e.target.value)}
          className={errors.hourPillar ? 'border-red-500' : ''}
        />
        {errors.hourPillar && (
          <p className="text-sm text-red-500 mt-1">{errors.hourPillar}</p>
        )}
      </div>
    </div>
  )
}

/**
 * 玄空风水手动输入组件
 */
function XuankongManualInput({
  data,
  onChange,
  errors,
}: {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  errors: Record<string, string>
}) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="facing">朝向角度</Label>
        <Input
          id="facing"
          type="number"
          min="0"
          max="359"
          placeholder="如：180"
          value={data.facing || ''}
          onChange={(e) => handleChange('facing', e.target.value)}
          className={errors.facing ? 'border-red-500' : ''}
        />
        {errors.facing && (
          <p className="text-sm text-red-500 mt-1">{errors.facing}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          请输入0-359度之间的朝向角度（正北为0度，顺时针计算）
        </p>
      </div>
    </div>
  )
}

/**
 * 罗盘手动输入组件
 */
function CompassManualInput({
  data,
  onChange,
  errors,
}: {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  errors: Record<string, string>
}) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="magnetic">磁北角度</Label>
        <Input
          id="magnetic"
          type="number"
          min="0"
          max="360"
          placeholder="如：45.2"
          value={data.magnetic || ''}
          onChange={(e) => handleChange('magnetic', e.target.value)}
          className={errors.magnetic ? 'border-red-500' : ''}
        />
        {errors.magnetic && (
          <p className="text-sm text-red-500 mt-1">{errors.magnetic}</p>
        )}
      </div>

      <div>
        <Label htmlFor="trueNorth">真北角度</Label>
        <Input
          id="trueNorth"
          type="number"
          min="0"
          max="360"
          placeholder="如：47.1"
          value={data.trueNorth || ''}
          onChange={(e) => handleChange('trueNorth', e.target.value)}
          className={errors.trueNorth ? 'border-red-500' : ''}
        />
        {errors.trueNorth && (
          <p className="text-sm text-red-500 mt-1">{errors.trueNorth}</p>
        )}
      </div>
    </div>
  )
}

