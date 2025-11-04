'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  BellIcon,
  GlobeIcon,
  MailIcon,
  MoonIcon,
  SaveIcon,
  SettingsIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PreferencesCardProps {
  className?: string;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'zh-CN' | 'en-US';
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
    analysis: boolean;
  };
  analysis: {
    autoSave: boolean;
    showTips: boolean;
    detailedResults: boolean;
  };
  privacy: {
    profileVisible: boolean;
    shareAnalysis: boolean;
  };
}

/**
 * User preferences settings card component
 */
export function PreferencesCard({ className }: PreferencesCardProps) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    language: 'zh-CN',
    notifications: {
      email: true,
      push: true,
      marketing: false,
      analysis: true,
    },
    analysis: {
      autoSave: true,
      showTips: true,
      detailedResults: false,
    },
    privacy: {
      profileVisible: true,
      shareAnalysis: false,
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Mock function to load preferences from server
  useEffect(() => {
    // In real app, this would fetch from API
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (e) {
        console.error('Failed to load preferences');
      }
    }
  }, []);

  const updatePreference = (path: string[], value: any) => {
    setPreferences((prev) => {
      const newPrefs = { ...prev };
      let current: any = newPrefs;

      for (let i = 0; i < path.length - 1; i++) {
        current[path[i]] = { ...current[path[i]] };
        current = current[path[i]];
      }

      current[path[path.length - 1]] = value;
      return newPrefs;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In real app, this would save to API
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('偏好设置已保存');
      setHasChanges(false);
    } catch (error) {
      toast.error('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const preferenceGroups = [
    {
      title: '界面设置',
      icon: SettingsIcon,
      items: [
        {
          key: 'theme',
          label: '主题模式',
          type: 'select',
          options: [
            { value: 'light', label: '浅色模式' },
            { value: 'dark', label: '深色模式' },
            { value: 'system', label: '跟随系统' },
          ],
          value: preferences.theme,
          onChange: (value: string) => updatePreference(['theme'], value),
        },
        {
          key: 'language',
          label: '语言设置',
          type: 'select',
          options: [
            { value: 'zh-CN', label: '简体中文' },
            { value: 'en-US', label: 'English' },
          ],
          value: preferences.language,
          onChange: (value: string) => updatePreference(['language'], value),
        },
      ],
    },
    {
      title: '通知设置',
      icon: BellIcon,
      items: [
        {
          key: 'email',
          label: '邮件通知',
          type: 'switch',
          description: '接收重要邮件通知',
          value: preferences.notifications.email,
          onChange: (value: boolean) =>
            updatePreference(['notifications', 'email'], value),
        },
        {
          key: 'push',
          label: '推送通知',
          type: 'switch',
          description: '接收浏览器推送通知',
          value: preferences.notifications.push,
          onChange: (value: boolean) =>
            updatePreference(['notifications', 'push'], value),
        },
        {
          key: 'marketing',
          label: '营销通知',
          type: 'switch',
          description: '接收产品更新和营销信息',
          value: preferences.notifications.marketing,
          onChange: (value: boolean) =>
            updatePreference(['notifications', 'marketing'], value),
        },
        {
          key: 'analysis',
          label: '分析完成通知',
          type: 'switch',
          description: '分析完成时发送通知',
          value: preferences.notifications.analysis,
          onChange: (value: boolean) =>
            updatePreference(['notifications', 'analysis'], value),
        },
      ],
    },
    {
      title: '分析设置',
      icon: GlobeIcon,
      items: [
        {
          key: 'autoSave',
          label: '自动保存',
          type: 'switch',
          description: '自动保存分析结果',
          value: preferences.analysis.autoSave,
          onChange: (value: boolean) =>
            updatePreference(['analysis', 'autoSave'], value),
        },
        {
          key: 'showTips',
          label: '显示使用提示',
          type: 'switch',
          description: '在分析过程中显示帮助提示',
          value: preferences.analysis.showTips,
          onChange: (value: boolean) =>
            updatePreference(['analysis', 'showTips'], value),
        },
        {
          key: 'detailedResults',
          label: '详细结果',
          type: 'switch',
          description: '显示更详细的分析结果',
          value: preferences.analysis.detailedResults,
          onChange: (value: boolean) =>
            updatePreference(['analysis', 'detailedResults'], value),
        },
      ],
    },
    {
      title: '隐私设置',
      icon: MailIcon,
      items: [
        {
          key: 'profileVisible',
          label: '公开资料',
          type: 'switch',
          description: '允许其他用户查看我的基本资料',
          value: preferences.privacy.profileVisible,
          onChange: (value: boolean) =>
            updatePreference(['privacy', 'profileVisible'], value),
        },
        {
          key: 'shareAnalysis',
          label: '分享分析',
          type: 'switch',
          description: '允许分享我的分析结果',
          value: preferences.privacy.shareAnalysis,
          onChange: (value: boolean) =>
            updatePreference(['privacy', 'shareAnalysis'], value),
        },
      ],
    },
  ];

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              偏好设置
            </CardTitle>
            <CardDescription>个性化您的使用体验</CardDescription>
          </div>
          {hasChanges && (
            <Button onClick={handleSave} disabled={isSaving} size="sm">
              <SaveIcon className="h-3 w-3 mr-1" />
              {isSaving ? '保存中...' : '保存'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {preferenceGroups.map((group) => {
          const Icon = group.icon;
          return (
            <div key={group.title} className="space-y-4">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {group.title}
              </h4>
              <div className="space-y-4 ml-6">
                {group.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="space-y-0.5 flex-1">
                      <Label className="text-sm font-medium">
                        {item.label}
                      </Label>
                      {'description' in item && item.description && (
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      {item.type === 'switch' ? (
                        <Switch
                          checked={item.value as boolean}
                          onCheckedChange={
                            item.onChange as (checked: boolean) => void
                          }
                        />
                      ) : (
                        <Select
                          value={item.value as string}
                          onValueChange={
                            item.onChange as (value: string) => void
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {'options' in item &&
                              item.options?.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {hasChanges && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-amber-800 text-sm">
              <SaveIcon className="h-4 w-4" />
              您有未保存的更改，请记得保存设置
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
