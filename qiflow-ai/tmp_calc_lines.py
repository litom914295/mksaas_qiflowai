from pathlib import Path
import sys

sys.stdout.reconfigure(encoding="utf-8")
lines = Path('src/lib/compass/feng-shui-renderer-enhanced.ts').read_text(encoding='utf-8').splitlines()
for idx, line in enumerate(lines, 1):
    if 'private calculateOptimalFontSize' in line:
        for j in range(idx, idx+20):
            print(f"{j:03d}: {lines[j-1]}")
        break
