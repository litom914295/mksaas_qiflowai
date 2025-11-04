/**
 * 简单测试验证Jest配置
 */

describe('Jest配置验证', () => {
  test('基础数学运算', () => {
    expect(2 + 2).toBe(4);
    expect(Math.PI).toBeCloseTo(Math.PI, 4);
  });

  test('字符串操作', () => {
    expect('Hello World').toContain('World');
    expect('test'.toUpperCase()).toBe('TEST');
  });

  test('数组操作', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr).toHaveLength(5);
    expect(arr).toContain(3);
  });
});
