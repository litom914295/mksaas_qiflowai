'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { validateBaziInput, type BaziInput } from '@/app/api/bazi/schema';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, User, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface BaziStepperProps {
  onSubmit: (data: BaziInput) => Promise<void>;
  initialData?: Partial<BaziInput>;
  className?: string;
}

const steps = [
  { id: 'basic', title: '基本信息', icon: User, description: '姓名与性别' },
  { id: 'birth', title: '出生日期', icon: Calendar, description: '公历出生日期' },
  { id: 'time', title: '出生时间', icon: Clock, description: '精确到小时' },
  { id: 'location', title: '出生地点', icon: MapPin, description: '用于真太阳时' },
  { id: 'confirm', title: '确认信息', icon: CheckCircle2, description: '检查并提交' },
];

// 中国主要城市列表（包含经纬度）
const cities = [
  { name: '北京', value: 'beijing', lat: 39.9042, lon: 116.4074 },
  { name: '上海', value: 'shanghai', lat: 31.2304, lon: 121.4737 },
  { name: '广州', value: 'guangzhou', lat: 23.1291, lon: 113.2644 },
  { name: '深圳', value: 'shenzhen', lat: 22.5431, lon: 114.0579 },
  { name: '成都', value: 'chengdu', lat: 30.5728, lon: 104.0668 },
  { name: '杭州', value: 'hangzhou', lat: 30.2741, lon: 120.1551 },
  { name: '武汉', value: 'wuhan', lat: 30.5928, lon: 114.3055 },
  { name: '西安', value: 'xian', lat: 34.3416, lon: 108.9398 },
  { name: '重庆', value: 'chongqing', lat: 29.5630, lon: 106.5516 },
  { name: '南京', value: 'nanjing', lat: 32.0603, lon: 118.7969 },
];

