import { join } from 'path';
import { readFile } from 'fs/promises';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json(
        { error: 'Path parameter is required' },
        { status: 400 }
      );
    }

    // 安全检查：只允许读取特定的文档文件
    const allowedPathPatterns = [
      /^\/docs\/.+\.md$/, // docs 目录下的所有 markdown 文件
      /^\/@[A-Z_]+.*\.md$/, // 根目录下以 @ 开头的文档
      /^\/QUICK_START\.md$/, // QUICK_START.md
      /^\/README\.md$/, // README.md
    ];

    const isAllowed = allowedPathPatterns.some((pattern) => pattern.test(path));

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Access to this file is not allowed' },
        { status: 403 }
      );
    }

    // 防止路径遍历攻击
    if (path.includes('..') || path.includes('~')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    // 构建文件路径
    const filePath = join(process.cwd(), path.replace(/^\//, ''));

    try {
      const content = await readFile(filePath, 'utf-8');
      return NextResponse.json({ content });
    } catch (fileError) {
      console.error('Error reading file:', fileError);
      return NextResponse.json(
        { error: 'File not found or cannot be read' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
