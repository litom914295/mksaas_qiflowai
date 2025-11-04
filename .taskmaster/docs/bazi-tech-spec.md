# 八字命理模块技术规范
版本：v2.0.0
日期：2025-01-11

## 一、核心算法实现规范

### 1.1 四柱计算核心算法

```typescript
/**
 * 专业级四柱八字计算器
 * 基于天文历法的精确算法实现
 */
export class ProfessionalBaziCalculator {
  private readonly EPOCH_JIAZI = new Date('1984-02-04T23:29:00'); // 甲子年起始
  private solarTermsCache: Map<string, Date>;
  
  /**
   * 计算四柱八字
   * @param birthDate 出生日期时间
   * @param longitude 经度（用于真太阳时）
   * @param isLunar 是否为农历
   */
  public calculateFourPillars(
    birthDate: Date,
    longitude: number,
    isLunar: boolean = false
  ): FourPillars {
    // Step 1: 转换为真太阳时
    const trueSolarTime = this.calculateTrueSolarTime(birthDate, longitude);
    
    // Step 2: 如果是农历，转换为阳历
    const solarDate = isLunar 
      ? this.lunarToSolar(birthDate) 
      : trueSolarTime;
    
    // Step 3: 计算年柱（立春为界）
    const yearPillar = this.calculateYearPillar(solarDate);
    
    // Step 4: 计算月柱（节气为界）
    const monthPillar = this.calculateMonthPillar(solarDate, yearPillar);
    
    // Step 5: 计算日柱（使用蔡勒公式）
    const dayPillar = this.calculateDayPillar(solarDate);
    
    // Step 6: 计算时柱（考虑早晚子时）
    const hourPillar = this.calculateHourPillar(solarDate, dayPillar);
    
    return {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar
    };
  }
  
  /**
   * 计算真太阳时
   */
  private calculateTrueSolarTime(date: Date, longitude: number): Date {
    // 1. 计算地方平太阳时
    const localMeanTime = new Date(date);
    const longitudeCorrection = (longitude - 120) * 4; // 每度4分钟
    localMeanTime.setMinutes(localMeanTime.getMinutes() + longitudeCorrection);
    
    // 2. 计算时差（equation of time）
    const dayOfYear = this.getDayOfYear(date);
    const B = 2 * Math.PI * (dayOfYear - 81) / 364;
    const E = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
    
    // 3. 应用时差修正
    const trueSolarTime = new Date(localMeanTime);
    trueSolarTime.setMinutes(trueSolarTime.getMinutes() + E);
    
    return trueSolarTime;
  }
  
  /**
   * 精确计算年柱（考虑立春时刻）
   */
  private calculateYearPillar(date: Date): Pillar {
    const year = date.getFullYear();
    const lichunDate = this.getSolarTermDate(year, '立春');
    
    // 判断是否过立春
    const effectiveYear = date >= lichunDate ? year : year - 1;
    
    // 计算天干地支
    const heavenlyStem = this.HEAVENLY_STEMS[(effectiveYear - 4) % 10];
    const earthlyBranch = this.EARTHLY_BRANCHES[(effectiveYear - 4) % 12];
    
    return {
      stem: heavenlyStem,
      branch: earthlyBranch,
      nayin: this.getNaYin(heavenlyStem, earthlyBranch)
    };
  }
  
  /**
   * 获取节气精确时刻
   */
  private getSolarTermDate(year: number, term: string): Date {
    // 使用VSOP87算法计算，精度可达秒级
    // 这里使用预计算的节气表
    const cacheKey = `${year}-${term}`;
    if (this.solarTermsCache.has(cacheKey)) {
      return this.solarTermsCache.get(cacheKey)!;
    }
    
    // 计算节气时刻（简化版，实际应使用天文算法）
    const termDate = this.calculateSolarTermByVSOP87(year, term);
    this.solarTermsCache.set(cacheKey, termDate);
    
    return termDate;
  }
}
```

### 1.2 五行力量精确计算

