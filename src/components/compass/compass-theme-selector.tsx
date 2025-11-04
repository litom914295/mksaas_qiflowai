'use client';

import { Button } from '@/components/ui/button';
import type { CompassThemeKey } from '@/lib/compass/themes';

export default function CompassThemeSelector({
  onSelect,
  onThemeChange,
  selectedTheme,
  currentTheme,
}: {
  onSelect?: (theme: CompassThemeKey) => void;
  onThemeChange?: (theme: CompassThemeKey) => void;
  selectedTheme?: CompassThemeKey;
  currentTheme?: CompassThemeKey;
}) {
  const theme = currentTheme || selectedTheme || 'compass';
  
  const handleSelect = (themeName: CompassThemeKey) => {
    onSelect?.(themeName);
    onThemeChange?.(themeName);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant={theme === 'compass' ? 'default' : 'outline'}
        onClick={() => handleSelect('compass')}
      >
        罗盘主题
      </Button>
    </div>
  );
}
