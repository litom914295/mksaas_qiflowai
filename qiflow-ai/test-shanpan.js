// 测试山盘生成算法
import {
    generateShanpan,
    generateTianpan,
} from './src/lib/fengshui/luoshu.js';

console.log('测试子山山盘生成:');

// 生成九运天盘
const tianpan = generateTianpan(9);
console.log('九运天盘:');
tianpan.forEach(cell => {
  console.log(`宫位${cell.palace}: ${cell.periodStar}星`);
});

// 生成子山山盘
const shanpan = generateShanpan(tianpan, '子', false);
console.log('\n子山山盘:');
shanpan.forEach(cell => {
  console.log(`宫位${cell.palace}: ${cell.mountainStar}星`);
});

// 验证1宫的山星
const shanpan1 = shanpan.find(cell => cell.palace === 1);
console.log(`\n1宫山星: ${shanpan1?.mountainStar} (应该是1)`);
