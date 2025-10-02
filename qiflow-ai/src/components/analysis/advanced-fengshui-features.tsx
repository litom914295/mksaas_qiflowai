'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    type FlyingStarExplanation,
    type GenerateFlyingStarOutput,
    type PalaceIndex,
    type Plate
} from '@/lib/fengshui';
import {
    Calendar,
    Clock,
    Compass,
    Download,
    Share2,
    Star,
    Target,
    Zap
} from 'lucide-react';
import { useState } from 'react';

interface AdvancedFengshuiFeaturesProps {
  fengshuiResult: GenerateFlyingStarOutput;
  fengshuiExplanation: FlyingStarExplanation;
}

// 流年分析组件
function YearlyAnalysis({ plate, period }: { plate: Plate; period: number }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // 计算流年飞星
  const calculateYearlyStars = (year: number) => {
    const yearStar = ((year - 2004) % 9) + 1;
    return yearStar;
  };

  const yearStar = calculateYearlyStars(selectedYear);
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">流年分析</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">选择年份：</label>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            min="2004"
            max="2100"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">流年星</div>
            <div className="text-3xl font-bold text-blue-900">{yearStar}</div>
            <div className="text-xs text-gray-600 mt-1">{selectedYear}年</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">运星</div>
            <div className="text-3xl font-bold text-green-900">{period}</div>
            <div className="text-xs text-gray-600 mt-1">当前运</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">组合</div>
            <div className="text-3xl font-bold text-purple-900">{yearStar}{period}</div>
            <div className="text-xs text-gray-600 mt-1">流年运星</div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">流年分析</h4>
          <p className="text-sm text-gray-700">
            {yearStar}年流年星与{period}运星组合，影响该年的整体运势。
            {yearStar === 5 ? ' 注意五黄星的影响，需要化解。' : ''}
            {yearStar === 8 ? ' 八白星当旺，财运较好。' : ''}
            {yearStar === 9 ? ' 九紫星当旺，喜庆较多。' : ''}
          </p>
        </div>
      </div>
    </Card>
  );
}

