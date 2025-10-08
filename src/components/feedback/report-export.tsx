'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Download, Share2 } from 'lucide-react'

interface ReportExportProps {
  data?: any
  onExport?: (format: string) => void
}

export function ReportExport({ data, onExport }: ReportExportProps) {
  const handleExport = (format: string) => {
    if (onExport) {
      onExport(format)
    }
    // 实际导出逻辑
    console.log(`Exporting in ${format} format`, data)
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('pdf')}
      >
        <Download className="h-4 w-4 mr-2" />
        导出 PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('image')}
      >
        <Share2 className="h-4 w-4 mr-2" />
        分享图片
      </Button>
    </div>
  )
}