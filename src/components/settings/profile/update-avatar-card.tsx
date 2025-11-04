'use client';

import { FormError } from '@/components/shared/form-error';
import { DefaultAvatarPicker } from '@/components/settings/profile/default-avatar-picker';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { type DefaultAvatar } from '@/config/default-avatars';
import { websiteConfig } from '@/config/website';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { uploadFileFromBrowser } from '@/storage/client';
import { Upload, User2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UpdateAvatarCardProps {
  className?: string;
}

/**
 * Update the user's avatar
 */
export function UpdateAvatarCard({ className }: UpdateAvatarCardProps) {
  // show nothing if storage is disabled or update avatar is disabled
  if (
    !websiteConfig.storage.enable ||
    !websiteConfig.features.enableUpdateAvatar
  ) {
    return null;
  }

  const t = useTranslations('Dashboard.settings.profile');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | undefined>('');
  const { data: session, refetch } = authClient.useSession();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [tempAvatarUrl, setTempAvatarUrl] = useState('');

  useEffect(() => {
    if (session?.user?.image) {
      setAvatarUrl(session.user.image);
    }
  }, [session]);

  const user = session?.user;
  if (!user) {
    return null;
  }

  const handleUploadClick = () => {
    // Create a hidden file input and trigger it
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg, image/webp';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    };
    input.click();
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setError('');

    try {
      // Create a temporary URL for preview and store the original URL
      const tempUrl = URL.createObjectURL(file);
      setTempAvatarUrl(tempUrl);
      // Show temporary avatar immediately for better UX
      setAvatarUrl(tempUrl);

      // Upload the file to storage
      const result = await uploadFileFromBrowser(file, 'avatars');
      // console.log('uploadFileFromBrowser, result', result);
      const { url } = result;
      console.log('uploadFileFromBrowser, url', url);

      // Update the user's avatar using authClient
      await authClient.updateUser(
        {
          image: url,
        },
        {
          onRequest: () => {
            // console.log('update avatar, request:', ctx.url);
          },
          onResponse: () => {
            // console.log('update avatar, response:', ctx.response);
          },
          onSuccess: () => {
            // console.log('update avatar, success:', ctx.data);
            // Set the permanent avatar URL on success
            setAvatarUrl(url);
            toast.success(t('avatar.success'));
            // Refetch the session to get the latest data
            refetch();
          },
          onError: (ctx: any) => {
            console.error('update avatar error:', ctx.error);
            setError(`${ctx.error.status}: ${ctx.error.message}`);
            // Restore the previous avatar on error
            if (session?.user?.image) {
              setAvatarUrl(session.user.image);
            }
            toast.error(t('avatar.fail'));
          },
        }
      );
    } catch (error) {
      console.error('update avatar error:', error);
      setError(error instanceof Error ? error.message : t('avatar.fail'));
      // Restore the previous avatar if there was an error
      if (session?.user?.image) {
        setAvatarUrl(session.user.image);
      }
      toast.error(t('avatar.fail'));
    } finally {
      setIsUploading(false);
      // Clean up temporary URL
      if (tempAvatarUrl) {
        URL.revokeObjectURL(tempAvatarUrl);
        setTempAvatarUrl('');
      }
    }
  };

  const handleDefaultAvatarSelect = async (avatar: DefaultAvatar) => {
    setIsUploading(true);
    setError('');

    try {
      // 生成玄学头像URL（使用data URI）
      const avatarUrl = generateDefaultAvatarUrl(avatar);
      setAvatarUrl(avatarUrl);

      // 更新用户头像
      await authClient.updateUser(
        { image: avatarUrl },
        {
          onSuccess: () => {
            toast.success(`已设置为 ${avatar.name} 头像`);
            refetch();
          },
          onError: (ctx: any) => {
            console.error('update avatar error:', ctx.error);
            setError(`${ctx.error.status}: ${ctx.error.message}`);
            if (session?.user?.image) {
              setAvatarUrl(session.user.image);
            }
            toast.error(t('avatar.fail'));
          },
        }
      );
    } catch (error) {
      console.error('update avatar error:', error);
      setError(error instanceof Error ? error.message : t('avatar.fail'));
      if (session?.user?.image) {
        setAvatarUrl(session.user.image);
      }
      toast.error(t('avatar.fail'));
    } finally {
      setIsUploading(false);
    }
  };

  // 生成默认头像URL（SVG data URI）
  const generateDefaultAvatarUrl = (avatar: DefaultAvatar): string => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><defs><linearGradient id="grad-${avatar.id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${getColorFromClass(avatar.color, 'from')};stop-opacity:1" /><stop offset="100%" style="stop-color:${getColorFromClass(avatar.color, 'to')};stop-opacity:1" /></linearGradient></defs><rect width="200" height="200" fill="url(#grad-${avatar.id})"/><text x="100" y="120" font-size="80" font-weight="bold" fill="white" text-anchor="middle" font-family="serif" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">${avatar.symbol}</text></svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  };

  // 从Tailwind类提取颜色
  const getColorFromClass = (colorClass: string, type: 'from' | 'to'): string => {
    const colorMap: Record<string, string> = {
      'green-400': '#4ade80', 'green-500': '#22c55e', 'green-600': '#16a34a', 'green-700': '#15803d',
      'emerald-600': '#059669', 'emerald-700': '#047857', 'emerald-800': '#065f46',
      'teal-500': '#14b8a6', 'teal-600': '#0d9488',
      'red-400': '#f87171', 'red-500': '#ef4444', 'red-600': '#dc2626', 'red-700': '#b91c1c',
      'orange-500': '#f97316', 'orange-600': '#ea580c', 'orange-700': '#c2410c',
      'pink-400': '#f472b6', 'pink-500': '#ec4899', 'pink-600': '#db2777', 'pink-700': '#be185d',
      'yellow-400': '#facc15', 'yellow-500': '#eab308', 'yellow-600': '#ca8a04', 'yellow-700': '#a16207',
      'amber-500': '#f59e0b', 'amber-600': '#d97706', 'amber-700': '#b45309', 'amber-800': '#92400e',
      'blue-500': '#3b82f6', 'blue-600': '#2563eb', 'blue-700': '#1d4ed8',
      'cyan-700': '#0e7490', 'cyan-800': '#155e75',
      'indigo-600': '#4f46e5', 'indigo-700': '#4338ca',
      'purple-700': '#7e22ce',
      'gray-300': '#d1d5db', 'gray-400': '#9ca3af', 'gray-500': '#6b7280', 'gray-600': '#4b5563',
      'slate-500': '#64748b', 'slate-600': '#475569', 'slate-700': '#334155',
      'zinc-400': '#a1a1aa', 'zinc-500': '#71717a',
    };

    const match = colorClass.match(type === 'from' ? /from-(\S+)/ : /to-(\S+)/);
    if (match) {
      return colorMap[match[1]] || '#3b82f6';
    }
    return '#3b82f6';
  };

  return (
    <Card
      className={cn(
        'w-full overflow-hidden py-0 pt-6 flex flex-col',
        className
      )}
    >
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {t('avatar.title')}
        </CardTitle>
        <CardDescription>{t('avatar.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div className="flex flex-col items-center gap-6">
          {/* avatar 预览 */}
          <Avatar className="h-24 w-24 border-4 border-muted shadow-lg">
            <AvatarImage src={avatarUrl ?? ''} alt={user.name} />
            <AvatarFallback>
              <User2Icon className="h-12 w-12 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>

          {/* 按钮组 */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              variant="default"
              size="sm"
              onClick={handleUploadClick}
              disabled={isUploading}
              className="cursor-pointer gap-2"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? t('avatar.uploading') : t('avatar.uploadAvatar')}
            </Button>

            <DefaultAvatarPicker
              onSelect={handleDefaultAvatarSelect}
              disabled={isUploading}
            />
          </div>
        </div>

        <FormError message={error} />
      </CardContent>
      <CardFooter className="mt-auto px-6 py-4 flex justify-between items-center bg-muted rounded-none">
        <p className="text-sm text-muted-foreground">
          {t('avatar.recommendation')}
        </p>
      </CardFooter>
    </Card>
  );
}
