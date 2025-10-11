'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline,
  Link,
  List,
  ListOrdered,
  Quote,
  Code,
  Image,
  Table,
  Heading1,
  Heading2,
  Heading3,
  FileText,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Upload,
  Undo,
  Redo,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

// 动态导入MDEditor以避免SSR问题
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
);

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  preview?: 'live' | 'edit' | 'preview';
  hideToolbar?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = '开始编写您的内容...',
  height = 500,
  preview = 'live',
  hideToolbar = false,
  onImageUpload,
}: MarkdownEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'live' | 'edit' | 'preview'>(preview);
  const [uploading, setUploading] = useState(false);

  // 插入文本到光标位置
  const insertText = useCallback((text: string) => {
    const textarea = document.querySelector('.w-md-editor-text-input') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + text + value.substring(end);
    
    onChange(newValue);
    
    // 恢复光标位置
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  }, [value, onChange]);

  // 包裹选中文本
  const wrapText = useCallback((before: string, after: string = before) => {
    const textarea = document.querySelector('.w-md-editor-text-input') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = before + selectedText + after;
    const newValue = value.substring(0, start) + newText + value.substring(end);
    
    onChange(newValue);
    
    // 选中新插入的文本
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  }, [value, onChange]);

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast({
        title: '文件类型错误',
        description: '请选择图片文件',
        variant: 'destructive',
      });
      return;
    }

    // 检查文件大小（最大5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: '文件过大',
        description: '图片大小不能超过5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      let imageUrl: string;

      if (onImageUpload) {
        // 使用自定义上传函数
        imageUrl = await onImageUpload(file);
      } else {
        // 默认转换为Base64
        imageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      // 插入图片Markdown
      const imageMarkdown = `![${file.name}](${imageUrl})`;
      insertText(imageMarkdown);

      toast({
        title: '上传成功',
        description: '图片已插入到编辑器',
      });
    } catch (error) {
      toast({
        title: '上传失败',
        description: error instanceof Error ? error.message : '图片上传失败',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // 清空input
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  // 工具栏按钮
  const toolbarButtons = [
    {
      icon: <Bold className="h-4 w-4" />,
      title: '粗体',
      action: () => wrapText('**'),
    },
    {
      icon: <Italic className="h-4 w-4" />,
      title: '斜体',
      action: () => wrapText('*'),
    },
    {
      icon: <Underline className="h-4 w-4" />,
      title: '下划线',
      action: () => wrapText('<u>', '</u>'),
    },
    { divider: true },
    {
      icon: <Heading1 className="h-4 w-4" />,
      title: '标题1',
      action: () => insertText('\n# '),
    },
    {
      icon: <Heading2 className="h-4 w-4" />,
      title: '标题2',
      action: () => insertText('\n## '),
    },
    {
      icon: <Heading3 className="h-4 w-4" />,
      title: '标题3',
      action: () => insertText('\n### '),
    },
    { divider: true },
    {
      icon: <List className="h-4 w-4" />,
      title: '无序列表',
      action: () => insertText('\n- '),
    },
    {
      icon: <ListOrdered className="h-4 w-4" />,
      title: '有序列表',
      action: () => insertText('\n1. '),
    },
    {
      icon: <Quote className="h-4 w-4" />,
      title: '引用',
      action: () => insertText('\n> '),
    },
    { divider: true },
    {
      icon: <Link className="h-4 w-4" />,
      title: '链接',
      action: () => {
        const url = prompt('请输入链接地址:');
        if (url) {
          wrapText('[', `](${url})`);
        }
      },
    },
    {
      icon: <Code className="h-4 w-4" />,
      title: '代码',
      action: () => wrapText('`'),
    },
    {
      icon: <FileText className="h-4 w-4" />,
      title: '代码块',
      action: () => wrapText('\n```\n', '\n```\n'),
    },
    {
      icon: <Table className="h-4 w-4" />,
      title: '表格',
      action: () => insertText('\n| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容1 | 内容2 | 内容3 |\n'),
    },
  ];

  return (
    <div className={`markdown-editor-wrapper ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}>
      {/* 自定义工具栏 */}
      {!hideToolbar && (
        <Card className="mb-2 p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {toolbarButtons.map((button, index) => {
                if (button.divider) {
                  return <div key={index} className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />;
                }
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={button.action}
                    title={button.title}
                    disabled={uploading}
                  >
                    {button.icon}
                  </Button>
                );
              })}
              
              {/* 图片上传按钮 */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  title="上传图片"
                  disabled={uploading}
                >
                  {uploading ? (
                    <Upload className="h-4 w-4 animate-pulse" />
                  ) : (
                    <Image className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* 视图控制 */}
            <div className="flex items-center gap-1">
              <Button
                variant={previewMode === 'edit' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('edit')}
                title="编辑模式"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant={previewMode === 'live' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('live')}
                title="实时预览"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant={previewMode === 'preview' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('preview')}
                title="预览模式"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? '退出全屏' : '全屏'}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Markdown编辑器 */}
      <div className={isFullscreen ? 'h-[calc(100vh-100px)]' : ''}>
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || '')}
          preview={previewMode}
          height={isFullscreen ? window.innerHeight - 100 : height}
          textareaProps={{
            placeholder,
          }}
          previewOptions={{
            rehypePlugins: [],
          }}
        />
      </div>

      {/* 全屏模式下的退出按钮 */}
      {isFullscreen && (
        <Button
          className="fixed top-4 right-4 z-50"
          onClick={() => setIsFullscreen(false)}
        >
          <Minimize2 className="h-4 w-4 mr-2" />
          退出全屏
        </Button>
      )}
    </div>
  );
}

// 导入编辑器时需要的类型定义
import { Edit } from 'lucide-react';

// 添加Edit图标导入