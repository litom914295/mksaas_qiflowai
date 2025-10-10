'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, MapPin } from 'lucide-react';
import { useState } from 'react';

interface CityLocationPickerProps {
  onLocationSelected: (city: string) => void;
}

/**
 * 城市定位选择器组件
 * 用于获取用户当前位置并确认是否为出生地
 */
export function CityLocationPicker({
  onLocationSelected,
}: CityLocationPickerProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [detectedCity, setDetectedCity] = useState('');

  // 获取当前位置
  const handleLocate = async () => {
    setIsLocating(true);

    try {
      // 获取地理位置
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('浏览器不支持定位功能'));
            return;
          }
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true,
          });
        }
      );

      const { latitude, longitude } = position.coords;

      // 使用高德地图逆地理编码API（免费）
      // 注意：生产环境需要申请API key
      const response = await fetch(
        `https://restapi.amap.com/v3/geocode/regeo?location=${longitude},${latitude}&key=YOUR_AMAP_KEY`
      );

      if (!response.ok) {
        throw new Error('定位失败，请手动输入');
      }

      const data = await response.json();
      if (data.status === '1' && data.regeocode) {
        const city =
          data.regeocode.addressComponent.city ||
          data.regeocode.addressComponent.province ||
          '未知城市';

        setDetectedCity(city);
        setShowConfirmDialog(true);
      } else {
        throw new Error('无法解析位置信息');
      }
    } catch (error) {
      console.error('定位失败:', error);
      alert('定位失败，请检查浏览器权限或手动输入城市');
    } finally {
      setIsLocating(false);
    }
  };

  // 确认使用检测到的城市
  const handleConfirm = () => {
    onLocationSelected(detectedCity);
    setShowConfirmDialog(false);
  };

  // 拒绝，用户需要手动输入
  const handleReject = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleLocate}
        disabled={isLocating}
        className="whitespace-nowrap"
        title="定位当前城市"
      >
        {isLocating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            定位中...
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4 mr-2" />
            定位
          </>
        )}
      </Button>

      {/* 确认对话框 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认出生地</DialogTitle>
            <DialogDescription>
              检测到您当前在{' '}
              <strong className="text-lg text-blue-600">{detectedCity}</strong>
              ， 这是您的出生地吗？
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              💡 提示：出生地用于真太阳时校准，影响命盘精准度约±1小时
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleReject}>
              不是，手动输入
            </Button>
            <Button onClick={handleConfirm}>是的，填入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
