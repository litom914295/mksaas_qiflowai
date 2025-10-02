# 技术文档：风水罗盘集成实现方案

## 1. 系统架构概述

### 整体架构设计

```mermaid
graph TB
    subgraph "前端展示层"
        A[React组件] --> B[罗盘引擎]
        B --> C[传感器融合]
        C --> D[设备API]
    end

    subgraph "业务服务层"
        E[API网关] --> F[罗盘服务]
        F --> G[AI分析引擎]
        F --> H[风水计算引擎]
    end

    subgraph "数据存储层"
        I[Supabase数据库] --> J[测量数据]
        I --> K[校准记录]
        I --> L[用户档案]
    end

    A --> E
    F --> I
    G --> M[OpenAI/Claude]
    H --> N[玄空飞星引擎]
```

### 组件目录结构

```
src/
├── components/
│   └── compass/
│       ├── FengShuiCompass.tsx           # 主罗盘组件
│       ├── CompassLayer.tsx              # 罗盘层级渲染
│       ├── CompassControls.tsx           # 用户控制组件
│       ├── SensorCalibration.tsx         # 传感器校准界面
│       └── CompassAnalysis.tsx           # AI分析结果展示
├── lib/
│   ├── compass/
│   │   ├── sensor-fusion.ts              # 传感器数据融合
│   │   ├── magnetic-declination.ts       # 磁偏角计算
│   │   └── compass-calculations.ts       # 罗盘核心算法
│   └── integrations/
│       └── feng-shui-compass.ts          # 风水罗盘集成层
└── types/
    └── feng-shui-compass.ts              # TypeScript类型定义
```

## 2. Vue到React迁移策略

### 并行开发策略（技术评审优化）

基于技术评审建议，采用并行开发策略降低迁移风险：

#### 第一阶段：分析与准备（第1-2周）

**双版本并行方案：**
- **保留Vue版本**：作为稳定备用方案继续运行
- **开发React版本**：与Vue版本并行开发，确保功能等价
- **A/B测试准备**：建立双版本切换机制

**组件等价性验证：**
| Vue组件 | React等价组件 | 等价性测试 | 迁移复杂度 | 风险评估 |
|---------|---------------|-----------|------------|----------|
| `FengShuiCompass.vue` | `FengShuiCompass.tsx` | 算法一致性测试 | 高 - 核心逻辑 | 高风险 |
| `CompassLayer.vue` | `CompassLayer.tsx` | 视觉回归测试 | 中 - 渲染逻辑 | 中风险 |
| `SensorManager.js` | `useSensorFusion.ts` | 数据精度测试 | 高 - Hook转换 | 高风险 |
| `CompassData.js` | `compass-data.ts` | 单元测试覆盖 | 低 - 数据结构 | 低风险 |

**性能基准建立：**
```typescript
interface PerformanceBenchmark {
  vue: {
    renderTime: number;      // Vue版本渲染时间
    memoryUsage: number;     // 内存使用量
    bundleSize: number;      // 打包体积
    sensorLatency: number;   // 传感器响应延迟
  };
  react: {
    renderTime: number;      // React版本渲染时间
    memoryUsage: number;     // 内存使用量
    bundleSize: number;      // 打包体积
    sensorLatency: number;   // 传感器响应延迟
  };
  acceptanceCriteria: {
    maxRenderTimeDelta: 50;  // 最大渲染时间差异(ms)
    maxMemoryIncrease: 20;   // 最大内存增长百分比
    maxBundleSizeIncrease: 15; // 最大打包体积增长百分比
    maxLatencyIncrease: 10;  // 最大延迟增长百分比
  };
}

class MigrationValidator {
  async validateEquivalence(
    vueComponent: VueComponentInstance,
    reactComponent: ReactComponentInstance
  ): Promise<EquivalenceReport> {
    const tests = [
      this.validateRenderOutput(vueComponent, reactComponent),
      this.validateEventHandling(vueComponent, reactComponent),
      this.validateStateManagement(vueComponent, reactComponent),
      this.validatePerformance(vueComponent, reactComponent)
    ];

    const results = await Promise.all(tests);
    return this.generateEquivalenceReport(results);
  }

  private async validateRenderOutput(
    vue: VueComponentInstance,
    react: ReactComponentInstance
  ): Promise<RenderEquivalenceResult> {
    // 像素级别的视觉回归测试
    const vueSnapshot = await this.captureComponentSnapshot(vue);
    const reactSnapshot = await this.captureComponentSnapshot(react);

    const pixelDifference = this.compareSnapshots(vueSnapshot, reactSnapshot);

    return {
      passed: pixelDifference < 0.1, // 允许0.1%的像素差异
      pixelDifference,
      details: {
        vueSnapshot,
        reactSnapshot,
        diffImage: this.generateDiffImage(vueSnapshot, reactSnapshot)
      }
    };
  }
}
```

**模板到JSX转换：**
```typescript
// Vue模板语法
<template>
  <div class="compass-container" :style="{ transform: `rotate(${rotation}deg)` }">
    <svg :width="size" :height="size">
      <g v-for="(layer, index) in layers" :key="index">
        <!-- 层级渲染 -->
      </g>
    </svg>
  </div>
</template>

// React JSX语法
const FengShuiCompass: React.FC<FengShuiCompassProps> = ({ size, rotation, layers }) => {
  return (
    <div className="compass-container" style={{ transform: `rotate(${rotation}deg)` }}>
      <svg width={size} height={size}>
        {layers.map((layer, index) => (
          <CompassLayer key={index} layer={layer} />
        ))}
      </svg>
    </div>
  );
};
```

**Composition API到Hooks转换：**
```typescript
// Vue Composition API
export default defineComponent({
  setup() {
    const rotation = ref(0);
    const isCalibrating = ref(false);

    const handleSensorData = (data: SensorData) => {
      rotation.value = data.heading;
    };

    return { rotation, isCalibrating, handleSensorData };
  }
});

// React Hooks
export const useFengShuiCompass = () => {
  const [rotation, setRotation] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);

  const handleSensorData = useCallback((data: SensorData) => {
    setRotation(data.heading);
  }, []);

  return { rotation, isCalibrating, handleSensorData };
};
```

### 第二阶段：渐进式迁移验证（第3-6周）

**回滚机制设计：**
```typescript
interface RollbackStrategy {
  checkpoints: {
    beforeMigration: string;     // 迁移前检查点
    afterCoreComponents: string; // 核心组件迁移后
    beforeDeployment: string;    // 部署前检查点
  };
  triggers: {
    performanceDegradation: boolean; // 性能下降触发器
    criticalErrorRate: number;       // 严重错误率阈值
    userFeedbackScore: number;       // 用户反馈评分阈值
  };
  rollbackProcedure: {
    automaticRollback: boolean;      // 自动回滚
    manualApprovalRequired: boolean; // 需要手动确认
    rollbackTimeLimit: number;       // 回滚时间限制(分钟)
  };
}

class MigrationManager {
  private rollbackStrategy: RollbackStrategy;
  private currentCheckpoint: string;

  async executeMigrationPhase(
    phase: MigrationPhase,
    validationCriteria: ValidationCriteria
  ): Promise<MigrationResult> {
    // 创建检查点
    const checkpoint = await this.createCheckpoint(phase.name);
    this.currentCheckpoint = checkpoint;

    try {
      // 执行迁移步骤
      const result = await this.executeMigrationSteps(phase.steps);

      // 验证结果
      const validation = await this.validateMigrationResult(
        result,
        validationCriteria
      );

      if (!validation.passed) {
        throw new MigrationValidationError(
          `验证失败: ${validation.errors.join(', ')}`
        );
      }

      return { success: true, checkpoint, validation };

    } catch (error) {
      // 检查是否需要回滚
      if (this.shouldRollback(error)) {
        await this.executeRollback(checkpoint);
        throw new MigrationRollbackError(
          `迁移失败，已回滚到检查点: ${checkpoint}`
        );
      }

      throw error;
    }
  }

  private shouldRollback(error: Error): boolean {
    // 根据错误类型和级别决定是否回滚
    if (error instanceof CriticalMigrationError) {
      return true;
    }

    if (error instanceof PerformanceDegradationError) {
      return error.degradationPercent > this.rollbackStrategy.triggers.performanceDegradation;
    }

    return false;
  }
}
```

**组件迁移验证矩阵：**
```typescript
interface ComponentValidationMatrix {
  functional: {
    inputHandling: boolean;      // 输入处理一致性
    outputRendering: boolean;    // 输出渲染一致性
    eventPropagation: boolean;   // 事件传播一致性
    stateManagement: boolean;    // 状态管理一致性
  };
  performance: {
    renderTime: number;          // 渲染时间对比
    memoryUsage: number;         // 内存使用对比
    bundleSize: number;          // 打包大小对比
    cpuUsage: number;            // CPU使用率对比
  };
  accessibility: {
    keyboardNavigation: boolean; // 键盘导航
    screenReader: boolean;       // 屏幕阅读器兼容
    colorContrast: boolean;      // 颜色对比度
    focusManagement: boolean;    // 焦点管理
  };
  crossBrowser: {
    chrome: boolean;             // Chrome兼容性
    firefox: boolean;            // Firefox兼容性
    safari: boolean;             // Safari兼容性
    edge: boolean;               // Edge兼容性
  };
  mobile: {
    ios: boolean;                // iOS兼容性
    android: boolean;            // Android兼容性
    responsive: boolean;         // 响应式设计
    touchGestures: boolean;      // 触摸手势
  };
}
```

**状态管理集成：**
```typescript
// Zustand状态管理 - 罗盘状态
interface CompassStore {
  // 状态数据
  rotation: number;              // 旋转角度
  isCalibrated: boolean;        // 是否已校准
  sensorAvailable: boolean;     // 传感器可用性
  measurements: CompassMeasurement[];  // 测量记录

  // 操作方法
  setRotation: (rotation: number) => void;
  addMeasurement: (measurement: CompassMeasurement) => void;
  calibrateSensors: () => Promise<void>;
  reset: () => void;
}

export const useCompassStore = create<CompassStore>((set, get) => ({
  rotation: 0,
  isCalibrated: false,
  sensorAvailable: false,
  measurements: [],

  setRotation: (rotation) => set({ rotation }),
  addMeasurement: (measurement) =>
    set(state => ({ measurements: [...state.measurements, measurement] })),
  calibrateSensors: async () => {
    // 传感器校准逻辑
    set({ isCalibrated: true });
  },
  reset: () => set({ rotation: 0, measurements: [] })
}));
```

### 第三阶段：系统集成（第4周）

**Next.js App Router集成：**
```typescript
// app/compass/page.tsx
export default function CompassPage() {
  return (
    <Suspense fallback={<CompassSkeleton />}>
      <FengShuiCompass />
    </Suspense>
  );
}

// 客户端专用功能的动态导入
const FengShuiCompass = dynamic(
  () => import('@/components/compass/FengShuiCompass'),
  { ssr: false }  // 禁用服务端渲染
);
```

## 3. API接口设计

### RESTful API端点

```typescript
// API路由: /api/compass/measurements
interface CompassMeasurementRequest {
  latitude: number;           // 纬度
  longitude: number;          // 经度
  magneticHeading: number;    // 磁方位角
  trueHeading: number;        // 真方位角
  timestamp: string;          // 时间戳
  userId?: string;            // 用户ID（可选）
  sessionId: string;          // 会话ID
}

interface CompassMeasurementResponse {
  id: string;                 // 测量记录ID
  measurement: CompassMeasurement;
  analysis: FengShuiAnalysis; // 风水分析结果
  confidence: number;         // 置信度评分
}

// API路由: /api/compass/calibration
interface CalibrationRequest {
  deviceId: string;           // 设备标识
  sensorData: SensorReading[]; // 传感器数据
  calibrationMethod: 'figure8' | 'manual' | 'automatic'; // 校准方法
}

interface CalibrationResponse {
  calibrationId: string;      // 校准记录ID
  success: boolean;           // 校准是否成功
  accuracy: number;           // 精度评分
  recommendations: string[];  // 改进建议
}
```

### WebSocket实时事件

```typescript
// 实时罗盘更新事件
interface CompassSocketEvents {
  'compass:heading_update': {
    heading: number;          // 方位角度
    accuracy: number;         // 精度值
    timestamp: number;        // 时间戳
  };

  'compass:calibration_status': {
    status: 'in_progress' | 'completed' | 'failed';
    progress: number;         // 进度百分比
    instructions: string;     // 操作指导
  };

  'compass:analysis_result': {
    measurementId: string;    // 测量ID
    analysis: FengShuiAnalysis;
    recommendations: Recommendation[];
  };
}
```

### TypeScript接口定义

