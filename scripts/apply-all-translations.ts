/**
 * 应用所有语言的翻译
 * 
 * 批量翻译繁体中文、日语、韩语、马来语
 */

import fs from 'fs';
import path from 'path';

const MESSAGES_DIR = path.join(process.cwd(), 'messages');

interface TranslationObject {
  [key: string]: string | string[] | TranslationObject;
}

// 繁体中文翻译映射
const zhTWTranslations: { [key: string]: string } = {
  // AI Pages
  'AI Audio': 'AI 音訊',
  'AI Chat': 'AI 聊天',
  'AI Image': 'AI 圖像',
  'AI Video': 'AI 視頻',
  'AI Text Demo': 'AI 文本演示',
  'MkSaaS lets you make AI SaaS in days, simply and effortlessly': 'MkSaaS 讓您輕鬆快速地在幾天內構建 AI SaaS',
  'Analyze web content with AI to extract key information, features, and insights': '使用 AI 分析網站內容以提取關鍵信息、功能和見解',
  'Web Content Analyzer': '網站內容分析器',
  'Enter a website URL to get AI-powered analysis of its content': '輸入網站 URL 以獲取 AI 驅動的內容分析',
  'Analyze any website content using AI to extract structured information': '使用 AI 分析任何網站內容以提取結構化信息',
  'Enter website URL (e.g., https://example.com)': '輸入網站 URL（例如：https://example.com）',
  'Analyze Website': '分析網站',
  'Scraping website content...': '正在抓取網站內容...',
  'Analyzing content with AI...': '正在使用 AI 分析內容...',
  'Analysis Results': '分析結果',
  'Analyze Another Website': '分析其他網站',
  'Title': '標題',
  'Description': '描述',
  'Introduction': '簡介',
  'Features': '功能',
  'Pricing': '定價',
  'Use Cases': '使用案例',
  'Website Screenshot': '網站截圖',
  'Please enter a valid URL starting with http:// or https://': '請輸入以 http:// 或 https:// 開頭的有效 URL',
  'Failed to analyze website. Please try again.': '分析網站失敗，請重試',
  'Network error. Please check your connection and try again.': '網絡錯誤，請檢查您的連接並重試',
  'Insufficient credits. Please purchase more credits to continue.': '積分不足，請購買更多積分以繼續',
  'Smart Web Scraping': '智能網頁抓取',
  'Advanced web scraping technology extracts clean, structured content from any website': '先進的網頁抓取技術從任何網站提取乾淨、結構化的內容',
  'AI-Powered Analysis': 'AI 驅動分析',
  'Intelligent AI analysis extracts key insights, features, and structured information': '智能 AI 分析提取關鍵見解、功能和結構化信息',
  'Structured Results': '結構化結果',
  'Get organized, easy-to-read results with clear sections and actionable insights': '獲得組織良好、易於閱讀的結果，包含清晰的章節和可操作的見解',
  
  // About
  'About': '關於',
  'This is MkSaaS, an AI SaaS template built with modern technologies, helping you build your SaaS faster and better.': '這是 MkSaaS，一個使用現代技術構建的 AI SaaS 模板，幫助您更快更好地構建 SaaS',
  'AI SaaS Boilerplate': 'AI SaaS 樣板',
  '👋 Hi there! This is MkSaaS, an AI SaaS template built with modern technologies, helping you build your SaaS faster and better. If you have any questions, welcome to contact me.': '👋 您好！這是 MkSaaS，一個使用現代技術構建的 AI SaaS 模板，幫助您更快更好地構建 SaaS。如有任何問題，歡迎聯繫我',
  'Talk with me': '與我交談',
  'Follow me on X': '在 X 上關注我',
  
  // Auth
  'Login': '登入',
  'Welcome back': '歡迎回來',
  'Email': '電子郵件',
  'Password': '密碼',
  'Sign In': '登入',
  "Don't have an account? Sign up": '還沒有帳戶？註冊',
  'Forgot Password?': '忘記密碼？',
  'Sign In with Google': '使用 Google 登入',
  'Sign In with GitHub': '使用 GitHub 登入',
  'Show password': '顯示密碼',
  'Hide password': '隱藏密碼',
  'Or continue with': '或繼續使用',
  
  // Bazi
  'male': '男',
  'female': '女',
  'TODO: translate Bazi.male': '男',
  'TODO: translate Bazi.female': '女',
  
  // Common
  'Precise Algorithm': '精準算法',
  'Privacy Protected': '隱私保護',
  'Instant Analysis': '即時分析',
  'Trusted by 10,000+ users': '超過 10,000 名用戶的信賴',
  'Calibrating...': '校準中...',
  'TODO: translate Compass.measuring': '測量中',
  'TODO: translate Compass.calibrate_device': '校準設備',
  'TODO: translate Compass.direction': '方向',
  'TODO: translate Compass.degree': '度數',
  'Dark': '深色',
  'Light': '淺色',
  'System': '跟隨系統',
  'Get Started': '開始使用',
  'MkSaaS': 'MkSaaS',
  'Bazi': '八字',
};

