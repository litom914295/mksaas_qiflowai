// 测试文件 - 验证嵌套链接问题是否已修复

import { BrandLogo } from './src/components/qiflow/homepage/BrandLogo';

// 测试用例1：BrandLogo在链接内部时应该不渲染为链接
export function TestCase1() {
  return (
    <a href="/">
      <BrandLogo asLink={false} /> {/* 不应该创建嵌套链接 */}
    </a>
  );
}

// 测试用例2：BrandLogo单独使用时应该渲染为链接
export function TestCase2() {
  return (
    <div>
      <BrandLogo /> {/* 默认渲染为链接 */}
    </div>
  );
}

// 测试用例3：显式设置asLink为true
export function TestCase3() {
  return (
    <div>
      <BrandLogo asLink={true} href="/home" /> {/* 渲染为链接 */}
    </div>
  );
}
