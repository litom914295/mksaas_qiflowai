import { notFound } from 'next/navigation'
import { getDb } from '@/db'
import { shareRecords } from '@/db/schema'
import { eq } from 'drizzle-orm'

function renderTemplate(shareType?: string) {
  // 简易模板：可按 shareType 扩展多语言与个性化
  const templates: Record<string, { title: string; lines: string[] }> = {
    baziAnalysis: {
      title: '命理今日提醒',
      lines: ['宜：整理计划、与人沟通', '忌：熬夜久坐', '吉时：09:00-11:00', '财位：东南', '建议：顺势而为，勿强求'],
    },
    fengshuiAnalysis: {
      title: '家宅今日指引',
      lines: ['宜：通风采光', '忌：杂物堆放', '吉时：14:00-16:00', '旺位：正南', '建议：动线通畅，气流顺畅'],
    },
    default: {
      title: '今日宜忌',
      lines: ['宜：保持专注', '忌：贸然决策', '吉时：10:00-12:00', '建议：先小事，后大事'],
    },
  }
  return templates[shareType || 'default'] || templates.default
}

export default async function ShareLandingPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id } = await params
  if (!id) notFound()

  const db = await getDb()
  const [rec] = await db.select({ shareType: shareRecords.shareType }).from(shareRecords).where(eq(shareRecords.id, id)).limit(1)
  const tpl = renderTemplate(rec?.shareType)

  // 客户端统计（确保使用访客真实 IP 与浏览器信息）
  const script = `
    (function(){
      const id = ${JSON.stringify(id)};
      function fpHash(s){ let h=0,i,chr; if(s.length===0) return h.toString(); for(i=0;i<s.length;i++){ chr=s.charCodeAt(i); h=((h<<5)-h)+chr; h|=0;} return h.toString(); }
      function getFp(){ try{ const nav = window.navigator || {}; const scr = window.screen || {}; const d = [nav.userAgent, nav.language, nav.platform, nav.hardwareConcurrency, (nav as any).deviceMemory, scr.colorDepth, scr.width+'x'+scr.height, new Date().getTimezoneOffset()].join('|'); return fpHash(d); } catch(e){ return ''; } }
      const fp = getFp();
      // 立即记录点击
      fetch('/api/share/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, step: 'click', fp }) });
      // 停留 N 秒后记录转化
      const ms = 6000; // 与网站配置对齐
      setTimeout(function(){
        fetch('/api/share/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, step: 'convert', fp }) });
      }, ms);
    })();
  `

  return (
    <html>
      <head>
        <title>{tpl.title}</title>
        <meta name="robots" content="noindex" />
      </head>
      <body>
        <div style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'ui-sans-serif, system-ui' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{tpl.title}</h1>
          <ul style={{ color: '#444', lineHeight: 1.9, paddingLeft: 18 }}>
            {tpl.lines.map((t, i) => (<li key={i}>{t}</li>))}
          </ul>
          <p style={{ fontSize: 13, color: '#888', marginTop: 16 }}>提示：停留几秒将帮助分享者获得奖励。</p>
        </div>
        <script dangerouslySetInnerHTML={{ __html: script }} />
      </body>
    </html>
  )
}