```typescript
interface FengShuiCompassConfig {
  size: number;                    // 罗盘尺寸
  layers: CompassLayer[];          // 罗盘层级
  theme: CompassTheme;             // 主题样式
  sensorConfig: SensorConfig;      // 传感器配置
  permissions: CompassPermissions; // 权限设置
}

interface CompassLayer {
  id: string;                      // 层级ID
  name: string | string[];         // 层级名称
  data: string[] | string[][];     // 数据内容
  startAngle: number;              // 起始角度
  fontSize: number;                // 字体大小
  textColor: string | string[];    // 文字颜色
  vertical: boolean;               // 垂直排列
  togetherStyle: 'empty' | 'equally'; // 排列方式
  shape: 'circle' | 'polygon';     // 形状类型
  visible: boolean;                // 可见性
}

interface SensorConfig {
  enableMagnetometer: boolean;     // 启用磁力计
  enableGyroscope: boolean;        // 启用陀螺仪
  enableAccelerometer: boolean;    // 启用加速度计
  fusionAlgorithm: 'kalman' | 'complementary' | 'simple'; // 融合算法
  updateFrequency: number;         // 更新频率（Hz）
}

interface CompassMeasurement {
  id: string;                      // 测量ID
  userId?: string;                 // 用户ID
  sessionId: string;               // 会话ID
  timestamp: Date;                 // 测量时间
  location: GeoLocation;           // 地理位置
  magneticHeading: number;         // 磁方位角
  trueHeading: number;             // 真方位角
  declination: number;             // 磁偏角
  accuracy: number;                // 精度评分
  deviceInfo: DeviceInfo;          // 设备信息
  metadata: Record<string, any>;   // 扩展元数据
}
```

## 4. 数据库设计

### PostgreSQL表结构

```sql
-- 罗盘测量数据表（时序优化）
CREATE TABLE compass_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    session_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- 位置数据（加密存储）
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    altitude DECIMAL(8, 2),
    location_accuracy DECIMAL(6, 2),

    -- 罗盘读数
    magnetic_heading DECIMAL(5, 2) NOT NULL CHECK (magnetic_heading >= 0 AND magnetic_heading < 360),
    true_heading DECIMAL(5, 2) NOT NULL CHECK (true_heading >= 0 AND true_heading < 360),
    magnetic_declination DECIMAL(5, 2) NOT NULL,
    reading_accuracy DECIMAL(4, 2),

    -- 设备信息
    device_type TEXT,
    device_model TEXT,
    user_agent TEXT,
    sensor_capabilities JSONB,

    -- 风水分析
    flying_stars_period INTEGER CHECK (flying_stars_period BETWEEN 1 AND 9),
    sector_analysis JSONB,
    ai_analysis_id UUID,

    -- 元数据
    notes TEXT,
    tags TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 传感器校准数据表
CREATE TABLE compass_calibrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    device_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- 校准方法和结果
    calibration_method TEXT NOT NULL CHECK (calibration_method IN ('figure8', 'manual', 'automatic')),
    calibration_data JSONB NOT NULL,
    accuracy_score DECIMAL(4, 2) CHECK (accuracy_score BETWEEN 0 AND 100),

    -- 验证数据
    validation_measurements JSONB,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),

    -- 质量指标
    hard_iron_offset JSONB,        -- 硬铁偏移
    soft_iron_matrix JSONB,        -- 软铁矩阵
    noise_level DECIMAL(6, 4)      -- 噪声水平
);

-- 房屋朝向数据表（风水分析用）
CREATE TABLE house_orientations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- 房屋标识
    house_name TEXT,
    address TEXT,
    coordinates POINT,              -- PostGIS扩展

    -- 朝向数据
    front_door_heading DECIMAL(5, 2) NOT NULL,
    building_facing DECIMAL(5, 2) NOT NULL,
    magnetic_declination DECIMAL(5, 2) NOT NULL,
    measurement_date TIMESTAMPTZ NOT NULL,

    -- 风水计算
    sitting_mountain TEXT,          -- 坐山
    facing_direction TEXT,          -- 朝向
    flying_stars_chart JSONB,       -- 飞星盘
    bazi_compatibility JSONB,       -- 八字兼容性

    -- 分析结果
    ai_analysis JSONB,
    recommendations JSONB,
    analysis_confidence DECIMAL(3, 2),

    -- 元数据
    floor_plan_url TEXT,
    photos TEXT[],
    notes TEXT,
    is_verified BOOLEAN DEFAULT false
);
```

### 性能优化索引

```sql
-- 时序查询索引
CREATE INDEX idx_compass_measurements_created_at
ON compass_measurements (created_at DESC);

-- 用户相关查询索引
CREATE INDEX idx_compass_measurements_user_session
ON compass_measurements (user_id, session_id, created_at DESC);

-- 位置查询索引（PostGIS）
CREATE INDEX idx_house_orientations_location
ON house_orientations USING GIST (coordinates);

-- 分析查找索引
CREATE INDEX idx_compass_measurements_analysis
ON compass_measurements (ai_analysis_id)
WHERE ai_analysis_id IS NOT NULL;

-- 设备校准索引
CREATE INDEX idx_compass_calibrations_device
ON compass_calibrations (device_id, is_active, expires_at);
```

### 行级安全策略（RLS）

```sql
-- 启用行级安全
ALTER TABLE compass_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE compass_calibrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE house_orientations ENABLE ROW LEVEL SECURITY;

-- 用户访问策略
CREATE POLICY "用户可查看自己的罗盘测量数据"
ON compass_measurements FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "用户可插入自己的罗盘测量数据"
ON compass_measurements FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 访客匿名测量策略
CREATE POLICY "允许匿名测量数据"
ON compass_measurements FOR ALL
USING (user_id IS NULL);

-- 校准数据策略
CREATE POLICY "用户可管理自己的校准数据"
ON compass_calibrations FOR ALL
USING (auth.uid() = user_id);
```

## 5. 传感器集成

### 精度目标分阶段实现策略

基于技术评审建议，传感器融合算法采用三阶段渐进式优化：

#### 第一阶段：基础卡尔曼滤波实现 (目标精度：±5°)
- **实施时间**：1-2周
- **核心算法**：标准卡尔曼滤波
- **传感器要求**：磁力计 + 加速度计
- **设备兼容性**：95%以上移动设备

#### 第二阶段：增强传感器校准算法 (目标精度：±3°)
- **实施时间**：3-4周
- **核心算法**：改进卡尔曼滤波 + 多点校准
- **传感器要求**：磁力计 + 加速度计 + 陀螺仪
- **设备兼容性**：80%以上中高端设备

#### 第三阶段：多传感器深度融合 (目标精度：±2°)
- **实施时间**：5-8周
- **核心算法**：扩展卡尔曼滤波 + AI辅助校准
- **传感器要求**：完整传感器套件 + GPS辅助
- **设备兼容性**：60%以上高端设备

### 设备兼容性分层架构

```typescript
interface DeviceCompatibilityStrategy {
  highPrecision: {
    sensors: ['magnetometer', 'gyroscope', 'accelerometer', 'GPS'];
    algorithms: ['extended_kalman', 'complementary', 'madgwick'];
    targetAccuracy: '±2°';
    deviceSupport: '60%+';
  };
  standard: {
    sensors: ['magnetometer', 'accelerometer'];
    algorithms: ['kalman', 'complementary'];
    targetAccuracy: '±3°';
    deviceSupport: '80%+';
  };
  fallback: {
    sensors: ['magnetometer'];
    algorithms: ['simple_average'];
    targetAccuracy: '±5°';
    deviceSupport: '95%+';
  };
}

class AdaptiveSensorFusionEngine {
  private currentStrategy: keyof DeviceCompatibilityStrategy;
  private magnetometer: MagnetometerReading | null = null;
  private gyroscope: GyroscopeReading | null = null;
  private accelerometer: AccelerometerReading | null = null;

  private kalmanFilter: KalmanFilter;
  private complementaryFilter: ComplementaryFilter;
  private extendedKalmanFilter: ExtendedKalmanFilter;

  constructor(config: SensorConfig) {
    // 自动检测设备能力并选择最优策略
    this.currentStrategy = this.detectOptimalStrategy();

    this.initializeFilters(config);
  }

  private detectOptimalStrategy(): keyof DeviceCompatibilityStrategy {
    const availableSensors = this.detectAvailableSensors();
    const devicePerformance = this.assessDevicePerformance();

    if (availableSensors.length >= 4 && devicePerformance === 'high') {
      return 'highPrecision';
    } else if (availableSensors.length >= 2 && devicePerformance >= 'medium') {
      return 'standard';
    }
    return 'fallback';
  }

  private initializeFilters(config: SensorConfig) {
    // 基础卡尔曼滤波器（第一阶段）
    this.kalmanFilter = new KalmanFilter({
      processNoise: config.processNoise || 0.1,
      measurementNoise: config.measurementNoise || 0.5,
      initialState: config.initialHeading || 0
    });

    // 互补滤波器（第二阶段）
    this.complementaryFilter = new ComplementaryFilter({
      alpha: config.filterAlpha || 0.98,
      beta: config.filterBeta || 0.02
    });

    // 扩展卡尔曼滤波器（第三阶段）
    if (this.currentStrategy === 'highPrecision') {
      this.extendedKalmanFilter = new ExtendedKalmanFilter({
        stateTransitionModel: config.stateTransitionModel,
        observationModel: config.observationModel,
        processNoiseCovariance: config.processNoiseCovariance,
        observationNoiseCovariance: config.observationNoiseCovariance
      });
    }
  }

  updateSensorData(type: SensorType, data: SensorReading): void {
    switch (type) {
      case 'magnetometer':
        this.magnetometer = data as MagnetometerReading;
        break;
      case 'gyroscope':
        this.gyroscope = data as GyroscopeReading;
        break;
      case 'accelerometer':
        this.accelerometer = data as AccelerometerReading;
        break;
    }

    this.processFusedHeading();
  }

  private processFusedHeading(): void {
    if (!this.magnetometer || !this.accelerometer) return;

    // 计算倾斜补偿航向
    const tiltCompensatedHeading = this.calculateTiltCompensation(
      this.magnetometer,
      this.accelerometer
    );

    // 应用传感器融合
    const fusedHeading = this.kalmanFilter.update(
      tiltCompensatedHeading,
      this.gyroscope?.z || 0
    );

    this.onHeadingUpdate?.(fusedHeading);
  }

  private calculateTiltCompensation(
    mag: MagnetometerReading,
    accel: AccelerometerReading
  ): number {
    // 标准化加速度计数据
    const norm = Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2);
    const ax = accel.x / norm;
    const ay = accel.y / norm;
    const az = accel.z / norm;

    // 计算横滚角和俯仰角
    const roll = Math.atan2(ay, az);
    const pitch = Math.atan2(-ax, Math.sqrt(ay ** 2 + az ** 2));

    // 磁力计倾斜补偿
    const magX = mag.x * Math.cos(pitch) + mag.z * Math.sin(pitch);
    const magY = mag.x * Math.sin(roll) * Math.sin(pitch) +
                 mag.y * Math.cos(roll) -
                 mag.z * Math.sin(roll) * Math.cos(pitch);

    // 计算航向角
    let heading = Math.atan2(-magY, magX) * (180 / Math.PI);
    if (heading < 0) heading += 360;

    return heading;
  }
}
```

### 传感器抽象层设计

基于技术评审建议，设计统一的传感器抽象层，屏蔽不同平台的API差异：

```typescript
// 传感器抽象接口
interface SensorAbstraction {
  // 基础传感器接口
  magnetometer: MagnetometerSensor;
  accelerometer: AccelerometerSensor;
  gyroscope: GyroscopeSensor;
  gps: GPSSensor;

  // 统一初始化方法
  initialize(config: SensorConfig): Promise<void>;

  // 统一权限管理
  requestPermissions(): Promise<PermissionStatus>;

  // 统一生命周期管理
  start(): void;
  stop(): void;
  cleanup(): void;

  // 统一错误处理
  onError(handler: ErrorHandler): void;

  // 统一数据流
  onDataUpdate(handler: SensorDataHandler): void;
}

// 多平台适配器
class UniversalSensorAdapter implements SensorAbstraction {
  private platform: Platform;
  private sensors: Map<SensorType, BaseSensor> = new Map();
  private errorHandlers: ErrorHandler[] = [];
  private dataHandlers: SensorDataHandler[] = [];

  constructor() {
    this.platform = this.detectPlatform();
  }

  async initialize(config: SensorConfig): Promise<void> {
    try {
      // 根据平台初始化不同的传感器实现
      switch (this.platform) {
        case 'web-modern':
          await this.initializeWebSensorsAPI(config);
          break;
        case 'web-legacy':
          await this.initializeDeviceOrientationAPI(config);
          break;
        case 'cordova':
          await this.initializeCordovaPlugins(config);
          break;
        case 'capacitor':
          await this.initializeCapacitorPlugins(config);
          break;
        default:
          throw new Error(`不支持的平台: ${this.platform}`);
      }
    } catch (error) {
      this.notifyError(new SensorInitializationError(
        `传感器初始化失败: ${error.message}`
      ));
      throw error;
    }
  }

  private async initializeWebSensorsAPI(config: SensorConfig): Promise<void> {
    // 现代浏览器 Web Sensors API
    if ('Magnetometer' in window) {
      this.sensors.set('magnetometer', new WebMagnetometerAdapter(config));
    }
    if ('Accelerometer' in window) {
      this.sensors.set('accelerometer', new WebAccelerometerAdapter(config));
    }
    if ('Gyroscope' in window) {
      this.sensors.set('gyroscope', new WebGyroscopeAdapter(config));
    }
  }

  private async initializeDeviceOrientationAPI(config: SensorConfig): Promise<void> {
    // 传统 Device Orientation API
    this.sensors.set('magnetometer', new DeviceOrientationMagnetometerAdapter(config));
    this.sensors.set('accelerometer', new DeviceMotionAccelerometerAdapter(config));
    this.sensors.set('gyroscope', new DeviceMotionGyroscopeAdapter(config));
  }

  async requestPermissions(): Promise<PermissionStatus> {
    const permissions: PermissionResult[] = [];

    for (const [type, sensor] of this.sensors) {
      try {
        const permission = await sensor.requestPermission();
        permissions.push({ sensor: type, status: permission });
      } catch (error) {
        permissions.push({
          sensor: type,
          status: 'denied',
          error: error.message
        });
      }
    }

    return this.aggregatePermissions(permissions);
  }

  onError(handler: ErrorHandler): void {
    this.errorHandlers.push(handler);
  }

  private notifyError(error: SensorError): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('错误处理器异常:', handlerError);
      }
    });
  }
}
```

