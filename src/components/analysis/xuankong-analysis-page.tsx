'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/enhanced-card';
import { ArrowLeft, Compass, Heart, Home, Shield, Sparkles, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { XuankongInputForm, type XuankongFormData } from '../forms/xuankong-input-form';
import { ComprehensiveAnalysisPanel } from './comprehensive-analysis-panel';
import { runComprehensiveAnalysis } from '@/lib/qiflow/xuankong/comprehensive-engine';
import type { ComprehensiveAnalysisResult } from '@/lib/qiflow/xuankong/comprehensive-engine';

export function XuankongAnalysisPage() {
  const router = useRouter();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<ComprehensiveAnalysisResult | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFormSubmit = async (data: XuankongFormData) => {
    console.log('玄空飞星表单提交:', data);
    
    setIsAnalyzing(true);
    setAnalysisData(data);
    
    try {
      // 创建观测日期（使用建筑落成时间）
      const observedAt = new Date(data.completionYear, data.completionMonth - 1, 1);
      
      // 执行玄空飞星分析
      const result = await runComprehensiveAnalysis({
        observedAt,
        facing: { degrees: data.facingDirection },
        location: data.address ? { lat: 0, lon: 0 } : undefined, // 如果有地址，可以后续集成地理编码
        includeLiunian: true,
        includePersonalization: false,
        includeTiguaAnalysis: true,
        includeLingzheng: true,
        includeChengmenjue: true,
        includeTimeSelection: false,
        targetYear: data.currentYear || new Date().getFullYear(),
        config: {
          applyTiGua: true,
          applyFanGua: false,
        },
      });
      
      setAnalysisResult(result);
      setShowAnalysis(true);
      
      // 滚动到分析结果
      setTimeout(() => {
        document.getElementById('analysis-result')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    } catch (error) {
      console.error('玄空飞星分析失败:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRefresh = () => {
    if (analysisData) {
      handleFormSubmit(analysisData);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      {/* 导航栏 */}
      <nav className='bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center gap-4'>
              <Button
                onClick={() => router.back()}
                variant='ghost'
                size='sm'
                className='flex items-center gap-2'
              >
                <ArrowLeft className='w-4 h-4' />
                返回
              </Button>
              <div className='flex items-center gap-2'>
                <Compass className='w-6 h-6 text-indigo-600 dark:text-indigo-400' />
                <h1 className='text-xl font-bold text-gray-900 dark:text-gray-100'>
                  玄空飞星风水分析
                </h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* 页面头部 */}
        {!showAnalysis && (
          <div className='text-center mb-12'>
            <div className='flex items-center justify-center gap-3 mb-4'>
              <Compass className='w-8 h-8 text-indigo-500 dark:text-indigo-400' />
              <Home className='w-8 h-8 text-purple-500 dark:text-purple-400' />
              <Star className='w-8 h-8 text-pink-500 dark:text-pink-400' />
            </div>
            <h2 className='text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4'>
              探索您的风水能量场
            </h2>
            <p className='text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto'>
              基于传统玄空飞星理论，结合现代算法技术，为您的居住环境提供专业的风水分析和优化建议。
            </p>
          </div>
        )}

        {/* 主要内容 */}
        <div className='space-y-8'>
          {/* 输入表单 */}
          <Card className='p-8 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm'>
            <div className='mb-6'>
              <h3 className='text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3'>
                <div className='w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 rounded-lg flex items-center justify-center'>
                  <span className='text-white text-lg'>🏠</span>
                </div>
                填写房屋信息
              </h3>
              <p className='text-gray-600 dark:text-gray-300'>
                请准确填写房屋的方位和时间信息，这将直接影响玄空飞星分析的精度。
              </p>
            </div>

            <XuankongInputForm onSubmit={handleFormSubmit} />
          </Card>

          {/* 分析结果 */}
          {showAnalysis && (
            <div id='analysis-result'>
              <Card className="p-8 shadow-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 backdrop-blur-sm border-2 border-indigo-200 dark:border-indigo-700">
                <div className="mb-6">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 rounded-xl flex items-center justify-center">
                      <Compass className="w-6 h-6 text-white" />
                    </div>
                    玄空飞星综合分析报告
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                    基于传统风水理论与现代分析技术，为您呈现全方位的居住环境评估
                  </p>
                </div>
                
                <ComprehensiveAnalysisPanel
                  analysisResult={analysisResult}
                  isLoading={isAnalyzing}
                  onRefresh={handleRefresh}
                />
              </Card>
            </div>
          )}

          {/* 功能特色 */}
          {!showAnalysis && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-12'>
              <Card
                variant="cultural"
                element="metal" 
                interactive={true}
                className='p-6 text-center group'
              >
                <div className='w-12 h-12 bg-indigo-500 dark:bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200'>
                  <Compass className='w-6 h-6 text-white' />
                </div>
                <h4 className='font-semibold text-indigo-900 dark:text-indigo-100 mb-2'>精准方位测算</h4>
                <p className='text-sm text-indigo-800 dark:text-indigo-200'>
                  采用二十四山向坐标系统，确保方位分析的精确性和权威性。
                </p>
              </Card>

              <Card
                variant="cultural"
                element="earth"
                interactive={true} 
                className='p-6 text-center group'
              >
                <div className='w-12 h-12 bg-purple-500 dark:bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200'>
                  <Star className='w-6 h-6 text-white' />
                </div>
                <h4 className='font-semibold text-purple-900 dark:text-purple-100 mb-2'>飞星盘排布</h4>
                <p className='text-sm text-purple-800 dark:text-purple-200'>
                  自动计算九宫飞星，分析各宫位的吉凶情况和能量分布。
                </p>
              </Card>

              <Card
                variant="cultural"
                element="water"
                interactive={true}
                className='p-6 text-center group'
              >
                <div className='w-12 h-12 bg-pink-500 dark:bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200'>
                  <Shield className='w-6 h-6 text-white' />
                </div>
                <h4 className='font-semibold text-pink-900 dark:text-pink-100 mb-2'>智能优化建议</h4>
                <p className='text-sm text-pink-800 dark:text-pink-200'>
                  基于分析结果，提供个性化的风水调整方案和布局建议。
                </p>
              </Card>
            </div>
          )}
        </div>

        {/* 页脚 */}
        <footer className='mt-16 text-center text-gray-500 dark:text-gray-400'>
          <p className='text-sm'>
            本分析基于传统玄空飞星理论，仅供参考。重大决策请咨询专业风水师。
          </p>
        </footer>
      </div>
    </div>
  );
}
