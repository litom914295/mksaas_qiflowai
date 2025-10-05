'use client';

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number; // 0-4
  suggestions: string[];
}

/**
 * Calculate password strength based on various criteria
 */
function calculatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      strength: 'weak',
      score: 0,
      suggestions: [],
    };
  }

  let score = 0;
  const suggestions: string[] = [];

  // Length check (max 2 points)
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length < 8) {
    suggestions.push('atLeast8Chars');
  }

  // Has lowercase
  if (/[a-z]/.test(password)) {
    score += 0.5;
  } else {
    suggestions.push('addLowercase');
  }

  // Has uppercase
  if (/[A-Z]/.test(password)) {
    score += 0.5;
  } else {
    suggestions.push('addUppercase');
  }

  // Has numbers
  if (/\d/.test(password)) {
    score += 0.5;
  } else {
    suggestions.push('addNumber');
  }

  // Has special characters
  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 0.5;
  } else {
    suggestions.push('addSpecialChar');
  }

  // Determine strength level
  let strength: PasswordStrength;
  if (score <= 1) {
    strength = 'weak';
  } else if (score <= 2.5) {
    strength = 'fair';
  } else if (score <= 3.5) {
    strength = 'good';
  } else {
    strength = 'strong';
  }

  return {
    strength,
    score: Math.min(Math.round(score), 4),
    suggestions: suggestions.slice(0, 2), // Show max 2 suggestions
  };
}

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
  showSuggestions?: boolean;
}

export function PasswordStrengthIndicator({
  password,
  className,
  showSuggestions = true,
}: PasswordStrengthIndicatorProps) {
  const t = useTranslations('AuthPage.register.passwordStrength');

  const result = useMemo(() => calculatePasswordStrength(password), [password]);

  // Don't show anything if password is empty
  if (!password) {
    return null;
  }

  const strengthConfig = {
    weak: {
      label: t('weak'),
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bars: 1,
    },
    fair: {
      label: t('fair'),
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bars: 2,
    },
    good: {
      label: t('good'),
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bars: 3,
    },
    strong: {
      label: t('strong'),
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bars: 4,
    },
  };

  const config = strengthConfig[result.strength];

  return (
    <div className={cn('space-y-2', className)}>
      {/* Strength bars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              bar <= config.bars ? config.color : 'bg-gray-200 dark:bg-gray-700'
            )}
          />
        ))}
      </div>

      {/* Strength label */}
      <div className="flex items-center justify-between">
        <span className={cn('text-xs font-medium', config.textColor)}>
          {t('label')}: {config.label}
        </span>
      </div>

      {/* Suggestions */}
      {showSuggestions && result.suggestions.length > 0 && (
        <ul className="space-y-1 text-xs text-muted-foreground">
          {result.suggestions.map((suggestion) => (
            <li key={suggestion} className="flex items-start gap-1">
              <span className="mt-0.5">•</span>
              <span>{t(suggestion as any)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
