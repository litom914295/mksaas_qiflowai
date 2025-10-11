/**
 * 传统文化教育功能模块
 * 专门为用户提供风水和八字知识的教育服务
 */

import type { ConversationContext } from './types';

// 教育内容结构
export interface EducationalContent {
  title: string;
  category: 'basic' | 'intermediate' | 'advanced';
  domain: 'fengshui' | 'bazi' | 'culture';
  content: {
    definition: string;
    explanation: string;
    examples: string[];
    practicalApplication: string;
    commonMisconceptions: string[];
    relatedConcepts: string[];
  };
  interactiveElements?: {
    questions: string[];
    exercises: string[];
    visualAids: string[];
  };
}

// 学习路径定义
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  domain: 'fengshui' | 'bazi';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // 分钟
  prerequisites: string[];
  topics: string[];
  learningObjectives: string[];
}

// 知识库管理器
export class KnowledgeBase {
  private static readonly FENGSHUI_CONTENT: Record<string, EducationalContent> =
    {
      basic_principles: {
        title: '风水基础原理',
        category: 'basic',
        domain: 'fengshui',
        content: {
          definition:
            '风水是研究人与环境关系的传统学问，旨在通过合理规划居住和工作环境，达到趋吉避凶的目的。',
          explanation:
            '风水理论认为，自然环境中存在着一种看不见的能量场（气），这种能量场会影响人的健康、运势和心理状态。通过合理的空间布局和方位选择，可以调节和优化这种能量场，从而改善居住者的生活质量。',
          examples: [
            '选择房屋时，优先考虑采光充足、通风良好的位置',
            '客厅布置时，避免横梁压顶，保持空间的开阔感',
            '卧室门不要直对厕所门，保持空间的清洁能量',
          ],
          practicalApplication:
            '现代风水实践更注重科学性和实用性，结合建筑学、环境学和心理学的原理，为居住者创造舒适健康的生活环境。',
          commonMisconceptions: [
            '误解一：风水完全是迷信，没有科学依据',
            '误解二：风水可以改变命运，具有神奇力量',
            '误解三：风水摆件越多越好，越贵越有效',
          ],
          relatedConcepts: ['阴阳理论', '五行学说', '八卦原理', '气的概念'],
        },
        interactiveElements: {
          questions: [
            '您认为风水与现代科学有哪些结合点？',
            '在您的生活中，有哪些环境因素会影响心情和健康？',
            '如何理性看待传统文化与现代生活的关系？',
          ],
          exercises: [
            '观察自己的居住环境，识别影响舒适度的因素',
            '比较不同房间的采光和通风情况',
            '思考如何用科学的方法改善居住环境',
          ],
          visualAids: ['房屋布局示意图', '气流示意图', '方位罗盘图'],
        },
      },
    };

  private static readonly BAZI_CONTENT: Record<string, EducationalContent> = {
    four_pillars: {
      title: '四柱八字基础',
      category: 'basic',
      domain: 'bazi',
      content: {
        definition:
          '四柱八字是中国传统命理学的核心理论，通过一个人出生的年、月、日、时的天干地支组合，分析个人性格特征和人生趋势。',
        explanation:
          '四柱分别代表：年柱（祖辈、早年），月柱（父母、青年），日柱（自己、中年），时柱（子女、晚年）。每柱由一个天干和一个地支组成，共八个字，故称"八字"。通过分析这八个字的五行属性、相互关系，可以了解一个人的基本性格和发展倾向。',
        examples: [
          '甲子年：甲为阳木，子为阳水，水生木，年份能量和谐',
          '丙午月：丙为阳火，午为阳火，火旺之月，性格偏热情',
          '戊戌日：戊为阳土，戌为阳土，土旺之人，性格稳重',
        ],
        practicalApplication:
          '现代应用中，八字分析主要用于了解个人性格特点，选择适合的发展方向，以及在重要决策时提供参考。',
        commonMisconceptions: [
          '误解一：八字决定一切，命运无法改变',
          '误解二：八字可以精确预测具体事件',
          '误解三：缺什么五行就要补什么',
        ],
        relatedConcepts: ['天干地支', '五行理论', '阴阳学说', '十神关系'],
      },
      interactiveElements: {
        questions: [
          '如何理解"命运"与"努力"的关系？',
          '传统文化如何帮助现代人了解自己？',
          '性格分析对个人发展有什么价值？',
        ],
        exercises: [
          '计算自己的八字四柱',
          '分析八字中的五行分布',
          '思考性格特点与五行的关系',
        ],
        visualAids: ['天干地支对照表', '五行生克图', '四柱排盘示例'],
      },
    },
  };

