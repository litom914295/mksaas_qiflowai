/**
 * 八字分析 - 十神深度解读组件
 * 付费功能：展示十神的详细分析、性格特征、人生影响
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { BaziAnalysisModel } from '@/lib/bazi/normalize';
import {
  Brain,
  Briefcase,
  Crown,
  Heart,
  HelpCircle,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useMemo } from 'react';

interface TenGodsAnalysisProps {
  data: BaziAnalysisModel;
}

// 十神图标映射
const tenGodIcons: Record<string, any> = {
  比肩: Users,
  劫财: Zap,
  食神: Heart,
  伤官: Brain,
  正财: Briefcase,
  偏财: TrendingUp,
  正官: Crown,
  七杀: Shield,
  正印: Star,
  偏印: Sparkles,
};

// 十神颜色映射
const tenGodColors: Record<string, string> = {
  比肩: 'bg-blue-100 text-blue-800 border-blue-300',
  劫财: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  食神: 'bg-pink-100 text-pink-800 border-pink-300',
  伤官: 'bg-purple-100 text-purple-800 border-purple-300',
  正财: 'bg-green-100 text-green-800 border-green-300',
  偏财: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  正官: 'bg-amber-100 text-amber-800 border-amber-300',
  七杀: 'bg-red-100 text-red-800 border-red-300',
  正印: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  偏印: 'bg-teal-100 text-teal-800 border-teal-300',
};

// 十神详细解释
const tenGodDetails: Record<
  string,
  {
    category: string;
    traits: string[];
    career: string[];
    relationships: string;
    advice: string;
  }
> = {
  比肩: {
    category: '比劫星',
    traits: ['独立自主', '竞争意识强', '坚持己见', '重视朋友'],
    career: ['创业', '自由职业', '竞技体育', '销售'],
    relationships: '重友轻色，兄弟情深',
    advice: '学会合作，避免过于固执',
  },
  劫财: {
    category: '比劫星',
    traits: ['冒险精神', '行动力强', '不拘小节', '仗义'],
    career: ['投资', '冒险行业', '体育', '军警'],
    relationships: '豪爽大方，易冲动',
    advice: '控制冲动，谨慎理财',
  },
  食神: {
    category: '食伤星',
    traits: ['乐观开朗', '才华横溢', '享受生活', '人缘好'],
    career: ['艺术', '美食', '娱乐', '教育'],
    relationships: '温和体贴，受人喜爱',
    advice: '避免过于安逸，保持进取心',
  },
  伤官: {
    category: '食伤星',
    traits: ['聪明机智', '创新能力强', '个性鲜明', '不服输'],
    career: ['技术', '创意', '媒体', '律师'],
    relationships: '个性强烈，需要理解',
    advice: '学会收敛锋芒，注重团队合作',
  },
  正财: {
    category: '财星',
    traits: ['踏实稳重', '勤劳节俭', '重视家庭', '有责任心'],
    career: ['财务', '银行', '会计', '公务员'],
    relationships: '顾家负责，感情专一',
    advice: '适当冒险，把握机会',
  },
  偏财: {
    category: '财星',
    traits: ['慷慨大方', '社交能力强', '机会主义', '灵活变通'],
    career: ['商业', '投资', '贸易', '市场营销'],
    relationships: '魅力十足，桃花较旺',
    advice: '理性投资，避免投机',
  },
  正官: {
    category: '官杀星',
    traits: ['正直守信', '责任感强', '领导能力', '自律'],
    career: ['管理', '政府', '法律', '教育'],
    relationships: '稳重可靠，值得信赖',
    advice: '保持灵活，避免过于刻板',
  },
  七杀: {
    category: '官杀星',
    traits: ['果断勇敢', '执行力强', '威严', '正义感'],
    career: ['军警', '外科医生', '企业高管', '竞技运动'],
    relationships: '强势保护，需要柔化',
    advice: '学会宽容，注意健康',
  },
  正印: {
    category: '印星',
    traits: ['善良慈悲', '学习能力强', '有修养', '重精神'],
    career: ['教育', '文化', '宗教', '心理咨询'],
    relationships: '温暖包容，精神伴侣',
    advice: '增强行动力，避免过于理想化',
  },
  偏印: {
    category: '印星',
    traits: ['思维独特', '洞察力强', '神秘', '有灵性'],
    career: ['研究', '玄学', '心理学', '艺术创作'],
    relationships: '独特魅力，需要空间',
    advice: '保持接地气，增进人际交流',
  },
};

export function TenGodsAnalysis({ data }: TenGodsAnalysisProps) {
  const { tenGods } = data;

  // 计算十神分布统计
  const statistics = useMemo(() => {
    const categoryCount: Record<string, number> = {
      比劫星: 0,
      食伤星: 0,
      财星: 0,
      官杀星: 0,
      印星: 0,
    };

    tenGods.profile.forEach((god) => {
      const detail = tenGodDetails[god.chinese];
      if (detail) {
        categoryCount[detail.category] =
          (categoryCount[detail.category] || 0) + god.count;
      }
    });

    return categoryCount;
  }, [tenGods.profile]);

  // 找出最强的十神
  const dominantGod = useMemo(() => {
    return tenGods.profile.reduce(
      (max, current) => (current.strength > max.strength ? current : max),
      tenGods.profile[0]
    );
  }, [tenGods.profile]);

  return (
    <div className="space-y-6">
      {/* 十神总览卡片 */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-600" />
            十神格局总览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 主导十神 */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-purple-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">您的主导十神</p>
                <div className="flex items-center gap-2">
                  {dominantGod && (
                    <>
                      {tenGodIcons[dominantGod.chinese] &&
                        (() => {
                          const Icon = tenGodIcons[dominantGod.chinese];
                          return <Icon className="w-5 h-5 text-purple-600" />;
                        })()}
                      <span className="text-xl font-bold text-purple-800">
                        {dominantGod.chinese}
                      </span>
                      <Badge className="bg-purple-100 text-purple-700">
                        强度 {dominantGod.strength}%
                      </Badge>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {tenGodDetails[dominantGod?.chinese]?.traits
                    .slice(0, 2)
                    .join('、')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">性格倾向</p>
                <p className="text-lg font-semibold text-purple-700">
                  {tenGods.characteristics[0]}
                </p>
              </div>
            </div>

            {/* 十神分布统计 */}
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(statistics).map(([category, count]) => (
                <div
                  key={category}
                  className="text-center p-3 bg-white rounded-lg border hover:shadow-md transition-shadow"
                >
                  <p className="text-xs text-gray-500">{category}</p>
                  <p className="text-lg font-bold text-gray-800">{count}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 十神力量雷达图 */}
      <Card className="border-2 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            十神力量分布雷达图
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-80 bg-white rounded-lg p-6">
            {/* SVG 雷达图 */}
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full"
              style={{ maxHeight: '320px' }}
            >
              {/* 背景同心圆 */}
              {[20, 40, 60, 80, 100].map((radius, idx) => (
                <circle
                  key={radius}
                  cx="200"
                  cy="200"
                  r={radius * 1.5}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  opacity={0.5 - idx * 0.08}
                />
              ))}

              {/* 十条坐标轴线 */}
              {tenGods.profile.slice(0, 10).map((god, idx) => {
                const angle = (idx * 36 - 90) * (Math.PI / 180);
                const x2 = 200 + Math.cos(angle) * 150;
                const y2 = 200 + Math.sin(angle) * 150;
                return (
                  <line
                    key={god.name}
                    x1="200"
                    y1="200"
                    x2={x2}
                    y2={y2}
                    stroke="#d1d5db"
                    strokeWidth="1"
                  />
                );
              })}

              {/* 数据多边形 */}
              <polygon
                points={tenGods.profile
                  .slice(0, 10)
                  .map((god, idx) => {
                    const angle = (idx * 36 - 90) * (Math.PI / 180);
                    const radius = (god.strength / 100) * 150;
                    const x = 200 + Math.cos(angle) * radius;
                    const y = 200 + Math.sin(angle) * radius;
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="rgba(147, 51, 234, 0.2)"
                stroke="rgb(147, 51, 234)"
                strokeWidth="2"
              />

              {/* 数据点 */}
              {tenGods.profile.slice(0, 10).map((god, idx) => {
                const angle = (idx * 36 - 90) * (Math.PI / 180);
                const radius = (god.strength / 100) * 150;
                const x = 200 + Math.cos(angle) * radius;
                const y = 200 + Math.sin(angle) * radius;
                return (
                  <circle
                    key={`point-${god.name}`}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="rgb(147, 51, 234)"
                  />
                );
              })}

              {/* 标签 */}
              {tenGods.profile.slice(0, 10).map((god, idx) => {
                const angle = (idx * 36 - 90) * (Math.PI / 180);
                const labelRadius = 170;
                const x = 200 + Math.cos(angle) * labelRadius;
                const y = 200 + Math.sin(angle) * labelRadius;
                return (
                  <text
                    key={`label-${god.name}`}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="#4b5563"
                  >
                    {god.chinese}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* 图例 */}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-600"></div>
              <span className="text-gray-600">十神力量</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-gray-300"></div>
              <span className="text-gray-600">基准线</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 十神数量统计柱状图 */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            十神出现频次统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tenGods.profile
              .slice()
              .sort((a, b) => b.count - a.count)
              .map((god) => {
                const Icon = tenGodIcons[god.chinese] || Star;
                const percentage = (god.count / 8) * 100; // 假设最多8个
                return (
                  <div key={god.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1.5 rounded ${
                            tenGodColors[god.chinese] || 'bg-gray-100'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-800">
                          {god.chinese}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {god.count} 次
                        </Badge>
                        <span className="text-sm text-gray-600 min-w-[50px] text-right">
                          {god.strength}%
                        </span>
                      </div>
                    </div>
                    <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-700">
                          {god.count > 0
                            ? `出现 ${god.count} 次`
                            : '未出现'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong className="text-blue-900">提示：</strong>
              十神出现频次越高，说明该十神对您的影响越大。
              结合力量分布可以更全面地了解自己的性格特质。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 十神互动关系图 */}
      <Card className="border-2 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            十神互动关系图
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-96 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-6">
            <svg
              viewBox="0 0 500 500"
              className="w-full h-full"
              style={{ maxHeight: '360px' }}
            >
              {/* 定义箭头标记 */}
              <defs>
                <marker
                  id="arrowhead-positive"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#10b981"
                    opacity="0.6"
                  />
                </marker>
                <marker
                  id="arrowhead-negative"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#ef4444"
                    opacity="0.6"
                  />
                </marker>
              </defs>

              {/* 绘制关系线 - 只显示主要关系 */}
              {(() => {
                const relationships = [
                  // 正相互促进关系（绿色）
                  { from: 0, to: 2, type: 'positive' }, // 比肩 -> 食神
                  { from: 2, to: 4, type: 'positive' }, // 食神 -> 正财
                  { from: 4, to: 6, type: 'positive' }, // 正财 -> 正官
                  { from: 6, to: 8, type: 'positive' }, // 正官 -> 正印
                  { from: 8, to: 0, type: 'positive' }, // 正印 -> 比肩
                  // 负相克制关系（红色）
                  { from: 3, to: 6, type: 'negative' }, // 伤官 -> 正官
                  { from: 7, to: 0, type: 'negative' }, // 七杀 -> 比肩
                ];

                return relationships.map((rel, idx) => {
                  const fromGod = tenGods.profile[rel.from];
                  const toGod = tenGods.profile[rel.to];
                  if (!fromGod || !toGod) return null;

                  const fromAngle = (rel.from * 36 - 90) * (Math.PI / 180);
                  const toAngle = (rel.to * 36 - 90) * (Math.PI / 180);
                  const radius = 120;

                  const x1 = 250 + Math.cos(fromAngle) * radius;
                  const y1 = 250 + Math.sin(fromAngle) * radius;
                  const x2 = 250 + Math.cos(toAngle) * radius;
                  const y2 = 250 + Math.sin(toAngle) * radius;

                  // 计算控制点以形成弧线
                  const midX = (x1 + x2) / 2;
                  const midY = (y1 + y2) / 2;
                  const dx = x2 - x1;
                  const dy = y2 - y1;
                  const offset = 30;
                  const controlX = midX + (-dy / Math.sqrt(dx * dx + dy * dy)) * offset;
                  const controlY = midY + (dx / Math.sqrt(dx * dx + dy * dy)) * offset;

                  return (
                    <path
                      key={`rel-${idx}`}
                      d={`M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`}
                      fill="none"
                      stroke={rel.type === 'positive' ? '#10b981' : '#ef4444'}
                      strokeWidth="2"
                      opacity="0.4"
                      markerEnd={`url(#arrowhead-${rel.type})`}
                    />
                  );
                });
              })()}

              {/* 十神节点 */}
              {tenGods.profile.slice(0, 10).map((god, idx) => {
                const angle = (idx * 36 - 90) * (Math.PI / 180);
                const radius = 120;
                const x = 250 + Math.cos(angle) * radius;
                const y = 250 + Math.sin(angle) * radius;
                const size = Math.max(20, (god.strength / 100) * 40);

                return (
                  <g key={`node-${god.name}`}>
                    {/* 节点圆圈 */}
                    <circle
                      cx={x}
                      cy={y}
                      r={size}
                      fill="white"
                      stroke={god.strength > 60 ? '#9333ea' : '#d1d5db'}
                      strokeWidth="3"
                      className="hover:stroke-purple-600 transition-colors cursor-pointer"
                    />
                    {/* 节点内填充 */}
                    <circle
                      cx={x}
                      cy={y}
                      r={size * 0.7}
                      fill={god.strength > 60 ? '#f3e8ff' : '#f9fafb'}
                      opacity="0.8"
                    />
                    {/* 文字标签 */}
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="12"
                      fontWeight="700"
                      fill={god.strength > 60 ? '#7c3aed' : '#6b7280'}
                    >
                      {god.chinese}
                    </text>
                    {/* 力量标注 */}
                    <text
                      x={x}
                      y={y + size + 15}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#9ca3af"
                    >
                      {god.strength}%
                    </text>
                  </g>
                );
              })}

              {/* 中心标签 */}
              <circle cx="250" cy="250" r="35" fill="white" opacity="0.9" />
              <circle cx="250" cy="250" r="30" fill="#f3e8ff" />
              <text
                x="250"
                y="250"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="14"
                fontWeight="700"
                fill="#7c3aed"
              >
                十神
              </text>
            </svg>
          </div>

          {/* 关系说明 */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-green-500"></div>
                <span className="text-gray-600">相生相助</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-red-500"></div>
                <span className="text-gray-600">相克相制</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-purple-600 bg-purple-50"></div>
                <span className="text-gray-600">强势十神</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong className="text-emerald-900">关系解读：</strong>
                图中展示了十神之间的主要相互作用。绿色箭头表示相生关系，
                红色箭头表示相克关系。节点大小表示十神力量，紫色边框为强势十神。
                理解这些关系可以帮助您更好地把握自己的性格特点和人生走向。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 十神详细分析网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tenGods.profile.map((god) => {
          const Icon = tenGodIcons[god.chinese] || Star;
          const detail = tenGodDetails[god.chinese];
          const isStrong = god.strength > 60;
          const isWeak = god.strength < 30;

          return (
            <Card
              key={god.name}
              className={`border-2 transition-all hover:shadow-lg ${
                isStrong
                  ? 'border-purple-300 bg-purple-50/50'
                  : isWeak
                    ? 'border-gray-200 bg-gray-50/50'
                    : 'border-gray-200'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${
                        tenGodColors[god.chinese] || 'bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{god.chinese}</h3>
                      <p className="text-xs text-gray-500">
                        {detail?.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-600">强度</span>
                            <HelpCircle className="w-3 h-3 text-gray-400" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>十神在命局中的影响力</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <p
                      className={`text-2xl font-bold ${
                        isStrong
                          ? 'text-purple-600'
                          : isWeak
                            ? 'text-gray-400'
                            : 'text-gray-700'
                      }`}
                    >
                      {god.strength}%
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* 强度条 */}
                <Progress value={god.strength} className="h-2" />

                {/* 性格特征 */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">性格特征</p>
                  <div className="flex flex-wrap gap-1">
                    {detail?.traits.map((trait) => (
                      <Badge key={trait} variant="outline" className="text-xs">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 适合职业 */}
                {god.strength > 50 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">适合领域</p>
                    <p className="text-sm text-gray-700">
                      {detail?.career.join('、')}
                    </p>
                  </div>
                )}

                {/* 关键词 */}
                {god.keywords.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">关键影响</p>
                    <div className="flex items-center gap-2">
                      <Target className="w-3 h-3 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {god.keywords.slice(0, 3).join('、')}
                      </p>
                    </div>
                  </div>
                )}

                {/* 趋势指示 */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1">
                    {god.trend === 'rising' && (
                      <>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-600">上升期</span>
                      </>
                    )}
                    {god.trend === 'declining' && (
                      <>
                        <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
                        <span className="text-xs text-red-600">减弱期</span>
                      </>
                    )}
                    {god.trend === 'stable' && (
                      <span className="text-xs text-gray-500">稳定期</span>
                    )}
                  </div>
                  {god.count > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      出现 {god.count} 次
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 十神特征标签云 */}
      <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-600" />
            性格特征标签云
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 根据十神分类展示特征标签 */}
            {Object.entries(statistics)
              .filter(([_, count]) => count > 0)
              .map(([category, count]) => {
                const categoryGods = tenGods.profile.filter(
                  (god) => tenGodDetails[god.chinese]?.category === category
                );
                const allTraits = categoryGods.flatMap(
                  (god) => tenGodDetails[god.chinese]?.traits || []
                );

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gradient-to-r from-cyan-600 to-blue-600">
                        {category}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        出现 {count} 次
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(allTraits)].map((trait, idx) => (
                        <Badge
                          key={`${category}-${idx}`}
                          variant="outline"
                          className="px-3 py-1 text-sm hover:bg-cyan-100 hover:border-cyan-400 transition-colors cursor-pointer"
                          style={{
                            fontSize: `${0.75 + Math.random() * 0.25}rem`,
                          }}
                        >
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}

            {/* 全局特征标签 */}
            <div className="mt-4 p-4 bg-white rounded-lg">
              <h4 className="font-semibold mb-3 text-cyan-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                综合性格特征
              </h4>
              <div className="flex flex-wrap gap-2">
                {tenGods.characteristics.map((char, idx) => (
                  <Badge
                    key={idx}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all cursor-pointer"
                  >
                    {char}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 十神组合解读 */}
      <Card className="border-2 border-amber-200 bg-amber-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            十神组合解读
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 性格总结 */}
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold mb-2 text-amber-800">
                综合性格分析
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                根据您的十神组合，您是一个
                {tenGods.characteristics.join('、')}的人。
                {dominantGod && tenGodDetails[dominantGod.chinese] && (
                  <>
                    主导十神{dominantGod.chinese}赋予您
                    {tenGodDetails[dominantGod.chinese].traits[0]}的特质， 在
                    {tenGodDetails[dominantGod.chinese].relationships}
                    方面表现突出。
                  </>
                )}
              </p>
            </div>

            {/* 发展建议 */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <h4 className="font-semibold mb-2 text-purple-800">发展建议</h4>
              <div className="space-y-2">
                {dominantGod && tenGodDetails[dominantGod.chinese] && (
                  <div className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">
                      {tenGodDetails[dominantGod.chinese].advice}
                    </p>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    善用您的{tenGods.characteristics[0]}特质，在
                    {tenGodDetails[dominantGod?.chinese]?.career[0]}
                    等领域可以获得更好发展
                  </p>
                </div>
              </div>
            </div>

            {/* 注意事项 */}
            {tenGods.profile.filter((g) => g.strength < 30).length > 0 && (
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-orange-800">
                  需要加强的方面
                </h4>
                <p className="text-sm text-gray-700">
                  您的
                  {tenGods.profile
                    .filter((g) => g.strength < 30)
                    .map((g) => g.chinese)
                    .join('、')}
                  能量较弱，可以通过相关活动和环境来补充这些能量。
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
