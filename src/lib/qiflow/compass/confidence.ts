/**
 * 罗盘置信度分析模块
 * 实现罗盘读数置信度的智能评估
 */

import type { SensorData } from './types'

export type ConfidenceLevel = 'low' | 'medium' | 'high'

/**
 * 罗盘置信度阈值常量
 * 与全局QiFlow置信度阈值保持一致
 */
export const COMPASS_CONF_THRESHOLDS = {
	low: 0.4,   // 低于此值触发降级（拒答+手动输入）
	high: 0.7,  // 高于此值为正常，0.4-0.7为中等（校准引导）
} as const

/**
 * 置信度影响因素权重
 */
const CONFIDENCE_WEIGHTS = {
	magneticFieldStrength: 0.25,    // 磁场强度
	sensorStability: 0.25,          // 传感器稳定性
	calibrationStatus: 0.20,        // 校准状态
	environmentalNoise: 0.15,       // 环境干扰
	deviceOrientation: 0.15,        // 设备姿态
} as const

/**
 * 获取置信度级别
 */
export function getConfidenceLevel(value: number): ConfidenceLevel {
	if (Number.isNaN(value)) return 'low'
	if (value < COMPASS_CONF_THRESHOLDS.low) return 'low'
	if (value < COMPASS_CONF_THRESHOLDS.high) return 'medium'
	return 'high'
}

/**
 * 罗盘置信度分析器
 */
export class CompassConfidenceAnalyzer {
	private previousReadings: number[] = []
	private readonly maxHistorySize = 10

	/**
	 * 分析传感器数据并计算置信度
	 */
	analyze(sensorData: SensorData, fusedData?: any): number {
		// 1. 磁场强度评分
		const magneticScore = this.analyzeMagneticFieldStrength(sensorData)

		// 2. 传感器稳定性评分
		const stabilityScore = this.analyzeSensorStability(sensorData)

		// 3. 校准状态评分
		const calibrationScore = this.analyzeCalibrationStatus(sensorData)

		// 4. 环境干扰评分
		const environmentScore = this.analyzeEnvironmentalNoise(sensorData)

		// 5. 设备姿态评分
		const orientationScore = this.analyzeDeviceOrientation(sensorData)

		// 加权计算总置信度
		const confidence = 
			magneticScore * CONFIDENCE_WEIGHTS.magneticFieldStrength +
			stabilityScore * CONFIDENCE_WEIGHTS.sensorStability +
			calibrationScore * CONFIDENCE_WEIGHTS.calibrationStatus +
			environmentScore * CONFIDENCE_WEIGHTS.environmentalNoise +
			orientationScore * CONFIDENCE_WEIGHTS.deviceOrientation

		// 记录历史读数
		this.previousReadings.push(confidence)
		if (this.previousReadings.length > this.maxHistorySize) {
			this.previousReadings.shift()
		}

		return Math.max(0, Math.min(1, confidence))
	}

	/**
	 * 分析磁场强度
	 * 地球磁场强度通常在25-65微特斯拉之间
	 */
	private analyzeMagneticFieldStrength(sensorData: SensorData): number {
		const { x, y, z } = sensorData.magnetometer
		const magnitude = Math.sqrt(x * x + y * y + z * z)

		// 理想磁场强度范围 (微特斯拉)
		const idealMin = 25
		const idealMax = 65

		if (magnitude >= idealMin && magnitude <= idealMax) {
			return 1.0
		} else if (magnitude < idealMin) {
			return Math.max(0, magnitude / idealMin)
		} else {
			// 超过最大值，可能受到强干扰
			return Math.max(0, 1 - (magnitude - idealMax) / idealMax)
		}
	}

	/**
	 * 分析传感器稳定性
	 * 通过历史读数的方差评估
	 */
	private analyzeSensorStability(sensorData: SensorData): number {
		if (this.previousReadings.length < 3) {
			return 0.5 // 数据不足，返回中等分数
		}

		// 计算历史读数的标准差
		const mean = this.previousReadings.reduce((a, b) => a + b, 0) / this.previousReadings.length
		const variance = this.previousReadings.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / this.previousReadings.length
		const stdDev = Math.sqrt(variance)

		// 标准差越小，稳定性越好
		return Math.max(0, 1 - stdDev * 2)
	}

	/**
	 * 分析校准状态
	 */
	private analyzeCalibrationStatus(sensorData: SensorData): number {
		// 如果提供了校准数据，检查其质量
		if (sensorData.calibrationData) {
			const calibrationQuality = this.evaluateCalibrationQuality(sensorData.calibrationData)
			return calibrationQuality
		}

		// 没有校准数据，返回低分
		return 0.3
	}

