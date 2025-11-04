/**
 * 表单验证组件
 * 在提交前检查输入是否满足阈值要求
 */

import {
  CONFIDENCE_STATES,
  type ConfidenceLevel,
  getAlgorithmThresholds,
  getConfidenceLevel,
  validateAlgorithmInput,
} from '@/config/qiflow-thresholds';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface FormValidatorProps {
  algorithm: 'bazi' | 'xuankong' | 'compass';
  input: Record<string, any>;
  onValidationChange?: (
    isValid: boolean,
    confidence: number,
    missingFields?: string[]
  ) => void;
  className?: string;
  idMap?: Record<string, string>;
}

export function FormValidator({
  algorithm,
  input,
  onValidationChange,
  className,
  idMap,
}: FormValidatorProps) {
  const [validation, setValidation] = useState({
    isValid: false,
    confidence: 0,
    missingFields: [] as string[],
    warnings: [] as string[],
  });

  // 使用 ref 存储回调函数，避免依赖变化
  const onValidationChangeRef = useRef(onValidationChange);
  useEffect(() => {
    onValidationChangeRef.current = onValidationChange;
  }, [onValidationChange]);

  // 使用 JSON.stringify 来比较 input 对象的变化
  const inputStr = JSON.stringify(input);

  useEffect(() => {
    const parsedInput = JSON.parse(inputStr);

    // 验证输入字段
    const fieldValidation = validateAlgorithmInput(algorithm, parsedInput);
    const thresholds = getAlgorithmThresholds(algorithm);

    // 计算置信度（基于字段完整性和质量）
    let confidence = 0.5; // 基础置信度

    // 根据字段完整性调整置信度
    if (fieldValidation.valid) {
      confidence += 0.3;
    } else {
      confidence -= 0.2;
    }

    // 根据算法特定规则调整置信度
    if (algorithm === 'bazi') {
      if (parsedInput.datetime && parsedInput.gender) confidence += 0.2;
      if (parsedInput.timezone) confidence += 0.1;
    } else if (algorithm === 'xuankong') {
      if (
        parsedInput.facing !== undefined &&
        parsedInput.facing >= 0 &&
        parsedInput.facing <= 359
      ) {
        confidence += 0.2;
      }
      if (parsedInput.observedAt) confidence += 0.1;
    } else if (algorithm === 'compass') {
      if (
        parsedInput.accelerometer &&
        parsedInput.magnetometer &&
        parsedInput.gyroscope
      ) {
        confidence += 0.3;
      }
    }

    confidence = Math.max(0, Math.min(1, confidence));

    // 生成警告信息
    const warnings: string[] = [];
    if (confidence < 0.4) {
      warnings.push('输入信息不完整，分析结果可能不准确');
    } else if (confidence < 0.7) {
      warnings.push('建议补充更多信息以获得更准确的分析');
    }

    // 额外：八字需要 HH:mm 合法时间
    let timeValid = true;
    if (algorithm === 'bazi' && typeof parsedInput.datetime === 'string') {
      const m = parsedInput.datetime.match(/\s(\d{2}:\d{2})$/);
      timeValid = !!(m && /^([01]\d|2[0-3]):([0-5]\d)$/.test(m[1]));
      if (!timeValid) {
        warnings.push('时间格式需为 HH:mm（24小时制）');
      }
    }

    const newValidation = {
      isValid: fieldValidation.valid && confidence >= 0.4 && timeValid,
      confidence,
      missingFields: fieldValidation.missingFields,
      warnings,
    };

    setValidation(newValidation);
    onValidationChangeRef.current?.(
      newValidation.isValid,
      confidence,
      newValidation.missingFields
    );
  }, [algorithm, inputStr]);

  const level = getConfidenceLevel(validation.confidence);
  const state = CONFIDENCE_STATES[level];

  if (validation.isValid && validation.confidence >= 0.7) {
    return null; // 验证通过且置信度高，不显示任何提示
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* 置信度指示器 */}
      <div
        className={cn(
          'p-3 rounded-lg border',
          state.bgColor,
          state.borderColor
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{state.icon}</span>
          <div>
            <div className={cn('font-medium', state.textColor)}>
              {state.label}
            </div>
            <div className={cn('text-sm', state.textColor)}>
              置信度: {Math.round(validation.confidence * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* 缺失字段提示 */}
      {validation.missingFields.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-red-800 font-medium mb-1">缺少必要信息:</div>
          <ul className="text-red-700 text-sm space-y-1">
            {validation.missingFields.map((field) => {
              const anchorId = idMap?.[field];
              return (
                <li key={field} className="flex items-center gap-2">
                  <span>•</span>
                  {anchorId ? (
                    <button
                      type="button"
                      className="underline decoration-dashed hover:text-red-800"
                      onClick={() => document.getElementById(anchorId)?.focus()}
                      title="点击定位到该字段"
                    >
                      {getFieldDisplayName(field)}
                    </button>
                  ) : (
                    <span>{getFieldDisplayName(field)}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 警告信息 */}
      {validation.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="text-yellow-800 font-medium mb-1">提示:</div>
          <ul className="text-yellow-700 text-sm space-y-1">
            {validation.warnings.map((warning, index) => (
              <li key={index} className="flex items-center gap-2">
                <span>•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 提交按钮状态提示 */}
      {!validation.isValid && (
        <div className="text-center">
          <button
            disabled
            className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
          >
            请完善必要信息后再提交
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * 获取字段显示名称
 */
function getFieldDisplayName(field: string): string {
  const fieldNames: Record<string, string> = {
    datetime: '出生时间',
    gender: '性别',
    timezone: '时区',
    facing: '朝向角度',
    observedAt: '观察时间',
    accelerometer: '加速度计数据',
    magnetometer: '磁力计数据',
    gyroscope: '陀螺仪数据',
    address: '地址',
    name: '姓名',
  };

  return fieldNames[field] || field;
}

/**
 * 实时验证Hook
 */
export function useFormValidation(
  algorithm: 'bazi' | 'xuankong' | 'compass',
  input: Record<string, any>
) {
  const [validation, setValidation] = useState({
    isValid: false,
    confidence: 0,
    canSubmit: false,
  });

  // 使用 JSON.stringify 来比较 input 对象的变化
  const inputStr = JSON.stringify(input);

  useEffect(() => {
    const parsedInput = JSON.parse(inputStr);
    const fieldValidation = validateAlgorithmInput(algorithm, parsedInput);

    // 计算置信度
    let confidence = 0.5;
    if (fieldValidation.valid) confidence += 0.3;

    // 算法特定调整
    if (algorithm === 'bazi' && parsedInput.datetime && parsedInput.gender)
      confidence += 0.2;
    if (algorithm === 'xuankong' && parsedInput.facing !== undefined)
      confidence += 0.2;
    if (
      algorithm === 'compass' &&
      parsedInput.accelerometer &&
      parsedInput.magnetometer
    )
      confidence += 0.3;

    confidence = Math.max(0, Math.min(1, confidence));

    setValidation({
      isValid: fieldValidation.valid,
      confidence,
      canSubmit: fieldValidation.valid && confidence >= 0.4,
    });
  }, [algorithm, inputStr]);

  return validation;
}
