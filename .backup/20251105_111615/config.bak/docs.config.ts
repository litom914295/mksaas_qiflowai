// 文档配置和分类结构

export type DocCategory =
  | 'getting-started'
  | 'user-guide'
  | 'development'
  | 'deployment'
  | 'api-reference'
  | 'database'
  | 'security'
  | 'monitoring'
  | 'growth-system'
  | 'troubleshooting'
  | 'best-practices';

export interface DocItem {
  id: string;
  title: string;
  description: string;
  category: DocCategory;
  path: string;
  tags: string[];
  icon?: string;
  lastUpdated: string;
  author?: string;
  readTime?: number;
}

export interface DocSection {
  category: DocCategory;
  title: string;
  description: string;
  icon: string;
  docs: DocItem[];
}

// 文档分类配置
export const DOC_CATEGORIES: Record<
  DocCategory,
  { title: string; description: string; icon: string }
> = {
  'getting-started': {
    title: '快速开始',
    description: '新手入门指南和快速启动教程',
    icon: '🚀',
  },
  'user-guide': {
    title: '使用指南',
    description: '功能使用说明和操作手册',
    icon: '📖',
  },
  development: {
    title: '开发文档',
    description: '开发环境配置和技术架构说明',
    icon: '💻',
  },
  deployment: {
    title: '部署运维',
    description: '部署流程、配置和运维指南',
    icon: '🚢',
  },
  'api-reference': {
    title: 'API参考',
    description: 'API接口文档和使用示例',
    icon: '🔌',
  },
  database: {
    title: '数据库',
    description: '数据库设计、迁移和优化',
    icon: '🗄️',
  },
  security: {
    title: '安全防护',
    description: '安全配置、最佳实践和风控',
    icon: '🔒',
  },
  monitoring: {
    title: '监控运维',
    description: '系统监控、日志和性能优化',
    icon: '📊',
  },
  'growth-system': {
    title: '增长系统',
    description: '推荐裂变、积分、分享等增长功能',
    icon: '📈',
  },
  troubleshooting: {
    title: '故障排查',
    description: '常见问题解答和故障处理',
    icon: '🔧',
  },
  'best-practices': {
    title: '最佳实践',
    description: '开发规范和最佳实践指南',
    icon: '⭐',
  },
};

