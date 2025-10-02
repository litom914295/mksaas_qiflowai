from pathlib import Path
import sys

sys.stdout.reconfigure(encoding='utf-8')

lines = Path('src/components/compass/enhanced-feng-shui-compass.tsx').read_text(encoding='utf-8').splitlines()
for i in range(120, 170):
    print(f"{i+1:03d}: {lines[i]}")
