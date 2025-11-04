const fs = require('fs');
const path = require('path');

/**
 * 高优先级页面翻译补丁
 * 针对用户最常访问的页面进行硬编码中文替换
 */

// 高频页面翻译键（按优先级排序）
const highPriorityTranslations = {
  // 统一表单页面 (unified-form)
  UnifiedForm: {
    'zh-CN': {
      hero: {
        title: 'AI智能八字风水一体化分析',
        subtitle: '结合传统命理与现代AI技术，为您提供专业的命运与风水指导',
        trustBadge: '已服务50,000+用户',
        accuracyBadge: '准确率95%+',
        securityBadge: '隐私安全保护',
      },
      steps: {
        personal: '个人信息',
        house: '房屋信息',
        review: '信息确认',
      },
      personalInfo: {
        title: '第一步：输入您的个人信息',
        description: '准确的出生信息是精准分析的基础',
        nameLabel: '姓名',
        namePlaceholder: '请输入您的姓名',
        genderLabel: '性别',
        genderMale: '男',
        genderFemale: '女',
        birthDateLabel: '出生日期',
        birthDatePlaceholder: '选择日期',
        birthTimeLabel: '出生时间',
        birthTimePlaceholder: '选择时间',
        birthTimeHint: '如不知道准确时间，可选择大致时辰',
        locationLabel: '出生地点',
        locationPlaceholder: '请输入出生城市或地区',
      },
      houseInfo: {
        title: '第二步：房屋风水信息（可选）',
        description: '添加房屋信息可获得个性化的风水布局建议',
        skip: '跳过此步',
        addressLabel: '房屋地址',
        addressPlaceholder: '请输入房屋地址',
        directionLabel: '房屋朝向',
        directionPlaceholder: '选择朝向',
        buildYearLabel: '建造年份',
        buildYearPlaceholder: '选择年份',
        layoutLabel: '户型',
        layoutPlaceholder: '如：三室两厅',
        floorLabel: '楼层',
        floorPlaceholder: '请输入楼层',
      },
      review: {
        title: '第三步：确认信息',
        personalTitle: '个人信息',
        houseTitle: '房屋信息',
        edit: '编辑',
        noHouseInfo: '未填写房屋信息',
        addHouseInfo: '添加房屋信息',
      },
      actions: {
        next: '下一步',
        previous: '上一步',
        submit: '开始分析',
        submitting: '分析中...',
      },
      validation: {
        nameRequired: '请输入姓名',
        genderRequired: '请选择性别',
        birthDateRequired: '请选择出生日期',
        birthTimeRequired: '请选择出生时间',
        locationRequired: '请输入出生地点',
      },
      testimonials: {
        title: '用户真实评价',
        ratings: '5.0分 来自1,200+用户评价',
      },
    },
    en: {
      hero: {
        title: 'AI-Powered Ba Zi & Feng Shui Analysis',
        subtitle:
          'Combining traditional wisdom with modern AI technology for professional destiny and Feng Shui guidance',
        trustBadge: '50,000+ Users Served',
        accuracyBadge: '95%+ Accuracy',
        securityBadge: 'Privacy Protected',
      },
      steps: {
        personal: 'Personal Info',
        house: 'House Info',
        review: 'Review',
      },
      personalInfo: {
        title: 'Step 1: Enter Your Personal Information',
        description:
          'Accurate birth information is the foundation of precise analysis',
        nameLabel: 'Name',
        namePlaceholder: 'Enter your name',
        genderLabel: 'Gender',
        genderMale: 'Male',
        genderFemale: 'Female',
        birthDateLabel: 'Birth Date',
        birthDatePlaceholder: 'Select date',
        birthTimeLabel: 'Birth Time',
        birthTimePlaceholder: 'Select time',
        birthTimeHint: 'If exact time unknown, approximate hour is acceptable',
        locationLabel: 'Birth Location',
        locationPlaceholder: 'Enter birth city or region',
      },
      houseInfo: {
        title: 'Step 2: House Feng Shui Information (Optional)',
        description:
          'Add house information for personalized Feng Shui layout recommendations',
        skip: 'Skip this step',
        addressLabel: 'House Address',
        addressPlaceholder: 'Enter house address',
        directionLabel: 'House Direction',
        directionPlaceholder: 'Select direction',
        buildYearLabel: 'Build Year',
        buildYearPlaceholder: 'Select year',
        layoutLabel: 'Layout',
        layoutPlaceholder: 'e.g., 3 bedrooms 2 living rooms',
        floorLabel: 'Floor',
        floorPlaceholder: 'Enter floor number',
      },
      review: {
        title: 'Step 3: Review Information',
        personalTitle: 'Personal Information',
        houseTitle: 'House Information',
        edit: 'Edit',
        noHouseInfo: 'No house information provided',
        addHouseInfo: 'Add house information',
      },
      actions: {
        next: 'Next',
        previous: 'Previous',
        submit: 'Start Analysis',
        submitting: 'Analyzing...',
      },
      validation: {
        nameRequired: 'Please enter name',
        genderRequired: 'Please select gender',
        birthDateRequired: 'Please select birth date',
        birthTimeRequired: 'Please select birth time',
        locationRequired: 'Please enter birth location',
      },
      testimonials: {
        title: 'User Reviews',
        ratings: '5.0 stars from 1,200+ reviews',
      },
    },
  },

  // AI聊天界面
  AIChat: {
    'zh-CN': {
      title: 'AI智能咨询',
      subtitle: '基于您的八字命理和风水数据，为您提供个性化的专业建议',
      placeholder: '请输入您的问题...',
      send: '发送',
      thinking: 'AI正在思考中...',
      quickQuestions: {
        title: '快速提问',
        bazi: '我的喜用神是什么？',
        fengshui: '如何根据我的八字布置家居风水？',
        wealth: '我的财位在哪里？',
        career: '今年事业运如何？',
      },
      welcome: {
        greeting: '您好！我是QiFlow AI助手。',
        coreAdvantage: '🌟 核心优势：所有风水分析都基于您的个人八字定制',
        features: {
          wealth: '• 财位根据您的日主确定',
          color: '• 颜色根据您的喜用神选择',
          direction: '• 方位基于您的五行喜好',
        },
        instruction: '请先提供您的生辰信息，以获得真正个性化的命理和风水建议。',
      },
      responses: {
        needsInfo: '要回答您的问题，我需要以下信息：',
        pleaseProvide: '请先完成相关分析，或向我提供这些信息以便给出准确建议。',
        dataTypes: {
          bazi: '八字信息',
          xuankong: '风水数据',
          house: '房屋信息',
        },
      },
      badges: {
        dataUsed: '已使用数据',
        bazi: '八字',
        xuankong: '风水',
        house: '房屋',
      },
    },
    en: {
      title: 'AI Smart Consultation',
      subtitle:
        'Personalized professional advice based on your Ba Zi and Feng Shui data',
      placeholder: 'Enter your question...',
      send: 'Send',
      thinking: 'AI is thinking...',
      quickQuestions: {
        title: 'Quick Questions',
        bazi: 'What are my favorable elements?',
        fengshui: 'How to arrange home Feng Shui based on my Ba Zi?',
        wealth: 'Where is my wealth position?',
        career: 'How is my career luck this year?',
      },
      welcome: {
        greeting: 'Hello! I am the QiFlow AI Assistant.',
        coreAdvantage:
          '🌟 Core Advantage: All Feng Shui analyses are customized based on your personal Ba Zi',
        features: {
          wealth: '• Wealth position determined by your Day Master',
          color: '• Colors selected based on your favorable elements',
          direction: '• Directions based on your five elements preferences',
        },
        instruction:
          'Please provide your birth information first for truly personalized destiny and Feng Shui advice.',
      },
      responses: {
        needsInfo: 'To answer your question, I need the following information:',
        pleaseProvide:
          'Please complete the relevant analysis first, or provide me with this information for accurate advice.',
        dataTypes: {
          bazi: 'Ba Zi Information',
          xuankong: 'Feng Shui Data',
          house: 'House Information',
        },
      },
      badges: {
        dataUsed: 'Data Used',
        bazi: 'Ba Zi',
        xuankong: 'Feng Shui',
        house: 'House',
      },
    },
  },

  // 报告页面
  Report: {
    'zh-CN': {
      title: '专业分析报告',
      loading: '正在生成您的专业报告...',
      tabs: {
        bazi: '八字命理',
        fengshui: '风水分析',
        comprehensive: '综合建议',
      },
      bazi: {
        pillars: '四柱八字',
        elements: '五行分析',
        tenGods: '十神关系',
        luck: '大运流年',
        favorable: '喜用神',
      },
      fengshui: {
        flyingStars: '九宫飞星',
        directions: '方位吉凶',
        layout: '布局建议',
        remedy: '化解方案',
      },
      actions: {
        export: '导出报告',
        share: '分享报告',
        consult: 'AI咨询',
        print: '打印报告',
      },
      score: {
        overall: '综合评分',
        career: '事业运',
        wealth: '财运',
        health: '健康运',
        relationship: '感情运',
      },
    },
    en: {
      title: 'Professional Analysis Report',
      loading: 'Generating your professional report...',
      tabs: {
        bazi: 'Ba Zi Destiny',
        fengshui: 'Feng Shui Analysis',
        comprehensive: 'Comprehensive Advice',
      },
      bazi: {
        pillars: 'Four Pillars',
        elements: 'Five Elements Analysis',
        tenGods: 'Ten Gods Relations',
        luck: 'Luck Cycles',
        favorable: 'Favorable Elements',
      },
      fengshui: {
        flyingStars: 'Nine Flying Stars',
        directions: 'Directional Fortune',
        layout: 'Layout Recommendations',
        remedy: 'Remedy Solutions',
      },
      actions: {
        export: 'Export Report',
        share: 'Share Report',
        consult: 'AI Consultation',
        print: 'Print Report',
      },
      score: {
        overall: 'Overall Score',
        career: 'Career Luck',
        wealth: 'Wealth Luck',
        health: 'Health Luck',
        relationship: 'Relationship Luck',
      },
    },
  },

  // 通用错误和提示
  Common: {
    'zh-CN': {
      errors: {
        networkError: '网络错误，请稍后重试',
        serverError: '服务器错误，请稍后重试',
        validationError: '输入验证失败',
        unauthorized: '请先登录',
        insufficientCredits: '积分不足',
        unknownError: '未知错误，请联系客服',
      },
      success: {
        saved: '保存成功',
        submitted: '提交成功',
        updated: '更新成功',
        deleted: '删除成功',
      },
      actions: {
        confirm: '确认',
        cancel: '取消',
        save: '保存',
        edit: '编辑',
        delete: '删除',
        retry: '重试',
        back: '返回',
        close: '关闭',
      },
      loading: {
        default: '加载中...',
        saving: '保存中...',
        submitting: '提交中...',
        analyzing: '分析中...',
      },
    },
    en: {
      errors: {
        networkError: 'Network error, please try again later',
        serverError: 'Server error, please try again later',
        validationError: 'Validation failed',
        unauthorized: 'Please login first',
        insufficientCredits: 'Insufficient credits',
        unknownError: 'Unknown error, please contact support',
      },
      success: {
        saved: 'Saved successfully',
        submitted: 'Submitted successfully',
        updated: 'Updated successfully',
        deleted: 'Deleted successfully',
      },
      actions: {
        confirm: 'Confirm',
        cancel: 'Cancel',
        save: 'Save',
        edit: 'Edit',
        delete: 'Delete',
        retry: 'Retry',
        back: 'Back',
        close: 'Close',
      },
      loading: {
        default: 'Loading...',
        saving: 'Saving...',
        submitting: 'Submitting...',
        analyzing: 'Analyzing...',
      },
    },
  },
};

