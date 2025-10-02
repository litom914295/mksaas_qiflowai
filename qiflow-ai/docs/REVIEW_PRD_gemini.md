# QiFlow PRD v5.0 数据与评测系统评审报告

**评审角色**：评测与多模态系统工程师  
**评审范围**：PRD_v5.0.md - 数据正确性与传感器系统  
**评审日期**：2024-12-27  
**评审人**：Gemini-2.5-Pro

---

## 一、评测清单与覆盖率目标

### 1.1 玄空风水算法评测清单

#### 核心公式与阈值缺失
| 评测项 | 当前状态 | 目标覆盖率 | 门槛值 |
|--------|----------|------------|---------|
| 九宫飞星计算公式 | ❌ 未定义 | 100% | 准确率≥99.5% |
| 24山坐向映射 | ❌ 未定义 | 100% | 误差≤0.75° |
| 兼线判定阈值 | ❌ 未定义 | 100% | 边界±3°明确 |
| 流年飞星叠加 | ❌ 未定义 | 100% | 组合完整性100% |
| 运盘切换规则 | ❌ 未定义 | 100% | 时间精度±1天 |
| 山向吉凶判定 | ❌ 未定义 | 100% | 规则覆盖率95% |

**证据**：L179-208仅展示调用接口，无算法实现细节，`getCurrentPeriod()`函数未定义，`XuanKongEngine`内部逻辑缺失

#### 黄金测试样例需求
```typescript
// 必需的回归测试数据集
const goldenTestCases = {
  // 九运甲山庚向（2024-2044标准案例）
  case1: {
    input: { 
      facingDeg: 247.5,  // 庚向正中
      year: 2024,
      month: 2,
      buildYear: 2024
    },
    expected: {
      period: 9,
      facing: "庚",
      sitting: "甲",
      centerStar: 9,
      facingStars: [1, 6, 8, 3, 5, 7, 9, 2, 4],
      sittingStars: [9, 2, 4, 7, 9, 2, 5, 7, 9],
      verdict: "旺山旺向"
    }
  },
  // 兼线案例：子癸兼线
  case2: {
    input: { facingDeg: 2.0 },  // 子山偏癸3°
    expected: {
      primaryFacing: "子",
      兼线: "癸",
      兼线度数: 3,
      needSpecialChart: true
    }
  }
};
```

**缺口分析**：需要至少100个标准测试案例覆盖：
- 24山×9运=216种基础组合
- 48种常见兼线情况
- 12个月流年飞星变化
- 总计需要≥300个测试样本

### 1.2 传感器系统评测清单

#### 噪声与漂移量化指标缺失
| 评测项 | 当前状态 | 目标阈值 | 验收标准 |
|--------|----------|----------|----------|
| 磁力计噪声σ | ❌ 未定义 | ≤2.5° | 静态标准差 |
| 陀螺仪漂移率 | ❌ 未定义 | ≤0.5°/min | 累积误差 |
| 加速度计偏置 | ❌ 未定义 | ≤0.05g | 零偏稳定性 |
| 卡尔曼滤波参数 | ❌ 未定义 | Q/R矩阵 | 收敛时间≤3s |
| 置信度计算公式 | ❌ 未定义 | [0,1]区间 | 明确权重分配 |
| iOS降级阈值 | ❌ 未定义 | 权限检测 | 响应时间≤100ms |

**证据**：L265-276提及"四通道融合"和"卡尔曼滤波"但无具体实现，`compassConfidence`(L373)存储但计算方式未明

#### 传感器降级链路设计
```typescript
// 需要补充的降级策略
const sensorFallbackChain = {
  level1: {
    sensors: ['magnetometer', 'accelerometer', 'gyroscope'],
    accuracy: '±2°',
    confidence: 0.9
  },
  level2: {
    sensors: ['magnetometer', 'accelerometer'],  // iOS限制
    accuracy: '±5°',
    confidence: 0.7,
    calibrationRequired: true
  },
  level3: {
    sensors: ['magnetometer'],  // 仅磁力计
    accuracy: '±10°',
    confidence: 0.5,
    warning: '精度降低，建议手动校准'
  },
  level4: {
    sensors: [],  // 手动输入
    accuracy: '用户输入',
    confidence: 0.3,
    ui: 'ManualCompassInput'
  }
};
```

### 1.3 RAG系统评测清单

#### 评测指标体系缺失
| 评测维度 | 目标值 | 测试集规模 | 更新频率 |
|---------|--------|------------|----------|
| 召回率@10 | ≥85% | 1000条query | 月度 |
| 精确率@3 | ≥90% | 1000条query | 月度 |
| 拒答准确率 | ≥95% | 200条边界case | 周度 |
| 引用正确性 | 100% | 500条验证集 | 实时 |
| 响应时间P95 | ≤2s | 全量请求 | 实时 |
| 幻觉率 | ≤5% | 人工标注100条/周 | 周度 |