// 日语翻译映射
const jaTranslations: { [key: string]: string } = {
  'AI Audio': 'AI オーディオ',
  'AI Chat': 'AI チャット',
  'AI Image': 'AI 画像',
  'AI Video': 'AI 動画',
  'AI Text Demo': 'AI テキストデモ',
  'MkSaaS lets you make AI SaaS in days, simply and effortlessly': 'MkSaaS を使用すると、数日で簡単に AI SaaS を作成できます',
  'Analyze web content with AI to extract key information, features, and insights': 'AI を使用してウェブコンテンツを分析し、重要な情報、機能、洞察を抽出します',
  'Web Content Analyzer': 'ウェブコンテンツ分析器',
  'Enter a website URL to get AI-powered analysis of its content': 'ウェブサイトの URL を入力して、AI によるコンテンツ分析を取得します',
  'Analyze any website content using AI to extract structured information': 'AI を使用して任意のウェブサイトコンテンツを分析し、構造化情報を抽出します',
  'Enter website URL (e.g., https://example.com)': 'ウェブサイトの URL を入力（例：https://example.com）',
  'Analyze Website': 'ウェブサイトを分析',
  'Scraping website content...': 'ウェブサイトコンテンツを取得中...',
  'Analyzing content with AI...': 'AI でコンテンツを分析中...',
  'Analysis Results': '分析結果',
  'Analyze Another Website': '別のウェブサイトを分析',
  'Title': 'タイトル',
  'Description': '説明',
  'Introduction': '紹介',
  'Features': '機能',
  'Pricing': '料金',
  'Use Cases': '使用例',
  'Website Screenshot': 'ウェブサイトのスクリーンショット',
  'Please enter a valid URL starting with http:// or https://': 'http:// または https:// で始まる有効な URL を入力してください',
  'Failed to analyze website. Please try again.': 'ウェブサイトの分析に失敗しました。もう一度お試しください',
  'Network error. Please check your connection and try again.': 'ネットワークエラー。接続を確認してもう一度お試しください',
  'Insufficient credits. Please purchase more credits to continue.': 'クレジットが不足しています。続行するには追加のクレジットを購入してください',
  'Smart Web Scraping': 'スマートウェブスクレイピング',
  'Advanced web scraping technology extracts clean, structured content from any website': '高度なウェブスクレイピング技術により、あらゆるウェブサイトからクリーンで構造化されたコンテンツを抽出します',
  'AI-Powered Analysis': 'AI 駆動分析',
  'Intelligent AI analysis extracts key insights, features, and structured information': 'インテリジェント AI 分析により、重要な洞察、機能、構造化情報を抽出します',
  'Structured Results': '構造化された結果',
  'Get organized, easy-to-read results with clear sections and actionable insights': '明確なセクションと実用的な洞察を備えた、整理された読みやすい結果を取得します',
  
  'About': '概要',
  'This is MkSaaS, an AI SaaS template built with modern technologies, helping you build your SaaS faster and better.': 'これは MkSaaS です。最新技術で構築された AI SaaS テンプレートで、SaaS をより速く、より良く構築するのに役立ちます',
  'AI SaaS Boilerplate': 'AI SaaS ボイラープレート',
  '👋 Hi there! This is MkSaaS, an AI SaaS template built with modern technologies, helping you build your SaaS faster and better. If you have any questions, welcome to contact me.': '👋 こんにちは！これは MkSaaS です。最新技術で構築された AI SaaS テンプレートで、SaaS をより速く、より良く構築するのに役立ちます。ご質問がありましたら、お気軽にお問い合わせください',
  'Talk with me': '私と話す',
  'Follow me on X': 'X でフォロー',
  
  'Login': 'ログイン',
  'Welcome back': 'お帰りなさい',
  'Email': 'メール',
  'Password': 'パスワード',
  'Sign In': 'サインイン',
  "Don't have an account? Sign up": 'アカウントをお持ちでないですか？サインアップ',
  'Forgot Password?': 'パスワードをお忘れですか？',
  'Sign In with Google': 'Google でサインイン',
  'Sign In with GitHub': 'GitHub でサインイン',
  'Show password': 'パスワードを表示',
  'Hide password': 'パスワードを非表示',
  'Or continue with': 'または続ける',
  
  'male': '男性',
  'female': '女性',
  'TODO: translate Bazi.male': '男性',
  'TODO: translate Bazi.female': '女性',
  
  'Precise Algorithm': '正確なアルゴリズム',
  'Privacy Protected': 'プライバシー保護',
  'Instant Analysis': '即時分析',
  'Trusted by 10,000+ users': '10,000人以上のユーザーに信頼されています',
  'Calibrating...': 'キャリブレーション中...',
  'TODO: translate Compass.measuring': '測定中',
  'TODO: translate Compass.calibrate_device': 'デバイスのキャリブレーション',
  'TODO: translate Compass.direction': '方向',
  'TODO: translate Compass.degree': '度',
  'Dark': 'ダーク',
  'Light': 'ライト',
  'System': 'システム',
  'Get Started': '始める',
  'MkSaaS': 'MkSaaS',
  'Bazi': '八字',
};

