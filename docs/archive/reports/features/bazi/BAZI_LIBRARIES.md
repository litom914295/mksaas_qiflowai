# 八字分析模块使用的库

## 📚 核心依赖库

### 1. **@aharris02/bazi-calculator-by-alvamind** (v1.0.16)

**用途：** 基础八字计算引擎

**功能：**
- 四柱八字计算
- 天干地支转换
- 基础五行分析
- 十神系统

**使用位置：**
- `src/lib/bazi/enhanced-calculator.ts` - 增强型计算器基础
- 作为标准版八字计算的后备方案

**示例：**
```typescript
import { BaziCalculator } from '@aharris02/bazi-calculator-by-alvamind';

const calculator = new BaziCalculator(
  birthDate,
  gender,
  timezone,
  isTimeKnown
);
```

---

### 2. **lunar-javascript** (v1.7.5)

**用途：** 专业级农历转换和节气计算

**功能：**
- 阳历 ↔ 农历转换
- 24节气精确计算
- 干支纪年计算
- 月令判定

**使用位置：**
- `src/lib/bazi-pro/core/calendar/lunar-adapter.ts` - 农历适配器
- `src/lib/bazi-pro/core/calculator/four-pillars.ts` - 专业四柱计算

**核心类：**
```typescript
import { Lunar, Solar } from 'lunar-javascript';

// 阳历转农历
const solar = Solar.fromDate(date);
const lunar = solar.getLunar();

// 获取八字
const bazi = lunarAdapter.getBaZi(date);
// 返回: { year: {gan, zhi}, month: {gan, zhi}, ... }
```

**关键方法：**
- `Solar.fromDate(date)` - 创建阳历对象
- `solar.getLunar()` - 获取农历
- `lunar.getJieQiTable()` - 获取节气表
- `lunar.getYearInGanZhiExact()` - 精确干支年
- `lunar.getMonthInGanZhiExact()` - 精确干支月
- `lunar.getDayInGanZhiExact()` - 精确干支日

---

### 3. **date-fns** (v3.6.0)

**用途：** 日期时间处理工具

**功能：**
- 日期验证
- 日期格式化
- 日期计算

**使用位置：**
- `src/lib/bazi/enhanced-calculator.ts` - 日期验证
- `src/lib/bazi/timezone.ts` - 时区转换

**示例：**
```typescript
import { isValid, format, addYears } from 'date-fns';

// 验证日期
if (!isValid(birthDate)) {
  throw new Error('无效的出生日期');
}
```

---

### 4. **date-fns-tz** (v3.2.0)

**用途：** 时区感知的日期处理

**功能：**
- 时区转换
- 真太阳时计算支持
- 夏令时处理

**使用位置：**
- `src/lib/bazi/timezone.ts` - 时区转换工具
- `src/lib/bazi-pro/core/calculator/true-solar-time.ts` - 真太阳时

**示例：**
```typescript
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

const zonedDate = utcToZonedTime(date, 'Asia/Shanghai');
```

---

## 🔧 内部专业算法模块

### 1. **四柱计算模块**
**路径：** `src/lib/bazi-pro/core/calculator/four-pillars.ts`

**依赖：**
- lunar-javascript (核心)
- true-solar-time (真太阳时修正)

**功能：**
- 99.9% 精度的四柱计算
- 真太阳时修正
- 纳音计算
- 月令判定

---

### 2. **五行强度分析**
**路径：** `src/lib/bazi-pro/core/analyzer/wuxing-strength.ts`

**依赖：**
- 无外部依赖（纯算法）

**功能：**
- 天干地支五行力量计算
- 地支藏干分析
- 日主强弱判定

---

### 3. **用神分析**
**路径：** `src/lib/bazi-pro/core/analyzer/yongshen-analyzer.ts`

**依赖：**
- 五行强度分析
- 月令分析

**功能：**
- 用神、喜神、忌神判定
- 五行平衡分析
- 开运建议生成

---

### 4. **十神系统**
**路径：** `src/lib/bazi-pro/core/calculator/ten-gods.ts`

**依赖：**
- 无外部依赖（纯算法）

**功能：**
- 十神计算（比肩、劫财、食神等）
- 天干地支十神关系
- 性格特征分析

---

### 5. **格局识别**
**路径：** `src/lib/bazi-pro/core/patterns/pattern-detector.ts`

**依赖：**
- 十神系统
- 五行分析

**功能：**
- 正格、从格、化格识别
- 格局强度评估
- 破格因素分析