	/**
	 * 评估校准数据质量
	 */
	private evaluateCalibrationQuality(calibrationData: any): number {
		if (!calibrationData || !Array.isArray(calibrationData)) {
			return 0.3
		}

		// 校准数据应该覆盖多个方向
		if (calibrationData.length < 6) {
			return 0.4
		} else if (calibrationData.length < 12) {
			return 0.7
		} else {
			return 1.0
		}
	}

	/**
	 * 分析环境干扰
	 * 通过加速度计数据判断设备是否在移动
	 */
	private analyzeEnvironmentalNoise(sensorData: SensorData): number {
		const { x, y, z } = sensorData.accelerometer
		const acceleration = Math.sqrt(x * x + y * y + z * z)

		// 重力加速度约9.8 m/s²
		const gravity = 9.8
		const deviation = Math.abs(acceleration - gravity)

		// 偏差越小，环境越稳定
		if (deviation < 0.5) {
			return 1.0
		} else if (deviation < 1.0) {
			return 0.8
		} else if (deviation < 2.0) {
			return 0.5
		} else {
			return 0.2
		}
	}

	/**
	 * 分析设备姿态
	 * 设备应该大致水平放置
	 */
	private analyzeDeviceOrientation(sensorData: SensorData): number {
		const { x, y, z } = sensorData.accelerometer

		// 计算设备与水平面的角度
		const tilt = Math.abs(Math.atan2(Math.sqrt(x * x + y * y), z)) * (180 / Math.PI)

		// 理想情况下，设备应该接近水平（0-15度）
		if (tilt <= 15) {
			return 1.0
		} else if (tilt <= 30) {
			return 0.7
		} else if (tilt <= 45) {
			return 0.4
		} else {
			return 0.1
		}
	}

	/**
	 * 获取置信度诊断信息
	 */
	getDiagnostics(sensorData: SensorData): {
		magneticField: number
		stability: number
		calibration: number
		environment: number
		orientation: number
		overall: number
		level: ConfidenceLevel
		recommendations: string[]
	} {
		const magneticField = this.analyzeMagneticFieldStrength(sensorData)
		const stability = this.analyzeSensorStability(sensorData)
		const calibration = this.analyzeCalibrationStatus(sensorData)
		const environment = this.analyzeEnvironmentalNoise(sensorData)
		const orientation = this.analyzeDeviceOrientation(sensorData)

		const overall = 
			magneticField * CONFIDENCE_WEIGHTS.magneticFieldStrength +
			stability * CONFIDENCE_WEIGHTS.sensorStability +
			calibration * CONFIDENCE_WEIGHTS.calibrationStatus +
			environment * CONFIDENCE_WEIGHTS.environmentalNoise +
			orientation * CONFIDENCE_WEIGHTS.deviceOrientation

		const level = getConfidenceLevel(overall)
		const recommendations = this.generateRecommendations({
			magneticField,
			stability,
			calibration,
			environment,
			orientation,
		})

		return {
			magneticField,
			stability,
			calibration,
			environment,
			orientation,
			overall,
			level,
			recommendations,
		}
	}

	/**
	 * 生成改善建议
	 */
	private generateRecommendations(scores: {
		magneticField: number
		stability: number
		calibration: number
		environment: number
		orientation: number
	}): string[] {
		const recommendations: string[] = []

		if (scores.magneticField < 0.6) {
			recommendations.push('远离电子设备和金属物体，它们会干扰地球磁场')
		}

		if (scores.stability < 0.6) {
			recommendations.push('保持设备稳定，避免移动或震动')
		}

		if (scores.calibration < 0.6) {
			recommendations.push('需要进行罗盘校准，请按照8字形移动设备')
		}

		if (scores.environment < 0.6) {
			recommendations.push('确保设备静止不动，避免在移动中测量')
		}

		if (scores.orientation < 0.6) {
			recommendations.push('保持设备水平放置，屏幕朝上')
		}

		if (recommendations.length === 0) {
			recommendations.push('测量环境良好，可以获得准确的罗盘读数')
		}

		return recommendations
	}

	/**
	 * 重置分析器
	 */
	reset(): void {
		this.previousReadings = []
	}
}

/**
 * 创建置信度分析器实例
 */
export function createConfidenceAnalyzer(): CompassConfidenceAnalyzer {
	return new CompassConfidenceAnalyzer()
}