### 增强校准算法设计

针对技术评审建议，增强校准算法并增加多种校准方式：

```typescript
class EnhancedCompassCalibrator {
  private calibrationData: CalibrationPoint[] = [];
  private calibrationMethod: CalibrationMethod;
  private realTimeCalibration: boolean = false;

  constructor(method: CalibrationMethod = 'enhanced_figure8') {
    this.calibrationMethod = method;
  }

  startCalibration(): void {
    this.calibrationData = [];

    switch (this.calibrationMethod) {
      case 'enhanced_figure8':
        this.startEnhancedFigure8Calibration();
        break;
      case 'multi_point':
        this.startMultiPointCalibration();
        break;
      case 'real_time':
        this.startRealTimeCalibration();
        break;
      case 'adaptive':
        this.startAdaptiveCalibration();
        break;
      default:
        this.startBasicFigure8Calibration();
    }
  }

  private startEnhancedFigure8Calibration(): void {
    // 增强垈8字校准，结合机器学习优化
    const requiredMotions = 24; // 增加采样点
    const qualityThreshold = 0.9; // 提高质量阈值

    let collectedPoints = 0;
    let qualityScore = 0;

    const collectCalibrationPoint = (sensorData: MagnetometerReading) => {
      const point: CalibrationPoint = {
        x: sensorData.x,
        y: sensorData.y,
        z: sensorData.z,
        timestamp: Date.now(),
        quality: this.assessPointQuality(sensorData)
      };

      // 只保留高质量采样点
      if (point.quality > 0.7) {
        this.calibrationData.push(point);
        collectedPoints++;
        qualityScore = this.calculateOverallQuality();
      }

      // 提供实时反馈
      this.onCalibrationProgress?.({
        progress: (collectedPoints / requiredMotions) * 100,
        quality: qualityScore,
        instructions: this.generateInstructions(collectedPoints, qualityScore)
      });

      if (collectedPoints >= requiredMotions && qualityScore >= qualityThreshold) {
        this.processEnhancedCalibrationData();
      }
    };

    this.onCalibrationInstruction?.('请将设备保持水平，按增强8字形缓慢移动');
  }

  private startMultiPointCalibration(): void {
    // 24点校准法，对应风水罗盘的24山
    const compassDirections = [
      0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165,
      180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345
    ];

    let currentDirectionIndex = 0;
    const calibrationPoints: Map<number, CalibrationPoint[]> = new Map();

    const collectDirectionalPoint = (direction: number, sensorData: MagnetometerReading) => {
      if (!calibrationPoints.has(direction)) {
        calibrationPoints.set(direction, []);
      }

      const points = calibrationPoints.get(direction)!;
      points.push({
        x: sensorData.x,
        y: sensorData.y,
        z: sensorData.z,
        timestamp: Date.now(),
        direction,
        quality: this.assessDirectionalQuality(sensorData, direction)
      });

      // 每个方向采集5个点取平均值
      if (points.length >= 5) {
        currentDirectionIndex++;
        if (currentDirectionIndex < compassDirections.length) {
          const nextDirection = compassDirections[currentDirectionIndex];
          this.onCalibrationInstruction?.(
            `请将罗盘对准 ${nextDirection}° 方向（${this.getDirectionName(nextDirection)}）`
          );
        } else {
          this.processMultiPointCalibrationData(calibrationPoints);
        }
      }
    };

    // 开始第一个方向的校准
    const firstDirection = compassDirections[0];
    this.onCalibrationInstruction?.(
      `请将罗盘对准 ${firstDirection}° 方向（${this.getDirectionName(firstDirection)}）`
    );
  }

  private startRealTimeCalibration(): void {
    // 实时校准，在使用过程中持续优化
    this.realTimeCalibration = true;

    const adaptiveFilter = new AdaptiveKalmanFilter({
      adaptationRate: 0.01,
      qualityThreshold: 0.8,
      convergenceThreshold: 0.95
    });

    const continuousCalibration = (sensorData: MagnetometerReading) => {
      if (!this.realTimeCalibration) return;

      // 评估当前测量质量
      const quality = this.assessRealTimeQuality(sensorData);

      if (quality > 0.8) {
        // 高质量数据，用于实时校准
        adaptiveFilter.updateCalibration(sensorData);

        // 更新校准参数
        const updatedCalibration = adaptiveFilter.getCurrentCalibration();
        this.applyRealTimeCalibration(updatedCalibration);
      }

      // 每10秒评估一次校准状态
      if (Date.now() % 10000 < 100) {
        const calibrationQuality = adaptiveFilter.getCalibrationQuality();
        this.onCalibrationStatusUpdate?.({
          quality: calibrationQuality,
          stability: adaptiveFilter.getStability(),
          recommendation: this.generateRealTimeRecommendation(calibrationQuality)
        });
      }
    };

    this.onCalibrationInstruction?.('实时校准已启动，请正常使用罗盘');
  }
}
```

```typescript
// 传感器数据管理Hook
export const useSensorFusion = (config: SensorConfig) => {
  const [heading, setHeading] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [isCalibrated, setIsCalibrated] = useState<boolean>(false);

  const fusionEngine = useRef<SensorFusionEngine>();

  useEffect(() => {
    fusionEngine.current = new SensorFusionEngine({
      ...config,
      onHeadingUpdate: (newHeading) => {
        setHeading(newHeading);
        setAccuracy(fusionEngine.current?.getAccuracy() || 0);
      }
    });

    return () => {
      fusionEngine.current?.cleanup();
    };
  }, [config]);

  const requestSensorPermissions = async (): Promise<boolean> => {
    try {
      // 请求DeviceOrientationEvent权限（iOS 13+）
      if (typeof DeviceOrientationEvent !== 'undefined' &&
          'requestPermission' in DeviceOrientationEvent) {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission !== 'granted') return false;
      }

      // 检查传感器可用性
      const sensors = await navigator.permissions.query({ name: 'magnetometer' as PermissionName });
      return sensors.state === 'granted';
    } catch (error) {
      console.warn('传感器权限请求失败:', error);
      return false;
    }
  };

  const startSensorReading = async (): Promise<void> => {
    const hasPermission = await requestSensorPermissions();
    if (!hasPermission) {
      throw new Error('传感器权限未授予');
    }

    // 启动磁力计
    if ('Magnetometer' in window) {
      const magnetometer = new (window as any).Magnetometer({ frequency: config.updateFrequency });
      magnetometer.addEventListener('reading', () => {
        fusionEngine.current?.updateSensorData('magnetometer', {
          x: magnetometer.x,
          y: magnetometer.y,
          z: magnetometer.z,
          timestamp: Date.now()
        });
      });
      magnetometer.start();
    }

    // 回退到DeviceOrientationEvent
    else if (typeof DeviceOrientationEvent !== 'undefined') {
      window.addEventListener('deviceorientation', (event) => {
        if (event.alpha !== null) {
          const heading = 360 - event.alpha;
          setHeading(heading);
        }
      });
    }
  };

  return {
    heading,
    accuracy,
    isCalibrated,
    requestSensorPermissions,
    startSensorReading,
    calibrate: () => fusionEngine.current?.startCalibration()
  };
};
```

### 校准算法实现

```typescript
class CompassCalibrator {
  private calibrationData: CalibrationPoint[] = [];
  private calibrationMethod: CalibrationMethod;

  constructor(method: CalibrationMethod = 'figure8') {
    this.calibrationMethod = method;
  }

  startCalibration(): void {
    this.calibrationData = [];

    switch (this.calibrationMethod) {
      case 'figure8':
        this.startFigure8Calibration();  // 8字校准
        break;
      case 'manual':
        this.startManualCalibration();   // 手动校准
        break;
      case 'automatic':
        this.startAutomaticCalibration(); // 自动校准
        break;
    }
  }

  private startFigure8Calibration(): void {
    // 磁力计8字校准，用于硬铁/软铁误差修正
    const requiredMotions = 16; // 需要的不同方向数量
    let collectedPoints = 0;

    const collectCalibrationPoint = (sensorData: MagnetometerReading) => {
      this.calibrationData.push({
        x: sensorData.x,
        y: sensorData.y,
        z: sensorData.z,
        timestamp: Date.now()
      });

      collectedPoints++;

      if (collectedPoints >= requiredMotions) {
        this.processCalibrationData();
      }
    };

    // 提供用户指导
    this.onCalibrationInstruction?.('请将设备保持水平，按8字形移动');
  }

  private processCalibrationData(): void {
    if (this.calibrationData.length < 8) {
      throw new Error('校准数据不足');
    }

    // 计算硬铁偏移（偏置）
    const hardIronOffset = this.calculateHardIronOffset();

    // 计算软铁矩阵（缩放和旋转）
    const softIronMatrix = this.calculateSoftIronMatrix();

    // 验证校准质量
    const quality = this.validateCalibration(hardIronOffset, softIronMatrix);

    if (quality.score < 0.8) {
      this.onCalibrationFailed?.('校准质量过低，请重新校准');
      return;
    }

    // 保存校准参数
    this.saveCalibrationData({
      hardIronOffset,
      softIronMatrix,
      quality,
      method: this.calibrationMethod,
      timestamp: Date.now()
    });

    this.onCalibrationComplete?.(quality);
  }

  private calculateHardIronOffset(): Vector3D {
    // 计算校准数据形成椭球体的中心点
    const sumX = this.calibrationData.reduce((sum, point) => sum + point.x, 0);
    const sumY = this.calibrationData.reduce((sum, point) => sum + point.y, 0);
    const sumZ = this.calibrationData.reduce((sum, point) => sum + point.z, 0);

    const count = this.calibrationData.length;

    return {
      x: sumX / count,
      y: sumY / count,
      z: sumZ / count
    };
  }

  private calculateSoftIronMatrix(): Matrix3x3 {
    // 椭球体拟合的简化实现，用于软铁修正
    // 生产环境中应使用更精确的最小二乘法算法
    const correctedData = this.calibrationData.map(point => ({
      x: point.x - this.hardIronOffset.x,
      y: point.y - this.hardIronOffset.y,
      z: point.z - this.hardIronOffset.z
    }));

    // 计算各轴的缩放因子
    const xScale = this.calculateAxisScale(correctedData.map(p => p.x));
    const yScale = this.calculateAxisScale(correctedData.map(p => p.y));
    const zScale = this.calculateAxisScale(correctedData.map(p => p.z));

    return [
      [xScale, 0, 0],
      [0, yScale, 0],
      [0, 0, zScale]
    ];
  }
}
```

## 6. 安全设计

### 认证与授权

```typescript
// 基于角色的访问控制
interface CompassPermissions {
  canMeasure: boolean;              // 可以测量
  canSave: boolean;                 // 可以保存
  canExport: boolean;               // 可以导出
  canAccessHistory: boolean;        // 可以访问历史
  canUseProfessionalFeatures: boolean; // 可以使用专业功能
  maxMeasurementsPerDay: number;    // 每日最大测量次数
  canAccessAIAnalysis: boolean;     // 可以访问AI分析
}

const getCompassPermissions = (userRole: UserRole): CompassPermissions => {
  switch (userRole) {
    case 'guest':         // 访客用户
      return {
        canMeasure: true,
        canSave: false,
        canExport: false,
        canAccessHistory: false,
        canUseProfessionalFeatures: false,
        maxMeasurementsPerDay: 10,
        canAccessAIAnalysis: true
      };

    case 'user':          // 普通用户
      return {
        canMeasure: true,
        canSave: true,
        canExport: true,
        canAccessHistory: true,
        canUseProfessionalFeatures: false,
        maxMeasurementsPerDay: 100,
        canAccessAIAnalysis: true
      };

    case 'premium':       // 高级用户
      return {
        canMeasure: true,
        canSave: true,
        canExport: true,
        canAccessHistory: true,
        canUseProfessionalFeatures: true,
        maxMeasurementsPerDay: 1000,
        canAccessAIAnalysis: true
      };

    case 'professional':  // 专业用户
      return {
        canMeasure: true,
        canSave: true,
        canExport: true,
        canAccessHistory: true,
        canUseProfessionalFeatures: true,
        maxMeasurementsPerDay: -1, // 无限制
        canAccessAIAnalysis: true
      };
  }
};
```

### 数据加密

```typescript
// 位置数据加密
class LocationEncryption {
  private static readonly ALGORITHM = 'AES-256-GCM';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;

  static async encrypt(
    locationData: { latitude: number; longitude: number },
    userKey: string
  ): Promise<EncryptedLocation> {
    const data = JSON.stringify(locationData);
    const key = await this.deriveKey(userKey);
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

    const algorithm = { name: 'AES-GCM', iv };
    const encodedData = new TextEncoder().encode(data);

    const encryptedData = await crypto.subtle.encrypt(algorithm, key, encodedData);

    return {
      encryptedData: Array.from(new Uint8Array(encryptedData)),
      iv: Array.from(iv),
      algorithm: this.ALGORITHM
    };
  }

  static async decrypt(
    encryptedLocation: EncryptedLocation,
    userKey: string
  ): Promise<{ latitude: number; longitude: number }> {
    const key = await this.deriveKey(userKey);
    const iv = new Uint8Array(encryptedLocation.iv);
    const encryptedData = new Uint8Array(encryptedLocation.encryptedData);

    const algorithm = { name: 'AES-GCM', iv };
    const decryptedData = await crypto.subtle.decrypt(algorithm, key, encryptedData);

    const decodedData = new TextDecoder().decode(decryptedData);
    return JSON.parse(decodedData);
  }

  private static async deriveKey(userKey: string): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(userKey),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('compass-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
}
```

