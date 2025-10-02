from pathlib import Path

path = Path('src/components/compass/enhanced-feng-shui-compass.tsx')
lines = path.read_text(encoding='utf-8').splitlines()

def find_line(substr: str) -> int:
    for idx, line in enumerate(lines, 1):
        if substr in line:
            return idx
    return -1

targets = [
    'const initializeRenderer = useCallback',
    'const handleThemeChange = useCallback',
    'const handleRotation = useCallback',
    'rendererRef.current.getPerformanceMetrics',
    'renderer.render(compassData);',
    'rendererRef.current.rotateToAngle(angle);',
]

for target in targets:
    print(f"{target} -> {find_line(target)}")
