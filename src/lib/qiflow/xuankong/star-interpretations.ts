/**
 * 飞星解读数据库
 * 提供详细的飞星含义、吉凶分析、组合解读等
 */

import type { FlyingStar } from './types';

// 九星基本信息
export const STAR_INFO = {
  1: {
    name: '一白贪狼星',
    element: '水',
    nature: '吉',
    shortMeaning: '智慧、学业、官运',
    fullMeaning:
      '一白水星主智慧聪明，利文昌学业，亦主桃花姻缘。当旺时主科甲功名，事业顺利。失令时主孤独、桃花劫。',
    characteristics: ['智慧灵活', '文昌学业', '人际交往', '桃花姻缘'],
    favorable: ['书房', '文昌位', '卧室', '客厅'],
    unfavorable: ['厨房', '厕所'],
    enhancement: ['放置文昌塔', '摆放水晶球', '增加水元素装饰'],
    mitigation: ['避免过多水元素', '加强土元素', '保持整洁明亮'],
  },
  2: {
    name: '二黑巨门星',
    element: '土',
    nature: '凶',
    shortMeaning: '疾病、是非、破财',
    fullMeaning:
      '二黑土星为病符星，主疾病伤灾，是非口舌。当旺时可旺财，失令时主病灾、小人是非、破财损丁。',
    characteristics: ['疾病灾祸', '是非口舌', '破财损丁', '阴邪之气'],
    favorable: [],
    unfavorable: ['卧室', '书房', '客厅', '大门'],
    enhancement: [],
    mitigation: ['放置铜葫芦', '挂六帝钱', '增加金属装饰', '保持明亮通风'],
  },
  3: {
    name: '三碧禄存星',
    element: '木',
    nature: '凶',
    shortMeaning: '是非、口舌、争斗',
    fullMeaning:
      '三碧木星主是非口舌，官讼争斗。当旺时利进取拼搏，失令时主官非诉讼、盗贼小人、家宅不宁。',
    characteristics: ['是非口舌', '官讼纠纷', '盗贼小人', '争执不和'],
    favorable: [],
    unfavorable: ['大门', '卧室', '书房'],
    enhancement: [],
    mitigation: ['放置红色物品', '增加火元素', '挂红色中国结', '避免绿色过多'],
  },
  4: {
    name: '四绿文曲星',
    element: '木',
    nature: '吉',
    shortMeaning: '文昌、学业、智慧',
    fullMeaning:
      '四绿木星为文曲星，主文昌学业，智慧才华。当旺时利考试升学、创作文艺，失令时主桃花劫、酒色财气。',
    characteristics: ['文昌学业', '智慧才华', '艺术创作', '姻缘桃花'],
    favorable: ['书房', '文昌位', '学习区域', '办公室'],
    unfavorable: ['厨房', '厕所'],
    enhancement: ['摆放文昌笔', '放置绿色植物', '增加木元素装饰'],
    mitigation: ['避免过多桃花', '加强火元素', '保持规整'],
  },
  5: {
    name: '五黄廉贞星',
    element: '土',
    nature: '凶',
    shortMeaning: '灾祸、意外、破财',
    fullMeaning:
      '五黄土星为大凶之星，主凶灾祸患、意外伤亡。当旺时可旺财，但失令时主大凶大灾、破财损丁、疾病横祸。',
    characteristics: ['凶灾祸患', '意外伤亡', '疾病横祸', '破财损丁'],
    favorable: [],
    unfavorable: ['卧室', '大门', '客厅', '书房'],
    enhancement: [],
    mitigation: ['挂六帝钱或铜风铃', '放置金属饰品', '避免动土', '保持安静'],
  },
  6: {
    name: '六白武曲星',
    element: '金',
    nature: '吉',
    shortMeaning: '权力、地位、偏财',
    fullMeaning:
      '六白金星主权力地位，武职功名。当旺时利升迁晋职、经商致富、偏财横财，失令时主刑伤、孤寡、破财。',
    characteristics: ['权力地位', '武职功名', '偏财横财', '领导能力'],
    favorable: ['办公室', '客厅', '财位', '大门'],
    unfavorable: ['厨房', '厕所'],
    enhancement: ['摆放金属摆件', '放置水晶球', '增加白色装饰'],
    mitigation: ['避免火元素过多', '增加水元素', '保持整洁'],
  },
  7: {
    name: '七赤破军星',
    element: '金',
    nature: '凶',
    shortMeaning: '破财、盗贼、口舌',
    fullMeaning:
      '七赤金星主破财口舌，盗贼火灾。当旺时利口才交际、娱乐享受，失令时主破财损失、盗贼火灾、桃花劫。',
    characteristics: ['破财损失', '盗贼火灾', '口舌是非', '桃花纷争'],
    favorable: [],
    unfavorable: ['财位', '卧室', '大门'],
    enhancement: [],
    mitigation: ['放置水元素', '挂蓝色窗帘', '增加水饰品', '避免红色'],
  },
  8: {
    name: '八白左辅星',
    element: '土',
    nature: '吉',
    shortMeaning: '财运、事业、健康',
    fullMeaning:
      '八白土星为当运财星，主财运亨通，事业顺利。当旺时主大发财富、置业兴家、喜庆添丁，失令时主破财疾病。',
    characteristics: ['财运亨通', '事业顺利', '置业兴家', '喜庆添丁'],
    favorable: ['财位', '大门', '客厅', '办公室'],
    unfavorable: ['厕所'],
    enhancement: ['放置聚宝盆', '摆放水晶', '增加黄色装饰', '保持明亮'],
    mitigation: ['避免木元素过多', '增加火元素', '保持整洁'],
  },
  9: {
    name: '九紫右弼星',
    element: '火',
    nature: '吉',
    shortMeaning: '喜庆、桃花、名声',
    fullMeaning:
      '九紫火星主喜庆吉祥，桃花姻缘。当旺时主升职加薪、喜事临门、名声显赫，失令时主火灾、眼疾、血光之灾。',
    characteristics: ['喜庆吉祥', '桃花姻缘', '名声显赫', '升职加薪'],
    favorable: ['客厅', '喜庆位', '桃花位'],
    unfavorable: ['厨房', '卧室（防桃花过旺）'],
    enhancement: ['增加红色装饰', '摆放鲜花', '点红色灯饰'],
    mitigation: ['避免火元素过多', '增加土元素', '保持通风'],
  },
};

