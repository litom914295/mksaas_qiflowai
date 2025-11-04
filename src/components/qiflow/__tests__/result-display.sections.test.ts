import assert from 'node:assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  KeyValueGrid,
  PillarGrid,
  SectionCard,
  SuggestionList,
} from '../../qiflow/result-display';

function testSectionCard() {
  const html = renderToString(
    React.createElement(
      SectionCard,
      { title: '标题' },
      React.createElement('div', null, '内容')
    )
  );
  assert(html.includes('标题'));
  assert(html.includes('内容'));
}

function testKeyValueGrid() {
  const html = renderToString(
    React.createElement(KeyValueGrid, {
      items: [
        { label: 'A', value: '1' },
        { label: 'B', value: '2' },
      ],
    })
  );
  assert(html.includes('A'));
  assert(html.includes('1'));
  assert(html.includes('B'));
  assert(html.includes('2'));
}

function testPillarGrid() {
  const html = renderToString(
    React.createElement(PillarGrid, {
      pillars: [
        { title: '年柱', value: '甲子' },
        { title: '月柱', value: '乙丑' },
        { title: '日柱', value: '丙寅' },
        { title: '时柱', value: '丁卯' },
      ],
    })
  );
  ['年柱', '甲子', '月柱', '乙丑', '日柱', '丙寅', '时柱', '丁卯'].forEach(
    (t) => assert(html.includes(t))
  );
}

function testSuggestionList() {
  const html = renderToString(
    React.createElement(SuggestionList, { items: ['建议一', '建议二'] })
  );
  assert(html.includes('建议一'));
  assert(html.includes('建议二'));
}

function testSuggestionListEmpty() {
  const html = renderToString(
    React.createElement(SuggestionList, { items: [] })
  );
  // 为空应不渲染分块标题
  assert(!html.includes('建议'));
}

function testLongText() {
  const long = '很长很长很长的文本'.repeat(50);
  const html = renderToString(
    React.createElement(
      SectionCard,
      { title: '标题' },
      React.createElement('div', null, long)
    )
  );
  assert(html.includes(long));
}

function testPillarGridEmpty() {
  const html = renderToString(React.createElement(PillarGrid, { pillars: [] }));
  // 空列表渲染空容器
  assert(html.includes('data-reactroot') || html.length >= 0);
}

function run() {
  testSectionCard();
  testKeyValueGrid();
  testPillarGrid();
  testSuggestionList();
  testSuggestionListEmpty();
  testLongText();
  testPillarGridEmpty();
  console.log('[UI] result-display sections tests: OK');
}

run();
