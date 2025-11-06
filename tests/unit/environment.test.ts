import { describe, expect, test } from 'vitest';

describe('测试环境基础验证', () => {
  test('Node.js 环境正常', () => {
    expect(process.version).toBeDefined();
    expect(process.env.NODE_ENV).toBe('test');
  });

  test('环境变量正确设置', () => {
    expect(process.env.NEXT_PUBLIC_BASE_URL).toBe('http://localhost:3000');
  });

  test('基础数学运算', () => {
    expect(1 + 1).toBe(2);
    expect(true).toBe(true);
  });

  test('异步操作正常', async () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => resolve('done'), 10);
    });
    const result = await promise;
    expect(result).toBe('done');
  });

  test('数组操作正常', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });

  test('对象操作正常', () => {
    const obj = { name: 'test', value: 123 };
    expect(obj).toHaveProperty('name');
    expect(obj.value).toBe(123);
  });

  test('字符串操作正常', () => {
    const str = 'Hello World';
    expect(str).toMatch(/Hello/);
    expect(str.toLowerCase()).toBe('hello world');
  });

  test('错误处理正常', () => {
    const throwError = () => {
      throw new Error('Test error');
    };
    expect(throwError).toThrow('Test error');
  });
});