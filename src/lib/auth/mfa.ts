import { prisma } from '@/lib/db';
import QRCode from 'qrcode';
import speakeasy from 'speakeasy';

export type MFAMethod = 'totp' | 'sms' | 'email';

export interface MFASecret {
  ascii: string;
  hex: string;
  base32: string;
  qr_code_ascii: string;
  qr_code_hex: string;
  qr_code_base32: string;
  google_auth_qr: string;
  otpauth_url: string;
}

/**
 * 生成TOTP密钥
 */
export function generateSecret(
  name: string,
  issuer = 'MkSaaS Admin'
): MFASecret {
  const secret = speakeasy.generateSecret({
    name,
    issuer,
    length: 32,
  });

  return {
    ascii: secret.ascii || '',
    hex: secret.hex || '',
    base32: secret.base32 || '',
    qr_code_ascii: secret.qr_code_ascii || '',
    qr_code_hex: secret.qr_code_hex || '',
    qr_code_base32: secret.qr_code_base32 || '',
    google_auth_qr: secret.google_auth_qr || '',
    otpauth_url: secret.otpauth_url || '',
  };
}

/**
 * 生成QR码图片
 */
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(otpauthUrl);
  } catch (error) {
    console.error('生成QR码失败:', error);
    throw new Error('生成QR码失败');
  }
}

/**
 * 验证TOTP令牌
 */
export function verifyTOTP(token: string, secret: string): boolean {
  try {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // 允许前后各2个时间窗口的误差
    });
  } catch (error) {
    console.error('验证TOTP失败:', error);
    return false;
  }
}

/**
 * 生成备份码
 */
export function generateBackupCodes(count = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
}

/**
 * 为用户启用MFA
 */
export async function enableMFA(
  userId: string,
  method: MFAMethod,
  secret?: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { mfa: true },
  } as any);

  if (!user) {
    throw new Error('用户不存在');
  }

  // 生成备份码
  const backupCodes = generateBackupCodes();

  // 如果是TOTP方法，生成密钥
  if (method === 'totp' && !secret) {
    const mfaSecret = generateSecret(user.email || user.id);
    secret = mfaSecret.base32;
  }

  // 创建或更新MFA设置
  const mfaData = {
    method,
    secret: secret || '',
    backupCodes: backupCodes.join(','),
    enabled: true,
    lastUsed: null,
  };

  if ((user as any).mfa) {
    await (prisma as any).mfa.update({
      where: { userId },
      data: mfaData,
    });
  } else {
    await (prisma as any).mfa.create({
      data: {
        ...mfaData,
        userId,
      },
    });
  }

  return {
    secret,
    backupCodes,
    qrCode:
      method === 'totp' && secret
        ? await generateQRCode(
            `otpauth://totp/MkSaaS:${user.email}?secret=${secret}&issuer=MkSaaS`
          )
        : null,
  };
}

/**
 * 禁用用户MFA
 */
export async function disableMFA(userId: string) {
  await (prisma as any).mfa.update({
    where: { userId },
    data: {
      enabled: false,
      secret: null,
      backupCodes: null,
    },
  });
}

/**
 * 验证用户MFA
 */
export async function verifyMFA(
  userId: string,
  code: string
): Promise<boolean> {
  const mfa = await (prisma as any).mfa.findUnique({
    where: { userId, enabled: true },
  });

  if (!mfa) {
    return true; // 未启用MFA，直接通过
  }

  // 检查是否是备份码
  if (mfa.backupCodes) {
    const backupCodes = mfa.backupCodes.split(',');
    const codeIndex = backupCodes.indexOf(code);

    if (codeIndex !== -1) {
      // 使用备份码
      backupCodes.splice(codeIndex, 1);
      await (prisma as any).mfa.update({
        where: { userId },
        data: {
          backupCodes: backupCodes.join(','),
          lastUsed: new Date(),
        },
      });
      return true;
    }
  }

  // 根据方法验证
  let isValid = false;

  switch (mfa.method) {
    case 'totp':
      isValid = verifyTOTP(code, mfa.secret || '');
      break;
    case 'sms':
      // TODO: 实现SMS验证逻辑
      isValid = await verifySMSCode(userId, code);
      break;
    case 'email':
      // TODO: 实现邮箱验证逻辑
      isValid = await verifyEmailCode(userId, code);
      break;
  }

  if (isValid) {
    // 更新最后使用时间
    await prisma.mfa.update({
      where: { userId },
      data: { lastUsed: new Date() },
    });
  }

  return isValid;
}

/**
 * 发送SMS验证码
 */
export async function sendSMSCode(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.phone) {
    throw new Error('用户手机号不存在');
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // 保存验证码到缓存或数据库
  await (prisma as any).verificationCode.create({
    data: {
      userId,
      code,
      type: 'sms_mfa',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5分钟过期
    },
  });

  // TODO: 调用SMS服务发送验证码
  console.log(`发送SMS验证码 ${code} 到 ${user.phone}`);
}

/**
 * 验证SMS验证码
 */
async function verifySMSCode(userId: string, code: string): Promise<boolean> {
  const verificationCode = await (prisma as any).verificationCode.findFirst({
    where: {
      userId,
      code,
      type: 'sms_mfa',
      expiresAt: { gt: new Date() },
      used: false,
    },
  });

  if (verificationCode) {
    await (prisma as any).verificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true },
    });
    return true;
  }

  return false;
}

/**
 * 发送邮箱验证码
 */
export async function sendEmailCode(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.email) {
    throw new Error('用户邮箱不存在');
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // 保存验证码到缓存或数据库
  await prisma.verificationCode.create({
    data: {
      userId,
      code,
      type: 'email_mfa',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5分钟过期
    },
  });

  // TODO: 调用邮件服务发送验证码
  console.log(`发送邮箱验证码 ${code} 到 ${user.email}`);
}

/**
 * 验证邮箱验证码
 */
async function verifyEmailCode(userId: string, code: string): Promise<boolean> {
  const verificationCode = await prisma.verificationCode.findFirst({
    where: {
      userId,
      code,
      type: 'email_mfa',
      expiresAt: { gt: new Date() },
      used: false,
    },
  });

  if (verificationCode) {
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true },
    });
    return true;
  }

  return false;
}
