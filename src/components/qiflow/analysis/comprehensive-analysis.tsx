'use client';

import FengShuiCompass from '@/components/compass/feng-shui-compass';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Compass, Upload } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

interface BirthInfo {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: 'male' | 'female';
  name: string;
}

interface HouseInfo {
  direction: number;
  inputMethod: 'compass' | 'manual' | 'upload';
  floorPlan?: File;
  address?: string;
}

interface AnalysisResult {
  bazi: {
    year: string;
    month: string;
    day: string;
    hour: string;
    elements: string[];
    analysis: string;
  };
  fengshui: {
    direction: number;
    xuankong: string;
    analysis: string;
    recommendations: string[];
  };
}

const ComprehensiveAnalysis: React.FC = () => {
  const [step, setStep] = useState<'house' | 'analysis'>('house');
  const [birthInfo] = useState<BirthInfo>({
    year: new Date().getFullYear() - 30,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    gender: 'male',
    name: '',
  });
  const [houseInfo, setHouseInfo] = useState<HouseInfo>({
    direction: 0,
    inputMethod: 'compass',
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 生成八字分析
  const generateBaziAnalysis = (birth: BirthInfo): AnalysisResult['bazi'] => {
    const heavenlyStems = [
      '甲',
      '乙',
      '丙',
      '丁',
      '戊',
      '己',
      '庚',
      '辛',
      '壬',
      '癸',
    ];
    const earthlyBranches = [
      '子',
      '丑',
      '寅',
      '卯',
      '辰',
      '巳',
      '午',
      '未',
      '申',
      '酉',
      '戌',
      '亥',
    ];
    const elements = ['木', '火', '土', '金', '水'];

    const yearStem = heavenlyStems[(birth.year - 4) % 10];
    const yearBranch = earthlyBranches[(birth.year - 4) % 12];
    const monthStem = heavenlyStems[(birth.month - 1) % 10];
    const monthBranch = earthlyBranches[(birth.month - 1) % 12];
    const dayStem = heavenlyStems[(birth.day - 1) % 10];
    const dayBranch = earthlyBranches[(birth.day - 1) % 12];
    const hourStem = heavenlyStems[Math.floor(birth.hour / 2) % 10];
    const hourBranch = earthlyBranches[Math.floor(birth.hour / 2) % 12];

    return {
      year: `${yearStem}${yearBranch}`,
      month: `${monthStem}${monthBranch}`,
      day: `${dayStem}${dayBranch}`,
      hour: `${hourStem}${hourBranch}`,
      elements: [elements[0], elements[1], elements[2]],
      analysis: `根据您的出生信息，您的八字为：${yearStem}${yearBranch}年 ${monthStem}${monthBranch}月 ${dayStem}${dayBranch}日 ${hourStem}${hourBranch}时。您的命格属于${elements[0]}命，具有坚韧不拔的性格特质。`,
    };
  };

  // 生成风水分析
  const generateFengshuiAnalysis = (
    house: HouseInfo
  ): AnalysisResult['fengshui'] => {
    const directions = [
      '正北',
      '东北',
      '正东',
      '东南',
      '正南',
      '西南',
      '正西',
      '西北',
    ];
    const directionIndex = Math.floor(house.direction / 45);
    const directionName = directions[directionIndex];

    return {
      direction: house.direction,
      xuankong: `七运${directionName}向`,
      analysis: `您的房屋朝向为${directionName}（${house.direction}度），根据玄空风水理论，此朝向在当前七运期间属于旺向。`,
      recommendations: [
        `在${directionName}方位放置绿色植物，增强生气`,
        '保持房屋整洁，定期清理杂物',
        '在财位摆放水晶或招财植物',
        '卧室避免正对镜子，保持良好睡眠环境',
      ],
    };
  };

  // 执行分析
  const performAnalysis = async () => {
    setIsAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const result: AnalysisResult = {
      bazi: generateBaziAnalysis(birthInfo),
      fengshui: generateFengshuiAnalysis(houseInfo),
    };

    setAnalysisResult(result);
    setStep('analysis');
    setIsAnalyzing(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setHouseInfo((prev) => ({ ...prev, floorPlan: file }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 第一步：房屋朝向 */}
      {step === 'house' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Compass className="w-5 h-5" />
              <span>确定房屋朝向</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={houseInfo.inputMethod}
              onValueChange={(value) =>
                setHouseInfo((prev) => ({ ...prev, inputMethod: value as any }))
              }
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="compass">罗盘定位</TabsTrigger>
                <TabsTrigger value="manual">手动输入</TabsTrigger>
                <TabsTrigger value="upload">上传平面图</TabsTrigger>
              </TabsList>

              <TabsContent value="compass" className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    点击罗盘设置房屋朝向
                  </p>
                  <FengShuiCompass
                    width={350}
                    height={350}
                    onDirectionChange={(direction) =>
                      setHouseInfo((prev) => ({ ...prev, direction }))
                    }
                    theme="compass"
                  />
                  <p className="mt-4 text-lg font-medium">
                    当前朝向: {houseInfo.direction.toFixed(0)}° (
                    {
                      [
                        '正北',
                        '东北',
                        '正东',
                        '东南',
                        '正南',
                        '西南',
                        '正西',
                        '西北',
                      ][Math.floor(houseInfo.direction / 45)]
                    }
                    )
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <div>
                  <Label htmlFor="direction">朝向角度 (0-360度)</Label>
                  <Input
                    id="direction"
                    type="number"
                    value={houseInfo.direction}
                    onChange={(e) =>
                      setHouseInfo((prev) => ({
                        ...prev,
                        direction: Number.parseInt(e.target.value) || 0,
                      }))
                    }
                    min="0"
                    max="360"
                    placeholder="输入0-360度之间的角度"
                  />
                </div>
                <div>
                  <Label htmlFor="address">房屋地址 (可选)</Label>
                  <Input
                    id="address"
                    value={houseInfo.address || ''}
                    onChange={(e) =>
                      setHouseInfo((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder="输入房屋地址"
                  />
                </div>
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-4">
                    上传房屋平面图，我们将自动分析朝向
                  </p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="floorplan-upload"
                  />
                  <label htmlFor="floorplan-upload">
                    <Button variant="outline" className="cursor-pointer">
                      选择文件
                    </Button>
                  </label>
                  {houseInfo.floorPlan && (
                    <p className="mt-2 text-sm text-green-600">
                      已上传: {houseInfo.floorPlan.name}
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex space-x-4 mt-6">
              <Button
                onClick={performAnalysis}
                className="w-full"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? '分析中...' : '开始分析'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 第三步：分析结果 */}
      {step === 'analysis' && analysisResult && (
        <div className="space-y-6">
          {/* 八字命理分析 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>八字命理分析</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">年柱</div>
                  <div className="text-xl font-bold text-blue-600">
                    {analysisResult.bazi.year}
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">月柱</div>
                  <div className="text-xl font-bold text-green-600">
                    {analysisResult.bazi.month}
                  </div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-sm text-gray-600">日柱</div>
                  <div className="text-xl font-bold text-yellow-600">
                    {analysisResult.bazi.day}
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600">时柱</div>
                  <div className="text-xl font-bold text-purple-600">
                    {analysisResult.bazi.hour}
                  </div>
                </div>
              </div>
              <div className="prose max-w-none">
                <h4>命理分析</h4>
                <p>{analysisResult.bazi.analysis}</p>
              </div>
            </CardContent>
          </Card>

          {/* 玄空风水分析 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Compass className="w-5 h-5" />
                <span>玄空风水排盘分析</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">房屋信息</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>朝向:</span>
                      <span className="font-medium">
                        {analysisResult.fengshui.direction}°
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>玄空排盘:</span>
                      <span className="font-medium">
                        {analysisResult.fengshui.xuankong}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <FengShuiCompass width={200} height={200} theme="compass" />
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">风水分析</h4>
                <p className="text-gray-700 mb-4">
                  {analysisResult.fengshui.analysis}
                </p>

                <h4 className="font-semibold mb-3">改善建议</h4>
                <ul className="space-y-2">
                  {analysisResult.fengshui.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => setStep('house')}
              className="flex-1"
            >
              重新分析
            </Button>
            <Button className="flex-1">保存报告</Button>
            <Button variant="outline" className="flex-1">
              分享结果
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveAnalysis;
