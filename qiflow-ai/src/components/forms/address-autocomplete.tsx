'use client';

import { MapPin, Search, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface AddressAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  onPick?: (value: {
    address: string;
    latitude?: number;
    longitude?: number;
  }) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

interface Suggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

// 高德地图地址搜索服务
class AMapService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_AMAP_API_KEY || '';
  }

  async searchPlaces(query: string): Promise<Suggestion[]> {
    if (!query.trim() || !this.apiKey) {
      return [];
    }

    try {
      const response = await fetch(
        `https://restapi.amap.com/v3/place/text?key=${this.apiKey}&keywords=${encodeURIComponent(query)}&offset=10&extensions=all`
      );

      if (!response.ok) {
        throw new Error('AMap API request failed');
      }

      const data = await response.json();

      if (data.status !== '1' || !data.pois) {
        return [];
      }

      return data.pois.map((poi: any) => ({
        place_id: poi.id,
        display_name: poi.name,
        lat: poi.location?.split(',')[1] || '',
        lon: poi.location?.split(',')[0] || '',
        type: this.getPlaceType(poi.type),
        importance: this.calculateImportance(poi),
      }));
    } catch (error) {
      console.error('Address search failed:', error);
      return [];
    }
  }

  private getPlaceType(type: string): string {
    if (type.includes('住宅') || type.includes('小区')) return 'residential';
    if (
      type.includes('商业') ||
      type.includes('商场') ||
      type.includes('写字楼')
    )
      return 'commercial';
    if (type.includes('医院') || type.includes('学校')) return 'public';
    return 'other';
  }

  private calculateImportance(poi: any): number {
    // 基于距离、评分等计算重要性
    let importance = 0.5;

    if (poi.photos && poi.photos.length > 0) importance += 0.1;
    if (poi.tag) importance += 0.1;
    if (poi.website) importance += 0.1;

    return Math.min(importance, 1.0);
  }
}

const amapService = new AMapService();

export function AddressAutocomplete({
  value = '',
  onChange,
  onPick,
  placeholder = '输入地址，支持联想搜索',
  className = '',
  disabled = false,
  required = false,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 更新输入值
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // 搜索地址建议
  const searchAddresses = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      // 使用高德地图API搜索地址
      const results = await amapService.searchPlaces(query);

      // 如果API不可用或无结果，返回一些常用地址提示
      if (results.length === 0) {
        setSuggestions([
          {
            place_id: 'fallback-1',
            display_name: '北京市朝阳区',
            lat: '39.9042',
            lon: '116.4074',
            type: 'administrative',
            importance: 0.8,
          },
          {
            place_id: 'fallback-2',
            display_name: '上海市浦东新区',
            lat: '31.2304',
            lon: '121.4737',
            type: 'administrative',
            importance: 0.7,
          },
          {
            place_id: 'fallback-3',
            display_name: '广州市天河区',
            lat: '23.1291',
            lon: '113.2644',
            type: 'administrative',
            importance: 0.6,
          },
        ]);
      } else {
        setSuggestions(results);
      }

      setShowSuggestions(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Address search failed:', error);

      // 降级到一些常用地址
      setSuggestions([
        {
          place_id: 'fallback-1',
          display_name: '北京市朝阳区',
          lat: '39.9042',
          lon: '116.4074',
          type: 'administrative',
          importance: 0.8,
        },
        {
          place_id: 'fallback-2',
          display_name: '上海市浦东新区',
          lat: '31.2304',
          lon: '121.4737',
          type: 'administrative',
          importance: 0.7,
        },
        {
          place_id: 'fallback-3',
          display_name: '广州市天河区',
          lat: '23.1291',
          lon: '113.2644',
          type: 'administrative',
          importance: 0.6,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);

    // 触发搜索
    if (newValue.trim()) {
      searchAddresses(newValue);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // 处理键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // 选择建议
  const handleSuggestionSelect = (suggestion: Suggestion) => {
    const newValue = suggestion.display_name;
    setInputValue(newValue);
    onChange?.(newValue);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    // 触发onPick回调
    if (onPick) {
      onPick({
        address: newValue,
        latitude: parseFloat(suggestion.lat),
        longitude: parseFloat(suggestion.lon),
      });
    }
  };

  // 清除输入
  const handleClear = () => {
    setInputValue('');
    onChange?.('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // 点击外部关闭建议
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 滚动到选中的建议
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div className={`relative ${className}`}>
      {/* 输入框 */}
      <div className='relative'>
        <input
          ref={inputRef}
          type='text'
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            ${required && !inputValue ? 'border-red-300' : ''}
          `}
        />

        {/* 搜索图标 */}
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />

        {/* 清除按钮 */}
        {inputValue && !disabled && (
          <button
            type='button'
            onClick={handleClear}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600'
          >
            <X className='w-4 h-4' />
          </button>
        )}

        {/* 加载指示器 */}
        {isLoading && (
          <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
            <div className='w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
          </div>
        )}
      </div>

      {/* 建议列表 */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className='absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto'
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id}
              onClick={() => handleSuggestionSelect(suggestion)}
              className={`
                w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0
                ${index === selectedIndex ? 'bg-blue-50' : ''}
              `}
            >
              <div className='flex items-start gap-3'>
                <MapPin className='w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0' />
                <div className='flex-1 min-w-0'>
                  <div className='text-sm text-gray-900 truncate'>
                    {suggestion.display_name}
                  </div>
                  <div className='text-xs text-gray-500 mt-1'>
                    {suggestion.type === 'house' && '住宅地址'}
                    {suggestion.type === 'commercial' && '商业地址'}
                    {suggestion.type === 'residential' && '居民区'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 无结果提示 */}
      {showSuggestions &&
        !isLoading &&
        suggestions.length === 0 &&
        inputValue.trim() && (
          <div className='absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4'>
            <div className='text-sm text-gray-500 text-center'>
              未找到匹配的地址，请尝试其他关键词
            </div>
          </div>
        )}

      {/* 帮助提示 */}
      {!inputValue && !disabled && (
        <div className='mt-2 text-xs text-gray-500'>
          <div>支持输入省市区县、街道、小区名称等</div>
          {!process.env.NEXT_PUBLIC_AMAP_API_KEY && (
            <div className='mt-1 text-orange-600'>
              💡 配置高德地图API密钥可获得更精准的地址搜索
            </div>
          )}
        </div>
      )}
    </div>
  );
}