  private static readonly LEARNING_PATHS: LearningPath[] = [
    {
      id: 'fengshui_beginner',
      title: '风水入门之路',
      description: '从零开始学习风水知识，了解基本概念和实用技巧',
      domain: 'fengshui',
      difficulty: 'beginner',
      estimatedDuration: 120, // 2小时
      prerequisites: [],
      topics: ['basic_principles'],
      learningObjectives: [
        '理解风水的基本概念和科学性',
        '掌握阴阳五行的基础知识',
        '学会简单的环境分析方法',
        '能够提出合理的改善建议',
      ],
    },
    {
      id: 'bazi_foundation',
      title: '八字命理基础',
      description: '学习传统八字理论，了解个人性格分析方法',
      domain: 'bazi',
      difficulty: 'beginner',
      estimatedDuration: 180, // 3小时
      prerequisites: ['five_elements'],
      topics: ['four_pillars'],
      learningObjectives: [
        '掌握四柱八字的基本结构',
        '了解天干地支的含义',
        '学会基本的性格分析方法',
        '理解传统文化的现代价值',
      ],
    },
  ];

  /**
   * 获取教育内容
   */
  static getContent(domain: string, topic: string): EducationalContent | null {
    const contentMap =
      domain === 'fengshui'
        ? KnowledgeBase.FENGSHUI_CONTENT
        : KnowledgeBase.BAZI_CONTENT;
    return contentMap[topic] || null;
  }

