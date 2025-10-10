/**
 * QiFlow AI - 八字命理报告生成器
 *
 * 基于内容营销策略设计的专业报告生成系统
 * 支持HTML、PDF、JSON多种格式输出
 */

import type { EnhancedBaziResult } from '../bazi';
import type { LuckPillarAnalysis } from '../bazi/luck-pillars';
import { BaziReportHelpers } from './report-helpers';
import type {
  BaziReportData,
  ChartData,
  ExportOptions,
  PersonalInfo,
  ReportSection,
  ShareOptions,
} from './types';

/**
 * 八字报告生成器主类
 */
export class BaziReportGenerator {
  private reportData: BaziReportData;

  constructor(reportData: BaziReportData) {
    this.reportData = reportData;
  }

  /**
   * 生成完整报告
   */
  async generateReport(
    options: ExportOptions = {
      format: 'html',
      includeCharts: true,
      includeFengshui: true,
      template: 'professional',
    }
  ): Promise<string> {
    const sections = await this.generateAllSections();

    switch (options.format) {
      case 'html':
        return this.generateHtmlReport(sections, options);
      case 'pdf':
        return this.generateReport(options);
      case 'json':
        return this.generateReport(options);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  /**
   * 生成所有报告章节
   */
  private async generateAllSections(): Promise<ReportSection[]> {
    const sections: ReportSection[] = [];

    // 1. 个人信息概览
    sections.push(await this.generatePersonalOverview());

    // 2. 核心命理解读
    sections.push(await this.generateCoreAnalysis());

    // 3. 性格特质分析
    sections.push(await this.generatePersonalityAnalysis());

    // 4. 事业发展指导
    sections.push(await this.generateCareerGuidance());

    // 5. 财运趋势预测
    sections.push(await this.generateWealthAnalysis());

    // 6. 人生大运分析
    sections.push(await this.generateLuckPillarsAnalysis());

    // 7. 实用建议和行动指南
    sections.push(await this.generateActionGuide());

    return sections;
  }

  /**
   * 生成个人信息概览
   */
  private async generatePersonalOverview(): Promise<ReportSection> {
    const { personalInfo } = this.reportData;
    const { baziAnalysis } = this.reportData;

    // 获取核心特质
    const coreTraits = this.extractCoreTraits();
    const commandType = this.getCommandType();

    const content = `
      <div class="personal-overview">
        <div class="greeting">
          <h2>亲爱的${personalInfo.name}，</h2>
          <p>根据您的出生信息：</p>
          <ul>
            <li><strong>出生时间：</strong>${personalInfo.birthDate} ${personalInfo.birthTime}</li>
            <li><strong>出生地点：</strong>${personalInfo.birthLocation}</li>
            <li><strong>命理类型：</strong>${commandType}</li>
            <li><strong>核心特质：</strong>${coreTraits.join('、')}</li>
          </ul>
          <p>本报告将为您揭示生命密码，指引人生方向。</p>
        </div>
      </div>
    `;

    return {
      id: 'personal-overview',
      title: '🎯 个人信息概览',
      content,
    };
  }

  /**
   * 生成核心命理解读
   */
  private async generateCoreAnalysis(): Promise<ReportSection> {
    const { baziAnalysis } = this.reportData;
    const pillarsHtml = BaziReportHelpers.generatePillarsHtml(
      baziAnalysis.pillars
    );
    const elementsChart = BaziReportHelpers.generateElementsChart(baziAnalysis);

    const content = `
      <div class="core-analysis">
        <div class="pillars-section">
          <h3>【四柱八字解析】</h3>
          <p>您的生命蓝图显示：</p>
          ${pillarsHtml}
        </div>
        
        <div class="elements-section">
          <h3>【五行能量分布】</h3>
          <div class="elements-chart">
            ${BaziReportHelpers.renderElementsChart(elementsChart)}
          </div>
          ${BaziReportHelpers.generateElementsAnalysis(baziAnalysis)}
        </div>
      </div>
    `;

    return {
      id: 'core-analysis',
      title: '📊 核心命理解读',
      content,
      charts: [elementsChart],
    };
  }

  /**
   * 生成性格特质分析
   */
  private async generatePersonalityAnalysis(): Promise<ReportSection> {
    const personalityTraits = BaziReportHelpers.extractPersonalityTraits(
      this.reportData.baziAnalysis,
      this.reportData.luckPillarsAnalysis,
      this.reportData.personalInfo.birthDate
    );
    const strengths = personalityTraits.strengths;
    const challenges = personalityTraits.challenges;

    const content = `
      <div class="personality-analysis">
        <h3>【核心性格特征】</h3>
        <p>您是典型的"${personalityTraits.type}"，具体表现为：</p>
        
        <div class="strengths">
          <h4>✅ 天赋优势</h4>
          ${strengths
            .map(
              (strength) => `
            <div class="trait-item">
              <strong>${strength.name}</strong> - ${strength.description}
              <div class="example">在${strength.context}中表现为：${strength.example}</div>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="challenges">
          <h4>⚠️ 需要注意</h4>
          ${challenges
            .map(
              (challenge) => `
            <div class="trait-item">
              <strong>${challenge.name}</strong> - 建议通过${challenge.solution}改善
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    return {
      id: 'personality-analysis',
      title: '🌟 性格特质深度分析',
      content,
      recommendations: personalityTraits.recommendations,
    };
  }

  /**
   * 生成事业发展指导
   */
  private async generateCareerGuidance(): Promise<ReportSection> {
    const careerAnalysis = BaziReportHelpers.extractCareerAnalysis(
      this.reportData.luckPillarsAnalysis,
      this.reportData.personalInfo.birthDate
    );

    const content = `
      <div class="career-guidance">
        <h3>【职业发展建议】</h3>
        <p>根据您的命理特质，最适合的发展方向：</p>
        
        <div class="preferred-industries">
          <h4>🏆 首选行业</h4>
          ${careerAnalysis.preferredIndustries
            .map(
              (industry) => `
            <div class="industry-item">
              <strong>${industry.name}</strong>：因为您具备${industry.reason}
              <div class="success-rate">成功概率：${'★'.repeat(industry.rating)}</div>
              <div class="timing">发展时机：${industry.timing}</div>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="career-strategy">
          <h4>💼 职场策略</h4>
          <ul>
            <li><strong>优势发挥：</strong>${careerAnalysis.strategy.strengths}</li>
            <li><strong>短板补强：</strong>${careerAnalysis.strategy.improvements}</li>
            <li><strong>合作对象：</strong>寻找${careerAnalysis.strategy.partners}的伙伴</li>
          </ul>
        </div>
      </div>
    `;

    return {
      id: 'career-guidance',
      title: '💼 事业发展指导',
      content,
      recommendations: careerAnalysis.recommendations,
    };
  }

  /**
   * 生成财运趋势预测
   */
  private async generateWealthAnalysis(): Promise<ReportSection> {
    const wealthAnalysis = BaziReportHelpers.extractWealthAnalysis(
      this.reportData.luckPillarsAnalysis,
      this.reportData.personalInfo.birthDate
    );

    const content = `
      <div class="wealth-analysis">
        <h3>【财运趋势分析】</h3>
        
        <div class="wealth-pattern">
          <h4>💰 财运模式</h4>
          <p><strong>主要财运类型：</strong>${wealthAnalysis.pattern.type}</p>
          <p><strong>财运特点：</strong>${wealthAnalysis.pattern.characteristics}</p>
        </div>

        <div class="wealth-opportunities">
          <h4>📈 财富机会</h4>
          ${wealthAnalysis.opportunities
            .map(
              (opp) => `
            <div class="opportunity-item">
              <strong>${opp.period}</strong>：${opp.description}
              <div class="probability">概率：${opp.probability}</div>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="wealth-advice">
          <h4>💡 理财建议</h4>
          <ul>
            ${wealthAnalysis.advice.map((advice) => `<li>${advice}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;

    return {
      id: 'wealth-analysis',
      title: '💰 财运趋势预测',
      content,
      recommendations: wealthAnalysis.recommendations,
    };
  }

  /**
   * 生成人生大运分析
   */
  private async generateLuckPillarsAnalysis(): Promise<ReportSection> {
    const { luckPillarsAnalysis } = this.reportData;
    const currentLuck = BaziReportHelpers.getCurrentLuckPillar(
      luckPillarsAnalysis,
      this.reportData.personalInfo.birthDate
    );

    const content = `
      <div class="luck-pillars-analysis">
        <h3>【人生大运分析】</h3>
        
        ${
          currentLuck
            ? `
          <div class="current-luck">
            <h4>🌟 当前大运（${currentLuck.ageRange}岁）</h4>
            <div class="luck-details">
              <p><strong>大运干支：</strong>${currentLuck.pillar.heavenlyStem}${currentLuck.pillar.earthlyBranch}</p>
              <p><strong>十神关系：</strong>${currentLuck.tenGodRelation.heavenlyTenGod}</p>
              <p><strong>运势倾向：</strong>${BaziReportHelpers.getInfluenceDescription(currentLuck.influence)}</p>
              <p><strong>主要影响：</strong>${currentLuck.tenGodRelation.combinedInfluence}</p>
            </div>

            <div class="life-aspects">
              <div class="aspect-grid">
                <div class="aspect">
                  <h5>❤️ 性格影响</h5>
                  <ul>
                    ${currentLuck.tenGodRelation.personalityImpact
                      .slice(0, 3)
                      .map((impact) => `<li>${impact}</li>`)
                      .join('')}
                  </ul>
                </div>
                <div class="aspect">
                  <h5>💼 事业影响</h5>
                  <ul>
                    ${currentLuck.tenGodRelation.careerImpact
                      .slice(0, 3)
                      .map((impact) => `<li>${impact}</li>`)
                      .join('')}
                  </ul>
                </div>
                <div class="aspect">
                  <h5>💰 财运影响</h5>
                  <ul>
                    ${currentLuck.tenGodRelation.wealthImpact
                      .slice(0, 3)
                      .map((impact) => `<li>${impact}</li>`)
                      .join('')}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        `
            : ''
        }

        <div class="luck-timeline">
          <h4>🔮 大运时间线</h4>
          <div class="timeline">
            ${luckPillarsAnalysis
              .slice(0, 8)
              .map(
                (lp) => `
              <div class="timeline-item ${currentLuck?.period === lp.period ? 'current' : ''}">
                <div class="period">${lp.ageRange}岁</div>
                <div class="pillar">${lp.pillar.heavenlyStem}${lp.pillar.earthlyBranch}</div>
                <div class="ten-god">${lp.tenGodRelation.heavenlyTenGod}</div>
                <div class="influence ${lp.influence}">${BaziReportHelpers.getInfluenceDescription(lp.influence)}</div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;

    return {
      id: 'luck-pillars-analysis',
      title: '🔮 人生大运分析',
      content,
    };
  }

  /**
   * 生成行动指南
   */
  private async generateActionGuide(): Promise<ReportSection> {
    const actionPlan = BaziReportHelpers.generateActionPlan();

    const content = `
      <div class="action-guide">
        <h3>🎯 您的专属改运方案</h3>

        <div class="action-timeline">
          ${actionPlan.phases
            .map(
              (phase) => `
            <div class="phase">
              <h4>${phase.title}</h4>
              <div class="tasks">
                ${phase.tasks
                  .map(
                    (task) => `
                  <div class="task-item">
                    <input type="checkbox" id="task-${task.id}">
                    <label for="task-${task.id}">${task.description}</label>
                    ${task.tip ? `<div class="task-tip">💡 ${task.tip}</div>` : ''}
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="long-term-reminders">
          <h4>📅 长期规划提醒</h4>
          ${actionPlan.longTermReminders
            .map(
              (reminder) => `
            <div class="reminder-item">
              <strong>${reminder.period}：</strong>${reminder.description}
            </div>
          `
            )
            .join('')}
        </div>

        <div class="contact-info">
          <h4>📞 需要进一步指导？</h4>
          <ul>
            <li>在线咨询：遇到具体问题时，可预约一对一咨询</li>
            <li>定期复盘：建议每季度回顾一次执行效果</li>
            <li>年度更新：大运变化时及时更新分析报告</li>
          </ul>
          <p><strong>记住：命理分析是工具，人生选择权始终在您手中！</strong></p>
        </div>
      </div>
    `;

    return {
      id: 'action-guide',
      title: '💡 个性化建议清单',
      content,
      recommendations: actionPlan.keyRecommendations,
    };
  }

  // 辅助方法 - 提取核心特质
  private extractCoreTraits(): string[] {
    const { baziAnalysis } = this.reportData;
    const traits: string[] = [];

    // 基于日主强弱
    if (baziAnalysis.dayMasterStrength?.strength === 'strong') {
      traits.push('意志坚定');
    } else if (baziAnalysis.dayMasterStrength?.strength === 'weak') {
      traits.push('灵活变通');
    }

    // 基于五行分析
    const favorableElements = baziAnalysis.favorableElements?.primary || [];
    if (favorableElements.includes('wood')) traits.push('创新进取');
    if (favorableElements.includes('fire')) traits.push('热情积极');
    if (favorableElements.includes('earth')) traits.push('稳重务实');
    if (favorableElements.includes('metal')) traits.push('果断决断');
    if (favorableElements.includes('water')) traits.push('智慧灵活');

    return traits.slice(0, 3); // 取前3个特质
  }

  // 辅助方法 - 获取命理类型
  private getCommandType(): string {
    const { baziAnalysis } = this.reportData;
    const favorableElements = baziAnalysis.favorableElements?.primary || [];

    if (favorableElements.length >= 2) {
      const primary = favorableElements[0];
      const secondary = favorableElements[1];
      return `${this.getElementName(primary)}${this.getElementName(secondary)}相生型`;
    }
    if (favorableElements.length === 1) {
      return `${this.getElementName(favorableElements[0])}旺型`;
    }

    return '五行平衡型';
  }

  private getElementName(element: string): string {
    const names: Record<string, string> = {
      wood: '木',
      fire: '火',
      earth: '土',
      metal: '金',
      water: '水',
    };
    return names[element] || element;
  }

  // 更多辅助方法将在下个文件中继续...

  private generateHtmlReport(
    sections: ReportSection[],
    options: ExportOptions
  ): string {
    // HTML模板生成逻辑
    return `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${this.reportData.personalInfo.name} - 八字命理分析报告</title>
        <style>${this.getReportStyles(options.template)}</style>
      </head>
      <body>
        <div class="report-container">
          <header class="report-header">
            <h1>八字命理分析报告</h1>
            <div class="report-meta">
              生成时间：${this.reportData.generatedAt.toLocaleString('zh-CN')}
            </div>
          </header>
          
          <main class="report-content">
            ${sections
              .map(
                (section) => `
              <section class="report-section" data-section="${section.id}">
                <h2>${section.title}</h2>
                ${section.content}
                ${
                  section.recommendations
                    ? `
                  <div class="recommendations">
                    <h4>💡 专属建议</h4>
                    <ul>
                      ${section.recommendations.map((rec) => `<li>${rec}</li>`).join('')}
                    </ul>
                  </div>
                `
                    : ''
                }
              </section>
            `
              )
              .join('')}
          </main>

          <footer class="report-footer">
            <p>本报告由 QiFlow AI 生成，仅供参考。如有重要决策，请咨询专业人士。</p>
          </footer>
        </div>
      </body>
      </html>
    `;
  }

  // 样式生成方法
  private getReportStyles(template?: string): string {
    // 返回CSS样式
    return `
      * { box-sizing: border-box; }
      body { 
        font-family: 'Microsoft YaHei', SimHei, sans-serif; 
        line-height: 1.6; 
        margin: 0; 
        padding: 20px;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      }
      .report-container { 
        max-width: 1200px; 
        margin: 0 auto; 
        background: white; 
        border-radius: 12px; 
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      .report-header { 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
        color: white; 
        padding: 30px; 
        text-align: center; 
      }
      .report-header h1 { 
        margin: 0; 
        font-size: 2.5em; 
        font-weight: 300; 
      }
      .report-content { 
        padding: 40px; 
      }
      .report-section { 
        margin-bottom: 40px; 
        padding: 30px;
        border-radius: 8px;
        background: #fafafa;
        border-left: 4px solid #667eea;
      }
      .report-section h2 { 
        color: #333; 
        border-bottom: 2px solid #eee; 
        padding-bottom: 10px; 
        margin-bottom: 20px;
      }
      .aspect-grid { 
        display: grid; 
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
        gap: 20px; 
        margin: 20px 0; 
      }
      .aspect { 
        background: white; 
        padding: 20px; 
        border-radius: 8px; 
        box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
      }
      .timeline { 
        display: flex; 
        flex-wrap: wrap; 
        gap: 15px; 
        margin: 20px 0; 
      }
      .timeline-item { 
        background: white; 
        padding: 15px; 
        border-radius: 8px; 
        text-align: center; 
        min-width: 120px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      }
      .timeline-item.current { 
        background: #667eea; 
        color: white; 
      }
      .task-item { 
        margin: 10px 0; 
        padding: 10px; 
        background: white; 
        border-radius: 5px; 
      }
      .recommendations { 
        background: #e8f4fd; 
        padding: 20px; 
        border-radius: 8px; 
        margin-top: 20px; 
      }
      .report-footer { 
        background: #f8f9fa; 
        padding: 20px; 
        text-align: center; 
        color: #666; 
      }
    `;
  }
}