```typescript
/**
 * 五行力量分析器
 * 采用量化评分系统
 */
export class WuxingStrengthAnalyzer {
  // 月令旺相休囚死系数
  private readonly MONTHLY_COEFFICIENTS = {
    旺: 1.5,  // 当令
    相: 1.2,  // 生我
    休: 1.0,  // 我生
    囚: 0.7,  // 克我
    死: 0.5   // 我克
  };
  
  // 地支藏干强度
  private readonly HIDDEN_STEM_STRENGTH = {
    本气: 1.0,
    中气: 0.6,
    余气: 0.3
  };
  
  /**
   * 计算五行综合力量
   */
  public calculateWuxingStrength(
    fourPillars: FourPillars,
    birthMonth: number
  ): WuxingStrength {
    const strength = {
      wood: 0,
      fire: 0,
      earth: 0,
      metal: 0,
      water: 0
    };
    
    // 1. 天干基础分值（各占10分）
    this.calculateStemStrength(fourPillars, strength);
    
    // 2. 地支藏干分值（考虑本中余气）
    this.calculateHiddenStemStrength(fourPillars, strength);
    
    // 3. 月令调节系数
    this.applyMonthlyCoefficients(strength, birthMonth);
    
    // 4. 通根加成
    this.calculateRootingBonus(fourPillars, strength);
    
    // 5. 透干加成
    this.calculateRevealingBonus(fourPillars, strength);
    
    // 6. 合化影响
    this.applyTransformations(fourPillars, strength);
    
    // 归一化到100分制
    return this.normalizeStrength(strength);
  }
  
  /**
   * 计算通根力量
   */
  private calculateRootingBonus(
    fourPillars: FourPillars,
    strength: WuxingStrength
  ): void {
    // 日主在地支有根的加成计算
    const dayMaster = fourPillars.day.stem;
    const dayMasterElement = this.getElement(dayMaster);
    
    // 检查四个地支中的通根情况
    const branches = [
      fourPillars.year.branch,
      fourPillars.month.branch,
      fourPillars.day.branch,
      fourPillars.hour.branch
    ];
    
    let rootingScore = 0;
    for (const branch of branches) {
      const hiddenStems = this.getHiddenStems(branch);
      for (const hidden of hiddenStems) {
        if (this.getElement(hidden.stem) === dayMasterElement) {
          rootingScore += hidden.strength * 5; // 通根加5分
        }
      }
    }
    
    strength[dayMasterElement] += rootingScore;
  }
}
```

### 1.3 智能用神判定系统

```typescript
/**
 * 专业用神分析系统
 * 多维度智能判定
 */
export class YongshenAnalyzer {
  /**
   * 综合判定用神
   */
  public analyzeYongshen(
    fourPillars: FourPillars,
    wuxingStrength: WuxingStrength,
    birthSeason: Season
  ): YongshenResult {
    // 1. 计算日主强弱
    const dayMasterStrength = this.calculateDayMasterStrength(
      fourPillars,
      wuxingStrength
    );
    
    // 2. 判定用神类型
    const yongshenType = this.determineYongshenType(
      dayMasterStrength,
      fourPillars
    );
    
    // 3. 根据不同类型选择用神
    let primaryYongshen: Element[];
    let secondaryYongshen: Element[];
    
    switch (yongshenType) {
      case 'FUYI': // 扶抑用神
        ({ primary: primaryYongshen, secondary: secondaryYongshen } = 
          this.selectFuyiYongshen(dayMasterStrength, wuxingStrength));
        break;
        
      case 'TIAOHOU': // 调候用神
        ({ primary: primaryYongshen, secondary: secondaryYongshen } = 
          this.selectTiaohouYongshen(birthSeason, fourPillars));
        break;
        
      case 'TONGGUAN': // 通关用神
        ({ primary: primaryYongshen, secondary: secondaryYongshen } = 
          this.selectTongguanYongshen(wuxingStrength));
        break;
        
      case 'BINGYAO': // 病药用神
        ({ primary: primaryYongshen, secondary: secondaryYongshen } = 
          this.selectBingyaoYongshen(fourPillars, wuxingStrength));
        break;
        
      case 'CONGGE': // 从格用神
        ({ primary: primaryYongshen, secondary: secondaryYongshen } = 
          this.selectConggeYongshen(fourPillars, wuxingStrength));
        break;
    }
    
    return {
      type: yongshenType,
      primary: primaryYongshen,
      secondary: secondaryYongshen,
      strength: dayMasterStrength,
      explanation: this.generateExplanation(yongshenType, primaryYongshen)
    };
  }
  
  /**
   * 扶抑用神选择
   */
  private selectFuyiYongshen(
    dayMasterStrength: number,
    wuxingStrength: WuxingStrength
  ): { primary: Element[], secondary: Element[] } {
    const dayMasterElement = this.getDayMasterElement();
    
    if (dayMasterStrength < 40) {
      // 身弱，需要生扶
      return {
        primary: [
          this.getGeneratingElement(dayMasterElement), // 印星
          dayMasterElement // 比劫
        ],
        secondary: [this.getResourceElement(dayMasterElement)] // 食伤
      };
    } else if (dayMasterStrength > 60) {
      // 身强，需要克泄耗
      return {
        primary: [
          this.getControllingElement(dayMasterElement), // 官杀
          this.getGeneratedElement(dayMasterElement) // 食伤
        ],
        secondary: [this.getControlledElement(dayMasterElement)] // 财星
      };
    } else {
      // 中和，取调候或通关
      return this.selectBalancedYongshen(wuxingStrength);
    }
  }
}
```

