/**
 * 八字分析 - 五行分析组件
 * 详细展示五行力量、平衡状态等分析
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { BaziAnalysisModel } from '@/lib/bazi/normalize';
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface ElementsAnalysisProps {
  data: BaziAnalysisModel;
}

// 五行颜色映射
const elementColors: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  wood: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
  },
  fire: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  earth: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
  },
  metal: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
  },
  water: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
  },
};

// 五行中文映射
const elementNames: Record<string, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
};

// 五行图标
const elementIcons: Record<string, string> = {
  wood: '🌳',
  fire: '🔥',
  earth: '🏔️',
  metal: '💎',
  water: '💧',
};

export function ElementsAnalysis({ data }: ElementsAnalysisProps) {
  const { metrics } = data;

  // 计算五行相对强度
  const getStrengthLevel = (
    score: number
  ): { label: string; color: string; icon: any } => {
    if (score >= 30)
      return { label: '极旺', color: 'text-green-600', icon: TrendingUp };
    if (score >= 20)
      return { label: '偏旺', color: 'text-blue-600', icon: ArrowUp };
    if (score >= 15)
      return { label: '平和', color: 'text-gray-600', icon: ArrowRight };
    if (score >= 10)
      return { label: '偏弱', color: 'text-orange-600', icon: ArrowDown };
    return { label: '极弱', color: 'text-red-600', icon: TrendingDown };
  };

  return (
    <div className="space-y-6">
      {/* 五行力量雷达图 */}
      <Card className="border-2 border-teal-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-teal-600" />
            五行力量雷达图
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-80 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-6">
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full"
              style={{ maxHeight: '320px' }}
            >
              {/* 背景同心圆 */}
              {[20, 40, 60, 80, 100].map((percentage, idx) => (
                <circle
                  key={percentage}
                  cx="200"
                  cy="200"
                  r={(percentage / 100) * 150}
                  fill="none"
                  stroke="#d1d5db"
                  strokeWidth="1"
                  opacity={0.5 - idx * 0.08}
                />
              ))}

              {/* 五条坐标轴线 */}
              {Object.keys(metrics.elementScores).map((element, idx) => {
                const angle = (idx * 72 - 90) * (Math.PI / 180);
                const x2 = 200 + Math.cos(angle) * 150;
                const y2 = 200 + Math.sin(angle) * 150;
                return (
                  <line
                    key={element}
                    x1="200"
                    y1="200"
                    x2={x2}
                    y2={y2}
                    stroke="#9ca3af"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* 数据多边形 */}
              <polygon
                points={Object.values(metrics.elementScores)
                  .map((score, idx) => {
                    const angle = (idx * 72 - 90) * (Math.PI / 180);
                    const radius = (score / 100) * 150;
                    const x = 200 + Math.cos(angle) * radius;
                    const y = 200 + Math.sin(angle) * radius;
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="rgba(20, 184, 166, 0.2)"
                stroke="rgb(20, 184, 166)"
                strokeWidth="2.5"
              />

              {/* 数据点 */}
              {Object.entries(metrics.elementScores).map(
                ([element, score], idx) => {
                  const angle = (idx * 72 - 90) * (Math.PI / 180);
                  const radius = (score / 100) * 150;
                  const x = 200 + Math.cos(angle) * radius;
                  const y = 200 + Math.sin(angle) * radius;

                  // 颜色映射
                  const pointColors: Record<string, string> = {
                    wood: '#22c55e',
                    fire: '#ef4444',
                    earth: '#eab308',
                    metal: '#9ca3af',
                    water: '#3b82f6',
                  };

                  return (
                    <g key={`point-${element}`}>
                      <circle
                        cx={x}
                        cy={y}
                        r="5"
                        fill={pointColors[element]}
                        stroke="white"
                        strokeWidth="2"
                      />
                    </g>
                  );
                }
              )}

              {/* 标签 */}
              {Object.entries(metrics.elementScores).map(
                ([element, score], idx) => {
                  const angle = (idx * 72 - 90) * (Math.PI / 180);
                  const labelRadius = 170;
                  const x = 200 + Math.cos(angle) * labelRadius;
                  const y = 200 + Math.sin(angle) * labelRadius;

                  return (
                    <g key={`label-${element}`}>
                      <text
                        x={x}
                        y={y - 8}
                        textAnchor="middle"
                        fontSize="16"
                        fontWeight="700"
                        fill="#374151"
                      >
                        {elementIcons[element]}
                      </text>
                      <text
                        x={x}
                        y={y + 10}
                        textAnchor="middle"
                        fontSize="13"
                        fontWeight="600"
                        fill="#4b5563"
                      >
                        {elementNames[element]}
                      </text>
                      <text
                        x={x}
                        y={y + 24}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#6b7280"
                      >
                        {score}%
                      </text>
                    </g>
                  );
                }
              )}

              {/* 中心标签 */}
              <circle cx="200" cy="200" r="30" fill="white" opacity="0.95" />
              <text
                x="200"
                y="205"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="14"
                fontWeight="700"
                fill="#14b8a6"
              >
                五行
              </text>
            </svg>
          </div>

          {/* 图例 */}
          <div className="flex items-center justify-center gap-4 mt-4 text-sm flex-wrap">
            {Object.entries(metrics.elementScores).map(([element, score]) => {
              const colors = elementColors[element];
              return (
                <div key={element} className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${colors.bg.replace('bg-', 'bg-opacity-100 bg-')}`}
                    style={{
                      backgroundColor:
                        element === 'wood'
                          ? '#22c55e'
                          : element === 'fire'
                            ? '#ef4444'
                            : element === 'earth'
                              ? '#eab308'
                              : element === 'metal'
                                ? '#9ca3af'
                                : '#3b82f6',
                    }}
                  ></div>
                  <span className="text-gray-700">
                    {elementNames[element]} {score}%
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 五行生克循环图 */}
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            五行生克循环图
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-96 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6">
            <svg
              viewBox="0 0 500 500"
              className="w-full h-full"
              style={{ maxHeight: '360px' }}
            >
              {/* 定义箭头 */}
              <defs>
                <marker
                  id="arrowhead-generate"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#10b981"
                    opacity="0.7"
                  />
                </marker>
                <marker
                  id="arrowhead-control"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#ef4444"
                    opacity="0.7"
                  />
                </marker>
              </defs>

              {/* 相生关系（外圈绿色）*/}
              {(() => {
                const generateCycle = [
                  { from: 'wood', to: 'fire' },
                  { from: 'fire', to: 'earth' },
                  { from: 'earth', to: 'metal' },
                  { from: 'metal', to: 'water' },
                  { from: 'water', to: 'wood' },
                ];

                const positions: Record<string, { x: number; y: number }> = {
                  wood: { x: 250, y: 100 },
                  fire: { x: 400, y: 200 },
                  earth: { x: 350, y: 380 },
                  metal: { x: 150, y: 380 },
                  water: { x: 100, y: 200 },
                };

                return generateCycle.map((rel, idx) => {
                  const from = positions[rel.from];
                  const to = positions[rel.to];

                  // 计算弧线控制点（外弧）
                  const midX = (from.x + to.x) / 2;
                  const midY = (from.y + to.y) / 2;
                  const centerX = 250;
                  const centerY = 250;
                  const dx = midX - centerX;
                  const dy = midY - centerY;
                  const distance = Math.sqrt(dx * dx + dy * dy);
                  const offsetRatio = 0.3;
                  const controlX = midX + (dx / distance) * 50 * offsetRatio;
                  const controlY = midY + (dy / distance) * 50 * offsetRatio;

                  return (
                    <path
                      key={`gen-${idx}`}
                      d={`M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      opacity="0.6"
                      markerEnd="url(#arrowhead-generate)"
                    />
                  );
                });
              })()}

              {/* 相克关系（内部红色五角星）*/}
              {(() => {
                const controlCycle = [
                  { from: 'wood', to: 'earth' },
                  { from: 'earth', to: 'water' },
                  { from: 'water', to: 'fire' },
                  { from: 'fire', to: 'metal' },
                  { from: 'metal', to: 'wood' },
                ];

                const positions: Record<string, { x: number; y: number }> = {
                  wood: { x: 250, y: 100 },
                  fire: { x: 400, y: 200 },
                  earth: { x: 350, y: 380 },
                  metal: { x: 150, y: 380 },
                  water: { x: 100, y: 200 },
                };

                return controlCycle.map((rel, idx) => {
                  const from = positions[rel.from];
                  const to = positions[rel.to];

                  return (
                    <line
                      key={`ctrl-${idx}`}
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke="#ef4444"
                      strokeWidth="2.5"
                      opacity="0.5"
                      markerEnd="url(#arrowhead-control)"
                    />
                  );
                });
              })()}

              {/* 五行节点 */}
              {Object.entries(metrics.elementScores).map(([element, score]) => {
                const positions: Record<string, { x: number; y: number }> = {
                  wood: { x: 250, y: 100 },
                  fire: { x: 400, y: 200 },
                  earth: { x: 350, y: 380 },
                  metal: { x: 150, y: 380 },
                  water: { x: 100, y: 200 },
                };

                const pos = positions[element];
                const size = 35 + (score / 100) * 20;

                const bgColors: Record<string, string> = {
                  wood: '#dcfce7',
                  fire: '#fee2e2',
                  earth: '#fef3c7',
                  metal: '#f3f4f6',
                  water: '#dbeafe',
                };

                const borderColors: Record<string, string> = {
                  wood: '#22c55e',
                  fire: '#ef4444',
                  earth: '#eab308',
                  metal: '#6b7280',
                  water: '#3b82f6',
                };

                return (
                  <g key={`node-${element}`}>
                    {/* 节点背景光晕 */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={size + 5}
                      fill={bgColors[element]}
                      opacity="0.5"
                    />
                    {/* 节点主体 */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={size}
                      fill="white"
                      stroke={borderColors[element]}
                      strokeWidth="4"
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                    {/* 内填充 */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={size * 0.7}
                      fill={bgColors[element]}
                      opacity="0.8"
                    />
                    {/* 图标 */}
                    <text
                      x={pos.x}
                      y={pos.y - 5}
                      textAnchor="middle"
                      fontSize="20"
                    >
                      {elementIcons[element]}
                    </text>
                    {/* 名称 */}
                    <text
                      x={pos.x}
                      y={pos.y + 12}
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="700"
                      fill={borderColors[element]}
                    >
                      {elementNames[element]}
                    </text>
                    {/* 分数 */}
                    <text
                      x={pos.x}
                      y={pos.y + size + 20}
                      textAnchor="middle"
                      fontSize="12"
                      fill="#6b7280"
                    >
                      {score}%
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* 关系说明 */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-green-500"></div>
                <span className="text-gray-600">相生（外圈）</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-red-500"></div>
                <span className="text-gray-600">相克（内星）</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-teal-600 bg-teal-50"></div>
                <span className="text-gray-600">强势五行</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h5 className="font-medium text-green-900 mb-1 text-sm">
                  相生循环
                </h5>
                <p className="text-xs text-gray-700">
                  木→火→土→金→水→木，外圈绿色箭头表示相生关系， 促进能量流转。
                </p>
              </div>

              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <h5 className="font-medium text-red-900 mb-1 text-sm">
                  相克循环
                </h5>
                <p className="text-xs text-gray-700">
                  木→土→水→火→金→木，内部红色五角星表示相克关系， 制约能量过盛。
                </p>
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
              <p className="text-sm text-gray-800">
                <strong className="text-purple-900">💡 解读：</strong>
                节点大小表示五行力量。理想状态是五行流通有情，
                相生相克适度。过旺需泄，过弱需补，达到动态平衡。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 五行力量总览 */}
      <Card className="border-2 border-teal-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            五行力量分布
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(metrics.elementScores).map(([element, score]) => {
              const strengthInfo = getStrengthLevel(score);
              const Icon = strengthInfo.icon;
              const colors = elementColors[element];

              return (
                <div key={element} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{elementIcons[element]}</span>
                      <span className="font-medium">
                        {elementNames[element]}
                      </span>
                      <Badge
                        variant="outline"
                        className={`${colors.bg} ${colors.text} ${colors.border}`}
                      >
                        {score}%
                      </Badge>
                      <Icon className={`w-4 h-4 ${strengthInfo.color}`} />
                      <span className={`text-sm ${strengthInfo.color}`}>
                        {strengthInfo.label}
                      </span>
                    </div>
                  </div>
                  <Progress value={score} className="h-3" />
                </div>
              );
            })}
          </div>

          {/* 五行平衡提示 */}
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border-2">
            {metrics.balance.status === 'balanced' ? (
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">五行平衡</p>
                  <p className="text-sm text-gray-600 mt-1">
                    您的五行分布较为均衡，命局稳定，易于发挥天赋。
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800">五行失衡</p>
                  <div className="text-sm text-gray-700 mt-1 space-y-1">
                    {metrics.balance.excess &&
                      metrics.balance.excess.length > 0 && (
                        <p>• 过旺五行: {metrics.balance.excess.join('、')}</p>
                      )}
                    {metrics.balance.shortage &&
                      metrics.balance.shortage.length > 0 && (
                        <p>• 不足五行: {metrics.balance.shortage.join('、')}</p>
                      )}
                    <p className="mt-2 text-orange-700">
                      建议通过补足不足五行来达到平衡，可参考用神建议。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 五行生克关系 */}
      <Card className="border-2 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            五行生克关系
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">相生关系</h4>
              <p className="text-sm text-gray-700">
                木生火 → 火生土 → 土生金 → 金生水 → 水生木
              </p>
              <p className="text-xs text-gray-600 mt-2">
                相生表示促进、助长的关系，有利于能量的传递和转化
              </p>
            </div>

            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <h4 className="font-medium text-red-900 mb-2">相克关系</h4>
              <p className="text-sm text-gray-700">
                木克土 → 土克水 → 水克火 → 火克金 → 金克木
              </p>
              <p className="text-xs text-gray-600 mt-2">
                相克表示制约、抑制的关系，适度相克有助于保持平衡
              </p>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border-2 border-blue-300">
              <p className="text-sm text-gray-800">
                <strong className="text-blue-900">💡 提示：</strong>
                五行生克平衡是八字命理的核心。相生过度则泄，相克过度则伤。
                最理想的状态是五行流通有情，相生相克适度，达到动态平衡。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