// 时辰分析组件
function HourlyAnalysis({ plate }: { plate: Plate }) {
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  
  const hourNames = [
    '子时(23-1)', '丑时(1-3)', '寅时(3-5)', '卯时(5-7)',
    '辰时(7-9)', '巳时(9-11)', '午时(11-13)', '未时(13-15)',
    '申时(15-17)', '酉时(17-19)', '戌时(19-21)', '亥时(21-23)'
  ];
  
  const currentHourName = hourNames[Math.floor(selectedHour / 2)];
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold">时辰分析</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">选择时辰：</label>
          <select
            value={selectedHour}
            onChange={(e) => setSelectedHour(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {hourNames.map((name, index) => (
              <option key={index} value={index * 2}>{name}</option>
            ))}
          </select>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">当前时辰：{currentHourName}</h4>
          <p className="text-sm text-gray-700">
            不同时辰的能量场不同，影响该时段的运势。
            {selectedHour >= 5 && selectedHour < 7 ? ' 卯时：阳气初升，适合学习工作。' : ''}
            {selectedHour >= 11 && selectedHour < 13 ? ' 午时：阳气最盛，适合重要决策。' : ''}
            {selectedHour >= 17 && selectedHour < 19 ? ' 酉时：金气当令，适合理财投资。' : ''}
            {selectedHour >= 21 && selectedHour < 23 ? ' 亥时：水气当令，适合休息养生。' : ''}
          </p>
        </div>
      </div>
    </Card>
  );
}

// 方位分析组件
function DirectionAnalysis({ plate }: { plate: Plate }) {
  const directions = [
    { name: '正北', palace: 1, element: '水', color: 'blue' },
    { name: '东北', palace: 8, element: '土', color: 'indigo' },
    { name: '正东', palace: 3, element: '木', color: 'green' },
    { name: '东南', palace: 4, element: '木', color: 'purple' },
    { name: '正南', palace: 9, element: '火', color: 'orange' },
    { name: '西南', palace: 2, element: '土', color: 'yellow' },
    { name: '正西', palace: 7, element: '金', color: 'pink' },
    { name: '西北', palace: 6, element: '金', color: 'red' }
  ];
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Compass className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">方位分析</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {directions.map((dir) => {
          const cell = plate.find(c => c.palace === dir.palace as PalaceIndex);
          const colorClass = `bg-${dir.color}-50 border-${dir.color}-200`;
          
          return (
            <div key={dir.palace} className={`p-3 rounded-lg border text-center ${colorClass}`}>
              <div className="text-sm font-semibold text-gray-900">{dir.name}</div>
              <div className="text-xs text-gray-600 mb-2">{dir.element}</div>
              {cell && (
                <div className="space-y-1">
                  <div className="text-lg font-bold">{cell.periodStar}</div>
                  <div className="text-xs text-gray-600">
                    {cell.mountainStar}/{cell.facingStar}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// 能量分析组件
function EnergyAnalysis({ plate }: { plate: Plate }) {
  const energyLevels = plate.map(cell => {
    const stars = [cell.periodStar, cell.mountainStar, cell.facingStar];
    const energy = stars.reduce((sum, star) => {
      // 简单的能量计算：吉星加分，凶星减分
      if (star === 8 || star === 9) return sum + 2; // 八白九紫
      if (star === 1 || star === 6) return sum + 1; // 一白六白
      if (star === 5) return sum - 2; // 五黄
      if (star === 2 || star === 3 || star === 7) return sum - 1; // 二黑三碧七赤
      return sum; // 四绿中性
    }, 0);
    
    return { palace: cell.palace, energy };
  });
  
  const maxEnergy = Math.max(...energyLevels.map(e => e.energy));
  const minEnergy = Math.min(...energyLevels.map(e => e.energy));
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-yellow-600" />
        <h3 className="text-lg font-semibold">能量分析</h3>
      </div>
      
      <div className="space-y-3">
        {energyLevels.map(({ palace, energy }) => {
          const percentage = maxEnergy === minEnergy ? 50 : 
            ((energy - minEnergy) / (maxEnergy - minEnergy)) * 100;
          const colorClass = percentage > 70 ? 'bg-green-500' : 
                           percentage > 40 ? 'bg-yellow-500' : 'bg-red-500';
          
          return (
            <div key={palace} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{palace}宫</span>
                <span className="font-medium">{energy}分</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${colorClass}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// 导出功能组件
function ExportFeatures({ fengshuiResult, fengshuiExplanation }: {
  fengshuiResult: GenerateFlyingStarOutput;
  fengshuiExplanation: FlyingStarExplanation;
}) {
  const handleExportPDF = () => {
    // 导出PDF功能
    console.log('导出PDF报告');
  };
  
  const handleExportImage = () => {
    // 导出图片功能
    console.log('导出分析图片');
  };
  
  const handleShare = () => {
    // 分享功能
    console.log('分享分析结果');
  };
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Download className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">导出与分享</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Button onClick={handleExportPDF} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          导出PDF报告
        </Button>
        
        <Button onClick={handleExportImage} variant="outline" className="flex items-center gap-2">
          <Target className="w-4 h-4" />
          导出图片
        </Button>
        
        <Button onClick={handleShare} variant="outline" className="flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          分享结果
        </Button>
      </div>
    </Card>
  );
}

export function AdvancedFengshuiFeatures({ 
  fengshuiResult, 
  fengshuiExplanation 
}: AdvancedFengshuiFeaturesProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center gap-3 mb-4">
          <Star className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">高级风水分析</h2>
            <p className="text-gray-600">深度分析流年、时辰、方位等高级功能</p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="yearly" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="yearly" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            流年
          </TabsTrigger>
          <TabsTrigger value="hourly" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            时辰
          </TabsTrigger>
          <TabsTrigger value="direction" className="flex items-center gap-2">
            <Compass className="w-4 h-4" />
            方位
          </TabsTrigger>
          <TabsTrigger value="energy" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            能量
          </TabsTrigger>
        </TabsList>

        <TabsContent value="yearly" className="space-y-6">
          <YearlyAnalysis plate={fengshuiResult.plates.period} period={fengshuiResult.period} />
        </TabsContent>

        <TabsContent value="hourly" className="space-y-6">
          <HourlyAnalysis plate={fengshuiResult.plates.period} />
        </TabsContent>

        <TabsContent value="direction" className="space-y-6">
          <DirectionAnalysis plate={fengshuiResult.plates.period} />
        </TabsContent>

        <TabsContent value="energy" className="space-y-6">
          <EnergyAnalysis plate={fengshuiResult.plates.period} />
        </TabsContent>
      </Tabs>

      <ExportFeatures 
        fengshuiResult={fengshuiResult}
        fengshuiExplanation={fengshuiExplanation}
      />
    </div>
  );
}
