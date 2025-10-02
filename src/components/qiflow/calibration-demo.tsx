/**
 * 校准引导演示组件
 * 完整展示校准引导UX流程
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalibrationGuide } from './calibration-guide'
import { EnvironmentCheck } from './environment-check'
import { CalibrationStatus } from './calibration-status'
import { ConfidenceIndicator } from './confidence-indicator'

export function CalibrationDemo() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'bazi' | 'xuankong' | 'compass'>('compass')
  const [confidence, setConfidence] = useState(0.55) // 中等置信度，触发校准引导
  const [isCalibrated, setIsCalibrated] = useState(false)
  const [lastCalibrationTime, setLastCalibrationTime] = useState<Date | undefined>(undefined)
  const [environmentChecked, setEnvironmentChecked] = useState(false)
  const [environmentIssues, setEnvironmentIssues] = useState<string[]>([])

  const handleCalibrationComplete = () => {
    setIsCalibrated(true)
    setLastCalibrationTime(new Date())
    setConfidence(Math.min(0.95, confidence + 0.2)) // 校准后提升置信度
  }

  const handleEnvironmentCheck = (passed: boolean, issues: string[]) => {
    setEnvironmentChecked(true)
    setEnvironmentIssues(issues)
    if (passed) {
      setConfidence(Math.min(0.9, confidence + 0.1))
    }
  }

  const handleSkipCalibration = () => {
    // 用户选择跳过校准
    console.log('用户跳过校准')
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">QiFlow 校准引导系统</h1>
        <p className="text-gray-600">为置信度0.4~0.7的情况提供校准和环境检查引导</p>
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
          <CardDescription>调整置信度查看校准引导效果</CardDescription>
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

      {/* 主要功能演示 */}
      <Tabs defaultValue="guide" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="guide">校准引导</TabsTrigger>
          <TabsTrigger value="environment">环境检查</TabsTrigger>
          <TabsTrigger value="status">校准状态</TabsTrigger>
        </TabsList>

        {/* 校准引导 */}
        <TabsContent value="guide" className="space-y-4">
          <CalibrationGuide
            algorithm={selectedAlgorithm}
            confidence={confidence}
            onCalibrationComplete={handleCalibrationComplete}
            onSkip={handleSkipCalibration}
          />
        </TabsContent>

        {/* 环境检查 */}
        <TabsContent value="environment" className="space-y-4">
          <EnvironmentCheck
            algorithm={selectedAlgorithm}
            onCheckComplete={handleEnvironmentCheck}
          />

          {environmentChecked && environmentIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>检测到的问题</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {environmentIssues.map((issue, index) => (
                    <li key={index} className="text-sm text-red-600">{issue}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 校准状态 */}
        <TabsContent value="status" className="space-y-4">
          <CalibrationStatus
            algorithm={selectedAlgorithm}
            confidence={confidence}
            isCalibrated={isCalibrated}
            lastCalibrationTime={lastCalibrationTime}
          />

          <Card>
            <CardHeader>
              <CardTitle>校准信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">校准状态</div>
                  <div className="text-lg font-semibold">
                    {isCalibrated ? '✅ 已校准' : '❌ 未校准'}
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">环境检查</div>
                  <div className="text-lg font-semibold">
                    {environmentChecked ? '✅ 已完成' : '⏸️ 未检查'}
                  </div>
                </div>
              </div>

              {isCalibrated && lastCalibrationTime && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600">上次校准时间</div>
                  <div className="text-sm font-medium">
                    {lastCalibrationTime.toLocaleString('zh-CN')}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 校准流程说明 */}
      <Card>
        <CardHeader>
          <CardTitle>校准引导流程说明</CardTitle>
          <CardDescription>置信度0.4~0.7时自动触发的校准引导</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-2xl mb-2">1️⃣</div>
              <div className="font-medium text-yellow-800">检测中等置信度</div>
              <div className="text-sm text-yellow-600 mt-1">
                当置信度在40%-70%之间时，系统自动显示校准建议
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-2xl mb-2">2️⃣</div>
              <div className="font-medium text-blue-800">引导校准步骤</div>
              <div className="text-sm text-blue-600 mt-1">
                提供详细的分步校准指引，包括环境检查和设备校准
              </div>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl mb-2">3️⃣</div>
              <div className="font-medium text-green-800">提升置信度</div>
              <div className="text-sm text-green-600 mt-1">
                校准完成后置信度提升，获得更准确的分析结果
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="font-medium mb-2">校准引导特点</div>
            <ul className="text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong>智能触发</strong>: 仅在置信度0.4~0.7时显示，避免过度打扰</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong>分步引导</strong>: 清晰的步骤说明，用户易于跟随</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong>环境检查</strong>: 自动检测测量环境是否符合要求</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong>可跳过</strong>: 用户可以选择跳过校准，使用当前结果</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span><strong>状态显示</strong>: 实时显示校准质量和影响因素</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
