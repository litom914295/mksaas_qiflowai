// 调试天盘生成算法
import {
    generateTianpan,
    LUOSHU_ORDER,
    shunFei,
} from './src/lib/fengshui/luoshu.js';

console.log('洛书顺序:', LUOSHU_ORDER);

const tianpan = generateTianpan(9);
console.log('\n九运天盘:');
tianpan.forEach(cell => {
  console.log(`宫位 ${cell.palace}: 运星 ${cell.periodStar}`);
});

console.log('\n按洛书顺序验证:');
let current = 9;
for (let i = 0; i < LUOSHU_ORDER.length; i++) {
  const palace = LUOSHU_ORDER[i];
  const cell = tianpan.find(c => c.palace === palace);
  console.log(
    `洛书第${i + 1}步: 宫位${palace} 应该是${current}, 实际是${cell?.periodStar}`
  );
  current = shunFei(current, 1);
}
