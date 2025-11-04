'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface ConversationInputProps {
  onSend: (message: {
    id: string;
    content: string;
    timestamp: Date;
    role: 'user';
  }) => void;
  onUpload?: (files: FileList) => void;
  disabled?: boolean;
  placeholder?: string;
}

const createId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `user-${Date.now()}`;

export const ConversationInput = ({
  onSend,
  onUpload,
  disabled = false,
  placeholder = '请输入您的八字或风水问题...',
}: ConversationInputProps) => {
  const [value, setValue] = useState('');
  const [supportsVoice, setSupportsVoice] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasRecognition =
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    setSupportsVoice(hasRecognition);
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;

    onSend({
      id: createId(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    });
    setValue('');
  }, [onSend, value]);

  const handleUpload = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0 || !onUpload) return;
      onUpload(files);
    },
    [onUpload]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (disabled) return;
      handleUpload(event.dataTransfer?.files ?? null);
    },
    [disabled, handleUpload]
  );

  return (
    <div
      className="space-y-2 rounded-lg border border-dashed border-transparent transition hover:border-border"
      onDragOver={(event) => {
        if (disabled) return;
        event.preventDefault();
      }}
      onDrop={onDrop}
    >
      <textarea
        className="h-24 w-full resize-none rounded-md border border-border bg-background p-3 text-sm text-foreground shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            handleSubmit();
          }
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-md border border-dashed border-border px-2 py-1 text-xs font-medium transition hover:border-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            上传附件
          </button>
          {!supportsVoice && (
            <span className="text-[11px]">
              该浏览器暂不支持语音输入，请使用键盘或粘贴文本。
            </span>
          )}
        </div>
        <span>按 Ctrl + Enter 快速发送</span>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          发送
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          handleUpload(event.target.files);
          if (event.target) {
            event.target.value = '';
          }
        }}
      />
    </div>
  );
};
