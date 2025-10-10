'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { FlyingStarPlate } from '@/lib/qiflow/xuankong/types';
import { cn } from '@/lib/utils';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  GraduationCap,
  Heart,
  Home,
  Shield,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';

interface LiunianAdvancedAnalysisProps {
  basePlate: FlyingStarPlate;
  period: number;
  currentYear?: number;
  className?: string;
}

// 流年飞星入中宫数（2024-2033）
const YEAR_CENTER_STARS: Record<number, number> = {
  2024: 3, // 甲辰年
  2025: 2, // 乙巳年
  2026: 1, // 丙午年
  2027: 9, // 丁未年
  2028: 8, // 戊申年
  2029: 7, // 己酉年
  2030: 6, // 庚戌年
  2031: 5, // 辛亥年
  2032: 4, // 壬子年
  2033: 3, // 癸丑年
};

// 月飞星入中宫规律（基于节气）
const MONTH_CENTER_STARS = [
  { month: '正月', star: 8, solar: '立春-惊蛰' },
  { month: '二月', star: 7, solar: '惊蛰-清明' },
  { month: '三月', star: 6, solar: '清明-立夏' },
  { month: '四月', star: 5, solar: '立夏-芒种' },
  { month: '五月', star: 4, solar: '芒种-小暑' },
  { month: '六月', star: 3, solar: '小暑-立秋' },
  { month: '七月', star: 2, solar: '立秋-白露' },
  { month: '八月', star: 1, solar: '白露-寒露' },
  { month: '九月', star: 9, solar: '寒露-立冬' },
  { month: '十月', star: 8, solar: '立冬-大雪' },
  { month: '十一月', star: 7, solar: '大雪-小寒' },
  { month: '十二月', star: 6, solar: '小寒-立春' },
];

// 九星流年影响解读
const STAR_YEARLY_EFFECTS: Record<
  number,
  {
    name: string;
    positive: string[];
    negative: string[];
    advice: string[];
    suitable: string[];
    avoid: string[];
  }
> = {
  1: {
    name: '一白贪狼水',
    positive: ['桃花运旺', '人缘提升', '贵人相助', '财运机遇'],
    negative: ['感情纠纷', '烂桃花', '肾脏问题'],
    advice: ['多参加社交活动', '把握人脉机会', '注意感情选择'],
    suitable: ['谈恋爱', '拓展人脉', '创意工作'],
    avoid: ['感情用事', '过度饮酒', '熬夜'],
  },
  2: {
    name: '二黑巨门土',
    positive: ['稳重踏实', '适合守成'],
    negative: ['病符入宅', '小人是非', '肠胃疾病', '孕妇不利'],
    advice: ['注意健康检查', '避免争执', '铜器化解'],
    suitable: ['养生调理', '稳定发展'],
    avoid: ['手术', '探病', '争吵', '投机'],
  },
  3: {
    name: '三碧禄存木',
    positive: ['行动力强', '进取心旺'],
    negative: ['是非官非', '争执不断', '肝胆问题', '盗贼'],
    advice: ['谨言慎行', '避免诉讼', '红色化解'],
    suitable: ['运动健身', '积极进取'],
    avoid: ['口舌争执', '法律纠纷', '冲动决策'],
  },
  4: {
    name: '四绿文昌木',
    positive: ['学业进步', '文思泉涌', '考试顺利', '事业提升'],
    negative: ['桃花劫', '精神压力'],
    advice: ['专注学习', '提升技能', '文房四宝助运'],
    suitable: ['读书学习', '考试升学', '创作写作', '进修培训'],
    avoid: ['分心杂念', '感情困扰'],
  },
  5: {
    name: '五黄廉贞土',
    positive: ['无'],
    negative: ['灾祸连连', '破财损丁', '意外血光', '重病缠身'],
    advice: ['必须化解！', '铜铃铜器', '避免装修', '低调行事'],
    suitable: ['静养', '守旧'],
    avoid: ['一切重大决定', '动土装修', '投资创业', '手术'],
  },
  6: {
    name: '六白武曲金',
    positive: ['偏财运旺', '贵人提携', '权力提升', '驿马星动'],
    negative: ['头部问题', '呼吸系统'],
    advice: ['把握机遇', '多结善缘', '适度投资'],
    suitable: ['求职升迁', '投资理财', '出国发展', '买房置业'],
    avoid: ['骄傲自满', '过度投机'],
  },
  7: {
    name: '七赤破军金',
    positive: ['口才提升', '竞争力强'],
    negative: ['破财失物', '口舌是非', '手术血光', '盗贼小人'],
    advice: ['谨慎理财', '防盗防骗', '蓝色化解'],
    suitable: ['竞技比赛', '谈判'],
    avoid: ['赌博投机', '口舌之争', '手术', '高危活动'],
  },
  8: {
    name: '八白左辅土',
    positive: ['正财大旺', '升职加薪', '置业良机', '财源广进'],
    negative: ['关节问题', '过劳'],
    advice: ['努力工作', '稳健投资', '把握机会'],
    suitable: ['创业发展', '投资置业', '求财', '扩张事业'],
    avoid: ['懒惰怠慢', '错失良机'],
  },
  9: {
    name: '九紫右弼火',
    positive: ['喜事临门', '名声大振', '姻缘美满', '添丁进口'],
    negative: ['火灾隐患', '心脏问题', '眼疾'],
    advice: ['把握喜庆', '广结善缘', '注意用火安全'],
    suitable: ['结婚生子', '庆典活动', '提升名望', '艺术创作'],
    avoid: ['骄傲自满', '过度兴奋'],
  },
};