export function BaziStepper({ onSubmit, initialData = {}, className }: BaziStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<Partial<BaziInput>>({
    name: initialData.name || '',
    gender: initialData.gender || 'male',
    birthDate: initialData.birthDate || '',
    birthTime: initialData.birthTime || '',
    timezone: initialData.timezone || 'Asia/Shanghai',
    longitude: initialData.longitude || 116.4074,
    latitude: initialData.latitude || 39.9042,
    calendar: 'solar',
    ...initialData,
  });

  const handleNext = () => {
    // 验证当前步骤
    const stepErrors: Record<string, string> = {};
    
    switch (steps[currentStep].id) {
      case 'basic':
        if (!formData.name) stepErrors.name = '请输入姓名';
        if (!formData.gender) stepErrors.gender = '请选择性别';
        break;
      case 'birth':
        if (!formData.birthDate) stepErrors.birthDate = '请选择出生日期';
        break;
      case 'time':
        if (!formData.birthTime) stepErrors.birthTime = '请选择出生时间';
        break;
      case 'location':
        if (!formData.longitude || !formData.latitude) {
          stepErrors.location = '请选择出生地点';
        }
        break;
    }
    
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    
    setErrors({});
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLocationSelect = (cityValue: string) => {
    const city = cities.find(c => c.value === cityValue);
    if (city) {
      setFormData(prev => ({
        ...prev,
        longitude: city.lon,
        latitude: city.lat,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // 验证所有数据
      const validatedData = validateBaziInput(formData);
      await onSubmit(validatedData);
      
    } catch (error) {
      console.error('提交失败:', error);
      setErrors({ submit: '提交失败，请检查信息后重试' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'basic':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                placeholder="请输入您的姓名"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>
            
            <div>
              <Label>性别</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value as 'male' | 'female' }))}
              >
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">男</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">女</Label>
                  </div>
                </div>
              </RadioGroup>
              {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender}</p>}
            </div>
          </div>
        );
        
      case 'birth':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="birthDate">出生日期（公历）</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                className={errors.birthDate ? 'border-red-500' : ''}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.birthDate && <p className="mt-1 text-sm text-red-500">{errors.birthDate}</p>}
            </div>
            
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 请输入公历（阳历）出生日期。系统会自动进行农历转换和节气校正。
              </p>
            </div>
          </div>
        );
        
      case 'time':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="birthTime">出生时间</Label>
              <Input
                id="birthTime"
                type="time"
                value={formData.birthTime}
                onChange={(e) => setFormData(prev => ({ ...prev, birthTime: e.target.value }))}
                className={errors.birthTime ? 'border-red-500' : ''}
              />
              {errors.birthTime && <p className="mt-1 text-sm text-red-500">{errors.birthTime}</p>}
            </div>
            
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                ⏰ 出生时间精确到小时即可。如不确定具体时间，可选择大概的时辰。
              </p>
            </div>
            
            {/* 时辰对照表 */}
            <div className="text-xs text-muted-foreground">
              <p className="mb-2 font-medium">时辰对照：</p>
              <div className="grid grid-cols-2 gap-1">
                <span>子时 23:00-01:00</span>
                <span>午时 11:00-13:00</span>
                <span>丑时 01:00-03:00</span>
                <span>未时 13:00-15:00</span>
                <span>寅时 03:00-05:00</span>
                <span>申时 15:00-17:00</span>
                <span>卯时 05:00-07:00</span>
                <span>酉时 17:00-19:00</span>
                <span>辰时 07:00-09:00</span>
                <span>戌时 19:00-21:00</span>
                <span>巳时 09:00-11:00</span>
                <span>亥时 21:00-23:00</span>
              </div>
            </div>
          </div>
        );
        
      case 'location':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="city">出生城市</Label>
              <Select onValueChange={handleLocationSelect}>
                <SelectTrigger id="city">
                  <SelectValue placeholder="选择出生城市" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city.value} value={city.value}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
            </div>
            
            <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-3">
              <p className="text-sm text-green-700 dark:text-green-300">
                🌏 出生地点用于计算真太阳时，提高八字精确度。
              </p>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p>经度: {formData.longitude?.toFixed(4)}°</p>
              <p>纬度: {formData.latitude?.toFixed(4)}°</p>
            </div>
          </div>
        );
        
      case 'confirm':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">请确认您的信息</h3>
            
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">姓名：</span>
                <span className="font-medium">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">性别：</span>
                <span className="font-medium">{formData.gender === 'male' ? '男' : '女'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">出生日期：</span>
                <span className="font-medium">
                  {formData.birthDate && format(new Date(formData.birthDate), 'yyyy年M月d日', { locale: zhCN })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">出生时间：</span>
                <span className="font-medium">{formData.birthTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">出生地点：</span>
                <span className="font-medium">
                  {cities.find(c => c.lon === formData.longitude && c.lat === formData.latitude)?.name || '自定义位置'}
                </span>
              </div>
            </div>
            
            <div className="rounded-lg bg-purple-50 dark:bg-purple-950/20 p-3">
              <p className="text-sm text-purple-700 dark:text-purple-300">
                🎯 系统将基于您的信息进行专业八字计算，包含四柱排盘、五行分析、十神解读等。
              </p>
            </div>
            
            {errors.submit && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3">
                <p className="text-sm text-red-700 dark:text-red-300">{errors.submit}</p>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Card className={cn('w-full max-w-2xl', className)}>
      <CardHeader>
        {/* 步骤指示器 */}
        <div className="mb-6">
          <div className="flex justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className="flex items-center">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                        isActive
                          ? 'border-primary bg-primary text-primary-foreground'
                          : isCompleted
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-muted-foreground/30 text-muted-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          'ml-2 h-1 w-12 transition-colors sm:w-20',
                          isCompleted ? 'bg-primary' : 'bg-muted'
                        )}
                      />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={cn(
                      'text-xs font-medium',
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {step.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <CardTitle>{steps[currentStep].title}</CardTitle>
        <CardDescription>{steps[currentStep].description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="min-h-[300px]">
          {renderStepContent()}
        </div>
        
        {/* 导航按钮 */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            上一步
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext}>
              下一步
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-amber-500 to-sky-500 text-black hover:opacity-90"
            >
              {isSubmitting ? '计算中...' : '开始计算'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}