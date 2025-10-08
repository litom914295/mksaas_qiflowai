import assert from 'node:assert/strict';
import type React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import type { InterpretationView } from '@/components/qiflow/InterpretationView';

function safeRender(el: React.ReactElement) {
  return renderToStaticMarkup(el);
}

// 空数据
{
  const html = safeRender(<InterpretationView data={{}} />)
  assert.ok(typeof html === 'string');
}

// 长文与长数组
{
  const long = '解读内容很长'.repeat(200);
  const data = {
    overview: long,
    highlights: Array.from(
      { length: 20 },
      (_, i) => `HL-${i + 1}-${'很长'.repeat(10)}`
    ),
    suggestions: Array.from(
      { length: 10 },
      (_, i) => `SG-${i + 1}-${'建议'.repeat(8)}`
    ),
    relations: Array.from(
      { length: 8 },
      (_, i) => `十神-${i + 1}-${'关系'.repeat(6)}`
    ),
    nayin: Array.from(
      { length: 8 },
      (_, i) => `纳音-${i + 1}-${'说明'.repeat(6)}`
    ),
    breakdown: Array.from(
      { length: 12 },
      (_, i) => `Period-${i + 1}-${'详解'.repeat(8)}`
    ),
  };
  const html = safeRender(<InterpretationView data={data as any} />)
  assert.ok(html.includes('HL-1'));
}

console.log('[interpretation-view.boundaries.test] OK');
