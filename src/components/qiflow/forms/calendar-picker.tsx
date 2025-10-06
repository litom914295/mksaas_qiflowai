'use client';

import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface CalendarPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  calendarType?: 'gregorian' | 'lunar';
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// 农历数据（简化版，实际项目中应该使用更完整的农历库）
const LUNAR_MONTHS = [
  '正月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '冬月',
  '腊月',
];

const LUNAR_DAYS = Array.from({ length: 30 }, (_, i) => {
  if (i === 0) return '初一';
  if (i === 9) return '初十';
  if (i === 19) return '二十';
  if (i === 29) return '三十';
  return `${['一', '二', '三', '四', '五', '六', '七', '八', '九'][i % 10]}${['十', '', '十', '十', '十', '十', '十', '十', '十', '十'][Math.floor(i / 10)]}`;
});

const GREGORIAN_MONTHS = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月',
];

export function CalendarPicker({
  value,
  onChange,
  calendarType = 'gregorian',
  placeholder = '选择日期',
  className = '',
  disabled = false,
}: CalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [inputValue, setInputValue] = useState(value || '');

  // 格式化日期显示
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    if (calendarType === 'lunar') {
      // 简化的农历转换（实际项目中应该使用专业的农历库）
      const month = LUNAR_MONTHS[date.getMonth()];
      const day = LUNAR_DAYS[date.getDate() - 1];
      const year = date.getFullYear();
      return `${year}年${month}${day}`;
    } else {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    }
  };

  // 获取月份的天数
  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // 获取月份第一天是星期几
  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // 生成日历网格
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // 填充前面的空白
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // 填充日期
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  // 月份导航
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // 年份导航
  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setFullYear(newDate.getFullYear() - 1);
      } else {
        newDate.setFullYear(newDate.getFullYear() + 1);
      }
      return newDate;
    });
  };

  // 处理直接输入
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // 尝试解析输入的日期 - 支持多种格式
    if (newValue) {
      let parsedDate: Date | null = null;

      // 支持 YYYY-MM-DD 格式
      if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(newValue)) {
        parsedDate = new Date(newValue);
      }
      // 支持 YYYY/MM/DD 格式
      else if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(newValue)) {
        parsedDate = new Date(newValue);
      }
      // 支持 YYYY.MM.DD 格式
      else if (/^\d{4}\.\d{1,2}\.\d{1,2}$/.test(newValue)) {
        parsedDate = new Date(newValue.replace(/\./g, '-'));
      }
      // 支持 YYYY年MM月DD日 格式
      else if (/^\d{4}年\d{1,2}月\d{1,2}日$/.test(newValue)) {
        const match = newValue.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
        if (match) {
          const [, year, month, day] = match;
          parsedDate = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day)
          );
        }
      }
      // 支持 YYYY年M月D日 格式（单数字月份和日期）
      else if (/^\d{4}年\d{1,2}月\d{1,2}日$/.test(newValue)) {
        const match = newValue.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
        if (match) {
          const [, year, month, day] = match;
          parsedDate = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day)
          );
        }
      }
      // 支持 MM/DD/YYYY 格式
      else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(newValue)) {
        const parts = newValue.split('/');
        parsedDate = new Date(
          parseInt(parts[2]),
          parseInt(parts[0]) - 1,
          parseInt(parts[1])
        );
      }

      if (parsedDate && !isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate);
        setCurrentDate(new Date(parsedDate));

        // 避免时区转换问题，直接格式化日期
        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(parsedDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${dayStr}`;

        onChange?.(dateString);
        setIsOpen(false); // 输入成功后关闭弹窗
      }
    } else {
      setSelectedDate(null);
      onChange?.('');
    }
  };

  // 选择日期
  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(selectedDate);

    // 避免时区转换问题，直接格式化日期
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(selectedDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${dayStr}`;

    onChange?.(dateString);
    setIsOpen(false);
  };

  // 检查日期是否被选中
  const isDateSelected = (day: number): boolean => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getFullYear() === currentDate.getFullYear()
    );
  };

  // 检查日期是否是今天
  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* 输入框 */}
      <div className='relative'>
        <input
          type='text'
          value={isOpen ? inputValue : formatDate(selectedDate)}
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleInputChange}
          onFocus={() => !disabled && setIsOpen(true)}
          onBlur={() => {
            // 延迟关闭，允许点击日历内部元素
            setTimeout(() => setIsOpen(false), 200);
          }}
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
        />
        <Calendar className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
      </div>

      {/* 日历弹窗 */}
      {isOpen && (
        <div
          data-calendar
          className='absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[320px]'
          onMouseDown={e => e.preventDefault()} // 防止触发onBlur
        >
          {/* 年份导航 */}
          <div className='flex items-center justify-between mb-3'>
            <button
              onClick={() => navigateYear('prev')}
              className='p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-800'
            >
              <ChevronLeft className='w-4 h-4' />
            </button>

            <div className='font-semibold text-lg text-gray-900'>
              {currentDate.getFullYear()}年
            </div>

            <button
              onClick={() => navigateYear('next')}
              className='p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-800'
            >
              <ChevronRight className='w-4 h-4' />
            </button>
          </div>

          {/* 月份导航 */}
          <div className='flex items-center justify-between mb-4'>
            <button
              onClick={() => navigateMonth('prev')}
              className='p-1 hover:bg-gray-100 rounded'
            >
              <ChevronLeft className='w-4 h-4' />
            </button>

            <div className='font-medium'>
              {calendarType === 'lunar'
                ? LUNAR_MONTHS[currentDate.getMonth()]
                : GREGORIAN_MONTHS[currentDate.getMonth()]}
            </div>

            <button
              onClick={() => navigateMonth('next')}
              className='p-1 hover:bg-gray-100 rounded'
            >
              <ChevronRight className='w-4 h-4' />
            </button>
          </div>

          {/* 帮助提示 */}
          <div className='text-xs text-gray-500 mb-3 text-center'>
            💡 支持多种格式：1990-01-01、1990/01/01、1990年1月7日、01/01/1990
          </div>

          {/* 星期标题 */}
          <div className='grid grid-cols-7 gap-1 mb-2'>
            {['日', '一', '二', '三', '四', '五', '六'].map(day => (
              <div
                key={day}
                className='text-center text-sm font-medium text-gray-500 py-1'
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日期网格 */}
          <div className='grid grid-cols-7 gap-1'>
            {generateCalendarDays().map((day, index) => (
              <div key={index} className='aspect-square'>
                {day ? (
                  <button
                    onClick={() => handleDateSelect(day)}
                    className={`
                      w-full h-full flex items-center justify-center text-sm rounded
                      hover:bg-blue-100 transition-colors
                      ${isDateSelected(day) ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                      ${isToday(day) ? 'border-2 border-blue-300' : ''}
                    `}
                  >
                    {day}
                  </button>
                ) : (
                  <div className='w-full h-full' />
                )}
              </div>
            ))}
          </div>

          {/* 底部操作 */}
          <div className='flex justify-between mt-4 pt-2 border-t'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                setSelectedDate(null);
                onChange?.('');
                setIsOpen(false);
              }}
            >
              清除
            </Button>
            <Button variant='ghost' size='sm' onClick={() => setIsOpen(false)}>
              取消
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
