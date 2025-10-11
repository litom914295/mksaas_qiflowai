'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Example component demonstrating proper i18n usage in QiFlow AI
 * 
 * This component shows how to:
 * 1. Use translations from different namespaces
 * 2. Display localized app name and content
 * 3. Handle loading states with localized text
 * 4. Use action buttons with proper translations
 */
export function I18nExample() {
  const t = useTranslations();

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      
      {/* App Metadata Display */}
      <Card>
        <CardHeader>
          <CardTitle>{t('Metadata.name')}</CardTitle>
          <CardDescription>{t('Metadata.description')}</CardDescription>
        </CardHeader>
      </Card>

      {/* Navigation Example */}
      <Card>
        <CardHeader>
          <CardTitle>导航示例 / Navigation Example</CardTitle>
          <CardDescription>Available navigation items with localized names</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{t('Navigation.home')}</Badge>
            <Badge variant="secondary">{t('Navigation.dashboard')}</Badge>
            <Badge variant="secondary">{t('Navigation.analysis')}</Badge>
            <Badge variant="secondary">{t('Navigation.reports')}</Badge>
            <Badge variant="secondary">{t('Navigation.profile')}</Badge>
            <Badge variant="secondary">{t('Navigation.settings')}</Badge>
            <Badge variant="secondary">{t('Navigation.help')}</Badge>
            <Badge variant="secondary">{t('Navigation.about')}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Common Actions Example */}
      <Card>
        <CardHeader>
          <CardTitle>通用操作 / Common Actions</CardTitle>
          <CardDescription>Common UI elements with localized text</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button variant="default">{t('Common.save')}</Button>
            <Button variant="secondary">{t('Common.cancel')}</Button>
            <Button variant="outline">{t('Common.edit')}</Button>
            <Button variant="destructive">{t('Common.delete')}</Button>
            <Button variant="ghost">{t('Common.back')}</Button>
            <Button variant="ghost">{t('Common.next')}</Button>
            <Button variant="outline">{t('Common.retry')}</Button>
            <Button variant="outline">{t('Common.refresh')}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Features Example */}
      <Card>
        <CardHeader>
          <CardTitle>分析功能 / Analysis Features</CardTitle>
          <CardDescription>Core analysis functionality with localized names</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold">{t('Analysis.bazi')}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('Analysis.personalInfo')}: {t('Analysis.birthDate')}, {t('Analysis.birthTime')}
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold">{t('Analysis.fengshui')}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('Analysis.location')}, {t('Analysis.houseOrientation')}
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold">{t('Analysis.xuankong')}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Advanced flying star analysis
                </p>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button size="lg" className="bg-primary">
                {t('Analysis.startAnalysis')}
              </Button>
              <Button size="lg" variant="outline">
                {t('Analysis.viewReport')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State Example */}
      <Card>
        <CardHeader>
          <CardTitle>状态示例 / State Examples</CardTitle>
          <CardDescription>Various UI states with proper localization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>{t('Common.loading')}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="animate-pulse rounded-full h-4 w-4 bg-yellow-500"></div>
              <span>{t('Analysis.analyzing')}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="rounded-full h-4 w-4 bg-green-500"></div>
              <span>{t('Analysis.analysisComplete')}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="rounded-full h-4 w-4 bg-red-500"></div>
              <span>{t('Common.error')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Usage Example */}
      <Card>
        <CardHeader>
          <CardTitle>代码示例 / Code Usage</CardTitle>
          <CardDescription>How to use these translations in your components</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
            <code>{`import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations();
  
  return (
    <div>
      <h1>{t('Metadata.name')}</h1>
      <button>{t('Common.save')}</button>
      <p>{t('Analysis.startAnalysis')}</p>
    </div>
  );
}`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}