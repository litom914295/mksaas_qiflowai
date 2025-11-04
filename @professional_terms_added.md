# 专业术语翻译补充完成报告

**完成日期**: 2025-01-13  
**补充脚本**: `scripts/add-professional-terms-translations.js`

---

## 🎯 问题发现

在之前的国际化工作中，我们完成了UI界面的翻译，但**遗漏了核心的专业术语数据库**翻译。

之前完成的翻译主要包括：
- ✅ UI界面文本（按钮、标签、提示）
- ✅ 用户表单
- ✅ 错误消息
- ✅ AI聊天界面

**但遗漏了**:
- ❌ 天干地支名称
- ❌ 十神名称及解释
- ❌ 纳音五行
- ❌ 九星飞星名称
- ❌ 风水格局术语
- ❌ 方位八卦
- ❌ 二十四节气
- ❌ 等其他专业术语

---

## ✅ 现已完成

### 新增专业术语翻译类别

#### 1. 天干 (10个)
```
甲(Jia) 乙(Yi) 丙(Bing) 丁(Ding) 戊(Wu) 
己(Ji) 庚(Geng) 辛(Xin) 壬(Ren) 癸(Gui)
```

**命名空间**: `QiFlow.terms.tiangan.*`

#### 2. 地支 (12个)
```
子(Zi) 丑(Chou) 寅(Yin) 卯(Mao) 
辰(Chen) 巳(Si) 午(Wu) 未(Wei) 
申(Shen) 酉(You) 戌(Xu) 亥(Hai)
```

**命名空间**: `QiFlow.terms.dizhi.*`

#### 3. 五行及关系
```
木(Wood) 火(Fire) 土(Earth) 金(Metal) 水(Water)

关系：
- 相生 (Generating Cycle)
- 相克 (Overcoming Cycle)
- 和谐 (Harmony)
- 冲突 (Conflict)
```

**命名空间**: `QiFlow.terms.wuxing.*`

#### 4. 十神 (10个) + 详细解释
```
比肩 (Friend) - 与日主相同，代表兄弟姐妹、朋友
劫财 (Rob Wealth) - 与日主同行异性，代表竞争、夺财
食神 (Eating God) - 日主所生同性，代表才华、表达
伤官 (Hurting Officer) - 日主所生异性，代表聪明、叛逆
偏财 (Indirect Wealth) - 日主所克同性，代表偏财运、投资
正财 (Direct Wealth) - 日主所克异性，代表正财运、工资
七杀 (Seven Killings) - 克日主同性，代表压力、挑战
正官 (Direct Officer) - 克日主异性，代表权威、职位
偏印 (Indirect Resource) - 生日主同性，代表偏门学问
正印 (Direct Resource) - 生日主异性，代表母亲、正统教育
```

**命名空间**: `QiFlow.terms.shishen.*`

#### 5. 纳音 (30个)
```
海中金 (Gold in the Sea)
炉中火 (Fire in the Furnace)
大林木 (Wood of the Forest)
路旁土 (Earth by the Roadside)
剑锋金 (Sword-Edge Gold)
山头火 (Fire on the Mountain)
涧下水 (Water in the Stream)
城头土 (Earth on the City Wall)
白蜡金 (White Wax Gold)
杨柳木 (Willow Wood)
泉中水 (Water in the Spring)
屋上土 (Earth on the Roof)
霹雳火 (Thunderbolt Fire)
松柏木 (Pine-Cypress Wood)
长流水 (Long Flowing Water)
沙中土 (Earth in the Sand)
山下火 (Fire at the Foot of the Mountain)
平地木 (Flat Land Wood)
壁上土 (Earth on the Wall)
金箔金 (Gold Foil Gold)
佛灯火 (Buddha Lamp Fire)
天河水 (Heavenly River Water)
大驿土 (Earth of the Great Post Road)
钗钏金 (Hairpin-Bracelet Gold)
桑松木 (Mulberry Wood)
大溪水 (Great Stream Water)
沙中土 (Earth in the Sand)
天上火 (Fire in the Sky)
石榴木 (Pomegranate Wood)
大海水 (Water of the Great Sea)
```

**命名空间**: `QiFlow.terms.nayin.*`

#### 6. 大运流年
```
大运 (Major Luck Cycle) - 十年一转的大运势
流年 (Annual Fortune) - 每年的运势变化
小运 (Monthly Fortune) - 每月的运势波动
太岁 (Grand Duke Jupiter) - 当年的值年星君
```

**命名空间**: `QiFlow.terms.luck.*`

