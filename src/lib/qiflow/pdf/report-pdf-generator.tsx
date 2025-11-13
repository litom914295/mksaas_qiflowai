/**
 * PDF渲染服务 - 将报告转换为高质量PDF
 *
 * 技术栈: @react-pdf/renderer
 * 目标: 生成时间 < 5秒, 文件大小 < 2MB
 * 支持: 中文字体, 复杂布局, 图表渲染
 */

import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import type React from 'react';
import type { SynthesisOutput } from '../ai/synthesis-prompt';
import type { EssentialReportOutput } from '../reports/essential-report';

/**
 * 注册中文字体（Noto Sans SC）
 * 如果字体文件不存在，将降级使用系统字体
 */
try {
  Font.register({
    family: 'Noto Sans SC',
    fonts: [
      {
        src: '/fonts/NotoSansSC-Regular.ttf',
        fontWeight: 'normal',
      },
      {
        src: '/fonts/NotoSansSC-Bold.ttf',
        fontWeight: 'bold',
      },
    ],
  });
} catch (error) {
  console.warn('[PDF] 中文字体加载失败，将使用降级方案');
}

/**
 * PDF样式定义
 */
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Noto Sans SC',
    fontSize: 11,
    lineHeight: 1.6,
    color: '#333333',
  },

  // 封面样式
  coverPage: {
    padding: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 10,
    textAlign: 'center',
  },
  coverDate: {
    fontSize: 12,
    color: '#999999',
    marginTop: 40,
  },

  // 内容页样式
  header: {
    marginBottom: 30,
    paddingBottom: 15,
    borderBottom: '2 solid #e0e0e0',
  },
  chapterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495e',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    marginBottom: 12,
    textAlign: 'justify',
  },

  // 列表样式
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 10,
  },
  listBullet: {
    width: 20,
    color: '#3498db',
  },
  listContent: {
    flex: 1,
  },

  // 表格样式
  table: {
    marginTop: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  tableHeaderRow: {
    backgroundColor: '#f8f9fa',
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: '#495057',
  },

  // 高亮框样式
  highlightBox: {
    backgroundColor: '#fff8e1',
    padding: 15,
    marginVertical: 15,
    borderLeft: '4 solid #ffc107',
  },
  warningBox: {
    backgroundColor: '#ffebee',
    padding: 15,
    marginVertical: 15,
    borderLeft: '4 solid #f44336',
  },
  successBox: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    marginVertical: 15,
    borderLeft: '4 solid #4caf50',
  },

  // 页脚样式
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 9,
    color: '#999999',
    textAlign: 'center',
    borderTop: '1 solid #e0e0e0',
    paddingTop: 10,
  },
});

/**
 * PDF文档输入接口
 */
interface ReportPDFInput {
  report: EssentialReportOutput;
  userInfo: {
    name?: string;
    birthDate: string;
    birthTime: string;
    birthPlace?: string;
  };
  houseInfo?: {
    facing: string;
    mountain: string;
  };
}

/**
 * 封面组件
 */
const CoverPage: React.FC<{ userInfo: ReportPDFInput['userInfo'] }> = ({
  userInfo,
}) => (
  <Page size="A4" style={styles.coverPage}>
    <Text style={styles.coverTitle}>
      {userInfo.name ? `${userInfo.name}的` : ''}命理与风水分析报告
    </Text>

    <View style={{ marginTop: 40 }}>
      <Text style={styles.coverSubtitle}>出生日期：{userInfo.birthDate}</Text>
      <Text style={styles.coverSubtitle}>出生时间：{userInfo.birthTime}</Text>
      {userInfo.birthPlace && (
        <Text style={styles.coverSubtitle}>
          出生地点：{userInfo.birthPlace}
        </Text>
      )}
    </View>

    <Text style={styles.coverDate}>
      生成日期：{new Date().toLocaleDateString('zh-CN')}
    </Text>

    <Text
      style={{
        position: 'absolute',
        bottom: 40,
        fontSize: 10,
        color: '#999999',
      }}
    >
      本报告由 QiFlowAI 智能生成 | qiflow.ai
    </Text>
  </Page>
);

/**
 * 章节内容组件
 */
const ChapterPage: React.FC<{
  title: string;
  content: string;
  pageNumber: number;
}> = ({ title, content, pageNumber }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.chapterTitle}>{title}</Text>
    </View>

    <View>
      {content.split('\n\n').map((paragraph, index) => (
        <Text key={index} style={styles.paragraph}>
          {paragraph.trim()}
        </Text>
      ))}
    </View>

    <Text style={styles.footer}>
      第 {pageNumber} 页 | QiFlowAI 智能分析报告
    </Text>
  </Page>
);

