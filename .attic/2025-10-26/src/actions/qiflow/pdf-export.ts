'use server';

import { randomUUID } from 'node:crypto';
import jsPDF from 'jspdf';
import { z } from 'zod';

const InputSchema = z.object({
  type: z.enum(['bazi', 'xuankong']),
  language: z.enum(['zh', 'en']).default('zh'),
  input: z.any().optional(),
  result: z.any(),
  interpretation: z.any().optional(),
});

export async function exportQiflowPdfAction(formData: FormData) {
  const parsed = InputSchema.safeParse({
    type: (formData.get('type') || '').toString() as any,
    language: (formData.get('language') || 'zh') as string as any,
    input: formData.get('input')
      ? JSON.parse(formData.get('input') as string)
      : undefined,
    result: formData.get('result')
      ? JSON.parse(formData.get('result') as string)
      : undefined,
  });

  if (!parsed.success) {
    return {
      ok: false as const,
      error: 'INVALID_INPUT',
      issues: parsed.error.issues,
    };
  }

  const { type, language, input, result, interpretation } = parsed.data;

  // 生成结构化 PDF（可后续扩展图表/多语言更丰富排版）
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;
  let y = margin;

  const pageW = (doc as any).internal?.pageSize?.getWidth?.() ?? 595;
  const pageH = (doc as any).internal?.pageSize?.getHeight?.() ?? 842;
  const contentW = pageW - margin * 2;

  const title =
    type === 'bazi'
      ? language === 'zh'
        ? '八字分析报告'
        : 'Bazi Analysis Report'
      : language === 'zh'
        ? '玄空风水分析报告'
        : 'Xuankong Analysis Report';
  doc.setFontSize(18);
  doc.text(title, margin, y);
  y += 28;

  doc.setFontSize(12);
  const addLine = (t: string) => {
    const lines = doc.splitTextToSize(t, 515);
    lines.forEach((line: string) => {
      if (y > 760) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 18;
    });
  };

  // 目录
  addLine(language === 'zh' ? '目录' : 'Table of Contents');
  addLine('1. ' + (language === 'zh' ? '要点摘要' : 'Key Highlights'));
  addLine('2. ' + (language === 'zh' ? '概览' : 'Overview'));
  addLine('3. ' + (language === 'zh' ? '分析结果' : 'Analysis Result'));
  addLine('4. ' + (language === 'zh' ? '图表' : 'Charts'));

  doc.addPage();
  y = margin;

  // 要点摘要
  addLine(language === 'zh' ? '要点摘要' : 'Key Highlights');
  const highlights =
    type === 'bazi'
      ? [
          `${language === 'zh' ? '四柱' : 'Pillars'}: ${result?.pillars ? Object.keys(result.pillars).length : 0} ${language === 'zh' ? '项' : 'items'}`,
          `${language === 'zh' ? '综合评分' : 'Overall score'}: ${result?.score?.overall ?? '-'}`,
        ]
      : [
          `${language === 'zh' ? '运盘' : 'Period'}: ${result?.geju?.strength ?? '-'}`,
          `${language === 'zh' ? '特征数' : 'Characteristics'}: ${result?.geju?.characteristics?.length ?? 0}`,
        ];
  highlights.forEach((h) => addLine('• ' + h));
  // 阅读指引：五行提示（从图例区移至此处，避免图表页文字拥挤）
  const tipZh =
    '五行提示：木-生发，火-温热，土-承载，金-肃杀，水-润下。仅作色彩参考，不代表最终判断。';
  const tipEn =
    'Five Elements tip: Wood-growth, Fire-heat, Earth-stability, Metal-structure, Water-flow. For color reference only.';
  addLine(language === 'zh' ? '• ' + tipZh : '• ' + tipEn);

  doc.addPage();
  y = margin;

  // 概览
  addLine(language === 'zh' ? '概览' : 'Overview');
  addLine(JSON.stringify({ input }, null, 2));

  doc.addPage();
  y = margin;

  // 分析结果
  addLine(language === 'zh' ? '分析结果' : 'Analysis Result');
  addLine(JSON.stringify(result, null, 2));

  // 评分图（bazi）
  if (type === 'bazi' && result?.score) {
    doc.addPage();
    y = margin;
    addLine(language === 'zh' ? '评分图' : 'Scores');
    const scores: [string, number][] = [
      [
        language === 'zh' ? '综合' : 'Overall',
        Number(result.score.overall || 0),
      ],
      [language === 'zh' ? '财运' : 'Wealth', Number(result.score.wealth || 0)],
      [language === 'zh' ? '事业' : 'Career', Number(result.score.career || 0)],
      [language === 'zh' ? '健康' : 'Health', Number(result.score.health || 0)],
      [
        language === 'zh' ? '感情' : 'Relationship',
        Number(result.score.relationship || 0),
      ],
    ];
    const startX = margin;
    let curY = y;
    scores.forEach(([name, val]) => {
      const width = Math.max(10, Math.min(500, Math.round((val || 0) * 500)));
      doc.text(name, startX, curY);
      doc.setFillColor(60, 130, 230);
      doc.rect(startX + 60, curY - 10, width, 10, 'F');
      curY += 20;
    });
    y = curY + 10;
  }

  // 解读（如有）
  if (interpretation) {
    doc.addPage();
    y = margin;
    addLine(language === 'zh' ? '解读' : 'Interpretation');
    addLine(JSON.stringify(interpretation, null, 2));
  }

  doc.addPage();
  y = margin;

  // 图表（简易绘制）
  addLine(language === 'zh' ? '图表' : 'Charts');

  // Lo Shu 3x3（xuankong）或四柱（bazi）
  const drawGrid = (
    x: number,
    ystart: number,
    size: number,
    values: (string | number)[][]
  ) => {
    const cell = size / 3;
    // 使用浅灰色绘制网格线，提升 PDF 可读性
    doc.setDrawColor(180, 180, 180);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const x0 = x + c * cell;
        const y0 = ystart + r * cell;
        doc.rect(x0, y0, cell, cell);
        const v = values?.[r]?.[c] ?? '';
        doc.setTextColor(0, 0, 0);
        doc.text(String(v), x0 + cell / 2 - 5, y0 + cell / 2);
      }
    }
    doc.setDrawColor(0, 0, 0);
  };

  const drawLoShuGuides = (x: number, ystart: number, size: number) => {
    // 外框与中轴定位线（浅灰）
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(1);
    doc.rect(x, ystart, size, size);
    const cell = size / 3;
    doc.setLineWidth(0.5);
    // 中轴线
    doc.line(x + size / 2, ystart, x + size / 2, ystart + size);
    doc.line(x, ystart + size / 2, x + size, ystart + size / 2);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
  };

  const annotateLoShu = (x: number, ystart: number, size: number) => {
    const labelsZH = {
      nw: '西北(乾)',
      n: '北(坎)',
      ne: '东北(艮)',
      w: '西(兑)',
      c: '中(中)',
      e: '东(震)',
      sw: '西南(坤)',
      s: '南(离)',
      se: '东南(巽)',
    };
    const labelsEN = {
      nw: 'NW (Qian)',
      n: 'N (Kan)',
      ne: 'NE (Gen)',
      w: 'W (Dui)',
      c: 'Center',
      e: 'E (Zhen)',
      sw: 'SW (Kun)',
      s: 'S (Li)',
      se: 'SE (Xun)',
    };
    const L = language === 'zh' ? labelsZH : labelsEN;
    const split2 = (txt: string) => {
      const m = txt.match(/^(.*)\s*\(([^)]+)\)\s*$/);
      if (m) return { line1: m[1], line2: '(' + m[2] + ')' };
      return { line1: txt, line2: '' };
    };
    const cell = size / 3;
    const prevSize = doc.getFontSize();
    const prevColor = [0, 0, 0];
    doc.setTextColor(90, 90, 90);
    // 上方三宫（两行）
    let t = split2(L.nw);
    doc.setFontSize(9);
    doc.text(t.line1, x + 0 * cell + 4, ystart - 8);
    if (t.line2) {
      doc.setFontSize(8);
      doc.text(t.line2, x + 0 * cell + 4, ystart + 2);
    }
    t = split2(L.n);
    doc.setFontSize(9);
    doc.text(t.line1, x + 1 * cell + cell / 2 - 18, ystart - 8);
    if (t.line2) {
      doc.setFontSize(8);
      doc.text(t.line2, x + 1 * cell + cell / 2 - 18, ystart + 2);
    }
    t = split2(L.ne);
    doc.setFontSize(9);
    doc.text(t.line1, x + 2 * cell + cell - 55, ystart - 8);
    if (t.line2) {
      doc.setFontSize(8);
      doc.text(t.line2, x + 2 * cell + cell - 55, ystart + 2);
    }
    // 中轴左右与中宫
    t = split2(L.w);
    doc.setFontSize(9);
    doc.text(t.line1, x - 28, ystart + 1 * cell + cell / 2 - 4);
    if (t.line2) {
      doc.setFontSize(8);
      doc.text(t.line2, x - 28, ystart + 1 * cell + cell / 2 + 6);
    }
    // 中宫单行
    doc.setFontSize(9);
    doc.text(L.c, x + 1 * cell + cell / 2 - 16, ystart + 1 * cell + cell / 2);
    t = split2(L.e);
    doc.setFontSize(9);
    doc.text(t.line1, x + 3 * cell + 8, ystart + 1 * cell + cell / 2 - 4);
    if (t.line2) {
      doc.setFontSize(8);
      doc.text(t.line2, x + 3 * cell + 8, ystart + 1 * cell + cell / 2 + 6);
    }
    // 下方三宫
    t = split2(L.sw);
    doc.setFontSize(9);
    doc.text(t.line1, x + 0 * cell + 4, ystart + 3 * cell + 10);
    if (t.line2) {
      doc.setFontSize(8);
      doc.text(t.line2, x + 0 * cell + 4, ystart + 3 * cell + 20);
    }
    t = split2(L.s);
    doc.setFontSize(9);
    doc.text(t.line1, x + 1 * cell + cell / 2 - 18, ystart + 3 * cell + 10);
    if (t.line2) {
      doc.setFontSize(8);
      doc.text(t.line2, x + 1 * cell + cell / 2 - 18, ystart + 3 * cell + 20);
    }
    t = split2(L.se);
    doc.setFontSize(9);
    doc.text(t.line1, x + 2 * cell + cell - 55, ystart + 3 * cell + 10);
    if (t.line2) {
      doc.setFontSize(8);
      doc.text(t.line2, x + 2 * cell + cell - 55, ystart + 3 * cell + 20);
    }
    // 复原
    doc.setTextColor(prevColor[0], prevColor[1], prevColor[2]);
    doc.setFontSize(prevSize);
  };

  const romanizeStem = (s: string) => {
    const map: Record<string, string> = {
      甲: 'Jia',
      乙: 'Yi',
      丙: 'Bing',
      丁: 'Ding',
      戊: 'Wu',
      己: 'Ji',
      庚: 'Geng',
      辛: 'Xin',
      壬: 'Ren',
      癸: 'Gui',
    };
    return map[s] || s;
  };
  const romanizeBranch = (b: string) => {
    const map: Record<string, string> = {
      子: 'Zi',
      丑: 'Chou',
      寅: 'Yin',
      卯: 'Mao',
      辰: 'Chen',
      巳: 'Si',
      午: 'Wu',
      未: 'Wei',
      申: 'Shen',
      酉: 'You',
      戌: 'Xu',
      亥: 'Hai',
    };
    return map[b] || b;
  };

  const stemColor = (s: string) => {
    // 五行基础配色：木(#2E7D32)、火(#D32F2F)、土(#8D6E63)、金(#F9A825)、水(#1565C0)
    if (/甲|乙|Jia|Yi/i.test(s)) return [46, 125, 50];
    if (/丙|丁|Bing|Ding/i.test(s)) return [211, 47, 47];
    if (/戊|己|Wu|Ji/i.test(s)) return [141, 110, 99];
    if (/庚|辛|Geng|Xin/i.test(s)) return [249, 168, 37];
    if (/壬|癸|Ren|Gui/i.test(s)) return [21, 101, 192];
    return [33, 33, 33];
  };
  const branchColor = (b: string) => {
    // 地支同色系稍微偏淡
    if (
      /子|丑|寅|卯|辰|巳|午|未|申|酉|戌|亥|Zi|Chou|Yin|Mao|Chen|Si|Wu|Wei|Shen|You|Xu|Hai/i.test(
        b
      )
    )
      return [66, 165, 245];
    return [66, 66, 66];
  };

  if (type === 'xuankong') {
    // 构造 3x3（自适应 A4 页面）
    const grid: (string | number)[][] =
      result?.plates &&
      Array.isArray(result.plates) &&
      result.plates.length === 3
        ? result.plates
        : [
            ['', '', ''],
            ['', '', ''],
            ['', '', ''],
          ];
    const gSize = Math.min(300, contentW, Math.floor(pageH * 0.42));
    drawGrid(margin, y, gSize, grid);
    drawLoShuGuides(margin, y, gSize);
    annotateLoShu(margin, y, gSize);
    y += gSize + 30;
  } else {
    // 四柱：画四个盒子 + 颜色编码与图例
    const pillars = result?.pillars ?? {};
    const items = [
      [
        language === 'zh' ? '年柱' : 'Year',
        `${pillars?.year?.heavenly ?? ''}`,
        `${pillars?.year?.earthly ?? ''}`,
      ],
      [
        language === 'zh' ? '月柱' : 'Month',
        `${pillars?.month?.heavenly ?? ''}`,
        `${pillars?.month?.earthly ?? ''}`,
      ],
      [
        language === 'zh' ? '日柱' : 'Day',
        `${pillars?.day?.heavenly ?? ''}`,
        `${pillars?.day?.earthly ?? ''}`,
      ],
      [
        language === 'zh' ? '时柱' : 'Hour',
        `${pillars?.hour?.heavenly ?? ''}`,
        `${pillars?.hour?.earthly ?? ''}`,
      ],
    ] as const;
    let x = margin;
    items.forEach(([label, stemRaw, branchRaw]) => {
      const stem = language === 'zh' ? stemRaw : romanizeStem(stemRaw);
      const branch = language === 'zh' ? branchRaw : romanizeBranch(branchRaw);
      doc.rect(x, y, 120, 70);
      doc.setTextColor(33, 33, 33);
      doc.text(String(label), x + 10, y + 20);
      const [sr, sg, sb] = stemColor(stem);
      const [br, bg, bb] = branchColor(branch);
      doc.setTextColor(sr, sg, sb);
      doc.text(stem, x + 10, y + 42);
      doc.setTextColor(br, bg, bb);
      doc.text(branch, x + 60, y + 42);
      x += 130;
    });
    // 图例
    doc.setTextColor(0, 0, 0);
    const legendY = y + 85;
    doc.text(language === 'zh' ? '图例:' : 'Legend:', margin, legendY);
    // 干/支
    doc.setFillColor(46, 125, 50);
    doc.rect(margin + 45, legendY - 10, 10, 10, 'F');
    doc.text(language === 'zh' ? '天干' : 'Stem', margin + 60, legendY);
    doc.setFillColor(66, 165, 245);
    doc.rect(margin + 110, legendY - 10, 10, 10, 'F');
    doc.text(language === 'zh' ? '地支' : 'Branch', margin + 125, legendY);
    // 五行
    const feY = legendY + 16;
    const L =
      language === 'zh'
        ? ['木', '火', '土', '金', '水']
        : ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
    const colors: [number, number, number][] = [
      [46, 125, 50],
      [211, 47, 47],
      [141, 110, 99],
      [249, 168, 37],
      [21, 101, 192],
    ];
    let lx = margin;
    doc.text(language === 'zh' ? '五行:' : 'Five Elements:', lx, feY);
    lx += 60;
    for (let i = 0; i < L.length; i++) {
      const c = colors[i];
      doc.setFillColor(c[0], c[1], c[2]);
      doc.rect(lx, feY - 10, 10, 10, 'F');
      doc.text(L[i], lx + 14, feY);
      lx += 70;
    }
    y = feY + 14;

    // 天干/地支 微型对照（小号字体）
    const stemsZh = '天干：甲 乙 丙 丁 戊 己 庚 辛 壬 癸';
    const branchesZh = '地支：子 丑 寅 卯 辰 巳 午 未 申 酉 戌 亥';
    const stemsEn = 'Stems: Jia Yi Bing Ding Wu Ji Geng Xin Ren Gui';
    const branchesEn =
      'Branches: Zi Chou Yin Mao Chen Si Wu Wei Shen You Xu Hai';
    const prevSize2 = doc.getFontSize();
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text(language === 'zh' ? stemsZh : stemsEn, margin, y);
    y += 12;
    doc.text(language === 'zh' ? branchesZh : branchesEn, margin, y);
    y += 12;
    doc.setFontSize(prevSize2);
    doc.setTextColor(0, 0, 0);
  }

  // 优先上传到 S3（如配置存在），否则回退 data URI
  const pdfBlob = doc.output('arraybuffer') as ArrayBuffer;
  const pdfBuffer = Buffer.from(pdfBlob);

  let url: string | null = null;
  try {
    const bucket = process.env.S3_BUCKET;
    const region = process.env.S3_REGION;
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
    const endpoint = process.env.S3_ENDPOINT;
    if (bucket && region && accessKeyId && secretAccessKey) {
      // 动态导入，避免无用开销
      const mod = (await import('s3mini')) as any;
      const s3 = new mod.S3Mini({
        bucket,
        region,
        accessKeyId,
        secretAccessKey,
        endpoint,
      });
      const key = `reports/${type}/${randomUUID()}.pdf`;
      url = await s3.putObject({
        Key: key,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
        ACL: 'public-read',
      });
    }
  } catch {}

  if (!url) {
    const dataUri = doc.output('datauristring');
    url = dataUri;
  }

  // 审计（可选）
  try {
    const { getSession } = await import('@/lib/server');
    const { getDb } = await import('@/db');
    const { pdfAudit } = await import('@/db/schema');
    const session = await getSession();
    const userId = session?.user?.id ?? 'anonymous';
    const db = await getDb();
    await db.insert(pdfAudit).values({
      userId,
      fileKey: url.startsWith('data:') ? 'inline-datauri' : 's3-url',
      meta: { type, language, size: url.length },
    });

    // 触发激活检测（PDF导出完成）
    const { tryMarkActivation } = await import('@/lib/growth/activation');
    tryMarkActivation(userId).catch(() => {});
  } catch (_e) {
    // 忽略 DB 或 Next Runtime 错误，避免阻断导出
  }

  return { ok: true as const, url };
}