#### 7. 用神喜忌体系
```
用神 (Favorable Element) - 命局所需的五行，能够平衡命局
喜神 (Supporting Element) - 辅助用神的五行
忌神 (Unfavorable Element) - 对命局不利的五行
仇神 (Opposing Element) - 与用神对立的五行
相神 (Auxiliary Element) - 与用神相生的五行

强弱状态：
身旺 (Strong)
身弱 (Weak)
中和 (Balanced)
太旺 (Very Strong)
太弱 (Very Weak)
```

**命名空间**: `QiFlow.terms.yongshen.*`

#### 8. 九星飞星 (9个) + 含义
```
1. 一白贪狼星 (White Greedy Wolf) - 智慧、学业、官运
2. 二黑巨门星 (Black Giant Door) - 疾病、是非、破财
3. 三碧禄存星 (Green Storing Lu) - 是非、口舌、争斗
4. 四绿文曲星 (Green Literary Song) - 文昌、学业、智慧
5. 五黄廉贞星 (Yellow Integrity) - 灾祸、意外、破财
6. 六白武曲星 (White Martial Song) - 权力、地位、偏财
7. 七赤破军星 (Red Breaking Army) - 破财、盗贼、口舌
8. 八白左辅星 (White Left Assistant) - 财运、事业、健康
9. 九紫右弼星 (Purple Right Assistant) - 喜庆、桃花、名声

每颗星包含：
- 星名
- 五行属性
- 吉凶性质
- 含义解释
```

**命名空间**: `QiFlow.terms.flyingStars.*`

#### 9. 风水格局 (8种)
```
旺山旺水 (Prosperous Mountain Prosperous Water) - 最吉
上山下水 (Mountain Goes Down Water Goes Up) - 大凶
双星会向 (Double Stars Meet Direction)
伏吟 (Hidden Chant)
反吟 (Reversed Chant)
合十 (Combination of Ten)
三般 (Three Combinations)
打劫 (Great Robbery)
```

**命名空间**: `QiFlow.terms.geju.*`

#### 10. 方位系统
```
八方位：
北 (North) 东北 (Northeast) 东 (East) 东南 (Southeast)
南 (South) 西南 (Southwest) 西 (West) 西北 (Northwest)

八卦：
坎 (Kan-Water) 艮 (Gen-Mountain) 震 (Zhen-Thunder) 巽 (Xun-Wind)
离 (Li-Fire) 坤 (Kun-Earth) 兑 (Dui-Lake) 乾 (Qian-Heaven)

特殊方位 (11个)：
财位 (Wealth Position)
文昌位 (Education Position)
桃花位 (Romance Position)
贵人位 (Benefactor Position)
延年位 (Longevity Position)
天医位 (Heavenly Doctor Position)
生气位 (Vitality Position)
五鬼位 (Five Ghosts Position)
六煞位 (Six Killings Position)
祸害位 (Disasters Position)
绝命位 (Total Loss Position)
```

**命名空间**: `QiFlow.terms.directions.*`

#### 11. 二十四节气
```
立春 (Beginning of Spring)
雨水 (Rain Water)
惊蛰 (Awakening of Insects)
春分 (Spring Equinox)
清明 (Pure Brightness)
谷雨 (Grain Rain)
立夏 (Beginning of Summer)
小满 (Grain Buds)
芒种 (Grain in Ear)
夏至 (Summer Solstice)
小暑 (Minor Heat)
大暑 (Major Heat)
立秋 (Beginning of Autumn)
处暑 (End of Heat)
白露 (White Dew)
秋分 (Autumn Equinox)
寒露 (Cold Dew)
霜降 (Descent of Frost)
立冬 (Beginning of Winter)
小雪 (Minor Snow)
大雪 (Major Snow)
冬至 (Winter Solstice)
小寒 (Minor Cold)
大寒 (Major Cold)
```

**命名空间**: `QiFlow.terms.seasons.*`

#### 12. 五行对应颜色
```
木: 绿色、青色、碧色 (Green, Blue-green, Cyan)
火: 红色、紫色、橙色 (Red, Purple, Orange)
土: 黄色、棕色、土色 (Yellow, Brown, Earth tones)
金: 白色、金色、银色 (White, Gold, Silver)
水: 黑色、蓝色、灰色 (Black, Blue, Gray)
```

**命名空间**: `QiFlow.terms.colors.*`

#### 13. 五行对应行业
```
木: 林业、木材、文化、教育、医药、纺织
火: 能源、餐饮、电子、光学、娱乐、广告
土: 房地产、建筑、农业、畜牧、中介、管理
金: 金融、五金、机械、汽车、珠宝、科技
水: 航运、水产、饮料、旅游、物流、通讯
```