// 计算流年飞星
function calculateYearlyStars(centerStar: number): Record<number, number> {
  const positions: Record<number, number> = {};
  const sequence = [5, 6, 7, 2, 3, 4, 9, 1, 8]; // 洛书飞星顺序

  let currentStar = centerStar;
  sequence.forEach((pos, index) => {
    positions[pos] = currentStar;
    currentStar = currentStar === 9 ? 1 : currentStar + 1;
  });

  return positions;
}

// 分析流年吉凶
function analyzeYearlyInfluence(
  position: number,
  baseStar: number,
  yearStar: number,
  monthStar?: number
): {
  score: number;
  trend: 'up' | 'down' | 'neutral';
  description: string;
  warnings: string[];
  opportunities: string[];
} {
  let score = 50;
  const warnings: string[] = [];
  const opportunities: string[] = [];
  let description = '';

  // 分析年星影响
  const yearEffect = STAR_YEARLY_EFFECTS[yearStar];

  // 吉星加分
  if ([1, 4, 6, 8, 9].includes(yearStar)) {
    score += 20;
    opportunities.push(...yearEffect.positive);
  }

  // 凶星减分
  if ([2, 3, 5, 7].includes(yearStar)) {
    score -= 20;
    warnings.push(...yearEffect.negative);
  }

  // 五黄特别处理
  if (yearStar === 5) {
    score -= 30;
    description = '五黄大煞飞临，务必化解！';
    warnings.push('今年此方大凶，避免久居');
  }

  // 二五交加
  if (
    (baseStar === 2 && yearStar === 5) ||
    (baseStar === 5 && yearStar === 2)
  ) {
    score -= 40;
    description = '二五交加，极凶！必须化解';
    warnings.push('病灾之象，老幼慎居');
  }

  // 三七叠临（金木交战）
  if (
    (baseStar === 3 && yearStar === 7) ||
    (baseStar === 7 && yearStar === 3)
  ) {
    score -= 25;
    description = '三七相会，盗贼官非';
    warnings.push('防盗防骗，避免争执');
  }

  // 一四同宫（科甲联芳）
  if (
    (baseStar === 1 && yearStar === 4) ||
    (baseStar === 4 && yearStar === 1)
  ) {
    score += 30;
    description = '一四同宫，文昌大利';
    opportunities.push('利于学业考试');
  }

  // 六八并临（富贵双全）
  if (
    (baseStar === 6 && yearStar === 8) ||
    (baseStar === 8 && yearStar === 6)
  ) {
    score += 35;
    description = '六八并临，财运亨通';
    opportunities.push('财运极佳，把握机会');
  }

  // 一九合十（水火既济）
  if (
    (baseStar === 1 && yearStar === 9) ||
    (baseStar === 9 && yearStar === 1)
  ) {
    score += 25;
    description = '一九相合，喜事临门';
    opportunities.push('婚姻喜庆，贵人相助');
  }

  const trend = score >= 70 ? 'up' : score <= 30 ? 'down' : 'neutral';

  return { score, trend, description, warnings, opportunities };
}

