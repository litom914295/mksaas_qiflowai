'use client';

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
import { Compass, Home, MapPin } from 'lucide-react';
import { useState } from 'react';

export interface XuankongFormData {
  buildingName?: string;
  address?: string;
  mountainDirection: number; // 坐山方位角度 0-359
  facingDirection: number; // 向山方位角度 0-359
  completionYear: number; // 建筑落成年份
  completionMonth: number; // 建筑落成月份
  floorCount?: number; // 楼层数
  currentYear?: number; // 当前年份（用于流年分析）
}

interface XuankongInputFormProps {
  onSubmit: (data: XuankongFormData) => void;
  className?: string;
}

// 二十四山方位
const TWENTY_FOUR_MOUNTAINS = [
  { name: '壬', angle: 337.5 },
  { name: '子', angle: 352.5 },
  { name: '癸', angle: 7.5 },
  { name: '丑', angle: 22.5 },
  { name: '艮', angle: 37.5 },
  { name: '寅', angle: 52.5 },
  { name: '甲', angle: 67.5 },
  { name: '卯', angle: 82.5 },
  { name: '乙', angle: 97.5 },
  { name: '辰', angle: 112.5 },
  { name: '巽', angle: 127.5 },
  { name: '巳', angle: 142.5 },
  { name: '丙', angle: 157.5 },
  { name: '午', angle: 172.5 },
  { name: '丁', angle: 187.5 },
  { name: '未', angle: 202.5 },
  { name: '坤', angle: 217.5 },
  { name: '申', angle: 232.5 },
  { name: '庚', angle: 247.5 },
  { name: '酉', angle: 262.5 },
  { name: '辛', angle: 277.5 },
  { name: '戌', angle: 292.5 },
  { name: '乾', angle: 307.5 },
  { name: '亥', angle: 322.5 },
];

export function XuankongInputForm({ onSubmit, className }: XuankongInputFormProps) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState<XuankongFormData>({
    mountainDirection: 0,
    facingDirection: 180,
    completionYear: currentYear,
    completionMonth: 1,
    currentYear: currentYear,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证
    const newErrors: Record<string, string> = {};
    
    if (formData.completionYear < 1900 || formData.completionYear > currentYear) {
      newErrors.completionYear = '请输入有效的年份';
    }
    
    if (formData.completionMonth < 1 || formData.completionMonth > 12) {
      newErrors.completionMonth = '请输入有效的月份 (1-12)';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };

  // 根据坐山自动计算向山（相差180度）
  const handleMountainChange = (value: string) => {
    const angle = parseFloat(value);
    const facing = (angle + 180) % 360;
    setFormData({
      ...formData,
      mountainDirection: angle,
      facingDirection: facing,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-6">
        {/* 基本信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Home className="w-5 h-5" />
            建筑基本信息
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buildingName" className="dark:text-gray-200">
                建筑名称 <span className="text-gray-500 dark:text-gray-400">(可选)</span>
              </Label>
              <Input
                id="buildingName"
                type="text"
                placeholder="例如：阳光花园"
                value={formData.buildingName || ''}
                onChange={(e) => setFormData({ ...formData, buildingName: e.target.value })}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>
            
            <div>
              <Label htmlFor="address" className="dark:text-gray-200">
                地址 <span className="text-gray-500 dark:text-gray-400">(可选)</span>
              </Label>
              <Input
                id="address"
                type="text"
                placeholder="例如：北京市朝阳区"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* 方位信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Compass className="w-5 h-5" />
            坐向方位
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mountainDirection" className="dark:text-gray-200">
                坐山方位 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.mountainDirection.toString()}
                onValueChange={handleMountainChange}
              >
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                  <SelectValue placeholder="选择坐山方位" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  {TWENTY_FOUR_MOUNTAINS.map((mountain) => (
                    <SelectItem 
                      key={mountain.angle} 
                      value={mountain.angle.toString()}
                      className="dark:text-gray-100 dark:focus:bg-gray-700"
                    >
                      {mountain.name} ({mountain.angle}°)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                建筑背靠的方向
              </p>
            </div>
            
            <div>
              <Label htmlFor="facingDirection" className="dark:text-gray-200">
                向山方位 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="facingDirection"
                type="number"
                value={formData.facingDirection}
                readOnly
                className="bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                建筑正面朝向（自动计算）
              </p>
            </div>
          </div>
        </div>

        {/* 时间信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            时间信息
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="completionYear" className="dark:text-gray-200">
                落成年份 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="completionYear"
                type="number"
                min="1900"
                max={currentYear}
                value={formData.completionYear}
                onChange={(e) => setFormData({ ...formData, completionYear: parseInt(e.target.value) })}
                className={`dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 ${
                  errors.completionYear ? 'border-red-500' : ''
                }`}
              />
              {errors.completionYear && (
                <p className="text-xs text-red-500 mt-1">{errors.completionYear}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="completionMonth" className="dark:text-gray-200">
                落成月份 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.completionMonth.toString()}
                onValueChange={(value) => setFormData({ ...formData, completionMonth: parseInt(value) })}
              >
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem 
                      key={month} 
                      value={month.toString()}
                      className="dark:text-gray-100 dark:focus:bg-gray-700"
                    >
                      {month}月
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="currentYear" className="dark:text-gray-200">
                分析年份 <span className="text-gray-500 dark:text-gray-400">(可选)</span>
              </Label>
              <Input
                id="currentYear"
                type="number"
                min={formData.completionYear}
                max={currentYear + 10}
                value={formData.currentYear}
                onChange={(e) => setFormData({ ...formData, currentYear: parseInt(e.target.value) })}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                用于流年分析
              </p>
            </div>
          </div>
        </div>

        {/* 其他信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            其他信息
          </h3>
          
          <div>
            <Label htmlFor="floorCount" className="dark:text-gray-200">
              楼层数 <span className="text-gray-500 dark:text-gray-400">(可选)</span>
            </Label>
            <Input
              id="floorCount"
              type="number"
              min="1"
              max="200"
              placeholder="例如：30"
              value={formData.floorCount || ''}
              onChange={(e) => setFormData({ ...formData, floorCount: parseInt(e.target.value) || undefined })}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            type="submit" 
            size="lg" 
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 dark:from-purple-500 dark:to-blue-500"
          >
            开始玄空飞星分析
          </Button>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
            分析基于传统玄空飞星理论，结合现代算法计算
          </p>
        </div>
      </div>
    </form>
  );
}
