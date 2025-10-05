'use client';

import { calculateBaziAction } from '@/actions/qiflow/calculate-bazi';
import {
  FormValidator,
  useFormValidation,
} from '@/components/qiflow/form-validator';
import { StatePanel } from '@/components/qiflow/state-panel';
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
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ExportReportButton } from '@/components/qiflow/ExportReportButton';
import { InterpretationPanel } from '@/components/qiflow/InterpretationPanel';
import { NaYinList } from '@/components/qiflow/bazi/NaYinList';
import { TenGodsList } from '@/components/qiflow/bazi/TenGodsList';
import { PillarsChart } from '@/components/qiflow/charts/PillarsChart';
import { AgeVerification } from '@/components/qiflow/compliance/AgeVerification';
import { DisclaimerBar } from '@/components/qiflow/compliance/DisclaimerBar';
// 直接导入组件，不使用动态导入
import { CreditsPrice } from '@/components/qiflow/credits-price';

function ResultPanel(props: { data: any }) {
  const { data } = props;
  const t = useTranslations() as any;
  const lastStatusRef = useRef<string | null>(null);

  useEffect(() => {
    if (!data) return;
    if (data?.ok === false && lastStatusRef.current !== 'error') {
      trackEvent('form_error', { module: 'bazi', error: data?.error });
      lastStatusRef.current = 'error';
    } else if (data?.ok === true && lastStatusRef.current !== 'success') {
      trackEvent('form_success', {
        module: 'bazi',
        credits: data?.creditsUsed,
      });
      lastStatusRef.current = 'success';
    }
  }, [data]);

  if (!data) return null;
  if (data?.ok === false) {
    return (
      <div className="space-y-2">
        <StatePanel
          state="error"
          title={t('States.error.title')}
          description={t('Common.invalidInput')}
        />
        {/* 调试信息 */}
        <div className="space-y-2">
          <div className="text-xs text-red-600 p-3 bg-red-50 dark:bg-red-900/20 rounded space-y-2">
            <div>
              <strong>错误类型:</strong> {data.error}
            </div>
            {data.issues && data.issues.length > 0 && (
              <div>
                <strong>验证错误:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {data.issues.map((issue: any, index: number) => (
                    <li key={index}>
                      <strong>{issue.path.join('.')}</strong>: {issue.message}
                      {issue.code && (
                        <span className="text-gray-600">
                          {' '}
                          (代码: {issue.code})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-2 pt-2 border-t border-red-200">
              <strong>完整数据:</strong>
              <pre className="mt-1 text-xs overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <Tabs defaultValue="overview" className="mt-4">
      <TabsList>
        <TabsTrigger value="overview">概览</TabsTrigger>
        <TabsTrigger value="details">详细</TabsTrigger>
        <TabsTrigger value="charts">图表</TabsTrigger>
        <TabsTrigger value="interpretation">解读</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Card>
          <CardContent className="text-sm space-y-2">
            <div>
              {t('BaziPage.result.completed', { credits: data?.creditsUsed })}
            </div>
            <div>
              {t('BaziPage.result.user', { userId: data?.userId ?? 'unknown' })}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('BaziPage.result.pillarsHint', {
                pillars: JSON.stringify(data?.result?.pillars),
              })}
            </div>
            <ExportReportButton
              type="bazi"
              language="zh"
              result={data?.result ?? {}}
            />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="details">
        <Card>
          <CardContent>
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(data?.result ?? {}, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="charts">
        <div className="space-y-3">
          <PillarsChart pillars={data?.result?.pillars} />
          <TenGodsList
            tenGods={data?.result?.tenGods ?? data?.result?.ten_gods}
          />
          <NaYinList items={data?.result?.naYin ?? data?.result?.na_yin} />
        </div>
      </TabsContent>
      <TabsContent value="interpretation">
        <InterpretationPanel
          type="bazi"
          language="zh"
          result={data?.result ?? {}}
        />
      </TabsContent>
    </Tabs>
  );
}

function BaziForm() {
  const [state, formAction] = useActionState(
    async (_prev: any, formData: FormData) => {
      // 调试：记录表单数据
      console.log('表单提交数据:', {
        name: formData.get('name'),
        birth: formData.get('birth'),
        gender: formData.get('gender'),
      });
      return await calculateBaziAction(formData);
    },
    null
  );
  const t = useTranslations() as any;
  const startedRef = useRef(false);
  const birthDateRef = useRef<Date | undefined>(undefined);
  const birthTimeRef = useRef<string>('');
  const [started, setStarted] = useState(false);

  // 受控输入 + 校验
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [birthTime, setBirthTime] = useState<string>('');
  const [gender, setGender] = useState('male');
  const [canSubmit, setCanSubmit] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);

  const validatorInput = useMemo(
    () => ({
      datetime: birth,
      gender,
      timezone: 'Asia/Shanghai',
    }),
    [birth, gender]
  );
  const validation = useFormValidation('bazi', validatorInput);

  useEffect(() => {
    setCanSubmit(validation.canSubmit && name.trim().length > 0);
  }, [validation.canSubmit, name]);

  const handleDateChange = useCallback((d: Date | undefined) => {
    console.log(
      'handleDateChange 收到的日期:',
      d,
      'getFullYear:',
      d?.getFullYear()
    );
    setBirthDate(d);
    birthDateRef.current = d;
    if (d) {
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      console.log('解析后:', { year, month, day });
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      console.log('格式化后的日期字符串:', dateStr);
      // 使用 ref 获取当前时间值，如果没有则使用默认时间 12:00
      const currentTime = birthTimeRef.current || '12:00';
      const combined = `${dateStr} ${currentTime}`;
      console.log('最终组合:', combined);
      setBirth(combined);
    } else {
      setBirth('');
    }
  }, []);

  const handleTimeChange = useCallback((t: string) => {
    console.log('handleTimeChange 收到的时间:', t);
    // 清理时间格式，移除 AM/PM 如果存在
    const cleanTime = t.replace(/\s*(AM|PM)$/i, '').trim();
    console.log('清理后的时间:', cleanTime);
    setBirthTime(cleanTime);
    birthTimeRef.current = cleanTime;
    // 使用 ref 获取当前日期值，避免依赖
    const currentDate = birthDateRef.current;
    if (currentDate && cleanTime) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      const combined = `${dateStr} ${cleanTime}`;
      console.log('时间变化后的组合:', combined);
      setBirth(combined);
    }
  }, []);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.currentTarget.value);
    },
    []
  );

  const handleBirthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBirth(e.currentTarget.value);
    },
    []
  );

  const handleGenderChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setGender(e.target.value);
    },
    []
  );

  const search = useSearchParams();
  const uiState =
    (search?.get('ui') as 'empty' | 'error' | 'limited' | 'timeout' | null) ??
    null;
  return (
    <>
      {uiState && <StatePanel state={uiState} />}
      <Card className="mt-4" data-testid="bazi-form-card">
        <CardHeader>
          <CardTitle className="text-xl">{t('BaziPage.title')}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {t('BaziPage.form.description')}
          </CardDescription>
          <div className="mt-1 text-xs text-muted-foreground">
            {t('BaziPage.form.meta.time')} · {t('BaziPage.form.meta.save')}
          </div>
          <CardAction>
            <CreditsPrice product="bazi" />
            {/* 测试按钮 */}
            <button
              type="button"
              onClick={() => {
                console.log('=== 开始填充测试数据 ===');
                // 设置测试数据
                const testDate = new Date(1990, 0, 1); // 1990-01-01
                const testTime = '08:30';
                const testName = '测试用户';
                const testGender = 'male';

                console.log('测试日期对象:', testDate);
                console.log('测试时间:', testTime);

                // 填充姓名
                setName(testName);

                // 填充日期
                setBirthDate(testDate);
                birthDateRef.current = testDate;

                // 填充时间
                setBirthTime(testTime);
                birthTimeRef.current = testTime;

                // 组合日期和时间
                const dateStr = `${testDate.getFullYear()}-${String(testDate.getMonth() + 1).padStart(2, '0')}-${String(testDate.getDate()).padStart(2, '0')}`;
                const combined = `${dateStr} ${testTime}`;
                console.log('组合后的 birth:', combined);
                setBirth(combined);

                // 填充性别
                setGender(testGender);

                console.log('=== 测试数据填充完成 ===');
                console.log('最终状态:', {
                  name: testName,
                  birth: combined,
                  gender: testGender,
                });
              }}
              className="ml-2 text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              🧪 填充测试数据
            </button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          <form
            action={formAction}
            onSubmit={() => trackEvent('form_submit', { module: 'bazi' })}
            className="space-y-3"
          >
            <Input
              name="name"
              placeholder={t('BaziPage.form.name')}
              required
              value={name}
              onChange={handleNameChange}
              onFocus={() => {
                if (!startedRef.current) {
                  trackEvent('form_start', { module: 'bazi' });
                  startedRef.current = true;
                  setStarted(true);
                }
              }}
            />
            {/* 日期时间输入 - 使用原生 HTML5 控件确保兼容性 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">出生日期和时间</label>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {/* 原生日期选择器 */}
                <input
                  type="date"
                  value={
                    birthDate
                      ? `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`
                      : ''
                  }
                  onChange={(e) => {
                    const dateValue = e.target.value; // YYYY-MM-DD
                    if (dateValue) {
                      const [year, month, day] = dateValue
                        .split('-')
                        .map(Number);
                      const date = new Date(year, month - 1, day);
                      console.log(
                        '原生日期选择:',
                        dateValue,
                        '-> Date对象:',
                        date
                      );
                      handleDateChange(date);
                    } else {
                      handleDateChange(undefined);
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-md text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                {/* 原生时间选择器 */}
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => {
                    console.log('原生时间选择:', e.target.value);
                    handleTimeChange(e.target.value);
                  }}
                  className="w-full px-3 py-2 border rounded-md text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              {/* 隐藏的组合字段用于表单提交 */}
              <input
                type="hidden"
                id="bazi-birth"
                name="birth"
                value={birth}
                required
              />
              {/* 显示当前组合值（调试用） */}
              <div className="text-xs text-muted-foreground">
                当前值: {birth || '(未设置)'}
              </div>
            </div>
            {/* 使用原生 select 元素避免无限循环 */}
            <select
              id="bazi-gender"
              name="gender"
              value={gender}
              onChange={handleGenderChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${missing.includes('gender') ? 'border-destructive' : 'border-gray-300'}`}
            >
              <option value="male">{t('BaziPage.form.gender.male')}</option>
              <option value="female">{t('BaziPage.form.gender.female')}</option>
            </select>

            {/* 提交按钮 */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t('BaziPage.form.submit')}
              </button>
              {/* 调试信息 */}
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-xs space-y-1">
                <div>
                  <strong>调试信息:</strong>
                </div>
                <div>
                  ✓ canSubmit: <strong>{canSubmit.toString()}</strong>
                </div>
                <div>
                  ✓ name: <strong>"{name}"</strong> (长度: {name.length})
                </div>
                <div>
                  ✓ birth: <strong>"{birth}"</strong> (长度: {birth.length})
                </div>
                <div>
                  ✓ gender: <strong>{gender}</strong>
                </div>
                <div>
                  ✓ validation.canSubmit:{' '}
                  <strong>{validation.canSubmit.toString()}</strong>
                </div>
                <div>
                  ✓ validation.isValid:{' '}
                  <strong>{validation.isValid.toString()}</strong>
                </div>
                <div className="mt-2 pt-2 border-t">
                  {canSubmit ? '✅ 表单可以提交' : '⚠️ 表单不能提交'}
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          {t('BaziPage.form.meta.time')} · {t('BaziPage.form.meta.save')}
        </CardFooter>
      </Card>

      {started && !canSubmit && (
        <StatePanel
          state="limited"
          title={t('States.limited.title')}
          description={t('States.limited.desc')}
          actions={
            <button
              type="button"
              className="rounded bg-secondary px-3 py-1 text-secondary-foreground"
              onClick={() => {
                const firstMissing = missing[0];
                const id =
                  firstMissing === 'datetime'
                    ? 'bazi-birth'
                    : firstMissing === 'gender'
                      ? 'bazi-gender'
                      : undefined;
                if (id) document.getElementById(id)?.focus();
              }}
            >
              {t('Common.fixOrFill')}
            </button>
          }
        />
      )}

      <FormValidator
        algorithm="bazi"
        input={validatorInput}
        className="mt-2"
        idMap={{ datetime: 'bazi-birth', gender: 'bazi-gender' }}
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
        <BaziForm />
      </div>
      <AgeVerification />
      <DisclaimerBar />
    </>
  );
}
