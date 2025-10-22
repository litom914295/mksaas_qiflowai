/**
 * 添加缺失的 form 命名空间到所有语言文件
 */

const fs = require('fs');
const path = require('path');

const locales = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ms'];
const messagesDir = path.join(__dirname, '..', 'messages');

// form 命名空间的翻译内容
const formTranslations = {
  'zh-CN': {
    title: '开始命理之旅 · 免费体验',
    subtitle: '基于专业算法的个性化命理分析',
    name: '姓名',
    namePlaceholder: '请输入您的姓名',
    gender: '性别',
    male: '男',
    female: '女',
    birthDate: '出生日期',
    year: '年',
    month: '月',
    day: '日',
    yearPlaceholder: '选择年份',
    monthPlaceholder: '月',
    dayPlaceholder: '日',
    birthTime: '出生时间',
    morning: '上午（06:00-12:00）',
    afternoon: '下午（12:00-18:00）',
    evening: '晚上（18:00-00:00）',
    exact: '精确时间',
    exactTimePlaceholder: '请选择具体时间',
    birthPlace: '出生地点',
    birthPlacePlaceholder: '请输入您的出生城市',
    calendarType: '历法类型',
    solar: '阳历（公历）',
    lunar: '农历',
    houseInfo: '房屋信息（可选）',
    direction: '朝向',
    roomCount: '房间数',
    completionDate: '建成时间',
    submit: '开始分析',
    required: '必填',
    optional: '选填',
  },
  'zh-TW': {
    title: '開始命理之旅 · 免費體驗',
    subtitle: '基於專業算法的個性化命理分析',
    name: '姓名',
    namePlaceholder: '請輸入您的姓名',
    gender: '性別',
    male: '男',
    female: '女',
    birthDate: '出生日期',
    year: '年',
    month: '月',
    day: '日',
    yearPlaceholder: '選擇年份',
    monthPlaceholder: '月',
    dayPlaceholder: '日',
    birthTime: '出生時間',
    morning: '上午（06:00-12:00）',
    afternoon: '下午（12:00-18:00）',
    evening: '晚上（18:00-00:00）',
    exact: '精確時間',
    exactTimePlaceholder: '請選擇具體時間',
    birthPlace: '出生地點',
    birthPlacePlaceholder: '請輸入您的出生城市',
    calendarType: '曆法類型',
    solar: '陽歷（公歷）',
    lunar: '農歷',
    houseInfo: '房屋信息（可選）',
    direction: '朝向',
    roomCount: '房間數',
    completionDate: '建成時間',
    submit: '開始分析',
    required: '必填',
    optional: '選填',
  },
  en: {
    title: 'Start Your Journey · Free Experience',
    subtitle: 'Personalized BaZi analysis based on professional algorithms',
    name: 'Name',
    namePlaceholder: 'Enter your name',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    birthDate: 'Birth Date',
    year: 'Year',
    month: 'Month',
    day: 'Day',
    yearPlaceholder: 'Select year',
    monthPlaceholder: 'Month',
    dayPlaceholder: 'Day',
    birthTime: 'Birth Time',
    morning: 'Morning (06:00-12:00)',
    afternoon: 'Afternoon (12:00-18:00)',
    evening: 'Evening (18:00-00:00)',
    exact: 'Exact Time',
    exactTimePlaceholder: 'Select exact time',
    birthPlace: 'Birth Place',
    birthPlacePlaceholder: 'Enter your birth city',
    calendarType: 'Calendar Type',
    solar: 'Solar (Gregorian)',
    lunar: 'Lunar',
    houseInfo: 'House Information (Optional)',
    direction: 'Direction',
    roomCount: 'Room Count',
    completionDate: 'Completion Date',
    submit: 'Start Analysis',
    required: 'Required',
    optional: 'Optional',
  },
  ja: {
    title: '運命の旅を始めよう · 無料体験',
    subtitle:
      'プロフェッショナルアルゴリズムに基づくパーソナライズされた八字分析',
    name: '名前',
    namePlaceholder: 'お名前を入力してください',
    gender: '性別',
    male: '男性',
    female: '女性',
    birthDate: '生年月日',
    year: '年',
    month: '月',
    day: '日',
    yearPlaceholder: '年を選択',
    monthPlaceholder: '月',
    dayPlaceholder: '日',
    birthTime: '出生時刻',
    morning: '午前（06:00-12:00）',
    afternoon: '午後（12:00-18:00）',
    evening: '夜（18:00-00:00）',
    exact: '正確な時間',
    exactTimePlaceholder: '正確な時間を選択',
    birthPlace: '出生地',
    birthPlacePlaceholder: '出生地を入力してください',
    calendarType: '暦の種類',
    solar: '太陽暦（西暦）',
    lunar: '太陰暦',
    houseInfo: '住宅情報（オプション）',
    direction: '方位',
    roomCount: '部屋数',
    completionDate: '完成日',
    submit: '分析を開始',
    required: '必須',
    optional: 'オプション',
  },
  ko: {
    title: '운명의 여정 시작 · 무료 체험',
    subtitle: '전문 알고리즘 기반 개인화된 사주 분석',
    name: '이름',
    namePlaceholder: '이름을 입력하세요',
    gender: '성별',
    male: '남성',
    female: '여성',
    birthDate: '생년월일',
    year: '년',
    month: '월',
    day: '일',
    yearPlaceholder: '년도 선택',
    monthPlaceholder: '월',
    dayPlaceholder: '일',
    birthTime: '출생 시간',
    morning: '오전（06:00-12:00）',
    afternoon: '오후（12:00-18:00）',
    evening: '저녁（18:00-00:00）',
    exact: '정확한 시간',
    exactTimePlaceholder: '정확한 시간 선택',
    birthPlace: '출생지',
    birthPlacePlaceholder: '출생 도시를 입력하세요',
    calendarType: '달력 유형',
    solar: '양력',
    lunar: '음력',
    houseInfo: '주택 정보（선택 사항）',
    direction: '방향',
    roomCount: '방 수',
    completionDate: '완공 날짜',
    submit: '분석 시작',
    required: '필수',
    optional: '선택',
  },
  ms: {
    title: 'Mulakan Perjalanan · Percubaan Percuma',
    subtitle: 'Analisis BaZi peribadi berdasarkan algoritma profesional',
    name: 'Nama',
    namePlaceholder: 'Masukkan nama anda',
    gender: 'Jantina',
    male: 'Lelaki',
    female: 'Perempuan',
    birthDate: 'Tarikh Lahir',
    year: 'Tahun',
    month: 'Bulan',
    day: 'Hari',
    yearPlaceholder: 'Pilih tahun',
    monthPlaceholder: 'Bulan',
    dayPlaceholder: 'Hari',
    birthTime: 'Masa Lahir',
    morning: 'Pagi (06:00-12:00)',
    afternoon: 'Petang (12:00-18:00)',
    evening: 'Malam (18:00-00:00)',
    exact: 'Masa Tepat',
    exactTimePlaceholder: 'Pilih masa tepat',
    birthPlace: 'Tempat Lahir',
    birthPlacePlaceholder: 'Masukkan bandar lahir anda',
    calendarType: 'Jenis Kalendar',
    solar: 'Solar (Gregorian)',
    lunar: 'Lunar',
    houseInfo: 'Maklumat Rumah (Pilihan)',
    direction: 'Arah',
    roomCount: 'Bilangan Bilik',
    completionDate: 'Tarikh Siap',
    submit: 'Mula Analisis',
    required: 'Wajib',
    optional: 'Pilihan',
  },
};

function addFormNamespace() {
  console.log('🚀 开始添加 form 命名空间\n');

  let successCount = 0;
  let failCount = 0;

  for (const locale of locales) {
    const filePath = path.join(messagesDir, `${locale}.json`);

    try {
      // 读取现有文件
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      // 检查是否已有 form 键
      if ('form' in data) {
        console.log(`✓ ${locale}: 已存在 form 命名空间，跳过`);
        successCount++;
        continue;
      }

      // 添加 form 命名空间
      data.form = formTranslations[locale];

      // 写回文件
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

      console.log(`✅ ${locale}: 成功添加 form 命名空间`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${locale}: 处理失败 - ${error.message}`);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ 成功: ${successCount} 个语言`);
  console.log(`❌ 失败: ${failCount} 个语言`);

  if (failCount === 0) {
    console.log('\n🎉 所有语言的 form 命名空间添加成功！');
    console.log('\n📝 后续步骤：');
    console.log('1. 停止开发服务器 (Ctrl+C)');
    console.log('2. 删除缓存: Remove-Item -Recurse -Force .next');
    console.log('3. 重启服务器: npm run dev');
    console.log('4. 硬刷新浏览器 (Ctrl+Shift+R)');
  }
}

addFormNamespace();