  /**
   * 搜索相关内容
   */
  static searchContent(query: string, domain?: string): EducationalContent[] {
    const allContent = [
      ...Object.values(KnowledgeBase.FENGSHUI_CONTENT),
      ...Object.values(KnowledgeBase.BAZI_CONTENT),
    ];

    return allContent.filter((content) => {
      if (domain && content.domain !== domain) return false;

      const searchText =
        `${content.title} ${content.content.definition} ${content.content.explanation}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });
  }

  /**
   * 获取学习路径
   */
  static getLearningPath(id: string): LearningPath | null {
    return KnowledgeBase.LEARNING_PATHS.find((path) => path.id === id) || null;
  }

  /**
   * 推荐学习路径
   */
  static recommendLearningPath(
    domain: 'fengshui' | 'bazi',
    expertise: 'beginner' | 'intermediate' | 'advanced'
  ): LearningPath[] {
    return KnowledgeBase.LEARNING_PATHS.filter(
      (path) =>
        path.domain === domain &&
        (expertise === 'beginner' || path.difficulty !== 'beginner')
    );
  }
}

// 教育服务类
export class EducationService {
  private userProgress: Map<string, UserProgress> = new Map();

  /**
   * 生成个性化教育内容
   */
  generateEducationalResponse(
    topic: string,
    userContext: ConversationContext,
    questionType:
      | 'explanation'
      | 'example'
      | 'application'
      | 'quiz' = 'explanation'
  ): string {
    const content = KnowledgeBase.getContent(
      userContext.currentTopic || 'fengshui',
      topic
    );

    if (!content) {
      return '很抱歉，暂时没有找到相关的教育内容。';
    }

    const expertise = userContext.userProfile.expertise;
    const style = userContext.userProfile.preferredStyle;

    return this.formatEducationalContent(
      content,
      questionType,
      expertise,
      style
    );
  }

  /**
   * 格式化教育内容
   */
  private formatEducationalContent(
    content: EducationalContent,
    type: string,
    expertise: string,
    style: string
  ): string {
    let response = `# ${content.title}\n\n`;

    switch (type) {
      case 'explanation':
        response += `## 📚 核心概念\n${content.content.definition}\n\n`;
        if (style === 'detailed' || expertise !== 'beginner') {
          response += `## 🔍 深入解释\n${content.content.explanation}\n\n`;
        }
        break;

      case 'example':
        response += '## 💡 实际例子\n';
        content.content.examples.forEach((example, index) => {
          response += `${index + 1}. ${example}\n`;
        });
        response += '\n';
        break;

      case 'application':
        response += `## 🛠️ 实际应用\n${content.content.practicalApplication}\n\n`;
        if (content.interactiveElements?.exercises) {
          response += '## 📝 练习建议\n';
          content.interactiveElements.exercises.forEach((exercise, index) => {
            response += `${index + 1}. ${exercise}\n`;
          });
        }
        break;

      case 'quiz':
        if (content.interactiveElements?.questions) {
          response += '## ❓ 思考问题\n';
          content.interactiveElements.questions.forEach((question, index) => {
            response += `${index + 1}. ${question}\n`;
          });
        }
        break;
    }

    // 添加常见误解
    if (
      style === 'detailed' &&
      content.content.commonMisconceptions.length > 0
    ) {
      response += '## ⚠️ 常见误解\n';
      content.content.commonMisconceptions.forEach((misconception, index) => {
        response += `${index + 1}. ${misconception}\n`;
      });
      response += '\n';
    }

    // 添加相关概念
    if (content.content.relatedConcepts.length > 0) {
      response += `## 🔗 相关概念\n${content.content.relatedConcepts.join('、')}\n\n`;
    }

    return response;
  }

  /**
   * 生成学习建议
   */
  generateLearningRecommendation(userContext: ConversationContext): string {
    const domain = userContext.currentTopic === 'bazi' ? 'bazi' : 'fengshui';
    const expertise = userContext.userProfile.expertise;

    const recommendedPaths = KnowledgeBase.recommendLearningPath(
      domain,
      expertise
    );

    if (recommendedPaths.length === 0) {
      return '暂时没有合适的学习路径推荐。';
    }

    let response = '## 📚 为您推荐的学习路径\n\n';

    recommendedPaths.forEach((path, index) => {
      response += `### ${index + 1}. ${path.title}\n`;
      response += `**难度**: ${path.difficulty}\n`;
      response += `**预计时长**: ${path.estimatedDuration}分钟\n`;
      response += `**描述**: ${path.description}\n`;
      response += '**学习目标**: \n';
      path.learningObjectives.forEach((objective) => {
        response += `- ${objective}\n`;
      });
      response += '\n';
    });

    return response;
  }

  /**
   * 追踪用户学习进度
   */
  updateUserProgress(
    userId: string,
    topic: string,
    action: 'started' | 'completed' | 'bookmarked'
  ): void {
    const progress = this.userProgress.get(userId) || {
      completedTopics: [],
      bookmarkedTopics: [],
      currentPath: null,
      studyTime: 0,
    };

    switch (action) {
      case 'completed':
        if (!progress.completedTopics.includes(topic)) {
          progress.completedTopics.push(topic);
        }
        break;
      case 'bookmarked':
        if (!progress.bookmarkedTopics.includes(topic)) {
          progress.bookmarkedTopics.push(topic);
        }
        break;
    }

    this.userProgress.set(userId, progress);
  }
}

// 用户学习进度接口
interface UserProgress {
  completedTopics: string[];
  bookmarkedTopics: string[];
  currentPath: string | null;
  studyTime: number; // 分钟
}

/**
 * 全局教育服务实例
 */
export const educationService = new EducationService();
