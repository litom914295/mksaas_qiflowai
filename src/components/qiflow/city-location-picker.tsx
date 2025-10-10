'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface CityLocationPickerProps {
  /** 当前值 */
  value: string;
  /** 值变化回调 */
  onChange: (city: string) => void;
}

// 中国主要城市列表（示例数据）
const MAJOR_CITIES = [
  '北京',
  '上海',
  '广州',
  '深圳',
  '成都',
  '杭州',
  '重庆',
  '武汉',
  '西安',
  '天津',
  '南京',
  '苏州',
  '郑州',
  '长沙',
  '东莞',
  '沈阳',
  '青岛',
  '合肥',
  '佛山',
  '厦门',
  '福州',
  '济南',
  '哈尔滨',
  '昆明',
  '大连',
  '长春',
  '太原',
  '南昌',
  '贵阳',
  '南宁',
  '石家庄',
  '兰州',
];

/**
 * 城市定位选择组件
 * 支持手动输入、热门城市快选和地理定位
 */
export function CityLocationPicker({
  value,
  onChange,
}: CityLocationPickerProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // 过滤城市建议
  useEffect(() => {
    if (value && value.length > 0) {
      const filtered = MAJOR_CITIES.filter((city) =>
        city.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCities(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredCities([]);
      setShowSuggestions(false);
    }
  }, [value]);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // 选择城市
  const handleSelectCity = (city: string) => {
    onChange(city);
    setShowSuggestions(false);
  };

  // 使用地理定位
  const handleGeoLocation = () => {
    if (!navigator.geolocation) {
      alert('您的浏览器不支持地理定位');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // 这里应该调用真实的地理编码API
          // 示例：使用高德地图或百度地图API
          // const response = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`);
          // const data = await response.json();
          // onChange(data.city);

          // 模拟API调用
          setTimeout(() => {
            // 根据实际情况，这里应该返回真实的城市名
            onChange('北京'); // 示例值
            setIsLocating(false);
          }, 1000);
        } catch (error) {
          console.error('地理定位失败:', error);
          alert('定位失败，请手动选择城市');
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('地理定位错误:', error);
        alert('定位失败，请手动选择城市');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // 点击外部关闭建议
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative mt-1" ref={inputRef}>
      {/* 输入框 */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="输入城市名称"
            value={value}
            onChange={handleInputChange}
            onFocus={() => value && setShowSuggestions(true)}
            className="pl-10"
          />
        </div>

        {/* 定位按钮 */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGeoLocation}
          disabled={isLocating}
          className="whitespace-nowrap"
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
      </div>

      {/* 城市建议列表 */}
      {showSuggestions && filteredCities.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-gray-500 px-2 py-1">建议城市</div>
            {filteredCities.slice(0, 10).map((city) => (
              <button
                key={city}
                onClick={() => handleSelectCity(city)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-2"
              >
                <MapPin className="w-3 h-3 text-gray-400" />
                <span>{city}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 热门城市快选 */}
      {!value && !showSuggestions && (
        <div className="mt-3">
          <div className="text-xs text-gray-600 mb-2">热门城市：</div>
          <div className="flex flex-wrap gap-2">
            {MAJOR_CITIES.slice(0, 8).map((city) => (
              <Badge
                key={city}
                variant="outline"
                className="cursor-pointer hover:bg-purple-50 hover:border-purple-400 transition-colors"
                onClick={() => handleSelectCity(city)}
              >
                {city}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