// 韩语翻译映射
const koTranslations: { [key: string]: string } = {
  'AI Audio': 'AI 오디오',
  'AI Chat': 'AI 채팅',
  'AI Image': 'AI 이미지',
  'AI Video': 'AI 비디오',
  'AI Text Demo': 'AI 텍스트 데모',
  'MkSaaS lets you make AI SaaS in days, simply and effortlessly': 'MkSaaS를 사용하면 며칠 만에 간단하고 쉽게 AI SaaS를 만들 수 있습니다',
  'Analyze web content with AI to extract key information, features, and insights': 'AI로 웹 콘텐츠를 분석하여 주요 정보, 기능 및 인사이트를 추출합니다',
  'Web Content Analyzer': '웹 콘텐츠 분석기',
  'Enter a website URL to get AI-powered analysis of its content': '웹사이트 URL을 입력하여 AI 기반 콘텐츠 분석을 받으세요',
  'Analyze any website content using AI to extract structured information': 'AI를 사용하여 모든 웹사이트 콘텐츠를 분석하고 구조화된 정보를 추출합니다',
  'Enter website URL (e.g., https://example.com)': '웹사이트 URL 입력 (예: https://example.com)',
  'Analyze Website': '웹사이트 분석',
  'Scraping website content...': '웹사이트 콘텐츠 수집 중...',
  'Analyzing content with AI...': 'AI로 콘텐츠 분석 중...',
  'Analysis Results': '분석 결과',
  'Analyze Another Website': '다른 웹사이트 분석',
  'Title': '제목',
  'Description': '설명',
  'Introduction': '소개',
  'Features': '기능',
  'Pricing': '가격',
  'Use Cases': '사용 사례',
  'Website Screenshot': '웹사이트 스크린샷',
  'Please enter a valid URL starting with http:// or https://': 'http:// 또는 https://로 시작하는 유효한 URL을 입력하세요',
  'Failed to analyze website. Please try again.': '웹사이트 분석에 실패했습니다. 다시 시도해주세요',
  'Network error. Please check your connection and try again.': '네트워크 오류입니다. 연결을 확인하고 다시 시도해주세요',
  'Insufficient credits. Please purchase more credits to continue.': '크레딧이 부족합니다. 계속하려면 크레딧을 더 구매하세요',
  'Smart Web Scraping': '스마트 웹 스크래핑',
  'Advanced web scraping technology extracts clean, structured content from any website': '고급 웹 스크래핑 기술로 모든 웹사이트에서 깨끗하고 구조화된 콘텐츠를 추출합니다',
  'AI-Powered Analysis': 'AI 기반 분석',
  'Intelligent AI analysis extracts key insights, features, and structured information': '지능형 AI 분석으로 주요 인사이트, 기능 및 구조화된 정보를 추출합니다',
  'Structured Results': '구조화된 결과',
  'Get organized, easy-to-read results with clear sections and actionable insights': '명확한 섹션과 실행 가능한 인사이트가 포함된 체계적이고 읽기 쉬운 결과를 얻으세요',
  
  'About': '정보',
  'This is MkSaaS, an AI SaaS template built with modern technologies, helping you build your SaaS faster and better.': 'MkSaaS는 최신 기술로 구축된 AI SaaS 템플릿으로, SaaS를 더 빠르고 더 잘 구축하는 데 도움을 줍니다',
  'AI SaaS Boilerplate': 'AI SaaS 보일러플레이트',
  '👋 Hi there! This is MkSaaS, an AI SaaS template built with modern technologies, helping you build your SaaS faster and better. If you have any questions, welcome to contact me.': '👋 안녕하세요! MkSaaS는 최신 기술로 구축된 AI SaaS 템플릿으로, SaaS를 더 빠르고 더 잘 구축하는 데 도움을 줍니다. 질문이 있으시면 언제든지 연락주세요',
  'Talk with me': '문의하기',
  'Follow me on X': 'X에서 팔로우',
  
  'Login': '로그인',
  'Welcome back': '다시 오신 것을 환영합니다',
  'Email': '이메일',
  'Password': '비밀번호',
  'Sign In': '로그인',
  "Don't have an account? Sign up": '계정이 없으신가요? 가입하기',
  'Forgot Password?': '비밀번호를 잊으셨나요?',
  'Sign In with Google': 'Google로 로그인',
  'Sign In with GitHub': 'GitHub로 로그인',
  'Show password': '비밀번호 표시',
  'Hide password': '비밀번호 숨기기',
  'Or continue with': '또는 계속하기',
  
  'male': '남성',
  'female': '여성',
  'TODO: translate Bazi.male': '남성',
  'TODO: translate Bazi.female': '여성',
  
  'Precise Algorithm': '정밀한 알고리즘',
  'Privacy Protected': '개인정보 보호',
  'Instant Analysis': '즉시 분석',
  'Trusted by 10,000+ users': '10,000명 이상의 사용자가 신뢰합니다',
  'Calibrating...': '보정 중...',
  'TODO: translate Compass.measuring': '측정 중',
  'TODO: translate Compass.calibrate_device': '장치 보정',
  'TODO: translate Compass.direction': '방향',
  'TODO: translate Compass.degree': '각도',
  'Dark': '다크',
  'Light': '라이트',
  'System': '시스템',
  'Get Started': '시작하기',
  'MkSaaS': 'MkSaaS',
  'Bazi': '팔자',
};