### 输入验证

```typescript
// 使用Zod进行API验证
import { z } from 'zod';

const CompassMeasurementSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  magneticHeading: z.number().min(0).max(360),
  trueHeading: z.number().min(0).max(360),
  accuracy: z.number().min(0).max(100),
  timestamp: z.string().datetime(),
  sessionId: z.string().uuid(),
  deviceInfo: z.object({
    userAgent: z.string(),
    platform: z.string(),
    sensors: z.array(z.string())
  }).optional()
});

// API路由验证
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = CompassMeasurementSchema.parse(body);

    // 检查用户权限
    const user = await getCurrentUser();
    const permissions = getCompassPermissions(user?.role || 'guest');

    if (!permissions.canMeasure) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    // 速率限制检查
    const dailyCount = await getDailyMeasurementCount(user?.id);
    if (permissions.maxMeasurementsPerDay > 0 &&
        dailyCount >= permissions.maxMeasurementsPerDay) {
      return NextResponse.json({ error: '已达每日限制' }, { status: 429 });
    }

    // 处理测量数据
    const measurement = await saveMeasurement(validatedData, user);
    return NextResponse.json({ success: true, measurement });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: '输入无效', details: error.errors }, { status: 400 });
    }

    console.error('罗盘API错误:', error);
    return NextResponse.json({ error: '内部服务器错误' }, { status: 500 });
  }
}
```

### 速率限制

```typescript
// 基于Redis的速率限制
class RateLimiter {
  private redis: RedisClient;

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  async checkLimit(
    identifier: string,        // 标识符（IP/用户ID）
    windowMs: number,          // 时间窗口（毫秒）
    maxRequests: number        // 最大请求数
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = `rate_limit:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    // 移除过期条目
    await this.redis.zremrangebyscore(key, 0, windowStart);

    // 统计当前请求数
    const currentCount = await this.redis.zcard(key);

    if (currentCount >= maxRequests) {
      const oldestEntry = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
      const resetTime = oldestEntry.length > 0 ?
        parseInt(oldestEntry[1]) + windowMs :
        now + windowMs;

      return {
        allowed: false,
        remaining: 0,
        resetTime
      };
    }

    // 添加当前请求
    await this.redis.zadd(key, now, `${now}-${Math.random()}`);
    await this.redis.expire(key, Math.ceil(windowMs / 1000));

    return {
      allowed: true,
      remaining: maxRequests - currentCount - 1,
      resetTime: now + windowMs
    };
  }
}

// 在API路由中使用
const rateLimiter = new RateLimiter(redisClient);

export async function POST(request: Request) {
  const clientIP = getClientIP(request);
  const { allowed, remaining, resetTime } = await rateLimiter.checkLimit(
    clientIP,
    60000,    // 1分钟窗口
    10        // 每分钟10次请求
  );

  if (!allowed) {
    return NextResponse.json(
      { error: '请求频率过高' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetTime.toString()
        }
      }
    );
  }

  // 处理请求...
}
```

## 7. 性能优化

### 前端性能优化

```typescript
// React.memo优化罗盘组件
const CompassLayer = React.memo<CompassLayerProps>(({ layer, rotation, size }) => {
  const layerElements = useMemo(() => {
    return layer.data.map((item, index) => {
      const angle = (360 / layer.data.length) * index + layer.startAngle;
      return (
        <CompassElement
          key={`${layer.id}-${index}`}
          text={item}
          angle={angle}
          radius={size * 0.8}
          style={layer.style}
        />
      );
    });
  }, [layer.data, layer.startAngle, layer.id, size, layer.style]);

  return (
    <g transform={`rotate(${rotation})`}>
      {layerElements}
    </g>
  );
});

// 防抖传感器更新
const useDebouncedSensor = (sensorData: SensorReading[], delay: number = 16) => {
  const [debouncedData, setDebouncedData] = useState(sensorData);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedData(sensorData);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [sensorData, delay]);

  return debouncedData;
};

// Web Worker处理重计算
// compass-worker.ts
self.onmessage = function(e) {
  const { type, data } = e.data;

  switch (type) {
    case 'CALCULATE_FLYING_STARS':
      const result = calculateFlyingStars(data);
      self.postMessage({ type: 'FLYING_STARS_RESULT', result });
      break;

    case 'PROCESS_SENSOR_FUSION':
      const fusedHeading = processSensorFusion(data);
      self.postMessage({ type: 'SENSOR_FUSION_RESULT', heading: fusedHeading });
      break;
  }
};

// Web Worker Hook
const useCompassWorker = () => {
  const workerRef = useRef<Worker>();

  useEffect(() => {
    workerRef.current = new Worker(new URL('./compass-worker.ts', import.meta.url));

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const calculateFlyingStars = useCallback((data: FlyingStarsInput) => {
    return new Promise((resolve) => {
      if (!workerRef.current) return;

      const handleMessage = (e: MessageEvent) => {
        if (e.data.type === 'FLYING_STARS_RESULT') {
          workerRef.current?.removeEventListener('message', handleMessage);
          resolve(e.data.result);
        }
      };

      workerRef.current.addEventListener('message', handleMessage);
      workerRef.current.postMessage({ type: 'CALCULATE_FLYING_STARS', data });
    });
  }, []);

  return { calculateFlyingStars };
};
```

### 智能渲染选择策略（技术评审优化）

基于技术评审建议，实现基于设备性能和精度需求的智能渲染选择：

```typescript
// 智能渲染策略引擎
class IntelligentRenderingEngine {
  private performanceProfile: DevicePerformanceProfile;
  private renderingStrategy: RenderingStrategy;
  private performanceMonitor: PerformanceMonitor;

  constructor() {
    this.performanceProfile = this.analyzeDevicePerformance();
    this.renderingStrategy = this.selectOptimalStrategy();
    this.performanceMonitor = new PerformanceMonitor();
  }

  private analyzeDevicePerformance(): DevicePerformanceProfile {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const memory = (navigator as any).deviceMemory || 4; // GB
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;
    const connection = (navigator as any).connection;

    // GPU性能检测
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const gpuInfo = gl ? {
      vendor: gl.getParameter(gl.VENDOR),
      renderer: gl.getParameter(gl.RENDERER),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE)
    } : null;

    // 性能评分计算
    let performanceScore = 0;
    performanceScore += Math.min(memory / 8, 1) * 30; // 内存权重30%
    performanceScore += Math.min(hardwareConcurrency / 8, 1) * 25; // CPU权重25%
    performanceScore += devicePixelRatio > 2 ? 20 : 10; // 高DPI屏幕权重20%
    performanceScore += gpuInfo && gpuInfo.maxTextureSize > 4096 ? 25 : 15; // GPU权重25%

    return {
      score: performanceScore,
      category: this.categorizePerformance(performanceScore),
      memory,
      cpu: hardwareConcurrency,
      gpu: gpuInfo,
      display: {
        pixelRatio: devicePixelRatio,
        width: window.screen.width,
        height: window.screen.height
      },
      network: connection ? {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink
      } : null
    };
  }

  private selectOptimalStrategy(): RenderingStrategy {
    const { score, category, display } = this.performanceProfile;
    const elementCount = this.estimateElementCount();
    const interactionRequirements = this.assessInteractionNeeds();

    // 决策矩阵
    const strategyMatrix = {
      // 高性能设备
      high: {
        lowComplexity: 'svg',      // 元素少，优先SVG
        mediumComplexity: 'svg',   // 中等元素，仍然SVG
        highComplexity: 'canvas'   // 元素多，Canvas更高效
      },
      // 中等性能设备
      medium: {
        lowComplexity: 'svg',      // 元素少，SVG更适合
        mediumComplexity: 'canvas', // 中等元素，选择Canvas
        highComplexity: 'canvas'   // 元素多，必须Canvas
      },
      // 低性能设备
      low: {
        lowComplexity: 'svg',      // 只有元素少才用SVG
        mediumComplexity: 'canvas', // 其他情况都用Canvas
        highComplexity: 'canvas'
      }
    };

    const complexity = this.getComplexityLevel(elementCount);
    let baseStrategy = strategyMatrix[category][complexity];

    // 特殊情况调整
    if (interactionRequirements.accessibility && baseStrategy === 'canvas') {
      baseStrategy = 'svg'; // 无障碍访问需求优先SVG
    }

    if (display.pixelRatio > 2.5 && elementCount > 100) {
      baseStrategy = 'canvas'; // 高DPI + 元素多必须Canvas
    }

    return {
      renderer: baseStrategy,
      optimization: this.getOptimizationLevel(category),
      features: this.getEnabledFeatures(category, baseStrategy)
    };
  }

  adaptiveRender(layers: CompassLayer[], size: number, rotation: number): React.ReactElement {
    // 实时性能监控
    const currentPerformance = this.performanceMonitor.getCurrentMetrics();

    // 动态调整策略
    if (this.shouldDowngrade(currentPerformance)) {
      this.renderingStrategy = this.downgradeStrategy(this.renderingStrategy);
    } else if (this.shouldUpgrade(currentPerformance)) {
      this.renderingStrategy = this.upgradeStrategy(this.renderingStrategy);
    }

    // 根据当前策略渲染
    switch (this.renderingStrategy.renderer) {
      case 'canvas':
        return this.renderWithCanvas(layers, size, rotation);
      case 'svg':
        return this.renderWithSVG(layers, size, rotation);
      case 'webgl':
        return this.renderWithWebGL(layers, size, rotation);
      default:
        return this.renderFallback(layers, size, rotation);
    }
  }

  private renderWithCanvas(
    layers: CompassLayer[],
    size: number,
    rotation: number
  ): React.ReactElement {
    return (
      <OptimizedCanvasCompass
        layers={layers}
        size={size}
        rotation={rotation}
        optimization={this.renderingStrategy.optimization}
        performanceHints={{
          useOffscreenCanvas: this.renderingStrategy.features.offscreenCanvas,
          enableImageBitmap: this.renderingStrategy.features.imageBitmap,
          useWebWorker: this.renderingStrategy.features.webWorker,
          batchDrawCalls: this.renderingStrategy.features.batchDrawing
        }}
        onPerformanceUpdate={(metrics) => {
          this.performanceMonitor.recordMetrics(metrics);
        }}
      />
    );
  }

  private renderWithSVG(
    layers: CompassLayer[],
    size: number,
    rotation: number
  ): React.ReactElement {
    return (
      <OptimizedSVGCompass
        layers={layers}
        size={size}
        rotation={rotation}
        optimization={this.renderingStrategy.optimization}
        performanceHints={{
          useCSSTransforms: this.renderingStrategy.features.cssTransforms,
          enableVirtualization: this.renderingStrategy.features.virtualization,
          lazyLoadElements: this.renderingStrategy.features.lazyLoading,
          optimizeText: this.renderingStrategy.features.textOptimization
        }}
        accessibilityFeatures={{
          enableAriaLabels: true,
          enableKeyboardNavigation: true,
          enableScreenReaderSupport: true
        }}
        onPerformanceUpdate={(metrics) => {
          this.performanceMonitor.recordMetrics(metrics);
        }}
      />
    );
  }
}

// Web Worker优化策略
class CompassWebWorkerManager {
  private workers: Map<string, Worker> = new Map();
  private taskQueue: ComputationTask[] = [];
  private isProcessing = false;

  constructor() {
    this.initializeWorkers();
  }

  private initializeWorkers(): void {
    // 飞星计算Worker
    const flyingStarsWorker = new Worker(
      new URL('./workers/flying-stars-worker.ts', import.meta.url)
    );
    this.workers.set('flyingStars', flyingStarsWorker);

    // 传感器融合Worker
    const sensorFusionWorker = new Worker(
      new URL('./workers/sensor-fusion-worker.ts', import.meta.url)
    );
    this.workers.set('sensorFusion', sensorFusionWorker);

    // 罗盘渲染计算Worker
    const renderingWorker = new Worker(
      new URL('./workers/compass-rendering-worker.ts', import.meta.url)
    );
    this.workers.set('rendering', renderingWorker);
  }

  async processTask<T>(
    workerType: string,
    taskData: any,
    priority: TaskPriority = 'normal'
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const task: ComputationTask = {
        id: this.generateTaskId(),
        type: workerType,
        data: taskData,
        priority,
        resolve,
        reject,
        timestamp: Date.now()
      };

      this.addToQueue(task);
      this.processQueue();
    });
  }

  private addToQueue(task: ComputationTask): void {
    // 按优先级排序
    const priorityOrder = { high: 3, normal: 2, low: 1 };

    const insertIndex = this.taskQueue.findIndex(
      existingTask => priorityOrder[task.priority] > priorityOrder[existingTask.priority]
    );

    if (insertIndex === -1) {
      this.taskQueue.push(task);
    } else {
      this.taskQueue.splice(insertIndex, 0, task);
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.taskQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift()!;
      const worker = this.workers.get(task.type);

      if (!worker) {
        task.reject(new Error(`Worker ${task.type} 不存在`));
        continue;
      }

      try {
        const result = await this.executeTask(worker, task);
        task.resolve(result);
      } catch (error) {
        task.reject(error);
      }
    }

    this.isProcessing = false;
  }

  private executeTask(worker: Worker, task: ComputationTask): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('任务执行超时'));
      }, 30000); // 30秒超时

      const handleMessage = (event: MessageEvent) => {
        if (event.data.taskId === task.id) {
          clearTimeout(timeout);
          worker.removeEventListener('message', handleMessage);

          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data.result);
          }
        }
      };

      worker.addEventListener('message', handleMessage);
      worker.postMessage({
        taskId: task.id,
        type: task.type,
        data: task.data
      });
    });
  }
}
```

```typescript
// 基于设备能力的自适应渲染器
const CompassRenderer = ({ layers, size, rotation, performance }: CompassRendererProps) => {
  const renderingStrategy = useMemo(() => {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const isHighDPI = devicePixelRatio > 1.5;
    const layerCount = layers.length;
    const elementCount = layers.reduce((sum, layer) => sum + layer.data.length, 0);

    // 使用Canvas的情况：
    // - 元素数量过多（>100个元素）
    // - 低端设备
    // - 高DPI显示器且元素较多
    if (elementCount > 100 || performance === 'low' || (isHighDPI && elementCount > 50)) {
      return 'canvas';
    }

    // 使用SVG的情况：
    // - 需要交互功能
    // - 无障碍访问要求
    // - 打印质量输出
    return 'svg';
  }, [layers, performance]);

  if (renderingStrategy === 'canvas') {
    return <CanvasCompass layers={layers} size={size} rotation={rotation} />;
  }

  return <SVGCompass layers={layers} size={size} rotation={rotation} />;
};

