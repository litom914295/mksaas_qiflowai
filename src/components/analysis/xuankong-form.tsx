'use client';

import React, { useState, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Compass, Home, Calendar, MapPin, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface XuankongFormProps {
  onSubmit: (data: XuankongFormData) => void;
  isLoading?: boolean;
  className?: string;
  baziData?: any; // 如果有八字数据，可以传入进行个性化分析
}

export interface XuankongFormData {
  houseType: 'apartment' | 'house' | 'office' | 'shop';
  facing: number; // 坐向度数（0-360）
  facingDirection?: string; // 方位描述
  buildYear: number;
  moveInYear?: number;
  floorNumber?: number;
  unitNumber?: string;
  address?: string;
  city?: string;
}

/**
 * 玄空风水输入表单组件
 * 用于收集房屋风水分析所需信息
 */
export const XuankongForm = memo(function XuankongForm({ 
  onSubmit, 
  isLoading = false,
  className,
  baziData
}: XuankongFormProps) {
  // 表单状态
  const [formData, setFormData] = useState<XuankongFormData>({
    houseType: 'apartment',
    facing: 180, // 默认坐北朝南
    facingDirection: '坐北朝南',
    buildYear: new Date().getFullYear(),
    moveInYear: new Date().getFullYear(),
    floorNumber: 1,
    unitNumber: '',
    address: '',
    city: ''
  });

  // 二十四山向
  const directions = [
    { name: '子', degree: 0, description: '正北' },
    { name: '癸', degree: 15, description: '北偏东' },
    { name: '丑', degree: 30, description: '东北偏北' },
    { name: '艮', degree: 45, description: '东北' },
    { name: '寅', degree: 60, description: '东北偏东' },
    { name: '甲', degree: 75, description: '东偏北' },
    { name: '卯', degree: 90, description: '正东' },
    { name: '乙', degree: 105, description: '东偏南' },
    { name: '辰', degree: 120, description: '东南偏东' },
    { name: '巽', degree: 135, description: '东南' },
    { name: '巳', degree: 150, description: '东南偏南' },
    { name: '丙', degree: 165, description: '南偏东' },
    { name: '午', degree: 180, description: '正南' },
    { name: '丁', degree: 195, description: '南偏西' },
    { name: '未', degree: 210, description: '西南偏南' },
    { name: '坤', degree: 225, description: '西南' },
    { name: '申', degree: 240, description: '西南偏西' },
    { name: '庚', degree: 255, description: '西偏南' },
    { name: '酉', degree: 270, description: '正西' },
    { name: '辛', degree: 285, description: '西偏北' },
    { name: '戌', degree: 300, description: '西北偏西' },
    { name: '乾', degree: 315, description: '西北' },
    { name: '亥', degree: 330, description: '西北偏北' },
    { name: '壬', degree: 345, description: '北偏西' }
  ];

  // 获取方位描述
  const getDirectionDescription = useCallback((degree: number): string => {
    // 标准化度数到0-360范围
    const normalizedDegree = ((degree % 360) + 360) % 360;
    
    // 找到最接近的方位
    let closestDirection = directions[0];
    let minDiff = Math.abs(normalizedDegree - directions[0].degree);
    
    for (const dir of directions) {
      const diff = Math.min(
        Math.abs(normalizedDegree - dir.degree),
        Math.abs(normalizedDegree - (dir.degree + 360)),
        Math.abs(normalizedDegree - (dir.degree - 360))
      );
      
      if (diff < minDiff) {
        minDiff = diff;
        closestDirection = dir;
      }
    }
    
    // 计算坐向（坐山朝向）
    const sittingDegree = (normalizedDegree + 180) % 360;
    let sittingDirection = directions[0];
    minDiff = Math.abs(sittingDegree - directions[0].degree);
    
    for (const dir of directions) {
      const diff = Math.min(
        Math.abs(sittingDegree - dir.degree),
        Math.abs(sittingDegree - (dir.degree + 360)),
        Math.abs(sittingDegree - (dir.degree - 360))
      );
      
      if (diff < minDiff) {
        minDiff = diff;
        sittingDirection = dir;
      }
    }
    
    return `坐${sittingDirection.name}(${sittingDirection.description})朝${closestDirection.name}(${closestDirection.description})`;
  }, []);

  // 处理表单变化
  const handleChange = useCallback((field: keyof XuankongFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // 如果改变了朝向度数，更新方位描述
      if (field === 'facing') {
        newData.facingDirection = getDirectionDescription(value as number);
      }
      
      return newData;
    });
  }, [getDirectionDescription]);

  // 验证表单
  const validateForm = (): boolean => {
    if (!formData.buildYear) {
      toast.error('请填写建造年份');
      return false;
    }

    if (formData.buildYear < 1900 || formData.buildYear > new Date().getFullYear() + 1) {
      toast.error('建造年份不合理');
      return false;
    }

    return true;
  };

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  // 年份选项
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 125 }, (_, i) => currentYear - i);

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="w-5 h-5" />
          玄空风水信息
        </CardTitle>
        <CardDescription>
          请提供房屋的基本信息，以便进行精准的风水分析
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 如果有八字数据，显示个性化提示 */}
        {baziData && (
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              已检测到您的八字信息，将为您提供个性化的风水布局建议
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 房屋类型 */}
          <div className="space-y-2">
            <Label htmlFor="houseType">房屋类型</Label>
            <Select
              value={formData.houseType}
              onValueChange={(value) => handleChange('houseType', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">住宅公寓</SelectItem>
                <SelectItem value="house">独栋别墅</SelectItem>
                <SelectItem value="office">办公室</SelectItem>
                <SelectItem value="shop">商铺店面</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 房屋朝向 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Compass className="w-4 h-4" />
              房屋朝向（大门朝向）
            </Label>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-20">
                  {formData.facing}°
                </span>
                <Slider
                  value={[formData.facing]}
                  onValueChange={([value]) => handleChange('facing', value)}
                  min={0}
                  max={360}
                  step={15}
                  disabled={isLoading}
                  className="flex-1"
                />
              </div>
              <div className="text-sm font-medium text-center p-2 bg-muted rounded">
                {formData.facingDirection}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              拖动滑块选择朝向，或使用罗盘测量精确度数
            </p>
          </div>

          {/* 建造年份 */}
          <div className="space-y-2">
            <Label htmlFor="buildYear" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              建造年份
            </Label>
            <Select
              value={formData.buildYear.toString()}
              onValueChange={(value) => handleChange('buildYear', parseInt(value))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}年
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 入住年份 */}
          <div className="space-y-2">
            <Label htmlFor="moveInYear">入住年份（可选）</Label>
            <Select
              value={formData.moveInYear?.toString() || ''}
              onValueChange={(value) => handleChange('moveInYear', value ? parseInt(value) : undefined)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="请选择入住年份" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}年
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 楼层信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="floorNumber">所在楼层</Label>
              <Input
                id="floorNumber"
                type="number"
                min="1"
                max="100"
                value={formData.floorNumber}
                onChange={(e) => handleChange('floorNumber', parseInt(e.target.value) || 1)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitNumber">单元/门牌号</Label>
              <Input
                id="unitNumber"
                placeholder="如：1单元501"
                value={formData.unitNumber}
                onChange={(e) => handleChange('unitNumber', e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 地址信息 */}
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              详细地址（可选）
            </Label>
            <Input
              id="address"
              placeholder="请输入详细地址"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* 城市 */}
          <div className="space-y-2">
            <Label htmlFor="city">所在城市（可选）</Label>
            <Input
              id="city"
              placeholder="如：北京、上海"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* 提交按钮 */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                分析中...
              </>
            ) : (
              '开始风水分析'
            )}
          </Button>

          {/* 提示信息 */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• 朝向请以大门或主阳台朝向为准</p>
            <p>• 建造年份影响玄空飞星的运势判断</p>
            <p>• 提供详细信息有助于更精准的分析</p>
            {baziData && (
              <p className="text-primary">• 将结合您的八字进行个性化风水分析</p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
});

export default XuankongForm;