/**
 * 人宅合一分析章节
 */
const SynthesisChapter: React.FC<{
  synthesis: SynthesisOutput;
  pageNumber: number;
}> = ({ synthesis, pageNumber }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.chapterTitle}>🌟 人宅合一分析</Text>
    </View>

    {/* 超级吉位 */}
    {synthesis.superLuckySpots.length > 0 && (
      <View>
        <Text style={styles.sectionTitle}>✨ 超级吉位发现</Text>
        {synthesis.superLuckySpots.map((spot, index) => (
          <View key={index} style={styles.successBox}>
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
              📍 位置：{spot.location}
            </Text>
            <Text style={{ fontSize: 10, marginBottom: 5 }}>
              能量分析：{spot.energyAnalysis.baziElement} ×{' '}
              {spot.energyAnalysis.fengshuiStar}星 （
              {spot.energyAnalysis.resonanceType}）
            </Text>
            <Text style={{ fontSize: 10, marginTop: 5, fontWeight: 'bold' }}>
              利用建议：
            </Text>
            {spot.utilizationAdvice.map((advice, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.listBullet}>•</Text>
                <Text style={styles.listContent}>{advice}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    )}

    {/* 风险区域 */}
    {synthesis.riskZones.length > 0 && (
      <View style={{ marginTop: 20 }}>
        <Text style={styles.sectionTitle}>⚠️ 风险区域警报</Text>
        {synthesis.riskZones.map((zone, index) => (
          <View key={index} style={styles.warningBox}>
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
              📍 位置：{zone.location} （
              {zone.conflictAnalysis.severity === 'high'
                ? '高风险'
                : zone.conflictAnalysis.severity === 'medium'
                  ? '中风险'
                  : '低风险'}
              ）
            </Text>
            <Text style={{ fontSize: 10, marginBottom: 5 }}>
              冲突：{zone.conflictAnalysis.baziTaboo} ×{' '}
              {zone.conflictAnalysis.fengshuiNegativity}
            </Text>
            <Text style={{ fontSize: 10, marginTop: 5, fontWeight: 'bold' }}>
              化解方案：
            </Text>
            {zone.resolutionMethods.slice(0, 2).map((method, i) => (
              <View key={i} style={{ marginTop: 5, marginLeft: 10 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
                  {method.priority}. {method.method} {method.difficulty}
                </Text>
                {method.steps.map((step, j) => (
                  <View key={j} style={styles.listItem}>
                    <Text style={styles.listBullet}>•</Text>
                    <Text style={[styles.listContent, { fontSize: 9 }]}>
                      {step}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}
      </View>
    )}

    <Text style={styles.footer}>
      第 {pageNumber} 页 | QiFlowAI 智能分析报告
    </Text>
  </Page>
);

/**
 * 布局建议章节
 */
const LayoutAdviceChapter: React.FC<{
  advice: SynthesisOutput['layoutAdvice'];
  pageNumber: number;
}> = ({ advice, pageNumber }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.chapterTitle}>💡 核心布局建议</Text>
    </View>

    {advice.map((item, index) => (
      <View key={index} style={styles.highlightBox}>
        <Text style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 8 }}>
          {item.priority}. {item.title} {item.difficulty}
        </Text>

        <Text style={{ fontSize: 10, marginBottom: 5 }}>
          📍 目标区域：{item.targetArea.location}
        </Text>
        <Text style={{ fontSize: 9, color: '#666666', marginBottom: 8 }}>
          原因：{item.targetArea.reason}
        </Text>

        <Text style={{ fontSize: 10, fontWeight: 'bold', marginTop: 8 }}>
          具体行动：
        </Text>
        {item.actions.map((action, i) => (
          <View key={i} style={styles.listItem}>
            <Text style={styles.listBullet}>•</Text>
            <Text style={[styles.listContent, { fontSize: 9 }]}>{action}</Text>
          </View>
        ))}

        <Text style={{ fontSize: 9, color: '#666666', marginTop: 8 }}>
          原理：{item.principle}
        </Text>

        <View
          style={{
            marginTop: 8,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ fontSize: 9, color: '#666666' }}>
            预期效果：{item.expectedResults.effects.join('、')}
          </Text>
          <Text style={{ fontSize: 9, color: '#666666' }}>
            投入：{item.investment.cost}
          </Text>
        </View>
      </View>
    ))}

    <Text style={styles.footer}>
      第 {pageNumber} 页 | QiFlowAI 智能分析报告
    </Text>
  </Page>
);

/**
 * 免责声明页
 */
const DisclaimerPage: React.FC<{ pageNumber: number }> = ({ pageNumber }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.chapterTitle}>免责声明</Text>
    </View>

    <Text style={styles.paragraph}>
      本报告由QiFlowAI人工智能系统生成，结合了传统命理学、风水学理论与现代数据分析技术。
      报告内容仅供参考，不构成任何专业建议。
    </Text>

    <Text style={styles.paragraph}>
      用户在使用本报告时，应充分理解以下事项：
    </Text>

    <View style={styles.listItem}>
      <Text style={styles.listBullet}>1.</Text>
      <Text style={styles.listContent}>
        本报告基于用户提供的出生信息和住宅数据生成，数据准确性影响分析质量。
      </Text>
    </View>

    <View style={styles.listItem}>
      <Text style={styles.listBullet}>2.</Text>
      <Text style={styles.listContent}>
        传统命理学和风水学属于文化传承，其理论和方法存在多种流派和解释。
      </Text>
    </View>

    <View style={styles.listItem}>
      <Text style={styles.listBullet}>3.</Text>
      <Text style={styles.listContent}>
        AI生成的内容可能存在偏差，用户应结合自身实际情况理性判断。
      </Text>
    </View>

    <View style={styles.listItem}>
      <Text style={styles.listBullet}>4.</Text>
      <Text style={styles.listContent}>
        本报告不对任何决策结果承担责任，重大事项建议咨询专业人士。
      </Text>
    </View>

    <Text
      style={[
        styles.paragraph,
        { marginTop: 20, fontSize: 10, color: '#666666' },
      ]}
    >
      QiFlowAI 致力于为用户提供有价值的参考信息，但不保证分析结果的绝对准确性。
      使用本报告即表示您已阅读并同意上述声明。
    </Text>

    <Text style={styles.footer}>
      第 {pageNumber} 页 | QiFlowAI 智能分析报告
    </Text>
  </Page>
);

/**
 * 生成完整PDF文档
 */
export const ReportPDFDocument: React.FC<ReportPDFInput> = ({
  report,
  userInfo,
  houseInfo,
}) => {
  let currentPage = 1;

  return (
    <Document
      title={`${userInfo.name || ''}命理风水分析报告`}
      author="QiFlowAI"
      subject="八字命理与风水分析"
      keywords="八字 风水 命理 QiFlowAI"
      creator="QiFlowAI"
      producer="QiFlowAI Report Generator v1.0"
    >
      {/* 封面 */}
      <CoverPage userInfo={userInfo} />

      {/* 主题内容章节 */}
      {report.themes.map((theme, index) => (
        <ChapterPage
          key={theme.id}
          title={`第${index + 1}章：${theme.title}`}
          content={`${theme.story}\n\n${theme.synthesis}\n\n建议：\n${theme.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`}
          pageNumber={++currentPage}
        />
      ))}

      {/* 人宅合一分析（如果存在） */}
      {report.synthesis && (
        <>
          <SynthesisChapter
            synthesis={report.synthesis}
            pageNumber={++currentPage}
          />

          <LayoutAdviceChapter
            advice={report.synthesis.layoutAdvice}
            pageNumber={++currentPage}
          />
        </>
      )}

      {/* 免责声明 */}
      <DisclaimerPage pageNumber={++currentPage} />
    </Document>
  );
};

/**
 * 生成PDF（服务端API）
 */
export async function generateReportPDF(
  input: ReportPDFInput
): Promise<Buffer> {
  const startTime = Date.now();

  try {
    // 动态导入 @react-pdf/renderer
    const { renderToBuffer } = await import('@react-pdf/renderer');

    // 渲染PDF
    const pdfBuffer = await renderToBuffer(<ReportPDFDocument {...input} />);

    const timeTaken = Date.now() - startTime;
    const sizeKB = Buffer.byteLength(pdfBuffer) / 1024;

    console.log(`[PDF] 生成成功: ${timeTaken}ms, ${sizeKB.toFixed(2)}KB`);

    // 检查性能指标
    if (timeTaken > 5000) {
      console.warn(`[PDF] 生成时间超标: ${timeTaken}ms > 5000ms`);
    }

    if (sizeKB > 2048) {
      console.warn(`[PDF] 文件过大: ${sizeKB.toFixed(2)}KB > 2048KB`);
    }

    return pdfBuffer;
  } catch (error) {
    console.error('[PDF] 生成失败:', error);
    throw new Error(
      `PDF生成失败: ${error instanceof Error ? error.message : '未知错误'}`
    );
  }
}

/**
 * 成本估算（PDF生成无AI成本）
 */
export function estimatePDFCost(): number {
  // PDF生成无AI成本，仅计算服务器资源成本
  // 假设每个PDF生成消耗约0.001 CPU credits
  return 0; // 暂时不计费
}