**证据**：L258-262仅提及"向量化存储"概念，无具体实现和评测方案

#### 数据集需求
```yaml
rag_test_dataset:
  sources:
    - name: "三命通会"
      records: 5000
      license: "公版"
      vectorized: false
    - name: "滴天髓"
      records: 3000
      license: "公版"
      vectorized: false
    - name: "专家标注"
      records: 1000
      license: "自有"
      quality: "人工验证"
  
  标注规范:
    - query_intent: "问题意图分类"
    - expected_sources: "期望引用来源"
    - answer_template: "标准答案模版"
    - reject_reasons: "拒答原因标注"
```

---

## 二、风险与对策

### 2.1 数据正确性风险

#### 🔴 高风险：玄空算法无验证机制
- **风险**：错误的飞星计算导致用户决策失误，品牌信誉受损
- **对策**：
  1. 引入台湾老师傅验证的300个标准案例
  2. 实现自动化回归测试，每次部署前运行
  3. 设置算法置信度，低于80%标记"仅供参考"

#### 🔴 高风险：传感器数据不可靠
- **风险**：罗盘方向错误导致风水分析完全失效
- **对策**：
  1. 强制8字形校准流程，未校准禁用功能
  2. 实时显示置信度条，低于60%显示警告
  3. 提供"专业罗盘对照"验证功能

### 2.2 性能与成本风险

#### 🟡 中风险：RAG召回延迟
- **风险**：向量检索超时影响用户体验
- **对策**：
  1. 热点知识预加载缓存
  2. 分级检索：优先本地→远程向量库
  3. 设置2秒超时，降级到预置回答

#### 🟡 中风险：传感器功耗
- **风险**：持续采样导致电池快速耗尽
- **对策**：
  1. 自适应采样率：静止10Hz，运动60Hz
  2. 后台暂停传感器
  3. 低电量(<20%)自动降级

### 2.3 合规与隐私风险

#### 🟢 低风险：位置信息泄露
- **风险**：罗盘使用暴露用户精确位置
- **对策**：
  1. 本地处理，不上传原始GPS
  2. 仅存储城市级位置
  3. 提供"隐私模式"选项

---

## 三、数据与评测合同

### 3.1 玄空风水评测合同
```typescript
interface XuanKongTestContract {
  // 算法准确性承诺
  accuracy: {
    飞星计算: 99.5,  // 最低准确率
    山向判定: 99.0,
    兼线识别: 95.0
  },
  
  // 测试数据集要求
  testDataset: {
    size: 300,
    coverage: {
      '24山完整覆盖': true,
      '9运全覆盖': true,
      '兼线案例': 48,
      '特殊案例': 20
    }
  },
  
  // 验收标准
  acceptance: {
    自动化测试通过率: 100,
    专家抽检通过率: 95,
    用户反馈准确率: 90
  }
}
```

### 3.2 传感器系统评测合同
```typescript
interface CompassTestContract {
  // 精度承诺（分场景）
  accuracy: {
    室外空旷: '±2°',
    室内正常: '±5°',
    电磁干扰: '±10°'
  },
  
  // 可用性承诺
  availability: {
    Android设备: 99,  // 百分比
    iOS设备: 85,      // 权限限制
    降级方案覆盖: 100
  },
  
  // 性能指标
  performance: {
    初始化时间: '<3s',
    采样率: '10-60Hz',
    功耗增量: '<5%'
  }
}
```

### 3.3 RAG评测合同
```typescript
interface RAGTestContract {
  // 质量指标
  quality: {
    召回率: 85,
    精确率: 90,
    幻觉率: '<5%'
  },
  
  // 数据集规模
  dataset: {
    知识条目: 10000,
    测试query: 1000,
    人工标注: 200
  },
  
  // 更新机制
  updates: {
    知识库更新: '月度',
    模型微调: '季度',
    评测报告: '周度'
  }
}
```

---

## 四、PRD补丁建议

```markdown
## 新增章节：13. 数据正确性与评测体系

### 13.1 玄空风水算法规范

#### 13.1.1 核心算法定义
```typescript
// 九宫飞星计算公式
function calculateFlyingStars(period: number, facing: number) {
  const centerStar = period;
  const luoShu = [5, 1, 3, 4, 9, 2, 8, 6, 7];
  
  // 顺飞/逆飞判定
  const isShun = (period % 2 === 1);
  
  // 计算各宫飞星
  const stars = luoShu.map((pos, idx) => {
    if (isShun) {
      return ((centerStar + pos - 5 - 1) % 9) + 1;
    } else {
      return ((centerStar - pos + 5 + 8) % 9) + 1;
    }
  });
  
  return stars;
}

// 24山映射表
const MOUNTAIN_FACING_MAP = {
  '子': { range: [352.5, 7.5], element: '水', number: 1 },
  '癸': { range: [7.5, 22.5], element: '水', number: 1 },
  '丑': { range: [22.5, 37.5], element: '土', number: 8 },
  // ... 完整24山定义
};

