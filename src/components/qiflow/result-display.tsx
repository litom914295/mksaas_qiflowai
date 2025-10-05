/**
 * 算法结果展示组件
 * 统一展示八字、玄空风水、罗盘等算法的分析结果
 */

import { StatePanel } from '@/components/qiflow/state-panel';
import { Card, CardContent } from '@/components/ui/card';
import {
  CONFIDENCE_STATES,
  getConfidenceLevel,
} from '@/config/qiflow-thresholds';
import { cn } from '@/lib/utils';
import {
  ConfidenceIndicator,
  ConfidenceProgress,
} from './confidence-indicator';

// 轻量纯函数子组件，提升复用与可测性
export function SectionCard(props: {
  title: string;
  children: React.ReactNode;
}) {
  const { title, children } = props;
  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-2 font-semibold">{title}</h3>
      {children}
    </div>
  );
}

export function KeyValueGrid(props: {
  items: { label: string; value: React.ReactNode }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      {props.items.map((it, i) => (
        <div key={i}>
          {it.label}: {it.value}
        </div>
      ))}
    </div>
  );
}

export function PillarGrid(props: {
  pillars: { title: string; value: string }[];
}) {
  return (
    <div
      className="grid grid-cols-4 gap-2 text-center"
      data-testid="pillars-grid"
    >
      {props.pillars.map((p, i) => (
        <div key={i} className="rounded border bg-card p-2">
          <div className="text-xs text-muted-foreground">{p.title}</div>
          <div className="font-mono">{p.value}</div>
        </div>
      ))}
    </div>
  );
}

