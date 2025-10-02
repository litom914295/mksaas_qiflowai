/**
 * 降级处理器
 * 在Server Actions中处理低置信度情况
 */

import { 
  getDegradationResult, 
  canDegrade,
  type DegradationResult,
  type FallbackOption 
} from './degradation'

export interface DegradationResponse {
  success: boolean
  shouldReject: boolean
  confidence: number
  degradationResult?: DegradationResult
  fallbackData?: any
  error?: string
}

/**
 * 处理算法结果的降级逻辑
 */
export async function handleDegradation(
  algorithm: 'bazi' | 'xuankong' | 'compass',
  confidence: number,
  input: Record<string, any>,
  result?: any,
  errors?: string[]
): Promise<DegradationResponse> {
  try {
    // 获取降级分析结果
    const degradationResult = getDegradationResult(confidence, algorithm, input, errors)
    
    // 如果不需要降级，直接返回成功
    if (!degradationResult.shouldReject) {
      return {
        success: true,
        shouldReject: false,
        confidence,
        fallbackData: result,
      }
    }

    // 检查是否可以降级处理
    if (!canDegrade(confidence, algorithm)) {
      return {
        success: false,
        shouldReject: true,
        confidence,
        degradationResult,
        error: '无法进行降级处理',
      }
    }

    // 返回降级信息，让前端处理
    return {
      success: false,
      shouldReject: true,
      confidence,
      degradationResult,
      error: '需要降级处理',
    }
  } catch (error) {
    console.error('降级处理错误:', error)
    return {
      success: false,
      shouldReject: true,
      confidence,
      error: error instanceof Error ? error.message : '降级处理失败',
    }
  }
}

/**
 * 处理手动输入的数据
 */
export async function handleManualInput(
  algorithm: 'bazi' | 'xuankong' | 'compass',
  manualData: Record<string, any>,
  originalInput: Record<string, any>
): Promise<DegradationResponse> {
  try {
    let processedData: any
    let confidence = 0.8 // 手动输入的基础置信度

    switch (algorithm) {
      case 'bazi':
        processedData = await processManualBaziInput(manualData, originalInput)
        confidence = 0.85 // 手动输入八字置信度较高
        break

      case 'xuankong':
        processedData = await processManualXuankongInput(manualData, originalInput)
        confidence = 0.9 // 手动输入朝向置信度很高
        break

      case 'compass':
        processedData = await processManualCompassInput(manualData, originalInput)
        confidence = 0.9 // 手动输入方向置信度很高
        break

      default:
        throw new Error(`不支持的算法类型: ${algorithm}`)
    }

    return {
      success: true,
      shouldReject: false,
      confidence,
      fallbackData: processedData,
    }
  } catch (error) {
    console.error('手动输入处理错误:', error)
    return {
      success: false,
      shouldReject: true,
      confidence: 0,
      error: error instanceof Error ? error.message : '手动输入处理失败',
    }
  }
}

/**
 * 处理手动输入的八字数据
 */
async function processManualBaziInput(
  manualData: Record<string, any>,
  originalInput: Record<string, any>
): Promise<any> {
  const { yearPillar, monthPillar, dayPillar, hourPillar } = manualData

  // 验证八字格式
  if (!isValidBaziPillar(yearPillar) || !isValidBaziPillar(monthPillar) ||
      !isValidBaziPillar(dayPillar) || !isValidBaziPillar(hourPillar)) {
    throw new Error('八字格式不正确，请检查输入')
  }

  // 构建八字结果
  return {
    birthInfo: {
      datetime: originalInput.datetime || '手动输入',
      gender: originalInput.gender || 'unknown',
      timezone: originalInput.timezone || 'Asia/Shanghai',
      isTimeKnown: false,
    },
    pillars: {
      year: parseBaziPillar(yearPillar),
      month: parseBaziPillar(monthPillar),
      day: parseBaziPillar(dayPillar),
      hour: parseBaziPillar(hourPillar),
    },
    tenGods: {},
    yongshen: { primary: '木', secondary: ['水'], strength: 0.7, balance: 0.6 },
    luckPillars: [],
    pattern: {
      type: '手动输入格局',
      strength: 0.8,
      characteristics: ['手动输入', '高置信度'],
      advantages: ['信息准确'],
      disadvantages: [],
    },
    score: {
      overall: 0.8,
      wealth: 0.7,
      career: 0.8,
      health: 0.7,
      relationship: 0.8,
    },
    suggestions: [
      '基于手动输入的八字信息进行分析',
      '建议结合其他信息进行综合判断',
    ],
    meta: {
      calculationTime: Date.now(),
      algorithm: 'manual-bazi',
      version: '1.0.0',
    },
  }
}

