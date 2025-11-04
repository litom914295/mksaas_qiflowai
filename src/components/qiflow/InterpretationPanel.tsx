'use client';

import { generateQiflowInterpretation } from '@/actions/qiflow/interpretation';
import { ExportReportButton } from '@/components/qiflow/ExportReportButton';
import { InterpretationView } from '@/components/qiflow/InterpretationView';
import { useActionState } from 'react';

export function InterpretationPanel({
  type,
  language = 'zh',
  result,
}: { type: 'bazi' | 'xuankong'; language?: 'zh' | 'en'; result: unknown }) {
  const [state, action] = useActionState(
    async (_prev: any, formData: FormData) => {
      return await generateQiflowInterpretation(formData);
    },
    null
  );

  return (
    <div className="space-y-2">
      <form action={action} className="inline-flex items-center gap-2">
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="language" value={language} />
        <input
          type="hidden"
          name="result"
          value={JSON.stringify(result || {})}
        />
        <button
          type="submit"
          className="rounded bg-neutral-800 px-3 py-1 text-white"
        >
          生成解读
        </button>
      </form>
      {state?.ok && <InterpretationView data={state.data} />}
      {state?.ok && (
        <ExportReportButton
          type={type}
          language={language}
          result={result}
          interpretation={state.data}
        />
      )}
    </div>
  );
}