export function SuggestionList(props: { items: string[] }) {
  if (!props.items?.length) return null;
  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-2 font-semibold">建议</h3>
      <ul className="space-y-1 text-sm">
        {props.items.map((s, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-0.5 text-muted-foreground">•</span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface BaseResult {
  confidence?: number;
  meta?: {
    algorithm?: string;
    version?: string;
    processingTime?: number;
  };
}

interface BaziResult extends BaseResult {
  type: 'bazi';
  data: {
    birthInfo: {
      datetime: string;
      gender: string;
      timezone: string;
    };
    pillars: {
      year: { heavenly: string; earthly: string };
      month: { heavenly: string; earthly: string };
      day: { heavenly: string; earthly: string };
      hour: { heavenly: string; earthly: string };
    };
    score: {
      overall: number;
      wealth: number;
      career: number;
      health: number;
      relationship: number;
    };
    suggestions: string[];
  };
}

interface XuankongResult extends BaseResult {
  type: 'xuankong';
  data: {
    period: number;
    plates: Record<string, any>;
    evaluation: Record<string, any>;
    geju: {
      type: string;
      strength: number;
      characteristics: string[];
    };
    wenchangwei: number[];
    caiwei: number[];
  };
}

interface CompassResult extends BaseResult {
  type: 'compass';
  data: {
    reading: {
      magnetic: number;
      true: number;
      confidence: 'high' | 'medium' | 'low';
      accuracy: number;
    };
    calibration: {
      magnetic: boolean;
      trueNorth: boolean;
    };
    sensors: {
      accelerometer: boolean;
      magnetometer: boolean;
      gyroscope: boolean;
    };
  };
}

type AlgorithmResult = BaziResult | XuankongResult | CompassResult;

interface ResultDisplayProps {
  result: AlgorithmResult;
  showConfidence?: boolean;
  showDetails?: boolean;
  className?: string;
}

export function ResultDisplay({
  result,
  showConfidence = true,
  showDetails = true,
  className,
}: ResultDisplayProps) {
  const confidence = result.confidence || 0.5;
  const level = getConfidenceLevel(confidence);
  const state = CONFIDENCE_STATES[level];

  // 如果置信度过低，显示拒答状态
  if (level === 'reject') {
    return (
      <StatePanel
        state="limited"
        title={state.label}
        description={state.message}
        className={className}
      />
    );
  }

  return (
    <Card className={cn('', className)} data-testid="qiflow-result-card">
      <CardContent className="space-y-4">
        {/* 置信度指示器 */}
        {showConfidence && (
          <div className="flex items-center justify-between">
            <ConfidenceIndicator confidence={confidence} />
            {result.meta?.processingTime && (
              <span className="text-xs text-gray-500">
                处理时间: {result.meta.processingTime}ms
              </span>
            )}
          </div>
        )}

        {/* 结果内容 */}
        <div className="space-y-4">
          {result.type === 'bazi' && <BaziResultContent result={result} />}
          {result.type === 'xuankong' && (
            <XuankongResultContent result={result} />
          )}
          {result.type === 'compass' && (
            <CompassResultContent result={result} />
          )}
        </div>

        {/* 详细信息 */}
        {showDetails && result.meta && (
          <div className="text-xs text-muted-foreground border-t pt-2">
            <p>算法: {result.meta.algorithm || '未知'}</p>
            <p>版本: {result.meta.version || '未知'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 八字结果内容组件
 */
function BaziResultContent({ result }: { result: BaziResult }) {
  const { data } = result;

  return (
    <div className="space-y-4">
      {/* 基本信息 */}
      <SectionCard title="基本信息">
        <KeyValueGrid
          items={[
            { label: '出生时间', value: data.birthInfo.datetime },
            { label: '性别', value: data.birthInfo.gender },
            { label: '时区', value: data.birthInfo.timezone },
          ]}
        />
      </SectionCard>

      {/* 四柱 */}
      <SectionCard title="四柱八字">
        <PillarGrid
          pillars={[
            {
              title: '年柱',
              value: `${data.pillars.year.heavenly}${data.pillars.year.earthly}`,
            },
            {
              title: '月柱',
              value: `${data.pillars.month.heavenly}${data.pillars.month.earthly}`,
            },
            {
              title: '日柱',
              value: `${data.pillars.day.heavenly}${data.pillars.day.earthly}`,
            },
            {
              title: '时柱',
              value: `${data.pillars.hour.heavenly}${data.pillars.hour.earthly}`,
            },
          ]}
        />
      </SectionCard>

      {/* 评分 */}
      <SectionCard title="综合评分">
        <div className="space-y-2">
          <ConfidenceProgress confidence={data.score.overall} />
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>财运: {Math.round(data.score.wealth * 100)}%</div>
            <div>事业: {Math.round(data.score.career * 100)}%</div>
            <div>健康: {Math.round(data.score.health * 100)}%</div>
            <div>感情: {Math.round(data.score.relationship * 100)}%</div>
          </div>
        </div>
      </SectionCard>

      {/* 建议 */}
      <SuggestionList items={data.suggestions} />
    </div>
  );
}

/**
 * 玄空风水结果内容组件
 */
function XuankongResultContent({ result }: { result: XuankongResult }) {
  const { data } = result;

  return (
    <div className="space-y-4">
      {/* 基本信息 */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-2 font-semibold">玄空风水分析</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>运盘: {data.period}运</div>
          <div>格局: {data.geju.type}</div>
        </div>
      </div>

      {/* 格局分析 */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-2 font-semibold">格局分析</h3>
        <div className="space-y-2">
          <ConfidenceProgress confidence={data.geju.strength} />
          <div className="text-sm">
            <p className="mb-2">特点:</p>
            <ul className="space-y-1" data-testid="geju-characteristics">
              {data.geju.characteristics.map((char, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-0.5 text-muted-foreground">•</span>
                  <span>{char}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 文昌位和财位 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-2 font-semibold">文昌位</h3>
          <div className="text-sm text-muted-foreground">
            {data.wenchangwei.join(', ')}宫
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-2 font-semibold">财位</h3>
          <div className="text-sm text-muted-foreground">
            {data.caiwei.join(', ')}宫
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 罗盘结果内容组件
 */
function CompassResultContent({ result }: { result: CompassResult }) {
  const { data } = result;

  return (
    <div className="space-y-4">
      {/* 读数 */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-2 font-semibold">罗盘读数</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="rounded border bg-card p-3">
            <div className="text-xs text-muted-foreground">磁北</div>
            <div className="text-lg font-mono">
              {data.reading.magnetic.toFixed(1)}°
            </div>
          </div>
          <div className="rounded border bg-card p-3">
            <div className="text-xs text-muted-foreground">真北</div>
            <div className="text-lg font-mono">
              {data.reading.true.toFixed(1)}°
            </div>
          </div>
        </div>
        <div className="mt-2 text-center">
          <ConfidenceProgress confidence={data.reading.accuracy} />
        </div>
      </div>

      {/* 传感器状态 */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-2 font-semibold">传感器状态</h3>
        <div
          className="grid grid-cols-3 gap-2 text-sm"
          data-testid="compass-sensors-grid"
        >
          <div className="flex items-center gap-2">
            <span
              className={
                data.sensors.accelerometer ? 'text-green-500' : 'text-red-500'
              }
            >
              {data.sensors.accelerometer ? '✅' : '❌'}
            </span>
            <span>加速度计</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={
                data.sensors.magnetometer ? 'text-green-500' : 'text-red-500'
              }
            >
              {data.sensors.magnetometer ? '✅' : '❌'}
            </span>
            <span>磁力计</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={
                data.sensors.gyroscope ? 'text-green-500' : 'text-red-500'
              }
            >
              {data.sensors.gyroscope ? '✅' : '❌'}
            </span>
            <span>陀螺仪</span>
          </div>
        </div>
      </div>

      {/* 校准状态 */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-2 font-semibold">校准状态</h3>
        <div
          className="grid grid-cols-2 gap-2 text-sm"
          data-testid="compass-calibration-grid"
        >
          <div className="flex items-center gap-2">
            <span
              className={
                data.calibration.magnetic ? 'text-green-500' : 'text-yellow-500'
              }
            >
              {data.calibration.magnetic ? '✅' : '⚠️'}
            </span>
            <span>磁偏角校准</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={
                data.calibration.trueNorth
                  ? 'text-green-500'
                  : 'text-yellow-500'
              }
            >
              {data.calibration.trueNorth ? '✅' : '⚠️'}
            </span>
            <span>真北校准</span>
          </div>
        </div>
      </div>
    </div>
  );
}