// Canvas实现（优化重绘）
const CanvasCompass = ({ layers, size, rotation }: CanvasCompassProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const draw = useCallback((ctx: CanvasRenderingContext2D, timestamp: number) => {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 保存上下文状态
    ctx.save();

    // 应用旋转
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // 绘制图层
    layers.forEach(layer => {
      drawLayer(ctx, layer, size, dpr);
    });

    // 恢复上下文状态
    ctx.restore();
  }, [layers, size, rotation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (timestamp: number) => {
      draw(ctx, timestamp);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={size * (window.devicePixelRatio || 1)}
      height={size * (window.devicePixelRatio || 1)}
      style={{ width: size, height: size }}
    />
  );
};
```

### 后端缓存策略

```typescript
// 多层缓存策略
interface CacheConfig {
  memory: {
    ttl: number;              // 内存缓存TTL
    maxSize: number;          // 最大缓存条目数
  };
  redis: {
    ttl: number;              // Redis缓存TTL
    keyPrefix: string;        // 键前缀
  };
  database: {
    cacheQueries: boolean;    // 查询缓存
    preparedStatements: boolean; // 预编译语句
  };
}

class CompassCacheManager {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private redis: RedisClient;
  private config: CacheConfig;

  constructor(redis: RedisClient, config: CacheConfig) {
    this.redis = redis;
    this.config = config;

    // 定期清理内存缓存
    setInterval(() => this.cleanupMemoryCache(), 60000);
  }

  async get<T>(key: string): Promise<T | null> {
    // 首先尝试内存缓存
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
      return memoryEntry.value as T;
    }

    // 尝试Redis缓存
    const redisKey = `${this.config.redis.keyPrefix}:${key}`;
    const redisValue = await this.redis.get(redisKey);
    if (redisValue) {
      const parsed = JSON.parse(redisValue) as T;

      // 存入内存缓存以便快速访问
      this.setMemoryCache(key, parsed);

      return parsed;
    }

    return null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    // 存入内存缓存
    this.setMemoryCache(key, value);

    // 存入Redis
    const redisKey = `${this.config.redis.keyPrefix}:${key}`;
    await this.redis.setex(
      redisKey,
      this.config.redis.ttl,
      JSON.stringify(value)
    );
  }

  private setMemoryCache<T>(key: string, value: T): void {
    // 如果缓存已满，移除最旧的条目
    if (this.memoryCache.size >= this.config.memory.maxSize) {
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
      }
    }

    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + this.config.memory.ttl
    });
  }

  private cleanupMemoryCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiresAt <= now) {
        this.memoryCache.delete(key);
      }
    }
  }
}

// 在API路由中使用
const cacheManager = new CompassCacheManager(redisClient, {
  memory: { ttl: 60000, maxSize: 1000 },
  redis: { ttl: 3600, keyPrefix: 'compass' },
  database: { cacheQueries: true, preparedStatements: true }
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  const cacheKey = `declination:${lat}:${lng}`;

  // 首先尝试缓存
  let declination = await cacheManager.get<number>(cacheKey);

  if (declination === null) {
    // 计算磁偏角
    declination = await calculateMagneticDeclination(
      parseFloat(lat!),
      parseFloat(lng!)
    );

    // 缓存结果
    await cacheManager.set(cacheKey, declination);
  }

  return NextResponse.json({ declination });
}
```

## 8. 测试策略

### 单元测试

```typescript
// Jest配置（罗盘组件）
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/components/compass/**/*.{ts,tsx}',
    'src/lib/compass/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

// 测试环境设置
// src/test/setup.ts
import '@testing-library/jest-dom';

// 模拟传感器API
Object.defineProperty(window, 'DeviceOrientationEvent', {
  value: class MockDeviceOrientationEvent extends Event {
    alpha = 0;
    beta = 0;
    gamma = 0;
    static requestPermission = jest.fn().mockResolvedValue('granted');
  }
});

Object.defineProperty(navigator, 'permissions', {
  value: {
    query: jest.fn().mockResolvedValue({ state: 'granted' })
  }
});

// 组件测试
describe('FengShuiCompass', () => {
  const mockLayers: CompassLayer[] = [
    {
      id: 'test-layer',
      name: '测试层',
      data: ['北', '东', '南', '西'],
      startAngle: 0,
      fontSize: 16,
      textColor: 'black',
      vertical: false,
      togetherStyle: 'empty',
      shape: 'circle',
      visible: true
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('正确渲染罗盘层级', () => {
    render(<FengShuiCompass layers={mockLayers} size={300} rotation={0} />);

    expect(screen.getByLabelText('风水罗盘')).toBeInTheDocument();
    expect(screen.getByText('北')).toBeInTheDocument();
    expect(screen.getByText('东')).toBeInTheDocument();
  });

  it('正确应用旋转', () => {
    const { rerender } = render(
      <FengShuiCompass layers={mockLayers} size={300} rotation={0} />
    );

    const compass = screen.getByLabelText('风水罗盘');
    expect(compass).toHaveStyle('transform: rotate(0deg)');

    rerender(<FengShuiCompass layers={mockLayers} size={300} rotation={90} />);
    expect(compass).toHaveStyle('transform: rotate(90deg)');
  });

  it('处理传感器权限请求', async () => {
    const mockRequestPermission = jest.fn().mockResolvedValue('granted');
    (DeviceOrientationEvent as any).requestPermission = mockRequestPermission;

    render(<FengShuiCompass layers={mockLayers} size={300} rotation={0} />);

    const enableSensorButton = screen.getByText('启用传感器');
    fireEvent.click(enableSensorButton);

    await waitFor(() => {
      expect(mockRequestPermission).toHaveBeenCalled();
    });
  });
});

// 算法测试
describe('传感器融合', () => {
  let fusionEngine: SensorFusionEngine;

  beforeEach(() => {
    fusionEngine = new SensorFusionEngine({
      processNoise: 0.1,
      measurementNoise: 0.5,
      initialHeading: 0
    });
  });

  it('正确处理磁力计数据', () => {
    const mockCallback = jest.fn();
    fusionEngine.onHeadingUpdate = mockCallback;

    fusionEngine.updateSensorData('magnetometer', {
      x: 0.5,
      y: 0.3,
      z: -0.8,
      timestamp: Date.now()
    });

    fusionEngine.updateSensorData('accelerometer', {
      x: 0,
      y: 0,
      z: 9.81,
      timestamp: Date.now()
    });

    expect(mockCallback).toHaveBeenCalledWith(expect.any(Number));
  });

  it('准确计算倾斜补偿', () => {
    const magnetometer = { x: 0.5, y: 0.3, z: -0.8, timestamp: Date.now() };
    const accelerometer = { x: 0, y: 0, z: 9.81, timestamp: Date.now() };

    const heading = fusionEngine.calculateTiltCompensation(magnetometer, accelerometer);

    expect(heading).toBeGreaterThanOrEqual(0);
    expect(heading).toBeLessThan(360);
  });
});

// 错误处理测试
describe('错误处理', () => {
  it('优雅处理传感器不可用', async () => {
    // 模拟传感器不可用
    Object.defineProperty(navigator, 'permissions', {
      value: {
        query: jest.fn().mockRejectedValue(new Error('传感器不可用'))
      }
    });

    const { result } = renderHook(() => useSensorFusion({
      enableMagnetometer: true,
      updateFrequency: 60
    }));

    await act(async () => {
      try {
        await result.current.startSensorReading();
      } catch (error) {
        expect(error.message).toContain('传感器权限未授予');
      }
    });
  });
});
```

### 集成测试

```typescript
// API集成测试
describe('罗盘API集成', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('POST /api/compass/measurements', () => {
    it('保存有效的罗盘测量数据', async () => {
      const measurement = {
        latitude: 40.7128,
        longitude: -74.0060,
        magneticHeading: 45.5,
        trueHeading: 47.3,
        accuracy: 0.8,
        timestamp: new Date().toISOString(),
        sessionId: uuid()
      };

      const response = await POST(
        new Request('http://localhost/api/compass/measurements', {
          method: 'POST',
          body: JSON.stringify(measurement),
          headers: { 'Content-Type': 'application/json' }
        })
      );

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.measurement.id).toBeDefined();
    });

    it('拒绝无效坐标', async () => {
      const invalidMeasurement = {
        latitude: 91, // 无效纬度
        longitude: -74.0060,
        magneticHeading: 45.5,
        trueHeading: 47.3,
        timestamp: new Date().toISOString(),
        sessionId: uuid()
      };

      const response = await POST(
        new Request('http://localhost/api/compass/measurements', {
          method: 'POST',
          body: JSON.stringify(invalidMeasurement),
          headers: { 'Content-Type': 'application/json' }
        })
      );

      expect(response.status).toBe(400);

      const result = await response.json();
      expect(result.error).toBe('输入无效');
    });

    it('执行速率限制', async () => {
      const measurement = {
        latitude: 40.7128,
        longitude: -74.0060,
        magneticHeading: 45.5,
        trueHeading: 47.3,
        timestamp: new Date().toISOString(),
        sessionId: uuid()
      };

      // 快速发出多个请求
      const requests = Array.from({ length: 15 }, () =>
        POST(new Request('http://localhost/api/compass/measurements', {
          method: 'POST',
          body: JSON.stringify(measurement),
          headers: { 'Content-Type': 'application/json' }
        }))
      );

      const responses = await Promise.all(requests);

      // 部分请求应被限流
      const rateLimited = responses.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('数据库操作', () => {
    it('正确存储和检索测量数据', async () => {
      const measurement: CompassMeasurement = {
        id: uuid(),
        sessionId: uuid(),
        timestamp: new Date(),
        latitude: 40.7128,
        longitude: -74.0060,
        magneticHeading: 45.5,
        trueHeading: 47.3,
        accuracy: 0.8,
        deviceInfo: {
          userAgent: 'test-agent',
          platform: 'test-platform',
          sensors: ['magnetometer', 'accelerometer']
        }
      };

      // 保存测量数据
      await saveMeasurement(measurement);

      // 检索测量数据
      const retrieved = await getMeasurement(measurement.id);

      expect(retrieved).toBeDefined();
      expect(retrieved.magneticHeading).toBe(45.5);
      expect(retrieved.trueHeading).toBe(47.3);
    });

    it('正确加密位置数据', async () => {
      const measurement = {
        latitude: 40.7128,
        longitude: -74.0060,
        // ... 其他字段
      };

      const userKey = 'test-encryption-key';

      // 加密保存
      const saved = await saveMeasurementWithEncryption(measurement, userKey);

      // 验证原始数据已加密
      const raw = await getRawMeasurementFromDB(saved.id);
      expect(raw.latitude).not.toBe(40.7128);
      expect(raw.longitude).not.toBe(-74.0060);

      // 验证解密正确
      const decrypted = await getMeasurementWithDecryption(saved.id, userKey);
      expect(decrypted.latitude).toBe(40.7128);
      expect(decrypted.longitude).toBe(-74.0060);
    });
  });
});
```

### 端到端测试

```typescript
// Playwright E2E测试
import { test, expect } from '@playwright/test';

test.describe('罗盘集成E2E测试', () => {
  test.beforeEach(async ({ page }) => {
    // 授予地理位置和传感器权限
    await page.context().grantPermissions(['geolocation']);

    // 模拟地理位置
    await page.addInitScript(() => {
      const mockGeolocation = {
        getCurrentPosition: (success: PositionCallback) => {
          success({
            coords: {
              latitude: 40.7128,
              longitude: -74.0060,
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null
            },
            timestamp: Date.now()
          });
        },
        watchPosition: (success: PositionCallback) => {
          success({
            coords: {
              latitude: 40.7128,
              longitude: -74.0060,
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null
            },
            timestamp: Date.now()
          });
          return 1;
        },
        clearWatch: () => {}
      };

      Object.defineProperty(navigator, 'geolocation', {
        value: mockGeolocation
      });
    });

    await page.goto('/compass');
  });

  test('用户可以访问罗盘页面', async ({ page }) => {
    await expect(page.locator('[data-testid="feng-shui-compass"]')).toBeVisible();
    await expect(page.locator('text=风水罗盘')).toBeVisible();
  });

  test('罗盘显示正确的层级', async ({ page }) => {
    // 等待罗盘加载
    await page.waitForLoadState('networkidle');

    // 检查24山层级
    await expect(page.locator('text=子')).toBeVisible();
    await expect(page.locator('text=午')).toBeVisible();

    // 检查八卦层级
    await expect(page.locator('text=坎')).toBeVisible();
    await expect(page.locator('text=离')).toBeVisible();
  });

  test('用户可以启用传感器模式', async ({ page }) => {
    // 模拟设备方向
    await page.addInitScript(() => {
      Object.defineProperty(window, 'DeviceOrientationEvent', {
        value: class extends Event {
          alpha = 45;
          beta = 0;
          gamma = 0;
          static requestPermission = () => Promise.resolve('granted');
        }
      });
    });

    await page.click('[data-testid="enable-sensor-button"]');

    // 应显示权限对话框
    await expect(page.locator('text=启用设备传感器')).toBeVisible();

    await page.click('[data-testid="grant-permission-button"]');

    // 罗盘应旋转到设备方向
    await page.waitForTimeout(1000);

    const compass = page.locator('[data-testid="compass-container"]');
    const transform = await compass.getAttribute('style');
    expect(transform).toContain('rotate');
  });

  test('用户可以保存测量数据', async ({ page }) => {
    // 首先登录
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    await page.goto('/compass');

    // 进行测量
    await page.click('[data-testid="take-measurement-button"]');

    // 添加备注
    await page.fill('[data-testid="measurement-notes"]', '测试测量');

    // 保存测量
    await page.click('[data-testid="save-measurement-button"]');

    // 应显示成功消息
    await expect(page.locator('text=测量数据保存成功')).toBeVisible();

    // 应出现在测量历史中
    await page.click('[data-testid="view-history-button"]');
    await expect(page.locator('text=测试测量')).toBeVisible();
  });

  test('访客用户看到使用限制', async ({ page }) => {
    // 应显示访客限制
    await expect(page.locator('text=访客模式')).toBeVisible();
    await expect(page.locator('text=限制测量次数')).toBeVisible();

    // 进行多次测量
    for (let i = 0; i < 12; i++) {
      await page.click('[data-testid="take-measurement-button"]');
      await page.waitForTimeout(100);
    }

    // 应显示限制达到消息
    await expect(page.locator('text=已达每日限制')).toBeVisible();
    await expect(page.locator('text=注册享受无限制')).toBeVisible();
  });

  test('罗盘分析集成工作正常', async ({ page }) => {
    // 模拟AI分析响应
    await page.route('**/api/ai/analyze', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          analysis: {
            flyingStars: {
              period: 9,
              sector: '坎',
              energy: 'favorable',
              recommendations: ['在北方放置水元素']
            },
            confidence: 0.87
          }
        })
      });
    });

    // 进行测量
    await page.click('[data-testid="take-measurement-button"]');

    // 请求AI分析
    await page.click('[data-testid="analyze-button"]');

    // 应显示加载状态
    await expect(page.locator('[data-testid="analysis-loading"]')).toBeVisible();

    // 应显示分析结果
    await expect(page.locator('text=飞星分析')).toBeVisible();
    await expect(page.locator('text=favorable')).toBeVisible();
    await expect(page.locator('text=水元素')).toBeVisible();

    // 应显示置信度评分
    await expect(page.locator('text=87% 置信度')).toBeVisible();
  });

  test('移动端响应式设计正常工作', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });

    // 罗盘应适当调整大小
    const compass = page.locator('[data-testid="feng-shui-compass"]');
    const boundingBox = await compass.boundingBox();

    expect(boundingBox?.width).toBeLessThanOrEqual(375);
    expect(boundingBox?.height).toBeLessThanOrEqual(375);

    // 触摸交互应正常工作
    await page.tap('[data-testid="compass-container"]');

    // 移动端专用UI元素应可见
    await expect(page.locator('[data-testid="mobile-controls"]')).toBeVisible();
  });
});

