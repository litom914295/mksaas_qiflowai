/**
 * 八字分析 - 四柱排盘详解组件
 * 详细展示四柱信息、藏干、十神、神煞、刑冲合害等
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { BaziAnalysisModel } from '@/lib/bazi/normalize';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Info,
  Shield,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';

interface PillarsDetailProps {
  data: BaziAnalysisModel;
}

// 地支藏干
const hiddenStems: Record<string, { main: string; middle?: string; residual?: string }> = {
  '子': { main: '癸' },
  '丑': { main: '己', middle: '癸', residual: '辛' },
  '寅': { main: '甲', middle: '丙', residual: '戊' },
  '卯': { main: '乙' },
  '辰': { main: '戊', middle: '乙', residual: '癸' },
  '巳': { main: '丙', middle: '庚', residual: '戊' },
  '午': { main: '丁', middle: '己' },
  '未': { main: '己', middle: '丁', residual: '乙' },
  '申': { main: '庚', middle: '壬', residual: '戊' },
  '酉': { main: '辛' },
  '戌': { main: '戊', middle: '辛', residual: '丁' },
  '亥': { main: '壬', middle: '甲' },
};

// 纳音五行
const nayinMap: Record<string, string> = {
  '甲子': '海中金', '乙丑': '海中金',
  '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木',
  '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金',
  '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水',
  '戊寅': '城墙土', '己卯': '城墙土',
  '庚辰': '白蜡金', '辛巳': '白蜡金',
  '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水',
  '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火',
  '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水',
  '甲午': '沙中金', '乙未': '沙中金',
  '丙申': '山下火', '丁酉': '山下火',
  '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土',
  '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '佛灯火', '乙巳': '佛灯火',
  '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土',
  '庚戌': '钗钏金', '辛亥': '钗钏金',
  '壬子': '桑柘木', '癸丑': '桑柘木',
  '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '沙中土', '丁巳': '沙中土',
  '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木',
  '壬戌': '大海水', '癸亥': '大海水',
};

// 空亡
const kongwangMap: Record<string, string[]> = {
  '甲子': ['戌', '亥'],
  '甲戌': ['申', '酉'],
  '甲申': ['午', '未'],
  '甲午': ['辰', '巳'],
  '甲辰': ['寅', '卯'],
  '甲寅': ['子', '丑'],
};

// 地支刑冲合害
const branchRelations = {
  clash: {
    '子': '午', '午': '子',
    '丑': '未', '未': '丑',
    '寅': '申', '申': '寅',
    '卯': '酉', '酉': '卯',
    '辰': '戌', '戌': '辰',
    '巳': '亥', '亥': '巳',
  },
  harm: {
    '子': '未', '未': '子',
    '丑': '午', '午': '丑',
    '寅': '巳', '巳': '寅',
    '卯': '辰', '辰': '卯',
    '申': '亥', '亥': '申',
    '酉': '戌', '戌': '酉',
  },
  combine: {
    '子': '丑', '丑': '子',
    '寅': '亥', '亥': '寅',
    '卯': '戌', '戌': '卯',
    '辰': '酉', '酉': '辰',
    '巳': '申', '申': '巳',
    '午': '未', '未': '午',
  },
};

export function PillarsDetail({ data }: PillarsDetailProps) {
  const { base, tenGods } = data;
  const pillars = ['year', 'month', 'day', 'hour'] as const;
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];

  // 获取纳音
  const getNayin = (stem: string, branch: string) => {
    return nayinMap[stem + branch] || '未知';
  };

  // 获取空亡
  const getKongwang = (dayStem: string, dayBranch: string) => {
    const key = Object.keys(kongwangMap).find(k => 
      k[0] === dayStem && ['子', '戌', '申', '午', '辰', '寅'].includes(k[1])
    );
    return key ? kongwangMap[key] : [];
  };

  const kongwang = getKongwang(base.pillars.day.heavenlyStem, base.pillars.day.earthlyBranch);

  // 检测刑冲合害
  const detectRelations = () => {
    const branches = pillars.map(p => base.pillars[p].earthlyBranch);
    const relations: { type: string; branches: string[]; description: string }[] = [];

    // 检测相冲
    for (let i = 0; i < branches.length; i++) {
      for (let j = i + 1; j < branches.length; j++) {
        if (branchRelations.clash[branches[i] as keyof typeof branchRelations.clash] === branches[j]) {
          relations.push({
            type: '相冲',
            branches: [pillarNames[i], pillarNames[j]],
            description: `${branches[i]}${branches[j]}相冲,气场对立,需要化解`,
          });
        }
      }
    }

    // 检测相害
    for (let i = 0; i < branches.length; i++) {
      for (let j = i + 1; j < branches.length; j++) {
        if (branchRelations.harm[branches[i] as keyof typeof branchRelations.harm] === branches[j]) {
          relations.push({
            type: '相害',
            branches: [pillarNames[i], pillarNames[j]],
            description: `${branches[i]}${branches[j]}相害,暗中不利,宜留意`,
          });
        }
      }
    }

    // 检测六合
    for (let i = 0; i < branches.length; i++) {
      for (let j = i + 1; j < branches.length; j++) {
        if (branchRelations.combine[branches[i] as keyof typeof branchRelations.combine] === branches[j]) {
          relations.push({
            type: '六合',
            branches: [pillarNames[i], pillarNames[j]],
            description: `${branches[i]}${branches[j]}六合,和谐相助,吉利组合`,
          });
        }
      }
    }

    return relations;
  };

  const relations = detectRelations();

  return (
    <div className="space-y-6">
      {/* 四柱总览 */}
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            四柱八字排盘
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {pillars.map((pillar, index) => {
              const pillarData = base.pillars[pillar];
              const nayin = getNayin(pillarData.heavenlyStem, pillarData.earthlyBranch);
              const isKongwang = kongwang.includes(pillarData.earthlyBranch);

              return (
                <Card 
                  key={pillar} 
                  className={`border-2 ${pillar === 'day' ? 'border-purple-400 bg-purple-50' : ''}`}
                >
                  <CardContent className="pt-6">
                    <div className="text-center space-y-3">
                      {/* 柱名 */}
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs text-gray-500 font-medium">
                          {pillarNames[index]}
                        </span>
                        {pillar === 'day' && (
                          <Badge variant="default" className="text-xs">
                            日主
                          </Badge>
                        )}
                      </div>

                      {/* 天干地支 */}
                      <div className="space-y-1">
                        <div className="text-3xl font-bold text-purple-700">
                          {pillarData.heavenlyStem}
                        </div>
                        <div className="text-3xl font-bold text-blue-700 relative">
                          {pillarData.earthlyBranch}
                          {isKongwang && (
                            <Badge 
                              variant="outline" 
                              className="absolute -top-1 -right-8 text-xs bg-red-50 text-red-700 border-red-200"
                            >
                              空亡
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* 纳音 */}
                      <Badge variant="secondary" className="text-xs">
                        {nayin}
                      </Badge>

                      {/* 五行 */}
                      <div className="text-sm text-gray-600">
                        {pillarData.element}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 基本信息 */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">日主</div>
              <div className="text-lg font-bold text-purple-700">
                {base.dayMaster.chinese}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">五行</div>
              <div className="text-lg font-bold text-blue-700">
                {base.dayMaster.element}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">阴阳</div>
              <div className="text-lg font-bold text-green-700">
                {['甲', '丙', '戊', '庚', '壬'].includes(base.dayMaster.chinese) ? '阳' : '阴'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">空亡</div>
              <div className="text-sm font-medium text-red-700">
                {kongwang.length > 0 ? kongwang.join('、') : '无'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: 藏干、十神、刑冲合害 */}
      <Tabs defaultValue="hidden" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hidden">地支藏干</TabsTrigger>
          <TabsTrigger value="tengods">十神配置</TabsTrigger>
          <TabsTrigger value="relations">刑冲合害</TabsTrigger>
        </TabsList>

        {/* 地支藏干 */}
        <TabsContent value="hidden" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                地支藏干详解
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {pillars.map((pillar, index) => {
                  const pillarData = base.pillars[pillar];
                  const hidden = hiddenStems[pillarData.earthlyBranch];

                  return (
                    <Card key={pillar} className="border-2">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-2">
                              {pillarNames[index]}
                            </div>
                            <div className="text-3xl font-bold text-blue-700 mb-3">
                              {pillarData.earthlyBranch}
                            </div>
                          </div>

                          <div className="space-y-2">
                            {hidden?.main && (
                              <div className="flex items-center justify-between p-2 rounded bg-purple-50">
                                <span className="text-sm text-gray-600">本气</span>
                                <Badge className="bg-purple-600">
                                  {hidden.main}
                                </Badge>
                              </div>
                            )}
                            {hidden?.middle && (
                              <div className="flex items-center justify-between p-2 rounded bg-blue-50">
                                <span className="text-sm text-gray-600">中气</span>
                                <Badge variant="secondary">
                                  {hidden.middle}
                                </Badge>
                              </div>
                            )}
                            {hidden?.residual && (
                              <div className="flex items-center justify-between p-2 rounded bg-gray-50">
                                <span className="text-sm text-gray-600">余气</span>
                                <Badge variant="outline">
                                  {hidden.residual}
                                </Badge>
                              </div>
                            )}
                            {!hidden && (
                              <div className="text-center text-sm text-gray-500 py-2">
                                暂无藏干信息
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* 藏干说明 */}
              <div className="mt-6 p-4 rounded-lg bg-purple-50 border-2 border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  藏干作用说明
                </h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>• <strong>本气</strong>: 地支中力量最强的天干,占主导地位</p>
                  <p>• <strong>中气</strong>: 地支中力量中等的天干,起辅助作用</p>
                  <p>• <strong>余气</strong>: 地支中力量最弱的天干,影响较小</p>
                  <p className="mt-2 text-purple-800">
                    藏干体现了地支的内在力量构成,对五行强弱分析和十神判断至关重要。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 十神配置 */}
        <TabsContent value="tengods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-600" />
                四柱十神分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 十神统计 */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {tenGods.profile.slice(0, 5).map((god) => (
                    <div 
                      key={god.chinese} 
                      className="p-3 rounded-lg border-2 text-center"
                    >
                      <div className="text-xs text-gray-600 mb-1">{god.chinese}</div>
                      <div className="text-2xl font-bold text-purple-700">
                        {god.count}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 十神特点 */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200">
                  <h4 className="font-medium text-amber-900 mb-3">十神特点分析</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {tenGods.characteristics.slice(0, 4).map((characteristic, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{characteristic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 升级提示 */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">
                        十神深度解读
                      </h4>
                      <p className="text-sm text-gray-600">
                        升级专业版查看十神组合分析、性格影响、事业指导等详细内容
                      </p>
                    </div>
                    <Shield className="w-12 h-12 text-blue-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 刑冲合害 */}
        <TabsContent value="relations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-red-600" />
                地支刑冲合害关系
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {relations.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
                    <p className="text-lg font-medium text-green-800 mb-1">
                      四柱和谐
                    </p>
                    <p className="text-sm text-gray-600">
                      地支之间无明显刑冲合害,命局较为稳定
                    </p>
                  </div>
                ) : (
                  <>
                    {relations.map((relation, idx) => {
                      const colors = {
                        '相冲': 'bg-red-50 border-red-200 text-red-800',
                        '相害': 'bg-orange-50 border-orange-200 text-orange-800',
                        '六合': 'bg-green-50 border-green-200 text-green-800',
                      };
                      const icons = {
                        '相冲': <AlertCircle className="w-5 h-5 text-red-600" />,
                        '相害': <AlertCircle className="w-5 h-5 text-orange-600" />,
                        '六合': <CheckCircle className="w-5 h-5 text-green-600" />,
                      };

                      return (
                        <div 
                          key={idx}
                          className={`p-4 rounded-lg border-2 ${colors[relation.type as keyof typeof colors]}`}
                        >
                          <div className="flex items-start gap-3">
                            {icons[relation.type as keyof typeof icons]}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold">{relation.type}</span>
                                <Badge variant="outline" className="text-xs">
                                  {relation.branches.join(' - ')}
                                </Badge>
                              </div>
                              <p className="text-sm">
                                {relation.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* 说明 */}
                <div className="p-4 rounded-lg bg-blue-50 border-2 border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    刑冲合害解读
                  </h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>• <strong>六合</strong>: 地支相合,和谐相助,有利于运势</p>
                    <p>• <strong>相冲</strong>: 地支对冲,气场相克,易生变动</p>
                    <p>• <strong>相害</strong>: 地支相害,暗中不利,需要化解</p>
                    <p>• <strong>相刑</strong>: 地支相刑,内在冲突,需要调和</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
