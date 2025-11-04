/**
 * 八字分析服务
 * 封装与后端API的交互
 */

import type {
  BaziAnalysisRequest,
  BaziAnalysisResponse,
} from '@/lib/bazi-pro/types';

export class BaziAnalysisService {
  private static instance: BaziAnalysisService;
  private readonly apiEndpoint = '/api/bazi/analyze';

  private constructor() {}

  public static getInstance(): BaziAnalysisService {
    if (!BaziAnalysisService.instance) {
      BaziAnalysisService.instance = new BaziAnalysisService();
    }
    return BaziAnalysisService.instance;
  }

  /**
   * 分析八字
   */
  async analyze(request: BaziAnalysisRequest): Promise<BaziAnalysisResponse> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '分析失败');
      }

      const result = await response.json();
      return result as BaziAnalysisResponse;
    } catch (error) {
      console.error('八字分析错误:', error);
      throw error;
    }
  }

  /**
   * 验证输入数据
   */
  validateInput(data: Partial<BaziAnalysisRequest>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.birthDate) {
      errors.push('请选择出生日期');
    } else if (!this.isValidDate(data.birthDate)) {
      errors.push('出生日期格式不正确');
    }

    if (!data.birthTime) {
      errors.push('请选择出生时间');
    } else if (!this.isValidTime(data.birthTime)) {
      errors.push('出生时间格式不正确');
    }

    if (!data.gender) {
      errors.push('请选择性别');
    }

    if (data.longitude === undefined || data.longitude === null) {
      errors.push('请选择出生地点');
    } else if (data.longitude < -180 || data.longitude > 180) {
      errors.push('经度无效');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 格式化日期
   */
  formatDate(date: Date | string): string {
    if (typeof date === 'string') {
      return date;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 格式化时间
   */
  formatTime(time: Date | string): string {
    if (typeof time === 'string') {
      return time;
    }
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * 验证日期格式
   */
  private isValidDate(date: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) {
      return false;
    }
    const d = new Date(date);
    return d instanceof Date && !Number.isNaN(d.getTime());
  }

  /**
   * 验证时间格式
   */
  private isValidTime(time: string): boolean {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(time);
  }

  /**
   * 计算积分需求
   */
  calculateCreditsRequired(
    depth: 'basic' | 'standard' | 'comprehensive'
  ): number {
    const credits = {
      basic: 5,
      standard: 10,
      comprehensive: 30,
    };
    return credits[depth];
  }

  /**
   * 保存分析历史到本地
   */
  saveToHistory(
    request: BaziAnalysisRequest,
    response: BaziAnalysisResponse
  ): void {
    try {
      const history = this.getHistory();
      const entry = {
        id: Date.now().toString(),
        request,
        response,
        timestamp: new Date().toISOString(),
      };

      history.unshift(entry);

      // 只保留最近20条记录
      if (history.length > 20) {
        history.splice(20);
      }

      localStorage.setItem('bazi_analysis_history', JSON.stringify(history));
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  }

  /**
   * 获取分析历史
   */
  getHistory(): any[] {
    try {
      const data = localStorage.getItem('bazi_analysis_history');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('读取历史记录失败:', error);
      return [];
    }
  }

  /**
   * 清空历史记录
   */
  clearHistory(): void {
    localStorage.removeItem('bazi_analysis_history');
  }

  /**
   * 导出分析报告
   */
  async exportReport(
    data: BaziAnalysisResponse['data'],
    format: 'pdf' | 'image' = 'pdf'
  ): Promise<Blob> {
    // 这里可以实现PDF或图片导出功能
    // 暂时返回一个模拟的Blob
    return new Blob(['分析报告内容'], { type: 'application/pdf' });
  }

  /**
   * 分享分析结果
   */
  async shareResult(data: BaziAnalysisResponse['data']): Promise<string> {
    // 生成分享链接
    // 这里可以调用后端API生成临时分享链接
    return `${window.location.origin}/share/bazi/${Date.now()}`;
  }

  /**
   * 根据时辰获取时间范围
   */
  getTimeRangeByShichen(shichen: string): string {
    const shichenMap: Record<string, string> = {
      子时: '23:00-01:00',
      丑时: '01:00-03:00',
      寅时: '03:00-05:00',
      卯时: '05:00-07:00',
      辰时: '07:00-09:00',
      巳时: '09:00-11:00',
      午时: '11:00-13:00',
      未时: '13:00-15:00',
      申时: '15:00-17:00',
      酉时: '17:00-19:00',
      戌时: '19:00-21:00',
      亥时: '21:00-23:00',
    };
    return shichenMap[shichen] || '';
  }

  /**
   * 根据时间获取时辰
   */
  getShichenByTime(time: string): string {
    const [hour] = time.split(':').map(Number);

    if (hour >= 23 || hour < 1) return '子时';
    if (hour >= 1 && hour < 3) return '丑时';
    if (hour >= 3 && hour < 5) return '寅时';
    if (hour >= 5 && hour < 7) return '卯时';
    if (hour >= 7 && hour < 9) return '辰时';
    if (hour >= 9 && hour < 11) return '巳时';
    if (hour >= 11 && hour < 13) return '午时';
    if (hour >= 13 && hour < 15) return '未时';
    if (hour >= 15 && hour < 17) return '申时';
    if (hour >= 17 && hour < 19) return '酉时';
    if (hour >= 19 && hour < 21) return '戌时';
    if (hour >= 21 && hour < 23) return '亥时';

    return '未知';
  }
}