// 马来语翻译映射
const msMyTranslations: { [key: string]: string } = {
  'AI Audio': 'AI Audio',
  'AI Chat': 'AI Chat',
  'AI Image': 'AI Imej',
  'AI Video': 'AI Video',
  'AI Text Demo': 'Demo Teks AI',
  'MkSaaS lets you make AI SaaS in days, simply and effortlessly': 'MkSaaS membolehkan anda membuat AI SaaS dalam beberapa hari, dengan mudah dan tanpa usaha',
  'Analyze web content with AI to extract key information, features, and insights': 'Analisis kandungan web dengan AI untuk mengekstrak maklumat utama, ciri dan pandangan',
  'Web Content Analyzer': 'Penganalisis Kandungan Web',
  'Enter a website URL to get AI-powered analysis of its content': 'Masukkan URL laman web untuk mendapatkan analisis kandungan berkuasa AI',
  'Analyze any website content using AI to extract structured information': 'Analisis sebarang kandungan laman web menggunakan AI untuk mengekstrak maklumat berstruktur',
  'Enter website URL (e.g., https://example.com)': 'Masukkan URL laman web (cth., https://example.com)',
  'Analyze Website': 'Analisis Laman Web',
  'Scraping website content...': 'Mengikis kandungan laman web...',
  'Analyzing content with AI...': 'Menganalisis kandungan dengan AI...',
  'Analysis Results': 'Keputusan Analisis',
  'Analyze Another Website': 'Analisis Laman Web Lain',
  'Title': 'Tajuk',
  'Description': 'Penerangan',
  'Introduction': 'Pengenalan',
  'Features': 'Ciri-ciri',
  'Pricing': 'Harga',
  'Use Cases': 'Kes Penggunaan',
  'Website Screenshot': 'Tangkapan Skrin Laman Web',
  'Please enter a valid URL starting with http:// or https://': 'Sila masukkan URL yang sah bermula dengan http:// atau https://',
  'Failed to analyze website. Please try again.': 'Gagal menganalisis laman web. Sila cuba lagi',
  'Network error. Please check your connection and try again.': 'Ralat rangkaian. Sila periksa sambungan anda dan cuba lagi',
  'Insufficient credits. Please purchase more credits to continue.': 'Kredit tidak mencukupi. Sila beli lebih banyak kredit untuk meneruskan',
  'Smart Web Scraping': 'Pengikisan Web Pintar',
  'Advanced web scraping technology extracts clean, structured content from any website': 'Teknologi pengikisan web termaju mengekstrak kandungan bersih dan berstruktur dari mana-mana laman web',
  'AI-Powered Analysis': 'Analisis Berkuasa AI',
  'Intelligent AI analysis extracts key insights, features, and structured information': 'Analisis AI pintar mengekstrak pandangan utama, ciri dan maklumat berstruktur',
  'Structured Results': 'Keputusan Berstruktur',
  'Get organized, easy-to-read results with clear sections and actionable insights': 'Dapatkan keputusan yang teratur dan mudah dibaca dengan bahagian yang jelas dan pandangan yang boleh dilaksanakan',
  
  'About': 'Tentang',
  'This is MkSaaS, an AI SaaS template built with modern technologies, helping you build your SaaS faster and better.': 'Ini adalah MkSaaS, templat AI SaaS yang dibina dengan teknologi moden, membantu anda membina SaaS anda dengan lebih cepat dan lebih baik',
  'AI SaaS Boilerplate': 'Templat Asas AI SaaS',
  '👋 Hi there! This is MkSaaS, an AI SaaS template built with modern technologies, helping you build your SaaS faster and better. If you have any questions, welcome to contact me.': '👋 Hi! Ini adalah MkSaaS, templat AI SaaS yang dibina dengan teknologi moden, membantu anda membina SaaS anda dengan lebih cepat dan lebih baik. Jika anda mempunyai sebarang soalan, sila hubungi saya',
  'Talk with me': 'Bercakap dengan saya',
  'Follow me on X': 'Ikuti saya di X',
  
  'Login': 'Log Masuk',
  'Welcome back': 'Selamat kembali',
  'Email': 'E-mel',
  'Password': 'Kata Laluan',
  'Sign In': 'Log Masuk',
  "Don't have an account? Sign up": 'Tidak mempunyai akaun? Daftar',
  'Forgot Password?': 'Lupa Kata Laluan?',
  'Sign In with Google': 'Log Masuk dengan Google',
  'Sign In with GitHub': 'Log Masuk dengan GitHub',
  'Show password': 'Tunjukkan kata laluan',
  'Hide password': 'Sembunyikan kata laluan',
  'Or continue with': 'Atau teruskan dengan',
  
  'male': 'lelaki',
  'female': 'perempuan',
  'TODO: translate Bazi.male': 'lelaki',
  'TODO: translate Bazi.female': 'perempuan',
  
  'Precise Algorithm': 'Algoritma Tepat',
  'Privacy Protected': 'Privasi Dilindungi',
  'Instant Analysis': 'Analisis Segera',
  'Trusted by 10,000+ users': 'Dipercayai oleh 10,000+ pengguna',
  'Calibrating...': 'Menentukur...',
  'TODO: translate Compass.measuring': 'Mengukur',
  'TODO: translate Compass.calibrate_device': 'Tentukur Peranti',
  'TODO: translate Compass.direction': 'Arah',
  'TODO: translate Compass.degree': 'Darjah',
  'Dark': 'Gelap',
  'Light': 'Terang',
  'System': 'Sistem',
  'Get Started': 'Mulakan',
  'MkSaaS': 'MkSaaS',
  'Bazi': 'Bazi',
};

