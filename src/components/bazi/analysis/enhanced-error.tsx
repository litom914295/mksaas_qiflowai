/**
 * 增强的八字分析错误处理组件
 * 提供详细的错误信息、恢复建议和用户友好的错误体验
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertTriangle,
  Clock,
  HelpCircle,
  RefreshCw,
  Settings,
  Shield,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useState } from 'react';

interface EnhancedErrorProps {
  error: string | Error;
  onRetry?: () => void;
  onReset?: () => void;
  context?: {
    birthData?: any;
    stage?: string;
    attempts?: number;
  };
}

// 错误类型分析
function analyzeError(error: string | Error) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const lowerError = errorMessage.toLowerCase();
  
  // 网络相关错误
  if (lowerError.includes('network') || lowerError.includes('fetch') || 
      lowerError.includes('timeout') || lowerError.includes('connection')) {
    return {
      type: 'network',
      title: '网络连接问题',
      icon: WifiOff,
      severity: 'warning',
      description: '无法连接到八字分析服务器',
      suggestions: [
        '检查您的网络连接',
        '等待几秒后重试',
        '尝试刷新页面',
      ],
      recoverable: true,
    };
  }
  
  // 数据验证错误
  if (lowerError.includes('birth') || lowerError.includes('date') || 
      lowerError.includes('time') || lowerError.includes('invalid')) {
    return {
      type: 'validation',
      title: '出生信息验证失败',
      icon: Clock,
      severity: 'error',
      description: '提供的出生时间信息有误或不完整',
      suggestions: [
        '确认出生日期和时间的准确性',
        '检查时区设置是否正确',
        '确保所有必填字段已填写',
      ],
      recoverable: true,
    };
  }
  
  // 计算错误
  if (lowerError.includes('calculate') || lowerError.includes('computation') ||
      lowerError.includes('analysis')) {
    return {
      type: 'calculation',
      title: '八字计算错误',
      icon: AlertTriangle,
      severity: 'error',
      description: '八字分析计算过程中发生异常',
      suggestions: [
        '这可能是临时性问题，请重试',
        '如问题持续，请联系技术支持',
        '可以尝试稍后再次分析',
      ],
      recoverable: true,
    };
  }
  
  // 权限错误
  if (lowerError.includes('permission') || lowerError.includes('auth') ||
      lowerError.includes('credits') || lowerError.includes('premium')) {
    return {
      type: 'permission',
      title: '权限不足',
      icon: Shield,
      severity: 'warning',
      description: '您的账户权限不足以执行此操作',
      suggestions: [
        '检查您的会员状态',
        '确认积分余额充足',
        '考虑升级到专业版',
      ],
      recoverable: false,
    };
  }
  
  // 服务器错误
  if (lowerError.includes('server') || lowerError.includes('500') ||
      lowerError.includes('internal')) {
    return {
      type: 'server',
      title: '服务器内部错误',
      icon: AlertTriangle,
      severity: 'error',
      description: '服务器处理请求时发生错误',
      suggestions: [
        '这是临时性问题，请稍后重试',
        '我们已收到错误报告，正在处理',
        '如急需使用，请联系客服',
      ],
      recoverable: true,
    };
  }
  
  // 默认未知错误
  return {
    type: 'unknown',
    title: '未知错误',
    icon: HelpCircle,
    severity: 'error' as const,
    description: errorMessage,
    suggestions: [
      '尝试重新分析',
      '检查输入信息',
      '联系技术支持',
    ],
    recoverable: true,
  };
}

// 错误代码映射
const errorCodes = {
  'INVALID_BIRTH_DATE': {
    title: '出生日期无效',
    description: '请输入有效的出生日期',
    code: 'E001',
  },
  'INVALID_BIRTH_TIME': {
    title: '出生时间无效',
    description: '请输入有效的出生时间',
    code: 'E002',
  },
  'NETWORK_ERROR': {
    title: '网络连接失败',
    description: '请检查网络连接后重试',
    code: 'E003',
  },
  'SERVER_ERROR': {
    title: '服务器错误',
    description: '服务器暂时无法处理请求',
    code: 'E004',
  },
  'PERMISSION_DENIED': {
    title: '权限不足',
    description: '需要升级会员或充值积分',
    code: 'E005',
  },
};

export function EnhancedError({ 
  error, 
  onRetry, 
  onReset, 
  context 
}: EnhancedErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const errorAnalysis = analyzeError(error);
  const ErrorIcon = errorAnalysis.icon;
  
  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-orange-50 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto px-4">
        {/* 主错误卡片 */}
        <Card className={`border-2 ${
          errorAnalysis.severity === 'error' ? 'border-red-300 bg-red-50/50' :
          errorAnalysis.severity === 'warning' ? 'border-orange-300 bg-orange-50/50' :
          'border-gray-300 bg-gray-50/50'
        } shadow-xl`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${
                errorAnalysis.severity === 'error' ? 'bg-red-500' :
                errorAnalysis.severity === 'warning' ? 'bg-orange-500' :
                'bg-gray-500'
              }`}>
                <ErrorIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {errorAnalysis.title}
                </h2>
                <p className="text-sm text-gray-600 font-normal">
                  八字分析过程中遇到问题
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 错误描述 */}
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-medium mb-2">问题描述</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {errorAnalysis.description}
              </p>
              
              {/* 上下文信息 */}
              {context && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {context.stage && (
                      <div>
                        <span className="text-gray-600">分析阶段：</span>
                        <Badge variant="outline" className="ml-1">
                          {context.stage}
                        </Badge>
                      </div>
                    )}
                    {context.attempts && (
                      <div>
                        <span className="text-gray-600">重试次数：</span>
                        <Badge variant="outline" className="ml-1">
                          {context.attempts}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* 解决建议 */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                解决建议
              </h3>
              <ul className="space-y-2">
                {errorAnalysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-3">
              {errorAnalysis.recoverable && onRetry && (
                <Button 
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="flex-1"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      重试中...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      重新分析
                    </>
                  )}
                </Button>
              )}
              
              {onReset && (
                <Button 
                  variant="outline" 
                  onClick={onReset}
                  className="flex-1"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  重新设置
                </Button>
              )}
              
              {!errorAnalysis.recoverable && (
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/settings/credits'}
                  className="flex-1"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  升级账户
                </Button>
              )}
            </div>
            
            {/* 详细信息切换 */}
            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-gray-600 hover:text-gray-900"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                {showDetails ? '隐藏' : '显示'}技术详情
              </Button>
              
              {showDetails && (
                <div className="mt-3 p-3 bg-gray-100 rounded text-xs font-mono">
                  <div className="space-y-1">
                    <div><span className="font-medium">错误类型：</span>{errorAnalysis.type}</div>
                    <div><span className="font-medium">错误消息：</span>{typeof error === 'string' ? error : error.message}</div>
                    {typeof error === 'object' && error.stack && (
                      <div><span className="font-medium">调用栈：</span><pre className="mt-1 text-xs overflow-x-auto">{error.stack}</pre></div>
                    )}
                    <div><span className="font-medium">时间戳：</span>{new Date().toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* 底部帮助信息 */}
        <div className="mt-6 text-center">
          <Card className="border-gray-200">
            <CardContent className="pt-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">需要帮助？</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                如果问题持续存在，请联系我们的技术支持团队
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" size="sm">
                  在线客服
                </Button>
                <Button variant="outline" size="sm">
                  问题反馈
                </Button>
                <Button variant="outline" size="sm">
                  查看帮助
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}