// 飞星组合解读
export interface StarCombination {
  combination: string;
  name: string;
  nature: '大吉' | '吉' | '平' | '凶' | '大凶';
  meaning: string;
  effects: string[];
  advice: string[];
}

// 常见飞星组合（山向组合）
export const STAR_COMBINATIONS: StarCombination[] = [
  // 吉利组合
  {
    combination: '1-6',
    name: '一六共宗',
    nature: '大吉',
    meaning: '水金相生，文武双全，利科甲功名，财运亨通',
    effects: ['学业有成', '事业顺利', '名利双收', '贵人相助'],
    advice: ['适合设置书房或办公室', '可摆放文昌塔和聚宝盆', '保持整洁明亮'],
  },
  {
    combination: '1-8',
    name: '一八同宫',
    nature: '大吉',
    meaning: '水土相克但主财运，利置业兴家，子孙昌盛',
    effects: ['财运亨通', '置业顺利', '子孙兴旺', '家庭和睦'],
    advice: ['适合设置财位', '可摆放聚宝盆和水晶', '增加土元素装饰'],
  },
  {
    combination: '1-9',
    name: '一九合十',
    nature: '吉',
    meaning: '水火既济，文武兼备，喜庆临门',
    effects: ['喜事连连', '名利双收', '人际和谐', '事业发展'],
    advice: ['适合设置客厅或会客区', '保持明亮', '适当增加红色装饰'],
  },
  {
    combination: '6-8',
    name: '六八财局',
    nature: '大吉',
    meaning: '金土相生，当运财星，主大发横财，富贵双全',
    effects: ['财运极旺', '事业成功', '地位提升', '投资获利'],
    advice: ['最宜设置财位或大门', '摆放金元宝或聚宝盆', '保持整洁明亮'],
  },
  {
    combination: '8-9',
    name: '八九合十',
    nature: '大吉',
    meaning: '土火相生，喜庆盈门，利姻缘添丁，事业兴旺',
    effects: ['喜事频传', '姻缘美满', '添丁进口', '事业顺利'],
    advice: ['适合设置喜庆位或桃花位', '增加红色装饰', '摆放鲜花'],
  },

  // 凶险组合
  {
    combination: '2-3',
    name: '二三斗牛',
    nature: '大凶',
    meaning: '土木相克，官非口舌，是非争斗，主破财损丁',
    effects: ['是非口舌', '官司纠纷', '破财损失', '健康受损'],
    advice: ['避免在此方位设置重要房间', '挂红色中国结化解', '增加火元素'],
  },
  {
    combination: '2-5',
    name: '二五交加',
    nature: '大凶',
    meaning: '双土重叠，病符加煞，主疾病死亡，破财大凶',
    effects: ['疾病缠身', '意外灾祸', '破财严重', '家宅不宁'],
    advice: ['绝对避免卧室或大门', '挂六帝钱或铜葫芦', '增加金属饰品'],
  },
  {
    combination: '2-7',
    name: '二七同宫',
    nature: '凶',
    meaning: '土金相生但主火灾盗贼，破财损失',
    effects: ['火灾隐患', '盗贼侵扰', '破财损失', '是非口舌'],
    advice: ['避免厨房或财位', '增加水元素', '注意防火防盗'],
  },
  {
    combination: '3-5',
    name: '三五同行',
    nature: '大凶',
    meaning: '木土相克，病符加煞，主疾病官非，祸患连连',
    effects: ['疾病灾祸', '官非诉讼', '破财损丁', '家运衰败'],
    advice: ['避免重要房间', '挂红色物品化解', '增加火元素'],
  },
  {
    combination: '3-7',
    name: '三七相见',
    nature: '凶',
    meaning: '木金相克，盗贼侵扰，破财口舌，手足受伤',
    effects: ['盗贼火灾', '手足受伤', '破财损失', '口舌是非'],
    advice: ['注意防盗', '增加水元素', '避免大门或财位'],
  },
  {
    combination: '5-7',
    name: '五七交加',
    nature: '大凶',
    meaning: '土金相生但主凶灾，破财损丁，火灾盗贼',
    effects: ['凶灾祸患', '火灾盗贼', '破财严重', '意外伤亡'],
    advice: ['绝对避免重要房间', '挂六帝钱', '注意防火防盗'],
  },
  {
    combination: '5-9',
    name: '五九毒药',
    nature: '凶',
    meaning: '土火相生但主疾病，毒药火灾，健康受损',
    effects: ['疾病缠身', '火灾隐患', '毒药伤害', '健康问题'],
    advice: ['避免卧室和厨房', '增加金属饰品', '保持通风明亮'],
  },
];

