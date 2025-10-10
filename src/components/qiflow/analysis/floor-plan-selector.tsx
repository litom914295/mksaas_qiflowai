'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Home, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';

interface FloorPlan {
  id: string;
  name: string;
  description: string;
  rooms: number;
  image?: string;
}

const STANDARD_FLOOR_PLANS: FloorPlan[] = [
  {
    id: '1-bedroom',
    name: '一室一厅',
    description: '适合单身或情侣，约40-60㎡',
    rooms: 1,
  },
  {
    id: '2-bedroom-1',
    name: '两室一厅',
    description: '小家庭首选，约60-80㎡',
    rooms: 2,
  },
  {
    id: '2-bedroom-2',
    name: '两室两厅',
    description: '舒适空间，约80-100㎡',
    rooms: 2,
  },
  {
    id: '3-bedroom',
    name: '三室两厅',
    description: '家庭标配，约100-130㎡ ⭐推荐',
    rooms: 3,
  },
  {
    id: '4-bedroom',
    name: '四室两厅',
    description: '大家庭/多代同堂，约130-160㎡',
    rooms: 4,
  },
  {
    id: 'duplex',
    name: '复式/别墅',
    description: '豪华户型，160㎡+',
    rooms: 5,
  },
];

interface FloorPlanSelectorProps {
  onSelect: (plan: FloorPlan | null, uploadedImage?: string) => void;
  selectedPlan?: FloorPlan | null;
  uploadedImage?: string;
}

export function FloorPlanSelector({
  onSelect,
  selectedPlan,
  uploadedImage,
}: FloorPlanSelectorProps) {
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>(uploadedImage || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 选择标准户型
  const handleSelectStandard = (plan: FloorPlan) => {
    onSelect(plan);
    setShowModal(false);
    setPreviewImage('');
  };

  // 处理文件上传
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件（JPG、PNG格式）');
      return;
    }

    // 验证文件大小（最大5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('文件大小不能超过5MB');
      return;
    }

    setUploading(true);

    try {
      // 读取文件并转为base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setPreviewImage(imageData);
        onSelect(null, imageData);
        setShowModal(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  // 清除上传的图片
  const handleClearUpload = () => {
    setPreviewImage('');
    onSelect(null, undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 触发文件选择
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowModal(true)}
          className="flex-1 h-auto py-3"
        >
          <Home className="w-5 h-5 mr-2" />
          <div className="text-left">
            <div className="font-medium">选择标准户型</div>
            {selectedPlan && (
              <div className="text-xs text-muted-foreground">
                已选：{selectedPlan.name}
              </div>
            )}
          </div>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleUploadClick}
          disabled={uploading}
          className="flex-1 h-auto py-3"
        >
          <Upload className="w-5 h-5 mr-2" />
          <div className="text-left">
            <div className="font-medium">
              {uploading ? '上传中...' : '上传平面图'}
            </div>
            <div className="text-xs text-muted-foreground">
              支持JPG/PNG，最大5MB
            </div>
          </div>
        </Button>
      </div>

      {/* 上传的图片预览 */}
      {previewImage && (
        <div className="relative border-2 border-dashed rounded-lg p-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearUpload}
            className="absolute top-2 right-2 z-10"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="text-sm font-medium mb-2">已上传的户型图：</div>
          <div className="relative w-full h-48">
            <Image
              src={previewImage}
              alt="户型图"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 我们会根据您的户型图提供定制化风水建议
          </p>
        </div>
      )}

      {/* 提示文字 */}
      <p className="text-xs text-gray-500">
        💡 提示：选择户型或上传平面图可获得更详细的房间布局风水建议
      </p>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* 标准户型选择Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>选择您的户型</DialogTitle>
            <DialogDescription>
              选择最接近您实际户型的标准方案，帮助我们提供更精准的风水建议
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            {STANDARD_FLOOR_PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handleSelectStandard(plan)}
                className={`
                  p-4 border-2 rounded-lg text-left transition-all
                  hover:border-blue-500 hover:bg-blue-50
                  ${selectedPlan?.id === plan.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <Home className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">{plan.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {plan.rooms}室
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-3">找不到合适的户型？</p>
            <Button
              variant="outline"
              onClick={() => {
                setShowModal(false);
                handleUploadClick();
              }}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              上传您的户型图
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
