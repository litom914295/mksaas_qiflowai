'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CulturalCard } from '@/components/ui/enhanced-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  FlyingStarExplanation,
  GenerateFlyingStarOutput,
  PalaceIndex,
  Plate,
  PlateCell,
} from '@/lib/fengshui';
import {
  BarChart3,
  BookOpen,
  Eye,
  Info,
  Lightbulb,
  MapPin,
  Shield,
  Star,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { AdvancedFengshuiFeatures } from './advanced-fengshui-features';
import { FengshuiControls } from './fengshui-controls';
import { FengshuiExplanation } from './fengshui-explanation';
import { OptimizedFlyingStarGrid } from './optimized-flying-star-grid';
import { SmartRecommendations } from './smart-recommendations';

interface FlyingStarAnalysisProps {
  fengshuiResult: GenerateFlyingStarOutput;
  fengshuiExplanation: FlyingStarExplanation;
}

// 简化的九宫格组件（保留作为备用）
function SimpleNinePalaceGrid({
  plate,
  onCellClick,
}: {
  plate: Plate;
  onCellClick?: (palace: PalaceIndex) => void;
}) {
  const palaceNames = [
    '',
    '坎',
    '坤',
    '震',
    '巽',
    '中',
    '乾',
    '兑',
    '艮',
    '离',
  ];
  const palaceColors = [
    '',
    'bg-blue-100 border-blue-300',
    'bg-yellow-100 border-yellow-300',
    'bg-green-100 border-green-300',
    'bg-purple-100 border-purple-300',
    'bg-gray-100 border-gray-300',
    'bg-red-100 border-red-300',
    'bg-pink-100 border-pink-300',
    'bg-indigo-100 border-indigo-300',
    'bg-orange-100 border-orange-300',
  ];

  return (
    <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((palace) => {
        const cell = plate.find((c) => c.palace === (palace as PalaceIndex));
        const palaceName = palaceNames[palace];
        const colorClass = palaceColors[palace];

        return (
          <div
            key={palace}
            className={`p-4 border-2 rounded-lg text-center cursor-pointer hover:shadow-md transition-all ${colorClass}`}
            onClick={() => onCellClick?.(palace as PalaceIndex)}
          >
            <div className="text-sm font-bold text-gray-800 mb-2">
              {palaceName}宫
            </div>
            {cell && (
              <div className="space-y-1 text-xs">
                <div className="font-semibold">天盘: {cell.periodStar}</div>
                <div className="text-gray-600">山盘: {cell.mountainStar}</div>
                <div className="text-gray-600">向盘: {cell.facingStar}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// 飞星详情卡片
function StarDetailCard({
  cell,
  palaceName,
}: {
  cell: PlateCell;
  palaceName: string;
}) {
  const getStarColor = (star: number) => {
    const colors = {
      1: 'text-blue-600 bg-blue-100',
      2: 'text-black bg-gray-100',
      3: 'text-green-600 bg-green-100',
      4: 'text-purple-600 bg-purple-100',
      5: 'text-yellow-600 bg-yellow-100',
      6: 'text-white bg-gray-600',
      7: 'text-red-600 bg-red-100',
      8: 'text-pink-600 bg-pink-100',
      9: 'text-orange-600 bg-orange-100',
    };
    return colors[star as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-lg">{palaceName}宫</h4>
        <Badge variant="outline">详细分析</Badge>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">天盘</div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto ${getStarColor(cell.periodStar || 1)}`}
          >
            {cell.periodStar}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">山盘</div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto ${getStarColor(cell.mountainStar)}`}
          >
            {cell.mountainStar}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">向盘</div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto ${getStarColor(cell.facingStar)}`}
          >
            {cell.facingStar}
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <div className="mb-1">• 天盘星：代表当前运势</div>
        <div className="mb-1">• 山盘星：代表坐山方位</div>
        <div>• 向盘星：代表朝向方位</div>
      </div>
    </Card>
  );
}

// 格局分析组件
function GejuAnalysis({ geju }: { geju: FlyingStarExplanation['geju'] }) {
  return (
    <Card variant="feng-shui" size="lg">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">格局分析</h3>
      </div>

      <div className="space-y-6">
        <CulturalCard
          element={geju.isFavorable ? 'wood' : 'fire'}
          className={geju.isFavorable ? 'border-green-300' : 'border-red-300'}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-gray-900">
              整体格局
            </span>
            <Badge
              variant={geju.isFavorable ? 'default' : 'destructive'}
              className="text-sm px-3 py-1"
            >
              {geju.isFavorable ? '吉格' : '凶格'}
            </Badge>
          </div>
          <p className="text-gray-700 leading-relaxed">
            {geju.descriptions.join('；')}
          </p>
        </CulturalCard>

        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/50">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-600" />
            格局类型
          </h4>
          <div className="flex flex-wrap gap-3">
            {geju.types.map((type, index) => (
              <Badge
                key={index}
                variant="outline"
                className={`px-3 py-1 text-sm font-medium ${
                  geju.isFavorable
                    ? 'border-green-300 text-green-800 bg-green-50 hover:bg-green-100'
                    : 'border-red-300 text-red-800 bg-red-50 hover:bg-red-100'
                }`}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

// 关键位置组件
function KeyPositions({
  wenchangwei,
  caiwei,
}: {
  wenchangwei: string;
  caiwei: string;
}) {
  return (
    <Card variant="feng-shui" size="lg">
      <div className="flex items-center gap-3 mb-6">
        <MapPin className="w-6 h-6 text-green-600" />
        <h3 className="text-xl font-bold text-gray-900">关键位置</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CulturalCard
          element="wood"
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          title="文昌位"
          description="智慧学业运势方位"
          className="group hover:shadow-2xl"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-green-900 mb-2 group-hover:scale-110 transition-transform duration-200">
              {wenchangwei}
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h5 className="font-semibold text-green-800 mb-2">适宜布置</h5>
              <div className="text-sm text-green-700 space-y-1">
                <div>• 书桌、书柜</div>
                <div>• 文房四宝</div>
                <div>• 学习工作区域</div>
              </div>
            </div>
          </div>
        </CulturalCard>

        <CulturalCard
          element="earth"
          icon={<Shield className="w-6 h-6 text-yellow-600" />}
          title="财位"
          description="财运事业发展方位"
          className="group hover:shadow-2xl"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-900 mb-2 group-hover:scale-110 transition-transform duration-200">
              {caiwei}
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h5 className="font-semibold text-yellow-800 mb-2">适宜布置</h5>
              <div className="text-sm text-yellow-700 space-y-1">
                <div>• 保险箱、收银台</div>
                <div>• 招财植物</div>
                <div>• 办公商谈区域</div>
              </div>
            </div>
          </div>
        </CulturalCard>
      </div>
    </Card>
  );
}

// 建议组件
function Recommendations({
  summary,
}: { summary: FlyingStarExplanation['summary'] }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-600" />
        <h3 className="text-lg font-semibold">布局建议</h3>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2 text-gray-800">关键要点</h4>
          <ul className="space-y-1">
            {summary.keyPoints.map((point, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium mb-2 text-gray-800">具体建议</h4>
          <ul className="space-y-1">
            {summary.recommendations.map((rec, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

export function FlyingStarAnalysis({
  fengshuiResult,
  fengshuiExplanation,
}: FlyingStarAnalysisProps) {
  const [selectedPalace, setSelectedPalace] = useState<PalaceIndex | null>(
    null
  );
  const [activeTab, setActiveTab] = useState('overview');
  const [showDetails, setShowDetails] = useState(true);
  const [showLegend, setShowLegend] = useState(true);

  // const palaceNames = ['', '坎', '坤', '震', '巽', '中', '乾', '兑', '艮', '离'];
  // const selectedCell = selectedPalace ? fengshuiResult.plates.period.find(c => c.palace === selectedPalace) : null;

  const handleViewChange = (
    view: 'overview' | 'palaces' | 'geju' | 'advice'
  ) => {
    setActiveTab(view);
  };

  const handleResetView = () => {
    setSelectedPalace(null);
    setActiveTab('overview');
  };

  const handleExport = () => {
    // 导出功能实现
    console.log('导出分析报告');
  };

  const handleShare = () => {
    // 分享功能实现
    console.log('分享分析结果');
  };

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <FengshuiControls
        onViewChange={handleViewChange}
        onToggleDetails={setShowDetails}
        onToggleLegend={setShowLegend}
        onResetView={handleResetView}
        onExport={handleExport}
        onShare={handleShare}
        currentView={activeTab}
        showDetails={showDetails}
        showLegend={showLegend}
      />

      {/* 标题和基本信息 */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3 mb-4">
          <Star className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              玄空飞星风水分析
            </h2>
            <p className="text-gray-600">基于传统玄空飞星理论的专业分析</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800">当前运星</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {fengshuiExplanation.periodName}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">文昌位</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {fengshuiExplanation.wenchangwei}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">财位</span>
            </div>
            <p className="text-2xl font-bold text-yellow-900">
              {fengshuiExplanation.caiwei}
            </p>
          </div>
        </div>
      </Card>

      {/* 主要内容标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            总览
          </TabsTrigger>
          <TabsTrigger value="palaces" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            九宫格
          </TabsTrigger>
          <TabsTrigger value="geju" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            格局
          </TabsTrigger>
          <TabsTrigger value="advice" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            建议
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            高级
          </TabsTrigger>
        </TabsList>

        {/* 总览标签页 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <KeyPositions
              wenchangwei={fengshuiExplanation.wenchangwei}
              caiwei={fengshuiExplanation.caiwei}
            />
            <GejuAnalysis geju={fengshuiExplanation.geju} />
          </div>

          <Recommendations summary={fengshuiExplanation.summary} />
        </TabsContent>

        {/* 九宫格标签页 */}
        <TabsContent value="palaces" className="space-y-6">
          <OptimizedFlyingStarGrid
            plate={fengshuiResult.plates.period}
            onCellClick={setSelectedPalace}
            selectedPalace={selectedPalace}
            showDetails={showDetails}
          />
        </TabsContent>

        {/* 格局标签页 */}
        <TabsContent value="geju" className="space-y-6">
          <GejuAnalysis geju={fengshuiExplanation.geju} />

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">格局说明</h3>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed">
                玄空飞星格局是风水分析的核心，通过分析天盘、山盘、向盘三盘之间的关系，
                可以判断房屋的吉凶状况。不同的格局组合会产生不同的能量场，
                影响居住者的运势、健康、财运等各个方面。
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* 建议标签页 */}
        <TabsContent value="advice" className="space-y-6">
          <SmartRecommendations
            fengshuiResult={fengshuiResult}
            fengshuiExplanation={fengshuiExplanation}
          />
          <FengshuiExplanation explanation={fengshuiExplanation} />
        </TabsContent>

        {/* 高级功能标签页 */}
        <TabsContent value="advanced" className="space-y-6">
          <AdvancedFengshuiFeatures
            fengshuiResult={fengshuiResult}
            fengshuiExplanation={fengshuiExplanation}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
