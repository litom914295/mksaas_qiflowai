// 手动验证九运天盘
console.log('九运天盘应该是:');
console.log('中心(5宫): 9星');
console.log('西北(6宫): 1星');
console.log('西(7宫): 2星');
console.log('东北(8宫): 3星');
console.log('南(9宫): 4星');
console.log('北(1宫): 5星');
console.log('西南(2宫): 6星');
console.log('东(3宫): 7星');
console.log('东南(4宫): 8星');

console.log('\n洛书顺序: [5, 6, 7, 8, 9, 1, 2, 3, 4]');
console.log('按此顺序顺飞9星:');

let current = 9;
const luoshuOrder = [5, 6, 7, 8, 9, 1, 2, 3, 4];
for (let i = 0; i < luoshuOrder.length; i++) {
  const palace = luoshuOrder[i];
  console.log(`宫位${palace}: ${current}星`);
  current = ((current - 1 + 1) % 9) + 1; // 顺飞1步
}
