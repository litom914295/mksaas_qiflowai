'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Image as ImageIcon, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';

interface HouseLayoutUploadProps {
  /** 当前图片值 */
  value: string | null;
  /** 值变化回调 */
  onChange: (image: string | null) => void;
  /** 最大文件大小（MB） */
  maxSize?: number;
}

/**
 * 房屋平面图上传组件
 * 支持图片上传、预览和删除
 */
export function HouseLayoutUpload({
  value,
  onChange,
  maxSize = 5,
}: HouseLayoutUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    setUploadError(null);

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setUploadError('请上传图片文件');
      return;
    }

    // 验证文件大小
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`文件大小不能超过 ${maxSize}MB`);
      return;
    }

    // 读取文件并转换为 base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
    };
    reader.onerror = () => {
      setUploadError('文件读取失败，请重试');
    };
    reader.readAsDataURL(file);
  };

  // 点击上传
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // 拖拽进入
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  // 拖拽离开
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // 拖拽悬停
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 放下文件
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  // 删除图片
  const handleRemove = () => {
    onChange(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mt-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        className="hidden"
      />

      {!value ? (
        /* 上传区域 */
        <Card
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed cursor-pointer transition-all hover:border-blue-400 hover:bg-blue-50 ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
        >
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              上传平面图
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              点击或拖拽图片到此处上传
            </p>
            <p className="text-xs text-gray-400">
              支持 JPG、PNG 格式，最大 {maxSize}MB
            </p>
            {uploadError && (
              <div className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg inline-block">
                {uploadError}
              </div>
            )}
          </div>
        </Card>
      ) : (
        /* 预览区域 */
        <Card className="border-2 border-green-200 bg-green-50">
          <div className="p-4">
            <div className="flex items-start gap-4">
              {/* 图片预览 */}
              <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border-2 border-gray-200">
                <Image
                  src={value}
                  alt="平面图预览"
                  fill
                  className="object-cover"
                />
              </div>

              {/* 信息和操作 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">
                      上传成功
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    删除
                  </Button>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>平面图已就绪</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    系统将根据您的平面图提供更精准的风水布局建议
                  </p>
                </div>

                {/* 重新上传 */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClick}
                  className="mt-3"
                >
                  <Upload className="w-3 h-3 mr-2" />
                  重新上传
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
