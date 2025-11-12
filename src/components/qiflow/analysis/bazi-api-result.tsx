'use client';

import { DeepBaziAnalysis } from '@/components/qiflow/analysis/deep-bazi-analysis';
import { Card, CardContent } from '@/components/ui/card';
import { adaptToProfessionalBaziData } from '@/lib/adapters/bazi-professional-adapter';
import { Loader2, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface BaziApiResultProps {
  personal: {
    name: string;
    birthDate: string;
    birthTime: string;
    gender: 'male' | 'female';
    birthCity?: string;
    calendarType?: 'solar' | 'lunar';
    longitude?: number;
    latitude?: number;
  };
  onAnalysisComplete?: (result: any) => void;
}

export default function BaziApiResult({
  personal,
  onAnalysisComplete,
}: BaziApiResultProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiResult, setApiResult] = useState<any>(null);

  // 使用 useRef 存储 callback，避免重复渲染
  const onAnalysisCompleteRef = useRef(onAnalysisComplete);

  // 更新 ref
  useEffect(() => {
    onAnalysisCompleteRef.current = onAnalysisComplete;
  }, [onAnalysisComplete]);

  useEffect(() => {
    const fetchBaziAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/qiflow/bazi-unified', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify({
          name: personal.name,
          birthDate: personal.birthDate,
          birthTime: personal.birthTime,
          gender: personal.gender,
          birthCity: personal.birthCity || '',
          calendarType: personal.calendarType || 'solar',
          longitude: personal.longitude,
          latitude: personal.latitude,
        }),
        });

        if (!response.ok) {
          throw new Error('API请求失败');
        }

        const result = await response.json();

        if (result.success) {
          setApiResult(result.data);
          // 使用 ref 调用 callback
          onAnalysisCompleteRef.current?.(result.data);
        } else {
          // 处理需要登录的情况
          if (result.needsLogin) {
            throw new Error('请先登录后使用完整功能');
          }
          // 处理积分不足的情况
          if (result.needsCredits) {
            throw new Error(
              `积分不足，需要 ${result.required} 积分，当前 ${result.available} 积分`
            );
          }
          throw new Error(result.error || '分析失败');
        }
      } catch (err) {
        console.error('八字分析失败:', err);
        setError(err instanceof Error ? err.message : '分析失败');
      } finally {
        setLoading(false);
      }
    };

    fetchBaziAnalysis();
  }, [personal.name, personal.birthDate, personal.birthTime, personal.gender]); // 只依赖 personal 数据，不依赖 callback

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
          <p className="text-gray-600">正在分析八字...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p className="font-semibold mb-2">分析失败</p>
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!apiResult) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">无分析数据</p>
        </CardContent>
      </Card>
    );
  }

  // 转换为专业版数据格式，传递出生信息用于大运计算
  const professionalData = adaptToProfessionalBaziData(apiResult, {
    birthDate: personal.birthDate,
    birthTime: personal.birthTime,
  });

  // 🔥 直接显示专业版，移除切换功能
  return (
    <div className="space-y-6">
      {/* 专业版提示卡片 */}
      <Card className="bg-gradient-to-r from-purple-100 via-blue-100 to-indigo-100 border-2 border-purple-300">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-purple-900 mb-2">
                专业版八字分析
              </h3>
              <p className="text-sm text-purple-800 mb-3">
                包含完整的四柱八字、五行分析、格局用神、神煞详解、
                <strong className="text-purple-900">大运流年预测</strong>
                等专业功能
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 bg-white/90 rounded-full text-purple-900 font-medium">
                  ✨ 纳音解析
                </span>
                <span className="px-3 py-1 bg-white/90 rounded-full text-purple-900 font-medium">
                  🌟 十神分析
                </span>
                <span className="px-3 py-1 bg-white/90 rounded-full text-purple-900 font-medium">
                  📅 大运时间线
                </span>
                <span className="px-3 py-1 bg-white/90 rounded-full text-purple-900 font-medium">
                  🔮 流年预测
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 专业版视图 - 深度八字分析（匹配截图1） */}
      <DeepBaziAnalysis data={professionalData} />
    </div>
  );
}
