'use client';

import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  use12Hour?: boolean; // 是否使用12小时制
}

export function TimePicker({
  value = '',
  onChange,
  placeholder = '选择时间',
  className = '',
  disabled = false,
  use12Hour = false,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number>(12);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [isAM, setIsAM] = useState<boolean>(true);

  // 解析时间字符串
  useEffect(() => {
    if (value) {
      const [time, period] = value.split(' ');
      const [hourStr, minuteStr] = time.split(':');
      let hour = parseInt(hourStr, 10);

      if (use12Hour && period) {
        setIsAM(period === 'AM');
        if (period === 'PM' && hour !== 12) {
          hour -= 12;
        } else if (period === 'AM' && hour === 12) {
          hour = 0;
        }
      }

      setSelectedHour(hour);
      setSelectedMinute(parseInt(minuteStr, 10));
    }
  }, [value, use12Hour]);

  // 格式化时间显示
  const formatTime = (): string => {
    if (!value) return '';

    let hour = selectedHour;
    let period = '';

    if (use12Hour) {
      if (hour === 0) {
        hour = 12;
        period = 'AM';
      } else if (hour < 12) {
        period = 'AM';
      } else if (hour === 12) {
        period = 'PM';
      } else {
        hour -= 12;
        period = 'PM';
      }
      return `${hour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')} ${period}`;
    } else {
      return `${hour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    }
  };

  // 更新时间
  const updateTime = (hour: number, minute: number, am?: boolean) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    if (am !== undefined) {
      setIsAM(am);
    }

    let formattedHour = hour;
    if (use12Hour) {
      if (am === false && hour !== 12) {
        formattedHour = hour + 12;
      } else if (am === true && hour === 12) {
        formattedHour = 0;
      }
    }

    const timeString = use12Hour
      ? `${formattedHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${am ? 'AM' : 'PM'}`
      : `${formattedHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    onChange?.(timeString);
  };

  // 生成小时选项
  const generateHourOptions = () => {
    const hours = [];
    const maxHour = use12Hour ? 12 : 23;

    for (let i = use12Hour ? 1 : 0; i <= maxHour; i++) {
      hours.push(i);
    }

    return hours;
  };

  // 生成分钟选项
  const generateMinuteOptions = () => {
    const minutes = [];
    for (let i = 0; i < 60; i += 5) {
      minutes.push(i);
    }
    return minutes;
  };

  return (
    <div className={`relative ${className}`}>
      {/* 输入框 */}
      <div className='relative'>
        <input
          type='text'
          value={formatTime()}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer bg-white'}
          `}
        />
        <Clock className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
      </div>

      {/* 时间选择弹窗 */}
      {isOpen && (
        <div className='absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[240px]'>
          {/* 小时选择 */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              小时
            </label>
            <div className='grid grid-cols-4 gap-2 max-h-32 overflow-y-auto'>
              {generateHourOptions().map(hour => (
                <button
                  key={hour}
                  onClick={() =>
                    updateTime(
                      hour,
                      selectedMinute,
                      use12Hour ? isAM : undefined
                    )
                  }
                  className={`
                    p-2 text-sm rounded border hover:bg-blue-50 transition-colors
                    ${selectedHour === hour ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300'}
                  `}
                >
                  {hour.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>

          {/* 分钟选择 */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              分钟
            </label>
            <div className='grid grid-cols-6 gap-2 max-h-32 overflow-y-auto'>
              {generateMinuteOptions().map(minute => (
                <button
                  key={minute}
                  onClick={() =>
                    updateTime(
                      selectedHour,
                      minute,
                      use12Hour ? isAM : undefined
                    )
                  }
                  className={`
                    p-2 text-sm rounded border hover:bg-blue-50 transition-colors
                    ${selectedMinute === minute ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300'}
                  `}
                >
                  {minute.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>

          {/* AM/PM 选择（12小时制） */}
          {use12Hour && (
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                时段
              </label>
              <div className='flex gap-2'>
                <button
                  onClick={() => updateTime(selectedHour, selectedMinute, true)}
                  className={`
                    flex-1 p-2 text-sm rounded border hover:bg-blue-50 transition-colors
                    ${isAM ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300'}
                  `}
                >
                  AM
                </button>
                <button
                  onClick={() =>
                    updateTime(selectedHour, selectedMinute, false)
                  }
                  className={`
                    flex-1 p-2 text-sm rounded border hover:bg-blue-50 transition-colors
                    ${!isAM ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300'}
                  `}
                >
                  PM
                </button>
              </div>
            </div>
          )}

          {/* 常用时间 */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              常用时间
            </label>
            <div className='grid grid-cols-2 gap-2'>
              <button
                onClick={() => updateTime(9, 0, use12Hour ? true : undefined)}
                className='p-2 text-sm rounded border border-gray-300 hover:bg-blue-50 transition-colors'
              >
                上午9:00
              </button>
              <button
                onClick={() =>
                  updateTime(
                    use12Hour ? 12 : 12,
                    0,
                    use12Hour ? true : undefined
                  )
                }
                className='p-2 text-sm rounded border border-gray-300 hover:bg-blue-50 transition-colors'
              >
                中午12:00
              </button>
              <button
                onClick={() =>
                  updateTime(
                    use12Hour ? 3 : 15,
                    0,
                    use12Hour ? false : undefined
                  )
                }
                className='p-2 text-sm rounded border border-gray-300 hover:bg-blue-50 transition-colors'
              >
                下午3:00
              </button>
              <button
                onClick={() =>
                  updateTime(
                    use12Hour ? 6 : 18,
                    0,
                    use12Hour ? false : undefined
                  )
                }
                className='p-2 text-sm rounded border border-gray-300 hover:bg-blue-50 transition-colors'
              >
                晚上6:00
              </button>
            </div>
          </div>

          {/* 底部操作 */}
          <div className='flex justify-between pt-2 border-t'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                setSelectedHour(12);
                setSelectedMinute(0);
                setIsAM(true);
                onChange?.('');
                setIsOpen(false);
              }}
            >
              清除
            </Button>
            <Button variant='ghost' size='sm' onClick={() => setIsOpen(false)}>
              确定
            </Button>
          </div>
        </div>
      )}

      {/* 点击外部关闭 */}
      {isOpen && (
        <div className='fixed inset-0 z-40' onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
