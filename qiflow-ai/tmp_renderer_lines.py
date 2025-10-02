from pathlib import Path
import sys

sys.stdout.reconfigure(encoding='utf-8')

path = Path('src/lib/compass/feng-shui-renderer-enhanced.ts')
lines = path.read_text(encoding='utf-8').splitlines()

def print_block(start: int, end: int):
    for i in range(start-1, end):
        print(f"{i+1:03d}: {lines[i]}")

print_block(90, 150)