/**
 * 递归翻译对象
 */
function translateObject(obj: TranslationObject, translations: { [key: string]: string }): TranslationObject {
  const result: TranslationObject = {};
  
  for (const key in obj) {
    const value = obj[key];
    
    if (Array.isArray(value)) {
      result[key] = value.map(item => {
        if (typeof item === 'string' && translations[item]) {
          return translations[item];
        }
        return item;
      });
    } else if (typeof value === 'object' && value !== null) {
      result[key] = translateObject(value as TranslationObject, translations);
    } else if (typeof value === 'string' && translations[value]) {
      result[key] = translations[value];
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * 应用翻译到指定语言文件
 */
function applyTranslations(locale: string, translations: { [key: string]: string }, localeName: string) {
  console.log(`\n📝 处理 ${localeName} (${locale})...`);
  console.log('─────────────────────────────────');
  
  const filename = `${locale}.json`;
  const filePath = path.join(MESSAGES_DIR, filename);
  
  try {
    // 读取文件
    const content = fs.readFileSync(filePath, 'utf-8');
    const cleanContent = content.replace(/^\uFEFF/, '');
    const data: TranslationObject = JSON.parse(cleanContent);
    
    // 应用翻译
    const translated = translateObject(data, translations);
    
    // 写入文件
    fs.writeFileSync(
      filePath,
      JSON.stringify(translated, null, 2),
      'utf-8'
    );
    
    console.log(`✅ 已完成，应用了 ${Object.keys(translations).length} 条翻译规则`);
  } catch (error) {
    console.error(`❌ 处理失败:`, error);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始批量翻译所有语言...\n');
  
  // 应用所有翻译
  applyTranslations('zh-TW', zhTWTranslations, '繁体中文');
  applyTranslations('ja', jaTranslations, '日语');
  applyTranslations('ko', koTranslations, '韩语');
  applyTranslations('ms-MY', msMyTranslations, '马来语');
  
  console.log('\n✅ 所有翻译已完成！');
  console.log('\n💡 下一步:');
  console.log('   运行 npm run validate:i18n 检查翻译完整性');
}

main().catch(console.error);
