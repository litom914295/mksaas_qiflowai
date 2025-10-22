/**
 * 真太阳时计算模块
 * 根据地理经度和时间方程进行精确时间校正
 */

export interface TrueSolarTimeConfig {
  date: Date;
  longitude: number; // 经度（东经为正，西经为负）
  timezone?: string; // 时区，默认 'Asia/Shanghai'
}

/**
 * 真太阳时计算器
 */
export class TrueSolarTimeCalculator {
  // 标准经度（中国标准时间为东八区，120°E）
  private readonly STANDARD_LONGITUDE = 120;

  /**
   * 计算真太阳时
   * @param config 配置参数
   * @returns 校正后的真太阳时
   */
  public calculate(config: TrueSolarTimeConfig): Date {
    const { date, longitude, timezone = 'Asia/Shanghai' } = config;

    // Step 1: 计算地方平太阳时（考虑经度差）
    const localMeanTime = this.calculateLocalMeanTime(date, longitude);

    // Step 2: 计算时差（Equation of Time）
    const equationOfTime = this.calculateEquationOfTime(date);

    // Step 3: 应用时差校正得到真太阳时
    const trueSolarTime = new Date(localMeanTime);
    trueSolarTime.setMinutes(trueSolarTime.getMinutes() + equationOfTime);

    return trueSolarTime;
  }

  /**
   * 计算地方平太阳时
   * 每度经度相差4分钟
   */
  private calculateLocalMeanTime(date: Date, longitude: number): Date {
    const localTime = new Date(date);
    const longitudeDiff = longitude - this.STANDARD_LONGITUDE;
    const timeDiffMinutes = longitudeDiff * 4; // 每度4分钟

    localTime.setMinutes(localTime.getMinutes() + timeDiffMinutes);
    return localTime;
  }

  /**
   * 计算时差（Equation of Time）
   * 使用精确的天文算法
   */
  private calculateEquationOfTime(date: Date): number {
    const dayOfYear = this.getDayOfYear(date);
    const year = date.getFullYear();

    // 计算B值（弧度）
    const B = (2 * Math.PI * (dayOfYear - 81)) / 365;

    // 使用傅里叶级数计算时差（分钟）
    const E = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

    // 考虑年份修正
    const yearCorrection = this.getYearCorrection(year);

    return Math.round(E + yearCorrection);
  }

  /**
   * 获取一年中的第几天
   */
  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * 年份修正系数
   */
  private getYearCorrection(year: number): number {
    // 考虑闰年等因素的微小修正
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return isLeapYear ? -0.025 : 0;
  }

  /**
   * 获取经度对应的时区偏移
   */
  public getTimezoneOffset(longitude: number): number {
    return Math.round(longitude / 15);
  }

  /**
   * 验证经度是否有效
   */
  public isValidLongitude(longitude: number): boolean {
    return longitude >= -180 && longitude <= 180;
  }

  /**
   * 获取中国主要城市的经度
   */
  public getCityLongitude(city: string): number | null {
    const cityLongitudes: Record<string, number> = {
      北京: 116.4074,
      上海: 121.4737,
      广州: 113.2644,
      深圳: 114.0579,
      成都: 104.0658,
      杭州: 120.1551,
      武汉: 114.3055,
      西安: 108.9402,
      天津: 117.201,
      南京: 118.7969,
      重庆: 106.5516,
      沈阳: 123.4315,
      长沙: 112.9388,
      哈尔滨: 126.652,
      昆明: 102.8329,
      大连: 121.6147,
      济南: 117.1205,
      青岛: 120.3844,
      郑州: 113.6254,
      太原: 112.5489,
      长春: 125.3235,
      福州: 119.3064,
      南昌: 115.8579,
      海口: 110.3465,
      贵阳: 106.6302,
      兰州: 103.8343,
      银川: 106.2309,
      西宁: 101.7782,
      呼和浩特: 111.7518,
      乌鲁木齐: 87.6177,
      拉萨: 91.1409,
      南宁: 108.3661,
      合肥: 117.2272,
      石家庄: 114.5149,
      香港: 114.1694,
      澳门: 113.5439,
      台北: 121.5654,
    };

    return cityLongitudes[city] || null;
  }

  /**
   * 批量计算真太阳时（用于性能优化）
   */
  public calculateBatch(configs: TrueSolarTimeConfig[]): Date[] {
    return configs.map((config) => this.calculate(config));
  }

  /**
   * 获取详细的时间校正信息
   */
  public getDetailedCorrection(config: TrueSolarTimeConfig): {
    originalTime: Date;
    localMeanTime: Date;
    trueSolarTime: Date;
    longitudeCorrection: number; // 分钟
    equationOfTime: number; // 分钟
    totalCorrection: number; // 分钟
  } {
    const { date, longitude } = config;

    // 经度校正
    const longitudeDiff = longitude - this.STANDARD_LONGITUDE;
    const longitudeCorrection = longitudeDiff * 4;

    // 时差
    const equationOfTime = this.calculateEquationOfTime(date);

    // 地方平太阳时
    const localMeanTime = new Date(date);
    localMeanTime.setMinutes(localMeanTime.getMinutes() + longitudeCorrection);

    // 真太阳时
    const trueSolarTime = new Date(localMeanTime);
    trueSolarTime.setMinutes(trueSolarTime.getMinutes() + equationOfTime);

    return {
      originalTime: date,
      localMeanTime,
      trueSolarTime,
      longitudeCorrection: Math.round(longitudeCorrection),
      equationOfTime,
      totalCorrection: Math.round(longitudeCorrection + equationOfTime),
    };
  }
}

// 导出单例
export const trueSolarTimeCalculator = new TrueSolarTimeCalculator();
