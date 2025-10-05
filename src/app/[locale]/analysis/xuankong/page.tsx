'use client';

import { xuankongAnalysisAction } from '@/actions/qiflow/xuankong-analysis';
import { ExportReportButton } from '@/components/qiflow/ExportReportButton';
import { InterpretationPanel } from '@/components/qiflow/InterpretationPanel';
import { LoShuGrid } from '@/components/qiflow/charts/LoShuGrid';
import { ConfidenceBadge } from '@/components/qiflow/compass/ConfidenceBadge';
import { AgeVerification } from '@/components/qiflow/compliance/AgeVerification';
import { DisclaimerBar } from '@/components/qiflow/compliance/DisclaimerBar';
import { CreditsPrice } from '@/components/qiflow/credits-price';
import {
  FormValidator,
  useFormValidation,
} from '@/components/qiflow/form-validator';
import { StatePanel } from '@/components/qiflow/state-panel';
import { YunBreakdown } from '@/components/qiflow/xuankong/YunBreakdown';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trackEvent } from '@/lib/qiflow/analytics';
import { getConfidenceLevel } from '@/lib/qiflow/compass/confidence';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useActionState, useEffect, useMemo, useRef, useState } from 'react';

function ResultPanel(props: { data: any }) {
  const { data } = props;
  const t = useTranslations('QiFlow');
  const lastStatusRef = useRef<string | null>(null);

  useEffect(() => {
    if (!data) return;
    if (data?.ok === false && lastStatusRef.current !== 'error') {
      trackEvent('form_error', { module: 'xuankong', error: data?.error });
      lastStatusRef.current = 'error';
    } else if (data?.ok === true && lastStatusRef.current !== 'success') {
      trackEvent('form_success', {
        module: 'xuankong',
        credits: data?.creditsUsed,
        confidence: data?.confidence,
      });
      lastStatusRef.current = 'success';
    }
  }, [data]);

  if (!data) return null;
  if (data?.ok === false) {
    return (
      <StatePanel
        state="error"
        title="错误"
        description="输入无效"
      />
    );
  }
  const confidence = Number(data?.confidence ?? 0);
  const level = getConfidenceLevel(confidence);
  return (
    <Tabs defaultValue="overview" className="mt-4">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
        <TabsTrigger value="overview" className="text-xs sm:text-sm">
          概览
        </TabsTrigger>
        <TabsTrigger value="details" className="text-xs sm:text-sm">
          详情
        </TabsTrigger>
        <TabsTrigger value="charts" className="text-xs sm:text-sm">
          图表
        </TabsTrigger>
        <TabsTrigger value="interpretation" className="text-xs sm:text-sm">
          解读
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ConfidenceBadge value={confidence} />
            <span className="text-xs text-muted-foreground">
              置信度: {confidence.toFixed(2)}
            </span>
          </div>
          {level === 'low' ? (
            <div className="rounded-lg border bg-card p-3 text-sm">
              <p className="font-medium">置信度较低</p>
              <p className="mt-1 text-muted-foreground">
                由于输入信息不完整，分析结果仅供参考
              </p>
              <ul className="mt-1 list-inside list-disc">
                <li>建议提供更准确的朝向信息</li>
                <li>建议提供详细的地址信息</li>
                <li>建议使用专业罗盘测量</li>
              </ul>
              <ManualFallbackForm />
            </div>
          ) : level === 'medium' ? (
            <div className="rounded-lg border bg-card p-3 text-sm">
              <p className="font-medium">置信度中等</p>
              <ul className="mt-1 list-inside list-disc">
                <li>分析结果基本可靠</li>
                <li>建议结合实际情况参考</li>
              </ul>
            </div>
          ) : (
            <Alert>
              <AlertDescription>分析成功完成</AlertDescription>
            </Alert>
          )}
          <ExportReportButton
            type="xuankong"
            language="zh"
            result={data?.result ?? {}}
          />
        </div>
      </TabsContent>
      <TabsContent value="details">
        <div className="text-sm">
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(data?.result ?? {}, null, 2)}
          </pre>
        </div>
      </TabsContent>
      <TabsContent value="charts">
        <div className="space-y-3">
          <LoShuGrid grid={data?.result?.plates ?? undefined} />
          <YunBreakdown yun={data?.result?.yun} />
        </div>
      </TabsContent>
      <TabsContent value="interpretation">
        <InterpretationPanel
          type="xuankong"
          language="zh"
          result={data?.result ?? {}}
        />
      </TabsContent>
    </Tabs>
  );
}