// 性能测试
test.describe('性能测试', () => {
  test('罗盘在性能预算内加载', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/compass');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // 3秒预算

    // 检查Lighthouse指标
    const metrics = await page.evaluate(() => {
      return new Promise(resolve => {
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
          const lcp = entries.find(entry => entry.name === 'largest-contentful-paint');

          resolve({
            fcp: fcp?.startTime || 0,
            lcp: lcp?.startTime || 0
          });
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
      });
    });

    expect(metrics.fcp).toBeLessThan(1500); // FCP < 1.5s
    expect(metrics.lcp).toBeLessThan(2500); // LCP < 2.5s
  });

  test('罗盘旋转流畅', async ({ page }) => {
    await page.goto('/compass');

    // 监控旋转期间的帧率
    const frameRates: number[] = [];

    await page.evaluate(() => {
      let lastTime = performance.now();
      const measureFrameRate = (currentTime: number) => {
        const deltaTime = currentTime - lastTime;
        const fps = 1000 / deltaTime;
        (window as any).frameRates.push(fps);
        lastTime = currentTime;

        if ((window as any).frameRates.length < 60) {
          requestAnimationFrame(measureFrameRate);
        }
      };

      (window as any).frameRates = [];
      requestAnimationFrame(measureFrameRate);
    });

    // 模拟罗盘旋转
    await page.mouse.move(200, 200);
    await page.mouse.down();

    for (let i = 0; i < 10; i++) {
      await page.mouse.move(200 + i * 10, 200);
      await page.waitForTimeout(16); // ~60fps
    }

    await page.mouse.up();

    // 检查帧率
    const frameRates = await page.evaluate(() => (window as any).frameRates);
    const averageFPS = frameRates.reduce((sum: number, fps: number) => sum + fps, 0) / frameRates.length;

    expect(averageFPS).toBeGreaterThan(45); // 最低45 FPS
  });
});
```

## 9. 部署架构

### CI/CD流水线

```yaml
# .github/workflows/compass-integration.yml
name: 罗盘集成CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - 'src/components/compass/**'
      - 'src/lib/compass/**'
      - 'src/app/api/compass/**'
  pull_request:
    branches: [main]
    paths:
      - 'src/components/compass/**'
      - 'src/lib/compass/**'
      - 'src/app/api/compass/**'

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: 设置Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: 安装依赖
        run: npm ci

      - name: 代码检查
        run: npm run lint -- --max-warnings 0

      - name: 类型检查
        run: npm run type-check

      - name: 单元测试
        run: npm run test -- --coverage --watchAll=false
        env:
          CI: true

      - name: 上传覆盖率报告
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          fail_ci_if_error: true

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: qiflow_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: 设置Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: 安装依赖
        run: npm ci

      - name: 设置测试数据库
        run: |
          npm run db:setup:test
          npm run db:migrate:test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/qiflow_test
          REDIS_URL: redis://localhost:6379

      - name: 集成测试
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/qiflow_test
          REDIS_URL: redis://localhost:6379
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_TEST_SERVICE_KEY }}

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: 设置Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: 安装依赖
        run: npm ci

      - name: 安装Playwright
        run: npx playwright install --with-deps chromium

      - name: 构建应用
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}

      - name: 运行E2E测试
        run: npm run test:e2e
        env:
          BASE_URL: http://localhost:3000
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}

      - name: 上传测试结果
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: 运行Trivy漏洞扫描
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: 上传Trivy扫描结果
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: 设置Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: 安装依赖
        run: npm ci

      - name: 构建应用
        run: npm run build

      - name: 启动应用
        run: npm start &
        env:
          PORT: 3000

      - name: 等待应用启动
        run: npx wait-on http://localhost:3000

      - name: 运行Lighthouse CI
        run: npm run lighthouse:ci
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

  deploy-staging:
    needs: [quality-checks, integration-tests, e2e-tests, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'

    steps:
      - uses: actions/checkout@v4

      - name: 部署到Vercel预发布环境
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
          alias-domains: staging.qiflow.ai

  deploy-production:
    needs: [quality-checks, integration-tests, e2e-tests, security-scan, performance-tests]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: 部署到Vercel生产环境
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
```

### 环境配置

```typescript
// 环境特定配置
interface EnvironmentConfig {
  database: {
    url: string;                    // 数据库连接URL
    poolSize: number;               // 连接池大小
    ssl: boolean;                   // SSL连接
  };
  redis: {
    url: string;                    // Redis连接URL
    cluster: boolean;               // 集群模式
  };
  ai: {
    providers: string[];            // AI提供商列表
    fallback: boolean;              // 启用备用方案
  };
  compass: {
    maxMeasurementsPerDay: Record<string, number>; // 每日测量限制
    sensorUpdateFrequency: number;  // 传感器更新频率
    cacheEnabled: boolean;          // 启用缓存
  };
  monitoring: {
    enableMetrics: boolean;         // 启用指标监控
    enableTracing: boolean;         // 启用链路追踪
    errorReporting: boolean;        // 启用错误报告
  };
}

const configs: Record<string, EnvironmentConfig> = {
  development: {                    // 开发环境
    database: {
      url: process.env.DATABASE_URL!,
      poolSize: 5,
      ssl: false
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      cluster: false
    },
    ai: {
      providers: ['openai'],
      fallback: false
    },
    compass: {
      maxMeasurementsPerDay: {
        guest: 10,
        user: 100,
        premium: 1000,
        professional: -1
      },
      sensorUpdateFrequency: 30,    // Hz
      cacheEnabled: true
    },
    monitoring: {
      enableMetrics: false,
      enableTracing: false,
      errorReporting: false
    }
  },

  staging: {                        // 预发布环境
    database: {
      url: process.env.DATABASE_URL!,
      poolSize: 10,
      ssl: true
    },
    redis: {
      url: process.env.REDIS_URL!,
      cluster: false
    },
    ai: {
      providers: ['openai', 'anthropic'],
      fallback: true
    },
    compass: {
      maxMeasurementsPerDay: {
        guest: 5,
        user: 50,
        premium: 500,
        professional: -1
      },
      sensorUpdateFrequency: 30,
      cacheEnabled: true
    },
    monitoring: {
      enableMetrics: true,
      enableTracing: true,
      errorReporting: true
    }
  },

  production: {                     // 生产环境
    database: {
      url: process.env.DATABASE_URL!,
      poolSize: 20,
      ssl: true
    },
    redis: {
      url: process.env.REDIS_URL!,
      cluster: true
    },
    ai: {
      providers: ['openai', 'anthropic', 'gemini'],
      fallback: true
    },
    compass: {
      maxMeasurementsPerDay: {
        guest: 10,
        user: 100,
        premium: 1000,
        professional: -1
      },
      sensorUpdateFrequency: 60,
      cacheEnabled: true
    },
    monitoring: {
      enableMetrics: true,
      enableTracing: true,
      errorReporting: true
    }
  }
};

export const getConfig = (): EnvironmentConfig => {
  const env = process.env.NODE_ENV || 'development';
  return configs[env] || configs.development;
};
```

### 监控与可观测性

```typescript
// Prometheus指标
import prometheus from 'prom-client';

// 罗盘功能自定义指标
const compassMetrics = {
  measurementCounter: new prometheus.Counter({
    name: 'compass_measurements_total',
    help: '罗盘测量总数',
    labelNames: ['user_type', 'sensor_type', 'status']
  }),

  measurementAccuracy: new prometheus.Histogram({
    name: 'compass_measurement_accuracy',
    help: '罗盘测量精度',
    buckets: [0.1, 0.3, 0.5, 0.7, 0.8, 0.9, 0.95, 0.99, 1.0]
  }),

  sensorCalibrationDuration: new prometheus.Histogram({
    name: 'compass_calibration_duration_seconds',
    help: '传感器校准耗时',
    buckets: [1, 5, 10, 30, 60, 120]
  }),

  apiResponseTime: new prometheus.Histogram({
    name: 'compass_api_response_time_seconds',
    help: '罗盘API响应时间',
    labelNames: ['endpoint', 'method', 'status_code']
  }),

  errorRate: new prometheus.Counter({
    name: 'compass_errors_total',
    help: '罗盘相关错误总数',
    labelNames: ['type', 'component']
  })
};

// API监控中间件
export const monitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    const endpoint = req.route?.path || req.path;

    compassMetrics.apiResponseTime
      .labels(endpoint, req.method, res.statusCode.toString())
      .observe(duration);
  });

  next();
};

// 健康检查端点
export async function GET() {
  try {
    // 检查数据库连接
    const dbHealth = await checkDatabaseHealth();

    // 检查Redis连接
    const redisHealth = await checkRedisHealth();

    // 检查外部服务
    const aiServiceHealth = await checkAIServiceHealth();

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        redis: redisHealth,
        ai: aiServiceHealth
      }
    };

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error.message },
      { status: 503 }
    );
  }
}

// 错误追踪
class CompassErrorReporter {
  static reportError(error: Error, context: Record<string, any>) {
    // 增加错误计数器
    compassMetrics.errorRate
      .labels(error.constructor.name, context.component || 'unknown')
      .inc();

    // 发送到错误追踪服务（如Sentry等）
    if (process.env.NODE_ENV === 'production') {
      console.error('罗盘错误:', {
        error: error.message,
        stack: error.stack,
        context
      });
    }
  }
}