// 根据山星和向星获取组合解读
export function getStarCombination(
  mountainStar: FlyingStar,
  facingStar: FlyingStar
): StarCombination | null {
  const key1 = `${mountainStar}-${facingStar}`;
  const key2 = `${facingStar}-${mountainStar}`;

  return (
    STAR_COMBINATIONS.find(
      (c) => c.combination === key1 || c.combination === key2
    ) || null
  );
}

// 获取单个飞星的吉凶评级
export function getStarRating(star: FlyingStar): '吉星' | '凶星' | '中性' {
  if ([1, 4, 6, 8, 9].includes(star)) return '吉星';
  if ([2, 3, 5, 7].includes(star)) return '凶星';
  return '中性';
}

// 获取飞星的当旺状态（简化版，实际应根据运星计算）
export function getStarStatus(
  star: FlyingStar,
  period = 9
): '旺' | '生' | '退' | '死' | '煞' {
  // 简化判断：当前九运，8、9为旺星，1、6为生星，2、3为退星，4、5为死星，7为煞星
  if (period === 9) {
    if ([8, 9].includes(star)) return '旺';
    if ([1, 6].includes(star)) return '生';
    if ([2, 3].includes(star)) return '退';
    if ([4, 5].includes(star)) return '死';
    if (star === 7) return '煞';
  }
  return '生'; // 默认
}

// 获取宫位的综合评分（0-100）
export function calculatePalaceScore(
  mountainStar: FlyingStar,
  facingStar: FlyingStar,
  periodStar: FlyingStar
): number {
  let score = 50; // 基础分

  // 根据飞星吉凶加减分
  const starScores = {
    1: 15,
    4: 15,
    6: 18,
    8: 20,
    9: 18,
    2: -15,
    3: -12,
    5: -20,
    7: -15,
  };

  score += starScores[mountainStar] || 0;
  score += starScores[facingStar] || 0;
  score += (starScores[periodStar] || 0) * 0.5; // 天盘星权重较小

  // 检查组合
  const combination = getStarCombination(mountainStar, facingStar);
  if (combination) {
    if (combination.nature === '大吉') score += 20;
    else if (combination.nature === '吉') score += 10;
    else if (combination.nature === '凶') score -= 10;
    else if (combination.nature === '大凶') score -= 20;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

// 获取宫位的详细建议
export function getStarInterpretation(star: FlyingStar, period?: number): any {
  const info = STAR_INFO[star];
  const isWang = period ? star === period : false;
  const status = isWang ? '旺' : '生'; // 简化判断

  return {
    number: star,
    name: info.name,
    alias: info.name.slice(2), // 取名称的简称
    wuxing: info.element,
    jixiong: info.nature as '吉' | '凶',
    status: status as any,
    meaning: {
      wang: info.fullMeaning,
      shuai: info.fullMeaning,
    },
  };
}

export function getPalaceAdvice(
  mountainStar: FlyingStar,
  facingStar: FlyingStar,
  periodStar: FlyingStar
): {
  favorable: string[];
  unfavorable: string[];
  enhancement: string[];
  mitigation: string[];
} {
  const mountainInfo = STAR_INFO[mountainStar];
  const facingInfo = STAR_INFO[facingStar];
  const combination = getStarCombination(mountainStar, facingStar);

  return {
    favorable: [
      ...new Set([...mountainInfo.favorable, ...facingInfo.favorable]),
    ],
    unfavorable: [
      ...new Set([...mountainInfo.unfavorable, ...facingInfo.unfavorable]),
    ],
    enhancement: combination?.advice || [
      ...new Set([...mountainInfo.enhancement, ...facingInfo.enhancement]),
    ],
    mitigation: [
      ...new Set([...mountainInfo.mitigation, ...facingInfo.mitigation]),
    ],
  };
}
