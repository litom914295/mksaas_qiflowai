// NOTE: This file is deprecated. 
// useCreditPackages is a React Hook and should be used directly in components.
// 这个文件已废弃。useCreditPackages 是 React Hook，应该在组件中直接使用。

import type { CreditPackage } from './types';

/**
 * @deprecated Use useCreditPackages() hook directly in your component
 * Get credit packages, used in client components
 * @returns Credit packages
 */
export function getCreditPackagesInClient(): CreditPackage[] {
  // This function cannot work because useCreditPackages is a React Hook
  // and must be called inside a React component
  console.warn('getCreditPackagesInClient is deprecated. Use useCreditPackages() hook in your component instead.');
  return [];
}

/**
 * @deprecated Use useCreditPackages() hook directly in your component
 * Get credit package by id, used in client components
 * @param id - Credit package id
 * @returns Credit package
 */
export function getCreditPackageByIdInClient(
  id: string
): CreditPackage | undefined {
  console.warn('getCreditPackageByIdInClient is deprecated. Use useCreditPackages() hook in your component instead.');
  return undefined;
}
