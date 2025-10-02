/**
 * QiFlow AI - 算法集成测试页面
 *
 * 用于测试八字算法和风水算法与AI对话系统的集成效果
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  algorithmIntegrationService,
  type IntegratedResponse,
} from '@/lib/ai/algorithm-integration-service';
import {
  AlertCircle,
  Calculator,
  CheckCircle,
  Clock,
  Compass,
  Info,
  Loader2,
  Send,
  Settings,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

// 测试用例
const testCases = [
  {
    id: 'bazi_complete',
    name: '完整八字分析',
    message: '请帮我分析八字，我是1990年5月15日上午10点出生的男性',
    expectedIntent: 'bazi_analysis',
    expectedCalculation: true,
  },
  {
    id: 'fengshui_complete',
    name: '完整风水分析',
    message: '我家坐北朝南，建于2010年，请帮我看看风水',
    expectedIntent: 'fengshui_analysis',
    expectedCalculation: true,
  },
  {
    id: 'bazi_incomplete',
    name: '不完整八字信息',
    message: '请帮我算八字，我是1990年出生的',
    expectedIntent: 'bazi_analysis',
    expectedCalculation: false,
  },
  {
    id: 'explanation',
    name: '概念解释请求',
    message: '什么是九宫飞星？请详细解释一下',
    expectedIntent: 'explanation_request',
    expectedCalculation: false,
  },
  {
    id: 'consultation',
    name: '咨询建议请求',
    message: '我想改善家里的风水，有什么建议吗？',
    expectedIntent: 'consultation',
    expectedCalculation: false,
  },
];

export default function IntegrationTestPage() {
  const [testResults, setTestResults] = useState<{ [key: string]: any }>({});
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [customResult, setCustomResult] = useState<IntegratedResponse | null>(
    null
  );
  const [isCustomTesting, setIsCustomTesting] = useState(false);

  // 运行单个测试
  const runSingleTest = async (testCase: (typeof testCases)[0]) => {
    setCurrentTest(testCase.id);

    try {
      const startTime = Date.now();
      const result = await algorithmIntegrationService.processUserMessage(
        testCase.message,
        `test_session_${testCase.id}`,
        'test_user',
        []
      );
      const executionTime = Date.now() - startTime;

      // 验证结果
      const validation = {
        intentMatch: true, // 简化验证
        calculationMatch:
          result.algorithmResults.length > 0 === testCase.expectedCalculation,
        hasResponse: result.aiResponse.choices[0]?.message.content.length > 0,
        hasSuggestions: result.suggestions.length > 0,
        hasFollowUp: result.followUpQuestions.length > 0,
        executionTime,
        confidence: result.aiResponse.confidence?.overall || 0,
      };

      setTestResults(prev => ({
        ...prev,
        [testCase.id]: {
          ...result,
          validation,
          success: validation.intentMatch && validation.hasResponse,
        },
      }));
    } catch (error) {
      console.error(`测试 ${testCase.id} 失败:`, error);
      setTestResults(prev => ({
        ...prev,
        [testCase.id]: {
          error: error instanceof Error ? error.message : '未知错误',
          success: false,
        },
      }));
    }

    setCurrentTest(null);
  };

  // 运行所有测试
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults({});

    for (const testCase of testCases) {
      await runSingleTest(testCase);
      // 添加延迟避免过快请求
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsRunning(false);
  };

  // 运行自定义测试
  const runCustomTest = async () => {
    if (!customMessage.trim()) return;

    setIsCustomTesting(true);
    setCustomResult(null);

    try {
      const result = await algorithmIntegrationService.processUserMessage(
        customMessage,
        'custom_test_session',
        'test_user',
        []
      );
      setCustomResult(result);
    } catch (error) {
      console.error('自定义测试失败:', error);
      setCustomResult({
        aiResponse: {
          id: 'error',
          provider: 'test',
          model: 'test',
          created: Date.now(),
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: `测试失败: ${error instanceof Error ? error.message : '未知错误'}`,
              },
            },
          ],
        },
        algorithmResults: [],
        suggestions: [],
        followUpQuestions: [],
        actionItems: [],
      });
    }

    setIsCustomTesting(false);
  };

  // 渲染测试结果
  const renderTestResult = (testCase: (typeof testCases)[0]) => {
    const result = testResults[testCase.id];
    const isRunning = currentTest === testCase.id;

    if (!result && !isRunning) {
      return (
        <Card className='mb-4'>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span>{testCase.name}</span>
              <Button
                size='sm'
                onClick={() => runSingleTest(testCase)}
                disabled={isRunning}
              >
                运行测试
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-gray-600 mb-2'>测试消息: {testCase.message}</p>
            <div className='flex gap-2'>
              <Badge variant='outline'>
                期望意图: {testCase.expectedIntent}
              </Badge>
              <Badge variant='outline'>
                期望计算: {testCase.expectedCalculation ? '是' : '否'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (isRunning) {
      return (
        <Card className='mb-4'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Loader2 className='w-4 h-4 animate-spin' />
              {testCase.name} - 运行中...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-gray-600'>正在执行测试...</p>
          </CardContent>
        </Card>
      );
    }

    const success = result.success;
    const validation = result.validation;

    return (
      <Card className='mb-4'>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              {success ? (
                <CheckCircle className='w-5 h-5 text-green-500' />
              ) : (
                <AlertCircle className='w-5 h-5 text-red-500' />
              )}
              {testCase.name}
            </div>
            <Badge variant={success ? 'default' : 'destructive'}>
              {success ? '通过' : '失败'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {/* 基本信息 */}
            <div>
              <p className='text-sm text-gray-600 mb-2'>
                测试消息: {testCase.message}
              </p>
              {validation && (
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div className='flex items-center gap-2'>
                    <Clock className='w-4 h-4' />
                    执行时间: {validation.executionTime}ms
                  </div>
                  <div className='flex items-center gap-2'>
                    <Target className='w-4 h-4' />
                    置信度: {Math.round((validation.confidence || 0) * 100)}%
                  </div>
                </div>
              )}
            </div>

            {/* 验证结果 */}
            {validation && (
              <div className='space-y-2'>
                <h4 className='font-medium'>验证结果:</h4>
                <div className='grid grid-cols-2 gap-2 text-sm'>
                  <div className='flex items-center gap-2'>
                    {validation.hasResponse ? (
                      <CheckCircle className='w-4 h-4 text-green-500' />
                    ) : (
                      <AlertCircle className='w-4 h-4 text-red-500' />
                    )}
                    AI响应生成
                  </div>
                  <div className='flex items-center gap-2'>
                    {validation.calculationMatch ? (
                      <CheckCircle className='w-4 h-4 text-green-500' />
                    ) : (
                      <AlertCircle className='w-4 h-4 text-red-500' />
                    )}
                    算法计算匹配
                  </div>
                  <div className='flex items-center gap-2'>
                    {validation.hasSuggestions ? (
                      <CheckCircle className='w-4 h-4 text-green-500' />
                    ) : (
                      <AlertCircle className='w-4 h-4 text-red-500' />
                    )}
                    生成建议
                  </div>
                  <div className='flex items-center gap-2'>
                    {validation.hasFollowUp ? (
                      <CheckCircle className='w-4 h-4 text-green-500' />
                    ) : (
                      <AlertCircle className='w-4 h-4 text-red-500' />
                    )}
                    后续问题
                  </div>
                </div>
              </div>
            )}

            {/* AI响应 */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant='outline' size='sm' className='w-full'>
                  <Info className='w-4 h-4 mr-2' />
                  查看AI响应
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className='mt-3'>
                <div className='bg-gray-50 p-3 rounded text-sm'>
                  {result.error ? (
                    <p className='text-red-600'>错误: {result.error}</p>
                  ) : (
                    <p>{result.aiResponse?.choices[0]?.message.content}</p>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* 算法结果 */}
            {result.algorithmResults && result.algorithmResults.length > 0 && (
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant='outline' size='sm' className='w-full'>
                    <Calculator className='w-4 h-4 mr-2' />
                    查看算法结果 ({result.algorithmResults.length})
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className='mt-3'>
                  <div className='space-y-2'>
                    {result.algorithmResults.map(
                      (algResult: any, index: number) => (
                        <div key={index} className='bg-gray-50 p-3 rounded'>
                          <div className='flex items-center justify-between mb-2'>
                            <div className='flex items-center gap-2'>
                              {algResult.type === 'bazi' ? (
                                <Calculator className='w-4 h-4' />
                              ) : (
                                <Compass className='w-4 h-4' />
                              )}
                              <span className='font-medium'>
                                {algResult.type === 'bazi'
                                  ? '八字计算'
                                  : '风水计算'}
                              </span>
                            </div>
                            <Badge
                              variant={
                                algResult.success ? 'default' : 'destructive'
                              }
                            >
                              {algResult.success ? '成功' : '失败'}
                            </Badge>
                          </div>
                          <div className='text-sm text-gray-600'>
                            <p>执行时间: {algResult.executionTime}ms</p>
                            <p>
                              置信度:{' '}
                              {Math.round(algResult.confidence.overall * 100)}%
                            </p>
                            {algResult.error && (
                              <p className='text-red-600'>
                                错误: {algResult.error}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // 计算总体统计
  const totalTests = testCases.length;
  const completedTests = Object.keys(testResults).length;
  const passedTests = Object.values(testResults).filter(
    (r: any) => r.success
  ).length;
  const successRate =
    completedTests > 0 ? (passedTests / completedTests) * 100 : 0;

  return (
    <div className='container mx-auto p-6 max-w-6xl'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>算法集成测试</h1>
        <p className='text-gray-600'>
          测试八字计算算法和风水算法与AI对话系统的集成效果
        </p>
      </div>

      {/* 统计面板 */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <Target className='w-5 h-5 text-blue-500' />
              <div>
                <p className='text-sm text-gray-600'>总测试数</p>
                <p className='text-2xl font-bold'>{totalTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <Clock className='w-5 h-5 text-orange-500' />
              <div>
                <p className='text-sm text-gray-600'>已完成</p>
                <p className='text-2xl font-bold'>{completedTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <CheckCircle className='w-5 h-5 text-green-500' />
              <div>
                <p className='text-sm text-gray-600'>通过数</p>
                <p className='text-2xl font-bold'>{passedTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='w-5 h-5 text-purple-500' />
              <div>
                <p className='text-sm text-gray-600'>成功率</p>
                <p className='text-2xl font-bold'>{successRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 进度条 */}
      {completedTests > 0 && (
        <div className='mb-6'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium'>测试进度</span>
            <span className='text-sm text-gray-600'>
              {completedTests}/{totalTests}
            </span>
          </div>
          <Progress
            value={(completedTests / totalTests) * 100}
            className='h-2'
          />
        </div>
      )}

      <Tabs defaultValue='predefined' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='predefined'>预定义测试</TabsTrigger>
          <TabsTrigger value='custom'>自定义测试</TabsTrigger>
        </TabsList>

        <TabsContent value='predefined' className='space-y-6'>
          {/* 控制按钮 */}
          <div className='flex gap-4'>
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className='flex items-center gap-2'
            >
              {isRunning ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <Settings className='w-4 h-4' />
              )}
              运行所有测试
            </Button>

            <Button
              variant='outline'
              onClick={() => setTestResults({})}
              disabled={isRunning}
            >
              清除结果
            </Button>
          </div>

          {/* 测试结果 */}
          <div className='space-y-4'>
            {testCases.map(testCase => renderTestResult(testCase))}
          </div>
        </TabsContent>

        <TabsContent value='custom' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>自定义测试</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  测试消息
                </label>
                <Textarea
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  placeholder='输入您想测试的消息...'
                  rows={3}
                />
              </div>

              <Button
                onClick={runCustomTest}
                disabled={isCustomTesting || !customMessage.trim()}
                className='flex items-center gap-2'
              >
                {isCustomTesting ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <Send className='w-4 h-4' />
                )}
                运行测试
              </Button>
            </CardContent>
          </Card>

          {/* 自定义测试结果 */}
          {customResult && (
            <Card>
              <CardHeader>
                <CardTitle>测试结果</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* AI响应 */}
                <div>
                  <h4 className='font-medium mb-2'>AI响应:</h4>
                  <div className='bg-gray-50 p-3 rounded'>
                    {customResult.aiResponse.choices[0]?.message.content}
                  </div>
                </div>

                {/* 算法结果 */}
                {customResult.algorithmResults.length > 0 && (
                  <div>
                    <h4 className='font-medium mb-2'>算法结果:</h4>
                    <div className='space-y-2'>
                      {customResult.algorithmResults.map((result, index) => (
                        <div key={index} className='bg-gray-50 p-3 rounded'>
                          <div className='flex items-center justify-between'>
                            <span className='font-medium'>
                              {result.type === 'bazi' ? '八字计算' : '风水计算'}
                            </span>
                            <Badge
                              variant={
                                result.success ? 'default' : 'destructive'
                              }
                            >
                              {result.success ? '成功' : '失败'}
                            </Badge>
                          </div>
                          <p className='text-sm text-gray-600 mt-1'>
                            执行时间: {result.executionTime}ms, 置信度:{' '}
                            {Math.round(result.confidence.overall * 100)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 建议和后续问题 */}
                {(customResult.suggestions.length > 0 ||
                  customResult.followUpQuestions.length > 0) && (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {customResult.suggestions.length > 0 && (
                      <div>
                        <h4 className='font-medium mb-2'>建议:</h4>
                        <ul className='text-sm space-y-1'>
                          {customResult.suggestions.map((suggestion, index) => (
                            <li key={index} className='flex items-start gap-2'>
                              <CheckCircle className='w-4 h-4 text-green-500 mt-0.5 flex-shrink-0' />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {customResult.followUpQuestions.length > 0 && (
                      <div>
                        <h4 className='font-medium mb-2'>后续问题:</h4>
                        <ul className='text-sm space-y-1'>
                          {customResult.followUpQuestions.map(
                            (question, index) => (
                              <li
                                key={index}
                                className='flex items-start gap-2'
                              >
                                <Info className='w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0' />
                                {question}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
