/**
 * 算法结果展示组件
 * 统一展示八字、玄空风水、罗盘等算法的分析结果
 */

import { cn } from '@/lib/utils'
import { ConfidenceIndicator, ConfidenceProgress } from './confidence-indicator'
import { getConfidenceLevel, CONFIDENCE_STATES } from '@/config/qiflow-thresholds'

interface BaseResult {
  confidence?: number
  meta?: {
    algorithm?: string
    version?: string
    processingTime?: number
  }
}

interface BaziResult extends BaseResult {
  type: 'bazi'
  data: {
    birthInfo: {
      datetime: string
      gender: string
      timezone: string
    }
    pillars: {
      year: { heavenly: string; earthly: string }
      month: { heavenly: string; earthly: string }
      day: { heavenly: string; earthly: string }
      hour: { heavenly: string; earthly: string }
    }
    score: {
      overall: number
      wealth: number
      career: number
      health: number
      relationship: number
    }
    suggestions: string[]
  }
}

interface XuankongResult extends BaseResult {
  type: 'xuankong'
  data: {
    period: number
    plates: Record<string, any>
    evaluation: Record<string, any>
    geju: {
      type: string
      strength: number
      characteristics: string[]
    }
    wenchangwei: number[]
    caiwei: number[]
  }
}

interface CompassResult extends BaseResult {
  type: 'compass'
  data: {
    reading: {
      magnetic: number
      true: number
      confidence: 'high' | 'medium' | 'low'
      accuracy: number
    }
    calibration: {
      magnetic: boolean
      trueNorth: boolean
    }
    sensors: {
      accelerometer: boolean
      magnetometer: boolean
      gyroscope: boolean
    }
  }
}

type AlgorithmResult = BaziResult | XuankongResult | CompassResult

interface ResultDisplayProps {
  result: AlgorithmResult
  showConfidence?: boolean
  showDetails?: boolean
  className?: string
}

export function ResultDisplay({
  result,
  showConfidence = true,
  showDetails = true,
  className,
}: ResultDisplayProps) {
  const confidence = result.confidence || 0.5
  const level = getConfidenceLevel(confidence)
  const state = CONFIDENCE_STATES[level]

  // 如果置信度过低，显示拒答状态
  if (level === 'reject') {
    return (
      <div className={cn(
        'p-6 rounded-lg border-2 border-dashed',
        state.bgColor,
        state.borderColor,
        className
      )}>
        <div className="text-center">
          <div className="text-2xl mb-2">{state.icon}</div>
          <h3 className={cn('text-lg font-semibold mb-2', state.textColor)}>
            {state.label}
          </h3>
          <p className={cn('text-sm', state.textColor)}>
            {state.message}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* 置信度指示器 */}
      {showConfidence && (
        <div className="flex items-center justify-between">
          <ConfidenceIndicator confidence={confidence} />
          {result.meta?.processingTime && (
            <span className="text-xs text-gray-500">
              处理时间: {result.meta.processingTime}ms
            </span>
          )}
        </div>
      )}

      {/* 结果内容 */}
      <div className="space-y-4">
        {result.type === 'bazi' && <BaziResultContent result={result} />}
        {result.type === 'xuankong' && <XuankongResultContent result={result} />}
        {result.type === 'compass' && <CompassResultContent result={result} />}
      </div>

      {/* 详细信息 */}
      {showDetails && result.meta && (
        <div className="text-xs text-gray-500 border-t pt-2">
          <p>算法: {result.meta.algorithm || '未知'}</p>
          <p>版本: {result.meta.version || '未知'}</p>
        </div>
      )}
    </div>
  )
}

/**
 * 八字结果内容组件
 */
