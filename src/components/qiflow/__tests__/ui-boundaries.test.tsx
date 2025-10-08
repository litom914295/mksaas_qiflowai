import assert from 'node:assert/strict';
import type React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import type { NaYinList } from '@/components/qiflow/bazi/NaYinList';
import type { TenGodsList } from '@/components/qiflow/bazi/TenGodsList';
import type { LoShuGrid } from '@/components/qiflow/charts/LoShuGrid';
import type { PillarsChart } from '@/components/qiflow/charts/PillarsChart';
import type { StatePanel } from '@/components/qiflow/state-panel';

function safeRender(el: React.ReactElement) {
  return renderToStaticMarkup(el);
}

// LoShuGrid: 空与正常边界
{
  const html = safeRender(<LoShuGrid grid={undefined as any} />)
  assert.ok(typeof html === 'string');
}
{
  const grid = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
  ];
  const html = safeRender(<LoShuGrid grid={grid as any} />)
  assert.ok(html.includes('1'));
}

// PillarsChart: 空与基本对象
{
  const html = safeRender(<PillarsChart pillars={undefined as any} />)
  assert.ok(typeof html === 'string');
}
{
  const pillars = {
    year: { heavenly: '甲', earthly: '子' },
    month: { heavenly: '乙', earthly: '丑' },
    day: { heavenly: '丙', earthly: '寅' },
    hour: { heavenly: '丁', earthly: '卯' },
  };
  const html = safeRender(<PillarsChart pillars={pillars as any} />)
  assert.ok(typeof html === 'string');
}

// TenGodsList: 空与长文
{
  const html = safeRender(<TenGodsList tenGods={{}} />)
  assert.ok(typeof html === 'string');
}
{
  const longVal =
    '非常非常非常非常非常非常非常非常长的说明文本，用于测试渲染换行与溢出处理。';
  const ten = { 正财: longVal, 偏财: longVal, 比肩: longVal };
  const html = safeRender(<TenGodsList tenGods={ten as any} />)
  assert.ok(html.includes('正财'));
}

// NaYinList: 空与长文
{
  const html = safeRender(<NaYinList items={[]} />)
  assert.ok(typeof html === 'string');
}
{
  const items = [{ pillar: '甲子', nayin: '金箔金 — ' + '很长'.repeat(50) }];
  const html = safeRender(<NaYinList items={items as any} />)
  assert.ok(html.includes('甲子'));
}

// StatePanel: 各状态 SSR
{
  const states = ['empty', 'error', 'limited', 'timeout'] as const;
  for (const s of states) {
    const html = safeRender(<StatePanel state={s} />)
    assert.ok(typeof html === 'string');
  }
}

console.log('[ui-boundaries.test] OK');
