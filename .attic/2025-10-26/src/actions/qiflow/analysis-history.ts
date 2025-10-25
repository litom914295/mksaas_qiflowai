'use server';

// import { prisma } from '@/lib/prisma' // TODO: Add when database is set up
import { getSession } from '@/lib/server';
import { revalidatePath } from 'next/cache';

export type AnalysisRecord = {
  id: string;
  type: 'bazi' | 'xuankong';
  createdAt: string;
  name?: string;
  birth?: string;
  address?: string;
  facing?: number;
  creditsUsed?: number;
  result?: any;
};

/**
 * 获取用户的分析历史记录
 */
export async function getAnalysisHistory(type?: 'bazi' | 'xuankong') {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { ok: false, error: 'Unauthorized', records: [] };
    }

    // TODO: 从数据库查询历史记录
    // 这里提供模拟数据结构
    const mockRecords: AnalysisRecord[] = [
      {
        id: '1',
        type: 'bazi',
        createdAt: new Date().toISOString(),
        name: '测试用户',
        birth: '1990-01-01 08:00',
        creditsUsed: 10,
        result: {},
      },
      {
        id: '2',
        type: 'xuankong',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        address: '北京市朝阳区',
        facing: 180,
        creditsUsed: 20,
        result: {},
      },
    ];

    const filtered = type
      ? mockRecords.filter((r) => r.type === type)
      : mockRecords;

    return { ok: true, records: filtered };
  } catch (error) {
    console.error('Failed to get analysis history:', error);
    return { ok: false, error: 'Failed to fetch records', records: [] };
  }
}

/**
 * 保存分析记录到历史
 */
export async function saveAnalysisRecord(data: {
  type: 'bazi' | 'xuankong';
  input: any;
  result: any;
  creditsUsed: number;
}) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { ok: false, error: 'Unauthorized' };
    }

    // TODO: 保存到数据库
    // await prisma.analysisHistory.create({
    //   data: {
    //     userId: session.user.id,
    //     type: data.type,
    //     input: data.input,
    //     result: data.result,
    //     creditsUsed: data.creditsUsed,
    //   },
    // })

    revalidatePath('/analysis/history');
    return { ok: true, message: 'Record saved successfully' };
  } catch (error) {
    console.error('Failed to save analysis record:', error);
    return { ok: false, error: 'Failed to save record' };
  }
}

/**
 * 删除分析记录
 */
export async function deleteAnalysisRecord(id: string) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { ok: false, error: 'Unauthorized' };
    }

    // TODO: 从数据库删除
    // await prisma.analysisHistory.delete({
    //   where: {
    //     id,
    //     userId: session.user.id, // 确保只能删除自己的记录
    //   },
    // })

    revalidatePath('/analysis/history');
    return { ok: true, message: 'Record deleted successfully' };
  } catch (error) {
    console.error('Failed to delete analysis record:', error);
    return { ok: false, error: 'Failed to delete record' };
  }
}

/**
 * 获取单条分析记录详情
 */
export async function getAnalysisRecordById(id: string) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { ok: false, error: 'Unauthorized', record: null };
    }

    // TODO: 从数据库查询
    // const record = await prisma.analysisHistory.findUnique({
    //   where: {
    //     id,
    //     userId: session.user.id,
    //   },
    // })

    // 模拟数据
    const mockRecord: AnalysisRecord = {
      id,
      type: 'bazi',
      createdAt: new Date().toISOString(),
      name: '测试用户',
      birth: '1990-01-01 08:00',
      creditsUsed: 10,
      result: {
        pillars: {
          year: { heavenly: '庚', earthly: '午' },
          month: { heavenly: '戊', earthly: '寅' },
          day: { heavenly: '甲', earthly: '子' },
          hour: { heavenly: '丙', earthly: '辰' },
        },
      },
    };

    return { ok: true, record: mockRecord };
  } catch (error) {
    console.error('Failed to get analysis record:', error);
    return { ok: false, error: 'Failed to fetch record', record: null };
  }
}
