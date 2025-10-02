import { EnhancedBaziAnalysisResult } from '@/components/analysis/enhanced-bazi-analysis-result';
import { EnhancedComprehensiveAnalysisResult } from '@/components/analysis/enhanced-comprehensive-analysis-result';
import { EnhancedFengshuiAnalysisResult } from '@/components/analysis/enhanced-fengshui-analysis-result';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, Star, User } from 'lucide-react';
import Link from 'next/link';

interface AnalysisResultPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    type?: 'bazi' | 'fengshui' | 'comprehensive';
    birthData?: string;
    houseInfo?: string;
    sessionId?: string;
    userId?: string;
  }>;
}

export default async function AnalysisResultPage({
  params,
  searchParams,
}: AnalysisResultPageProps) {
  const { locale } = await params;
  const { type, birthData, houseInfo, sessionId, userId } = await searchParams;

  // 解析数据
  let parsedBirthData = null;
  let parsedHouseInfo = null;

  try {
    if (birthData) {
      parsedBirthData = JSON.parse(decodeURIComponent(birthData));
    }
    if (houseInfo) {
      parsedHouseInfo = JSON.parse(decodeURIComponent(houseInfo));
    }
  } catch (error) {
    console.error('解析分析数据失败:', error);
  }

  // 根据分析类型渲染不同的组件
  const renderAnalysisComponent = () => {
    switch (type) {
      case 'bazi':
        if (!parsedBirthData) {
          return <AnalysisError message='缺少出生信息数据' />;
        }
        return (
          <EnhancedBaziAnalysisResult
            birthData={parsedBirthData}
            sessionId={sessionId}
            userId={userId}
          />
        );

      case 'fengshui':
        if (!parsedHouseInfo) {
          return <AnalysisError message='缺少房屋信息数据' />;
        }
        return (
          <EnhancedFengshuiAnalysisResult
            houseInfo={parsedHouseInfo}
            sessionId={sessionId}
            userId={userId}
          />
        );

      case 'comprehensive':
        if (!parsedBirthData || !parsedHouseInfo) {
          return <AnalysisError message='缺少完整的分析数据' />;
        }
        return (
          <EnhancedComprehensiveAnalysisResult
            birthData={parsedBirthData}
            houseInfo={parsedHouseInfo}
            sessionId={sessionId}
            userId={userId}
          />
        );

      default:
        return <AnalysisTypeSelector />;
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-blue-50'>
      <div className='container mx-auto px-4 py-8'>
        {renderAnalysisComponent()}
      </div>
    </div>
  );
}

// 分析类型选择器
function AnalysisTypeSelector() {
  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      <div className='text-center space-y-4'>
        <h1 className='text-4xl font-bold text-gray-900'>选择分析类型</h1>
        <p className='text-xl text-gray-600'>请选择您想要进行的分析类型</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card className='hover:shadow-lg transition-shadow cursor-pointer'>
          <CardHeader className='text-center'>
            <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <User className='w-8 h-8 text-blue-600' />
            </div>
            <CardTitle className='text-xl'>八字分析</CardTitle>
            <p className='text-gray-600'>基于出生时间的个人命理分析</p>
          </CardHeader>
          <CardContent className='text-center'>
            <Button asChild className='w-full'>
              <Link href='/chat?type=bazi'>开始八字分析</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow cursor-pointer'>
          <CardHeader className='text-center'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Home className='w-8 h-8 text-green-600' />
            </div>
            <CardTitle className='text-xl'>风水分析</CardTitle>
            <p className='text-gray-600'>基于房屋朝向的环境分析</p>
          </CardHeader>
          <CardContent className='text-center'>
            <Button asChild className='w-full'>
              <Link href='/chat?type=fengshui'>开始风水分析</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow cursor-pointer'>
          <CardHeader className='text-center'>
            <div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Star className='w-8 h-8 text-purple-600' />
            </div>
            <CardTitle className='text-xl'>综合分析</CardTitle>
            <p className='text-gray-600'>八字与风水的综合分析</p>
          </CardHeader>
          <CardContent className='text-center'>
            <Button asChild className='w-full'>
              <Link href='/chat?type=comprehensive'>开始综合分析</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className='text-center'>
        <Button variant='outline' asChild>
          <Link href='/' className='flex items-center gap-2'>
            <ArrowLeft className='w-4 h-4' />
            返回首页
          </Link>
        </Button>
      </div>
    </div>
  );
}

// 分析错误组件
function AnalysisError({ message }: { message: string }) {
  return (
    <div className='max-w-2xl mx-auto'>
      <Card className='border-red-200 bg-red-50'>
        <CardHeader>
          <CardTitle className='text-red-800 flex items-center gap-2'>
            <Star className='w-5 h-5' />
            分析数据错误
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-red-700 mb-4'>{message}</p>
          <div className='flex gap-3'>
            <Button asChild>
              <Link href='/chat'>重新开始分析</Link>
            </Button>
            <Button variant='outline' asChild>
              <Link href='/'>返回首页</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
