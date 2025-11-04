import {
  BookOpen,
  Code,
  Database,
  DollarSign,
  FileText,
  type LucideIcon,
  Rocket,
  Settings,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

export type DocCategory = {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
};

export type DocumentItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  path: string;
  icon: LucideIcon;
  lastUpdated: string;
  readingTime: number;
};

export const docCategories: DocCategory[] = [
  {
    id: 'all',
    name: '全部',
    icon: FileText,
    description: '查看所有文档',
  },
  {
    id: 'getting-started',
    name: '快速开始',
    icon: Rocket,
    description: '新手入门指南',
  },
  {
    id: 'user-guide',
    name: '用户指南',
    icon: Users,
    description: '功能使用说明',
  },
  {
    id: 'development',
    name: '开发文档',
    icon: Code,
    description: '开发者技术文档',
  },
  {
    id: 'api',
    name: 'API 参考',
    icon: Zap,
    description: '接口文档',
  },
  {
    id: 'database',
    name: '数据库',
    icon: Database,
    description: '数据库设计与管理',
  },
  {
    id: 'security',
    name: '安全',
    icon: Shield,
    description: '安全最佳实践',
  },
  {
    id: 'operations',
    name: '运维部署',
    icon: Settings,
    description: '部署与运维指南',
  },
  {
    id: 'growth',
    name: '增长系统',
    icon: TrendingUp,
    description: '用户增长与分析',
  },
];

