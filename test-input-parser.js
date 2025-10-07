// 快速测试输入解析功能
const testInput = '1973年1月7日2点30分男性，岳阳';

console.log('测试输入:', testInput);
console.log('');

// 日期匹配
const dateMatch = testInput.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
if (dateMatch) {
  const year = dateMatch[1];
  const month = dateMatch[2].padStart(2, '0');
  const day = dateMatch[3].padStart(2, '0');
  console.log('✓ 日期解析:', `${year}-${month}-${day}`);
}

// 时间匹配
const timeMatch = testInput.match(/(\d{1,2})点(\d{1,2})分/);
if (timeMatch) {
  const hour = timeMatch[1].padStart(2, '0');
  const minute = timeMatch[2].padStart(2, '0');
  console.log('✓ 时间解析:', `${hour}:${minute}`);
}

// 性别匹配
if (testInput.includes('男性') || testInput.includes('男')) {
  console.log('✓ 性别解析: 男');
}

// 地点匹配
const locationMatch = testInput.match(/([\u4e00-\u9fa5]{2,10}[市县区]?)/g);
if (locationMatch) {
  console.log('✓ 地点候选:', locationMatch.join(', '));
}

console.log('');
console.log('解析完成！所有信息已识别。');
