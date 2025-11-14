/**
 * v2.2 专业版报告 HTML 渲染器
 */
import type { ReportOutput_v2_2 } from '@/types/report-v2.2';

export function renderReportHTML_v2_2(report: ReportOutput_v2_2): string {
  const { meta, summary, strategyMapping, decisionComparison, fengshuiChecklist, hopeTimeline, sixDomains, comparison, appendix } = report;

  const esc = (s?: string) => (s ?? '').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const section = (title: string, content: string) => `
  <section class="section">
    <h2 class="section-title">${esc(title)}</h2>
    ${content}
  </section>`;

  const lifeTheme = `
    <div class="card">
      <div class="card-title">主题</div>
      <div class="card-content">${esc(strategyMapping.lifeTheme.title)}</div>
    </div>
    <div class="card">
      <div class="card-title">摘要</div>
      <div class="card-content">${esc(summary?.lifeThemeTitle || strategyMapping.lifeTheme.title)}</div>
    </div>
    <div class="mt-3">
      ${(strategyMapping.lifeTheme.stages || [])
        .map(
          (st) => `
          <div class="stage">
            <div class="stage-title">${esc(st.ageRange)}</div>
            <div class="stage-content">经历：${esc(st.likelyEvents.join('、'))}；课题：${esc(st.lesson)}</div>
          </div>`
        )
        .join('')}
    </div>`;

  const career = `
    <div class="grid">
      ${strategyMapping.careerMatch
        .map(
          (c) => `
          <div class="card">
            <div class="card-title">${esc(c.career)}</div>
            <div class="card-content">匹配度：${esc(String(c.score))}，依据：${esc(c.rationale)}</div>
          </div>`
        )
        .join('')}
    </div>`;

  const actions = `
    <div class="grid">
      ${(['essential', 'recommended', 'optional'] as const)
        .map((k) => `
          <div class="card">
            <div class="card-title">${k === 'essential' ? '必做项' : k === 'recommended' ? '推荐项' : '加分项'}</div>
            <div class="card-content">
              <ul>
                ${strategyMapping.actions[k]
                  .map((a) => `<li>${esc(a.title)} - ${esc(a.expectedTimeframe || '')} - ${esc(a.expectedImpact || '')}</li>`) 
                  .join('')}
              </ul>
            </div>
          </div>`)
        .join('')}
    </div>`;

  const decision = decisionComparison
    ? `
      <div class="grid">
        ${decisionComparison.options
          .map(
            (o) => `
            <div class="card">
              <div class="card-title">${esc(o.name)}</div>
              <div class="card-content">匹配度：${esc(String(o.matchScore))}；时机：${esc(o.bestTiming)}</div>
            </div>`
          )
          .join('')}
      </div>
      <div class="mt-3">建议：${esc(decisionComparison.recommendation)}（${esc(decisionComparison.recommendationRationale)}）</div>
      ${decisionComparison.nonOptimalRemedies ? `<div class="mt-2">非最优补救：${esc(decisionComparison.nonOptimalRemedies.option)}，关键时机：${esc(decisionComparison.nonOptimalRemedies.keyTiming)}</div>` : ''}
    `
    : '<div class="text-muted">（无决策对比）</div>';

  const checklist = `
    <div class="grid">
      <div class="card">
        <div class="card-title">水位（零神见水）</div>
        <div class="card-content">有利宫位：${esc(fengshuiChecklist.waterPlacement.favorablePalaces.join('、'))}</div>
      </div>
      <div class="card">
        <div class="card-title">山位（正神见山）</div>
        <div class="card-content">有利宫位：${esc(fengshuiChecklist.mountainPlacement.favorablePalaces.join('、'))}</div>
      </div>
    </div>`;

  const hope = `
    <ul>
      <li>短期（${esc(hopeTimeline.shortTerm.timeframe)}）：${esc(hopeTimeline.shortTerm.changes.join('、'))}</li>
      <li>中期（${esc(hopeTimeline.midTerm.timeframe)}）：${esc(hopeTimeline.midTerm.changes.join('、'))}${
        hopeTimeline.midTerm.turningPoint ? `；转折点：${esc(hopeTimeline.midTerm.turningPoint)}` : ''
      }</li>
      <li>长期（${esc(hopeTimeline.longTerm.timeframe)}）：${esc(hopeTimeline.longTerm.changes.join('、'))}</li>
    </ul>`;

  const html = `
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>八字风水专业报告 v2.2 - ${esc(meta.name)}${esc(meta.genderTitle)}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, 'Microsoft YaHei', sans-serif; color: #111827; background:#f3f4f6; }
  .container { max-width: 980px; margin: 0 auto; padding: 24px; background: #fff; }
  .header { text-align: center; padding: 24px 0; border-bottom: 3px solid #8b5cf6; margin-bottom: 24px; }
  .header h1 { margin: 0; font-size: 28px; color: #111827; }
  .header p { margin: 4px 0; color: #6b7280; }
  .section { margin: 24px 0; padding: 16px; background:#f9fafb; border-radius: 8px; }
  .section-title { margin:0 0 12px; font-size: 20px; color: #8b5cf6; border-bottom:1px solid #e5e7eb; padding-bottom:8px; }
  .grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
  .card { background: #fff; border:1px solid #e5e7eb; border-radius:8px; padding:12px; }
  .card-title { font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; }
  .card-content { font-size:14px; color:#111827; }
  .stage { border-left: 3px solid #8b5cf6; padding: 8px 12px; margin: 8px 0; background:#ffffff; }
  .stage-title { font-weight:600; color:#374151; margin-bottom:4px; }
  .muted { color:#6b7280; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>八字风水专业报告 v2.2</h1>
      <p>${esc(meta.name)} ${esc(meta.genderTitle)}｜报告日期：${esc(meta.reportDate)}</p>
      <p class="muted">出生：${esc(meta.birthInfo.date)} ${esc(meta.birthInfo.time)}｜${esc(meta.birthInfo.city)}</p>
    </div>

    ${section('人生主题', lifeTheme)}
    ${section('职业匹配', career)}
    ${section('分级行动方案', actions)}
    ${section('决策对比', decision)}
    ${section('风水 Checklist', checklist)}
    ${section('希望之光', hope)}

    ${section('六大领域', `
      <div class="grid">
        <div class="card"><div class="card-title">天赋</div><div class="card-content">${esc(sixDomains.talent)}</div></div>
        <div class="card"><div class="card-title">事业财运</div><div class="card-content">${esc(sixDomains.careerFinance)}</div></div>
        <div class="card"><div class="card-title">关系</div><div class="card-content">${esc(sixDomains.relationship)}</div></div>
        <div class="card"><div class="card-title">健康</div><div class="card-content">${esc(sixDomains.health)}</div></div>
        <div class="card"><div class="card-title">家庭</div><div class="card-content">${esc(sixDomains.family)}</div></div>
        <div class="card"><div class="card-title">人脉</div><div class="card-content">${esc(sixDomains.network)}</div></div>
      </div>
    `)}

    ${section('对比与验证', `
      <div class="grid">
        <div class="card"><div class="card-title">人群百分位</div><div class="card-content">${esc(comparison.populationPercentile)}</div></div>
        <div class="card"><div class="card-title">格局稀缺度</div><div class="card-content">${esc(comparison.patternRarity)}</div></div>
      </div>
      <div class="card" style="margin-top:8px;">
        <div class="card-title">时机错配提醒</div>
        <div class="card-content">${esc(comparison.timeMisalignmentNote)}</div>
      </div>
    `)}

    ${section('附录', `
      <div class="card"><div class="card-title">术语表</div><div class="card-content">${appendix.glossary ? esc(appendix.glossary) : ''}</div></div>
      <div class="card" style="margin-top:8px;"><div class="card-title">FAQ</div><div class="card-content">${appendix.faq ? esc(appendix.faq) : ''}</div></div>
      <div class="card" style="margin-top:8px;"><div class="card-title">支持联系方式</div><div class="card-content">${appendix.supportContact ? esc(appendix.supportContact) : ''}</div></div>
    `)}

  </div>
</body>
</html>`;

  return html;
}