'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  Eye,
  FileText,
  Printer,
  Settings,
  Share2,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';

// Report data type
interface ReportData {
  // Basic information
  basicInfo: {
    reportId: string;
    generatedAt: Date;
    version: string;
    title: string;
    description: string;
  };

  // User information
  userInfo: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };

  // Property information
  propertyInfo: {
    address: string;
    type: string;
    area: number;
    floors: number;
    rooms: number;
    orientation: number;
    constructionDate: Date;
    renovationDate?: Date;
  };

  // Compass measurement data
  compassData: {
    measurements: Array<{
      id: string;
      timestamp: Date;
      direction: number;
      accuracy: number;
      location: string;
      notes?: string;
    }>;
    averageDirection: number;
    accuracy: number;
    calibrationStatus: 'calibrated' | 'needs_calibration' | 'unknown';
  };

  // Floor plan analysis
  floorPlanAnalysis: {
    imageUrl: string;
    rooms: Array<{
      id: string;
      name: string;
      type: string;
      area: number;
      position: { x: number; y: number };
      dimensions: { width: number; height: number };
    }>;
    totalArea: number;
    roomCount: number;
    layoutScore: number;
  };

  // Flying star analysis
  flyingStarAnalysis: {
    period: number;
    facing: number;
    sitting: number;
    stars: Array<{
      palace: string;
      mountain: string;
      water: string;
      time: string;
      score: number;
      status: 'favorable' | 'neutral' | 'unfavorable';
    }>;
    overallScore: number;
    recommendations: string[];
  };

  // Room analysis
  roomAnalysis: Array<{
    roomId: string;
    roomName: string;
    palace: string;
    score: number;
    status: 'excellent' | 'good' | 'average' | 'poor' | 'critical';
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    warnings: string[];
  }>;

  // Comprehensive assessment
  overallAssessment: {
    totalScore: number;
    grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
    summary: string;
    keyFindings: string[];
    priorityActions: string[];
    longTermRecommendations: string[];
  };

  // 技术参数
  technicalParams: {
    calculationMethod: string;
    precision: number;
    confidence: number;
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    lastUpdated: Date;
  };
}

// 报告模板类型
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'comprehensive' | 'basic' | 'detailed' | 'executive';
  sections: string[];
  customFields: string[];
  format: 'pdf' | 'html' | 'docx' | 'json';
  styling: {
    theme: 'professional' | 'modern' | 'classic' | 'minimal';
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
    };
    fonts: {
      heading: string;
      body: string;
      code: string;
    };
  };
}