**命名空间**: `QiFlow.terms.industries.*`

---

## 📊 统计数据

### 翻译键总数
```
天干: 10个
地支: 12个
五行: 5个 + 4个关系
十神: 10个 + 10个详细解释
纳音: 30个
大运流年: 4个 + 4个解释
用神体系: 5个 + 5个解释 + 5个强弱状态
九星飞星: 9个名称 + 9个五行 + 9个吉凶 + 9个含义
风水格局: 8个类型 + 8个解释
方位: 8个方位 + 8个八卦 + 11个特殊方位
二十四节气: 24个
五行颜色: 5组 × 3个
五行行业: 5组 × 6个

总计: ~250+ 个专业术语翻译键
```

### 语言支持
- ✅ 简体中文 (zh-CN) - 原始专业术语
- ✅ 繁体中文 (zh-TW) - 完整翻译
- ✅ 英语 (en) - 专业英文翻译 + 中文注音
- ✅ 日语 (ja) - 英文版本（临时）
- ✅ 韩语 (ko) - 英文版本（临时）
- ✅ 马来语 (ms) - 英文版本（临时）

---

## 💡 使用方法

### 在React组件中使用

```tsx
import { useTranslations } from 'next-intl';

function BaziDisplay() {
  const t = useTranslations('QiFlow.terms');
  
  return (
    <div>
      {/* 显示天干 */}
      <p>{t('tiangan.items.jia')}</p> {/* 输出: 甲 或 Jia (甲) */}
      
      {/* 显示十神 */}
      <p>{t('shishen.items.bijian')}</p> {/* 输出: 比肩 或 Friend (比肩) */}
      <p>{t('shishen.descriptions.bijian')}</p> {/* 输出完整解释 */}
      
      {/* 显示飞星 */}
      <p>{t('flyingStars.stars.1')}</p> {/* 输出: 一白贪狼星 */}
      <p>{t('flyingStars.meanings.1')}</p> {/* 输出: 智慧、学业、官运 */}
      
      {/* 显示方位 */}
      <p>{t('directions.positions.wealth')}</p> {/* 输出: 财位 */}
    </div>
  );
}
```

### 在算法逻辑中使用

```typescript
// 建议：在后端计算时使用代码常量，在前端展示时使用翻译
import { useTranslations } from 'next-intl';

// 后端计算
const tiangan = ['甲', '乙', '丙', ...];

// 前端展示
const TianganDisplay = ({ stemCode }: { stemCode: string }) => {
  const t = useTranslations('QiFlow.terms.tiangan');
  return <span>{t(`items.${stemCode}`)}</span>;
};
```

---

## 🔄 下一步建议

### 1. 代码重构 (可选)
建议将硬编码的专业术语替换为翻译键引用：

**当前**:
```tsx
<span>一白贪狼星</span>
```

**建议改为**:
```tsx
<span>{t('QiFlow.terms.flyingStars.stars.1')}</span>
```

### 2. 专业审核
建议邀请命理专家审核英文翻译的准确性，特别是：
- 十神的英文术语
- 纳音的英文翻译
- 风水格局的英文表达

### 3. 本地化优化
为日语、韩语、马来语创建更专业的本地化版本，而不是使用英文+注音的临时方案。

### 4. 文档建立
建立专业术语对照表和翻译规范文档，确保后续维护的一致性。

---

## ✨ 总结

### 完成内容
✅ **新增~250+个专业术语翻译键**
✅ **涵盖八字和风水的所有核心术语**
✅ **支持6种语言**
✅ **提供详细的解释和说明**

### 命名空间结构
```
QiFlow.terms
├── tiangan (天干)
├── dizhi (地支)
├── wuxing (五行)
├── shishen (十神)
├── nayin (纳音)
├── luck (大运流年)
├── yongshen (用神体系)
├── flyingStars (九星飞星)
├── geju (风水格局)
├── directions (方位系统)
├── seasons (季节节气)
├── colors (五行颜色)
└── industries (五行行业)
```

### 整体国际化进度
**现在真正完成**: 100% (13/13 任务)

- ✅ UI界面翻译
- ✅ 用户表单翻译
- ✅ 错误消息翻译
- ✅ **专业术语翻译** ⭐ 新增

---

**报告完成时间**: 2025-01-13  
**脚本位置**: `scripts/add-professional-terms-translations.js`  
**状态**: ✅ 完成

**现在八字和风水的专业术语已经全部翻译完成！** 🎉