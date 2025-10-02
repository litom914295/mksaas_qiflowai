$path = "src/lib/compass/feng-shui-renderer-enhanced.ts"
$content = Get-Content -Raw -LiteralPath $path

$patternProps = "  private stage: Konva.Stage;`r`n  private backgroundLayer: Konva.Layer;`r`n  private compassLayer: Konva.Layer;`r`n  private pointerLayer: Konva.Layer;`r`n  private uiLayer: Konva.Layer;`r`n  `r`n  private theme: OptimizedCompassTheme;`r`n  private config: EnhancedRenderConfig;`r`n  private centerX: number;`r`n  private centerY: number;`r`n  private radius: number;`r`n  `r`n  // ????`r`n  private rotationTween?: Konva.Tween;`r`n  private currentRotation: number = 0;`r`n  `r`n  // ????`r`n  private frameCount: number = 0;`r`n  private lastFPSUpdate: number = 0;`r`n  private fps: number = 0;`r`n"
$replacementProps = "  private stage: Konva.Stage;`r`n  private backgroundLayer: Konva.Layer;`r`n  private compassLayer: Konva.Layer;`r`n  private pointerLayer: Konva.Layer;`r`n  private uiLayer: Konva.Layer;`r`n`r`n  private theme: OptimizedCompassTheme;`r`n  private config: EnhancedRenderConfig;`r`n  private centerX: number;`r`n  private centerY: number;`r`n  private radius: number;`r`n  private pixelRatio: number;`r`n  private pointerGroup: Konva.Group | null = null;`r`n  private pointerNeedle?: Konva.Line;`r`n  private pointerCenterCircle?: Konva.Circle;`r`n`r`n  // ????`r`n  private rotationTween?: Konva.Tween;`r`n  private currentRotation: number = 0;`r`n`r`n  // ????`r`n  private frameCount: number = 0;`r`n  private lastFPSUpdate: number = 0;`r`n  private fps: number = 0;`r`n  private animationFrameId: number | null = null;`r`n  private lastRenderedData: LayerData[] = [];`r`n"

if ($content -notlike "*private pixelRatio: number;*") {
  $content = $content.Replace($patternProps, $replacementProps)
}

Set-Content -LiteralPath $path -Value $content