function BaziResultContent({ result }: { result: BaziResult }) {
  const { data } = result

  return (
    <div className="space-y-4">
      {/* 基本信息 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">基本信息</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>出生时间: {data.birthInfo.datetime}</div>
          <div>性别: {data.birthInfo.gender}</div>
          <div>时区: {data.birthInfo.timezone}</div>
        </div>
      </div>

      {/* 四柱 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">四柱八字</h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-white p-2 rounded">
            <div className="text-xs text-gray-500">年柱</div>
            <div className="font-mono">{data.pillars.year.heavenly}{data.pillars.year.earthly}</div>
          </div>
          <div className="bg-white p-2 rounded">
            <div className="text-xs text-gray-500">月柱</div>
            <div className="font-mono">{data.pillars.month.heavenly}{data.pillars.month.earthly}</div>
          </div>
          <div className="bg-white p-2 rounded">
            <div className="text-xs text-gray-500">日柱</div>
            <div className="font-mono">{data.pillars.day.heavenly}{data.pillars.day.earthly}</div>
          </div>
          <div className="bg-white p-2 rounded">
            <div className="text-xs text-gray-500">时柱</div>
            <div className="font-mono">{data.pillars.hour.heavenly}{data.pillars.hour.earthly}</div>
          </div>
        </div>
      </div>

      {/* 评分 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">综合评分</h3>
        <div className="space-y-2">
          <ConfidenceProgress confidence={data.score.overall} />
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>财运: {Math.round(data.score.wealth * 100)}%</div>
            <div>事业: {Math.round(data.score.career * 100)}%</div>
            <div>健康: {Math.round(data.score.health * 100)}%</div>
            <div>感情: {Math.round(data.score.relationship * 100)}%</div>
          </div>
        </div>
      </div>

      {/* 建议 */}
      {data.suggestions.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">建议</h3>
          <ul className="space-y-1 text-sm">
            {data.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/**
 * 玄空风水结果内容组件
 */
function XuankongResultContent({ result }: { result: XuankongResult }) {
  const { data } = result

  return (
    <div className="space-y-4">
      {/* 基本信息 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">玄空风水分析</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>运盘: {data.period}运</div>
          <div>格局: {data.geju.type}</div>
        </div>
      </div>

      {/* 格局分析 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">格局分析</h3>
        <div className="space-y-2">
          <ConfidenceProgress confidence={data.geju.strength} />
          <div className="text-sm">
            <p className="mb-2">特点:</p>
            <ul className="space-y-1">
              {data.geju.characteristics.map((char, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-gray-500 mt-0.5">•</span>
                  <span>{char}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 文昌位和财位 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2 text-yellow-800">文昌位</h3>
          <div className="text-sm text-yellow-700">
            {data.wenchangwei.join(', ')}宫
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2 text-green-800">财位</h3>
          <div className="text-sm text-green-700">
            {data.caiwei.join(', ')}宫
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 罗盘结果内容组件
 */
function CompassResultContent({ result }: { result: CompassResult }) {
  const { data } = result

  return (
    <div className="space-y-4">
      {/* 读数 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">罗盘读数</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white p-3 rounded">
            <div className="text-xs text-gray-500">磁北</div>
            <div className="text-lg font-mono">{data.reading.magnetic.toFixed(1)}°</div>
          </div>
          <div className="bg-white p-3 rounded">
            <div className="text-xs text-gray-500">真北</div>
            <div className="text-lg font-mono">{data.reading.true.toFixed(1)}°</div>
          </div>
        </div>
        <div className="mt-2 text-center">
          <ConfidenceProgress confidence={data.reading.accuracy} />
        </div>
      </div>

      {/* 传感器状态 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">传感器状态</h3>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className={data.sensors.accelerometer ? 'text-green-500' : 'text-red-500'}>
              {data.sensors.accelerometer ? '✅' : '❌'}
            </span>
            <span>加速度计</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={data.sensors.magnetometer ? 'text-green-500' : 'text-red-500'}>
              {data.sensors.magnetometer ? '✅' : '❌'}
            </span>
            <span>磁力计</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={data.sensors.gyroscope ? 'text-green-500' : 'text-red-500'}>
              {data.sensors.gyroscope ? '✅' : '❌'}
            </span>
            <span>陀螺仪</span>
          </div>
        </div>
      </div>

      {/* 校准状态 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">校准状态</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className={data.calibration.magnetic ? 'text-green-500' : 'text-yellow-500'}>
              {data.calibration.magnetic ? '✅' : '⚠️'}
            </span>
            <span>磁偏角校准</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={data.calibration.trueNorth ? 'text-green-500' : 'text-yellow-500'}>
              {data.calibration.trueNorth ? '✅' : '⚠️'}
            </span>
            <span>真北校准</span>
          </div>
        </div>
      </div>
    </div>
  )
}

