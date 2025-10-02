/**
 * 宫位档案分析
 */

export function generatePalaceProfiles(plate: any): any {
  return {
    profiles: {
      1: { name: '坎宫', characteristics: ['水', '智慧'] },
      2: { name: '坤宫', characteristics: ['土', '包容'] },
      3: { name: '震宫', characteristics: ['木', '行动'] },
      4: { name: '巽宫', characteristics: ['木', '灵活'] },
      5: { name: '中宫', characteristics: ['土', '中心'] },
      6: { name: '乾宫', characteristics: ['金', '领导'] },
      7: { name: '兑宫', characteristics: ['金', '沟通'] },
      8: { name: '艮宫', characteristics: ['土', '稳定'] },
      9: { name: '离宫', characteristics: ['火', '热情'] },
    },
  };
}

