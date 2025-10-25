import { authOptions } from '@/lib/auth';
import { deleteFile } from '@/storage';
import { StorageError } from '@/storage/types';
import { getServerSession } from 'next-auth';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * 删除云存储文件 API
 *
 * @param request - POST请求，body包含 {key: string}
 * @returns 删除结果
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户登录状态（可选：根据需求决定是否需要）
    const session = await getServerSession(authOptions);

    // 2. 解析请求体
    const body = await request.json();
    const { key } = body;

    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing key parameter' },
        { status: 400 }
      );
    }

    // 3. 验证用户权限（可选：检查文件是否属于当前用户）
    // 例如：检查 key 是否以 `floorplans/${userId}/` 开头
    if (session?.user?.id && key.startsWith('floorplans/')) {
      const keyUserId = key.split('/')[1];
      if (keyUserId !== session.user.id) {
        console.warn(
          `[Storage Delete] 权限拒绝: 用户 ${session.user.id} 尝试删除其他用户的文件 ${key}`
        );
        return NextResponse.json(
          { error: 'Permission denied' },
          { status: 403 }
        );
      }
    }

    // 4. 调用存储服务删除文件
    await deleteFile(key);

    console.log(`[Storage Delete] 文件删除成功: ${key}`);
    return NextResponse.json({
      success: true,
      key,
    });
  } catch (error) {
    console.error('[Storage Delete] 删除文件失败:', error);

    if (error instanceof StorageError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}

/**
 * 批量删除云存储文件 API（可选）
 *
 * @param request - DELETE请求，body包含 {keys: string[]}
 * @returns 批量删除结果
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { keys } = body;

    if (!Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty keys array' },
        { status: 400 }
      );
    }

    // 验证权限
    if (session?.user?.id) {
      for (const key of keys) {
        if (key.startsWith('floorplans/')) {
          const keyUserId = key.split('/')[1];
          if (keyUserId !== session.user.id) {
            return NextResponse.json(
              { error: `Permission denied for key: ${key}` },
              { status: 403 }
            );
          }
        }
      }
    }

    // 批量删除
    const results = await Promise.allSettled(
      keys.map((key) => deleteFile(key))
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const failedKeys = keys.filter((_, i) => results[i].status === 'rejected');

    console.log(
      `[Storage Delete] 批量删除完成: ${successCount}/${keys.length} 成功`
    );

    return NextResponse.json({
      success: true,
      total: keys.length,
      successCount,
      failedCount: keys.length - successCount,
      failedKeys,
    });
  } catch (error) {
    console.error('[Storage Delete] 批量删除失败:', error);
    return NextResponse.json({ error: 'Batch delete failed' }, { status: 500 });
  }
}
