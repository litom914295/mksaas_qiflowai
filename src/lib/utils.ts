import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines Tailwind CSS classes with proper handling of conflicts
 * Uses clsx for conditional classes and tailwind-merge to resolve conflicts
 * @param inputs Class values to merge
 * @returns Merged class string
 * @example
 * cn('px-2 py-1', 'px-4') // Returns: 'py-1 px-4'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique ID with optional prefix
 * Uses timestamp and random string for uniqueness
 * @param prefix Optional prefix for the ID
 * @returns Unique ID string
 * @example
 * generateId() // Returns: 'abc123xyz'
 * generateId('user') // Returns: 'user_abc123xyz'
 */
export function generateId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return prefix
    ? `${prefix}_${timestamp}${randomStr}`
    : `${timestamp}${randomStr}`;
}

/**
 * Format date to locale string (Chinese)
 * Note: This is different from formatter.ts formatDate() which uses YYYY/MM/DD format.
 * This function uses locale-specific formatting.
 * @param date Date to format
 * @param format 'short' for date only, 'long' for date and time
 * @returns Formatted date string in Chinese locale
 */
export function formatDateLocale(
  date: Date | string,
  format: 'short' | 'long' = 'short'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (format === 'short') {
    return d.toLocaleDateString('zh-CN');
  }

  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate age from birth date
 * Accounts for month and day to determine if birthday has passed this year
 * @param birthDate Birth date as Date object or string
 * @returns Age in years
 * @example
 * calculateAge(new Date('1990-01-01')) // Returns current age
 */
export function calculateAge(birthDate: Date | string): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Debounce function to limit how often a function can be called
 * Delays execution until after wait time has elapsed since the last call
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 * @example
 * const debouncedSearch = debounce((term) => search(term), 300)
 * debouncedSearch('query') // Will only execute after 300ms of no calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
