'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  CopyIcon,
  KeyIcon,
  QrCodeIcon,
  SettingsIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface TwoFactorAuthCardProps {
  className?: string;
}

/**
 * Two-factor authentication setup card component
 */
export function TwoFactorAuthCard({ className }: TwoFactorAuthCardProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [step, setStep] = useState<'qr' | 'verify' | 'backup'>('qr');
  const [verificationCode, setVerificationCode] = useState('');

  // Mock backup codes
  const backupCodes = [
    '1234-5678',
    '2345-6789',
    '3456-7890',
    '4567-8901',
    '5678-9012',
    '6789-0123',
  ];

  const handleEnable2FA = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsEnabled(true);
      setShowSetupDialog(false);
      toast.success('两步验证已启用');
    } catch (error) {
      toast.error('启用失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsEnabled(false);
      toast.success('两步验证已禁用');
    } catch (error) {
      toast.error('禁用失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = () => {
    if (verificationCode.length === 6) {
      setStep('backup');
    } else {
      toast.error('请输入6位验证码');
    }
  };

  const copyBackupCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('备份码已复制');
  };

  const copyAllBackupCodes = () => {
    const allCodes = backupCodes.join('\n');
    navigator.clipboard.writeText(allCodes);
    toast.success('所有备份码已复制');
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5 text-primary" />
              两步验证
            </CardTitle>
            <CardDescription>为您的账号添加额外的安全保护</CardDescription>
          </div>
          <Badge
            variant={isEnabled ? 'default' : 'secondary'}
            className={cn(
              isEnabled
                ? 'bg-green-100 text-green-800 border-green-200'
                : 'bg-gray-100 text-gray-600 border-gray-200'
            )}
          >
            {isEnabled ? '已启用' : '未启用'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Display */}
        <div
          className={cn(
            'p-4 rounded-lg border',
            isEnabled
              ? 'bg-green-50 border-green-200'
              : 'bg-amber-50 border-amber-200'
          )}
        >
          <div className="flex items-start gap-3">
            {isEnabled ? (
              <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <AlertTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5" />
            )}
            <div className="space-y-2">
              <h4
                className={cn(
                  'text-sm font-medium',
                  isEnabled ? 'text-green-900' : 'text-amber-900'
                )}
              >
                {isEnabled ? '两步验证已启用' : '建议启用两步验证'}
              </h4>
              <p
                className={cn(
                  'text-sm',
                  isEnabled ? 'text-green-800' : 'text-amber-800'
                )}
              >
                {isEnabled
                  ? '您的账号已受到两步验证保护，每次登录都需要验证码确认。'
                  : '启用两步验证可以大幅提升账号安全性，防止未经授权的访问。'}
              </p>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">两步验证功能</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <span>支持身份验证器应用 (如 Google Authenticator)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <span>提供备份码用于紧急访问</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <span>可随时启用或禁用</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <span>增强账号安全防护</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!isEnabled ? (
            <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
              <DialogTrigger asChild>
                <Button className="flex-1">
                  <ShieldCheckIcon className="h-4 w-4 mr-2" />
                  启用两步验证
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ShieldCheckIcon className="h-5 w-5" />
                    设置两步验证
                  </DialogTitle>
                  <DialogDescription>
                    {step === 'qr' && '使用身份验证器应用扫描二维码'}
                    {step === 'verify' && '输入验证码确认设置'}
                    {step === 'backup' && '保存备份码以备紧急使用'}
                  </DialogDescription>
                </DialogHeader>

                {step === 'qr' && (
                  <div className="space-y-4">
                    {/* QR Code Placeholder */}
                    <div className="flex justify-center">
                      <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <QrCodeIcon className="h-16 w-16 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            二维码
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Manual Entry Key */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        手动输入密钥
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value="JBSWY3DPEHPK3PXP"
                          readOnly
                          className="font-mono text-xs"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyBackupCode('JBSWY3DPEHPK3PXP')}
                        >
                          <CopyIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <SmartphoneIcon className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium">推荐应用</p>
                          <p>
                            Google Authenticator、Microsoft Authenticator、Authy
                          </p>
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        onClick={() => setStep('verify')}
                        className="w-full"
                      >
                        下一步
                      </Button>
                    </DialogFooter>
                  </div>
                )}

                {step === 'verify' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="verification-code">验证码</Label>
                      <Input
                        id="verification-code"
                        type="text"
                        maxLength={6}
                        placeholder="输入6位验证码"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="text-center text-lg font-mono"
                      />
                    </div>

                    <DialogFooter className="flex gap-2">
                      <Button variant="outline" onClick={() => setStep('qr')}>
                        返回
                      </Button>
                      <Button onClick={handleVerifyCode}>验证</Button>
                    </DialogFooter>
                  </div>
                )}

                {step === 'backup' && (
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <KeyIcon className="h-4 w-4 text-amber-600 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <p className="font-medium">重要提醒</p>
                          <p>
                            请妥善保存这些备份码，在无法使用身份验证器时可用于登录。
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>备份码</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyAllBackupCodes}
                        >
                          <CopyIcon className="h-3 w-3 mr-1" />
                          全部复制
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {backupCodes.map((code, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-muted rounded px-3 py-2"
                          >
                            <code className="text-sm font-mono">{code}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyBackupCode(code)}
                            >
                              <CopyIcon className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <DialogFooter>
                      <Button onClick={handleEnable2FA} disabled={isLoading}>
                        {isLoading ? '启用中...' : '完成设置'}
                      </Button>
                    </DialogFooter>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          ) : (
            <>
              <Button variant="outline" className="flex-1">
                <SettingsIcon className="h-4 w-4 mr-2" />
                管理设备
              </Button>
              <Button
                variant="destructive"
                onClick={handleDisable2FA}
                disabled={isLoading}
              >
                {isLoading ? '禁用中...' : '禁用'}
              </Button>
            </>
          )}
        </div>

        {isEnabled && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-green-900">设置完成</h4>
                <p className="text-sm text-green-800">
                  两步验证已成功启用。现在登录时需要输入验证码。
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
