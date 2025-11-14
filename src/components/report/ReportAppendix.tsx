'use client';

import React, { useState } from 'react';

/**
 * ReportAppendix - 报告附录
 *
 * 功能：
 * - 术语表（八字、风水术语解释）
 * - FAQ（常见问题）
 * - 客服联系方式
 */

interface ReportAppendixProps {
  glossary?: string;
  faq?: string;
  supportContact?: string;
}

export default function ReportAppendix({
  glossary = defaultGlossary,
  faq = defaultFAQ,
  supportContact = defaultSupportContact,
}: ReportAppendixProps) {
  const [activeTab, setActiveTab] = useState<'glossary' | 'faq' | 'contact'>(
    'glossary'
  );

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        📚 附录
      </h2>

      {/* Tab 切换 */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setActiveTab('glossary')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'glossary'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          术语表
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('faq')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'faq'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          常见问题
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'contact'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          联系客服
        </button>
      </div>

      {/* Tab 内容 */}
      <div className="prose dark:prose-invert max-w-none">
        {activeTab === 'glossary' && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              专业术语解释
            </h3>
            <div
              className="text-gray-700 dark:text-gray-300 whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: glossary }}
            />
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              常见问题解答
            </h3>
            <div
              className="text-gray-700 dark:text-gray-300 whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: faq }}
            />
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              联系客服
            </h3>
            <div
              className="text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: supportContact }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ===== 默认内容 =====

const defaultGlossary = `
<div class="space-y-4">
  <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <h4 class="font-bold text-gray-900 dark:text-gray-100 mb-2">【用神】</h4>
    <p class="text-sm text-gray-700 dark:text-gray-300">
      八字命理中对命主最有利的五行或十神。用神得力时，运势上扬；用神受制时，运势下滑。
    </p>
  </div>

  <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <h4 class="font-bold text-gray-900 dark:text-gray-100 mb-2">【格局】</h4>
    <p class="text-sm text-gray-700 dark:text-gray-300">
      八字五行、十神的组合模式，反映一个人的天赋特质和人生走向。常见格局有正格、从格、化格等。
    </p>
  </div>

  <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <h4 class="font-bold text-gray-900 dark:text-gray-100 mb-2">【大运】</h4>
    <p class="text-sm text-gray-700 dark:text-gray-300">
      每10年一个周期的运势变化，从出生开始推算。大运对人生阶段有重大影响。
    </p>
  </div>

  <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <h4 class="font-bold text-gray-900 dark:text-gray-100 mb-2">【零神】</h4>
    <p class="text-sm text-gray-700 dark:text-gray-300">
      玄空风水中的财位，该方位宜动、宜见水（如鱼缸、饮水机），主催财。
    </p>
  </div>

  <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <h4 class="font-bold text-gray-900 dark:text-gray-100 mb-2">【正神】</h4>
    <p class="text-sm text-gray-700 dark:text-gray-300">
      玄空风水中的丁位，该方位宜静、宜见山（如书柜、高大植物），主旺人丁、利健康。
    </p>
  </div>

  <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <h4 class="font-bold text-gray-900 dark:text-gray-100 mb-2">【五行】</h4>
    <p class="text-sm text-gray-700 dark:text-gray-300">
      木、火、土、金、水五种元素，相生相克，构成宇宙万物的基本规律。
    </p>
  </div>

  <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <h4 class="font-bold text-gray-900 dark:text-gray-100 mb-2">【十神】</h4>
    <p class="text-sm text-gray-700 dark:text-gray-300">
      比肩、劫财、食神、伤官、偏财、正财、偏官、正官、偏印、正印。代表不同的性格特质和人生角色。
    </p>
  </div>
</div>
`;

const defaultFAQ = `
<div class="space-y-6">
  <div class="border-l-4 border-blue-500 pl-4">
    <h4 class="font-bold text-gray-900 dark:text-gray-100 mb-2">Q: 如何执行报告中的行动清单？</h4>
    <p class="text-sm text-gray-700 dark:text-gray-300">
      A: 建议从「必做项」开始，这些行动见效快、影响大。每完成一项，观察1-2周的变化。推荐项和加分项可以根据自己的时间逐步推进。
    </p>
  </div>

  <div class="border-l-4 border-blue-500 pl-4">
    <h4 class="font-bold text-gray-900 dark:text-gray-100 mb-2">Q: 决策时间窗口如何使用？</h4>
    <p class="text-sm text-gray-700 dark:text-gray-300">
      A: 报告中标注的时间窗口是基于您的八字推算出的最佳时机。在这些时间段启动重大决策（如创业、跳槽、结婚等），成功率会更高。非窗口期也可以行动，但需要更多准备和努力。
    </p>
  </div>

  <div class="border-l-4 border-blue-500 pl-4">
    <h4 class="font-bold text-gray-900 dark:text-gray-100 mb-2">Q: 风水Checklist必须全部执行吗？</h4>
    <p class="text-sm text-gray-700 dark:text-gray-300">
      A: 不一定。优先级「high」的任务建议尽快完成，这些对运势影响最大。「medium」和「low」的任务可以根据自己的时间和条件逐步调整。如果条件有限，至少确保「零正不颠倒」（零神见水、正神见山）。
    </p>
  </div>

  <div class="border-l-4 border-blue-500 pl-4">
    <h4 class="font-bold text-gray-900 dark:text-gray-100 mb-2">Q: 报告中的预期改善幅度准确吗？</h4>
    <p class="text-sm text-gray-700 dark:text-gray-300">
      A: 报告中的百分比（如"提升10-20%"）是基于命理学和统计经验给出的合理预期。实际效果因人而异，取决于执行力度、时机把握和外部环境。我们建议保持合理期待，重点关注变化趋势而非精确数字。
    </p>
  </div>

  <div class="border-l-4 border-blue-500 pl-4">
    <h4 class="font-bold text-gray-900 dark:text-gray-100 mb-2">Q: 180天跟踪服务包含哪些内容？</h4>
    <p class="text-sm text-gray-700 dark:text-gray-300">
      A: 包括：①每月运势更新（流年月令变化）；②执行反馈咨询（每月1次，解答执行中的疑问）；③重大决策咨询（180天内3次，对创业、跳槽等重大决策提供即时分析）；④报告内容问答（随时解答报告理解问题）。
    </p>
  </div>

  <div class="border-l-4 border-blue-500 pl-4">
    <h4 class="font-bold text-gray-900 dark:text-gray-100 mb-2">Q: 如果当前运势不利，该怎么办？</h4>
    <p class="text-sm text-gray-700 dark:text-gray-300">
      A: ①查看「归因分解」章节，了解有多少因素是可控的；②重点执行「行动清单」中的可控部分（环境+策略）；③查看「希望之光」章节，了解转折点时间，做好积累准备；④参考「决策对比」中的「非最优方案补救措施」。记住：困难是暂时的，方法得当仍可改善。
    </p>
  </div>
</div>
`;

const defaultSupportContact = `
<div class="space-y-6">
  <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
    <h4 class="font-bold text-blue-900 dark:text-blue-300 mb-4 text-lg">📞 联系方式</h4>
    
    <div class="space-y-4">
      <div class="flex items-start gap-3">
        <span class="text-2xl">💬</span>
        <div>
          <p class="font-semibold text-gray-900 dark:text-gray-100">微信客服</p>
          <p class="text-sm text-gray-600 dark:text-gray-400">微信号：qiflow_support</p>
          <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
            工作时间：周一至周日 9:00-21:00
          </p>
        </div>
      </div>

      <div class="flex items-start gap-3">
        <span class="text-2xl">📧</span>
        <div>
          <p class="font-semibold text-gray-900 dark:text-gray-100">邮箱咨询</p>
          <p class="text-sm text-gray-600 dark:text-gray-400">support@qiflow.ai</p>
          <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
            回复时间：24小时内
          </p>
        </div>
      </div>

      <div class="flex items-start gap-3">
        <span class="text-2xl">☎️</span>
        <div>
          <p class="font-semibold text-gray-900 dark:text-gray-100">电话咨询</p>
          <p class="text-sm text-gray-600 dark:text-gray-400">400-888-6688</p>
          <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
            工作时间：周一至周五 9:00-18:00
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
    <h4 class="font-bold text-yellow-900 dark:text-yellow-300 mb-3">⚡ 快速通道</h4>
    <ul class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
      <li>• <strong>紧急咨询</strong>：添加微信客服，备注"VIP用户+您的姓名"，优先响应</li>
      <li>• <strong>报告问题</strong>：发送邮件至 support@qiflow.ai，附上报告编号</li>
      <li>• <strong>执行反馈</strong>：每月1次，提前3天预约微信客服</li>
      <li>• <strong>重大决策</strong>：180天内3次，至少提前1天预约</li>
    </ul>
  </div>

  <div class="text-center text-sm text-gray-500 dark:text-gray-500 mt-6">
    <p>
      感谢您选择气流AI专业报告服务<br />
      我们将竭诚为您提供专业、贴心的咨询支持
    </p>
  </div>
</div>
`;
