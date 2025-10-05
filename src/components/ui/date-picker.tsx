"use client"

import * as React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { invalidClass } from '@/components/ui/field-styles'
import { Calendar as CalendarIcon } from 'lucide-react'

/**
 * DatePicker 包装器
 * - value/onChange: 受控日期
 * - name: 用于 FormData 的隐藏字段（保存 ISO 字符串）
 * - placeholder: 未选择时按钮上的占位文案
 * - isInvalid: 控制统一错误态外观（边框 + ring）
 */
export function DatePicker({
  value,
  onChange,
  name,
  placeholder = '选择日期',
  isInvalid = false,
}: {
  value?: Date
  onChange?: (v?: Date) => void
  name?: string
  placeholder?: string
  isInvalid?: boolean
}) {
  const iso = value ? value.toISOString() : ''

  return (
    <div className="w-full">
      {name ? <input type="hidden" name={name} value={iso} /> : null}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn('w-full justify-start text-left font-normal', invalidClass(isInvalid))}
          >
            <CalendarIcon className="mr-2 size-4" />
            {value ? value.toLocaleDateString() : <span className="text-muted-foreground">{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(d) => onChange?.(d)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