// 在组件中使用
export const useSensorFusion = (config: SensorConfig) => {
  // ... 现有代码 ...

  const handleSensorError = useCallback((error: Error) => {
    CompassErrorReporter.reportError(error, {
      component: 'SensorFusion',
      config,
      userAgent: navigator.userAgent
    });
  }, [config]);

  // ... Hook的其余部分 ...
};
```

## 10. 增强AI集成设计（技术评审优化）

### 文化上下文感知AI系统

基于技术评审建议，增强AI分析的文化准确性和专业深度：

```typescript
interface EnhancedAIIntegration {
  culturalContext: {
    provider: 'fengshui-expert' | 'ai-engine';
    confidence: number;
    culturalAccuracy: number;
    traditionalReferences: string[];
  };

  progressiveAnalysis: {
    basic: {
      summary: string;
      mainDirections: string[];
      basicRecommendations: string[];
    };
    professional: {
      detailedAnalysis: string;
      technicalTerms: Record<string, string>;
      advancedRecommendations: string[];
      contraindications: string[];
    };
    expert: {
      masterLevelAnalysis: string;
      historicalContext: string[];
      alternativeSchools: string[];
      riskAssessment: RiskAnalysis;
    };
  };

  riskAssessment: {
    technicalRisk: number;    // 技术实现风险
    culturalRisk: number;     // 文化准确性风险
    businessRisk: number;     // 商业应用风险
    userAcceptance: number;   // 用户接受度
  };
}

class CulturallyAwareAIEngine {
  private expertSystem: FengShuiExpertSystem;
  private aiProviders: Map<string, AIProvider>;
  private culturalValidator: CulturalValidator;
  private riskAnalyzer: RiskAnalyzer;

  constructor() {
    this.expertSystem = new FengShuiExpertSystem();
    this.aiProviders = this.initializeAIProviders();
    this.culturalValidator = new CulturalValidator();
    this.riskAnalyzer = new RiskAnalyzer();
  }

  async generateAnalysis(
    compassData: CompassMeasurement,
    userProfile: UserProfile,
    analysisLevel: 'basic' | 'professional' | 'expert'
  ): Promise<EnhancedAIAnalysis> {
    // 1. 传统风水计算（专家系统）
    const traditionalAnalysis = await this.expertSystem.analyze({
      heading: compassData.trueHeading,
      location: compassData.location,
      timestamp: compassData.timestamp,
      userBazi: userProfile.baziData
    });

    // 2. AI增强分析
    const aiAnalysis = await this.generateAIAnalysis(
      compassData,
      traditionalAnalysis,
      analysisLevel
    );

    // 3. 文化准确性验证
    const culturalValidation = await this.culturalValidator.validate(
      aiAnalysis,
      traditionalAnalysis
    );

    // 4. 风险评估
    const riskAssessment = await this.riskAnalyzer.assess({
      technicalData: compassData,
      aiAnalysis,
      traditionalAnalysis,
      userContext: userProfile
    });

    // 5. 融合最终结果
    return this.synthesizeAnalysis({
      traditional: traditionalAnalysis,
      ai: aiAnalysis,
      cultural: culturalValidation,
      risks: riskAssessment,
      level: analysisLevel
    });
  }

  private async generateAIAnalysis(
    compassData: CompassMeasurement,
    traditionalBase: TraditionalAnalysis,
    level: AnalysisLevel
  ): Promise<AIAnalysisResult> {
    const prompt = this.buildCulturallyAwarePrompt({
      compassData,
      traditionalBase,
      level,
      culturalContext: {
        language: 'zh-CN',
        tradition: 'xuankong',
        modernization: 'balanced'
      }
    });

    // 多提供商并行分析
    const providers = ['openai', 'anthropic', 'custom-fengshui'];
    const analyses = await Promise.allSettled(
      providers.map(provider =>
        this.getAIProvider(provider).analyze(prompt)
      )
    );

    // 智能融合多个AI结果
    return this.fuseAIResults(analyses, traditionalBase);
  }

  private buildCulturallyAwarePrompt(context: PromptContext): string {
    const {
      compassData,
      traditionalBase,
      level,
      culturalContext
    } = context;

    const basePrompt = `
你是一位资深的风水大师，精通玄空飞星理论和传统罗盘使用。
请基于以下罗盘测量数据和传统分析结果，提供${level === 'expert' ? '专家级' : level === 'professional' ? '专业级' : '基础'}的风水分析：

【罗盘数据】
- 真方位角：${compassData.trueHeading}°
- 测量位置：${compassData.location.latitude}, ${compassData.location.longitude}
- 测量时间：${compassData.timestamp.toISOString()}
- 精度评分：${compassData.accuracy}

【传统分析结果】
- 飞星盘：${JSON.stringify(traditionalBase.flyingStarsChart)}
- 坐山朝向：${traditionalBase.sitting}坐${traditionalBase.facing}朝
- 当运星盘：${traditionalBase.currentPeriod}运
- 流年飞星：${traditionalBase.annualStars}

【分析要求】
1. 严格遵循传统风水理论，特别是玄空飞星派
2. 结合现代生活实际，提供可操作的建议
3. 避免封建迷信色彩，注重科学性和实用性
4. 使用准确的风水术语，但要通俗易懂
5. 考虑文化传承和现代适应性

请按以下结构提供分析：
`;

    switch (level) {
      case 'basic':
        return `${basePrompt}
【基础分析】（适合初学者）
- 房屋整体运势概述
- 主要方位吉凶
- 3-5条简明建议
- 需要注意的事项
`;

      case 'professional':
        return `${basePrompt}
【专业分析】（适合从业者）
- 详细的飞星分析和解释
- 各方位的具体影响
- 时间因素的考虑（流年、流月）
- 针对性的化解方法
- 专业术语解释
- 实施优先级建议
`;

      case 'expert':
        return `${basePrompt}
【专家分析】（适合资深从业者）
- 深层理论依据和历史典籍引用
- 复杂格局的识别和分析
- 多派理论的比较和融合
- 罕见情况的特殊处理
- 长期趋势预测
- 高难度化解方案
- 风险评估和替代方案
`;
    }
  }
}
```

### AI质量保证系统

```typescript
class AIQualityAssuranceSystem {
  private qualityMetrics: QualityMetrics;
  private feedbackCollector: FeedbackCollector;
  private expertReviewPanel: ExpertReviewPanel;

  async validateAIOutput(
    analysis: AIAnalysisResult,
    traditionalBaseline: TraditionalAnalysis
  ): Promise<QualityAssessment> {
    const assessments = await Promise.all([
      this.assessTechnicalAccuracy(analysis, traditionalBaseline),
      this.assessCulturalAuthenticity(analysis),
      this.assessPracticalValue(analysis),
      this.assessSafetyAndEthics(analysis)
    ]);

    return this.synthesizeQualityAssessment(assessments);
  }

  private async assessCulturalAuthenticity(
    analysis: AIAnalysisResult
  ): Promise<CulturalAssessment> {
    const checks = {
      // 术语准确性检查
      terminologyAccuracy: this.validateFengShuiTerms(analysis.content),

      // 理论一致性检查
      theoryConsistency: this.checkTheoryConsistency(analysis.reasoning),

      // 文化敏感性检查
      culturalSensitivity: this.assessCulturalSensitivity(analysis.tone),

      // 传统引用准确性
      traditionalReferences: this.validateHistoricalReferences(analysis.references)
    };

    const overallScore = Object.values(checks)
      .reduce((sum, score) => sum + score, 0) / Object.keys(checks).length;

    return {
      score: overallScore,
      details: checks,
      recommendations: this.generateImprovementRecommendations(checks)
    };
  }