## 二、数据结构定义

### 2.1 核心类型定义

```typescript
// 天干类型
export type HeavenlyStem = '甲' | '乙' | '丙' | '丁' | '戊' | 
                           '己' | '庚' | '辛' | '壬' | '癸';

// 地支类型
export type EarthlyBranch = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | 
                            '午' | '未' | '申' | '酉' | '戌' | '亥';

// 五行类型
export type Element = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

// 十神类型
export type TenGod = '比肩' | '劫财' | '食神' | '伤官' | '偏财' | 
                     '正财' | '七杀' | '正官' | '偏印' | '正印';

// 柱结构
export interface Pillar {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  nayin: string;           // 纳音
  tenGod?: TenGod;        // 十神
  hiddenStems: HiddenStem[]; // 藏干
}

// 藏干结构
export interface HiddenStem {
  stem: HeavenlyStem;
  type: '本气' | '中气' | '余气';
  strength: number;
}

// 四柱结构
export interface FourPillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
  
  // 附加信息
  dayMaster: HeavenlyStem;
  monthOrder: EarthlyBranch;
  
  // 空亡
  kongWang: EarthlyBranch[];
  
  // 旬首
  xunShou: string;
}

// 五行力量
export interface WuxingStrength {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
  
  // 详细分析
  details: {
    stems: Record<Element, number>;
    hiddenStems: Record<Element, number>;
    monthlyEffect: Record<Element, number>;
    rooting: Record<Element, number>;
    revealing: Record<Element, number>;
  };
}

// 用神分析结果
export interface YongshenResult {
  type: 'FUYI' | 'TIAOHOU' | 'TONGGUAN' | 'BINGYAO' | 'CONGGE';
  primary: Element[];
  secondary: Element[];
  avoid: Element[];
  strength: number;
  explanation: string;
  
  // 详细建议
  recommendations: {
    career: string[];
    wealth: string[];
    health: string[];
    relationship: string[];
  };
}

// 格局分析
export interface PatternAnalysis {
  mainPattern: {
    name: string;
    type: 'regular' | 'special' | 'follow';
    quality: 'superior' | 'good' | 'average' | 'inferior';
    score: number;
    description: string;
  };
  
  subPatterns: Array<{
    name: string;
    influence: number;
    description: string;
  }>;
  
  patternIntegrity: {
    established: boolean;
    broken: boolean;
    reasons: string[];
  };
}
```

### 2.2 高级分析结构

```typescript
// 大运结构
export interface Dayun {
  ordinal: number;          // 序号
  startAge: number;         // 起始年龄
  endAge: number;          // 结束年龄
  pillar: Pillar;          // 大运干支
  
  // 评分
  score: {
    overall: number;
    career: number;
    wealth: number;
    health: number;
    relationship: number;
  };
  
  // 作用关系
  interactions: {
    withBazi: Interaction[];
    favorable: boolean;
    keyEvents: string[];
  };
}

// 流年结构
export interface Liunian {
  year: number;
  age: number;
  pillar: Pillar;
  
  // 太岁作用
  taisuiEffect: {
    type: 'supportive' | 'neutral' | 'conflicting';
    strength: number;
    areas: string[];
  };
  
  // 与大运组合
  withDayun: {
    combination: string;
    effect: string;
    score: number;
  };
  
  // 月运详情
  monthlyFortune: Array<{
    month: number;
    fortune: number;
    events: string[];
  }>;
}

// 神煞系统
export interface Shensha {
  auspicious: Array<{
    name: string;
    location: 'year' | 'month' | 'day' | 'hour';
    influence: string;
    activation: string[];
  }>;
  
  inauspicious: Array<{
    name: string;
    location: 'year' | 'month' | 'day' | 'hour';
    influence: string;
    mitigation: string[];
  }>;
  
  peachBlossom: {
    hasRegular: boolean;
    hasHidden: boolean;
    quality: 'positive' | 'negative' | 'mixed';
    description: string;
  };
  
  nobility: Array<{
    type: string;
    location: string;
    benefit: string;
  }>;
}
```

## 三、API接口规范

### 3.1 RESTful API设计