function ManualFallbackForm() {
  const t = useTranslations('QiFlow');
  return (
    <form className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
      <input
        className="rounded border px-3 py-2"
        placeholder="朝向（度）"
      />
      <input
        className="rounded border px-3 py-2"
        placeholder="朝向（度）"
      />
      <input
        className="rounded border px-3 py-2 md:col-span-2"
        placeholder="备注"
      />
      <button
        type="button"
        className="mt-1 w-fit rounded bg-secondary px-3 py-1 text-secondary-foreground"
      >
        保存手动输入
      </button>
    </form>
  );
}

function XuankongForm() {
  // initial state null; server action returns data object
  const [state, formAction] = useActionState(
    async (_prev: any, formData: FormData) => {
      return await xuankongAnalysisAction(formData);
    },
    null
  );
  const t = useTranslations('QiFlow');
  const startedRef = useRef(false);
  const [started, setStarted] = useState(false);

  // 受控输入 + 校验
  const [address, setAddress] = useState('');
  const [facing, setFacing] = useState('');
  const [canSubmit, setCanSubmit] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);

  const validatorInput = useMemo(
    () => ({
      address,
      facing: facing === '' ? undefined : Number(facing),
      observedAt: new Date().toISOString(),
    }),
    [address, facing]
  );
  const validation = useFormValidation('xuankong', validatorInput);
  useEffect(() => {
    setCanSubmit(validation.canSubmit);
  }, [validation.canSubmit]);

  const search = useSearchParams();
  const uiState =
    (search?.get('ui') as 'empty' | 'error' | 'limited' | 'timeout' | null) ??
    null;
  return (
    <>
      {uiState && <StatePanel state={uiState} />}
      <Card className="mt-4" data-testid="xuankong-form-card">
        <CardHeader>
          <CardTitle className="text-xl">玄空飞星</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            请输入地址与朝向（度）
          </CardDescription>
          <div className="mt-1 text-xs text-muted-foreground">
            预计耗时约 1-2 秒 · 登录后可保存历史记录
          </div>
          <CardAction>
            <CreditsPrice product="xuankong" />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          <form
            action={formAction}
            onSubmit={() => trackEvent('form_submit', { module: 'xuankong' })}
            className="space-y-3"
          >
            <Input
              id="xuankong-address"
              name="address"
              placeholder="地址"
              className={missing.includes('address') ? 'aria-invalid' : ''}
              required
              value={address}
              onChange={(e) => setAddress(e.currentTarget.value)}
              onFocus={() => {
                if (!startedRef.current) {
                  trackEvent('form_start', { module: 'xuankong' });
                  startedRef.current = true;
                  setStarted(true);
                }
              }}
              aria-invalid={missing.includes('address')}
            />
            <Input
              id="xuankong-facing"
              name="facing"
              placeholder="朝向（度）"
              type="number"
              className={missing.includes('facing') ? 'aria-invalid' : ''}
              required
              value={facing}
              onChange={(e) => setFacing(e.currentTarget.value)}
              aria-invalid={missing.includes('facing')}
            />
          </form>
        </CardContent>
        <CardFooter>
          <button
            disabled={!canSubmit}
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            开始分析
          </button>
        </CardFooter>
      </Card>

      {started && !canSubmit && (
        <StatePanel
          state="limited"
          title="建议补充信息"
          description="请补全必要字段以继续"
          actions={
            <button
              type="button"
              className="rounded bg-neutral-800 px-3 py-1 text-white"
              onClick={() => {
                const firstMissing = missing[0];
                const id =
                  firstMissing === 'address'
                    ? 'xuankong-address'
                    : firstMissing === 'facing'
                      ? 'xuankong-facing'
                      : undefined;
                if (id) document.getElementById(id)?.focus();
              }}
            >
              前往补齐必填项
            </button>
          }
        />
      )}

      <FormValidator
        algorithm="xuankong"
        input={validatorInput}
        className="mt-2"
        idMap={{ address: 'xuankong-address', facing: 'xuankong-facing' }}
        onValidationChange={(_ok, _conf, missingFields) =>
          setMissing(missingFields ?? [])
        }
      />

      <ResultPanel data={state} />
    </>
  );
}

export default function Page() {
  const t = useTranslations('QiFlow');
  return (
    <>
      <div className="mx-auto max-w-xl p-6">
        <XuankongForm />
      </div>
      <AgeVerification />
      <DisclaimerBar />
    </>
  );
}