// 其他语言复制英文（后续可完善）
const otherLanguages = ['zh-TW', 'ja', 'ko', 'ms'];

function generateAllLanguages(enTranslations) {
  const result = {};

  // 繁体中文（简单转换，实际应使用专业工具）
  result['zh-TW'] = JSON.parse(
    JSON.stringify(enTranslations).replace(/简/g, '簡')
  );

  // 其他语言暂时复制英文
  ['ja', 'ko', 'ms'].forEach((lang) => {
    result[lang] = JSON.parse(JSON.stringify(enTranslations));
  });

  return result;
}

// 主函数
function fixHighPriorityPages() {
  console.log('🚀 开始处理高频访问页面的翻译...\n');

  const localesDir = path.join(__dirname, '..', 'src', 'locales');
  const languages = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ms'];

  let successCount = 0;
  let errorCount = 0;

  for (const lang of languages) {
    try {
      const langDir = path.join(localesDir, lang);
      const commonFile = path.join(langDir, 'common.json');

      // 确保目录存在
      if (!fs.existsSync(langDir)) {
        fs.mkdirSync(langDir, { recursive: true });
      }

      // 读取现有翻译
      let existingTranslations = {};
      if (fs.existsSync(commonFile)) {
        existingTranslations = JSON.parse(fs.readFileSync(commonFile, 'utf-8'));
      }

      // 合并新翻译
      for (const [namespace, translations] of Object.entries(
        highPriorityTranslations
      )) {
        if (translations[lang]) {
          existingTranslations[namespace] = {
            ...(existingTranslations[namespace] || {}),
            ...translations[lang],
          };
        } else if (translations.en) {
          // 如果没有该语言的翻译，使用英文
          existingTranslations[namespace] = {
            ...(existingTranslations[namespace] || {}),
            ...translations.en,
          };
        }
      }

      // 写回文件
      fs.writeFileSync(
        commonFile,
        JSON.stringify(existingTranslations, null, 2),
        'utf-8'
      );

      console.log(`✅ ${lang}: 成功更新翻译`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${lang}: 更新失败 - ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n📊 执行结果:');
  console.log(`   ✅ 成功: ${successCount} 个语言`);
  console.log(`   ❌ 失败: ${errorCount} 个语言`);

  console.log('\n📝 已添加的翻译命名空间:');
  console.log('   • UnifiedForm (统一表单)');
  console.log('   • AIChat (AI聊天)');
  console.log('   • Report (报告页面)');
  console.log('   • Common (通用文本)');

  console.log('\n✨ 高频页面翻译补丁完成！');
  console.log('\n💡 下一步:');
  console.log(
    `   1. 在代码中使用 useTranslations('UnifiedForm') 等替换硬编码中文`
  );
  console.log('   2. 清除缓存: Remove-Item -Recurse -Force .next');
  console.log('   3. 重启开发服务器测试');
}

// 执行
fixHighPriorityPages();
