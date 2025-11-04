'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Compass,
  Home,
  MapPin,
  RotateCcw,
  Sparkles,
  TestTube,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CompassFormData {
  address: string;
  direction: string;
  houseType: string;
}

const STORAGE_KEY = 'compass_form_data';

const TEST_DATA: CompassFormData = {
  address: '北京市朝阳区建国路88号',
  direction: '270',
  houseType: '住宅',
};

export default function CompassAnalysisPage() {
  const [formData, setFormData] = useState<CompassFormData>({
    address: '',
    direction: '',
    houseType: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleChange = (field: keyof CompassFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fillTestData = () => {
    setFormData(TEST_DATA);
    toast.success('已填充测试数据');
  };

  const restoreLastData = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setFormData(data);
        toast.success('已恢复上次数据');
      } catch (e) {
        toast.error('恢复数据失败');
      }
    } else {
      toast.info('暂无保存的数据');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.address || !formData.direction || !formData.houseType) {
      toast.error('请填写所有必填项');
      return;
    }

    setIsSubmitting(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));

    try {
      const response = await fetch('/api/qiflow/xuankong', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: formData.address,
          direction: Number.parseInt(formData.direction),
          houseType: formData.houseType,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data.data);
        toast.success(
          `分析完成！置信度: ${(data.confidence * 100).toFixed(0)}%`
        );
      } else {
        toast.error(data.error || '分析失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      toast.error('提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-sky-950 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-600 mb-4">
            <Compass className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            玄空风水罗盘分析
          </h1>
          <p className="text-slate-300">精准测定方位，解读风水玄机</p>
        </div>

        {/* Form Card */}
        <Card className="bg-slate-900/80 border-slate-700 backdrop-blur-sm shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white text-2xl">填写房屋信息</CardTitle>
            <CardDescription className="text-slate-400">
              请准确填写房屋地址和朝向信息，我们将为您生成专业的风水分析报告
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Address */}
              <div className="space-y-2">
                <Label
                  htmlFor="address"
                  className="text-slate-200 flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  房屋地址
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="请输入详细地址"
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                  required
                />
              </div>

              {/* Direction */}
              <div className="space-y-2">
                <Label
                  htmlFor="direction"
                  className="text-slate-200 flex items-center gap-2"
                >
                  <Compass className="w-4 h-4" />
                  房屋朝向（度数）
                </Label>
                <Input
                  id="direction"
                  type="number"
                  min="0"
                  max="360"
                  value={formData.direction}
                  onChange={(e) => handleChange('direction', e.target.value)}
                  placeholder="输入0-360度（如：270表示正西）"
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                  required
                />
                <p className="text-xs text-slate-500">
                  提示：0度=正北，90度=正东，180度=正南，270度=正西
                </p>
              </div>

              {/* House Type */}
              <div className="space-y-2">
                <Label
                  htmlFor="houseType"
                  className="text-slate-200 flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  房屋类型
                </Label>
                <Input
                  id="houseType"
                  value={formData.houseType}
                  onChange={(e) => handleChange('houseType', e.target.value)}
                  placeholder="如：住宅、办公室、商铺等"
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-semibold"
                >
                  {isSubmitting ? '分析中...' : '开始分析'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={restoreLastData}
                  className="bg-slate-800/50 border-slate-600 text-slate-200 hover:bg-slate-700"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  恢复上次
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={fillTestData}
                  className="bg-slate-800/50 border-slate-600 text-slate-200 hover:bg-slate-700"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  测试数据
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Result Display */}
        {result && (
          <Card className="mt-6 bg-slate-900/80 border-slate-700 backdrop-blur-sm shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                风水分析结果
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">地址</p>
                  <p className="text-white text-base font-semibold">
                    {result.address}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">朝向</p>
                  <p className="text-white text-lg font-semibold">
                    {result.direction}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">房屋类型</p>
                  <p className="text-white text-lg font-semibold">
                    {result.houseType}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">元运</p>
                  <p className="text-white text-lg font-semibold">
                    第 {result.period} 运
                  </p>
                </div>
              </div>

              {/* Geju Analysis */}
              {result.geju && (
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <h3 className="text-white font-semibold text-lg mb-3">
                    格局分析
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          result.geju.isFavorable
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-orange-500/20 text-orange-400'
                        }`}
                      >
                        {result.geju.isFavorable ? '吉利格局' : '普通格局'}
                      </span>
                      <span className="text-slate-300">{result.geju.name}</span>
                    </div>
                    <p className="text-slate-400 text-sm mt-2">
                      {result.geju.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Special Positions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.wenchangwei && (
                  <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-4 rounded-lg border border-purple-700/30">
                    <h4 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
                      📚 文昌位
                    </h4>
                    <p className="text-white text-xl font-bold">
                      {result.wenchangwei}
                    </p>
                    <p className="text-purple-200 text-sm mt-1">
                      适合学习、工作、考试
                    </p>
                  </div>
                )}
                {result.caiwei && (
                  <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 p-4 rounded-lg border border-amber-700/30">
                    <h4 className="text-amber-300 font-semibold mb-2 flex items-center gap-2">
                      💰 财位
                    </h4>
                    <p className="text-white text-xl font-bold">
                      {result.caiwei}
                    </p>
                    <p className="text-amber-200 text-sm mt-1">
                      适合放置保险柜、财神
                    </p>
                  </div>
                )}
              </div>

              {/* Evaluation Details */}
              {result.evaluation && (
                <div className="space-y-3">
                  <h3 className="text-white font-semibold text-lg">
                    各宫位评估
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(result.evaluation).map(
                      ([palace, data]: [string, any]) => (
                        <div
                          key={palace}
                          className="bg-slate-800/50 p-3 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300 font-medium">
                              {palace}宫
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                data.rating === '大吉'
                                  ? 'bg-green-500/20 text-green-400'
                                  : data.rating === '吉'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : data.rating === '凶'
                                      ? 'bg-orange-500/20 text-orange-400'
                                      : data.rating === '大凶'
                                        ? 'bg-red-500/20 text-red-400'
                                        : 'bg-slate-500/20 text-slate-400'
                              }`}
                            >
                              {data.rating}
                            </span>
                          </div>
                          {data.interpretation && (
                            <p className="text-slate-400 text-sm mt-2">
                              {data.interpretation}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Meta Info */}
              {result.meta?.rulesApplied &&
                result.meta.rulesApplied.length > 0 && (
                  <div className="bg-slate-800/30 p-3 rounded-lg">
                    <p className="text-slate-400 text-sm">
                      应用规则: {result.meta.rulesApplied.join(', ')}
                    </p>
                    {result.meta.ambiguous && (
                      <p className="text-orange-400 text-sm mt-1">
                        ⚠️ 存在边界情况，建议进一步确认朝向
                      </p>
                    )}
                  </div>
                )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