---

### 6. **神煞系统**
**路径：** `src/lib/bazi-pro/core/shensha/shensha-calculator.ts`

**依赖：**
- 无外部依赖（查表算法）

**功能：**
- 吉神凶煞计算
- 桃花、贵人、劫煞等
- 神煞影响分析

---

### 7. **大运流年**
**路径：** `src/lib/bazi-pro/core/calculator/dayun-liunian.ts`

**依赖：**
- 四柱计算
- 起运岁数计算

**功能：**
- 大运周期计算
- 流年推算
- 运势评分

---

### 8. **智能解读**
**路径：** `src/lib/bazi-pro/interpretation/intelligent-interpreter.ts`

**依赖：**
- 所有分析模块的结果

**功能：**
- AI驱动的命理解读
- 性格、事业、财运、婚姻、健康分析
- 个性化建议生成

---

## 📦 库版本信息

| 库名 | 版本 | 类型 | 用途 |
|------|------|------|------|
| @aharris02/bazi-calculator-by-alvamind | ^1.0.16 | 核心 | 基础八字计算 |
| lunar-javascript | ^1.7.5 | 核心 | 农历转换和节气 |
| date-fns | ^3.6.0 | 工具 | 日期处理 |
| date-fns-tz | ^3.2.0 | 工具 | 时区处理 |

---

## 🔄 数据流程

```
用户输入
    ↓
date-fns (日期验证)
    ↓
date-fns-tz (时区转换)
    ↓
lunar-javascript (农历转换 + 节气)
    ↓
四柱计算 (gan/zhi)
    ↓
┌─────────────────────────────────────┐
│  专业分析模块（并行计算）              │
│  - 五行强度                          │
│  - 用神分析                          │
│  - 十神系统                          │
│  - 格局识别                          │
│  - 神煞计算                          │
│  - 大运流年                          │
└─────────────────────────────────────┘
    ↓
智能解读 (AI分析)
    ↓
数据归一化
    ↓
UI展示
```

---

## 🎯 推荐库版本

### 生产环境推荐

- ✅ **lunar-javascript ^1.7.5** - 稳定且功能完整
- ✅ **date-fns ^3.6.0** - 现代化日期库，性能优秀
- ✅ **date-fns-tz ^3.2.0** - 完善的时区支持

### 可选替代方案

如果需要更换库，可以考虑：

1. **农历计算替代**
   - `lunar-calendar` - 另一个农历库
   - `chinese-lunar` - 轻量级选择

2. **日期处理替代**
   - `dayjs` - 更轻量
   - `moment-timezone` - 老牌选择（较重）

---

## 🔍 库使用检查

### 检查已安装的版本

```bash
npm list @aharris02/bazi-calculator-by-alvamind
npm list lunar-javascript
npm list date-fns
npm list date-fns-tz
```

### 更新依赖

```bash
# 更新所有八字相关依赖
npm update @aharris02/bazi-calculator-by-alvamind lunar-javascript date-fns date-fns-tz

# 或单独更新
npm install @aharris02/bazi-calculator-by-alvamind@latest
npm install lunar-javascript@latest
```

### 检查兼容性

```bash
# 运行类型检查
npm run type-check

# 运行测试
npm test
```

---

## ⚠️ 注意事项

### lunar-javascript 使用要点

1. **返回值格式**
   - `getJieQiTable()` 返回的是对象，键为节气名，值为 Solar 对象
   - 需要调用 `getYear()`, `getMonth()` 等方法获取日期

2. **月份处理**
   - lunar 的月份是闰月时为负数（如 -5 表示闰五月）
   - solar 的月份是 1-12（不是 0-11）

3. **干支获取**
   - 使用 `getYearInGanZhiExact()` 等方法获取精确干支
   - 避免使用 `getYearInGanZhi()` 简化方法

### date-fns 使用要点

1. **时区问题**
   - JavaScript Date 对象是 UTC 时间
   - 使用 date-fns-tz 处理时区转换
   - 避免直接使用 `new Date(string)` 解析

2. **性能优化**
   - date-fns 是 tree-shakable 的
   - 只导入需要的函数，不要导入整个库

---

## 📚 相关文档

- [lunar-javascript GitHub](https://github.com/6tail/lunar-javascript)
- [date-fns 文档](https://date-fns.org/)
- [date-fns-tz 文档](https://github.com/marnusw/date-fns-tz)

---

**更新日期：** 2025-10-21  
**维护者：** QiFlow AI Team
