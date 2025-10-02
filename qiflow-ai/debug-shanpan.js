// 调试山盘生成
console.log('子山午向九运山盘分析:');

// 九运天盘
console.log('九运天盘:');
const tianpan = [
  { palace: 1, periodStar: 5 }, // 北
  { palace: 2, periodStar: 6 }, // 西南
  { palace: 3, periodStar: 7 }, // 东
  { palace: 4, periodStar: 8 }, // 东南
  { palace: 5, periodStar: 9 }, // 中
  { palace: 6, periodStar: 1 }, // 西北
  { palace: 7, periodStar: 2 }, // 西
  { palace: 8, periodStar: 3 }, // 东北
  { palace: 9, periodStar: 4 }, // 南
];

tianpan.forEach(cell => {
  console.log(`宫位${cell.palace}: ${cell.periodStar}星`);
});

console.log('\n子山分析:');
console.log('子山对应坎宫(1宫)');
console.log('1宫天盘飞星: 5星');
console.log('5星对应中宫，中宫为阳');
console.log('子山为天元龙');
console.log('阳星配天元龙 → 顺飞');

console.log('\n午山分析:');
console.log('午山对应离宫(9宫)');
console.log('9宫天盘飞星: 4星');
console.log('4星对应巽宫，巽宫为阴');
console.log('午山为天元龙');
console.log('阴星配天元龙 → 逆飞');

console.log('\n按洛书顺序顺飞5星:');
let current = 5;
const luoshuOrder = [5, 6, 7, 8, 9, 1, 2, 3, 4];
for (let i = 0; i < luoshuOrder.length; i++) {
  const palace = luoshuOrder[i];
  console.log(`宫位${palace}: ${current}星`);
  current = ((current - 1 + 1) % 9) + 1; // 顺飞1步
}

console.log('\n按洛书顺序逆飞4星:');
current = 4;
for (let i = 0; i < luoshuOrder.length; i++) {
  const palace = luoshuOrder[i];
  console.log(`宫位${palace}: ${current}星`);
  current = ((current - 1 - 1 + 9) % 9) + 1; // 逆飞1步
}
