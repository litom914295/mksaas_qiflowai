'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { RemedySolutionCard, RemedySolution, SolutionLevel } from '@/components/qiflow/xuankong/remedy-solution-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Search,
  Filter,
  SlidersHorizontal,
  Package,
  Star,
  Target,
  Sparkles,
  ArrowRight,
  Info,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

// 级别配置
const LEVEL_CONFIG = {
  basic: { label: '基础方案', color: 'blue' },
  standard: { label: '标准方案', color: 'green' },
  professional: { label: '专业方案', color: 'purple' },
  ultimate: { label: '终极方案', color: 'orange' },
} as const;

// Mock 数据生成函数 - 实际应从 API 或 remedy-generator.ts 获取
function generateMockSolutions(): RemedySolution[] {
  return [
    // 基础方案
    {
      id: '1',
      level: 'basic' as SolutionLevel,
      title: '五行平衡基础调理',
      description: '通过简单的五行色彩和物品摆放，改善基础风水格局',
      priceRange: { min: 100, max: 500, currency: 'CNY' },
      effectiveness: 65,
      timeRequired: '1-3天',
      difficulty: 'easy',
      successRate: 75,
      items: [
        {
          name: '五行水晶球',
          quantity: 1,
          price: 168,
          description: '直径6cm天然水晶球，用于平衡五行能量',
          required: true,
        },
        {
          name: '铜葫芦',
          quantity: 2,
          price: 88,
          description: '小号铜葫芦，化解煞气',
          required: true,
        },
        {
          name: '风水罗盘',
          quantity: 1,
          price: 128,
          description: '便携式罗盘，用于确定方位',
          required: false,
        },
      ],
      steps: [
        {
          order: 1,
          title: '清理空间',
          description: '彻底清理需要调理的空间，移除杂物',
          duration: '30分钟',
          tips: '清理时保持通风，让新鲜空气流通',
        },
        {
          order: 2,
          title: '确定方位',
          description: '使用罗盘确定房间的八个方位',
          duration: '15分钟',
          tips: '避开电器干扰，多次测量取平均值',
        },
        {
          order: 3,
          title: '摆放物品',
          description: '按照五行相生原理摆放化解物品',
          duration: '45分钟',
          tips: '水晶球放在财位，葫芦放在病位',
        },
      ],
      benefits: [
        '改善室内气场流通',
        '缓解轻微的风水问题',
        '提升整体运势10-20%',
        '适合初学者入门',
      ],
      warnings: [
        '仅适用于轻微风水问题',
        '需要定期调整物品位置',
      ],
    },
    // 标准方案
    {
      id: '2',
      level: 'standard' as SolutionLevel,
      title: '九宫飞星标准布局',
      description: '根据九宫飞星原理进行专业布局，有效化解中等程度的风水问题',
      priceRange: { min: 500, max: 2000, currency: 'CNY' },
      effectiveness: 78,
      timeRequired: '3-7天',
      difficulty: 'medium',
      successRate: 82,
      items: [
        {
          name: '紫水晶洞',
          quantity: 1,
          price: 580,
          description: '天然紫水晶洞，15-20cm，提升文昌运',
          required: true,
        },
        {
          name: '铜麒麟一对',
          quantity: 2,
          price: 368,
          description: '纯铜麒麟摆件，化煞招财',
          required: true,
        },
        {
          name: '五帝钱',
          quantity: 1,
          price: 288,
          description: '真品五帝钱，化解门冲煞',
          required: true,
        },
        {
          name: '风水轮',
          quantity: 1,
          price: 468,
          description: '流水风水轮，活化财位',
          required: false,
        },
      ],
      steps: [
        {
          order: 1,
          title: '绘制九宫格',
          description: '将房间划分为九个区域，标注各宫位',
          duration: '1小时',
          tips: '使用实际测量，不要目测',
        },
        {
          order: 2,
          title: '分析飞星',
          description: '根据流年飞星图，确定吉凶位置',
          duration: '30分钟',
          tips: '参考专业飞星图或使用APP辅助',
        },
        {
          order: 3,
          title: '布置化解物',
          description: '在关键位置摆放相应的风水物品',
          duration: '2小时',
          tips: '注意物品的朝向和高度',
        },
        {
          order: 4,
          title: '激活能量',
          description: '通过特定仪式激活风水布局',
          duration: '30分钟',
          tips: '选择吉时进行效果更佳',
        },
      ],
      benefits: [
        '显著改善家居风水',
        '提升财运和事业运',
        '化解中等程度的煞气',
        '效果持续1-2年',
        '适合有一定基础的用户',
      ],
      warnings: [
        '需要一定的风水知识',
        '物品摆放位置要精确',
        '每年需要根据流年调整',
      ],
    },
    // 专业方案
    {
      id: '3',
      level: 'professional' as SolutionLevel,
      title: '玄空风水专业调理',
      description: '运用玄空飞星、八宅、三合等多种流派综合调理，解决复杂风水问题',
      priceRange: { min: 2000, max: 10000, currency: 'CNY' },
      effectiveness: 88,
      timeRequired: '7-15天',
      difficulty: 'hard',
      successRate: 90,
      items: [
        {
          name: '天然玉石山',
          quantity: 1,
          price: 2880,
          description: '30cm高天然玉石山，镇宅化煞',
          required: true,
        },
        {
          name: '纯铜龙龟',
          quantity: 1,
          price: 1680,
          description: '大号纯铜龙龟，化解三煞',
          required: true,
        },
        {
          name: '七星阵',
          quantity: 1,
          price: 1288,
          description: '天然水晶七星阵，提升能量场',
          required: true,
        },
        {
          name: '八卦镜',
          quantity: 2,
          price: 588,
          description: '开光八卦镜，化解外煞',
          required: true,
        },
        {
          name: '文昌塔',
          quantity: 1,
          price: 888,
          description: '九层文昌塔，提升学业事业',
          required: false,
        },
      ],
      steps: [
        {
          order: 1,
          title: '专业勘测',
          description: '使用专业工具进行全方位勘测',
          duration: '3小时',
          tips: '记录所有数据，绘制详细图纸',
        },
        {
          order: 2,
          title: '综合分析',
          description: '结合多种流派理论进行深度分析',
          duration: '2小时',
          tips: '考虑居住者八字和房屋元运',
        },
        {
          order: 3,
          title: '制定方案',
          description: '定制个性化的风水调理方案',
          duration: '1天',
          tips: '方案要考虑可执行性和预算',
        },
        {
          order: 4,
          title: '分步实施',
          description: '按照轻重缓急分步骤实施调理',
          duration: '3-5天',
          tips: '关键步骤选择吉日吉时',
        },
        {
          order: 5,
          title: '效果验证',
          description: '观察并记录调理后的变化',
          duration: '7天',
          tips: '保持记录，便于后续调整',
        },
      ],
      benefits: [
        '全面解决风水问题',
        '显著提升整体运势',
        '化解严重煞气',
        '效果稳定持久（2-3年）',
        '包含个性化指导',
        '适合追求高品质生活的用户',
      ],
      warnings: [
        '需要专业人士指导',
        '投入成本较高',
        '实施周期较长',
      ],
    },
    // 终极方案
    {
      id: '4',
      level: 'ultimate' as SolutionLevel,
      title: '风水改造终极方案',
      description: '涉及装修改造的根本性风水调整，彻底解决严重风水缺陷',
      priceRange: { min: 10000, max: 50000, currency: 'CNY' },
      effectiveness: 95,
      timeRequired: '1-3个月',
      difficulty: 'expert',
      successRate: 95,
      items: [
        {
          name: '定制风水阵法',
          quantity: 1,
          price: 8888,
          description: '根据房屋特点定制的专属风水阵',
          required: true,
        },
        {
          name: '泰山石敢当',
          quantity: 1,
          price: 6666,
          description: '正宗泰山石，镇宅之宝',
          required: true,
        },
        {
          name: '九龙壁浮雕',
          quantity: 1,
          price: 12888,
          description: '精工九龙壁，提升贵人运',
          required: true,
        },
        {
          name: '风水改造材料',
          quantity: 1,
          price: 15000,
          description: '包括特殊涂料、五行材料等',
          required: true,
        },
      ],
      steps: [
        {
          order: 1,
          title: '风水诊断',
          description: '专家团队现场诊断，出具详细报告',
          duration: '1天',
          tips: '准备好房屋图纸和历史资料',
        },
        {
          order: 2,
          title: '设计方案',
          description: '设计团队制定改造方案和效果图',
          duration: '1周',
          tips: '多方案对比，选择最优',
        },
        {
          order: 3,
          title: '择日开工',
          description: '选择吉日吉时开始改造工程',
          duration: '1天',
          tips: '开工仪式很重要',
        },
        {
          order: 4,
          title: '施工改造',
          description: '按照方案进行结构和布局改造',
          duration: '2-4周',
          tips: '严格监工，确保质量',
        },
        {
          order: 5,
          title: '风水布局',
          description: '完成所有风水物品的精确布置',
          duration: '3天',
          tips: '每个细节都要到位',
        },
        {
          order: 6,
          title: '验收调试',
          description: '全面验收并微调至最佳状态',
          duration: '1周',
          tips: '观察能量流动，及时调整',
        },
      ],
      benefits: [
        '彻底解决风水根本问题',
        '运势得到质的飞跃',
        '家宅安宁，事业腾飞',
        '效果持续5-10年',
        '包含长期跟踪服务',
        '适合高端住宅和商业空间',
      ],
      warnings: [
        '需要专业团队全程参与',
        '可能涉及装修审批',
        '投入成本高',
        '施工期间影响正常生活',
      ],
    },
  ];
}

