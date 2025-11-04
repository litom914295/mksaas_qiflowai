'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertCircle,
  BookOpen,
  Lightbulb,
  ListTree,
  Shield,
  Star,
} from 'lucide-react';

type KnowledgeItem = {
  title: string;
  bullets: string[];
};

type Section = {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: KnowledgeItem[];
};

const BASE_SECTIONS: Section[] = [
  {
    id: 'terms',
    title: '基础术语',
    icon: BookOpen,
    items: [
      {
        title: '九宫与三盘',
        bullets: [
          '九宫：坎、坤、震、巽、中、乾、兑、艮、离',
          '三盘：山盘（静/健康）、向盘（动/财气）、运盘（天盘/时运）',
          '飞星：1-9，随元运而旺衰变化',
        ],
      },
      {
        title: '零正与替卦',
        bullets: [
          '零正：水口与山向之正/零，错置易致财丁不旺',
          '替卦：特定组合下用相替之卦推演格局',
        ],
      },
    ],
  },
  {
    id: 'grid',
    title: '九宫与方位',
    icon: ListTree,
    items: [
      {
        title: '方位速记',
        bullets: [
          '坎北、坤西南、震东、巽东南、中宫、乾西北、兑西、艮东北、离南',
          '东四：坎、震、巽、离；西四：坤、乾、兑、艮',
        ],
      },
    ],
  },
  {
    id: 'stars',
    title: '星曜含义（简）',
    icon: Star,
    items: [
      {
        title: '飞星要点',
        bullets: [
          '1贪狼（人缘/文昌）、2巨门（口舌/病符）、3禄存（是非）、4文曲（学业）、5廉贞（五黄）、6武曲（贵人）、7破军（口舌/盗耗）、8左辅（当前旺星）、9右弼（喜庆）',
        ],
      },
    ],
  },
  {
    id: 'layout',
    title: '布局原则',
    icon: Lightbulb,
    items: [
      {
        title: '动静分区',
        bullets: [
          '动区（向盘吉）宜客厅/工作区；静区（山盘吉）宜卧室/休息区',
          '五黄/病符等凶星位，宜静不宜动，必要时做化解',
        ],
      },
      {
        title: '五行调和',
        bullets: [
          '金木水火土相生相克，依飞星与命卦组合微调',
          '色彩/材质/形状/灯光均可用于细化调和',
        ],
      },
    ],
  },
  {
    id: 'remedy',
    title: '化解方法（通用）',
    icon: Shield,
    items: [
      {
        title: '常见做法',
        bullets: [
          '五黄（5）忌动：以金化之（铜制品、金属风铃），避红动火',
          '口舌（2/3/7）位：慎动、可用水/木/金协调，分情境分期实施',
        ],
      },
    ],
  },
  {
    id: 'pitfall',
    title: '常见误区',
    icon: AlertCircle,
    items: [
      {
        title: '易错点',
        bullets: [
          '忽视时运（元运/流年）叠加，单看固定盘',
          '不分动静，通用“旺方摆动、凶方布静”原则被忽略',
          '过度迷信物件，忽略通风采光与日常动线',
        ],
      },
    ],
  },
];

const PROBLEM_PRESETS: Record<string, KnowledgeItem[]> = {
  wealth: [
    {
      title: '财位与动线',
      bullets: [
        '以向盘与流年旺财位为主，保持整洁明亮',
        '动区宜合理人流，避免杂物堆积压制财气',
      ],
    },
    {
      title: '提升建议',
      bullets: [
        '金/水元素点缀，结合命卦喜用',
        '办公桌坐吉向吉，避五黄/破军强动位',
      ],
    },
  ],
  health: [
    {
      title: '休息与静养',
      bullets: [
        '卧室宜在山盘吉位，远离病符/五黄强动位',
        '保持通风与采光，减少电器干扰',
      ],
    },
  ],
  career: [
    {
      title: '学习与创造',
      bullets: [
        '文昌位宜静而明，离宫/巽宫等利名声表达',
        '会议区选向盘吉位，助人和与推进',
      ],
    },
  ],
  general: [],
};

export function KnowledgePanel({
  problemType = 'general',
}: { problemType?: string }) {
  const sections: Section[] = [
    ...BASE_SECTIONS,
    {
      id: 'cases',
      title: '案例要点',
      icon: BookOpen,
      items: (PROBLEM_PRESETS[problemType] || PROBLEM_PRESETS.general).length
        ? (PROBLEM_PRESETS[problemType] as KnowledgeItem[])
        : [
            {
              title: '通用建议',
              bullets: [
                '先定坐向与元运，再看流年叠加',
                '动静分区 + 五行调和 + 光照通风三合一',
              ],
            },
          ],
    },
  ];

  return (
    <div className="space-y-6">
      {sections.map((sec) => {
        const Icon = sec.icon;
        return (
          <Card key={sec.id} className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardTitle className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-green-600" />
                {sec.title}
                <Badge variant="outline" className="ml-2">
                  {sec.items.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sec.items.map((it, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-white border">
                    <div className="font-semibold mb-2">{it.title}</div>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                      {it.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default KnowledgePanel;
