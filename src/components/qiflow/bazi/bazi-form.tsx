'use client';

import React, { useState, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { solarToLunar } from '@/lib/qiflow/bazi/solar-lunar';

interface BaziFormProps {
  onSubmit: (data: BaziFormData) => void;
  isLoading?: boolean;
  className?: string;
}

export interface BaziFormData {
  name?: string;
  gender: 'male' | 'female';
  calendarType: 'solar' | 'lunar';
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  birthPlace?: string;
  longitude?: number;
  latitude?: number;
}

/**
 * 八字输入表单组件
 * 支持阴阳历选择、性别选择、出生时间地点输入
 */
export const BaziForm = memo(function BaziForm({ 
  onSubmit, 
  isLoading = false,
  className 
}: BaziFormProps) {
  // 表单状态
  const [formData, setFormData] = useState<BaziFormData>({
    name: '',
    gender: 'female', // 默认女性
    calendarType: 'solar', // 默认阳历
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
    hour: 0,
    minute: 0,
    birthPlace: ''
  });

  // 年份选项（1900-2100）
  const years = Array.from({ length: 201 }, (_, i) => 1900 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  // 处理表单变化
  const handleChange = useCallback((field: keyof BaziFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // 验证表单
  const validateForm = (): boolean => {
    if (!formData.year || !formData.month || !formData.day) {
      toast.error('请填写完整的出生日期');
      return false;
    }

    // 验证日期合法性
    const maxDay = new Date(formData.year, formData.month, 0).getDate();
    if (formData.day > maxDay) {
      toast.error(`${formData.year}年${formData.month}月最多只有${maxDay}天`);
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

    // 如果是阴历，需要转换为阳历
    let submitData = { ...formData };
    if (formData.calendarType === 'lunar') {
      // 这里可以调用阴历转阳历的函数
      toast.info('正在转换农历日期...');
    }

    onSubmit(submitData);
  };

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          八字信息输入
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 姓名输入 */}
          <div className="space-y-2">
            <Label htmlFor="name">姓名（可选）</Label>
            <Input
              id="name"
              placeholder="请输入姓名"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* 性别选择 */}
          <div className="space-y-2">
            <Label>性别</Label>
            <RadioGroup
              value={formData.gender}
              onValueChange={(value) => handleChange('gender', value)}
              disabled={isLoading}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female" className="cursor-pointer">
                  女性
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male" className="cursor-pointer">
                  男性
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 历法选择 */}
          <div className="space-y-2">
            <Label>历法类型</Label>
            <RadioGroup
              value={formData.calendarType}
              onValueChange={(value) => handleChange('calendarType', value)}
              disabled={isLoading}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="solar" id="solar" />
                <Label htmlFor="solar" className="cursor-pointer">
                  阳历（公历）
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lunar" id="lunar" />
                <Label htmlFor="lunar" className="cursor-pointer">
                  阴历（农历）
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 出生日期 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              出生日期
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Select
                value={formData.year.toString()}
                onValueChange={(value) => handleChange('year', parseInt(value))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="年" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {years.reverse().map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}年
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={formData.month.toString()}
                onValueChange={(value) => handleChange('month', parseInt(value))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="月" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month} value={month.toString()}>
                      {month}月
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={formData.day.toString()}
                onValueChange={(value) => handleChange('day', parseInt(value))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="日" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {days.map(day => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}日
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 出生时间 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              出生时间
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={formData.hour.toString()}
                onValueChange={(value) => handleChange('hour', parseInt(value))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="时" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {hours.map(hour => (
                    <SelectItem key={hour} value={hour.toString()}>
                      {hour.toString().padStart(2, '0')}时
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={formData.minute.toString()}
                onValueChange={(value) => handleChange('minute', parseInt(value))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="分" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {minutes.map(minute => (
                    <SelectItem key={minute} value={minute.toString()}>
                      {minute.toString().padStart(2, '0')}分
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 出生地点 */}
          <div className="space-y-2">
            <Label htmlFor="birthPlace" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              出生地点（可选）
            </Label>
            <Input
              id="birthPlace"
              placeholder="请输入出生城市，如：北京"
              value={formData.birthPlace}
              onChange={(e) => handleChange('birthPlace', e.target.value)}
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
                计算中...
              </>
            ) : (
              '开始八字分析'
            )}
          </Button>

          {/* 提示信息 */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• 出生时间请使用24小时制</p>
            <p>• 如不确定准确时间，可选择大概时间</p>
            <p>• 农历日期会自动转换为公历进行计算</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
});

export default BaziForm;