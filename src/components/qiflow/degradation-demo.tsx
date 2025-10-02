/**
 * 降级处理演示组件
 * 展示低置信度降级与手动输入兜底机制
 */

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ManualInputForm } from './manual-input-form'
import { ResultDisplay } from './result-display'
import { ConfidenceIndicator } from './confidence-indicator'
import { 
  getDegradationResult, 
  type DegradationResult,
  type FallbackOption 
} from '@/lib/qiflow/degradation'

export function DegradationDemo() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'bazi' | 'xuankong' | 'compass'>('bazi')
  const [confidence, setConfidence] = useState(0.3) // 低置信度
  const [showManualForm, setShowManualForm] = useState(false)
  const [selectedOption, setSelectedOption] = useState<FallbackOption | null>(null)
  const [manualResult, setManualResult] = useState<any>(null)

  // 模拟输入数据
  const mockInputs = {
    bazi: {
      datetime: '1990-05-10T12:30:00',
      gender: 'male',
      timezone: 'Asia/Shanghai',
    },
    xuankong: {
      facing: 180,
      observedAt: new Date().toISOString(),
      address: '北京市朝阳区',
    },
    compass: {
      accelerometer: { x: 0, y: 0, z: 9.8 },
      magnetometer: { x: 20, y: 0, z: 0 },
      gyroscope: { x: 0, y: 0, z: 0 },
    },
  }

  const degradationResult = getDegradationResult(
    confidence, 
    selectedAlgorithm, 
    mockInputs[selectedAlgorithm]
  )

  const handleManualInput = (data: Record<string, any>) => {
    // 模拟手动输入处理结果
    const mockManualResults = {
      bazi: {
        type: 'bazi' as const,
        confidence: 0.85,
        data: {
          birthInfo: {
            datetime: '手动输入',
            gender: 'male',
            timezone: 'Asia/Shanghai',
          },
          pillars: {
            year: { heavenly: '甲', earthly: '子' },
            month: { heavenly: '乙', earthly: '丑' },
            day: { heavenly: '丙', earthly: '寅' },
            hour: { heavenly: '丁', earthly: '卯' },
          },
          score: {
            overall: 0.85,
            wealth: 0.8,
            career: 0.9,
            health: 0.8,
            relationship: 0.85,
          },
          suggestions: [
            '基于手动输入的八字信息进行分析',
            '信息准确，可以放心参考',
            '建议结合其他信息进行综合判断',
          ],
        },
        meta: {
          algorithm: 'manual-bazi',
          version: '1.0.0',
          processingTime: 500,
        },
      },
      xuankong: {
        type: 'xuankong' as const,
        confidence: 0.9,
        data: {
          period: 8,
          plates: {},
          evaluation: {},
          geju: {
            type: '手动输入格局',
            strength: 0.9,
            characteristics: ['手动输入', '高精度'],
          },
          wenchangwei: [1, 4, 7],
          caiwei: [2, 5, 8],
        },
        meta: {
          algorithm: 'manual-xuankong',
          version: '1.0.0',
          processingTime: 300,
        },
      },
      compass: {
        type: 'compass' as const,
        confidence: 0.95,
        data: {
          reading: {
            magnetic: parseFloat(data.magnetic || '45.2'),
            true: parseFloat(data.trueNorth || '47.1'),
            confidence: 'high' as const,
            accuracy: 0.95,
          },
          calibration: {
            magnetic: true,
            trueNorth: true,
          },
          sensors: {
            accelerometer: false,
            magnetometer: false,
            gyroscope: false,
          },
        },
        meta: {
          algorithm: 'manual-compass',
          version: '1.0.0',
          processingTime: 100,
        },
      },
    }

    setManualResult(mockManualResults[selectedAlgorithm])
    setShowManualForm(false)
  }

  const handleFallbackSelect = (option: FallbackOption) => {
    setSelectedOption(option)
    if (option.requiresManualInput) {
      setShowManualForm(true)
    } else {
      // 模拟非手动输入的降级处理
      setManualResult({
        type: selectedAlgorithm,
        confidence: option.confidence,
        data: { message: `使用${option.name}进行处理` },
        meta: { algorithm: option.id, version: '1.0.0' },
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">QiFlow 降级处理系统</h1>
        <p className="text-gray-600">演示低置信度降级与手动输入兜底机制</p>
      </div>

      {/* 算法选择 */}
      <Card>
        <CardHeader>
          <CardTitle>算法选择</CardTitle>
          <CardDescription>选择要演示的算法类型</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={selectedAlgorithm === 'bazi' ? 'default' : 'outline'}
              onClick={() => setSelectedAlgorithm('bazi')}
            >
              八字分析
            </Button>
            <Button
              variant={selectedAlgorithm === 'xuankong' ? 'default' : 'outline'}
              onClick={() => setSelectedAlgorithm('xuankong')}
            >
              玄空风水
            </Button>
            <Button
              variant={selectedAlgorithm === 'compass' ? 'default' : 'outline'}
              onClick={() => setSelectedAlgorithm('compass')}
            >
              罗盘读取
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 置信度控制 */}
      <Card>
        <CardHeader>
          <CardTitle>置信度控制</CardTitle>
          <CardDescription>调整置信度查看降级处理效果</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">置信度: {Math.round(confidence * 100)}%</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              className="flex-1"
            />
          </div>
          
          <ConfidenceIndicator confidence={confidence} />
        </CardContent>
      </Card>

      {/* 降级分析 */}
      <Card>
        <CardHeader>
          <CardTitle>降级分析</CardTitle>
          <CardDescription>当前置信度下的降级处理分析</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {degradationResult.shouldReject ? (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-500">❌</span>
                  <span className="font-medium text-red-800">需要降级处理</span>
                </div>
                <p className="text-sm text-red-700">
                  当前置信度 {Math.round(confidence * 100)}% 低于安全阈值 40%
                </p>
              </div>

              {degradationResult.reason && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="font-medium text-yellow-800 mb-2">
                    降级原因: {degradationResult.reason.message}
                  </div>
                  <div className="text-sm text-yellow-700">
                    <div className="font-medium mb-1">建议:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {degradationResult.reason.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium">可用的降级选项:</h4>
                {degradationResult.fallbackOptions.map((option) => (
                  <div
                    key={option.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => handleFallbackSelect(option)}
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
            </div>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span className="font-medium text-green-800">置信度正常</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                当前置信度 {Math.round(confidence * 100)}% 满足要求，无需降级处理
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 手动输入表单 */}
      {showManualForm && (
        <ManualInputForm
          algorithm={selectedAlgorithm}
          confidence={confidence}
          input={mockInputs[selectedAlgorithm]}
          onManualInput={handleManualInput}
          onFallbackSelect={handleFallbackSelect}
        />
      )}

      {/* 降级处理结果 */}
      {manualResult && (
        <Card>
          <CardHeader>
            <CardTitle>降级处理结果</CardTitle>
            <CardDescription>使用降级方案处理后的结果</CardDescription>
          </CardHeader>
          <CardContent>
            <ResultDisplay
              result={manualResult}
              showConfidence={true}
              showDetails={true}
            />
          </CardContent>
        </Card>
      )}

      {/* 降级流程说明 */}
      <Card>
        <CardHeader>
          <CardTitle>降级处理流程</CardTitle>
          <CardDescription>低置信度降级与手动输入兜底机制说明</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-2xl mb-2">1️⃣</div>
                <div className="font-medium text-red-800">检测低置信度</div>
                <div className="text-sm text-red-600 mt-1">
                  当置信度 &lt; 40% 时，系统自动触发降级处理
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-2xl mb-2">2️⃣</div>
                <div className="font-medium text-yellow-800">分析降级原因</div>
                <div className="text-sm text-yellow-600 mt-1">
                  分析输入完整性、数据质量等因素，提供具体建议
                </div>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-2xl mb-2">3️⃣</div>
                <div className="font-medium text-green-800">提供降级选项</div>
                <div className="text-sm text-green-600 mt-1">
                  提供手动输入、重新校准等替代方案
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="font-medium text-blue-800 mb-2">降级策略</div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>强制拒答</strong>: 置信度过低时拒绝显示结果</li>
                <li>• <strong>手动输入兜底</strong>: 提供手动输入表单作为替代方案</li>
                <li>• <strong>重新校准</strong>: 引导用户重新输入或校准设备</li>
                <li>• <strong>简化分析</strong>: 基于现有信息进行简化分析</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

