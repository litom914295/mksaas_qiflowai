'use client';

import { exportQiflowPdfAction } from '@/actions/qiflow/pdf-export';
import { useActionState } from 'react';

export function ExportReportButton({
  type,
  language = 'zh',
  result,
  input,
  interpretation,
}: {
  type: 'bazi' | 'xuankong';
  language?: 'zh' | 'en';
  result: unknown;
  input?: unknown;
  interpretation?: unknown;
}) {
  const [state, formAction] = useActionState(
    async (_prev: any, formData: FormData) => {
      const res = await exportQiflowPdfAction(formData);
      return res;
    },
    null
  );

  return (
    <div className="mt-2">
      <form action={formAction} className="inline-flex items-center gap-2">
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="language" value={language} />
        {input !== undefined && (
          <input type="hidden" name="input" value={JSON.stringify(input)} />
        )}
        <input
          type="hidden"
          name="result"
          value={JSON.stringify(result ?? {})}
        />
        {typeof interpretation !== 'undefined' && (
          <input
            type="hidden"
            name="interpretation"
            value={JSON.stringify(interpretation)}
          />
        )}
        <button
          type="submit"
          className="rounded bg-neutral-800 px-3 py-1 text-white"
        >
          生成详细报告
        </button>
        {state?.ok && state?.url && (
          <a
            className="text-sm underline text-blue-600"
            href={state.url}
            target="_blank"
            rel="noreferrer"
          >
            下载报告
          </a>
        )}
      </form>
    </div>
  );
}