/**
 * 处理手动输入的玄空风水数据
 */
async function processManualXuankongInput(
  manualData: Record<string, any>,
  originalInput: Record<string, any>
): Promise<any> {
  const { facing } = manualData

  if (facing < 0 || facing > 359) {
    throw new Error('朝向角度必须在0-359度之间')
  }

  return {
    period: 8,
    plates: {},
    evaluation: {},
    meta: {
      rulesApplied: ['手动输入'],
      ambiguous: false,
    },
    geju: {
      type: '手动输入格局',
      strength: 0.9,
      characteristics: ['手动输入', '高精度'],
      advantages: ['朝向准确'],
      disadvantages: [],
      recommendations: ['基于准确朝向进行分析'],
    },
    wenchangwei: [1, 4, 7],
    caiwei: [2, 5, 8],
  }
}

/**
 * 处理手动输入的罗盘数据
 */
async function processManualCompassInput(
  manualData: Record<string, any>,
  originalInput: Record<string, any>
): Promise<any> {
  const { magnetic, trueNorth } = manualData

  if (magnetic < 0 || magnetic > 360 || trueNorth < 0 || trueNorth > 360) {
    throw new Error('角度必须在0-360度之间')
  }

  return {
    reading: {
      magnetic: parseFloat(magnetic),
      true: parseFloat(trueNorth),
      confidence: 'high' as const,
      accuracy: 0.95,
      timestamp: Date.now(),
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
    meta: {
      algorithm: 'manual-compass',
      version: '1.0.0',
      processingTime: 0,
    },
  }
}

/**
 * 验证八字柱格式
 */
function isValidBaziPillar(pillar: string): boolean {
  if (!pillar || typeof pillar !== 'string') return false
  if (pillar.length !== 2) return false
  
  // 简化的验证：检查是否包含天干地支字符
  const heavenlyStems = '甲乙丙丁戊己庚辛壬癸'
  const earthlyBranches = '子丑寅卯辰巳午未申酉戌亥'
  
  const heavenly = pillar[0]
  const earthly = pillar[1]
  
  return heavenlyStems.includes(heavenly) && earthlyBranches.includes(earthly)
}

/**
 * 解析八字柱
 */
function parseBaziPillar(pillar: string): { heavenly: string; earthly: string; element: string; yinYang: 'yin' | 'yang' } {
  const heavenly = pillar[0]
  const earthly = pillar[1]
  
  // 简化的元素和阴阳判断
  const elementMap: Record<string, string> = {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火',
    '戊': '土', '己': '土', '庚': '金', '辛': '金',
    '壬': '水', '癸': '水',
  }
  
  const yinYangMap: Record<string, 'yin' | 'yang'> = {
    '甲': 'yang', '乙': 'yin', '丙': 'yang', '丁': 'yin',
    '戊': 'yang', '己': 'yin', '庚': 'yang', '辛': 'yin',
    '壬': 'yang', '癸': 'yin',
  }
  
  return {
    heavenly,
    earthly,
    element: elementMap[heavenly] || '未知',
    yinYang: yinYangMap[heavenly] || 'yang',
  }
}

