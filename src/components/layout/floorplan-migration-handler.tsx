'use client';

/**
 * 户型图匿名数据迁移处理器
 * 监听用户登录，自动迁移 localStorage 中的匿名数据到数据库
 */

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/client'; // 根据项目实际路径调整
import { FloorplanStorageKeys } from '@/types/floorplan';
import type { MigrationDataItem, FloorplanState } from '@/types/floorplan';
import { migrateAnonymousData } from '@/actions/qiflow/floorplan-state';
import { cleanAnonymousFloorplanCache } from '@/lib/qiflow/storage-quota';
import { CheckCircle2, Loader2, X, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface MigrationStatus {
  isChecking: boolean;
  isMigrating: boolean;
  foundCount: number;
  migratedCount: number;
  failedCount: number;
  errors: string[];
  completed: boolean;
}

/**
 * 户型图迁移处理器
 * 放置在全局布局或认证后的页面中
 */
export function FloorplanMigrationHandler() {
  const session = useSession();
  const [status, setStatus] = useState<MigrationStatus>({
    isChecking: false,
    isMigrating: false,
    foundCount: 0,
    migratedCount: 0,
    failedCount: 0,
    errors: [],
    completed: false,
  });
  const [showNotification, setShowNotification] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  /**
   * 扫描 localStorage 中的匿名数据
   */
  const scanAnonymousData = (): MigrationDataItem[] => {
    const anonymousData: MigrationDataItem[] = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && FloorplanStorageKeys.isAnonymousKey(key)) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              const state = JSON.parse(value) as FloorplanState;
              const analysisId = FloorplanStorageKeys.extractAnalysisId(key);
              
              if (analysisId && state.imageData) {
                anonymousData.push({ key, state, analysisId });
              }
            }
          } catch (parseError) {
            console.warn('[Migration] 跳过无效数据:', key, parseError);
          }
        }
      }
    } catch (error) {
      console.error('[Migration] 扫描失败:', error);
    }

    return anonymousData;
  };

  /**
   * 执行迁移
   */
  const performMigration = async (anonymousData: MigrationDataItem[]) => {
    if (anonymousData.length === 0) return;

    setStatus((prev) => ({
      ...prev,
      isMigrating: true,
      foundCount: anonymousData.length,
    }));

    setShowNotification(true);

    try {
      // 调用 Server Action 批量迁移
      const result = await migrateAnonymousData(anonymousData);

      setStatus({
        isChecking: false,
        isMigrating: false,
        foundCount: anonymousData.length,
        migratedCount: result.migratedCount,
        failedCount: result.failedCount,
        errors: result.errors.map((e) => `${e.analysisId}: ${e.error}`),
        completed: true,
      });

      // 如果全部成功，清理匿名数据
      if (result.success) {
        console.log('[Migration] 迁移成功，清理匿名数据...');
        const cleaned = cleanAnonymousFloorplanCache();
        console.log(`[Migration] 已清理 ${cleaned} 个匿名缓存`);
      }

      // 3秒后自动隐藏通知（如果成功）
      if (result.success) {
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      }
    } catch (error) {
      console.error('[Migration] 迁移失败:', error);
      setStatus((prev) => ({
        ...prev,
        isMigrating: false,
        completed: true,
        errors: [error instanceof Error ? error.message : '迁移失败'],
      }));
    }
  };

  /**
   * 监听登录状态变化
   */
  useEffect(() => {
    // 如果未登录或已处理过，跳过
    if (!session?.user?.id || dismissed) return;

    // 检查是否已经迁移过（使用 sessionStorage 标记）
    const migrationKey = `floorplan_migrated_${session.user.id}`;
    if (sessionStorage.getItem(migrationKey)) {
      return;
    }

    // 扫描匿名数据
    setStatus((prev) => ({ ...prev, isChecking: true }));
    
    const anonymousData = scanAnonymousData();
    
    setStatus((prev) => ({ ...prev, isChecking: false }));

    if (anonymousData.length > 0) {
      console.log(`[Migration] 发现 ${anonymousData.length} 个匿名户型方案，开始迁移...`);
      performMigration(anonymousData);
      
      // 标记为已迁移（本次会话）
      sessionStorage.setItem(migrationKey, 'true');
    }
  }, [session?.user?.id, dismissed]);

  /**
   * 手动重试
   */
  const handleRetry = () => {
    setDismissed(false);
    setStatus({
      isChecking: false,
      isMigrating: false,
      foundCount: 0,
      migratedCount: 0,
      failedCount: 0,
      errors: [],
      completed: false,
    });
    
    const anonymousData = scanAnonymousData();
    if (anonymousData.length > 0) {
      performMigration(anonymousData);
    }
  };

  /**
   * 关闭通知
   */
  const handleDismiss = () => {
    setShowNotification(false);
    setDismissed(true);
  };

  // 不显示通知时返回 null
  if (!showNotification) return null;

  // 渲染迁移进度通知
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom">
      <Card className="shadow-2xl border-2 border-blue-200">
        <CardContent className="p-4">
          {/* 头部 */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {status.isMigrating && (
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              )}
              {status.completed && status.failedCount === 0 && (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
              {status.completed && status.failedCount > 0 && (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
              
              <h3 className="font-semibold text-gray-900">
                {status.isMigrating && '正在迁移户型数据...'}
                {status.completed && status.failedCount === 0 && '迁移完成！'}
                {status.completed && status.failedCount > 0 && '迁移部分成功'}
              </h3>
            </div>
            
            {!status.isMigrating && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* 进度信息 */}
          <div className="space-y-2">
            {status.isMigrating && (
              <>
                <Progress 
                  value={(status.migratedCount / status.foundCount) * 100} 
                  className="h-2"
                />
                <p className="text-sm text-gray-600">
                  已迁移 {status.migratedCount} / {status.foundCount} 个方案
                </p>
              </>
            )}

            {status.completed && (
              <>
                <div className="text-sm space-y-1">
                  <p className="text-gray-700">
                    ✅ 成功迁移 <span className="font-semibold">{status.migratedCount}</span> 个方案
                  </p>
                  {status.failedCount > 0 && (
                    <p className="text-yellow-700">
                      ⚠️ {status.failedCount} 个方案迁移失败
                    </p>
                  )}
                </div>

                {/* 错误详情 */}
                {status.errors.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                      查看错误详情
                    </summary>
                    <div className="mt-2 text-xs text-red-600 space-y-1 max-h-32 overflow-y-auto">
                      {status.errors.map((error, idx) => (
                        <p key={idx}>• {error}</p>
                      ))}
                    </div>
                  </details>
                )}

                {/* 重试按钮 */}
                {status.failedCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="w-full mt-2"
                  >
                    重试失败项
                  </Button>
                )}
              </>
            )}
          </div>

          {/* 说明文字 */}
          {status.isMigrating && (
            <p className="text-xs text-gray-500 mt-2">
              您之前保存的户型方案正在同步到您的账户中...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * 轻量级版本 - 仅后台迁移，不显示 UI
 */
export function FloorplanMigrationHandlerSilent() {
  const session = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    const migrationKey = `floorplan_migrated_${session.user.id}`;
    if (sessionStorage.getItem(migrationKey)) return;

    // 后台扫描和迁移
    (async () => {
      const anonymousData: MigrationDataItem[] = [];

      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && FloorplanStorageKeys.isAnonymousKey(key)) {
            const value = localStorage.getItem(key);
            if (value) {
              const state = JSON.parse(value) as FloorplanState;
              const analysisId = FloorplanStorageKeys.extractAnalysisId(key);
              if (analysisId) {
                anonymousData.push({ key, state, analysisId });
              }
            }
          }
        }

        if (anonymousData.length > 0) {
          console.log(`[Migration Silent] 发现 ${anonymousData.length} 个匿名方案`);
          const result = await migrateAnonymousData(anonymousData);
          
          if (result.success) {
            cleanAnonymousFloorplanCache();
            console.log(`[Migration Silent] 迁移完成: ${result.migratedCount} 成功`);
          }
        }

        sessionStorage.setItem(migrationKey, 'true');
      } catch (error) {
        console.error('[Migration Silent] 迁移失败:', error);
      }
    })();
  }, [session?.user?.id]);

  return null;
}