// 兼线判定
function detectJianXian(degree: number) {
  const THRESHOLD = 3; // ±3度为兼线
  for (const [mountain, config] of Object.entries(MOUNTAIN_FACING_MAP)) {
    const [start, end] = config.range;
    if (Math.abs(degree - start) <= THRESHOLD || 
        Math.abs(degree - end) <= THRESHOLD) {
      return { isJianXian: true, mountain, offset: Math.min(Math.abs(degree - start), Math.abs(degree - end)) };
    }
  }
  return { isJianXian: false };
}
```

#### 13.1.2 测试数据集规范
- 基础测试集：24山×9运=216个案例
- 兼线测试集：48个边界案例
- 流年测试集：12月×9运=108个案例
- 特殊案例集：替卦、城门诀等20个案例
- 总计：392个标准测试案例

### 13.2 传感器数据规范

#### 13.2.1 噪声模型与阈值
```typescript
interface SensorNoiseModel {
  magnetometer: {
    staticNoise: 2.5,  // 度
    dynamicNoise: 5.0, // 度
    calibrationDrift: 0.1 // 度/小时
  },
  accelerometer: {
    bias: 0.05,  // g
    noise: 0.01  // g RMS
  },
  gyroscope: {
    bias: 0.5,   // 度/秒
    drift: 0.05  // 度/秒/分钟
  }
}

// 卡尔曼滤波参数
const KalmanConfig = {
  Q: [[0.001, 0], [0, 0.003]], // 过程噪声
  R: [[0.1, 0], [0, 0.1]],     // 测量噪声
  P0: [[1, 0], [0, 1]],        // 初始协方差
  x0: [0, 0]                   // 初始状态
};
```

#### 13.2.2 置信度计算公式
```typescript
function calculateConfidence(params: SensorParams): number {
  const weights = {
    calibrationRecency: 0.3,  // 校准时间
    sensorStability: 0.3,     // 传感器稳定性
    environmentNoise: 0.2,    // 环境噪声
    deviceMotion: 0.2         // 设备运动
  };
  
  let confidence = 0;
  confidence += weights.calibrationRecency * (1 - params.hoursSinceCalibration / 24);
  confidence += weights.sensorStability * (1 - params.sensorVariance / 10);
  confidence += weights.environmentNoise * (1 - params.magneticInterference / 100);
  confidence += weights.deviceMotion * (1 - Math.min(params.angularVelocity / 30, 1));
  
  return Math.max(0, Math.min(1, confidence));
}
```

### 13.3 RAG评测体系

#### 13.3.1 评测指标定义
- **召回率@K**: 正确答案在前K个结果中的比例
- **精确率@K**: 前K个结果中相关结果的比例  
- **MRR**: 平均倒数排名
- **拒答率**: 系统主动拒绝回答的比例
- **幻觉率**: 生成内容与知识库矛盾的比例

#### 13.3.2 评测数据集构建
```yaml
test_queries:
  - category: "八字基础"
    queries: 200
    expected_sources: ["三命通会", "滴天髓"]
    
  - category: "风水布局"
    queries: 150
    expected_sources: ["阳宅三要", "八宅明镜"]
    
  - category: "边界案例"
    queries: 50
    expected_behavior: "拒答"
    
  - category: "对抗样本"
    queries: 100
    purpose: "测试幻觉和错误"
```

### 13.4 回归测试与监控

#### 13.4.1 自动化测试流程
```bash
# 每次部署前执行
npm run test:xuankong  # 玄空算法测试
npm run test:compass   # 罗盘传感器测试
npm run test:rag       # RAG系统测试
npm run test:e2e       # 端到端测试
```

#### 13.4.2 线上监控指标
- 算法准确率监控：用户反馈vs计算结果
- 传感器可用性：各设备罗盘功能使用率
- RAG质量：引用准确性、响应时间
- 异常告警：准确率<90%、可用性<80%
```

---

## 五、总结与建议

### 立即行动项（Week 1）
1. **定义玄空核心算法**：补充完整的飞星计算公式
2. **建立测试数据集**：收集300+标准案例
3. **传感器参数标定**：确定噪声模型和滤波参数

### 短期改进（Week 2-3）
1. **实现自动化测试**：覆盖所有核心算法
2. **传感器降级方案**：4级降级链路实现
3. **RAG基准测试**：建立1000条测试query

### 长期优化（Month 2-3）
1. **专家验证体系**：邀请3位风水大师验证
2. **用户反馈闭环**：收集真实案例持续优化
3. **模型持续训练**：基于用户数据改进算法

**核心结论**：PRD v5.0在数据正确性和评测体系方面存在严重空白，必须补充算法定义、测试数据集和评测指标才能保证产品质量。建议将评测体系建设提升为Phase 1的核心任务。