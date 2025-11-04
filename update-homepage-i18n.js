/**
 * 完整更新首页所有组件的翻译
 * 运行: node update-homepage-i18n.js
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');

// 定义所有语言的完整翻译
const translations = {
  'zh-CN': {
    BaziHome: {
      title: '开始命理之旅',
      subtitle: '免费体验',
      heroTitle: '3分钟，看清你的',
      heroTitleHighlight: '天赋与运势转折点',
      heroDescription: '结合千年命理智慧与AI算法，98%用户认为「准得离谱」',
      accuracy: '98% 算法精准',
      privacy: '隐私保护',
      speed: '3分钟分析',
      userCount: '已有 {count} 人获得了人生指南',
      rating: '用户评分',
      algorithmAccuracy: '算法准确率',
      viewExample: '先看个示例',
      aiConsultation: 'AI智能咨询',
    },
    form: {
      title: '开始命理之旅 · 免费体验',
      name: '姓名',
      namePlaceholder: '请输入姓名',
      gender: '性别',
      male: '男',
      female: '女',
      birthCity: '出生城市',
      birthCityPlaceholder: '如: 北京',
      solarTime: '真太阳时',
      birthDate: '出生日期',
      solar: '阳历',
      lunar: '阴历',
      birthTime: '出生时间',
      timeMorning: '上午',
      timeAfternoon: '下午',
      timeEvening: '晚上',
      timeMorningTooltip: '卯辰巳午 (05:00-13:00)',
      timeAfternoonTooltip: '未申酉戌 (13:00-21:00)',
      timeEveningTooltip: '亥子丑寅 (21:00-05:00)',
      lunarNote: '已选择阴历，系统将自动转换为阳历进行排盘',
      submitButton: '开始分析',
      addHouseInfo: '添加风水信息（可选）',
      houseDirection: '房屋朝向',
      selectDirection: '选择朝向',
      roomCount: '房间数',
      completionYear: '建成年份',
      completionMonth: '建成月份',
      noRegistration: '💡 无需注册 · 3分钟生成 · 首次体验免费',
      fillAllFields: '请填写所有必填信息',
      users: '12万+用户',
      accurate: '98%准确',
    },
    home: {
      features: {
        title: '强大的功能，简单的操作',
        subtitle:
          '从八字命理到风水布局，从数据分析到AI咨询，一站式解决所有需求',
        learnMore: '了解更多',
        hint: '💡 所有功能均采用先进的AI算法，确保准确性和专业性',
        bazi: {
          title: '八字分析',
          description: '30秒生成命理报告',
        },
        xuankong: {
          title: '玄空风水',
          description: '智能飞星布局分析',
        },
        compass: {
          title: '罗盘算法',
          description: 'AI 智能方位识别',
        },
        floorPlan: {
          title: '户型图分析',
          description: '上传户型图即可分析',
        },
        visualization3d: {
          title: '3D 可视化',
          description: '立体风水布局展示',
        },
        aiAssistant: {
          title: 'AI 助手',
          description: '24/7 智能问答',
        },
      },
    },
  },
  'zh-TW': {
    BaziHome: {
      title: '開始命理之旅',
      subtitle: '免費體驗',
      heroTitle: '3分鐘，看清你的',
      heroTitleHighlight: '天賦與運勢轉折點',
      heroDescription: '結合千年命理智慧與AI算法，98%用戶認為「準得離譜」',
      accuracy: '98% 算法精準',
      privacy: '隱私保護',
      speed: '3分鐘分析',
      userCount: '已有 {count} 人獲得了人生指南',
      rating: '用戶評分',
      algorithmAccuracy: '算法準確率',
      viewExample: '先看個示例',
      aiConsultation: 'AI智能諮詢',
    },
    form: {
      title: '開始命理之旅 · 免費體驗',
      name: '姓名',
      namePlaceholder: '請輸入姓名',
      gender: '性別',
      male: '男',
      female: '女',
      birthCity: '出生城市',
      birthCityPlaceholder: '如: 台北',
      solarTime: '真太陽時',
      birthDate: '出生日期',
      solar: '陽曆',
      lunar: '陰曆',
      birthTime: '出生時間',
      timeMorning: '上午',
      timeAfternoon: '下午',
      timeEvening: '晚上',
      timeMorningTooltip: '卯辰巳午 (05:00-13:00)',
      timeAfternoonTooltip: '未申酉戌 (13:00-21:00)',
      timeEveningTooltip: '亥子丑寅 (21:00-05:00)',
      lunarNote: '已選擇陰曆，系統將自動轉換為陽曆進行排盤',
      submitButton: '開始分析',
      addHouseInfo: '添加風水資訊（可選）',
      houseDirection: '房屋朝向',
      selectDirection: '選擇朝向',
      roomCount: '房間數',
      completionYear: '建成年份',
      completionMonth: '建成月份',
      noRegistration: '💡 無需註冊 · 3分鐘生成 · 首次體驗免費',
      fillAllFields: '請填寫所有必填資訊',
      users: '12萬+用戶',
      accurate: '98%準確',
    },
    home: {
      features: {
        title: '強大的功能，簡單的操作',
        subtitle:
          '從八字命理到風水佈局，從數據分析到AI諮詢，一站式解決所有需求',
        learnMore: '了解更多',
        hint: '💡 所有功能均採用先進的AI算法，確保準確性和專業性',
        bazi: {
          title: '八字分析',
          description: '30秒生成命理報告',
        },
        xuankong: {
          title: '玄空風水',
          description: '智能飛星佈局分析',
        },
        compass: {
          title: '羅盤算法',
          description: 'AI 智能方位識別',
        },
        floorPlan: {
          title: '戶型圖分析',
          description: '上傳戶型圖即可分析',
        },
        visualization3d: {
          title: '3D 可視化',
          description: '立體風水佈局展示',
        },
        aiAssistant: {
          title: 'AI 助手',
          description: '24/7 智能問答',
        },
      },
    },
  },
  en: {
    BaziHome: {
      title: 'Start Your Journey',
      subtitle: 'Free Experience',
      heroTitle: 'In 3 Minutes, Discover Your',
      heroTitleHighlight: 'Talents & Destiny Turning Points',
      heroDescription:
        'Combining ancient wisdom with AI algorithms, 98% of users say "Surprisingly Accurate"',
      accuracy: '98% Algorithm Accuracy',
      privacy: 'Privacy Protected',
      speed: '3-Minute Analysis',
      userCount: '{count} people have received their life guidance',
      rating: 'User Rating',
      algorithmAccuracy: 'Algorithm Accuracy',
      viewExample: 'View Example',
      aiConsultation: 'AI Consultation',
    },
    form: {
      title: 'Start Your Journey · Free Experience',
      name: 'Name',
      namePlaceholder: 'Enter your name',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      birthCity: 'Birth City',
      birthCityPlaceholder: 'e.g. Beijing',
      solarTime: 'Solar Time',
      birthDate: 'Birth Date',
      solar: 'Solar',
      lunar: 'Lunar',
      birthTime: 'Birth Time',
      timeMorning: 'Morning',
      timeAfternoon: 'Afternoon',
      timeEvening: 'Evening',
      timeMorningTooltip: 'Mao-Chen-Si-Wu (05:00-13:00)',
      timeAfternoonTooltip: 'Wei-Shen-You-Xu (13:00-21:00)',
      timeEveningTooltip: 'Hai-Zi-Chou-Yin (21:00-05:00)',
      lunarNote: 'Lunar calendar selected, will be converted to solar calendar',
      submitButton: 'Start Analysis',
      addHouseInfo: 'Add House Info (Optional)',
      houseDirection: 'House Direction',
      selectDirection: 'Select Direction',
      roomCount: 'Rooms',
      completionYear: 'Completion Year',
      completionMonth: 'Completion Month',
      noRegistration: '💡 No Registration · 3 Minutes · First Try Free',
      fillAllFields: 'Please fill in all required fields',
      users: '120K+ Users',
      accurate: '98% Accurate',
    },
    home: {
      features: {
        title: 'Powerful Features, Simple Operation',
        subtitle:
          'From BaZi analysis to Feng Shui layout, from data analysis to AI consultation, one-stop solution',
        learnMore: 'Learn More',
        hint: '💡 All features use advanced AI algorithms to ensure accuracy and professionalism',
        bazi: {
          title: 'BaZi Analysis',
          description: '30-second fortune report',
        },
        xuankong: {
          title: 'Flying Star Feng Shui',
          description: 'Smart flying star layout analysis',
        },
        compass: {
          title: 'Compass Algorithm',
          description: 'AI smart direction recognition',
        },
        floorPlan: {
          title: 'Floor Plan Analysis',
          description: 'Upload floor plan for analysis',
        },
        visualization3d: {
          title: '3D Visualization',
          description: '3D Feng Shui layout display',
        },
        aiAssistant: {
          title: 'AI Assistant',
          description: '24/7 intelligent Q&A',
        },
      },
    },
  },
  ja: {
    BaziHome: {
      title: '運命の旅を始めよう',
      subtitle: '無料体験',
      heroTitle: '3分で、あなたの',
      heroTitleHighlight: '才能と運命の転換点を発見',
      heroDescription:
        '千年の叡智とAIアルゴリズムを融合、98%のユーザーが「驚くほど正確」と評価',
      accuracy: '98% アルゴリズム精度',
      privacy: 'プライバシー保護',
      speed: '3分で分析',
      userCount: '{count}人が人生の指針を得ました',
      rating: 'ユーザー評価',
      algorithmAccuracy: 'アルゴリズム精度',
      viewExample: '例を見る',
      aiConsultation: 'AIコンサルティング',
    },
    form: {
      title: '運命の旅を始めよう · 無料体験',
      name: '氏名',
      namePlaceholder: '氏名を入力してください',
      gender: '性別',
      male: '男性',
      female: '女性',
      birthCity: '出生地',
      birthCityPlaceholder: '例: 東京',
      solarTime: '真太陽時',
      birthDate: '生年月日',
      solar: '太陽暦',
      lunar: '太陰暦',
      birthTime: '出生時刻',
      timeMorning: '午前',
      timeAfternoon: '午後',
      timeEvening: '夜',
      timeMorningTooltip: '卯辰巳午 (05:00-13:00)',
      timeAfternoonTooltip: '未申酉戌 (13:00-21:00)',
      timeEveningTooltip: '亥子丑寅 (21:00-05:00)',
      lunarNote: '太陰暦が選択されています。太陽暦に自動変換されます',
      submitButton: '分析開始',
      addHouseInfo: '住宅情報を追加（任意）',
      houseDirection: '住宅の向き',
      selectDirection: '向きを選択',
      roomCount: '部屋数',
      completionYear: '竣工年',
      completionMonth: '竣工月',
      noRegistration: '💡 登録不要 · 3分で生成 · 初回無料',
      fillAllFields: 'すべての必須項目を入力してください',
      users: '12万+ユーザー',
      accurate: '98%正確',
    },
    home: {
      features: {
        title: '強力な機能、簡単な操作',
        subtitle:
          '四柱推命から風水配置、データ分析からAIコンサルティングまで、ワンストップソリューション',
        learnMore: '詳細を見る',
        hint: '💡 すべての機能は高度なAIアルゴリズムを使用し、精度と専門性を保証します',
        bazi: {
          title: '四柱推命分析',
          description: '30秒で運命レポート生成',
        },
        xuankong: {
          title: '玄空風水',
          description: 'スマート飛星配置分析',
        },
        compass: {
          title: '羅盤アルゴリズム',
          description: 'AIスマート方位認識',
        },
        floorPlan: {
          title: '間取り図分析',
          description: '間取り図をアップロードして分析',
        },
        visualization3d: {
          title: '3D可視化',
          description: '3D風水配置表示',
        },
        aiAssistant: {
          title: 'AIアシスタント',
          description: '24/7インテリジェントQ&A',
        },
      },
    },
  },
  ko: {
    BaziHome: {
      title: '운명의 여정 시작',
      subtitle: '무료 체험',
      heroTitle: '3분 안에, 당신의',
      heroTitleHighlight: '재능과 운명의 전환점 발견',
      heroDescription:
        '천년의 지혜와 AI 알고리즘의 결합, 98%의 사용자가 "놀랍도록 정확"하다고 평가',
      accuracy: '98% 알고리즘 정확도',
      privacy: '개인정보 보호',
      speed: '3분 분석',
      userCount: '{count}명이 인생 지침을 받았습니다',
      rating: '사용자 평가',
      algorithmAccuracy: '알고리즘 정확도',
      viewExample: '예시 보기',
      aiConsultation: 'AI 상담',
    },
    form: {
      title: '운명의 여정 시작 · 무료 체험',
      name: '이름',
      namePlaceholder: '이름을 입력하세요',
      gender: '성별',
      male: '남성',
      female: '여성',
      birthCity: '출생 도시',
      birthCityPlaceholder: '예: 서울',
      solarTime: '진태양시',
      birthDate: '생년월일',
      solar: '양력',
      lunar: '음력',
      birthTime: '출생 시간',
      timeMorning: '오전',
      timeAfternoon: '오후',
      timeEvening: '저녁',
      timeMorningTooltip: '묘진사오 (05:00-13:00)',
      timeAfternoonTooltip: '미신유술 (13:00-21:00)',
      timeEveningTooltip: '해자축인 (21:00-05:00)',
      lunarNote: '음력이 선택되었습니다. 양력으로 자동 변환됩니다',
      submitButton: '분석 시작',
      addHouseInfo: '주택 정보 추가 (선택사항)',
      houseDirection: '주택 방향',
      selectDirection: '방향 선택',
      roomCount: '방 개수',
      completionYear: '완공 연도',
      completionMonth: '완공 월',
      noRegistration: '💡 등록 불필요 · 3분 생성 · 첫 체험 무료',
      fillAllFields: '모든 필수 항목을 입력하세요',
      users: '12만+ 사용자',
      accurate: '98% 정확',
    },
    home: {
      features: {
        title: '강력한 기능, 간단한 조작',
        subtitle:
          '사주 분석부터 풍수 배치, 데이터 분석부터 AI 상담까지, 원스톱 솔루션',
        learnMore: '자세히 보기',
        hint: '💡 모든 기능은 고급 AI 알고리즘을 사용하여 정확성과 전문성을 보장합니다',
        bazi: {
          title: '사주 분석',
          description: '30초 운세 보고서',
        },
        xuankong: {
          title: '현공 풍수',
          description: '스마트 비성 배치 분석',
        },
        compass: {
          title: '나침반 알고리즘',
          description: 'AI 스마트 방향 인식',
        },
        floorPlan: {
          title: '평면도 분석',
          description: '평면도를 업로드하여 분석',
        },
        visualization3d: {
          title: '3D 시각화',
          description: '3D 풍수 배치 표시',
        },
        aiAssistant: {
          title: 'AI 어시스턴트',
          description: '24/7 지능형 Q&A',
        },
      },
    },
  },
  ms: {
    BaziHome: {
      title: 'Mulakan Perjalanan',
      subtitle: 'Percubaan Percuma',
      heroTitle: 'Dalam 3 Minit, Temui',
      heroTitleHighlight: 'Bakat & Titik Perubahan Takdir Anda',
      heroDescription:
        'Menggabungkan kebijaksanaan kuno dengan algoritma AI, 98% pengguna berkata "Sangat Tepat"',
      accuracy: '98% Ketepatan Algoritma',
      privacy: 'Privasi Dilindungi',
      speed: 'Analisis 3 Minit',
      userCount: '{count} orang telah menerima panduan hidup mereka',
      rating: 'Penilaian Pengguna',
      algorithmAccuracy: 'Ketepatan Algoritma',
      viewExample: 'Lihat Contoh',
      aiConsultation: 'Konsultasi AI',
    },
    form: {
      title: 'Mulakan Perjalanan · Percubaan Percuma',
      name: 'Nama',
      namePlaceholder: 'Masukkan nama anda',
      gender: 'Jantina',
      male: 'Lelaki',
      female: 'Perempuan',
      birthCity: 'Bandar Lahir',
      birthCityPlaceholder: 'cth: Kuala Lumpur',
      solarTime: 'Masa Suria',
      birthDate: 'Tarikh Lahir',
      solar: 'Solar',
      lunar: 'Lunar',
      birthTime: 'Masa Lahir',
      timeMorning: 'Pagi',
      timeAfternoon: 'Petang',
      timeEvening: 'Malam',
      timeMorningTooltip: 'Mao-Chen-Si-Wu (05:00-13:00)',
      timeAfternoonTooltip: 'Wei-Shen-You-Xu (13:00-21:00)',
      timeEveningTooltip: 'Hai-Zi-Chou-Yin (21:00-05:00)',
      lunarNote: 'Kalendar lunar dipilih, akan ditukar ke kalendar solar',
      submitButton: 'Mula Analisis',
      addHouseInfo: 'Tambah Info Rumah (Pilihan)',
      houseDirection: 'Arah Rumah',
      selectDirection: 'Pilih Arah',
      roomCount: 'Bilangan Bilik',
      completionYear: 'Tahun Siap',
      completionMonth: 'Bulan Siap',
      noRegistration:
        '💡 Tiada Pendaftaran · 3 Minit · Percubaan Pertama Percuma',
      fillAllFields: 'Sila isi semua medan wajib',
      users: '120K+ Pengguna',
      accurate: '98% Tepat',
    },
    home: {
      features: {
        title: 'Ciri Berkuasa, Operasi Mudah',
        subtitle:
          'Dari analisis BaZi ke susun atur Feng Shui, dari analisis data ke konsultasi AI, penyelesaian sehenti',
        learnMore: 'Ketahui Lebih Lanjut',
        hint: '💡 Semua ciri menggunakan algoritma AI termaju untuk memastikan ketepatan dan profesionalisme',
        bazi: {
          title: 'Analisis BaZi',
          description: 'Laporan nasib 30 saat',
        },
        xuankong: {
          title: 'Feng Shui Bintang Terbang',
          description: 'Analisis susun atur bintang terbang pintar',
        },
        compass: {
          title: 'Algoritma Kompas',
          description: 'Pengiktirafan arah pintar AI',
        },
        floorPlan: {
          title: 'Analisis Pelan Lantai',
          description: 'Muat naik pelan lantai untuk analisis',
        },
        visualization3d: {
          title: 'Visualisasi 3D',
          description: 'Paparan susun atur Feng Shui 3D',
        },
        aiAssistant: {
          title: 'Pembantu AI',
          description: 'Soal jawab pintar 24/7',
        },
      },
    },
  },
};

// 更新每个语言文件
Object.keys(translations).forEach((locale) => {
  const filePath = path.join(localesDir, `${locale}.json`);

  try {
    // 读取现有文件
    const content = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(content);

    // 合并新的翻译（保留现有的其他翻译）
    Object.assign(json, translations[locale]);

    // 写回文件（保持格式化）
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf-8');

    console.log(`✅ 已更新 ${locale}.json`);
  } catch (error) {
    console.error(`❌ 更新 ${locale}.json 失败:`, error.message);
  }
});

console.log('\n🎉 所有语言文件更新完成！');
console.log('\n📝 已添加的翻译命名空间:');
console.log('  - BaziHome (Hero 区域)');
console.log('  - form (表单)');
console.log('  - home.features (功能展示)');