// 方位名称
const POSITION_NAMES: Record<number, string> = {
  1: '北方坎宫',
  2: '西南坤宫',
  3: '东方震宫',
  4: '东南巽宫',
  5: '中央中宫',
  6: '西北乾宫',
  7: '西方兑宫',
  8: '东北艮宫',
  9: '南方离宫',
};

export function LiunianAdvancedAnalysis({
  basePlate,
  period,
  currentYear = new Date().getFullYear(),
  className,
}: LiunianAdvancedAnalysisProps) {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  // 获取流年飞星
  const yearCenterStar = YEAR_CENTER_STARS[selectedYear] || 3;
  const yearlyStars = calculateYearlyStars(yearCenterStar);

  // 获取月飞星
  const monthData = MONTH_CENTER_STARS[selectedMonth];
  const monthlyStars = monthData ? calculateYearlyStars(monthData.star) : {};

  // 分析各宫位流年影响
  const palaceAnalysis = basePlate.map((palace) => {
    const yearStar = yearlyStars[palace.position];
    const monthStar = monthlyStars[palace.position];
    const analysis = analyzeYearlyInfluence(
      palace.position,
      palace.yun,
      yearStar,
      monthStar
    );

    return {
      ...palace,
      yearStar,
      monthStar,
      analysis,
    };
  });

  // 找出年度最佳和最差方位
  const sortedByScore = [...palaceAnalysis].sort(
    (a, b) => b.analysis.score - a.analysis.score
  );
  const bestPositions = sortedByScore.slice(0, 3);
  const worstPositions = sortedByScore.slice(-3).reverse();

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          流年飞星分析
        </CardTitle>
        <CardDescription>分析年运月运变化，把握流年吉凶方位</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 年份选择器 */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedYear((prev) => Math.max(2024, prev - 1))}
            disabled={selectedYear <= 2024}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Select
            value={selectedYear.toString()}
            onValueChange={(v) => setSelectedYear(Number(v))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(YEAR_CENTER_STARS).map((year) => (
                <SelectItem key={year} value={year}>
                  {year}年
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedYear((prev) => Math.min(2033, prev + 1))}
            disabled={selectedYear >= 2033}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Badge variant="outline" className="ml-4">
            流年入中：{yearCenterStar}{' '}
            {STAR_YEARLY_EFFECTS[yearCenterStar].name}
          </Badge>
        </div>

        {/* 年度总体运势 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                年度吉位
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {bestPositions.map((pos, idx) => (
                <div
                  key={pos.position}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Top{idx + 1}
                    </Badge>
                    <span className="text-sm font-medium">
                      {POSITION_NAMES[pos.position]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm text-green-600 font-bold">
                      {pos.analysis.score}分
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                需化解方位
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {worstPositions.map((pos, idx) => (
                <div
                  key={pos.position}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    <span className="text-sm font-medium">
                      {POSITION_NAMES[pos.position]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-red-600">
                      {pos.analysis.score}分
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 详细分析标签页 */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">总览</TabsTrigger>
            <TabsTrigger value="monthly">月运</TabsTrigger>
            <TabsTrigger value="advice">开运建议</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* 九宫格流年图 */}
            <div className="grid grid-cols-3 gap-2 max-w-xl mx-auto">
              {[
                [4, 9, 2],
                [3, 5, 7],
                [8, 1, 6],
              ].map((row) =>
                row.map((position) => {
                  const palace = palaceAnalysis.find(
                    (p) => p.position === position
                  );
                  if (!palace) return null;

                  return (
                    <Card
                      key={position}
                      className={cn(
                        'p-3 text-center transition-all',
                        palace.analysis.trend === 'up' &&
                          'bg-green-50 dark:bg-green-900/20',
                        palace.analysis.trend === 'down' &&
                          'bg-red-50 dark:bg-red-900/20',
                        palace.analysis.trend === 'neutral' &&
                          'bg-gray-50 dark:bg-gray-800/20'
                      )}
                    >
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {POSITION_NAMES[position].split('')[0]}
                      </div>
                      <div className="flex justify-center items-center gap-2 mb-2">
                        <div className="text-lg font-bold">{palace.yun}</div>
                        <div className="text-sm">+</div>
                        <div
                          className={cn(
                            'text-lg font-bold',
                            [1, 4, 6, 8, 9].includes(palace.yearStar)
                              ? 'text-green-600'
                              : 'text-red-600'
                          )}
                        >
                          {palace.yearStar}
                        </div>
                      </div>
                      <div className="flex justify-center">
                        {palace.analysis.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : palace.analysis.trend === 'down' ? (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-gray-400" />
                        )}
                      </div>
                      <div className="text-xs mt-1 font-medium">
                        {palace.analysis.score}分
                      </div>
                    </Card>
                  );
                })
              )}
            </div>

            {/* 详细解读 */}
            <div className="space-y-3">
              {palaceAnalysis
                .sort((a, b) => b.analysis.score - a.analysis.score)
                .map((palace) => (
                  <Card key={palace.position} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          {POSITION_NAMES[palace.position]}
                          {palace.analysis.trend === 'up' && (
                            <Badge variant="default" className="bg-green-500">
                              吉
                            </Badge>
                          )}
                          {palace.analysis.trend === 'down' && (
                            <Badge variant="destructive">凶</Badge>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          原局{palace.yun}星 + 流年{palace.yearStar}星
                        </p>
                      </div>
                      <Badge variant="outline">{palace.analysis.score}分</Badge>
                    </div>

                    {palace.analysis.description && (
                      <p className="text-sm mb-2 font-medium text-blue-600 dark:text-blue-400">
                        {palace.analysis.description}
                      </p>
                    )}

                    {palace.analysis.opportunities.length > 0 && (
                      <div className="mb-2">
                        <p className="text-sm text-green-600 dark:text-green-400">
                          机遇：{palace.analysis.opportunities.join('、')}
                        </p>
                      </div>
                    )}

                    {palace.analysis.warnings.length > 0 && (
                      <div>
                        <p className="text-sm text-red-600 dark:text-red-400">
                          注意：{palace.analysis.warnings.join('、')}
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            {/* 月份选择 */}
            <Select
              value={selectedMonth.toString()}
              onValueChange={(v) => setSelectedMonth(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_CENTER_STARS.map((month, idx) => (
                  <SelectItem key={idx} value={idx.toString()}>
                    {month.month} ({month.solar})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 月运分析 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {monthData?.month}月运势
                </CardTitle>
                <CardDescription>
                  月飞星入中：{monthData?.star}星
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
                  {[
                    [4, 9, 2],
                    [3, 5, 7],
                    [8, 1, 6],
                  ].map((row) =>
                    row.map((position) => {
                      const monthStar = monthlyStars[position];
                      const isGood = [1, 4, 6, 8, 9].includes(monthStar);

                      return (
                        <div
                          key={position}
                          className={cn(
                            'p-2 text-center rounded border',
                            isGood
                              ? 'bg-green-50 border-green-200'
                              : 'bg-red-50 border-red-200'
                          )}
                        >
                          <div className="text-xs text-gray-600">
                            {POSITION_NAMES[position].slice(0, 2)}
                          </div>
                          <div
                            className={cn(
                              'text-lg font-bold',
                              isGood ? 'text-green-600' : 'text-red-600'
                            )}
                          >
                            {monthStar}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advice" className="space-y-4">
            {/* 开运建议 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    宜做事项
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {bestPositions[0] &&
                      STAR_YEARLY_EFFECTS[
                        bestPositions[0].yearStar
                      ].suitable.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-sm flex items-start gap-2"
                        >
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    忌讳事项
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {worstPositions[0] &&
                      STAR_YEARLY_EFFECTS[worstPositions[0].yearStar].avoid.map(
                        (item, idx) => (
                          <li
                            key={idx}
                            className="text-sm flex items-start gap-2"
                          >
                            <span className="text-red-500 mt-0.5">✗</span>
                            <span>{item}</span>
                          </li>
                        )
                      )}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* 化解方法 */}
            <Card className="bg-blue-50 dark:bg-blue-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  流年化解要诀
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• 五黄位：摆放铜铃、六帝钱，忌红色</p>
                <p>• 二黑位：放铜葫芦、金属音乐盒</p>
                <p>• 三碧位：用红色物品、红地毯化解</p>
                <p>• 七赤位：放蓝色物品、水养植物</p>
                <p>• 吉位催旺：八白财位放聚宝盆，四绿文昌放文昌塔</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
