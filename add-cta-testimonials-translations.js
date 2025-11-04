const fs = require('fs');
const path = require('path');

// 定义各语言的翻译
const translations = {
  'zh-CN': {
    calltoaction: {
      title: '准备开始你的命理风水之旅了吗？',
      description:
        '立即体验专业的八字命理和风水分析服务，让传统智慧指引您的人生方向',
      primaryButton: '免费开始分析',
      secondaryButton: '查看示例报告',
    },
    testimonials: {
      title: '用户评价',
      subtitle: '看看其他用户怎么说',
      items: {
        'item-1': {
          name: '张伟',
          role: '企业家',
          image: '/avatars/avatar-1.jpg',
          quote:
            '八字分析非常准确，帮助我在事业规划上做出了正确的决策。强烈推荐！',
        },
        'item-2': {
          name: '李娜',
          role: '设计师',
          image: '/avatars/avatar-2.jpg',
          quote:
            '风水建议很实用，按照建议调整了家居布局后，感觉整个家的氛围都变好了。',
        },
        'item-3': {
          name: '王明',
          role: 'IT工程师',
          image: '/avatars/avatar-3.jpg',
          quote:
            '作为理工男，一开始有些怀疑，但分析结果确实很准。AI技术和传统文化的结合很有意思。',
        },
        'item-4': {
          name: '陈静',
          role: '教师',
          image: '/avatars/avatar-4.jpg',
          quote:
            '报告非常详细专业，不仅分析了性格特点，还给出了实用的人生建议。',
        },
        'item-5': {
          name: '刘强',
          role: '销售经理',
          image: '/avatars/avatar-5.jpg',
          quote: '用了一个月，每次遇到重要决策都会参考，确实帮了我很多忙。',
        },
        'item-6': {
          name: '杨丽',
          role: '会计师',
          image: '/avatars/avatar-6.jpg',
          quote: '价格合理，服务专业。客服响应也很及时，有问题都能及时解答。',
        },
        'item-7': {
          name: '赵磊',
          role: '创业者',
          image: '/avatars/avatar-7.jpg',
          quote: '风水分析帮我选择了合适的办公室位置，公司业务确实有了起色。',
        },
        'item-8': {
          name: '孙芳',
          role: '医生',
          image: '/avatars/avatar-8.jpg',
          quote: '分析报告很有深度，不是那种泛泛而谈。值得信赖的专业服务。',
        },
        'item-9': {
          name: '周涛',
          role: '金融分析师',
          image: '/avatars/avatar-9.jpg',
          quote:
            '数据化的命理分析很新颖，结合了现代科技，让传统文化更容易理解。',
        },
        'item-10': {
          name: '吴梅',
          role: '律师',
          image: '/avatars/avatar-10.jpg',
          quote: 'AI咨询功能很便利，随时可以提问，回答都很专业。',
        },
        'item-11': {
          name: '郑宇',
          role: '建筑师',
          image: '/avatars/avatar-11.jpg',
          quote:
            '作为建筑师，我很欣赏这里的风水分析方法，既尊重传统又有科学依据。',
        },
        'item-12': {
          name: '钱琳',
          role: 'HR经理',
          image: '/avatars/avatar-12.jpg',
          quote: '帮助我更好地了解自己和团队成员，对人际关系管理很有帮助。',
        },
      },
    },
  },
  en: {
    calltoaction: {
      title: 'Ready to Start Your Destiny & Feng Shui Journey?',
      description:
        'Experience professional BaZi and Feng Shui analysis services now, let traditional wisdom guide your life direction',
      primaryButton: 'Start Free Analysis',
      secondaryButton: 'View Sample Report',
    },
    testimonials: {
      title: 'User Testimonials',
      subtitle: 'See what other users are saying',
      items: {
        'item-1': {
          name: 'Michael Zhang',
          role: 'Entrepreneur',
          image: '/avatars/avatar-1.jpg',
          quote:
            'The BaZi analysis was incredibly accurate and helped me make the right decisions in my career planning. Highly recommended!',
        },
        'item-2': {
          name: 'Linda Li',
          role: 'Designer',
          image: '/avatars/avatar-2.jpg',
          quote:
            'The Feng Shui advice was very practical. After adjusting my home layout as suggested, the whole atmosphere of my home improved.',
        },
        'item-3': {
          name: 'David Wang',
          role: 'IT Engineer',
          image: '/avatars/avatar-3.jpg',
          quote:
            'As a technical person, I was skeptical at first, but the analysis results were indeed accurate. The combination of AI technology and traditional culture is fascinating.',
        },
        'item-4': {
          name: 'Sarah Chen',
          role: 'Teacher',
          image: '/avatars/avatar-4.jpg',
          quote:
            'The report is very detailed and professional, not only analyzing personality traits but also providing practical life advice.',
        },
        'item-5': {
          name: 'James Liu',
          role: 'Sales Manager',
          image: '/avatars/avatar-5.jpg',
          quote:
            'Used it for a month, and I refer to it whenever I face important decisions. It has really helped me a lot.',
        },
        'item-6': {
          name: 'Emily Yang',
          role: 'Accountant',
          image: '/avatars/avatar-6.jpg',
          quote:
            'Reasonable prices, professional service. Customer support is also very responsive and answers questions promptly.',
        },
        'item-7': {
          name: 'Robert Zhao',
          role: 'Startup Founder',
          image: '/avatars/avatar-7.jpg',
          quote:
            'The Feng Shui analysis helped me choose the right office location, and the company business indeed improved.',
        },
        'item-8': {
          name: 'Amy Sun',
          role: 'Doctor',
          image: '/avatars/avatar-8.jpg',
          quote:
            'The analysis report is very in-depth, not superficial at all. A trustworthy professional service.',
        },
        'item-9': {
          name: 'Kevin Zhou',
          role: 'Financial Analyst',
          image: '/avatars/avatar-9.jpg',
          quote:
            'The data-driven destiny analysis is very innovative, combining modern technology to make traditional culture easier to understand.',
        },
        'item-10': {
          name: 'Michelle Wu',
          role: 'Lawyer',
          image: '/avatars/avatar-10.jpg',
          quote:
            'The AI consultation feature is very convenient, I can ask questions anytime, and the answers are always professional.',
        },
        'item-11': {
          name: 'Steven Zheng',
          role: 'Architect',
          image: '/avatars/avatar-11.jpg',
          quote:
            'As an architect, I appreciate the Feng Shui analysis method here, which respects tradition while having scientific basis.',
        },
        'item-12': {
          name: 'Grace Qian',
          role: 'HR Manager',
          image: '/avatars/avatar-12.jpg',
          quote:
            'Helped me better understand myself and my team members, very helpful for interpersonal relationship management.',
        },
      },
    },
  },
  'zh-TW': {
    calltoaction: {
      title: '準備開始你的命理風水之旅了嗎？',
      description:
        '立即體驗專業的八字命理和風水分析服務，讓傳統智慧指引您的人生方向',
      primaryButton: '免費開始分析',
      secondaryButton: '查看示例報告',
    },
    testimonials: {
      title: '用戶評價',
      subtitle: '看看其他用戶怎麼說',
      items: {
        'item-1': {
          name: '張偉',
          role: '企業家',
          image: '/avatars/avatar-1.jpg',
          quote:
            '八字分析非常準確，幫助我在事業規劃上做出了正確的決策。強烈推薦！',
        },
        'item-2': {
          name: '李娜',
          role: '設計師',
          image: '/avatars/avatar-2.jpg',
          quote:
            '風水建議很實用，按照建議調整了家居佈局後，感覺整個家的氛圍都變好了。',
        },
        'item-3': {
          name: '王明',
          role: 'IT工程師',
          image: '/avatars/avatar-3.jpg',
          quote:
            '作為理工男，一開始有些懷疑，但分析結果確實很準。AI技術和傳統文化的結合很有意思。',
        },
        'item-4': {
          name: '陳靜',
          role: '教師',
          image: '/avatars/avatar-4.jpg',
          quote:
            '報告非常詳細專業，不僅分析了性格特點，還給出了實用的人生建議。',
        },
        'item-5': {
          name: '劉強',
          role: '銷售經理',
          image: '/avatars/avatar-5.jpg',
          quote: '用了一個月，每次遇到重要決策都會參考，確實幫了我很多忙。',
        },
        'item-6': {
          name: '楊麗',
          role: '會計師',
          image: '/avatars/avatar-6.jpg',
          quote: '價格合理，服務專業。客服響應也很及時，有問題都能及時解答。',
        },
        'item-7': {
          name: '趙磊',
          role: '創業者',
          image: '/avatars/avatar-7.jpg',
          quote: '風水分析幫我選擇了合適的辦公室位置，公司業務確實有了起色。',
        },
        'item-8': {
          name: '孫芳',
          role: '醫生',
          image: '/avatars/avatar-8.jpg',
          quote: '分析報告很有深度，不是那種泛泛而談。值得信賴的專業服務。',
        },
        'item-9': {
          name: '周濤',
          role: '金融分析師',
          image: '/avatars/avatar-9.jpg',
          quote:
            '數據化的命理分析很新穎，結合了現代科技，讓傳統文化更容易理解。',
        },
        'item-10': {
          name: '吳梅',
          role: '律師',
          image: '/avatars/avatar-10.jpg',
          quote: 'AI咨詢功能很便利，隨時可以提問，回答都很專業。',
        },
        'item-11': {
          name: '鄭宇',
          role: '建築師',
          image: '/avatars/avatar-11.jpg',
          quote:
            '作為建築師，我很欣賞這裡的風水分析方法，既尊重傳統又有科學依據。',
        },
        'item-12': {
          name: '錢琳',
          role: 'HR經理',
          image: '/avatars/avatar-12.jpg',
          quote: '幫助我更好地了解自己和團隊成員，對人際關係管理很有幫助。',
        },
      },
    },
  },
  // 其他语言使用英文作为后备，脚本会自动处理
};