  private async assessSafetyAndEthics(
    analysis: AIAnalysisResult
  ): Promise<SafetyAssessment> {
    const safetyChecks = {
      // 避免绝对化表述
      avoidAbsoluteClaims: this.checkForAbsoluteClaims(analysis.content),

      // 避免恐吓性语言
      avoidFearMongering: this.checkForFearMongering(analysis.tone),

      // 鼓励理性思考
      encourageRationalThinking: this.assessRationalityEncouragement(analysis.reasoning),

      // 提供科学解释
      provideScientificContext: this.checkScientificContext(analysis.explanations)
    };

    return {
      isSafe: Object.values(safetyChecks).every(check => check.passed),
      details: safetyChecks,
      requiredActions: this.identifyRequiredSafetyActions(safetyChecks)
    };
  }
## 11. 分层测试策略强化（技术评审优化）

### 全面测试覆盖矩阵

基于技术评审建议，建立分层测试策略确保各级别质量：

```typescript
interface LayeredTestingStrategy {
  // 第一层：单元测试（目标覆盖率：85%+）
  unitTests: {
    coverage: {
      statements: 85;
      branches: 80;
      functions: 90;
      lines: 85;
    };
    focus: [
      'sensor-fusion-algorithms',
      'compass-calculations',
      'calibration-logic',
      'data-validation',
      'error-handling'
    ];
    frameworks: ['jest', 'testing-library', 'msw'];
  };

  // 第二层：集成测试（目标覆盖率：75%+）
  integrationTests: {
    coverage: {
      apiEndpoints: 75;
      databaseOperations: 80;
      externalServices: 70;
      componentIntegration: 75;
    };
    focus: [
      'api-contract-testing',
      'database-integration',
      'ai-service-integration',
      'sensor-api-integration',
      'authentication-flow'
    ];
    frameworks: ['supertest', 'testcontainers', 'nock'];
  };

  // 第三层：端到端测试（目标覆盖率：70%+）
  e2eTests: {
    coverage: {
      criticalUserJourneys: 100;
      crossBrowserCompatibility: 70;
      mobileResponsiveness: 75;
      accessibilityCompliance: 80;
    };
    focus: [
      'compass-measurement-flow',
      'calibration-process',
      'ai-analysis-generation',
      'user-registration-flow',
      'subscription-management'
    ];
    frameworks: ['playwright', 'cypress'];
  };

  // 第四层：专业测试（特殊需求）
  specializedTests: {
    culturalAccuracy: {
      expertValidation: true;
      traditionalAlgorithmComparison: true;
      terminologyAccuracy: true;
      culturalSensitivity: true;
    };
    performanceTests: {
      loadTesting: true;
      stressTesting: true;
      sensorLatencyTesting: true;
      renderingPerformance: true;
    };
    securityTests: {
      penetrationTesting: true;
      dataPrivacyCompliance: true;
      encryptionValidation: true;
      authenticationSecurity: true;
    };
    deviceCompatibilityTests: {
      sensorAvailabilityMatrix: true;
      crossPlatformConsistency: true;
      degradationTesting: true;
      fallbackMechanisms: true;
    };
  };
}

// 文化准确性测试系统
class CulturalAccuracyTestSuite {
  private expertValidators: Map<string, FengShuiExpert>;
  private traditionalCalculators: Map<string, TraditionalCalculator>;
  private terminologyDatabase: TerminologyDatabase;

  constructor() {
    this.expertValidators = this.initializeExpertPanel();
    this.traditionalCalculators = this.initializeTraditionalCalculators();
    this.terminologyDatabase = new TerminologyDatabase();
  }

  async validateFengShuiAnalysis(
    computerAnalysis: AIAnalysisResult,
    inputData: CompassMeasurement
  ): Promise<CulturalValidationResult> {
    const validationTasks = [
      this.validateAgainstTraditionalCalculations(computerAnalysis, inputData),
      this.validateTerminologyUsage(computerAnalysis),
      this.validateCulturalSensitivity(computerAnalysis),
      this.validateExpertConsensus(computerAnalysis, inputData)
    ];

    const results = await Promise.allSettled(validationTasks);
    return this.synthesizeValidationResults(results);
  }

  private async validateAgainstTraditionalCalculations(
    computerAnalysis: AIAnalysisResult,
    inputData: CompassMeasurement
  ): Promise<TraditionalComparisonResult> {
    const traditionalResults = await Promise.all([
      this.traditionalCalculators.get('xuankong')!.calculate(inputData),
      this.traditionalCalculators.get('bazhai')!.calculate(inputData),
      this.traditionalCalculators.get('qimen')!.calculate(inputData)
    ]);

    const consistencyScores = traditionalResults.map(result =>
      this.calculateConsistencyScore(computerAnalysis, result)
    );

    const averageConsistency = consistencyScores.reduce((sum, score) => sum + score, 0) / consistencyScores.length;

    return {
      averageConsistency,
      individualScores: consistencyScores,
      discrepancies: this.identifyDiscrepancies(computerAnalysis, traditionalResults),
      recommendations: this.generateImprovementRecommendations(consistencyScores)
    };
  }

  private async validateExpertConsensus(
    computerAnalysis: AIAnalysisResult,
    inputData: CompassMeasurement
  ): Promise<ExpertConsensusResult> {
    const expertEvaluations = await Promise.all(
      Array.from(this.expertValidators.values()).map(expert =>
        expert.evaluateAnalysis(computerAnalysis, inputData)
      )
    );

    const consensusScore = this.calculateConsensusScore(expertEvaluations);
    const criticalIssues = this.identifyCriticalIssues(expertEvaluations);

    return {
      consensusScore,
      expertCount: expertEvaluations.length,
      criticalIssues,
      expertFeedback: expertEvaluations.map(evaluation => ({
        expertId: evaluation.expertId,
        score: evaluation.score,
        feedback: evaluation.feedback,
        suggestions: evaluation.suggestions
      }))
    };
  }
}

// 设备兼容性测试矩阵
class DeviceCompatibilityTestMatrix {
  private testDevices: TestDevice[];
  private testScenarios: TestScenario[];
  private testResults: Map<string, TestResult> = new Map();

  constructor() {
    this.testDevices = this.initializeTestDeviceMatrix();
    this.testScenarios = this.initializeTestScenarios();
  }

  private initializeTestDeviceMatrix(): TestDevice[] {
    return [
      // iOS设备
      {
        platform: 'ios',
        model: 'iPhone 15 Pro',
        sensors: ['magnetometer', 'gyroscope', 'accelerometer', 'gps'],
        expectedAccuracy: '±2°'
      },
      {
        platform: 'ios',
        model: 'iPhone 12',
        sensors: ['magnetometer', 'gyroscope', 'accelerometer'],
        expectedAccuracy: '±3°'
      },
      {
        platform: 'ios',
        model: 'iPhone X',
        sensors: ['magnetometer', 'accelerometer'],
        expectedAccuracy: '±5°'
      },

      // Android设备
      {
        platform: 'android',
        model: 'Samsung Galaxy S24',
        sensors: ['magnetometer', 'gyroscope', 'accelerometer', 'gps'],
        expectedAccuracy: '±2°'
      },
      {
        platform: 'android',
        model: 'Google Pixel 7',
        sensors: ['magnetometer', 'gyroscope', 'accelerometer'],
        expectedAccuracy: '±3°'
      },
      {
        platform: 'android',
        model: 'Xiaomi Redmi Note 11',
        sensors: ['magnetometer', 'accelerometer'],
        expectedAccuracy: '±5°'
      },

      // 桌面浏览器
      {
        platform: 'desktop',
        model: 'Chrome 120+',
        sensors: ['geolocation'],
        expectedAccuracy: '手动输入'
      },
      {
        platform: 'desktop',
        model: 'Safari 17+',
        sensors: ['geolocation'],
        expectedAccuracy: '手动输入'
      }
    ];
  }

  async runCompatibilityTests(): Promise<CompatibilityTestReport> {
    const testResults: TestResult[] = [];

    for (const device of this.testDevices) {
      for (const scenario of this.testScenarios) {
        const result = await this.runDeviceScenarioTest(device, scenario);
        testResults.push(result);
        this.testResults.set(`${device.model}-${scenario.name}`, result);
      }
    }

    return this.generateCompatibilityReport(testResults);
  }

  private async runDeviceScenarioTest(
    device: TestDevice,
    scenario: TestScenario
  ): Promise<TestResult> {
    const testStart = Date.now();

    try {
      // 模拟设备环境
      const deviceEmulator = new DeviceEmulator(device);
      await deviceEmulator.initialize();

      // 执行测试场景
      const scenarioResult = await scenario.execute(deviceEmulator);

      return {
        device: device.model,
        scenario: scenario.name,
        success: scenarioResult.success,
        accuracy: scenarioResult.accuracy,
        performance: scenarioResult.performance,
        errors: scenarioResult.errors,
        duration: Date.now() - testStart,
        expectedAccuracy: device.expectedAccuracy,
        actualAccuracy: scenarioResult.measuredAccuracy
      };

    } catch (error) {
      return {
        device: device.model,
        scenario: scenario.name,
        success: false,
        accuracy: 0,
        performance: { fps: 0, memory: 0, cpu: 0 },
        errors: [error.message],
        duration: Date.now() - testStart,
        expectedAccuracy: device.expectedAccuracy,
        actualAccuracy: 'N/A'
      };
    }
  }
}
```

## 12. 安全与隐私增强措施（技术评审优化）

### 位置数据分级保护

基于技术评审建议，实现增强的位置数据保护机制：

```typescript
// 分级加密系统
class TieredLocationProtection {
  private encryptionLevels: Map<DataSensitivity, EncryptionConfig>;
  private localProcessingEngine: LocalProcessingEngine;
  private auditLogger: SecurityAuditLogger;

  constructor() {
    this.encryptionLevels = this.initializeEncryptionLevels();
    this.localProcessingEngine = new LocalProcessingEngine();
    this.auditLogger = new SecurityAuditLogger();
  }

  private initializeEncryptionLevels(): Map<DataSensitivity, EncryptionConfig> {
    return new Map([
      // 公开数据：基础加密
      ['public', {
        algorithm: 'AES-256-GCM',
        keyRotationInterval: 30 * 24 * 60 * 60 * 1000, // 30天
        localProcessing: true,
        cloudStorage: false
      }],

      // 敏感数据：增强加密
      ['sensitive', {
        algorithm: 'AES-256-GCM',
        keyRotationInterval: 7 * 24 * 60 * 60 * 1000, // 7天
        localProcessing: true,
        cloudStorage: false,
        additionalSalting: true,
        zeronize: true
      }],

      // 高度敏感：最高级加密
      ['highly_sensitive', {
        algorithm: 'ChaCha20-Poly1305',
        keyRotationInterval: 24 * 60 * 60 * 1000, // 24小时
        localProcessing: true,
        cloudStorage: false,
        additionalSalting: true,
        zeronize: true,
        homomorphicEncryption: true,
        differentialPrivacy: true
      }]
    ]);
  }

  async protectLocationData(
    locationData: LocationData,
    userContext: UserContext,
    sensitivityLevel: DataSensitivity
  ): Promise<ProtectedLocationData> {
    const config = this.encryptionLevels.get(sensitivityLevel)!;

    // 记录安全操作
    await this.auditLogger.logSecurityOperation({
      operation: 'location_data_protection',
      userId: userContext.userId,
      sensitivityLevel,
      timestamp: new Date(),
      ipAddress: userContext.ipAddress,
      userAgent: userContext.userAgent
    });

    // 本地处理优先策略
    if (config.localProcessing) {
      return this.processLocallyWithEncryption(locationData, config);
    }

    // 对于必须上传的数据，使用最强加密
    return this.processWithCloudEncryption(locationData, config, userContext);
  }

  private async processLocallyWithEncryption(
    locationData: LocationData,
    config: EncryptionConfig
  ): Promise<ProtectedLocationData> {
    try {
      // 本地计算磁偏角和飞星分析
      const localAnalysis = await this.localProcessingEngine.processCompassData({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        heading: locationData.heading,
        timestamp: locationData.timestamp
      });

      // 只保存加密后的结果，不保存原始坐标
      const encryptedResults = await this.encryptAnalysisResults(
        localAnalysis,
        config
      );

      // 清除内存中的敏感数据
      if (config.zeronize) {
        this.zeronizeMemory([locationData, localAnalysis]);
      }

      return {
        analysisResults: encryptedResults,
        processingMetadata: {
          processedLocally: true,
          encryptionAlgorithm: config.algorithm,
          timestamp: new Date()
        },
        dataRetention: {
          originalDataDiscarded: true,
          resultsRetentionPeriod: this.calculateRetentionPeriod(config)
        }
      };

    } catch (error) {
      await this.auditLogger.logSecurityError({
        operation: 'local_processing_failed',
        error: error.message,
        timestamp: new Date()
      });
      throw new SecurityProcessingError('本地处理失败', error);
    }
  }
}
```

### 传感器权限最小化原则

```typescript
class MinimalPermissionSensorManager {
  private requestedPermissions: Set<SensorType> = new Set();
  private grantedPermissions: Map<SensorType, PermissionDetails> = new Map();
  private userControlPreferences: UserControlPreferences;

  async requestMinimalPermissions(
    analysisRequirements: AnalysisRequirements
  ): Promise<PermissionGrantResult> {
    // 计算最小必要权限集
    const minimalPermissions = this.calculateMinimalPermissions(analysisRequirements);

    // 提供用户控制选项
    const userChoices = await this.presentUserControlOptions({
      required: minimalPermissions.required,
      optional: minimalPermissions.optional,
      alternatives: minimalPermissions.alternatives
    });

    // 按用户选择请求权限
    return this.requestSelectedPermissions(userChoices);
  }

  private calculateMinimalPermissions(
    requirements: AnalysisRequirements
  ): MinimalPermissionSet {
    const permissionTiers = {
      // 基础风水分析：只需方位信息
      basic: {
        required: ['magnetometer'] as SensorType[],
        optional: [] as SensorType[],
        alternatives: [
          { type: 'manual_input', description: '手动输入罗盘读数' },
          { type: 'gps_estimation', description: '基于GPS的粗略方位估算' }
        ]
      },

      // 标准分析：需要稳定的方位数据
      standard: {
        required: ['magnetometer'] as SensorType[],
        optional: ['accelerometer'] as SensorType[],
        alternatives: [
          { type: 'enhanced_manual', description: '增强手动输入模式' }
        ]
      },

      // 高精度分析：需要全部传感器
      high_precision: {
        required: ['magnetometer', 'accelerometer'] as SensorType[],
        optional: ['gyroscope', 'geolocation'] as SensorType[],
        alternatives: [
          { type: 'professional_equipment', description: '使用专业罗盘设备' }
        ]
      }
    };

    return permissionTiers[requirements.precision] || permissionTiers.basic;
  }

  async presentUserControlOptions(
    permissionSet: MinimalPermissionSet
  ): Promise<UserPermissionChoices> {
    return new Promise((resolve) => {
      const dialog = new PermissionControlDialog({
        title: '传感器权限设置',
        content: {
          explanation: '为了提供准确的风水分析，我们需要访问部分设备传感器。您可以选择授权的范围：',

          required: permissionSet.required.map(sensor => ({
            sensor,
            name: this.getSensorDisplayName(sensor),
            purpose: this.getSensorPurpose(sensor),
            canDeny: false,
            alternatives: this.getSensorAlternatives(sensor)
          })),

          optional: permissionSet.optional.map(sensor => ({
            sensor,
            name: this.getSensorDisplayName(sensor),
            purpose: this.getSensorPurpose(sensor),
            benefit: this.getSensorBenefit(sensor),
            canDeny: true,
            defaultChoice: 'ask_me'
          }))
        },

        privacyControls: {
          dataRetention: {
            options: ['session_only', '7_days', '30_days', 'until_deleted'],
            default: 'session_only',
            description: '选择数据保存时间'
          },

          processingLocation: {
            options: ['local_only', 'cloud_with_encryption', 'cloud_anonymous'],
            default: 'local_only',
            description: '选择数据处理位置'
          },

          sharingLevel: {
            options: ['no_sharing', 'anonymous_analytics', 'improvement_only'],
            default: 'no_sharing',
            description: '选择数据共享级别'
          }
        },

        onComplete: (choices) => resolve(choices)
      });

      dialog.show();
    });
  }
}
```

## 总结（技术评审优化版）

本技术文档基于技术评审建议进行了全面优化，提供了更加务实、稳健和适应中国开发环境的风水罗盘集成方案。架构设计既保持传统风水的文化精准性，又满足现代Web应用的技术要求。

### 关键技术亮点（评审优化版）

1. **分阶段传感器融合技术** - 三阶段渐进式算法优化：基础卡尔曼滤波(±5°) → 增强校准(±3°) → 深度融合(±2°)
2. **智能设备适配架构** - 自动检测设备能力并选择最优策略，支持高精度/标准/降级三种模式
3. **并行开发迁移策略** - Vue与React版本并行开发，内置回滚机制和等价性验证
4. **传感器抽象层设计** - 统一的多平台API抽象，支持Web Sensors/DeviceOrientation/Cordova/Capacitor
5. **增强校准算法套件** - 8字强化/24点多向/实时适应/智能选择四种校准模式
6. **智能渲染选择引擎** - 基于设备性能自动选择Canvas/SVG/WebGL，实时性能监控和动态调整
7. **Web Worker优化架构** - 飞星计算/传感器融合/渲染计算分离至后台线程
8. **文化感知AI系统** - 传统专家系统+AI增强+文化验证+风险评估的四层融合架构
9. **分层测试矩阵** - 单元(85%+)/集成(75%+)/E2E(70%+)/文化准确性/设备兼容性全覆盖
10. **分级安全保护** - 本地处理优先+加密分级+最小权限原则+实时审计
11. **云原生CI/CD** - 多环境隔离/安全扫描/性能基准/自动部署流水线

### 实施建议（技术评审优化）

1. **风险控制优先的分阶段实施**
   - 第一阶段：基础功能 + 并行开发验证（1-4周）
   - 第二阶段：增强校准 + 智能适配（5-8周）
   - 第三阶段：高精度融合 + AI优化（9-12周）

2. **质量保证体系建设**
   - 建立文化准确性专家验证团队
   - 实施设备兼容性测试矩阵
   - 部署分层自动化测试流水线

3. **性能与安全监控**
   - 建立实时性能监控系统
   - 部署安全审计和异常检测
   - 定期安全渗透测试和评估

4. **用户反馈闭环**
   - 收集专业风水师的使用反馈
   - 建立文化适应性评估机制
   - 持续优化AI分析的文化准确性

5. **国际化与本地化**
   - 优先中文市场的深度适配
   - 适配东亚文化圈的风水传统
   - 考虑全球市场的文化敏感性

这个经过技术评审优化的技术方案为开发团队提供了更加务实、可靠的实现指导，确保项目能够在控制风险的前提下按时、高质量地交付。同时，特别关注了中国开发环境的特殊需求和文化适应性。