export const documents: DocumentItem[] = [
  // 项目概览与快速开始
  {
    id: 'docs-index',
    title: '文档中心索引',
    description: '完整的文档导航和分类索引，快速找到你需要的文档',
    category: 'getting-started',
    tags: ['索引', '导航', '文档中心'],
    path: '/docs/INDEX.md',
    icon: BookOpen,
    lastUpdated: '2025-01-12',
    readingTime: 5,
  },
  {
    id: 'quick-start',
    title: '快速启动指南',
    description: '项目的快速启动和基本使用指南',
    category: 'getting-started',
    tags: ['启动', '快速开始', '入门'],
    path: '/QUICK_START.md',
    icon: Rocket,
    lastUpdated: '2025-01-12',
    readingTime: 8,
  },
  {
    id: 'project-summary',
    title: '项目总结',
    description: 'AI八字风水大师项目的完整概览和功能介绍',
    category: 'getting-started',
    tags: ['概览', '项目简介', '功能'],
    path: '/docs/getting-started/project-summary-v5.1.1.md',
    icon: FileText,
    lastUpdated: '2025-01-12',
    readingTime: 8,
  },
  {
    id: 'environment-setup',
    title: '环境配置',
    description: '开发环境搭建完整指南',
    category: 'getting-started',
    tags: ['环境', '配置', '设置'],
    path: '/docs/environment-setup.md',
    icon: Settings,
    lastUpdated: '2025-01-12',
    readingTime: 10,
  },

  // 用户管理与认证
  {
    id: 'auth-setup-guide',
    title: '认证系统设置指南',
    description: '详细的认证系统配置和设置说明',
    category: 'user-guide',
    tags: ['认证', '设置', '配置'],
    path: '/docs/features/auth/setup-guide.md',
    icon: Shield,
    lastUpdated: '2025-01-12',
    readingTime: 12,
  },
  {
    id: 'auth-testing-guide',
    title: '认证系统测试指南',
    description: '如何测试和验证认证系统功能',
    category: 'user-guide',
    tags: ['测试', '认证', '验证'],
    path: '/docs/features/auth/testing-guide.md',
    icon: Users,
    lastUpdated: '2025-01-12',
    readingTime: 15,
  },
  {
    id: 'credit-system',
    title: '积分系统集成',
    description: '积分系统的完整实现和集成说明',
    category: 'user-guide',
    tags: ['积分', '计费', '系统集成'],
    path: '/docs/features/credit-system/integration-complete.md',
    icon: DollarSign,
    lastUpdated: '2025-01-12',
    readingTime: 18,
  },

  // 开发文档
  {
    id: 'tech-guide-admin',
    title: '管理后台技术指南',
    description: '管理后台的技术实现、架构设计和开发指南',
    category: 'development',
    tags: ['管理后台', '技术指南', '架构'],
    path: '/docs/tech-guide/admin-backend-v5.1.1.md',
    icon: Code,
    lastUpdated: '2025-01-12',
    readingTime: 25,
  },
  {
    id: 'task-plan-admin',
    title: '管理后台任务规划',
    description: '管理后台功能开发的任务规划和实施步骤',
    category: 'development',
    tags: ['任务规划', '开发计划', '管理后台'],
    path: '/docs/tasks/task-plans/admin-v5.1.1.md',
    icon: FileText,
    lastUpdated: '2025-01-12',
    readingTime: 12,
  },
  {
    id: 'implementation-progress',
    title: '实现进度报告',
    description: '项目各功能模块的实现进度和状态',
    category: 'development',
    tags: ['进度', '状态', '实现'],
    path: '/docs/tasks/progress-reports/implementation-progress.md',
    icon: TrendingUp,
    lastUpdated: '2025-01-12',
    readingTime: 15,
  },

  // API 参考
  {
    id: 'api-overview',
    title: 'API 概览',
    description: 'RESTful API 设计原则和通用规范',
    category: 'api',
    tags: ['API', 'REST', '规范'],
    path: '/docs/api-overview',
    icon: Zap,
    lastUpdated: '2024-01-07',
    readingTime: 6,
  },
  {
    id: 'api-authentication',
    title: '认证与授权',
    description: 'JWT Token、Session 管理、权限控制',
    category: 'api',
    tags: ['认证', '授权', '安全'],
    path: '/docs/api-authentication',
    icon: Shield,
    lastUpdated: '2024-01-06',
    readingTime: 12,
  },
  {
    id: 'api-endpoints',
    title: 'API 端点文档',
    description: '完整的 API 接口列表、参数说明、示例代码',
    category: 'api',
    tags: ['接口', '文档', '示例'],
    path: '/docs/api-endpoints',
    icon: Code,
    lastUpdated: '2024-01-05',
    readingTime: 30,
  },

  // 数据库
  {
    id: 'database-setup-solution',
    title: '数据库设置解决方案',
    description: '数据库配置、连接和设置的完整解决方案',
    category: 'database',
    tags: ['数据库', '设置', 'Supabase'],
    path: '/docs/database/setup-solution.md',
    icon: Database,
    lastUpdated: '2025-01-12',
    readingTime: 10,
  },
  {
    id: 'supabase-access-guide',
    title: 'Supabase 访问指南',
    description: '如何访问和使用 Supabase 数据库',
    category: 'database',
    tags: ['Supabase', '数据库', '访问'],
    path: '/docs/database/supabase-access-guide.md',
    icon: Shield,
    lastUpdated: '2025-01-12',
    readingTime: 8,
  },

  // 安全
  {
    id: 'security-best-practices',
    title: '安全最佳实践',
    description: 'XSS、CSRF、SQL注入等安全防护措施',
    category: 'security',
    tags: ['安全', '防护', '最佳实践'],
    path: '/docs/security-best-practices',
    icon: Shield,
    lastUpdated: '2024-01-02',
    readingTime: 20,
  },
  {
    id: 'compliance',
    title: '合规性要求',
    description: '隐私政策、GDPR、数据保护法规遵循',
    category: 'security',
    tags: ['合规', '隐私', 'GDPR'],
    path: '/docs/compliance',
    icon: FileText,
    lastUpdated: '2024-01-01',
    readingTime: 15,
  },

  // 运维部署
  {
    id: 'testing-report',
    title: '测试报告',
    description: '系统测试结果和质量评估报告',
    category: 'operations',
    tags: ['测试', '质量', '报告'],
    path: '/docs/testing/test-reports/testing-report-v5.1.1.md',
    icon: Shield,
    lastUpdated: '2025-01-12',
    readingTime: 18,
  },
  {
    id: 'quick-start',
    title: '快速启动指南',
    description: '项目的快速启动和基本使用指南',
    category: 'operations',
    tags: ['启动', '部署', '使用指南'],
    path: '/QUICK_START.md',
    icon: Rocket,
    lastUpdated: '2025-01-12',
    readingTime: 8,
  },

  // 增长系统
  {
    id: 'growth-p0-summary',
    title: '增长系统 P0 总结',
    description: '增长系统核心功能的实现总结和分析',
    category: 'growth',
    tags: ['增长', 'P0', '核心功能'],
    path: '/docs/optimization/growth-p0-summary-v5.1.1.md',
    icon: TrendingUp,
    lastUpdated: '2025-01-12',
    readingTime: 16,
  },
  {
    id: 'prd-admin-panel',
    title: '管理后台产品需求',
    description: '管理后台的完整产品需求文档',
    category: 'growth',
    tags: ['产品需求', '管理后台', 'PRD'],
    path: '/docs/prd/admin-panel-v5.1.1.md',
    icon: FileText,
    lastUpdated: '2025-01-12',
    readingTime: 22,
  },
];