// 报告生成器组件
export const ReportGenerator: React.FC = () => {
  const [reportData] = useState<ReportData | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<string>('comprehensive');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [reportFormat] = useState<'pdf' | 'html' | 'docx'>('pdf');
  const [customSettings, setCustomSettings] = useState({
    includeImages: true,
    includeCharts: true,
    includeRecommendations: true,
    includeTechnicalDetails: false,
    language: 'zh-CN',
    pageSize: 'A4',
    orientation: 'portrait' as 'portrait' | 'landscape',
  });
  const [layeredSnap, setLayeredSnap] = useState<any | null>(null);

  // 报告模板
  const reportTemplates: ReportTemplate[] = [
    {
      id: 'comprehensive',
      name: '综合风水分析报告',
      description: '包含所有分析维度的完整报告',
      category: 'comprehensive',
      sections: [
        'basic_info',
        'property_info',
        'compass_analysis',
        'floor_plan',
        'flying_star',
        'room_analysis',
        'overall_assessment',
        'recommendations',
      ],
      customFields: ['custom_notes', 'special_requirements'],
      format: 'pdf',
      styling: {
        theme: 'professional',
        colors: {
          primary: '#1f2937',
          secondary: '#6b7280',
          accent: '#3b82f6',
          background: '#ffffff',
        },
        fonts: {
          heading: 'Inter',
          body: 'Inter',
          code: 'JetBrains Mono',
        },
      },
    },
    {
      id: 'basic',
      name: '基础风水报告',
      description: '简化的基础分析报告',
      category: 'basic',
      sections: [
        'basic_info',
        'property_info',
        'flying_star',
        'overall_assessment',
      ],
      customFields: [],
      format: 'pdf',
      styling: {
        theme: 'minimal',
        colors: {
          primary: '#374151',
          secondary: '#9ca3af',
          accent: '#10b981',
          background: '#f9fafb',
        },
        fonts: {
          heading: 'Inter',
          body: 'Inter',
          code: 'JetBrains Mono',
        },
      },
    },
    {
      id: 'detailed',
      name: '详细技术报告',
      description: '包含技术细节的详细报告',
      category: 'detailed',
      sections: [
        'basic_info',
        'property_info',
        'compass_analysis',
        'floor_plan',
        'flying_star',
        'room_analysis',
        'overall_assessment',
        'technical_params',
        'recommendations',
      ],
      customFields: ['technical_notes', 'calculation_details'],
      format: 'pdf',
      styling: {
        theme: 'classic',
        colors: {
          primary: '#1f2937',
          secondary: '#6b7280',
          accent: '#8b5cf6',
          background: '#ffffff',
        },
        fonts: {
          heading: 'Inter',
          body: 'Inter',
          code: 'JetBrains Mono',
        },
      },
    },
    {
      id: 'executive',
      name: '高管摘要报告',
      description: '面向管理层的简洁摘要',
      category: 'executive',
      sections: ['basic_info', 'overall_assessment', 'priority_actions'],
      customFields: ['executive_summary'],
      format: 'pdf',
      styling: {
        theme: 'modern',
        colors: {
          primary: '#111827',
          secondary: '#6b7280',
          accent: '#f59e0b',
          background: '#ffffff',
        },
        fonts: {
          heading: 'Inter',
          body: 'Inter',
          code: 'JetBrains Mono',
        },
      },
    },
  ];

  // 生成报告
  const generateReport = useCallback(async () => {
    if (!reportData) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // 模拟报告生成过程
      const steps = [
        '准备报告模板...',
        '收集分析数据...',
        '生成图表和图像...',
        '计算综合评分...',
        '生成建议和推荐...',
        '格式化报告内容...',
        '应用样式和布局...',
        '生成最终报告...',
      ];

      for (let i = 0; i < steps.length; i++) {
        setGenerationProgress((i + 1) * 12.5);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // 读取层叠结果快照（由前端风水面板写入）
      try {
        if (typeof window !== 'undefined' && (window as any).localStorage) {
          const raw = window.localStorage.getItem('fengshui_layered');
          setLayeredSnap(raw ? JSON.parse(raw) : null);
        }
      } catch {}

      // 生成报告内容
      const reportContent = generateReportContent(
        reportData,
        selectedTemplate,
        customSettings
      );
      setGeneratedReport(reportContent);
      setGenerationProgress(100);
    } catch (error) {
      console.error('报告生成失败:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [reportData, selectedTemplate, customSettings]);

  // 生成报告内容
  const generateReportContent = (
    data: ReportData,
    templateId: string,
    settings: typeof customSettings
  ): string => {
    const template = reportTemplates.find((t) => t.id === templateId);
    if (!template) return '';

    const layeredSection = layeredSnap
      ? `\n---\n\n## 分层明细\n\n**权重**: 年 ${layeredSnap.weights?.year ?? 0.3}, 月 ${layeredSnap.weights?.month ?? 0.2}, 日 ${layeredSnap.weights?.day ?? 0.1}\n\n${Object.keys(
          layeredSnap.perPalace || {}
        )
          .map((k) => {
            const v = layeredSnap.perPalace[k];
            return `### 第${k}宫\n- 评分: ${v.score}\n- 标签: ${(v.tags || []).join('、')}\n- 原因: ${(v.reasons || []).join('；')}`;
          })
          .join('\n\n')}\n\n**说明**: ${(layeredSnap.notes || []).join('；')}`
      : '';

    const content = `
# ${data.basicInfo.title}

**报告编号:** ${data.basicInfo.reportId}  
**生成时间:** ${data.basicInfo.generatedAt.toLocaleString('zh-CN')}  
**版本:** ${data.basicInfo.version}

---

## 基本信息

**用户信息:**
- 姓名: ${data.userInfo.name}
- 邮箱: ${data.userInfo.email}
${data.userInfo.phone ? `- 电话: ${data.userInfo.phone}` : ''}
${data.userInfo.address ? `- 地址: ${data.userInfo.address}` : ''}

**房屋信息:**
- 地址: ${data.propertyInfo.address}
- 类型: ${data.propertyInfo.type}
- 面积: ${data.propertyInfo.area} 平方米
- 楼层: ${data.propertyInfo.floors}
- 房间数: ${data.propertyInfo.rooms}
- 朝向: ${data.propertyInfo.orientation}°
- 建造日期: ${data.propertyInfo.constructionDate.toLocaleDateString('zh-CN')}
${data.propertyInfo.renovationDate ? `- 装修日期: ${data.propertyInfo.renovationDate.toLocaleDateString('zh-CN')}` : ''}

---

## 综合评估

**总体评分:** ${data.overallAssessment.totalScore}/100  
**等级:** ${data.overallAssessment.grade}  
**评估:** ${data.overallAssessment.summary}

### 关键发现
${data.overallAssessment.keyFindings.map((finding) => `- ${finding}`).join('\n')}

### 优先行动
${data.overallAssessment.priorityActions.map((action) => `- ${action}`).join('\n')}

---

## 飞星分析

**元运:** ${data.flyingStarAnalysis.period}  
**向山:** ${data.flyingStarAnalysis.facing}  
**坐山:** ${data.flyingStarAnalysis.sitting}  
**综合评分:** ${data.flyingStarAnalysis.overallScore}/100

### 九宫飞星
${data.flyingStarAnalysis.stars
  .map(
    (star) => `
**${star.palace}宫:**
- 山星: ${star.mountain}
- 向星: ${star.water}
- 时星: ${star.time}
- 评分: ${star.score}/100
- 状态: ${star.status === 'favorable' ? '吉' : star.status === 'unfavorable' ? '凶' : '平'}
`
  )
  .join('\n')}

---

## 房间分析

${data.roomAnalysis
  .map(
    (room) => `
### ${room.roomName} (${room.palace}宫)
**评分:** ${room.score}/100  
**状态:** ${room.status === 'excellent' ? '优秀' : room.status === 'good' ? '良好' : room.status === 'average' ? '一般' : room.status === 'poor' ? '较差' : '严重'}

**优势:**
${room.strengths.map((s) => `- ${s}`).join('\n')}

**不足:**
${room.weaknesses.map((w) => `- ${w}`).join('\n')}

**建议:**
${room.suggestions.map((s) => `- ${s}`).join('\n')}

${room.warnings.length > 0 ? `**警告:**\n${room.warnings.map((w) => `- ${w}`).join('\n')}` : ''}
`
  )
  .join('\n')}

---

## 技术参数

**计算方法:** ${data.technicalParams.calculationMethod}  
**精度:** ${data.technicalParams.precision}  
**置信度:** ${data.technicalParams.confidence}%  
**数据质量:** ${data.technicalParams.dataQuality === 'excellent' ? '优秀' : data.technicalParams.dataQuality === 'good' ? '良好' : data.technicalParams.dataQuality === 'fair' ? '一般' : '较差'}  
**最后更新:** ${data.technicalParams.lastUpdated.toLocaleString('zh-CN')}

---

## 长期建议

${data.overallAssessment.longTermRecommendations.map((rec) => `- ${rec}`).join('\n')}

---

*本报告由QiFlow AI风水分析系统生成，仅供参考。*
${layeredSection}
`;

    return content;
  };

  // 导出报告
  const exportReport = useCallback(
    async (format: 'pdf' | 'html' | 'docx') => {
      if (!generatedReport) return;

      try {
        // 这里应该调用实际的导出服务
        console.log(`导出报告为 ${format} 格式`);

        // 模拟导出过程
        const blob = new Blob([generatedReport], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `风水分析报告_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('导出失败:', error);
      }
    },
    [generatedReport]
  );

  // 分享报告
  const shareReport = useCallback(async () => {
    if (!generatedReport) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: '风水分析报告',
          text: '查看我的风水分析报告',
          url: window.location.href,
        });
      } else {
        // 复制到剪贴板
        await navigator.clipboard.writeText(generatedReport);
        alert('报告内容已复制到剪贴板');
      }
    } catch (error) {
      console.error('分享失败:', error);
    }
  }, [generatedReport]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">分析报告生成系统</h1>
        <p className="text-gray-600">
          生成专业的风水分析报告，支持多种格式和模板
        </p>
      </div>

      <Tabs defaultValue="template" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="template">选择模板</TabsTrigger>
          <TabsTrigger value="settings">报告设置</TabsTrigger>
          <TabsTrigger value="preview">预览报告</TabsTrigger>
          <TabsTrigger value="export">导出分享</TabsTrigger>
        </TabsList>

        <TabsContent value="template" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                报告模板选择
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate === template.id
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">
                          {template.name}
                        </h3>
                        <Badge
                          variant={
                            template.category === 'comprehensive'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {template.category === 'comprehensive'
                            ? '综合'
                            : template.category === 'basic'
                              ? '基础'
                              : template.category === 'detailed'
                                ? '详细'
                                : '高管'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {template.description}
                      </p>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">包含章节:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.sections.map((section) => (
                              <Badge
                                key={section}
                                variant="outline"
                                className="text-xs"
                              >
                                {section}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">输出格式:</span>
                          <Badge variant="outline" className="ml-2">
                            {template.format.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                报告设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">内容设置</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={customSettings.includeImages}
                        onChange={(e) =>
                          setCustomSettings((prev) => ({
                            ...prev,
                            includeImages: e.target.checked,
                          }))
                        }
                        className="rounded"
                      />
                      <span>包含图像和图表</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={customSettings.includeCharts}
                        onChange={(e) =>
                          setCustomSettings((prev) => ({
                            ...prev,
                            includeCharts: e.target.checked,
                          }))
                        }
                        className="rounded"
                      />
                      <span>包含数据图表</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={customSettings.includeRecommendations}
                        onChange={(e) =>
                          setCustomSettings((prev) => ({
                            ...prev,
                            includeRecommendations: e.target.checked,
                          }))
                        }
                        className="rounded"
                      />
                      <span>包含建议和推荐</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={customSettings.includeTechnicalDetails}
                        onChange={(e) =>
                          setCustomSettings((prev) => ({
                            ...prev,
                            includeTechnicalDetails: e.target.checked,
                          }))
                        }
                        className="rounded"
                      />
                      <span>包含技术细节</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">格式设置</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        语言
                      </label>
                      <select
                        value={customSettings.language}
                        onChange={(e) =>
                          setCustomSettings((prev) => ({
                            ...prev,
                            language: e.target.value,
                          }))
                        }
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="zh-CN">简体中文</option>
                        <option value="zh-TW">繁体中文</option>
                        <option value="en">English</option>
                        <option value="ja">日本語</option>
                        <option value="ko">한국어</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        页面大小
                      </label>
                      <select
                        value={customSettings.pageSize}
                        onChange={(e) =>
                          setCustomSettings((prev) => ({
                            ...prev,
                            pageSize: e.target.value,
                          }))
                        }
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="A4">A4</option>
                        <option value="A3">A3</option>
                        <option value="Letter">Letter</option>
                        <option value="Legal">Legal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        页面方向
                      </label>
                      <select
                        value={customSettings.orientation}
                        onChange={(e) =>
                          setCustomSettings((prev) => ({
                            ...prev,
                            orientation: e.target.value as
                              | 'portrait'
                              | 'landscape',
                          }))
                        }
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="portrait">纵向</option>
                        <option value="landscape">横向</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                报告预览
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">正在生成报告...</p>
                  </div>
                  {/* <Progress value={generationProgress} className='w-full' /> */}
                  <p className="text-sm text-gray-500 text-center">
                    {generationProgress}% 完成
                  </p>
                </div>
              ) : generatedReport ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                      {generatedReport}
                    </pre>
                  </div>
                  <div className="flex justify-center">
                    <Button
                      onClick={generateReport}
                      className="w-full max-w-xs"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      重新生成报告
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">还没有生成报告</p>
                  <Button onClick={generateReport} disabled={!reportData}>
                    <FileText className="h-4 w-4 mr-2" />
                    生成报告
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                导出和分享
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedReport ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => exportReport('pdf')}
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                    >
                      <FileText className="h-8 w-8" />
                      <span>导出 PDF</span>
                    </Button>
                    <Button
                      onClick={() => exportReport('html')}
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                    >
                      <FileText className="h-8 w-8" />
                      <span>导出 HTML</span>
                    </Button>
                    <Button
                      onClick={() => exportReport('docx')}
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                    >
                      <FileText className="h-8 w-8" />
                      <span>导出 DOCX</span>
                    </Button>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">分享选项</h3>
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={shareReport} variant="outline">
                        <Share2 className="h-4 w-4 mr-2" />
                        分享报告
                      </Button>
                      <Button onClick={() => window.print()} variant="outline">
                        <Printer className="h-4 w-4 mr-2" />
                        打印报告
                      </Button>
                      <Button
                        onClick={() =>
                          navigator.clipboard.writeText(generatedReport)
                        }
                        variant="outline"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        复制内容
                      </Button>
                      <Button
                        onClick={() => {
                          try {
                            const raw =
                              typeof window !== 'undefined' &&
                              (window as any).localStorage
                                ? window.localStorage.getItem(
                                    'fengshui_layered'
                                  )
                                : null;
                            const snap = raw ? JSON.parse(raw) : null;
                            const text = snap
                              ? `个性化建议 (权重 年${snap.weights?.year} 月${snap.weights?.month} 日${snap.weights?.day})\n\n` +
                                Object.keys(snap.perPalace || {})
                                  .map(
                                    (k) =>
                                      `第${k}宫: 评分${snap.perPalace[k].score} 标签:${(snap.perPalace[k].tags || []).join('、')}`
                                  )
                                  .join('\n')
                              : '暂无个性化分层数据';
                            const blob = new Blob([text], {
                              type: 'text/plain',
                            });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `个性化建议_${new Date().toISOString().split('T')[0]}.txt`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          } catch {}
                        }}
                        variant="outline"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        导出个性化建议
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Download className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">请先生成报告后再导出</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportGenerator;