```typescript
// API响应标准格式
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    timestamp: string;
    version: string;
    requestId: string;
  };
}

// 八字计算请求
interface BaziCalculateRequest {
  // 必填字段
  birthDate: string;        // ISO 8601格式
  birthTime: string;        // HH:mm格式
  gender: 'male' | 'female';
  
  // 可选字段
  timezone?: string;        // 默认 'Asia/Shanghai'
  longitude?: number;       // 经度，用于真太阳时
  latitude?: number;        // 纬度
  calendarType?: 'solar' | 'lunar';  // 默认 'solar'
  
  // 分析选项
  options?: {
    includeDayun?: boolean;      // 包含大运
    includeLiunian?: boolean;    // 包含流年
    includeShensha?: boolean;    // 包含神煞
    depth?: 'basic' | 'standard' | 'professional' | 'master';
    language?: 'zh-CN' | 'zh-TW' | 'en-US';
  };
}

// 八字计算响应
interface BaziCalculateResponse {
  // 基础信息
  requestId: string;
  calculatedAt: string;
  
  // 四柱数据
  fourPillars: FourPillars;
  
  // 五行分析
  wuxing: WuxingStrength;
  
  // 用神分析
  yongshen: YongshenResult;
  
  // 格局判定
  pattern: PatternAnalysis;
  
  // 十神分析
  tenGods: TenGodsAnalysis;
  
  // 大运（可选）
  dayun?: Dayun[];
  
  // 流年（可选）
  liunian?: Liunian[];
  
  // 神煞（可选）
  shensha?: Shensha;
  
  // AI解读
  interpretation: {
    summary: string;
    personality: string;
    career: string;
    wealth: string;
    relationship: string;
    health: string;
    suggestions: string[];
  };
  
  // 评分
  scores: {
    overall: number;
    accuracy: number;
    fortune: {
      current: number;
      trend: 'rising' | 'stable' | 'declining';
    };
  };
}
```

### 3.2 WebSocket实时分析

```typescript
// WebSocket消息协议
interface WsMessage {
  type: 'request' | 'response' | 'progress' | 'error';
  id: string;
  timestamp: string;
  payload: any;
}

// 实时分析进度
interface AnalysisProgress {
  stage: 'calculating' | 'analyzing' | 'interpreting' | 'complete';
  progress: number;  // 0-100
  message: string;
  partialResult?: any;
}

// WebSocket连接管理
class BaziWebSocketService {
  private ws: WebSocket;
  private reconnectAttempts = 0;
  
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket('wss://api.qiflow.ai/bazi/ws');
      
      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        resolve();
      };
      
      this.ws.onmessage = (event) => {
        const message: WsMessage = JSON.parse(event.data);
        this.handleMessage(message);
      };
      
      this.ws.onerror = (error) => {
        reject(error);
      };
      
      this.ws.onclose = () => {
        this.handleReconnect();
      };
    });
  }
  
  // 发送分析请求
  analyze(request: BaziCalculateRequest): void {
    const message: WsMessage = {
      type: 'request',
      id: generateUuid(),
      timestamp: new Date().toISOString(),
      payload: request
    };
    
    this.ws.send(JSON.stringify(message));
  }
}
```

## 四、性能优化策略

### 4.1 缓存机制

```typescript
// 多级缓存策略
class BaziCacheService {
  private memoryCache: Map<string, any> = new Map();
  private readonly CACHE_TTL = 3600000; // 1小时
  
  // 生成缓存键
  private generateKey(request: BaziCalculateRequest): string {
    const key = `${request.birthDate}_${request.birthTime}_${request.gender}_${request.longitude || 0}`;
    return crypto.createHash('md5').update(key).digest('hex');
  }
  
  // 获取缓存
  async get(request: BaziCalculateRequest): Promise<BaziCalculateResponse | null> {
    const key = this.generateKey(request);
    
    // 1. 内存缓存
    if (this.memoryCache.has(key)) {
      const cached = this.memoryCache.get(key);
      if (Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }
    }
    
    // 2. Redis缓存
    const redisValue = await redis.get(key);
    if (redisValue) {
      const data = JSON.parse(redisValue);
      this.memoryCache.set(key, { data, timestamp: Date.now() });
      return data;
    }
    
    return null;
  }
  
  // 设置缓存
  async set(request: BaziCalculateRequest, response: BaziCalculateResponse): Promise<void> {
    const key = this.generateKey(request);
    
    // 同时写入内存和Redis
    this.memoryCache.set(key, {
      data: response,
      timestamp: Date.now()
    });
    
    await redis.setex(key, 3600, JSON.stringify(response));
  }
}
```

### 4.2 并发优化

