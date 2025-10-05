'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/enhanced-card';
import { ArrowLeft, Heart, Shield, Sparkles, Star, Target, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { UserProfileForm } from '../forms/user-profile-form-new';
import { BaziAnalysisResult } from './bazi-analysis-result';

export function BaziAnalysisPage() {
  const t = useTranslations();
  const router = useRouter();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleAnalysisComplete = useCallback((result: any) => {
    console.log('八字分析完成:', result);
    // 可以在这里添加保存分析结果的逻辑
  }, []);

  const handleFormSubmit = async (data: any) => {
    console.log('用户资料提交:', data);

    // 准备八字分析数据
    const baziData = {
      datetime: `${data.birthDate}${data.birthTime ? `T${data.birthTime}` : 'T12:00:00'}`,
      gender: data.gender === 'male' ? 'male' : 'female',
      timezone: 'Asia/Shanghai',
      isTimeKnown: !!data.birthTime,
    };

    setAnalysisData(baziData);
    setShowAnalysis(true);

    // 滚动到分析结果
    setTimeout(() => {
      document.getElementById('analysis-result')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'>
      {/* 导航栏 */}
      <nav className='bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50'>
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
                <Sparkles className='w-6 h-6 text-purple-600' />
                <h1 className='text-xl font-bold text-gray-900'>
                  深度八字命理分析
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
              <Star className='w-8 h-8 text-yellow-500' />
              <Heart className='w-8 h-8 text-red-500' />
              <Sparkles className='w-8 h-8 text-purple-500' />
            </div>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              发现您的命理密码
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              基于专业八字算法，为您提供个性化的人生洞察和运势指引。
              让古老的智慧照亮您的人生道路。
            </p>
          </div>
        )}

        {/* 主要内容 */}
        <div className='space-y-8'>
          {/* 输入表单 */}
          <Card className='p-8 shadow-xl bg-white/90 backdrop-blur-sm'>
            <div className='mb-6'>
              <h3 className='text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3'>
                <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
                  <span className='text-white text-lg'>📝</span>
                </div>
                填写您的基本信息
              </h3>
              <p className='text-gray-600'>
                请准确填写出生信息，这将直接影响八字分析的精度和准确性。
              </p>
            </div>

            <UserProfileForm
              mode='guest'
              onSubmit={handleFormSubmit}
              showProgress={false}
            />
          </Card>

          {/* 分析结果 */}
          {showAnalysis && analysisData && (
            <div id='analysis-result'>
              <Card className="p-8 shadow-xl bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 backdrop-blur-sm border-2 border-purple-200">
                <div className="mb-6">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    AI增强八字命理分析
                  </h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    基于传统八字理论与现代AI技术，为您提供深度个性化的命理洞察
                  </p>
                </div>
                <BaziAnalysisResult
                  birthData={analysisData}
                  onAnalysisComplete={handleAnalysisComplete}
                />
              </Card>
            </div>
          )}

          {/* 功能特色 */}
          {!showAnalysis && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-12'>
              <Card
                variant="cultural"
                element="water" 
                interactive={true}
                className='p-6 text-center group'
              >
                <div className='w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200'>
                  <Zap className='w-6 h-6 text-white' />
                </div>
                <h4 className='font-semibold text-blue-900 mb-2'>专业算法</h4>
                <p className='text-sm text-blue-800'>
                  采用国际标准的八字计算算法，确保分析的准确性和可靠性。
                </p>
              </Card>

              <Card
                variant="cultural"
                element="wood"
                interactive={true} 
                className='p-6 text-center group'
              >
                <div className='w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200'>
                  <Target className='w-6 h-6 text-white' />
                </div>
                <h4 className='font-semibold text-green-900 mb-2'>个性化洞察</h4>
                <p className='text-sm text-green-800'>
                  根据您的独特八字特征，提供个性化的命理建议和人生指导。
                </p>
              </Card>

              <Card
                variant="cultural"
                element="fire"
                interactive={true}
                className='p-6 text-center group'
              >
                <div className='w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200'>
                  <Shield className='w-6 h-6 text-white' />
                </div>
                <h4 className='font-semibold text-red-900 mb-2'>智能建议</h4>
                <p className='text-sm text-red-800'>
                  基于传统智慧和现代技术，为您提供实用的人生指导建议。
                </p>
              </Card>
            </div>
          )}
        </div>

        {/* 页脚 */}
        <footer className='mt-16 text-center text-gray-500'>
          <p className='text-sm'>
            本分析仅供参考，不能替代专业咨询。如有重要决策，请咨询专业人士。
          </p>
        </footer>
      </div>
    </div>
  );
}
