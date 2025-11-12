'use client';

import {
  BaziProfessionalResult,
  type ProfessionalBaziData,
} from '@/components/qiflow/analysis/bazi-professional-result';
import { Card, CardContent } from '@/components/ui/card';
import { adaptToProfessionalBaziData } from '@/lib/adapters/bazi-professional-adapter';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface BaziCompleteAnalysisProps {
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

export default function BaziCompleteAnalysis({
  personal,
  onAnalysisComplete,
}: BaziCompleteAnalysisProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [professionalData, setProfessionalData] =
    useState<ProfessionalBaziData | null>(null);

  const onAnalysisCompleteRef = useRef(onAnalysisComplete);

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
          const errorText = await response.text();
          console.error('❌ API请求失败:', response.status, errorText);
          throw new Error(`API请求失败 (${response.status})`);
        }

        const result = await response.json();
        console.log('✅ API返回数据:', result);

        if (result.success) {
          // 使用适配器转换API数据为专业版格式
          const apiData = result.data;
          const professional = adaptToProfessionalBaziData(apiData, {
            birthDate: personal.birthDate,
            birthTime: personal.birthTime,
          });

          setProfessionalData(professional);
          onAnalysisCompleteRef.current?.(apiData);
        } else {
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
  }, [
    personal.name,
    personal.birthDate,
    personal.birthTime,
    personal.gender,
    personal.birthCity,
    personal.calendarType,
  ]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
          <p className="text-gray-600">正在进行专业八字分析...</p>
          <p className="text-sm text-gray-500 mt-2">
            包含四柱、五行、神煞、大运流年等...
          </p>
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

  if (!professionalData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">无分析数据</p>
        </CardContent>
      </Card>
    );
  }

  return <BaziProfessionalResult data={professionalData} />;
}