export function RemedySolutionsClient() {
  const t = useTranslations('remedySolutions');
  const [solutions] = useState<RemedySolution[]>(generateMockSolutions());
  const [selectedLevel, setSelectedLevel] = useState<SolutionLevel | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedSolution, setSelectedSolution] = useState<RemedySolution | null>(null);

  // 筛选后的方案
  const filteredSolutions = useMemo(() => {
    return solutions.filter(solution => {
      // 级别筛选
      if (selectedLevel !== 'all' && solution.level !== selectedLevel) {
        return false;
      }
      // 搜索筛选
      if (searchTerm && !solution.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !solution.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // 价格筛选
      if (solution.priceRange.max < priceRange[0] || solution.priceRange.min > priceRange[1]) {
        return false;
      }
      return true;
    });
  }, [solutions, selectedLevel, searchTerm, priceRange]);

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* 页面标题 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">风水化解方案库</h1>
        <p className="text-muted-foreground">
          专业的四级化解方案，从基础到终极，满足不同需求和预算
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              基础方案
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="text-right">
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">&lt; ¥500</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              标准方案
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Star className="h-8 w-8 text-green-600" />
              <div className="text-right">
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-muted-foreground">¥500-2000</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              专业方案
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Target className="h-8 w-8 text-purple-600" />
              <div className="text-right">
                <p className="text-2xl font-bold">6</p>
                <p className="text-xs text-muted-foreground">¥2000-10000</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              终极方案
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Sparkles className="h-8 w-8 text-orange-600" />
              <div className="text-right">
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">&gt; ¥10000</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选栏 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            筛选方案
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 级别选择 */}
            <div className="space-y-2">
              <Label>方案级别</Label>
              <Select value={selectedLevel} onValueChange={(value) => setSelectedLevel(value as SolutionLevel | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="选择级别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部级别</SelectItem>
                  <SelectItem value="basic">基础方案</SelectItem>
                  <SelectItem value="standard">标准方案</SelectItem>
                  <SelectItem value="professional">专业方案</SelectItem>
                  <SelectItem value="ultimate">终极方案</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 搜索框 */}
            <div className="space-y-2">
              <Label>搜索方案</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="输入关键词..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* 价格范围 */}
            <div className="space-y-2 md:col-span-2">
              <Label>价格范围: ¥{priceRange[0]} - ¥{priceRange[1]}</Label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                min={0}
                max={50000}
                step={500}
                className="mt-3"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 方案展示 */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="grid">网格视图</TabsTrigger>
          <TabsTrigger value="compare">对比视图</TabsTrigger>
        </TabsList>

        {/* 网格视图 */}
        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSolutions.map((solution, index) => (
              <RemedySolutionCard
                key={solution.id}
                solution={solution}
                isRecommended={index === 1} // 推荐标准方案
                onSelectSolution={(s) => {
                  setSelectedSolution(s);
                  // 这里可以跳转到详情页或弹出模态框
                  console.log('选择方案:', s);
                }}
              />
            ))}
          </div>

          {filteredSolutions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">没有符合条件的方案</p>
            </div>
          )}
        </TabsContent>

        {/* 对比视图 */}
        <TabsContent value="compare" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">方案特性</th>
                  {filteredSolutions.map(solution => (
                    <th key={solution.id} className="text-center p-4 min-w-[200px]">
                      <div className="space-y-1">
                        <p className="font-bold">{solution.title}</p>
                        <Badge variant="outline">{LEVEL_CONFIG[solution.level].label}</Badge>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4 font-medium">价格范围</td>
                  {filteredSolutions.map(solution => (
                    <td key={solution.id} className="text-center p-4">
                      ¥{solution.priceRange.min} - ¥{solution.priceRange.max}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">有效性</td>
                  {filteredSolutions.map(solution => (
                    <td key={solution.id} className="text-center p-4">
                      <Badge variant={solution.effectiveness >= 80 ? 'default' : 'secondary'}>
                        {solution.effectiveness}%
                      </Badge>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">成功率</td>
                  {filteredSolutions.map(solution => (
                    <td key={solution.id} className="text-center p-4">
                      {solution.successRate}%
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">实施时间</td>
                  {filteredSolutions.map(solution => (
                    <td key={solution.id} className="text-center p-4">
                      {solution.timeRequired}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">难度</td>
                  {filteredSolutions.map(solution => (
                    <td key={solution.id} className="text-center p-4">
                      <Badge variant="outline">
                        {solution.difficulty === 'easy' ? '简单' :
                         solution.difficulty === 'medium' ? '中等' :
                         solution.difficulty === 'hard' ? '困难' : '专家'}
                      </Badge>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">物品数量</td>
                  {filteredSolutions.map(solution => (
                    <td key={solution.id} className="text-center p-4">
                      {solution.items.length} 件
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">实施步骤</td>
                  {filteredSolutions.map(solution => (
                    <td key={solution.id} className="text-center p-4">
                      {solution.steps.length} 步
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium">操作</td>
                  {filteredSolutions.map(solution => (
                    <td key={solution.id} className="text-center p-4">
                      <Button
                        size="sm"
                        onClick={() => setSelectedSolution(solution)}
                      >
                        选择方案
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* 帮助提示 */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            如何选择合适的方案？
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Badge className="mt-1">1</Badge>
            <div>
              <p className="font-medium">评估问题严重程度</p>
              <p className="text-sm text-muted-foreground">
                轻微问题选择基础方案，严重问题需要专业或终极方案
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge className="mt-1">2</Badge>
            <div>
              <p className="font-medium">考虑预算和时间</p>
              <p className="text-sm text-muted-foreground">
                根据您的预算和可用时间选择合适的方案级别
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge className="mt-1">3</Badge>
            <div>
              <p className="font-medium">查看成功率和效果</p>
              <p className="text-sm text-muted-foreground">
                优先选择成功率高、有效性强的方案
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}