// 所有文档列表
export const DOCUMENTATION: DocItem[] = [
  // 快速开始
  {
    id: 'quick-start',
    title: '快速开始指南',
    description: '5分钟快速启动项目并登录管理后台',
    category: 'getting-started',
    path: '/docs/QUICK_START.md',
    tags: ['入门', '安装', '登录'],
    icon: '🚀',
    lastUpdated: '2024-01-11',
    readTime: 5,
  },
  {
    id: 'project-structure',
    title: '项目结构说明',
    description: '了解项目目录结构和文件组织',
    category: 'getting-started',
    path: '/docs/project-structure.md',
    tags: ['架构', '目录'],
    icon: '📁',
    lastUpdated: '2024-01-11',
    readTime: 10,
  },
  {
    id: 'environment-setup',
    title: '环境配置',
    description: '开发环境配置和依赖安装',
    category: 'getting-started',
    path: '/docs/environment-setup.md',
    tags: ['环境', '配置'],
    icon: '⚙️',
    lastUpdated: '2024-01-11',
    readTime: 15,
  },

  // 使用指南
  {
    id: 'admin-guide',
    title: '管理后台使用指南',
    description: '完整的管理后台功能说明和操作指南',
    category: 'user-guide',
    path: '/docs/admin-guide.md',
    tags: ['管理后台', '操作手册'],
    icon: '👤',
    lastUpdated: '2024-01-11',
    readTime: 30,
  },
  {
    id: 'user-management',
    title: '用户管理',
    description: '用户CRUD、角色权限管理',
    category: 'user-guide',
    path: '/docs/guides/user-management.md',
    tags: ['用户', '权限'],
    icon: '👥',
    lastUpdated: '2024-01-11',
    readTime: 15,
  },
  {
    id: 'content-management',
    title: '内容管理',
    description: '文章、页面、媒体库管理',
    category: 'user-guide',
    path: '/docs/guides/content-management.md',
    tags: ['内容', '文章'],
    icon: '📝',
    lastUpdated: '2024-01-11',
    readTime: 20,
  },

  // 增长系统
  {
    id: 'growth-overview',
    title: '增长系统概览',
    description: '病毒式增长系统整体架构和核心功能',
    category: 'growth-system',
    path: '/docs/growth/overview.md',
    tags: ['增长', 'K因子', '裂变'],
    icon: '📈',
    lastUpdated: '2024-01-11',
    readTime: 20,
  },
  {
    id: 'referral-system',
    title: '推荐裂变系统',
    description: '推荐链接、奖励机制和活动管理',
    category: 'growth-system',
    path: '/docs/growth/referral-system.md',
    tags: ['推荐', '裂变', '邀请'],
    icon: '🔗',
    lastUpdated: '2024-01-11',
    readTime: 25,
  },
  {
    id: 'credit-system',
    title: '积分系统',
    description: '积分获取、消费、兑换完整流程',
    category: 'growth-system',
    path: '/docs/growth/credit-system.md',
    tags: ['积分', '任务', '兑换'],
    icon: '💎',
    lastUpdated: '2024-01-11',
    readTime: 20,
  },
  {
    id: 'share-system',
    title: '分享传播系统',
    description: '社交分享、短链生成和效果追踪',
    category: 'growth-system',
    path: '/docs/growth/share-system.md',
    tags: ['分享', '社交', '传播'],
    icon: '📱',
    lastUpdated: '2024-01-11',
    readTime: 15,
  },
  {
    id: 'fraud-control',
    title: '风控管理',
    description: '反作弊、黑名单和风控规则',
    category: 'growth-system',
    path: '/docs/growth/fraud-control.md',
    tags: ['风控', '反作弊', '安全'],
    icon: '🛡️',
    lastUpdated: '2024-01-11',
    readTime: 20,
  },

  // 数据库
  {
    id: 'database-schema',
    title: '数据库设计',
    description: '完整的数据库表结构和关系设计',
    category: 'database',
    path: '/src/db/migrations/001_growth_system.sql',
    tags: ['数据库', '表设计', 'SQL'],
    icon: '🗄️',
    lastUpdated: '2024-01-11',
    readTime: 30,
  },
  {
    id: 'database-migration',
    title: '数据库迁移',
    description: '数据库迁移脚本和执行方法',
    category: 'database',
    path: '/docs/database/migration-guide.md',
    tags: ['迁移', '升级'],
    icon: '🔄',
    lastUpdated: '2024-01-11',
    readTime: 15,
  },
  {
    id: 'database-optimization',
    title: '性能优化',
    description: '索引优化、查询优化和最佳实践',
    category: 'database',
    path: '/docs/database/optimization.md',
    tags: ['优化', '索引', '性能'],
    icon: '⚡',
    lastUpdated: '2024-01-11',
    readTime: 25,
  },

  // 部署运维
  {
    id: 'deployment-guide',
    title: '部署指南',
    description: 'Docker、K8s等多种部署方式',
    category: 'deployment',
    path: '/docs/deployment.md',
    tags: ['部署', 'Docker', 'K8s'],
    icon: '🚢',
    lastUpdated: '2024-01-11',
    readTime: 40,
  },
  {
    id: 'environment-variables',
    title: '环境变量配置',
    description: '生产环境配置和环境变量说明',
    category: 'deployment',
    path: '/docs/deployment/environment-variables.md',
    tags: ['环境变量', '配置'],
    icon: '⚙️',
    lastUpdated: '2024-01-11',
    readTime: 15,
  },
  {
    id: 'docker-deployment',
    title: 'Docker部署',
    description: 'Docker Compose完整部署方案',
    category: 'deployment',
    path: '/docs/deployment/docker.md',
    tags: ['Docker', '容器'],
    icon: '🐳',
    lastUpdated: '2024-01-11',
    readTime: 20,
  },

  // 安全防护
  {
    id: 'security-overview',
    title: '安全概览',
    description: '系统安全架构和防护措施',
    category: 'security',
    path: '/docs/security/overview.md',
    tags: ['安全', 'WAF', '防护'],
    icon: '🔒',
    lastUpdated: '2024-01-11',
    readTime: 20,
  },
  {
    id: 'waf-configuration',
    title: 'WAF配置',
    description: 'Web应用防火墙配置和规则',
    category: 'security',
    path: '/src/middleware/security.ts',
    tags: ['WAF', '防火墙', '规则'],
    icon: '🛡️',
    lastUpdated: '2024-01-11',
    readTime: 25,
  },
  {
    id: 'security-audit',
    title: '安全审计',
    description: '审计日志记录和分析',
    category: 'security',
    path: '/docs/security/audit.md',
    tags: ['审计', '日志', '合规'],
    icon: '📋',
    lastUpdated: '2024-01-11',
    readTime: 15,
  },

  // 监控运维
  {
    id: 'monitoring-setup',
    title: '监控系统搭建',
    description: 'Prometheus+Grafana监控方案',
    category: 'monitoring',
    path: '/docs/monitoring/setup.md',
    tags: ['监控', 'Prometheus', 'Grafana'],
    icon: '📊',
    lastUpdated: '2024-01-11',
    readTime: 30,
  },
  {
    id: 'alert-rules',
    title: '告警规则',
    description: '监控告警规则配置',
    category: 'monitoring',
    path: '/monitoring/prometheus/alerts.yml',
    tags: ['告警', '规则', '通知'],
    icon: '🔔',
    lastUpdated: '2024-01-11',
    readTime: 20,
  },
  {
    id: 'performance-testing',
    title: '性能测试',
    description: 'K6性能测试脚本和方法',
    category: 'monitoring',
    path: '/tests/performance/k6-load-test.js',
    tags: ['性能', '测试', 'K6'],
    icon: '⚡',
    lastUpdated: '2024-01-11',
    readTime: 25,
  },

  // API参考
  {
    id: 'api-overview',
    title: 'API概览',
    description: 'RESTful API接口总览',
    category: 'api-reference',
    path: '/docs/api/overview.md',
    tags: ['API', 'REST'],
    icon: '🔌',
    lastUpdated: '2024-01-11',
    readTime: 15,
  },
  {
    id: 'growth-api',
    title: '增长系统API',
    description: '增长系统相关API接口文档',
    category: 'api-reference',
    path: '/docs/api/growth-api.md',
    tags: ['API', '增长', '接口'],
    icon: '📈',
    lastUpdated: '2024-01-11',
    readTime: 30,
  },
  {
    id: 'authentication-api',
    title: '认证授权API',
    description: '用户登录、注册、权限验证',
    category: 'api-reference',
    path: '/docs/api/authentication.md',
    tags: ['认证', '授权', 'JWT'],
    icon: '🔐',
    lastUpdated: '2024-01-11',
    readTime: 20,
  },

  // 开发文档
  {
    id: 'development-setup',
    title: '开发环境搭建',
    description: '本地开发环境配置和工具安装',
    category: 'development',
    path: '/docs/development/setup.md',
    tags: ['开发', '环境'],
    icon: '💻',
    lastUpdated: '2024-01-11',
    readTime: 20,
  },
  {
    id: 'coding-standards',
    title: '编码规范',
    description: 'TypeScript/React编码规范',
    category: 'development',
    path: '/docs/development/coding-standards.md',
    tags: ['规范', '代码'],
    icon: '📏',
    lastUpdated: '2024-01-11',
    readTime: 15,
  },
  {
    id: 'git-workflow',
    title: 'Git工作流',
    description: '分支管理和提交规范',
    category: 'development',
    path: '/docs/development/git-workflow.md',
    tags: ['Git', '版本控制'],
    icon: '🔀',
    lastUpdated: '2024-01-11',
    readTime: 15,
  },

  // 故障排查
  {
    id: 'troubleshooting-guide',
    title: '故障排查指南',
    description: '常见问题和解决方案',
    category: 'troubleshooting',
    path: '/docs/troubleshooting/common-issues.md',
    tags: ['问题', '排查', 'FAQ'],
    icon: '🔧',
    lastUpdated: '2024-01-11',
    readTime: 25,
  },
  {
    id: 'error-codes',
    title: '错误代码说明',
    description: '系统错误代码和处理方法',
    category: 'troubleshooting',
    path: '/docs/troubleshooting/error-codes.md',
    tags: ['错误', '代码'],
    icon: '⚠️',
    lastUpdated: '2024-01-11',
    readTime: 20,
  },
  {
    id: 'debug-tips',
    title: '调试技巧',
    description: '开发调试工具和技巧',
    category: 'troubleshooting',
    path: '/docs/troubleshooting/debug-tips.md',
    tags: ['调试', '工具'],
    icon: '🐛',
    lastUpdated: '2024-01-11',
    readTime: 15,
  },

  // 最佳实践
  {
    id: 'best-practices-overview',
    title: '最佳实践概览',
    description: '开发和运维最佳实践总结',
    category: 'best-practices',
    path: '/docs/best-practices/overview.md',
    tags: ['最佳实践', '规范'],
    icon: '⭐',
    lastUpdated: '2024-01-11',
    readTime: 20,
  },
  {
    id: 'performance-tips',
    title: '性能优化技巧',
    description: '前端和后端性能优化建议',
    category: 'best-practices',
    path: '/docs/best-practices/performance.md',
    tags: ['性能', '优化'],
    icon: '🚀',
    lastUpdated: '2024-01-11',
    readTime: 25,
  },
  {
    id: 'security-best-practices',
    title: '安全最佳实践',
    description: '代码安全和数据保护指南',
    category: 'best-practices',
    path: '/docs/best-practices/security.md',
    tags: ['安全', '最佳实践'],
    icon: '🔒',
    lastUpdated: '2024-01-11',
    readTime: 20,
  },
];

// 获取分类下的文档
export function getDocsByCategory(category: DocCategory): DocItem[] {
  return DOCUMENTATION.filter((doc) => doc.category === category);
}

// 搜索文档
export function searchDocs(query: string): DocItem[] {
  const lowerQuery = query.toLowerCase();
  return DOCUMENTATION.filter(
    (doc) =>
      doc.title.toLowerCase().includes(lowerQuery) ||
      doc.description.toLowerCase().includes(lowerQuery) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

// 获取所有标签
export function getAllTags(): string[] {
  const tags = new Set<string>();
  DOCUMENTATION.forEach((doc) => {
    doc.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

// 获取文档分组
export function getDocSections(): DocSection[] {
  return Object.entries(DOC_CATEGORIES).map(([key, value]) => ({
    category: key as DocCategory,
    title: value.title,
    description: value.description,
    icon: value.icon,
    docs: getDocsByCategory(key as DocCategory),
  }));
}
