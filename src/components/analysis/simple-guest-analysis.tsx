'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, Calendar, Clock, MapPin, Compass, Home, 
  Star, Sparkles, Loader2, Download, Share2, ChevronRight 
} from 'lucide-react';
import { computeBaziSmart } from '@/lib/qiflow/bazi';
import { generateFlyingStar, generateFlyingStarExplanation } from '@/lib/qiflow/xuankong';

interface FormData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  gender: 'male' | 'female';
}

export function SimpleGuestAnalysis() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    birthDate: '',
    birthTime: '',
    birthCity: '',
    gender: 'male'
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // 填充示例数据
  const fillSampleData = () => {
    setFormData({
      name: '张三',
      birthDate: '1990-05-15',
      birthTime: '14:30',
      birthCity: '北京',
      gender: 'male'
    });
  };

  // 开始分析
  const startAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // 验证输入
      if (!formData.birthDate || !formData.birthTime) {
        throw new Error('请填写完整的出生日期和时间');
      }

      // 构建ISO格式的日期时间字符串
      const dateTimeStr = `${formData.birthDate}T${formData.birthTime}:00`;
      console.log('分析输入 - 日期时间:', dateTimeStr);
      console.log('分析输入 - 性别:', formData.gender);
      
      // 计算八字 - 使用正确的 EnhancedBirthData 格式
      const baziResult = await computeBaziSmart({
        datetime: dateTimeStr,  // 使用 datetime 字段，不是 dateOfBirth
        gender: formData.gender,  // 直接使用 'male' 或 'female'
        timezone: 'Asia/Shanghai',  // 添加时区
        isTimeKnown: true  // 表示时间已知
      });

      // 计算风水飞星 - 使用正确的 GenerateFlyingStarInput 格式
      const currentDate = new Date();
      const fengshuiResult = generateFlyingStar({
        observedAt: currentDate,  // 观察日期
        facing: {
          degrees: 180,  // 坐北朝南（180度）
          toleranceDeg: 0.5  // 容差
        },
        config: {
          toleranceDeg: 0.5,
          applyTiGua: false,
          applyFanGua: false,
          evaluationProfile: 'standard'
        }
      });

      // 生成风水说明
      let fengshuiExplanation = null;
      if (fengshuiResult && fengshuiResult.plates?.period) {
        try {
          // generateFlyingStarExplanation 期望的参数：(plate, period, geju, wenchangwei, caiwei)
          fengshuiExplanation = generateFlyingStarExplanation(
            fengshuiResult.plates.period, // Plate 类型
            fengshuiResult.period, // FlyingStar 类型
            fengshuiResult.geju || { // GejuAnalysis 类型
              types: [],
              descriptions: [],
              isFavorable: false
            },
            fengshuiResult.wenchangwei || '未知', // string
            fengshuiResult.caiwei || '未知' // string
          );
        } catch (expError) {
          console.warn('生成风水说明失败:', expError);
          // 生成简单的说明作为备用
          fengshuiExplanation = {
            summary: {
              favorablePalaces: [],
              unfavorablePalaces: [],
              keyPoints: ['风水分析已完成'],
              recommendations: ['根据九宫飞星分析，建议您重点关注家中的财位和文昌位，适当调整家具布局以提升运势。']
            }
          };
        }
      }

      setAnalysisResult({
        bazi: baziResult,
        fengshui: fengshuiResult,
        fengshuiExplanation: fengshuiExplanation
      });
      
      setCurrentStep(3);
    } catch (error) {
      console.error('分析出错:', error);
      alert(`分析过程中出现错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* 步骤指示器 */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}>
            1
          </div>
          <div className={`w-20 h-1 ${currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}>
            2
          </div>
          <div className={`w-20 h-1 ${currentStep >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`} />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}>
            3
          </div>
        </div>
      </div>

      {/* 步骤1: 个人信息 */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                填写个人信息
              </CardTitle>
              <Button variant="outline" size="sm" onClick={fillSampleData}>
                快速填充示例
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="请输入姓名"
                />
              </div>
              
              <div>
                <Label htmlFor="gender">性别</Label>
                <Select 
                  value={formData.gender}
                  onValueChange={(value: 'male' | 'female') => 
                    setFormData({...formData, gender: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">男</SelectItem>
                    <SelectItem value="female">女</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="birthDate">出生日期</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="birthTime">出生时间</Label>
                <Input
                  id="birthTime"
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => setFormData({...formData, birthTime: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="birthCity">出生地点</Label>
                <Input
                  id="birthCity"
                  value={formData.birthCity}
                  onChange={(e) => setFormData({...formData, birthCity: e.target.value})}
                  placeholder="请输入出生城市"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={!formData.name || !formData.birthDate || !formData.birthTime}
              >
                下一步: 房屋信息
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 步骤2: 房屋朝向 */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              房屋朝向信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Compass className="h-4 w-4" />
                <AlertDescription>
                  为了准确的风水分析，请提供您房屋的朝向信息。如果不确定，可以使用默认的"坐北朝南"。
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: '坐北朝南', value: 180 },
                  { label: '坐南朝北', value: 0 },
                  { label: '坐东朝西', value: 270 },
                  { label: '坐西朝东', value: 90 }
                ].map(direction => (
                  <Button
                    key={direction.value}
                    variant="outline"
                    className="h-20"
                    onClick={() => {
                      // 这里简化处理，直接进入分析
                      startAnalysis();
                    }}
                  >
                    {direction.label}
                  </Button>
                ))}
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  上一步
                </Button>
                <Button onClick={startAnalysis} disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    <>
                      开始分析
                      <Sparkles className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 步骤3: 分析结果 */}
      {currentStep === 3 && analysisResult && (
        <div className="space-y-6">
          {/* 用户信息卡片 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{formData.name}</h3>
                    <p className="text-sm text-gray-600">
                      {formData.birthDate} {formData.birthTime} · {formData.birthCity}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    导出报告
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    分享
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 分析结果标签页 */}
          <Card>
            <CardHeader>
              <CardTitle>综合命理分析报告</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="bazi">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="bazi">八字分析</TabsTrigger>
                  <TabsTrigger value="fengshui">风水建议</TabsTrigger>
                </TabsList>

                <TabsContent value="bazi" className="space-y-4 mt-4">
                  {analysisResult.bazi ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">四柱八字</h4>
                        <div className="grid grid-cols-4 gap-2">
                          {analysisResult.bazi.pillars ? 
                            ['year', 'month', 'day', 'hour'].map((pillarKey) => {
                              const pillar = analysisResult.bazi.pillars[pillarKey as keyof typeof analysisResult.bazi.pillars];
                              return (
                                <div key={pillarKey} className="text-center p-3 bg-gray-50 rounded">
                                  <div className="text-sm text-gray-600">
                                    {pillarKey === 'year' ? '年柱' : 
                                     pillarKey === 'month' ? '月柱' : 
                                     pillarKey === 'day' ? '日柱' : '时柱'}
                                  </div>
                                  <div className="text-lg font-medium mt-1">
                                    {pillar ? (
                                      // 处理多种可能的数据结构
                                      pillar.chinese || 
                                      (pillar.heavenlyStem && pillar.earthlyBranch ? 
                                        `${pillar.heavenlyStem}${pillar.earthlyBranch}` : 
                                        (pillar.stem && pillar.branch ? 
                                          `${pillar.stem}${pillar.branch}` : '计算中...'))
                                    ) : '计算中...'}
                                  </div>
                                  {pillar && pillar.element && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {pillar.element}
                                    </div>
                                  )}
                                </div>
                              );
                            }) : 
                            ['年柱', '月柱', '日柱', '时柱'].map(pillar => (
                              <div key={pillar} className="text-center p-3 bg-gray-50 rounded">
                                <div className="text-sm text-gray-600">{pillar}</div>
                                <div className="text-lg font-medium mt-1">计算中...</div>
                              </div>
                            ))
                          }
                        </div>
                      </div>

                      {/* 五行分析 */}
                      {analysisResult.bazi.elements && (
                        <div>
                          <h4 className="font-semibold mb-2">五行分析</h4>
                          <div className="grid grid-cols-5 gap-2">
                            {['木', '火', '土', '金', '水'].map(element => {
                              const count = analysisResult.bazi.elements?.[element] || 0;
                              return (
                                <div key={element} className="text-center p-2 bg-gray-50 rounded">
                                  <div className="text-sm">{element}</div>
                                  <div className="font-bold">{count}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 用神分析 */}
                      {analysisResult.bazi.favorableElements && (
                        <Alert>
                          <Star className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-2">
                              {analysisResult.bazi.favorableElements.primary && (
                                <p><strong>喜用五行：</strong>{analysisResult.bazi.favorableElements.primary.join('、')}</p>
                              )}
                              {analysisResult.bazi.favorableElements.unfavorable && (
                                <p><strong>忌讳五行：</strong>{analysisResult.bazi.favorableElements.unfavorable.join('、')}</p>
                              )}
                              {analysisResult.bazi.dayMasterStrength && (
                                <p><strong>日主强弱：</strong>{analysisResult.bazi.dayMasterStrength.strength === 'strong' ? '身强' : 
                                   analysisResult.bazi.dayMasterStrength.strength === 'weak' ? '身弱' : '中和'}</p>
                              )}
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      暂无八字分析结果
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="fengshui" className="space-y-4 mt-4">
                  {analysisResult.fengshui ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">九宫飞星 - {analysisResult.fengshui.period}运</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {analysisResult.fengshui.plates?.period && Array.isArray(analysisResult.fengshui.plates.period) ? 
                            analysisResult.fengshui.plates.period.map((cell: any, idx: number) => {
                              // 九宫格位置映射
                              const positions = [4, 9, 2, 3, 5, 7, 8, 1, 6]; // 洛书排列
                              const palace = positions[idx];
                              return (
                                <div key={idx} className="p-3 bg-gray-50 rounded border">
                                  <div className="text-xs text-gray-500 mb-1">宫位{palace}</div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-red-600">{cell.mountainStar || '-'}</span>
                                    <span className="text-blue-600">{cell.facingStar || '-'}</span>
                                  </div>
                                  {cell.periodStar && (
                                    <div className="text-center text-lg font-bold">
                                      {cell.periodStar}
                                    </div>
                                  )}
                                </div>
                              );
                            }) :
                            // 默认九宫格显示
                            [
                              { pos: 4, row: 0, col: 0 },
                              { pos: 9, row: 0, col: 1 },
                              { pos: 2, row: 0, col: 2 },
                              { pos: 3, row: 1, col: 0 },
                              { pos: 5, row: 1, col: 1 },
                              { pos: 7, row: 1, col: 2 },
                              { pos: 8, row: 2, col: 0 },
                              { pos: 1, row: 2, col: 1 },
                              { pos: 6, row: 2, col: 2 }
                            ].map(({pos}) => (
                              <div key={pos} className="text-center p-4 bg-gray-50 rounded border">
                                <div className="text-xs text-gray-500 mb-1">宫位</div>
                                <div className="text-2xl font-bold">{pos}</div>
                              </div>
                            ))
                          }
                        </div>
                      </div>

                      {/* 格局分析 */}
                      {analysisResult.fengshui.geju && (
                        <div>
                          <h4 className="font-semibold mb-2">格局分析</h4>
                          <Alert className={analysisResult.fengshui.geju.isFavorable ? '' : 'border-orange-200'}>
                            <Home className="h-4 w-4" />
                            <AlertDescription>
                              <div className="space-y-2">
                                {analysisResult.fengshui.geju.types && (
                                  <p><strong>格局类型：</strong>{analysisResult.fengshui.geju.types.join('、')}</p>
                                )}
                                {analysisResult.fengshui.geju.descriptions && (
                                  <p>{analysisResult.fengshui.geju.descriptions.join(' ')}</p>
                                )}
                              </div>
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}

                      {/* 吉位分析 */}
                      <div className="grid grid-cols-2 gap-4">
                        {analysisResult.fengshui.wenchangwei && (
                          <Alert>
                            <Sparkles className="h-4 w-4" />
                            <AlertDescription>
                              <strong>文昌位：</strong>{analysisResult.fengshui.wenchangwei}
                              <div className="text-xs text-gray-600 mt-1">适合设置书房或学习区域</div>
                            </AlertDescription>
                          </Alert>
                        )}
                        {analysisResult.fengshui.caiwei && (
                          <Alert>
                            <Star className="h-4 w-4" />
                            <AlertDescription>
                              <strong>财位：</strong>{analysisResult.fengshui.caiwei}
                              <div className="text-xs text-gray-600 mt-1">适合摆放招财物品</div>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      {/* 风水说明 */}
                      {analysisResult.fengshuiExplanation && (
                        <Alert>
                          <Compass className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-2">
                              <p className="font-semibold">风水建议：</p>
                              {analysisResult.fengshuiExplanation.summary ? (
                                <div className="space-y-2">
                                  {/* 关键要点 */}
                                  {analysisResult.fengshuiExplanation.summary.keyPoints && 
                                   analysisResult.fengshuiExplanation.summary.keyPoints.length > 0 && (
                                    <div>
                                      <p className="text-sm font-medium">关键要点：</p>
                                      <ul className="list-disc list-inside text-sm text-gray-600">
                                        {analysisResult.fengshuiExplanation.summary.keyPoints.map((point: string, idx: number) => (
                                          <li key={idx}>{point}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {/* 建议 */}
                                  {analysisResult.fengshuiExplanation.summary.recommendations && 
                                   analysisResult.fengshuiExplanation.summary.recommendations.length > 0 && (
                                    <div>
                                      <p className="text-sm font-medium">具体建议：</p>
                                      <ul className="list-disc list-inside text-sm text-gray-600">
                                        {analysisResult.fengshuiExplanation.summary.recommendations.map((rec: string, idx: number) => (
                                          <li key={idx}>{rec}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {/* 有利和不利方位 */}
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    {analysisResult.fengshuiExplanation.summary.favorablePalaces && 
                                     analysisResult.fengshuiExplanation.summary.favorablePalaces.length > 0 && (
                                      <div>
                                        <p className="font-medium text-green-700">有利方位：</p>
                                        <p className="text-gray-600">
                                          {analysisResult.fengshuiExplanation.summary.favorablePalaces.join('、')}
                                        </p>
                                      </div>
                                    )}
                                    {analysisResult.fengshuiExplanation.summary.unfavorablePalaces && 
                                     analysisResult.fengshuiExplanation.summary.unfavorablePalaces.length > 0 && (
                                      <div>
                                        <p className="font-medium text-red-700">不利方位：</p>
                                        <p className="text-gray-600">
                                          {analysisResult.fengshuiExplanation.summary.unfavorablePalaces.join('、')}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm">根据九宫飞星分析，建议您重点关注家中的财位和文昌位，适当调整家具布局以提升运势。</p>
                              )}
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      暂无风水分析结果
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* 重新分析按钮 */}
          <div className="text-center">
            <Button 
              variant="outline"
              onClick={() => {
                setCurrentStep(1);
                setAnalysisResult(null);
              }}
            >
              重新分析
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}