// 获取所有语言文件
const localesDir = path.join(__dirname, 'src', 'locales');
const localeFiles = fs
  .readdirSync(localesDir)
  .filter((file) => file.endsWith('.json'));

console.log('Found locale files:', localeFiles);

localeFiles.forEach((file) => {
  const filePath = path.join(localesDir, file);
  const locale = path.basename(file, '.json');

  console.log(`\nProcessing ${file} (locale: ${locale})`);

  try {
    // 读取现有的翻译文件
    const existingContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // 获取对应语言的翻译
    const localeTranslations = translations[locale] || translations.en;

    // 确保 HomePage 对象存在
    if (!existingContent.HomePage) {
      existingContent.HomePage = {};
    }

    // 添加 calltoaction 翻译
    existingContent.HomePage.calltoaction = localeTranslations.calltoaction;
    console.log(
      `✅ Added HomePage.calltoaction translations for locale: ${locale}`
    );

    // 添加 testimonials 翻译
    existingContent.HomePage.testimonials = localeTranslations.testimonials;
    console.log(
      `✅ Added HomePage.testimonials translations for locale: ${locale}`
    );

    // 写回文件
    fs.writeFileSync(
      filePath,
      JSON.stringify(existingContent, null, 2),
      'utf8'
    );
    console.log(`✅ Updated ${file} successfully`);
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\n🎉 CTA and Testimonials translations update completed!');
