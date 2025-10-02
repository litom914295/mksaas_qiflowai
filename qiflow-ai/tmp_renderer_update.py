from pathlib import Path
import re

path = Path('src/lib/compass/feng-shui-renderer-enhanced.ts')
text = path.read_text(encoding='utf-8').replace('\r\n', '\n')

def expect(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)

props_pattern = re.compile(
    r"  private stage: Konva.Stage;\n"
    r"  private backgroundLayer: Konva.Layer;\n"
    r"  private compassLayer: Konva.Layer;\n"
    r"  private pointerLayer: Konva.Layer;\n"
    r"  private uiLayer: Konva.Layer;\n"
    r"  \n"
    r"  private theme: OptimizedCompassTheme;\n"
    r"  private config: EnhancedRenderConfig;\n"
    r"  private centerX: number;\n"
    r"  private centerY: number;\n"
    r"  private radius: number;\n"
    r"  \n"
    r"  // ????\n"
    r"  private rotationTween\?: Konva.Tween;\n"
    r"  private currentRotation: number = 0;\n"
    r"  \n"
    r"  // ????\n"
    r"  private frameCount: number = 0;\n"
    r"  private lastFPSUpdate: number = 0;\n"
    r"  private fps: number = 0;\n"
)
new_props = (
    "  private stage: Konva.Stage;\n"
    "  private backgroundLayer: Konva.Layer;\n"
    "  private compassLayer: Konva.Layer;\n"
    "  private pointerLayer: Konva.Layer;\n"
    "  private uiLayer: Konva.Layer;\n\n"
    "  private theme: OptimizedCompassTheme;\n"
    "  private config: EnhancedRenderConfig;\n"
    "  private centerX: number;\n"
    "  private centerY: number;\n"
    "  private radius: number;\n"
    "  private pixelRatio: number;\n"
    "  private pointerGroup: Konva.Group | null = null;\n"
    "  private pointerNeedle?: Konva.Line;\n"
    "  private pointerCenterCircle?: Konva.Circle;\n\n"
    "  // ????\n"
    "  private rotationTween?: Konva.Tween;\n"
    "  private currentRotation: number = 0;\n\n"
    "  // ????\n"
    "  private frameCount: number = 0;\n"
    "  private lastFPSUpdate: number = 0;\n"
    "  private fps: number = 0;\n"
    "  private animationFrameId: number | null = null;\n"
    "  private lastRenderedData: LayerData[] = [];\n"
)
text, count = props_pattern.subn(new_props, text, count=1)
expect(count == 1, 'Property block not found')

# ... rest same as previous script ...

path.write_text(text.replace('\n', '\r\n'), encoding='utf-8')
