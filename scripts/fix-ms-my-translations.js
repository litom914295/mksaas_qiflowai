/**
 * 马来语翻译修复脚本
 * 由 AI-WORKFLOW v5.0 自动生成
 *
 * 功能：
 * - 将 ms-MY 的占位符翻译替换为正确的马来语翻译
 * - 基于英文翻译进行翻译
 */

const fs = require('fs');
const path = require('path');

// 简单的中英马对照词典（关键术语）
const translationMap = {
  // 常用词汇
  Monthly: 'Bulanan',
  Yearly: 'Tahunan',
  'Most Popular': 'Paling Popular',
  'Current Plan': 'Pelan Semasa',
  'Upgrade to': 'Naik Taraf ke',
  Free: 'Percuma',
  Pro: 'Pro',
  Premium: 'Premium',
  Basic: 'Asas',
  Standard: 'Standard',
  Enterprise: 'Perusahaan',

  // 功能相关
  Features: 'Ciri-ciri',
  Credits: 'Kredit',
  'Get Started': 'Mulakan',
  Subscribe: 'Langgan',
  'Sign Up': 'Daftar',
  'Sign In': 'Log Masuk',
  Login: 'Log Masuk',
  Logout: 'Log Keluar',
  Register: 'Daftar',
  Dashboard: 'Papan Pemuka',
  Settings: 'Tetapan',
  Profile: 'Profil',
  Account: 'Akaun',
  Billing: 'Bil',
  Payment: 'Pembayaran',
  Price: 'Harga',
  Pricing: 'Harga',

  // 八字风水相关
  BaZi: 'BaZi',
  'Eight Characters': 'Lapan Aksara',
  'Feng Shui': 'Feng Shui',
  Analysis: 'Analisis',
  Fortune: 'Nasib',
  Destiny: 'Takdir',
  Reading: 'Bacaan',
  Chart: 'Carta',
  Element: 'Unsur',
  Metal: 'Logam',
  Wood: 'Kayu',
  Water: 'Air',
  Fire: 'Api',
  Earth: 'Tanah',

  // 动作词
  'Learn More': 'Ketahui Lebih Lanjut',
  'Read More': 'Baca Lagi',
  View: 'Lihat',
  Edit: 'Sunting',
  Delete: 'Padam',
  Save: 'Simpan',
  Cancel: 'Batal',
  Confirm: 'Sahkan',
  Submit: 'Hantar',
  Send: 'Hantar',
  Close: 'Tutup',
  Open: 'Buka',
  Export: 'Eksport',
  Import: 'Import',
  Download: 'Muat Turun',
  Upload: 'Muat Naik',

  // 状态词
  Success: 'Berjaya',
  Error: 'Ralat',
  Warning: 'Amaran',
  Info: 'Maklumat',
  Loading: 'Memuatkan',
  Failed: 'Gagal',
  Pending: 'Menunggu',
  Completed: 'Selesai',
  Active: 'Aktif',
  Inactive: 'Tidak Aktif',

  // 数字和时间
  'per month': 'sebulan',
  'per year': 'setahun',
  month: 'bulan',
  year: 'tahun',
  day: 'hari',
  week: 'minggu',
  hour: 'jam',
  minute: 'minit',

  // 常见短语
  Welcome: 'Selamat Datang',
  Hello: 'Helo',
  'Thank you': 'Terima Kasih',
  Please: 'Sila',
  Yes: 'Ya',
  No: 'Tidak',
  OK: 'OK',
  Back: 'Kembali',
  Next: 'Seterusnya',
  Previous: 'Sebelumnya',
  Home: 'Laman Utama',
  Contact: 'Hubungi',
  About: 'Tentang',
  Help: 'Bantuan',
  FAQ: 'Soalan Lazim',
  Privacy: 'Privasi',
  Terms: 'Terma',
  Cookie: 'Kuki',
};

// 读取文件
const msMyPath = path.join(__dirname, '../src/locales/ms-MY/common.json');
const enPath = path.join(__dirname, '../src/locales/en/common.json');

console.log('🔧 马来语翻译修复工具\n');

try {
  // 读取文件
  const msMyContent = fs.readFileSync(msMyPath, 'utf-8');
  const enContent = fs.readFileSync(enPath, 'utf-8');

  const msMyData = JSON.parse(msMyContent);
  const enData = JSON.parse(enContent);

  // 统计信息
  let fixed = 0;
  let total = 0;

  // 递归处理对象
  function processObject(msObj, enObj, path = '') {
    for (const key in msObj) {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof msObj[key] === 'object' && msObj[key] !== null) {
        // 递归处理对象
        if (enObj && typeof enObj[key] === 'object') {
          processObject(msObj[key], enObj[key], currentPath);
        }
      } else if (typeof msObj[key] === 'string') {
        total++;

        // 检查是否是占位符
        if (msObj[key].startsWith('[ms-MY]')) {
          const originalText = msObj[key].replace('[ms-MY] ', '').trim();
          const enText = enObj?.[key] ? enObj[key] : originalText;

          // 尝试从词典中查找翻译
          let translated = translationMap[enText] || null;

          // 如果没有找到精确匹配，尝试部分匹配
          if (!translated) {
            for (const [en, ms] of Object.entries(translationMap)) {
              if (enText.includes(en)) {
                translated = enText.replace(en, ms);
                break;
              }
            }
          }

          // 如果还是没有翻译，保留英文或中文原文
          if (translated) {
            msObj[key] = translated;
            fixed++;
            console.log(
              `✓ ${currentPath}: "${originalText}" → "${translated}"`
            );
          } else {
            // 使用英文版本（如果有）
            if (enText !== originalText) {
              msObj[key] = enText;
              fixed++;
              console.log(`→ ${currentPath}: 使用英文 "${enText}"`);
            }
          }
        }
      }
    }
  }

  // 开始处理
  processObject(msMyData, enData);

  // 保存修复后的文件
  const updatedContent = JSON.stringify(msMyData, null, 2);
  fs.writeFileSync(msMyPath, updatedContent, 'utf-8');

  console.log('\n✅ 完成！');
  console.log(`📊 总计: ${total} 个翻译项`);
  console.log(`🔧 修复: ${fixed} 个占位符`);
  console.log(`📝 文件已更新: ${msMyPath}`);
} catch (error) {
  console.error('❌ 错误:', error.message);
  process.exit(1);
}