```typescript
// 并发计算管理
class ConcurrentCalculator {
  private readonly workerPool: Worker[] = [];
  private readonly MAX_WORKERS = 4;
  private taskQueue: Array<{
    id: string;
    task: any;
    resolve: Function;
    reject: Function;
  }> = [];
  
  constructor() {
    // 初始化Worker池
    for (let i = 0; i < this.MAX_WORKERS; i++) {
      const worker = new Worker('./bazi-calculator.worker.js');
      this.workerPool.push(worker);
    }
  }
  
  // 执行计算任务
  async calculate(request: BaziCalculateRequest): Promise<BaziCalculateResponse> {
    return new Promise((resolve, reject) => {
      const taskId = generateUuid();
      
      // 添加到任务队列
      this.taskQueue.push({
        id: taskId,
        task: request,
        resolve,
        reject
      });
      
      // 分配给空闲的Worker
      this.assignTask();
    });
  }
  
  // 任务分配
  private assignTask(): void {
    if (this.taskQueue.length === 0) return;
    
    const availableWorker = this.workerPool.find(w => !w.busy);
    if (!availableWorker) return;
    
    const task = this.taskQueue.shift()!;
    availableWorker.busy = true;
    
    availableWorker.postMessage({
      id: task.id,
      type: 'calculate',
      data: task.task
    });
    
    availableWorker.onmessage = (event) => {
      if (event.data.id === task.id) {
        availableWorker.busy = false;
        
        if (event.data.error) {
          task.reject(event.data.error);
        } else {
          task.resolve(event.data.result);
        }
        
        // 继续处理队列
        this.assignTask();
      }
    };
  }
}
```

## 五、测试规范

### 5.1 单元测试

```typescript
// 四柱计算测试
describe('FourPillars Calculation', () => {
  const calculator = new ProfessionalBaziCalculator();
  
  test('应正确计算标准案例', () => {
    const testCase = {
      birthDate: new Date('1990-05-15T14:30:00'),
      longitude: 116.4074,  // 北京
      expected: {
        year: { stem: '庚', branch: '午' },
        month: { stem: '辛', branch: '巳' },
        day: { stem: '丙', branch: '子' },
        hour: { stem: '乙', branch: '未' }
      }
    };
    
    const result = calculator.calculateFourPillars(
      testCase.birthDate,
      testCase.longitude
    );
    
    expect(result).toMatchObject(testCase.expected);
  });
  
  test('应正确处理闰月', () => {
    // 闰月测试案例
  });
  
  test('应正确计算真太阳时', () => {
    // 真太阳时测试
  });
  
  test('应正确处理子时跨日', () => {
    // 子时测试案例
  });
});

// 用神分析测试
describe('Yongshen Analysis', () => {
  const analyzer = new YongshenAnalyzer();
  
  test('身弱应取印比为用', () => {
    const weakCase = {
      dayMasterStrength: 35,
      wuxing: { wood: 10, fire: 15, earth: 30, metal: 25, water: 20 }
    };
    
    const result = analyzer.analyzeYongshen(weakCase);
    
    expect(result.primary).toContain('wood'); // 假设日主为木
    expect(result.primary).toContain('water'); // 水生木
  });
  
  test('身强应取官杀食伤为用', () => {
    // 身强测试案例
  });
});
```

### 5.2 集成测试

```typescript
// API集成测试
describe('Bazi API Integration', () => {
  test('完整分析流程应在3秒内完成', async () => {
    const request: BaziCalculateRequest = {
      birthDate: '1990-05-15',
      birthTime: '14:30',
      gender: 'male',
      longitude: 116.4074,
      options: {
        includeDayun: true,
        includeLiunian: true,
        depth: 'professional'
      }
    };
    
    const startTime = Date.now();
    const response = await api.post('/bazi/calculate', request);
    const endTime = Date.now();
    
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(endTime - startTime).toBeLessThan(3000);
  });
});
```

## 六、部署配置

### 6.1 环境变量

```env
# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/bazi_db

# Redis配置
REDIS_URL=redis://localhost:6379

# API配置
API_PORT=3000
API_VERSION=v2
API_RATE_LIMIT=100

# 天文历法数据源
EPHEMERIS_API_KEY=your_key_here
LUNAR_DATA_SOURCE=https://api.lunar.com

# AI引擎
OPENAI_API_KEY=your_openai_key
AI_MODEL=gpt-4-turbo-preview

# 监控
SENTRY_DSN=https://sentry.io/dsn
MONITORING_ENABLED=true
```

### 6.2 Docker配置

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制源码
COPY . .

# 编译TypeScript
RUN npm run build

# 设置环境变量
ENV NODE_ENV=production

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# 启动服务
CMD ["node", "dist/server.js"]
```

---
文档编号：TECH-SPEC-BAZI-2025-001
最后更新：2025-01-11