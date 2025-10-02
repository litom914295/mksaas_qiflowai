// 调试完整的飞星排盘
import { generateFlyingStar } from './src/lib/fengshui/index.js';

console.log('子山午向九运完整排盘调试:');

const result = generateFlyingStar({
  observedAt: new Date('2024-01-01'),
  facing: { degrees: 180 }, // 子山午向
});

console.log('\n完整排盘结果:');
result.plates.period.forEach(cell => {
  console.log(
    `宫位${cell.palace}: 运星${cell.periodStar} 山星${cell.mountainStar} 向星${cell.facingStar}`
  );
});

console.log('\n特定宫位验证:');
const northPalace = result.plates.period.find(cell => cell.palace === 1); // 坎宫
const southPalace = result.plates.period.find(cell => cell.palace === 9); // 离宫
const centerPalace = result.plates.period.find(cell => cell.palace === 5); // 中宫

console.log(
  `北宫(1宫): 运星${northPalace?.periodStar} 山星${northPalace?.mountainStar} 向星${northPalace?.facingStar}`
);
console.log(
  `南宫(9宫): 运星${southPalace?.periodStar} 山星${southPalace?.mountainStar} 向星${southPalace?.facingStar}`
);
console.log(
  `中宫(5宫): 运星${centerPalace?.periodStar} 山星${centerPalace?.mountainStar} 向星${centerPalace?.facingStar}`
);
