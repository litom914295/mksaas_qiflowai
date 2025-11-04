'use client';

import { Button } from '@/components/ui/button';
import { Download, FileText, Share2 } from 'lucide-react';
import { useState } from 'react';

interface ExportDialogueButtonProps {
  messages: Array<{
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: string;
  }>;
  sessionId: string;
  className?: string;
  disabled?: boolean;
}

export function ExportDialogueButton({
  messages,
  sessionId,
  className,
  disabled = false,
}: ExportDialogueButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToText = () => {
    setIsExporting(true);

    const dialogueText = messages
      .map((msg) => {
        const role = msg.role === 'user' ? '用户' : 'AI大师';
        const timestamp = new Date(msg.timestamp).toLocaleString('zh-CN');
        return `[${timestamp}] ${role}: ${msg.content}`;
      })
      .join('\n\n');

    const fullText = `AI八字风水对话记录
会话ID: ${sessionId}
导出时间: ${new Date().toLocaleString('zh-CN')}

${dialogueText}`;

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-dialogue-${sessionId}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsExporting(false);
  };

  const exportToJSON = () => {
    setIsExporting(true);

    const dialogueData = {
      sessionId,
      exportTime: new Date().toISOString(),
      messages: messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
    };

    const blob = new Blob([JSON.stringify(dialogueData, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-dialogue-${sessionId}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsExporting(false);
  };

  const shareDialogue = async () => {
    if (navigator.share) {
      try {
        const dialogueText = messages
          .map((msg) => {
            const role = msg.role === 'user' ? '用户' : 'AI大师';
            return `${role}: ${msg.content}`;
          })
          .join('\n\n');

        await navigator.share({
          title: 'AI八字风水对话记录',
          text: dialogueText,
          url: window.location.href,
        });
      } catch (error) {
        console.error('分享失败:', error);
      }
    } else {
      // 降级到复制到剪贴板
      const dialogueText = messages
        .map((msg) => {
          const role = msg.role === 'user' ? '用户' : 'AI大师';
          return `${role}: ${msg.content}`;
        })
        .join('\n\n');

      try {
        await navigator.clipboard.writeText(dialogueText);
        alert('对话内容已复制到剪贴板');
      } catch (error) {
        console.error('复制失败:', error);
      }
    }
  };

  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={exportToText}
        disabled={disabled || isExporting}
        className="flex items-center gap-2"
      >
        <FileText className="w-4 h-4" />
        {isExporting ? '导出中...' : '导出TXT'}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={exportToJSON}
        disabled={disabled || isExporting}
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        {isExporting ? '导出中...' : '导出JSON'}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={shareDialogue}
        disabled={disabled}
        className="flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        分享
      </Button>
    </div>
  );
}
