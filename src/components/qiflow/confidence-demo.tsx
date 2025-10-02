/**
 * 置信度三色联动系统演示组件
 * 展示不同置信度下的UI状态
 */

'use client'

import { useState } from 'react'
import { ConfidenceIndicator, ConfidenceProgress, ConfidenceIcon } from './confidence-indicator'
import { ResultDisplay } from './result-display'
import { FormValidator } from './form-validator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

export function ConfidenceDemo() {
  const [confidence, setConfidence] = useState(0.5)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'bazi' | 'xuankong' | 'compass'>('bazi')

  // 模拟算法结果
  const mockResults = {
    bazi: {
      type: 'bazi' as const,
      confidence,
      data: {
        birthInfo: {
          datetime: '1990-05-10T12:30:00',
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
          overall: confidence,
          wealth: confidence * 0.9,
          career: confidence * 1.1,
          health: confidence * 0.8,
          relationship: confidence * 1.2,
        },
        suggestions: [
          '发挥你的创造力和才华',
          '注意情绪管理，保持谦逊',
          '在事业上稳步发展，不要急于求成',
        ],
      },
      meta: {
        algorithm: 'enhanced-bazi',
        version: '1.0.0',
        processingTime: 1200,
      },
    },
    xuankong: {
      type: 'xuankong' as const,
      confidence,
      data: {
        period: 8,
        plates: {},
        evaluation: {},
        geju: {
          type: '食神生财格',
          strength: confidence,
          characteristics: ['才华横溢', '财运亨通', '人际关系良好'],
        },
        wenchangwei: [1, 4, 7],
        caiwei: [2, 5, 8],
      },
      meta: {
        algorithm: 'flying-star',
        version: '1.0.0',
        processingTime: 800,
      },
    },
    compass: {
      type: 'compass' as const,
      confidence,
      data: {
        reading: {
          magnetic: 45.2,
          true: 47.1,
          confidence: confidence > 0.7 ? 'high' : confidence > 0.4 ? 'medium' : 'low',
          accuracy: confidence,
        },
        calibration: {
          magnetic: confidence > 0.6,
          trueNorth: confidence > 0.7,
        },
        sensors: {
          accelerometer: confidence > 0.5,
          magnetometer: confidence > 0.6,
          gyroscope: confidence > 0.4,
        },
      },
      meta: {
        algorithm: 'enhanced-compass',
        version: '1.0.0',
        processingTime: 300,
      },
    },
  }

  const mockInput = {
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">QiFlow 置信度三色联动系统</h1>
        <p className="text-gray-600">演示不同置信度下的UI状态变化</p>
      </div>

      {/* 置信度控制面板 */}
      <Card>
        <CardHeader>
          <CardTitle>置信度控制面板</CardTitle>
          <CardDescription>调整置信度查看UI状态变化</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">置信度: {Math.round(confidence * 100)}%</label>
            <Slider
              value={[confidence]}
              onValueChange={([value]) => setConfidence(value)}
              max={1}
              min={0}
              step={0.01}
              className="w-full"
            />
          </div>
          
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

      {/* 置信度指示器展示 */}
      <Card>
        <CardHeader>
          <CardTitle>置信度指示器</CardTitle>
          <CardDescription>不同置信度下的指示器状态</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <ConfidenceIndicator confidence={confidence} />
            <ConfidenceIcon confidence={confidence} size="lg" />
          </div>
          
          <ConfidenceProgress confidence={confidence} />
        </CardContent>
      </Card>

      {/* 表单验证演示 */}
      <Card>
        <CardHeader>
          <CardTitle>表单验证</CardTitle>
          <CardDescription>实时验证输入并显示置信度状态</CardDescription>
        </CardHeader>
        <CardContent>
          <FormValidator
            algorithm={selectedAlgorithm}
            input={mockInput[selectedAlgorithm]}
          />
        </CardContent>
      </Card>

      {/* 结果展示演示 */}
      <Card>
        <CardHeader>
          <CardTitle>结果展示</CardTitle>
          <CardDescription>根据置信度显示不同的结果状态</CardDescription>
        </CardHeader>
        <CardContent>
          <ResultDisplay
            result={mockResults[selectedAlgorithm]}
            showConfidence={true}
            showDetails={true}
          />
        </CardContent>
      </Card>

      {/* 阈值说明 */}
      <Card>
        <CardHeader>
          <CardTitle>阈值说明</CardTitle>
          <CardDescription>置信度阈值和对应的UI状态</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-2xl mb-2">❌</div>
              <div className="font-semibold text-red-800">红色拒答</div>
              <div className="text-sm text-red-600">置信度 &lt; 40%</div>
              <div className="text-xs text-red-500 mt-1">分析结果不可信，拒绝显示</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-2xl mb-2">⚠️</div>
              <div className="font-semibold text-yellow-800">黄色提示</div>
              <div className="text-sm text-yellow-600">置信度 40% - 70%</div>
              <div className="text-xs text-yellow-500 mt-1">分析结果一般，谨慎参考</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl mb-2">✅</div>
              <div className="font-semibold text-green-800">绿色正常</div>
              <div className="text-sm text-green-600">置信度 ≥ 70%</div>
              <div className="text-xs text-green-500 mt-1">分析结果可信，可以放心参考</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

