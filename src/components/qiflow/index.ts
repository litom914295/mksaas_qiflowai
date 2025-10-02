/**
 * QiFlow 组件导出
 * 统一导出所有QiFlow相关组件
 */

// 置信度相关组件
export { 
  ConfidenceIndicator, 
  ConfidenceBadge, 
  ConfidenceProgress, 
  ConfidenceIcon 
} from './confidence-indicator'

// 结果展示组件
export { ResultDisplay } from './result-display'

// 表单验证组件
export { FormValidator, useFormValidation } from './form-validator'

// 积分价格组件
export { CreditsPrice } from './credits-price'

// 罗盘组件
export { ConfidenceBadge as CompassConfidenceBadge } from './compass/ConfidenceBadge'

// 合规组件
export { AgeVerification } from './compliance/AgeVerification'
export { DisclaimerBar } from './compliance/DisclaimerBar'

// 降级处理组件
export { ManualInputForm } from './manual-input-form'

// 校准引导组件
export { CalibrationGuide } from './calibration-guide'
export { EnvironmentCheck } from './environment-check'
export { CalibrationStatus } from './calibration-status'

// 演示组件
export { ConfidenceDemo } from './confidence-demo'
export { DegradationDemo } from './degradation-demo'
export { CalibrationDemo } from './calibration-demo'
